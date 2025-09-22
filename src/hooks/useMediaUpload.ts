import path from "path";
import { useCallback, useEffect, useRef, useTransition } from "react";
import { useChatStore } from "@/contexts/ChatContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import type { Attachment, MediaFile } from "@/types/Components";
import UploadImageToCloudflare from "@/utils/CloudflareImageUploader";
import { GetUploadUrl } from "@/utils/GetMediaUploadUrl";
import UploadWithTus from "@/utils/TusUploader";

// Track upload instances to prevent duplicates
const uploadTracker = new Map<string, boolean>();
export const useMediaUpload = () => {
  const { user } = useAuthContext();
  const updateMediaFileStatus = useChatStore(
    (state) => state.updateMediaFileStatus,
  );
  const mediaFiles = useChatStore((state) => state.mediaFiles);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const [isPending, startTransition] = useTransition();
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
      // Mark as being tracked BEFORE starting upload
      uploadTracker.set(file.id, true);
      // Create abort controller for this upload
      const abortController = new AbortController();
      abortControllersRef.current.set(file.id, abortController);
      try {
        // Set uploading status immediately
        updateMediaFileStatus(file.id, "uploading", 0);
        // Get upload URL
        const uploadResponse = await GetUploadUrl(file.file, {
          username: user.username || "unknown",
          shouldUseSignedUrls: false,
        });
        if (abortController.signal.aborted) {
          uploadTracker.delete(file.id);
          return;
        }
        let attachment: Attachment | null = null;
        // Progress and error callbacks with improved state management
        const setProgress = (
          progressObj:
            | { [key: string]: number }
            | ((prev: { [key: string]: number }) => { [key: string]: number }),
        ) => {
          const value =
            typeof progressObj === "function"
              ? progressObj({})[file.id]
              : progressObj[file.id];
          if (value !== undefined && !abortController.signal.aborted) {
            // More frequent updates for better UX, but still throttled
            if (value % 5 === 0 || value === 100 || value === 0) {
              // Update every 5% or at start/completion
              updateMediaFileStatus(file.id, "uploading", value);
            } else {
              // Defer other updates to prevent blocking
              startTransition(() => {
                updateMediaFileStatus(file.id, "uploading", value);
              });
            }
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
          if (
            hasError !== undefined &&
            hasError &&
            !abortController.signal.aborted
          ) {
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
            const mediaId = await UploadWithTus({
              file: file.file,
              uploadUrl: uploadResponse.uploadUrl,
              id: file.id,
              setProgress,
              setUploadError,
            });
            if (abortController.signal.aborted) {
              uploadTracker.delete(file.id);
              return;
            }
            if (mediaId) {
              // Validate environment variable
              const customerSubdomain =
                process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN;
              if (!customerSubdomain) {
                console.error(
                  `❌ Missing NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN environment variable`,
                );
                updateMediaFileStatus(file.id, "error");
                uploadTracker.delete(file.id);
                return;
              }
              const videoUrl = `${customerSubdomain}${mediaId}/manifest/video.m3u8`;
              attachment = {
                url: videoUrl,
                type: "video",
                id: mediaId,
                poster: file.posterUrl || "",
                name: mediaId,
                extension: path.extname(file.file.name),
                size: file.file.size,
              };
              // Validate attachment was created properly
              if (!attachment.url || !attachment.id) {
                console.error(
                  `❌ Invalid video attachment created for ${file.id}:`,
                  attachment,
                );
                updateMediaFileStatus(file.id, "error");
                uploadTracker.delete(file.id);
                return;
              }
            } else {
              console.error(
                `❌ Video upload failed - no mediaId returned for ${file.id}`,
              );
              updateMediaFileStatus(file.id, "error");
              uploadTracker.delete(file.id);
              return;
            }
          } catch (error) {
            console.error(`❌ Video upload exception for ${file.id}:`, error);
            if (!abortController.signal.aborted) {
              updateMediaFileStatus(file.id, "error");
              uploadTracker.delete(file.id);
            }
            return;
          }
        }
        if (attachment && !abortController.signal.aborted) {
          updateMediaFileStatus(file.id, "completed", 100, attachment);
          // Keep file in tracker to prevent re-processing until explicitly removed
        } else if (!attachment && !abortController.signal.aborted) {
          console.error(
            `❌ Upload failed for ${file.id} - no attachment created`,
          );
          updateMediaFileStatus(file.id, "error");
          uploadTracker.delete(file.id);
        } else if (abortController.signal.aborted) {
          uploadTracker.delete(file.id);
        }
      } catch (error: any) {
        if (!abortController.signal.aborted) {
          updateMediaFileStatus(file.id, "error");
          uploadTracker.delete(file.id);
        }
      } finally {
        // Always clean up abort controller
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
  // Auto-upload when new media files are added (improved logic)
  useEffect(() => {
    if (mediaFiles.length === 0) return;
    startTransition(() => {
      const filesToUpload = mediaFiles.filter((file) => {
        // More comprehensive check for files that need uploading
        const shouldUpload =
          file.uploadStatus === "idle" &&
          !uploadTracker.has(file.id) &&
          !file.attachment && // Don't re-upload files that already have attachments
          !abortControllersRef.current.has(file.id); // Don't re-upload if already being processed
        // if (!shouldUpload) {
        // }
        return shouldUpload;
      });
      if (filesToUpload.length > 0) {
        // Upload files sequentially to avoid overwhelming the system
        filesToUpload.forEach((file, index) => {
          // Small delay between uploads to prevent race conditions
          setTimeout(() => {
            uploadFile(file);
          }, index * 100);
        });
      }
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
    if (mediaFiles.length === 0) {
      return true;
    }
    const incompleteFiles = mediaFiles.filter((file) => {
      const isCompleted = file.uploadStatus === "completed" && file.attachment;
      const isError = file.uploadStatus === "error";
      const isComplete = isCompleted || isError;
      return !isComplete;
    });
    const allComplete = incompleteFiles.length === 0;
    return allComplete;
  }, [mediaFiles]);
  // Check if any uploads have errors
  const hasUploadErrors = useCallback(() => {
    return mediaFiles.some((file) => file.uploadStatus === "error");
  }, [mediaFiles]);
  // Get completed attachments with validation
  const getCompletedAttachments = useCallback((): Attachment[] => {
    const completedAttachments = mediaFiles
      .filter((file) => {
        const isCompleted =
          file.uploadStatus === "completed" && file.attachment;
        return isCompleted;
      })
      .map((file) => file.attachment!)
      .filter((attachment) => {
        // Additional validation for attachment integrity
        const isValid =
          attachment && attachment.url && attachment.id && attachment.type;
        if (!isValid) {
          console.error("❌ Invalid attachment detected:", attachment);
        }
        return isValid;
      });
    return completedAttachments;
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
    isPending, // Expose pending state for UI feedback
  };
};
