import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import axiosServer from "@/utils/Axios";
import { useChatStore } from "@/contexts/ChatContext";

interface MediaStatus {
    media_id: string;
    media_state: "processing" | "completed" | "failed";
    url: string;
    type: string;
    created_at: string;
    updated_at: string;
}

interface MediaStatusResponse {
    error: boolean;
    message: string;
    data: Record<string, MediaStatus>;
}

interface UseMessageMediaProcessingStatusOptions {
    enabled?: boolean;
    pollingInterval?: number;
    onComplete?: (mediaId: string, url: string) => void;
    onFailed?: (mediaId: string) => void;
}

/**
 * Hook to poll message media processing status as a fallback to SSE
 * Automatically polls when there are processing media and stops when all are completed/failed
 */
export const useMessageMediaProcessingStatus = (
    options: UseMessageMediaProcessingStatusOptions = {},
) => {
    const {
        enabled = true,
        pollingInterval = 5000, // Poll every 5 seconds
        onComplete,
        onFailed,
    } = options;

    const { mediaFiles, updateMediaFileStatus } = useChatStore();

    // Get media IDs that are in processing state
    const processingMediaIds = useMemo(() => {
        return mediaFiles
            .filter((item) => item.uploadStatus === "processing")
            .map((item) => item.id);
    }, [mediaFiles]);

    // Only enable polling if there are processing media
    const shouldPoll = enabled && processingMediaIds.length > 0;

    // Fetch media status from backend
    const fetchMediaStatus =
        useCallback(async (): Promise<MediaStatusResponse> => {
            if (processingMediaIds.length === 0) {
                return {
                    error: false,
                    message: "No media to check",
                    data: {},
                };
            }

            const response = await axiosServer.post(
                "/conversations/media-status",
                {
                    media_ids: processingMediaIds,
                },
            );

            return response.data;
        }, [processingMediaIds]);

    const { data, isError, error, refetch } = useQuery<MediaStatusResponse>({
        queryKey: ["message-media-processing-status", processingMediaIds],
        queryFn: fetchMediaStatus,
        enabled: shouldPoll,
        refetchInterval: shouldPoll ? pollingInterval : false,
        refetchIntervalInBackground: true,
        refetchOnWindowFocus: true,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Update media states when data changes
    useEffect(() => {
        if (!data || data.error || !data.data) return;

        const statusMap = data.data;

        // Update each media item's state
        Object.entries(statusMap).forEach(([mediaId, status]) => {
            const currentMedia = mediaFiles.find((m) => m.id === mediaId);

            if (!currentMedia) return;

            // Map backend media_state to frontend uploadStatus
            let uploadStatus: "idle" | "uploading" | "completed" | "error" =
                "idle";
            if (status.media_state === "completed") {
                uploadStatus = "completed";
            } else if (status.media_state === "failed") {
                uploadStatus = "error";
            } else if (status.media_state === "processing") {
                // Keep as processing in the UI
                return; // Don't update if still processing
            }

            // Only update if state has changed
            if (currentMedia.uploadStatus !== uploadStatus) {
                if (status.media_state === "completed") {
                    // Update state and URL for completed media
                    updateMediaFileStatus(currentMedia.id, "completed", 100, {
                        id: mediaId,
                        url: status.url,
                        name: currentMedia.file.name,
                        size: currentMedia.file.size,
                        type: currentMedia.type,
                        extension:
                            currentMedia.file.name.split(".").pop() || "",
                    });

                    // Call onComplete callback if provided
                    onComplete?.(mediaId, status.url);

                    console.log(
                        `Message media ${mediaId} processing completed via polling fallback`,
                    );
                } else if (status.media_state === "failed") {
                    // Update state for failed media
                    updateMediaFileStatus(currentMedia.id, "error");

                    // Call onFailed callback if provided
                    onFailed?.(mediaId);

                    console.log(
                        `Message media ${mediaId} processing failed via polling fallback`,
                    );
                }
            }
        });
    }, [data, mediaFiles, updateMediaFileStatus, onComplete, onFailed]);

    return {
        isPolling: shouldPoll,
        processingCount: processingMediaIds.length,
        isError,
        error,
        refetch,
        data,
    };
};

export default useMessageMediaProcessingStatus;
