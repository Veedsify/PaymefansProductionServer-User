"use client";
import React, {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import toast from "react-hot-toast";
import { POST_CONFIG } from "@/config/config";
import { usePostContext } from "@/contexts/PostContext";
import { useUploadProgress } from "@/contexts/UploadProgressContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import Media from "@/features/media/MediaPreviewPost";
import AddNewPostMedia from "./AddNewPostMedia";
import { X } from "lucide-react";

type PostMediaPreviewProps = {
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
};

const PostMediaPreview = React.memo(
  ({ setIsSubmitting }: PostMediaPreviewProps) => {
    const { setMediaUploadComplete } = usePostContext();
    const [filePreviews, setFilePreviews] = React.useState<
      {
        id: string;
        url: string;
        file: File;
      }[]
    >([]); // State to hold file preview URLs
    const {
      media,
      progress,
      isUploadComplete,
      isAnyUploading,
      addMediaFiles,
      removeMediaItem,
    } = useUploadProgress();
    const { user } = useAuthContext();

    const handleMediaRemove = useCallback(
      (id: string, type: string) => {
        removeMediaItem(id);
      },
      [removeMediaItem]
    );

    const handleFileSelect = useCallback(
      async (files: File[]) => {
        console.log(
          "PostMediaPreview: handleFileSelect called with files:",
          files.length
        );
        if (!files?.length) return;
        const fileLimit = user?.is_model
          ? POST_CONFIG.MODEL_POST_LIMIT
          : POST_CONFIG.USER_POST_LIMIT;
        if (media.length + files.length > fileLimit) {
          toast.error(
            user?.is_model
              ? POST_CONFIG.MODEL_POST_LIMIT_ERROR_MSG
              : POST_CONFIG.USER_POST_LIMIT_ERROR_MSG
          );
          return;
        }

        console.log("PostMediaPreview: Setting mediaUploadComplete to false");
        // Reset upload completion flag when new media is added
        setMediaUploadComplete(false);
        // Handle upload via context
        await addMediaFiles(files, user);
      },
      [user, media.length, addMediaFiles, setMediaUploadComplete]
    );

    useEffect(() => {
      setFilePreviews(
        media.map((m) => ({
          file: m.file,
          id: m.id,
          url: URL.createObjectURL(m.file),
        }))
      );
    }, [media, handleMediaRemove]);

    // Track upload completion using the shared progress context
    useEffect(() => {
      // Set upload complete when progress context indicates completion
      if (isUploadComplete && media.length > 0) {
        setMediaUploadComplete(true);
      }
    }, [isUploadComplete, media.length, setMediaUploadComplete]);

    // Track submission state using the shared progress context
    useEffect(() => {
      const shouldBeSubmitting =
        isAnyUploading || (media.length > 0 && !isUploadComplete);
      setIsSubmitting(shouldBeSubmitting);
    }, [isAnyUploading, isUploadComplete, media.length, setIsSubmitting]);

    return (
      <div className="mb-5">
        <div className="p-8 select-none grid grid-cols-4 gap-3 md:grid-cols-4 lg:grid-cols-6">
          {filePreviews.map((file, idx) => (
            <div className="relative" key={`post-media-${file.id}-${idx}`}>
              <Media file={file.file} id={file.id} url={file.url} />
              {progress[file.id] !== undefined &&
                progress[file.id] !== null && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center w-full h-full p-1 text-white bg-black/50 rounded-xl">
                    <button
                      onClick={() => handleMediaRemove(file.id, file.file.type)}
                      className="cursor-pointer"
                      aria-label="Remove media"
                      type="button"
                    >
                      <X size={20} />
                    </button>
                    <span className="bottom-0 absolute">
                      {progress[file.id] ?? 0}%
                    </span>
                  </div>
                )}
            </div>
          ))}
        </div>
        <AddNewPostMedia handleFileSelect={handleFileSelect} />
      </div>
    );
  }
);
PostMediaPreview.displayName = "PostMediaPreview";

export default PostMediaPreview;
