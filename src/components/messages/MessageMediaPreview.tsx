"use client";

import { MessageMediaPreViewProps } from "@/types/MessageComponents";
import MessageInputAttachmentPreview from "./MessageInputAttachmentPreview";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Attachment } from "@/types/Components";
import { useUserAuthContext } from "@/lib/UserUseContext";
import UploadImageToCloudflare from "@/utils/CloudflareImageUploader";
import UploadWithTus from "@/utils/TusUploader";
import path from "path";
import React from "react";
import { GetUploadUrl } from "@/utils/GetMediaUploadUrl";
import { useChatStore } from "@/contexts/ChatContext";

// Upload status tracking
const uploadStatusMap = new Map<
  string,
  {
    status: "idle" | "uploading" | "completed" | "error";
    result?: Attachment;
  }
>();

interface MessageMediaPreviewProps extends MessageMediaPreViewProps {}

const MessageMediaPreview = React.memo(
  ({ file: item, index }: MessageMediaPreviewProps) => {
    const [progress, setProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<
      "idle" | "uploading" | "completed" | "error"
    >("idle");
    const removeMediaFile = useChatStore((state) => state.removeMediaFile);
    const { user } = useUserAuthContext();
    const fileKey = item.id;
    const lastStatusRef = useRef(uploadStatus);

    // Progress and error helpers
    const updateProgress = useCallback(
      (
        progressObj:
          | { [key: string]: number }
          | ((prev: { [key: string]: number }) => { [key: string]: number })
      ) => {
        if (typeof progressObj === "function") {
          const newProgress = progressObj({});
          const value = newProgress[item.previewUrl];
          if (value !== undefined) {
            setProgress(value);
          }
        } else {
          const value = progressObj[item.previewUrl];
          if (value !== undefined) {
            setProgress(value);
          }
        }
      },
      [item.previewUrl]
    );

    const updateError = useCallback(
      (
        errorState:
          | { [key: string]: boolean }
          | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })
      ) => {
        if (typeof errorState === "function") {
          const newErrorState = errorState({});
          const hasError = newErrorState[item.previewUrl];
          if (hasError !== undefined) {
            setUploadStatus(hasError ? "error" : "idle");
          }
        } else {
          const hasError = errorState[item.previewUrl];
          if (hasError !== undefined) {
            setUploadStatus(hasError ? "error" : "idle");
          }
        }
      },
      [item.previewUrl]
    );

    // Upload logic
    useEffect(() => {
      let cancelled = false;
      const existingStatus = uploadStatusMap.get(fileKey);

      if (existingStatus) {
        setUploadStatus(existingStatus.status);
        if (existingStatus.status === "completed") {
          setProgress(100);
          // if (existingStatus.result && onUploadComplete) {
          //   onUploadComplete(existingStatus.result);
          // }
        }
      } else {
        (async () => {
          if (cancelled) return;
          try {
            uploadStatusMap.set(fileKey, { status: "uploading" });
            setUploadStatus("uploading");
            // onUploadStatusChange?.("uploading");

            const upload = await GetUploadUrl(item.file, {
              username: user?.username || "unknown",
            });

            let result: Attachment | null = null;

            // if (item.type === "image" && upload.type.includes("image")) {
            //   const imgRes = await UploadImageToCloudflare({
            //     file: item.file,
            //     id: item.previewUrl,
            //     uploadUrl: upload.uploadUrl,
            //     setProgress: updateProgress,
            //     setUploadError: updateError,
            //   });

            //   result = {
            //     url: imgRes.result?.variants.find((v: string) =>
            //       v.includes("/public")
            //     ),
            //     id: imgRes.result?.id,
            //     poster: "",
            //     name: imgRes.result?.id,
            //     type: "image",
            //     extension: path.extname(item.file.name),
            //     size: item.file.size,
            //   };
            // } else if (item.type === "video" && upload.type.includes("video")) {
            //   const mediaId = await UploadWithTus(
            //     item.file,
            //     upload.uploadUrl,
            //     item.previewUrl,
            //     updateProgress,
            //     updateError
            //   );

            //   result = {
            //     url: `${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN}${mediaId}/manifest/video.m3u8`,
            //     type: "video",
            //     id: mediaId,
            //     poster: "",
            //     name: mediaId,
            //     extension: path.extname(item.file.name),
            //     size: item.file.size,
            //   };
            // }

            if (!cancelled && result) {
              uploadStatusMap.set(fileKey, { status: "completed", result });
              setUploadStatus("completed");
              setProgress(100);
              // onUploadStatusChange?.("completed");
              // if (onUploadComplete) onUploadComplete(result);
            }
          } catch (err) {
            if (!cancelled) {
              console.error("Error uploading file:", err);
              uploadStatusMap.set(fileKey, { status: "error" });
              setUploadStatus("error");
              // onUploadStatusChange?.("error");
            }
          }
        })();
      }

      return () => {
        cancelled = true;
        if (
          uploadStatusMap.get(fileKey)?.status !== "completed" &&
          uploadStatusMap.get(fileKey)?.status !== "error"
        ) {
          uploadStatusMap.delete(fileKey);
        }
      };
    }, [fileKey, item, updateProgress, updateError, user?.username]);

    // Notify parent of status changes
    useEffect(() => {
      // if (onUploadStatusChange && lastStatusRef.current !== uploadStatus) {
      //   onUploadStatusChange(uploadStatus);
      //   lastStatusRef.current = uploadStatus;
      // }
    }, [
      uploadStatus,
      // onUploadStatusChange
    ]);

    const handleRemove = () => {
      uploadStatusMap.delete(fileKey);
      removeMediaFile(item.id);
    };

    if (!item.id) {
      return (
        <div className="relative w-full aspect-square bg-gray-200 text-gray-500 flex items-center justify-center">
          <p>Invalid preview</p>
          <button
            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 transition-colors rounded-full p-1 shadow"
            onClick={handleRemove}
            aria-label="Remove media"
          >
            <X size={14} stroke="#fff" />
          </button>
        </div>
      );
    }

    if (uploadStatus === "error") {
      return (
        <div className="relative w-full aspect-square bg-red-500 text-white flex items-center justify-center">
          <p>Error uploading file</p>
          <button
            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 transition-colors rounded-full p-1 shadow"
            onClick={handleRemove}
            aria-label="Remove media"
          >
            <X size={14} stroke="#fff" />
          </button>
        </div>
      );
    }

    return (
      <div className="relative w-full aspect-square">
        <button
          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 transition-colors rounded-full p-1 shadow z-10"
          onClick={handleRemove}
          aria-label="Remove media"
        >
          <X size={14} stroke="#fff" />
        </button>

        <MessageInputAttachmentPreview
          previewUrl={item.previewUrl}
          type={item.type}
          posterUrl={item.posterUrl}
        />

        {uploadStatus === "uploading" && progress < 100 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
            <div className="text-white text-center">
              <div className="text-lg font-semibold">
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

MessageMediaPreview.displayName = "MessageMediaPreview";

export default MessageMediaPreview;
