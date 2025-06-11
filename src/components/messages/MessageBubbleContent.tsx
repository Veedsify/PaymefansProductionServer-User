import React, { useCallback, useEffect, useRef, useState } from "react";
import path from "path";
import {
  Attachment,
  MediaFile,
  MessageBubbleContentProps,
  UploadResponseResponse,
} from "@/types/Components";
import { useUserAuthContext } from "@/lib/UserUseContext";
import usePostComponent from "@/contexts/PostComponentPreview";
import HLSVideoPlayer from "../sub_components/videoplayer";
import Image from "next/image";
import { HiPlay } from "react-icons/hi";
import { LucideImage, LucideLoader, LucideVideo } from "lucide-react";
import ProgressCircle from "../sub_components/FileUploadProgress";

const MessageBubbleContent: React.FC<MessageBubbleContentProps> = ({
  message,
  hasAttachments,
  hasMessage,
  hasRawFiles,
  SendSocketMessage,
  attachment = [],
  rawFiles = [],
  isSender,
}) => {
  const { fullScreenPreview } = usePostComponent();
  const { user } = useUserAuthContext();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [uploadError, setUploadError] = useState<Record<string, boolean>>({});

  const removePreloader = (id: string) => {
    document.getElementById(id)?.remove();
  };

  // Media preview handlers
  const handlePreview = useCallback(
    (file: Attachment, index: number) => {
      fullScreenPreview({
        url: file.url,
        type: file.type.includes("image") ? "image" : "video",
        open: true,
        ref: index,
        otherUrl:
          (attachment &&
            attachment.map((f) => ({ url: f.url, type: f.type }))) ||
          [],
        withOptions: true,
      });
    },
    [attachment, fullScreenPreview]
  );
  const handleRawPreview = useCallback(
    (file: MediaFile, index: number) => {
      fullScreenPreview({
        url: file.previewUrl,
        type: file.type.includes("image") ? "image" : "video",
        open: true,
        ref: index,
        otherUrl: rawFiles.map((f) => ({
          url: f.previewUrl,
          type: f.type,
          isBlob: true,
        })),
        withOptions: true,
      });
    },
    [rawFiles, fullScreenPreview]
  );

  // // Get signed upload URL (image/video)
  // const token = getToken();
  // const getUploadUrl = useCallback(
  //   async (file: File): Promise<UploadResponseResponse> => {
  //     if (!file) throw new Error("File is not defined");
  //     const isVideo = file.type.startsWith("video/");
  //     const maxVideoDuration = isVideo ? getMaxDurationBase64(file) : null;
  //     const payload: any = {
  //       type: isVideo ? "video" : "image",
  //       fileName: btoa(`paymefans-attachment-${user?.username}-${Date.now()}`),
  //       fileSize: file.size,
  //       fileType: btoa(file.type),
  //       explicitImageType: file.type,
  //     };
  //     if (isVideo && maxVideoDuration) payload.maxDuration = maxVideoDuration;

  //     const response = await axios.post(
  //       `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/media/signed-url`,
  //       payload,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     if (response.data.error) throw new Error(response.data.message);
  //     return response.data as UploadResponseResponse;
  //   },
  //   [token, user]
  // );

  // // Upload all raw files and send via socket when done
  // const uploadFilesAndSend = useCallback(
  //   async function () {
  //     if (!rawFiles.length) return;
  //     const files: (Attachment | null)[] = [];
  //     for (const item of rawFiles) {
  //       try {
  //         const upload = await getUploadUrl(item.file);
  //         if (item.type === "image" && upload.type.includes("image")) {
  //           const imgRes = await UploadImageToCloudflare({
  //             file: item.file,
  //             id: item.previewUrl,
  //             uploadUrl: upload.uploadUrl,
  //             setProgress,
  //             setUploadError,
  //           });
  //           files.push({
  //             url: imgRes.result?.variants.find((v: string) =>
  //               v.includes("/public")
  //             ),
  //             id: imgRes.result?.id,
  //             poster: "",
  //             name: imgRes.result?.id,
  //             type: "image",
  //             extension: path.extname(item.file.name),
  //             size: item.file.size,
  //           });
  //         } else if (item.type === "video" && upload.type.includes("video")) {
  //           const mediaId = await UploadWithTus(
  //             item.file,
  //             upload.uploadUrl,
  //             item.previewUrl,
  //             setProgress,
  //             setUploadError
  //           );
  //           files.push({
  //             url: `${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN}${mediaId}/manifest/video.m3u8`,
  //             type: "video",
  //             id: mediaId,
  //             poster: "",
  //             name: mediaId,
  //             extension: path.extname(item.file.name),
  //             size: item.file.size,
  //           });
  //         } else {
  //           files.push(null);
  //         }
  //       } catch (err) {
  //         files.push(null);
  //       }
  //     }
  //     const uploadedFiles = files.filter(Boolean) as Attachment[];
  //     SendSocketMessage(uploadedFiles);
  //   },
  //   [rawFiles, SendSocketMessage, getUploadUrl]
  // );
  // useEffect(() => {
  //   uploadFilesAndSend();
  // }, [uploadFilesAndSend]);

  return (
    <>
      {hasAttachments && attachment?.length && (
        <div
          className={`grid overflow-hidden ${
            attachment.length >= 4 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {attachment.map((file: Attachment, idx: number) => (
            <div
              key={file.url || idx}
              className="p-2 cursor-pointer relative group transition-transform duration-200 hover:scale-105"
              tabIndex={0}
              aria-label={
                file.type.includes("image") ? "Image preview" : "Video preview"
              }
              role="button"
            >
              {file.type.includes("image") ? (
                <div className="relative">
                  <Image
                    width={300}
                    height={300}
                    onClick={() => handlePreview(file, idx)}
                    src={file.url}
                    alt="Uploaded content"
                    className="w-full object-cover rounded-lg aspect-square group-hover:brightness-90 transition"
                  />
                  <span className="absolute bottom-2 right-2 bg-white/30 text-xs text-gray-700 px-2 py-1 rounded shadow group-hover:bg-primary-dark-pink group-hover:text-white transition">
                    <LucideImage className="text-white" size={16} />
                  </span>
                </div>
              ) : (
                <div
                  className="relative"
                  onClick={() => handlePreview(file, idx)}
                >
                  <HLSVideoPlayer
                    streamUrl={file.url}
                    autoPlay={false}
                    modalOpen={false}
                    allOthers={{
                      poster: file.poster,
                      controls: false,
                      playsInline: true,
                      id: "video_player_full",
                      muted: false,
                    }}
                    className="object-cover w-full aspect-square"
                  />
                  <div className="bg-black/40 absolute inset-0 w-full h-full flex items-center justify-center group-hover:bg-black/60 transition">
                    <button
                      className="h-12 w-12 p-1 rounded-full flex items-center justify-center bg-primary-dark-pink/90 aspect-square shadow-lg hover:bg-primary-dark-pink transition"
                      tabIndex={-1}
                      aria-label="Play video"
                    >
                      <HiPlay className="text-white" size={40} />
                    </button>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-white/30 text-xs text-gray-700 px-2 py-1 rounded shadow group-hover:bg-primary-dark-pink group-hover:text-white transition">
                    <LucideVideo className="text-white" size={16} />
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {hasRawFiles && (
        <div
          className={`grid overflow-hidden ${
            rawFiles.length >= 4 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {rawFiles.map((file: MediaFile, idx: number) => (
            <div
              key={file.previewUrl || idx}
              className="p-2 cursor-pointer relative group transition-transform duration-200 hover:scale-105"
              onClick={() => handleRawPreview(file, idx)}
              tabIndex={0}
              aria-label={
                file.type.includes("image")
                  ? "Image upload preview"
                  : "Video upload preview"
              }
              role="button"
            >
              {file.type.includes("image") ? (
                <div className="relative">
                  <Image
                    priority
                    width={300}
                    height={300}
                    quality={80}
                    src={file.previewUrl}
                    alt="Uploading image"
                    className="w-full object-cover rounded-lg aspect-square shadow-md group-hover:brightness-90 transition"
                  />
                  <span className="absolute bottom-2 right-2 bg-white/30 text-xs text-gray-700 px-2 py-1 rounded shadow group-hover:bg-primary-dark-pink group-hover:text-white transition">
                    <LucideImage className="text-white" size={16} />
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <span className="absolute bottom-2 right-2 bg-white/30 text-xs text-gray-700 px-2 py-1 rounded shadow group-hover:bg-primary-dark-pink group-hover:text-white transition">
                    <LucideVideo className="text-white" size={16} />
                  </span>
                  <video
                    src={file.previewUrl}
                    muted
                    aria-label="Video uploading"
                    className="w-full object-cover rounded-lg shadow-md group-hover:brightness-75 transition"
                  />
                </div>
              )}
              {progress[file.previewUrl] > 0 && (
                <div className="absolute top-3 right-3 flex items-center justify-center w-12 h-12 z-10">
                  <ProgressCircle
                    progress={progress[file.previewUrl] || 0}
                    size={20}
                  />
                  <span className="absolute text-[10px] text-white font-semibold drop-shadow">
                    {progress[file.previewUrl] < 100
                      ? `${progress[file.previewUrl]}%`
                      : ""}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {hasMessage && (
        <div
          className={`p-4 rounded-3xl font-medium ${
            isSender
              ? "bg-gray-100 dark:bg-gray-700 dark:text-white rounded-br-none"
              : "bg-primary-dark-pink text-white rounded-bl-none"
          }`}
        >
          <div
            className={`leading-relaxed w-full text-wrap ${
              isSender ? "sender-link-style" : "receiver-link-style"
            }`}
            dangerouslySetInnerHTML={{
              __html: message as TrustedHTML,
            }}
          />
        </div>
      )}
    </>
  );
};

export default MessageBubbleContent;
