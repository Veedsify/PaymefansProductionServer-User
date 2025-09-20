"use client";

import { X } from "lucide-react";
import React from "react";
import { useChatStore } from "@/contexts/ChatContext";
import type { MediaFile } from "@/types/Components";
import MessageInputAttachmentPreview from "./MessageInputAttachmentPreview";

interface MessageMediaPreviewProps {
  index: number;
  file: MediaFile;
}

const MessageMediaPreview = React.memo(
  ({ file: item, index }: MessageMediaPreviewProps) => {
    const removeMediaFile = useChatStore((state) => state.removeMediaFile);

    // Get upload status from the media file itself
    const uploadStatus = item.uploadStatus || "idle";
    const progress = item.uploadProgress || 0;

    const handleRemove = () => {
      removeMediaFile(item.id);
    };

    if (!item.id) {
      return (
        <div className="relative flex items-center justify-center w-full text-gray-500 bg-gray-200 aspect-square">
          <p>Invalid preview</p>
          <button
            className="absolute p-1 bg-red-500 rounded-full shadow top-1 right-1 hover:bg-red-600 transition-colors"
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
        <div className="relative flex items-center justify-center w-full text-white bg-red-500 aspect-square">
          <p>Error uploading file</p>
          <button
            className="absolute p-1 bg-red-600 rounded-full shadow top-1 right-1 hover:bg-red-700 transition-colors"
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
          className="absolute z-10 p-1 bg-red-500 rounded-full shadow top-1 right-1 hover:bg-red-600 transition-colors"
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

        {uploadStatus === "uploading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
            <div className="text-center text-white">
              <div className="text-lg font-semibold">
                {Math.round(progress)}%
              </div>
              <div className="hidden text-sm lg:block">Uploading...</div>
            </div>
          </div>
        )}

        {uploadStatus === "completed" && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-600/60 rounded-xl">
            <div className="text-center text-white">
              <div className="text-lg font-semibold">✓</div>
              <div className="text-sm">Uploaded</div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

MessageMediaPreview.displayName = "MessageMediaPreview";

export default MessageMediaPreview;
