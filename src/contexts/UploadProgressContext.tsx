"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { v4 as uuid } from "uuid";
import { UploadedImageProp, UploadResponseResponse } from "@/types/Components";
import { getMaxDurationBase64 } from "@/utils/GetVideoMaxDuration";
import UploadImageToCloudflare from "@/utils/CloudflareImageUploader";
import UploadWithTus from "@/utils/TusUploader";
import axiosInstance from "@/utils/Axios";
import toast from "react-hot-toast";

// Types
interface MediaItem {
  file: File;
  id: string;
}

interface UploadProgressState {
  // Media items
  media: MediaItem[];

  // Progress tracking
  progress: { [key: string]: number };

  // Upload errors
  uploadError: { [key: string]: boolean };

  // Upload completion state
  isUploadComplete: boolean;
  isAnyUploading: boolean;

  // Actions
  addMediaFiles: (
    files: File[],
    user: any,
    submitPost: (image: UploadedImageProp) => void
  ) => Promise<void>;
  removeMediaItem: (
    id: string,
    removeThisMedia: (id: string, type: string) => void
  ) => void;
  resetAll: () => void;
}

// Context
const UploadProgressContext = createContext<UploadProgressState | undefined>(
  undefined
);

// Provider Component
interface UploadProgressProviderProps {
  children: ReactNode;
}

export const UploadProgressProvider: React.FC<UploadProgressProviderProps> = ({
  children,
}) => {
  // State
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [uploadError, setUploadError] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Update individual progress
  const updateProgress = useCallback((id: string, value: number) => {
    setProgress((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  // Update individual upload error
  const updateUploadError = useCallback((id: string, hasError: boolean) => {
    setUploadError((prev) => ({
      ...prev,
      [id]: hasError,
    }));
  }, []);

  // TUS uploader
  const tusUploader = useCallback(
    (file: File, uploadUrl: string, id: string) => {
      return UploadWithTus({
        file,
        uploadUrl,
        id,
        setProgress: setProgress, // Pass the state setter directly
        setUploadError: setUploadError, // Pass the state setter directly
      });
    },
    []
  );

  // Image uploader
  const imageUploader = useCallback(
    (file: File, uploadUrl: string, id: string) => {
      return UploadImageToCloudflare({
        file,
        setProgress: setProgress, // Pass the state setter directly
        setUploadError: setUploadError, // Pass the state setter directly
        id,
        uploadUrl,
      });
    },
    []
  );

  // Add media files and handle uploads
  const addMediaFiles = useCallback(
    async (
      files: File[],
      user: any,
      submitPost: (image: UploadedImageProp) => void
    ) => {
      if (!files?.length) return;

      console.log("Starting upload process for files:", files.length);
      const newMediaItems = files.map((file) => ({ file, id: uuid() }));
      setMedia((prev) => [...prev, ...newMediaItems]);

      try {
        for (const mediaItem of newMediaItems) {
          console.log(
            "Processing media item:",
            mediaItem.file.name,
            mediaItem.file.type
          );
          const isVideo = mediaItem.file.type.startsWith("video/");
          const maxVideoDuration = isVideo
            ? getMaxDurationBase64(mediaItem.file)
            : null;
          const payload: any = {
            type: isVideo ? "video" : "image",
            fileName: btoa(`paymefans-${user?.username}-${Date.now()}`),
            fileSize: mediaItem.file.size,
            fileType: btoa(mediaItem.file.type),
            explicitImageType: mediaItem.file.type,
            shouldUseSignedUrls: true,
          };
          if (isVideo) payload.maxDuration = maxVideoDuration;

          console.log("Requesting signed URL for:", payload.type);
          const { data } = await axiosInstance.post<UploadResponseResponse>(
            `/post/media/signed-url`,
            payload
          );
          if (!data || data.error) {
            throw new Error(
              data?.message || "Failed to get upload URL from server"
            );
          }
          const { uploadUrl, type, id } = data;
          if (!id || !uploadUrl) throw new Error("Failed to get upload URL");

          console.log("Got signed URL, starting upload for type:", type);
          if (type === "video") {
            const uploadVideo = await tusUploader(
              mediaItem.file,
              uploadUrl,
              mediaItem.id
            );
            console.log("Video upload completed:", uploadVideo);
            submitPost({
              blur: ``,
              public: `${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN}${uploadVideo}/manifest/video.m3u8`,
              id: uploadVideo,
              type: "video",
              fileId: mediaItem.id,
            });
          } else if (type === "image") {
            const uploadImage = await imageUploader(
              mediaItem.file,
              uploadUrl,
              mediaItem.id
            );
            console.log("Image upload completed:", uploadImage);
            const variants = uploadImage.result.variants ?? [];
            const publicVariant =
              variants.find((v: string) => v?.includes("/public")) ??
              variants[0] ??
              "";
            const blurVariant =
              variants.find((v: string) => v?.includes("/blur")) ??
              variants[0] ??
              "";
            submitPost({
              blur: blurVariant,
              public: publicVariant,
              id: uploadImage.result.id,
              type: "image",
              fileId: mediaItem.id,
            });
          }
        }
      } catch (error: any) {
        console.error("Upload error:", error);
        toast.error("Some uploads failed.");
      }
    },
    [tusUploader, imageUploader]
  );

  // Remove media item
  const removeMediaItem = useCallback(
    (id: string, removeThisMedia: (id: string, type: string) => void) => {
      setMedia((prev) => prev.filter((item) => item.id !== id));
      setProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[id];
        return newProgress;
      });
      setUploadError((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
      removeThisMedia(id, "media");
    },
    []
  );

  // Reset all state
  const resetAll = useCallback(() => {
    setMedia([]);
    setProgress({});
    setUploadError({});
  }, []);

  // Computed values
  const progressValues = Object.values(progress);
  const progressKeys = Object.keys(progress);

  const isUploadComplete =
    media.length > 0 &&
    progressKeys.length > 0 &&
    progressValues.every((value) => value === 100) &&
    progressKeys.length === media.length;

  const isAnyUploading = progressValues.some(
    (value) => value > 0 && value < 100
  );

  // Context value
  const contextValue: UploadProgressState = {
    media,
    progress,
    uploadError,
    isUploadComplete,
    isAnyUploading,
    addMediaFiles,
    removeMediaItem,
    resetAll,
  };

  return (
    <UploadProgressContext.Provider value={contextValue}>
      {children}
    </UploadProgressContext.Provider>
  );
};

// Hook to use the context
export const useUploadProgress = (): UploadProgressState => {
  const context = useContext(UploadProgressContext);
  if (context === undefined) {
    throw new Error(
      "useUploadProgress must be used within an UploadProgressProvider"
    );
  }
  return context;
};
