"use client";
import React, { useState, useRef, useCallback } from "react";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { POST_CONFIG } from "@/config/config";
import { v4 as uuid } from "uuid";
import { getToken } from "@/utils/Cookie";
import { UploadedImageProp, UploadResponseResponse } from "@/types/Components";
import toast from "react-hot-toast";
import AddNewPostMedia from "../sub_components/sub/AddNewPostMedia";
import Media from "@/components/common/MediaPreviewPost";
import axios from "axios";
import { getMaxDurationBase64 } from "@/utils/GetVideoMaxDuration";
import UploadImageToCloudflare from "../../utils/CloudflareImageUploader";
import UploadWithTus from "@/utils/TusUploader";
import { usePostMediaUploadContext } from "@/contexts/PostMediaUploadContext";
import axiosInstance from "@/utils/Axios";

type PostMediaPreviewProps = {
  submitPost: (image: UploadedImageProp) => void;
  removeThisMedia: (id: string, type: string) => void;
};

function PostMediaPreview({
  submitPost,
  removeThisMedia,
}: PostMediaPreviewProps) {
  const [media, setMedia] = useState<Array<{ file: File; id: string }>>([]);
  const [progress, setProgress] = useState<{ [key: string]: number }>({});
  const [uploadError, setUploadError] = useState<{ [key: string]: boolean }>(
    {},
  );
  const { setMediaUploadComplete } = usePostMediaUploadContext();
  const { user } = useUserAuthContext();

  const handleMediaRemove = useCallback(
    (id: string, type: string) => {
      setMedia((prev) => prev.filter((file) => file.id !== id));
      removeThisMedia(id, type);
    },
    [removeThisMedia],
  );

  const tusUploader = useCallback(
    (file: File, uploadUrl: string, id: string) =>
      UploadWithTus(file, uploadUrl, id, setProgress, setUploadError),
    [],
  );

  const imageUploader = useCallback(
    (file: File, uploadUrl: string, id: string) =>
      UploadImageToCloudflare({
        file,
        setProgress,
        setUploadError,
        id,
        uploadUrl,
      }),
    [],
  );

  const handleFileSelect = useCallback(
    async (files: File[]) => {
      if (!files?.length) return;
      const fileLimit = user?.is_model
        ? POST_CONFIG.MODEL_POST_LIMIT
        : POST_CONFIG.USER_POST_LIMIT;
      if (media.length + files.length > fileLimit) {
        toast.error(
          user?.is_model
            ? POST_CONFIG.MODEL_POST_LIMIT_ERROR_MSG
            : POST_CONFIG.USER_POST_LIMIT_ERROR_MSG,
        );
        return;
      }
      const newMediaItems = files.map((file) => ({ file, id: uuid() }));
      setMedia((prev) => [...prev, ...newMediaItems]);
      try {
        try {
          for (const [index, mediaItem] of newMediaItems.entries()) {
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
            };
            if (isVideo) payload.maxDuration = maxVideoDuration;

            const { data } = await axiosInstance.post<UploadResponseResponse>(
              `/post/media/signed-url`,
              payload,
            );
            const { uploadUrl, type, id } = data;
            if (!id || !uploadUrl) throw new Error("Failed to get upload URL");

            if (type === "video") {
              const uploadVideo = await tusUploader(
                mediaItem.file,
                uploadUrl,
                mediaItem.id,
              );
              submitPost({
                blur: ``,
                public: `${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN}${uploadVideo}/manifest/video.m3u8`,
                id: uploadVideo,
                type: "video",
                fileId: mediaItem.id,
              });
              if (index === newMediaItems.length - 1) {
                setMediaUploadComplete(true); // Set upload complete after last item
              }
            } else if (type === "image") {
              const uploadImage = await imageUploader(
                mediaItem.file,
                uploadUrl,
                mediaItem.id,
              );
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
              if (index === newMediaItems.length - 1) {
                setMediaUploadComplete(true); // Set upload complete after last item
              }
            }
          }
        } catch (error: any) {
          throw new Error(error.message);
        }
      } catch {
        toast.error("Some uploads failed.");
      }
    },
    [
      user,
      media.length,
      submitPost,
      tusUploader,
      imageUploader,
      setMediaUploadComplete,
    ],
  );

  return (
    <div className="mb-5">
      <div className="p-4 select-none grid grid-cols-4 gap-3 md:grid-cols-4 lg:grid-cols-6">
        {media.map((file) => (
          <div className="relative" key={file.id}>
            <Media
              file={file.file}
              id={file.id}
              progress={progress[file.id] || 0}
              removeThisMedia={handleMediaRemove}
            />
          </div>
        ))}
      </div>
      <AddNewPostMedia handleFileSelect={handleFileSelect} />
    </div>
  );
}

export default React.memo(PostMediaPreview);
