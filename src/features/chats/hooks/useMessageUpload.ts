"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { imageTypes, videoTypes } from "@/lib/FileTypes";
import { GetUploadUrl } from "@/utils/GetMediaUploadUrl";
import UploadWithTus from "@/utils/TusUploader";
import GenerateVideoPoster from "@/utils/GenerateVideoPoster";

export interface MessageMediaFile {
  id: string;
  media_id: string;
  media_type: "image" | "video";
  media_state: "pending" | "uploading" | "processing" | "completed" | "failed";
  media_url: string;
  uploadProgress?: number;
  file?: File;
  posterUrl?: string;
}

export const useMessageUpload = () => {
  const [messageMediaFiles, setMessageMediaFiles] = useState<
    MessageMediaFile[]
  >([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Calculate upload progress
  const uploadProgress = useCallback(() => {
    if (messageMediaFiles.length === 0)
      return { completed: 0, total: 0, percentage: 0 };

    const completed = messageMediaFiles.filter(
      (f) => f.media_state === "completed"
    ).length;
    const total = messageMediaFiles.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }, [messageMediaFiles]);

  const areUploadsComplete = messageMediaFiles.every(
    (f) => f.media_state === "completed"
  );
  const hasUploadErrors = messageMediaFiles.some(
    (f) => f.media_state === "failed"
  );

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: MessageMediaFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      const isImage = imageTypes.includes(file.type);
      const isVideo = videoTypes.includes(file.type);

      if (!isImage && !isVideo) {
        toast.error(`Unsupported file type: ${file.type}`);
        continue;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}. Maximum size is 10MB.`);
        continue;
      }

      const mediaFile: MessageMediaFile = {
        id: `temp-${Date.now()}-${i}`,
        media_id: "",
        media_type: isImage ? "image" : "video",
        media_state: "pending",
        media_url: "",
        file,
        posterUrl: isVideo ? URL.createObjectURL(file) : undefined,
      };

      newFiles.push(mediaFile);
    }

    if (newFiles.length > 0) {
      setMessageMediaFiles((prev) => [...prev, ...newFiles]);
      // Auto-upload files
      uploadFiles(newFiles);
    }
  }, []);

  // Upload files to server
  const uploadFiles = useCallback(async (files: MessageMediaFile[]) => {
    setIsUploadingMedia(true);

    for (const mediaFile of files) {
      if (!mediaFile.file) continue;

      try {
        // Update state to uploading
        setMessageMediaFiles((prev) =>
          prev.map((f) =>
            f.id === mediaFile.id
              ? { ...f, media_state: "uploading", uploadProgress: 0 }
              : f
          )
        );

        // Get upload URL
        const uploadUrl = await GetUploadUrl(mediaFile.file.type);

        // Upload file
        const uploadResult = await UploadWithTus(
          mediaFile.file,
          uploadUrl,
          (progress) => {
            setMessageMediaFiles((prev) =>
              prev.map((f) =>
                f.id === mediaFile.id ? { ...f, uploadProgress: progress } : f
              )
            );
          }
        );

        if (uploadResult.success && uploadResult.url) {
          let posterUrl = "";

          // Generate poster for videos
          if (mediaFile.media_type === "video") {
            try {
              posterUrl = await GenerateVideoPoster(mediaFile.file);
            } catch (error) {
              console.warn("Failed to generate video poster:", error);
            }
          }

          // Update state to completed
          setMessageMediaFiles((prev) =>
            prev.map((f) =>
              f.id === mediaFile.id
                ? {
                    ...f,
                    media_state: "completed",
                    media_url: uploadResult.url!,
                    media_id: uploadResult.media_id || "",
                    posterUrl: posterUrl || f.posterUrl,
                    uploadProgress: 100,
                  }
                : f
            )
          );
        } else {
          throw new Error(uploadResult.error || "Upload failed");
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${mediaFile.file.name}`);

        // Update state to failed
        setMessageMediaFiles((prev) =>
          prev.map((f) =>
            f.id === mediaFile.id ? { ...f, media_state: "failed" } : f
          )
        );
      }
    }

    setIsUploadingMedia(false);
  }, []);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setMessageMediaFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (
        fileToRemove?.posterUrl &&
        fileToRemove.posterUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(fileToRemove.posterUrl);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    messageMediaFiles.forEach((file) => {
      if (file.posterUrl && file.posterUrl.startsWith("blob:")) {
        URL.revokeObjectURL(file.posterUrl);
      }
    });
    setMessageMediaFiles([]);
  }, [messageMediaFiles]);

  // Get completed attachments for sending
  const getCompletedAttachments = useCallback(() => {
    return messageMediaFiles
      .filter((f) => f.media_state === "completed")
      .map((f) => ({
        url: f.media_url,
        type: f.media_type,
        id: f.media_id,
        name: f.media_id,
        poster: f.posterUrl || "",
        extension: f.file?.name.split(".").pop() || "",
        size: f.file?.size || 0,
      }));
  }, [messageMediaFiles]);

  return {
    messageMediaFiles,
    isUploadingMedia,
    uploadProgress: uploadProgress(),
    areUploadsComplete,
    hasUploadErrors,
    handleFileSelect,
    removeFile,
    clearFiles,
    getCompletedAttachments,
  };
};
