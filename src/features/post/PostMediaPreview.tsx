"use client";
import React, {
  useMemo,
  useEffect,
  Dispatch,
  SetStateAction,
  useCallback,
} from "react";
import { useAuthContext } from "@/contexts/UserUseContext";
import { POST_CONFIG } from "@/config/config";
import { UploadedImageProp } from "@/types/Components";
import toast from "react-hot-toast";
import AddNewPostMedia from "./AddNewPostMedia";
import Media from "@/features/media/MediaPreviewPost";
import { usePostContext } from "@/contexts/PostContext";
import { useUploadProgress } from "@/contexts/UploadProgressContext";

type PostMediaPreviewProps = {
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  submitPost: (image: UploadedImageProp) => void;
  removeThisMedia: (id: string, type: string) => void;
};

function PostMediaPreview({
  submitPost,
  removeThisMedia,
  setIsSubmitting,
}: PostMediaPreviewProps) {
  const { setMediaUploadComplete } = usePostContext();
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
      removeMediaItem(id, removeThisMedia);
    },
    [removeMediaItem, removeThisMedia]
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

      console.log("PostMediaPreview: Calling addMediaFiles");
      // Handle upload via context
      await addMediaFiles(files, user, submitPost);
    },
    [user, media.length, addMediaFiles, submitPost, setMediaUploadComplete]
  );

  const mediaMap = useMemo(
    () =>
      media.map((m) => ({
        file: m.file,
        id: m.id,
        removeThisMedia: handleMediaRemove,
        url: URL.createObjectURL(m.file),
      })),
    [media, handleMediaRemove]
  );

  useEffect(() => {
    return () => {
      mediaMap.forEach((file) => {
        URL.revokeObjectURL(file.url);
      });
    };
  }, [mediaMap]);

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
      <div className="p-4 select-none grid grid-cols-4 gap-3 md:grid-cols-4 lg:grid-cols-6">
        {mediaMap.map((file) => (
          <div className="relative" key={file.id}>
            <Media
              file={file.file}
              id={file.id}
              url={file.url}
              progress={progress[file.id] || 0}
              removeThisMedia={file.removeThisMedia}
            />
          </div>
        ))}
      </div>
      <AddNewPostMedia handleFileSelect={handleFileSelect} />
    </div>
  );
}

export default React.memo(PostMediaPreview);
