"use client";

import React, { useCallback, useRef } from "react";
import { Upload } from "lucide-react";
import type { MessageType } from "../../types";

interface MessageMediaUploadProps {
  type: MessageType;
  onFileUpload: (type: MessageType) => void;
  disabled?: boolean;
}

const MessageMediaUpload: React.FC<MessageMediaUploadProps> = ({
  type,
  onFileUpload,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(() => {
    if (!disabled) {
      onFileUpload(type);
    }
  }, [type, onFileUpload, disabled]);

  const handleFileInputClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  return (
    <>
      <button
        onClick={handleFileInputClick}
        disabled={disabled}
        className={`flex items-center px-4 py-2 text-sm border border-gray-300 rounded-lg gap-2 transition-colors ${
          disabled
            ? "border-gray-200 text-gray-400 cursor-not-allowed dark:border-gray-600 dark:text-gray-500"
            : "hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500"
        }`}
      >
        <Upload size={16} />
        Attach File
      </button>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        onChange={() => {}} // This will be handled by the parent component
      />
    </>
  );
};

export default MessageMediaUpload;
