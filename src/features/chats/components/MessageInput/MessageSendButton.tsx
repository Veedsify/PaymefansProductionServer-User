"use client";

import React from "react";
import { LucideSendHorizonal, LucideLoader } from "lucide-react";

interface MessageSendButtonProps {
  onSend: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  hasContent?: boolean;
  hasMedia?: boolean;
  className?: string;
}

export const MessageSendButton: React.FC<MessageSendButtonProps> = ({
  onSend,
  disabled = false,
  isLoading = false,
  hasContent = false,
  hasMedia = false,
  className = "",
}) => {
  const canSend = hasContent || hasMedia;
  const isDisabled = disabled || isLoading || !canSend;

  return (
    <button
      type="button"
      onClick={onSend}
      disabled={isDisabled}
      className={`
        flex items-center justify-center w-10 h-10 rounded-full
        transition-all duration-200 transform
        ${
          isDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
            : "bg-primary-dark-pink text-white hover:bg-primary-pink hover:scale-105 active:scale-95"
        }
        ${className}
      `}
      aria-label="Send message"
    >
      {isLoading ? (
        <LucideLoader className="h-5 w-5 animate-spin" />
      ) : (
        <LucideSendHorizonal className="h-5 w-5" />
      )}
    </button>
  );
};

export default MessageSendButton;
