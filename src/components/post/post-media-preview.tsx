"use client";
import React, { useCallback, useState } from "react";
import { useUserAuthContext } from "@/lib/userUseContext";
import { POST_CONFIG } from "@/config/config";
import { v4 as uuid } from "uuid";
import { getToken } from "@/utils/cookie.get";
import { UploadedImageProp } from "@/types/components";
import toast from "react-hot-toast";
import ROUTE from "@/config/routes";
import NewPostMediaAdd from "../sub_components/sub/new-post-media-add";
import Media from "@/components/common/media-preview-post";

type PostMediaPreviewProps = {
  submitPost: (image: UploadedImageProp) => void;
  removeThisMedia: (id: string, type: string) => void;
};

function PostMediaPreview({
  submitPost,
  removeThisMedia,
}: PostMediaPreviewProps) {
  const [media, setMedia] = useState<Array<{ file: File; id: string }>>([]);
  const { user } = useUserAuthContext();
  const token = getToken();

  const handleMediaRemove = useCallback(
    (id: string, type: string) => {
      setMedia((prevMedia) => prevMedia.filter((file) => file.id !== id));
      removeThisMedia(id, type);
    },
    [removeThisMedia]
  );

  const handleFileSelect = async (files: File[]) => {
    if (!files || files.length === 0) return;

    const allFiles = Array.from(files);
    const fileLimit = user?.is_model
      ? POST_CONFIG.MODEL_POST_LIMIT
      : POST_CONFIG.USER_POST_LIMIT;

    if (media.length + allFiles.length > fileLimit) {
      toast.error(
        user?.is_model
          ? POST_CONFIG.MODEL_POST_LIMIT_ERROR_MSG
          : POST_CONFIG.USER_POST_LIMIT_ERROR_MSG
      );
      return;
    }

    const newMediaItems = allFiles.map((file) => ({ file, id: uuid() }));
    setMedia((prevMedia) => [...prevMedia, ...newMediaItems]);

    try {
      const uploadPromises = newMediaItems.map(async (mediaItem) => {
        const formData = new FormData();
        formData.append("file", mediaItem.file);
        formData.append("fileId", mediaItem.id);

        const response = await fetch(ROUTE.UPLOAD_POST_MEDIA_ENDPOINT, {
          method: "POST",
          body: formData,
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok)
          throw new Error(`Upload failed for ${mediaItem.file.name}`);

        const uploadedUrls = await response.json();
        submitPost({...uploadedUrls, fileId: mediaItem.id});
      });

      await Promise.all(uploadPromises);
    } catch (error) {
      toast.error("Some uploads failed.");
      console.error(error);
    }
  };

  return (
    <div className="mb-5">
      <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-3 md:p-8 p-4 overflow-x-auto select-none">
        {media.map((file) => (
          <div className="relative" key={file.id}>
            <Media
              file={file.file}
              id={file.id}
              removeThisMedia={handleMediaRemove}
            />
          </div>
        ))}
      </div>
      <NewPostMediaAdd handleFileSelect={handleFileSelect} />
    </div>
  );
}

export default React.memo(PostMediaPreview);
