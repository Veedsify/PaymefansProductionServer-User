"use client";

import { MessageMediaPreViewProps } from "@/types/MessageComponents";
import MessageInputAttachmentPreview from "./MessageInputAttachmentPreview";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { getToken } from "@/utils/Cookie";
import axios from "axios";
import { UploadResponseResponse, Attachment } from "@/types/Components";
import { getMaxDurationBase64 } from "@/utils/GetVideoMaxDuration";
import { useUserAuthContext } from "@/lib/UserUseContext";
import UploadImageToCloudflare from "@/utils/CloudflareImageUploader";
import UploadWithTus from "@/utils/TusUploader";
import path from "path";
import React from "react";

// Upload status tracking
const uploadStatusMap = new Map<
  string,
  {
    status: "idle" | "uploading" | "completed" | "error";
    result?: Attachment;
  }
>();

const token = getToken();

const GetUploadUrl = async (
  file: File,
  user: { username: string }
): Promise<UploadResponseResponse> => {
  if (!file) throw new Error("File is not defined");
  const isVideo = file.type.startsWith("video/");
  const maxVideoDuration = isVideo ? await getMaxDurationBase64(file) : null;
  const payload: any = {
    type: isVideo ? "video" : "image",
    fileName: btoa(`paymefans-attachment-${user?.username}-${Date.now()}`),
    fileSize: file.size,
    fileType: btoa(file.type),
    explicitImageType: file.type,
  };
  if (isVideo && maxVideoDuration) payload.maxDuration = maxVideoDuration;

  try {
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
    if (response.data.error) {
      throw new Error(response.data.message || "Failed to get upload URL");
    }
    return response.data as UploadResponseResponse;
  } catch (error) {
    console.error("Error getting upload URL:", error);
    throw new Error("Failed to get upload URL. Please try again.");
  }
};

interface MessageMediaPreviewProps extends MessageMediaPreViewProps {
  onUploadComplete?: (data: Attachment) => void;
  onUploadStatusChange?: (
    status: "idle" | "uploading" | "completed" | "error"
  ) => void;
}

const MessageMediaPreview = React.memo(
  ({
    file: item,
    removeFile,
    index,
    onUploadComplete,
    onUploadStatusChange,
  }: MessageMediaPreviewProps) => {
    const [progress, setProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<
      "idle" | "uploading" | "completed" | "error"
    >("idle");
    const { user } = useUserAuthContext();
    const fileKey = item.previewUrl;
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
          if (existingStatus.result && onUploadComplete) {
            onUploadComplete(existingStatus.result);
          }
        }
      } else {
        (async () => {
          if (cancelled) return;
          try {
            uploadStatusMap.set(fileKey, { status: "uploading" });
            setUploadStatus("uploading");
            onUploadStatusChange?.("uploading");

            const upload = await GetUploadUrl(item.file, {
              username: user?.username || "unknown",
            });

            let result: Attachment | null = null;

            if (item.type === "image" && upload.type.includes("image")) {
              const imgRes = await UploadImageToCloudflare({
                file: item.file,
                id: item.previewUrl,
                uploadUrl: upload.uploadUrl,
                setProgress: updateProgress,
                setUploadError: updateError,
              });

              result = {
                url: imgRes.result?.variants.find((v: string) =>
                  v.includes("/public")
                ),
                id: imgRes.result?.id,
                poster: "",
                name: imgRes.result?.id,
                type: "image",
                extension: path.extname(item.file.name),
                size: item.file.size,
              };
            } else if (item.type === "video" && upload.type.includes("video")) {
              const mediaId = await UploadWithTus(
                item.file,
                upload.uploadUrl,
                item.previewUrl,
                updateProgress,
                updateError
              );

              result = {
                url: `${process.env.NEXT_PUBLIC_CLOUDFLARE_CUSTOMER_SUBDOMAIN}${mediaId}/manifest/video.m3u8`,
                type: "video",
                id: mediaId,
                poster: "",
                name: mediaId,
                extension: path.extname(item.file.name),
                size: item.file.size,
              };
            }

            if (!cancelled && result) {
              uploadStatusMap.set(fileKey, { status: "completed", result });
              setUploadStatus("completed");
              setProgress(100);
              onUploadStatusChange?.("completed");
              if (onUploadComplete) onUploadComplete(result);
            }
          } catch (err) {
            if (!cancelled) {
              console.error("Error uploading file:", err);
              uploadStatusMap.set(fileKey, { status: "error" });
              setUploadStatus("error");
              onUploadStatusChange?.("error");
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
    }, [
      fileKey,
      item,
      onUploadComplete,
      updateProgress,
      updateError,
      user?.username,
      onUploadStatusChange,
    ]);

    // Notify parent of status changes
    useEffect(() => {
      if (onUploadStatusChange && lastStatusRef.current !== uploadStatus) {
        onUploadStatusChange(uploadStatus);
        lastStatusRef.current = uploadStatus;
      }
    }, [uploadStatus, onUploadStatusChange]);

    const handleRemove = () => {
      uploadStatusMap.delete(fileKey);
      removeFile(index ?? 0, item.previewUrl);
    };

    if (!item.previewUrl) {
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

export default MessageMediaPreview;
