import { useCallback, useEffect, useRef } from "react";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { useChatStore } from "@/contexts/ChatContext";
import { GetUploadUrl } from "@/utils/GetMediaUploadUrl";
import UploadImageToCloudflare from "@/utils/CloudflareImageUploader";
import UploadWithTus from "@/utils/TusUploader";
import { MediaFile, Attachment } from "@/types/Components";
import path from "path";

// Track upload instances to prevent duplicates
const uploadTracker = new Map<string, boolean>();

export const useMediaUpload = () => {
  const { user } = useUserAuthContext();
  const updateMediaFileStatus = useChatStore(
    (state) => state.updateMediaFileStatus,
  );
  const mediaFiles = useChatStore((state) => state.mediaFiles);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const uploadFile = useCallback(
    async (file: MediaFile) => {
      if (!user || uploadTracker.has(file.id)) {
        return;
      }

      // Check if file is already completed or being uploaded
      if (
        file.uploadStatus === "completed" ||
        file.uploadStatus === "uploading"
      ) {
        return;
      }

      uploadTracker.set(file.id, true);

      // Create abort controller for this upload
      const abortController = new AbortController();
      abortControllersRef.current.set(file.id, abortController);

      try {
        // Set uploading status
        updateMediaFileStatus(file.id, "uploading", 0);

        // Get upload URL
        const uploadResponse = await GetUploadUrl(file.file, {
          username: user.username || "unknown",
        });

        if (abortController.signal.aborted) return;

        let attachment: Attachment | null = null;

        // Progress and error callbacks that directly update the store
        const setProgress = (
          progressObj:
            | { [key: string]: number }
            | ((prev: { [key: string]: number }) => { [key: string]: number }),
        ) => {
          const value =
            typeof progressObj === "function"
              ? progressObj({})[file.id]
              : progressObj[file.id];

          if (value !== undefined) {
            updateMediaFileStatus(file.id, "uploading", value);
          }
        };

        const setUploadError = (
          errorObj:
            | { [key: string]: boolean }
            | ((prev: { [key: string]: boolean }) => {
              [key: string]: boolean;
            }),
        ) => {
          const hasError =
            typeof errorObj === "function"
              ? errorObj({})[file.id]
              : errorObj[file.id];

          if (hasError !== undefined && hasError) {
            updateMediaFileStatus(file.id, "error");
          }
        };

        // Upload based on file type
        if (file.type === "image" && uploadResponse.type.includes("image")) {
          const imgRes = await UploadImageToCloudflare({
            file: file.file,
            id: file.id,
            uploadUrl: uploadResponse.uploadUrl,
            setProgress,
            setUploadError,
          });

          if (abortController.signal.aborted) return;

          attachment = {
            url: imgRes.result?.variants.find((v: string) =>
              v.includes("/public"),
            ),
            id: imgRes.result?.id,
            poster: "",
            name: imgRes.result?.id,
            type: "image",
            extension: path.extname(file.file.name),
            size: file.file.size,
          };
        } else if (
          file.type === "video" &&
          uploadResponse.type.includes("video")
        ) {

          try {
            const mediaId = await UploadWithTus(
              file.file,
              uploadResponse.uploadUrl,
              file.id,
              setProgress,
              setUploadError,
            );

            if (abortController.signal.aborted) {
              return;
            }

            if (mediaId) {
              attachment = {
                url: `${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN}${mediaId}/manifest/video.m3u8`,
                type: "video",
                id: mediaId,
                poster: file.posterUrl || "",
                name: mediaId,
                extension: path.extname(file.file.name),
                size: file.file.size,
              };
             } else {
              updateMediaFileStatus(file.id, "error");
              return;
            }
          } catch (error) {
            if (!abortController.signal.aborted) {
              updateMediaFileStatus(file.id, "error");
            }
            return;
          }
        }

        if (attachment && !abortController.signal.aborted) {
          updateMediaFileStatus(file.id, "completed", 100, attachment);
          // Keep the file in upload tracker to prevent re-processing
          // Don't delete from uploadTracker here
        } else if (!attachment) {
          updateMediaFileStatus(file.id, "error");
          uploadTracker.delete(file.id);
        } else {
          uploadTracker.delete(file.id);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          updateMediaFileStatus(file.id, "error");
          uploadTracker.delete(file.id);
        }
      } finally {
        abortControllersRef.current.delete(file.id);
      }
    },
    [user, updateMediaFileStatus],
  );

  // Cleanup removed files
  useEffect(() => {
    const currentFileIds = new Set(mediaFiles.map((file) => file.id));

    // Clean up abort controllers for removed files
    abortControllersRef.current.forEach((controller, fileId) => {
      if (!currentFileIds.has(fileId)) {
        controller.abort();
        abortControllersRef.current.delete(fileId);
        uploadTracker.delete(fileId);
      }
    });

    // Only clean up upload tracker for removed files, not completed ones
    uploadTracker.forEach((_, fileId) => {
      if (!currentFileIds.has(fileId)) {
        uploadTracker.delete(fileId);
      }
    });
  }, [mediaFiles]);

  // Auto-upload when new media files are added
  useEffect(() => {
    const filesToUpload = mediaFiles.filter((file) => {
      // Only upload files that are truly idle and not tracked
      const shouldUpload =
        file.uploadStatus === "idle" &&
        !uploadTracker.has(file.id) &&
        !file.attachment; // Don't re-upload files that already have attachments

      if (!shouldUpload && file.uploadStatus === "idle") {
      }

      return shouldUpload;
    });

    // Only upload files that haven't been processed
    filesToUpload.forEach((file) => {
      uploadFile(file);
    });
  }, [mediaFiles, uploadFile]);

  // Cleanup function to abort ongoing uploads
  const abortAllUploads = useCallback(() => {
    abortControllersRef.current.forEach((controller) => {
      controller.abort();
    });
    abortControllersRef.current.clear();
    uploadTracker.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortAllUploads();
    };
  }, [abortAllUploads]);

  // Check if all uploads are complete
  const areAllUploadsComplete = useCallback(() => {
    if (mediaFiles.length === 0) return true;

    const statusCheck = mediaFiles.every((file) => {
      const isCompleted = file.uploadStatus === "completed" && file.attachment;
      const isError = file.uploadStatus === "error";
      return isCompleted || isError;
    });
    return statusCheck;
  }, [mediaFiles]);

  // Check if any uploads have errors
  const hasUploadErrors = useCallback(() => {
    return mediaFiles.some((file) => file.uploadStatus === "error");
  }, [mediaFiles]);

  // Get completed attachments
  const getCompletedAttachments = useCallback((): Attachment[] => {
    return mediaFiles
      .filter(
        (file) =>
          (file.uploadStatus === "completed" || file.attachment) &&
          file.attachment,
      )
      .map((file) => file.attachment!)
      .filter(Boolean);
  }, [mediaFiles]);

  // Get upload progress statistics
  const getUploadProgress = useCallback(() => {
    if (mediaFiles.length === 0)
      return { completed: 0, total: 0, percentage: 100 };

    const completed = mediaFiles.filter(
      (file) => file.uploadStatus === "completed",
    ).length;
    const total = mediaFiles.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 100;

    return { completed, total, percentage };
  }, [mediaFiles]);

  return {
    uploadFile,
    abortAllUploads,
    areAllUploadsComplete,
    hasUploadErrors,
    getCompletedAttachments,
    getUploadProgress,
  };
};
