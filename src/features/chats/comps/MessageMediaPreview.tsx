"use client";

import { X, AlertCircle } from "lucide-react";
import React from "react";
import { useChatStore } from "@/contexts/ChatContext";
import type { MediaFile } from "@/types/Components";
import MessageInputAttachmentPreview from "./MessageInputAttachmentPreview";

interface MessageMediaPreviewProps {
  index: number;
  file: MediaFile;
}

const MessageMediaPreview = React.memo(
  ({
    file: item,
    index,
    onRemove,
  }: MessageMediaPreviewProps & { onRemove?: (id: string) => void }) => {
    const removeMediaFile = useChatStore((state) => state.removeMediaFile);

    // Get upload status from the media file itself
    const uploadStatus = item.uploadStatus || "idle";
    const progress = item.uploadProgress || 0;

    const handleRemove = () => {
      // Use custom onRemove if provided (for local state), otherwise use global store
      if (onRemove) {
        onRemove(item.id);
      } else {
        removeMediaFile(item.id);
      }
    };

    if (!item.id) {
      return (
        <div className="relative flex items-center justify-center w-full text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center px-1">
            <AlertCircle className="w-5 h-5 mx-auto mb-1 text-gray-400" />
            <p className="text-[9px]">Invalid</p>
          </div>
          <button
            className="absolute z-10 p-1 bg-red-500 rounded-full shadow-lg top-1 right-1 hover:bg-red-600 hover:scale-110 transition-all duration-200"
            onClick={handleRemove}
            aria-label="Remove media"
          >
            <X size={10} stroke="#fff" strokeWidth={3} />
          </button>
        </div>
      );
    }

    if (uploadStatus === "error") {
      return (
        <div className="relative flex items-center justify-center w-full overflow-hidden text-white bg-gradient-to-br from-red-500 to-red-600 aspect-square rounded-lg border-2 border-red-400 shadow-md">
          <div className="text-center px-1 animate-in fade-in duration-300">
            <AlertCircle className="w-6 h-6 mx-auto mb-1 animate-pulse" />
            <p className="text-[9px] font-medium">Failed</p>
          </div>
          <button
            className="absolute z-10 p-1 bg-white/20 backdrop-blur-sm rounded-full shadow-lg top-1 right-1 hover:bg-white/30 hover:scale-110 transition-all duration-200"
            onClick={handleRemove}
            aria-label="Remove media"
          >
            <X size={10} stroke="#fff" strokeWidth={3} />
          </button>
        </div>
      );
    }

    return (
      <div className="relative w-full aspect-square group">
        <button
          className="absolute z-10 p-1 bg-red-500/90 backdrop-blur-sm rounded-full shadow-lg top-1 right-1 hover:bg-red-600 hover:scale-110 opacity-80 group-hover:opacity-100 transition-all duration-200"
          onClick={handleRemove}
          aria-label="Remove media"
        >
          <X size={10} stroke="#fff" strokeWidth={3} />
        </button>

        <div className="relative w-full h-full overflow-hidden rounded-lg ring-1 ring-black/10 dark:ring-white/10">
          <MessageInputAttachmentPreview
            previewUrl={item.previewUrl}
            type={item.type}
            posterUrl={item.posterUrl}
          />

          {/* Uploading State - Minimalist Progress Ring */}
          {uploadStatus === "uploading" && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Background Circle */}
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      className="text-white/20"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 20 * (1 - progress / 100)
                      }`}
                      className="text-purple-400 transition-all duration-300 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Centered Progress Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white drop-shadow-lg">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Processing State - Animated Spinner */}
          {uploadStatus === "processing" && (
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/90 to-amber-600/90 backdrop-blur-sm">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Spinning Ring */}
                  <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  {/* Inner Pulse */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white/40 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
              {/* Animated Dots Indicator */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
              </div>
            </div>
          )}

          {/* Completed State - Success Checkmark */}
          {uploadStatus === "completed" && (
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/85 to-emerald-600/85 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Checkmark SVG */}
                <svg
                  className="w-10 h-10 text-white drop-shadow-lg animate-in zoom-in duration-500 [animation-delay:100ms]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

MessageMediaPreview.displayName = "MessageMediaPreview";

export default MessageMediaPreview;
