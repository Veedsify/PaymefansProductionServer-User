"use client";
import type React from "react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import { v4 as uuid } from "uuid";
import type {
  RemovedMediaIdProps,
  UploadedMediaProp,
  UploadResponseResponse,
} from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import UploadImageToCloudflare from "@/utils/CloudflareImageUploader";
import { getMaxDurationBase64 } from "@/utils/GetVideoMaxDuration";
import UploadWithTus from "@/utils/TusUploader";

// Types
interface MediaItem {
  file: File;
  id: string;
}

interface UploadProgressState {
  // Media items
  media: MediaItem[];

  // Uploaded media
  uploadedMedia: UploadedMediaProp[];

  // Removed IDs
  removedIds: RemovedMediaIdProps[];

  // Progress tracking
  progress: { [key: string]: number };

  // Upload errors
  uploadError: { [key: string]: boolean };

  // Upload completion state
  isUploadComplete: boolean;
  isAnyUploading: boolean;

  // Actions
  addMediaFiles: (files: File[], user: any) => Promise<void>;

  removeMediaItem: (id: string) => void;
  setRemovedIds: React.Dispatch<React.SetStateAction<RemovedMediaIdProps[]>>;
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
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaProp[]>([]);
  const [removedIds, setRemovedIds] = useState<RemovedMediaIdProps[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [uploadError, setUploadError] = useState<{ [key: string]: boolean }>(
    {}
  );

  useEffect(() => {
    console.log("Media state updated in progress:", media.length);
  }, [media]);

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

  // Helper: Parse image variants
  const parseImageVariants = (variants: string[] = []) => {
    const publicVariant =
      variants.find((v) => v?.includes("/public")) ?? variants[0] ?? "";
    const blurVariant =
      variants.find((v) => v?.includes("/blur")) ?? variants[0] ?? "";
    return { publicVariant, blurVariant };
  };

  // Upload a single file and add to uploadedMedia
  const uploadAndSubmitFile = async (
    mediaItem: { file: File; id: string },
    user: any,
    tusUploader: any,
    imageUploader: any,
    axiosInstance: any
  ) => {
    const { file, id: fileId } = mediaItem;
    const isVideo = file.type.startsWith("video/");
    const maxVideoDuration = isVideo ? getMaxDurationBase64(file) : null;

    const payload = {
      type: isVideo ? "video" : "image",
      fileName: btoa(`paymefans-${user?.username}-${Date.now()}`),
      fileSize: file.size,
      fileType: btoa(file.type),
      explicitImageType: file.type,
      shouldUseSignedUrls: true,
      ...(isVideo && { maxDuration: maxVideoDuration }),
    };

    // console.log("Requesting signed URL for:", payload.type, file.name);

    const { data } = await axiosInstance.post(
      `/post/media/signed-url`,
      payload
    );

    if (!data || data.error) {
      throw new Error(data?.message || "Failed to get upload URL from server");
    }

    const { uploadUrl, type, id: mediaId } = data;
    if (!mediaId || !uploadUrl) {
      throw new Error("Missing upload URL or media ID");
    }

    // console.log("Uploading file:", file.name, "type:", type);

    if (type === "video") {
      const uploadVideo = await tusUploader(file, uploadUrl, fileId);
      // console.log("Video upload completed:", uploadVideo);
      setUploadedMedia((prev) => [
        ...prev,
        {
          blur: ``,
          public: `${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN}${uploadVideo}/manifest/video.m3u8`,
          id: uploadVideo,
          type: "video",
          fileId,
        },
      ]);
      updateProgress(fileId, 100);
    } else if (type === "image") {
      const uploadImage = await imageUploader(file, uploadUrl, fileId);
      // console.log("Image upload completed:", uploadImage);
      const { publicVariant, blurVariant } = parseImageVariants(
        uploadImage.result.variants
      );
      setUploadedMedia((prev) => [
        ...prev,
        {
          blur: blurVariant,
          public: publicVariant,
          id: uploadImage.result.id,
          type: "image",
          fileId,
        },
      ]);
      updateProgress(fileId, 100);
    }
  };

  // Main handler: Sequential upload of media files
  const addMediaFiles = useCallback(
    async (files: File[], user: any) => {
      if (!files?.length) return;

      // console.log("Starting sequential upload for", files.length, "files");

      const newMediaItems = files.map((file) => ({ file, id: uuid() }));
      setMedia((prev) => [...prev, ...newMediaItems]);

      for (const mediaItem of newMediaItems) {
        try {
          await uploadAndSubmitFile(
            mediaItem,
            user,
            tusUploader,
            imageUploader,
            axiosInstance
          );
        } catch (error: any) {
          console.error("Failed to upload file:", mediaItem.file.name, error);
          toast.error(`Upload failed: ${mediaItem.file.name}`);
        }
      }
      // console.log("Sequential upload batch completed");
    },
    [tusUploader, imageUploader, setMedia, toast]
  );

  // Remove media item
  const removeMediaItem = useCallback(
    (id: string) => {
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
      setUploadedMedia((prev) => prev.filter((item) => item.fileId !== id));
      const item = uploadedMedia.find((med) => med.fileId === id);
      if (item) {
        setRemovedIds((prevIds) => [
          ...prevIds,
          { id: item.id, type: item.type },
        ]);
      }
    },
    [uploadedMedia]
  );

  // Reset all state
  const resetAll = useCallback(() => {
    setMedia([]);
    setUploadedMedia([]);
    setRemovedIds([]);
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
    uploadedMedia,
    removedIds,
    progress,
    uploadError,
    isUploadComplete,
    isAnyUploading,
    addMediaFiles,
    removeMediaItem,
    setRemovedIds,
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
