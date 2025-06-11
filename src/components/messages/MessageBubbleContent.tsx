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
  attachment = [],
  rawFiles = [],
  isSender,
}) => {
  const { fullScreenPreview } = usePostComponent();

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
