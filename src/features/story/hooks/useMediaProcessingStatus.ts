import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import axiosServer from "@/utils/Axios";
import { useStoryStore } from "@/contexts/StoryContext";

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

interface UseMediaProcessingStatusOptions {
    enabled?: boolean;
    pollingInterval?: number;
    onComplete?: (mediaId: string, url: string) => void;
    onFailed?: (mediaId: string) => void;
}

/**
 * Hook to poll media processing status as a fallback to SSE
 * Automatically polls when there are processing media and stops when all are completed/failed
 */
export const useMediaProcessingStatus = (
    options: UseMediaProcessingStatusOptions = {},
) => {
    const {
        enabled = true,
        pollingInterval = 5000, // Poll every 5 seconds
        onComplete,
        onFailed,
    } = options;

    const {
        story: media,
        updateStoryState,
        updateStorySlide,
    } = useStoryStore();

    // Get media IDs that are in processing state
    const processingMediaIds = useMemo(() => {
        return media
            .filter((item) => item.media_state === "processing")
            .map((item) => item.media_id);
    }, [media]);

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

            const response = await axiosServer.get("/stories/media-status", {
                params: {
                    media_ids: processingMediaIds.join(","),
                },
            });

            return response.data;
        }, [processingMediaIds]);

    const { data, isError, error, refetch } = useQuery<MediaStatusResponse>({
        queryKey: ["media-processing-status", processingMediaIds],
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
            const currentMedia = media.find((m) => m.media_id === mediaId);

            if (!currentMedia) return;

            // Only update if state has changed
            if (currentMedia.media_state !== status.media_state) {
                if (status.media_state === "completed") {
                    // Update state and URL for completed media
                    updateStorySlide(mediaId, {
                        media_state: "completed",
                        media_url: status.url,
                    });

                    // Call onComplete callback if provided
                    onComplete?.(mediaId, status.url);

                    console.log(
                        `Media ${mediaId} processing completed via polling fallback`,
                    );
                } else if (status.media_state === "failed") {
                    // Update state for failed media
                    updateStoryState(mediaId, "failed");

                    // Call onFailed callback if provided
                    onFailed?.(mediaId);

                    console.log(
                        `Media ${mediaId} processing failed via polling fallback`,
                    );
                } else if (status.media_state === "processing") {
                    // Still processing, keep the state
                    updateStoryState(mediaId, "processing");
                }
            }
        });
    }, [data, media, updateStoryState, updateStorySlide, onComplete, onFailed]);

    return {
        isPolling: shouldPoll,
        processingCount: processingMediaIds.length,
        isError,
        error,
        refetch,
        data,
    };
};

export default useMediaProcessingStatus;
