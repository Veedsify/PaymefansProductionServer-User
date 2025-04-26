"use client";
import React, { useCallback, useState } from "react";
import { useUserAuthContext } from "@/lib/userUseContext";
import { POST_CONFIG } from "@/config/config";
import { v4 as uuid } from "uuid";
import { getToken } from "@/utils/cookie.get";
import { UploadedImageProp, UploadResponseResponse } from "@/types/components";
import toast from "react-hot-toast";
import NewPostMediaAdd from "../sub_components/sub/new-post-media-add";
import Media from "@/components/common/media-preview-post";
import axios from "axios";
import { getMaxDurationBase64 } from "@/utils/get-video-max-duration";
import * as tus from "tus-js-client";
import UploadImageToCloudflare from "../../utils/cloudflare-image-uploader";
import UploadWithTus from "@/utils/tusUploader";
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
    {}
  );
  const { user } = useUserAuthContext();
  const token = getToken();
  const handleMediaRemove = useCallback(
    (id: string, type: string) => {
      setMedia((prevMedia) => prevMedia.filter((file) => file.id !== id));
      removeThisMedia(id, type);
    },
    [removeThisMedia]
  );
  const tusUploader = useCallback(
    async (file: File, uploadUrl: string, id: string): Promise<string> => {
      return await UploadWithTus(
        file,
        uploadUrl,
        id,
        setProgress,
        setUploadError
      );
    },
    [setProgress, setUploadError]
  );
  const imageUploader = useCallback(
    async (file: File, uploadUrl: string, id: string) => {
      return await UploadImageToCloudflare({
        file,
        setProgress,
        setUploadError,
        id,
        uploadUrl,
      });
    },
    [setProgress, setUploadError]
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
      for (const mediaItem of newMediaItems) {
        await (async () => {
          const getSignedUrls = async () => {
            try {
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
              if (isVideo) {
                payload.maxDuration = maxVideoDuration;
              }
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/media/signed-url`,
                payload,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              return response.data as UploadResponseResponse;
            } catch (err) {
              throw err;
            }
          };
          const { uploadUrl, type, id } = await getSignedUrls();
          if (!id || !uploadUrl) {
            throw new Error("Failed to get upload URL");
          }
          if (type === "video") {
            const uploadVideo = await tusUploader(
              mediaItem.file,
              uploadUrl,
              mediaItem.id
            );
            submitPost({
              blur: ``,
              public: `${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN}${uploadVideo}/manifest/video.m3u8`,
              id: uploadVideo,
              type: "video",
              fileId: mediaItem.id,
            });
          }
          if (type === "image") {
            const uploadImage = await imageUploader(
              mediaItem.file,
              uploadUrl,
              mediaItem.id
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
          }
        })();
      }
    } catch (error) {
      toast.error("Some uploads failed.");
      console.error(error);
    }
  };
  return (
    <div className="mb-5">
      <div className="grid grid-cols-4 gap-3 p-4 overflow-x-auto select-none md:grid-cols-4 lg:grid-cols-6 md:p-8">
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
      <NewPostMediaAdd handleFileSelect={handleFileSelect} />
    </div>
  );
}
export default React.memo(PostMediaPreview);
