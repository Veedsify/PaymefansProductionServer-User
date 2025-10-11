import { LucideImage, LucideLoader, LucideVideo } from "lucide-react";
import Image from "next/image";
import path from "path";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HiPlay } from "react-icons/hi";
import usePostComponent from "@/contexts/PostComponentPreview";
import { useAuthContext } from "@/contexts/UserUseContext";
import {
  type Attachment,
  type MediaFile,
  type MessageBubbleContentProps,
  UploadResponseResponse,
} from "@/types/Components";
import ProgressCircle from "../../../components/common/loaders/FileUploadProgress";
import HLSVideoPlayer from "../../media/videoplayer";

const MessageBubbleContent: React.FC<MessageBubbleContentProps> = ({
  message,
  hasAttachments,
  hasMessage,
  hasRawFiles,
  attachment = [],
  rawFiles = [],
  isSender,
}) => {
  const fullScreenPreview = usePostComponent(
    (state) => state.fullScreenPreview,
  );

  // Media preview handlers
  const handlePreview = useCallback(
    (file: Attachment, index: number) => {
      fullScreenPreview({
        url: file.url,
        type: file.type.includes("image") ? "image" : "video",
        open: true,
        userProfile: null,
        ref: index,
        otherUrl:
          (attachment &&
            attachment.map((f) => ({ url: f.url, type: f.type }))) ||
          [],
        withOptions: true,
      });
    },
    [attachment, fullScreenPreview],
  );
  const handleRawPreview = useCallback(
    (file: MediaFile, index: number) => {
      fullScreenPreview({
        url: file.previewUrl,
        type: file.type.includes("image") ? "image" : "video",
        open: true,
        userProfile: null,
        ref: index,
        otherUrl: rawFiles.map((f) => ({
          url: f.previewUrl,
          type: f.type,
          isBlob: true,
        })),
        withOptions: true,
      });
    },
    [rawFiles, fullScreenPreview],
  );

  return (
    <>
      {hasRawFiles &&
      isSender &&
      rawFiles.some((file) => file.uploadStatus !== "completed") ? (
        <div
          className={`grid overflow-hidden ${
            rawFiles.length >= 4 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {rawFiles.map((file: MediaFile, idx: number) => (
            <div
              key={file.previewUrl || idx}
              className="relative p-2 cursor-pointer group transition-transform duration-200 hover:scale-105"
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
                    className="object-cover w-full rounded-lg shadow-md aspect-square group-hover:brightness-90 transition"
                  />
                  <span className="absolute px-2 py-1 text-xs text-gray-700 rounded shadow bottom-2 right-2 bg-white/30 group-hover:bg-primary-dark-pink group-hover:text-white transition">
                    <LucideImage className="text-white" size={16} />
                  </span>
                  {/* Upload progress indicator */}
                  {file.uploadStatus === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                      <div className="flex flex-col items-center text-sm font-medium text-white">
                        <div className="mb-1">
                          {file.uploadProgress === 99
                            ? "Processing..."
                            : `${file.uploadProgress || 0}%`}
                        </div>
                        {file.uploadProgress === 99 && (
                          <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <span className="absolute px-2 py-1 text-xs text-gray-700 rounded shadow bottom-2 right-2 bg-white/30 group-hover:bg-primary-dark-pink group-hover:text-white transition">
                    <LucideVideo className="text-white" size={16} />
                  </span>
                  <video
                    src={file.previewUrl}
                    muted
                    aria-label="Video uploading"
                    className="object-cover w-full rounded-lg shadow-md group-hover:brightness-75 transition aspect-square"
                  />
                  {/* Upload progress indicator */}
                  {file.uploadStatus === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                      <div className="flex flex-col items-center text-sm font-medium text-white">
                        <div className="mb-1">
                          {file.uploadProgress === 99
                            ? "Processing..."
                            : `${file.uploadProgress || 0}%`}
                        </div>
                        {file.uploadProgress === 99 && (
                          <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : hasAttachments && attachment?.length ? (
        <div
          className={`grid overflow-hidden ${
            attachment.length >= 4 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {attachment.map((file: Attachment, idx: number) => (
            <div
              key={file.url || idx}
              className="relative p-2 cursor-pointer group transition-transform duration-200 hover:scale-105"
              tabIndex={0}
              aria-label={
                file.type.includes("image") ? "Image preview" : "Video preview"
              }
              role="button"
            >
              {file.type.includes("image") ? (
                <div className="relative">
                  <img
                    width={300}
                    height={300}
                    loading="eager"
                    onClick={() => handlePreview(file, idx)}
                    src={file.url}
                    alt="Uploaded content"
                    className="object-cover w-full rounded-lg aspect-square group-hover:brightness-90 transition"
                  />
                  <span className="absolute px-2 py-1 text-xs text-gray-700 rounded shadow bottom-2 right-2 bg-white/30 group-hover:bg-primary-dark-pink group-hover:text-white transition">
                    <LucideImage className="text-white" size={16} />
                  </span>
                </div>
              ) : (
                <div
                  className="relative"
                  onClick={() => handlePreview(file, idx)}
                >
                  <video
                    src={file.url}
                    controls={false}
                    playsInline={true}
                    muted={true}
                    className="object-cover w-full aspect-square"
                  />
                  <div className="absolute inset-0 flex items-center justify-center w-full h-full bg-black/40 group-hover:bg-black/60 transition">
                    <button
                      className="flex items-center justify-center w-12 h-12 p-1 rounded-full shadow-lg bg-primary-dark-pink/90 aspect-square hover:bg-primary-dark-pink transition"
                      tabIndex={-1}
                      aria-label="Play video"
                    >
                      <HiPlay className="text-white" size={40} />
                    </button>
                  </div>
                  <span className="absolute px-2 py-1 text-xs text-gray-700 rounded shadow bottom-2 right-2 bg-white/30 group-hover:bg-primary-dark-pink group-hover:text-white transition">
                    <LucideVideo className="text-white" size={16} />
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null}
      {hasMessage && (
        <div
          className={`p-4 rounded-3xl font-medium ${
            isSender
              ? "bg-gray-100 dark:bg-gray-700 dark:text-white rounded-br-none"
              : "bg-primary-dark-pink text-white rounded-bl-none"
          }`}
        >
          <div
            className={`leading-relaxed w-full text-wrap text-sm ${
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
