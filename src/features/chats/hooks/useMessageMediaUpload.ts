import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/UserUseContext";
import axios from "axios";
import axiosServer from "@/utils/Axios";
import toast from "react-hot-toast";

export interface MessageMediaFile {
  id: number;
  index: number;
  media_id: string;
  media_type: "image" | "video";
  media_state: "pending" | "uploading" | "processing" | "completed" | "failed";
  media_url: string;
  uploadProgress?: number;
  file?: File;
}

interface PresignedUrlResponse {
  media_id: string;
  presignedUrl: string;
  key: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isVideo: boolean;
}

interface UseMessageMediaUploadProps {
  mediaFiles: MessageMediaFile[];
  updateMediaState: (
    media_id: string,
    state: MessageMediaFile["media_state"]
  ) => void;
  updateUploadProgress: (media_id: string, progress: number) => void;
  updateMediaFile: (
    media_id: string,
    updates: Partial<MessageMediaFile>
  ) => void;
  endpoint: "conversations" | "groups";
}

export const useMessageMediaUpload = ({
  mediaFiles,
  updateMediaState,
  updateUploadProgress,
  updateMediaFile,
  endpoint,
}: UseMessageMediaUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuthContext();
  const toastId = "message-media-upload-toast";

  // Get presigned URLs from server
  const getPresignedUrls = async (
    files: File[],
    mediaIds: string[]
  ): Promise<PresignedUrlResponse[]> => {
    const fileData = files.map((file, index) => ({
      name: file.name,
      type: file.type,
      size: file.size,
      media_id: mediaIds[index],
    }));

    const response = await axiosServer.post(`/${endpoint}/presigned-urls`, {
      files: fileData,
    });

    return response.data.data;
  };

  // Upload file to S3
  const uploadToS3 = async (
    file: File,
    presignedUrl: string,
    media_id: string
  ): Promise<void> => {
    await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          updateUploadProgress(media_id, Math.round(progress));
        }
      },
    });
  };

  // Complete upload by saving to database
  const completeUpload = async (
    uploadedFiles: Array<{
      media_id: string;
      key: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      isVideo: boolean;
    }>
  ) => {
    const response = await axiosServer.post(`/${endpoint}/complete-upload`, {
      uploadedFiles,
    });

    return response.data.data;
  };

  // Upload pending files
  const uploadPendingFiles = async () => {
    const pendingFiles = mediaFiles.filter(
      (item) => item.media_state === "pending" && item.file
    );

    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Step 1: Get presigned URLs
      const files = pendingFiles.map((item) => item.file!);
      const mediaIds = pendingFiles.map((item) => item.media_id);
      const presignedData = await getPresignedUrls(files, mediaIds);

      // Step 2: Mark files as uploading
      pendingFiles.forEach((item) => {
        updateMediaState(item.media_id, "uploading");
      });

      // Step 3: Upload files to S3
      const uploadPromises = presignedData.map((data, index) =>
        uploadToS3(files[index], data.presignedUrl, data.media_id)
      );

      await Promise.all(uploadPromises);

      // Step 4: Complete upload and save to database
      toast.loading("Processing upload...", { id: toastId });

      const uploadedFiles = presignedData.map((data) => ({
        media_id: data.media_id,
        key: data.key,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        isVideo: data.isVideo,
      }));

      const completedFiles = await completeUpload(uploadedFiles);

      // Step 5: Update media files with final URLs and states
      completedFiles.forEach((item: any) => {
        const mediaItem = mediaFiles.find((m) => m.media_id === item.media_id);
        if (mediaItem) {
          // Clean up blob URL
          if (mediaItem.media_url.startsWith("blob:")) {
            URL.revokeObjectURL(mediaItem.media_url);
          }

          // For images, mark as completed immediately. For videos, set to processing
          const finalState = item.mimetype.startsWith("video/")
            ? "processing"
            : "completed";

          updateMediaFile(mediaItem.media_id, {
            media_url: item.url,
            media_state: finalState,
            file: undefined,
            uploadProgress: undefined,
          });
        }
      });

      toast.success("Upload completed!", { id: toastId });
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed. Please try again.", { id: toastId });

      // Mark failed uploads
      pendingFiles.forEach((item) => {
        updateMediaState(item.media_id, "failed");
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Start upload when pending files are added
  useEffect(() => {
    const pendingFiles = mediaFiles.filter(
      (item) => item.media_state === "pending"
    );
    if (pendingFiles.length > 0 && !isUploading) {
      uploadPendingFiles();
    }
  }, [mediaFiles.length]);

  // Set up SSE connection for video processing status
  useEffect(() => {
    if (!user?.id) return;

    const evtSource = new EventSource(
      process.env.NEXT_PUBLIC_TS_EXPRESS_URL +
        `/events/message-media-state?userId=${user?.id}`
    );

    evtSource.addEventListener(
      "message-processing-complete",
      (event: MessageEvent) => {
        console.log("SSE message received:", event.data);
        if (event.data) {
          const data = JSON.parse(event.data);
          updateMediaState(data.mediaId, "completed");
        }
      }
    );

    evtSource.onerror = (err) => {
      console.error("SSE error:", err);
    };

    return () => evtSource.close();
  }, [user?.id, updateMediaState]);

  return {
    isUploading,
    uploadPendingFiles,
  };
};
