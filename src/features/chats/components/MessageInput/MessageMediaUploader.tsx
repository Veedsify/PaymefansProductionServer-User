"use client";

import React, { useCallback, useRef } from "react";
import { LucideCamera, LucideX, LucideLoader } from "lucide-react";
import { useMessageUpload } from "../../hooks/useMessageUpload";
import MessageMediaPreview from "../MessageMediaPreview";

interface MessageMediaUploaderProps {
  onFilesChange: (files: any[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export const MessageMediaUploader: React.FC<MessageMediaUploaderProps> = ({
  onFilesChange,
  disabled = false,
  maxFiles = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    messageMediaFiles,
    isUploadingMedia,
    uploadProgress,
    areUploadsComplete,
    hasUploadErrors,
    handleFileSelect,
    removeFile,
    getCompletedAttachments,
  } = useMessageUpload();

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        // Check file limit
        if (messageMediaFiles.length + files.length > maxFiles) {
          alert(`Maximum ${maxFiles} files allowed`);
          return;
        }

        handleFileSelect(files);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFileSelect, messageMediaFiles.length, maxFiles]
  );

  // Open file picker
  const openFilePicker = useCallback(() => {
    if (disabled || isUploadingMedia) return;
    fileInputRef.current?.click();
  }, [disabled, isUploadingMedia]);

  // Remove file
  const handleRemoveFile = useCallback(
    (fileId: string) => {
      removeFile(fileId);
    },
    [removeFile]
  );

  // Update parent when files change
  React.useEffect(() => {
    const completedAttachments = getCompletedAttachments();
    onFilesChange(completedAttachments);
  }, [messageMediaFiles, getCompletedAttachments, onFilesChange]);

  return (
    <div className="space-y-3">
      {/* File input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload button */}
      <button
        type="button"
        onClick={openFilePicker}
        disabled={disabled || isUploadingMedia}
        className={`
          flex items-center justify-center w-10 h-10 rounded-full border-2 border-dashed
          transition-colors duration-200
          ${
            disabled || isUploadingMedia
              ? "border-gray-300 text-gray-400 cursor-not-allowed"
              : "border-primary-dark-pink text-primary-dark-pink hover:bg-primary-dark-pink hover:text-white"
          }
          dark:border-gray-600 dark:text-gray-400
        `}
      >
        {isUploadingMedia ? (
          <LucideLoader className="h-5 w-5 animate-spin" />
        ) : (
          <LucideCamera className="h-5 w-5" />
        )}
      </button>

      {/* Upload progress */}
      {isUploadingMedia && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Uploading... {uploadProgress.percentage}% ({uploadProgress.completed}/
          {uploadProgress.total})
        </div>
      )}

      {/* Error state */}
      {hasUploadErrors && (
        <div className="text-xs text-red-500">
          Some files failed to upload. Please try again.
        </div>
      )}

      {/* Media previews */}
      {messageMediaFiles.length > 0 && (
        <div className="space-y-2">
          {messageMediaFiles.map((file) => (
            <div key={file.id} className="relative">
              <MessageMediaPreview
                file={file}
                onRemove={() => handleRemoveFile(file.id)}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload status */}
      {messageMediaFiles.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{areUploadsComplete ? "Ready to send" : "Uploading..."}</span>
          <span>
            {messageMediaFiles.length}/{maxFiles} files
          </span>
        </div>
      )}
    </div>
  );
};

export default MessageMediaUploader;
