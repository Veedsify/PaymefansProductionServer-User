"use client";

import React, { useCallback, useRef, useState } from "react";
import { LucideLoader } from "lucide-react";

interface MessageTextAreaProps {
  message: string;
  setMessage: (message: string) => void;
  onSend: () => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export const MessageTextArea: React.FC<MessageTextAreaProps> = ({
  message,
  setMessage,
  onSend,
  onTyping,
  disabled = false,
  placeholder = "Type a message...",
  maxLength = 1000,
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;

      if (value.length > maxLength) {
        return; // Don't update if exceeding max length
      }

      setMessage(value);

      // Handle typing indicator
      if (!isTyping && value.trim()) {
        setIsTyping(true);
        onTyping(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 1000);
    },
    [setMessage, onTyping, isTyping, maxLength]
  );

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (message.trim() && !disabled) {
          onSend();
        }
      }
    },
    [message, onSend, disabled]
  );

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  // Adjust height when message changes
  React.useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  // Cleanup typing timeout on unmount
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex-1">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className={`
          w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12
          text-sm placeholder-gray-500 focus:border-primary-dark-pink focus:outline-none
          disabled:bg-gray-100 disabled:cursor-not-allowed
          dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400
          dark:focus:border-primary-dark-pink
        `}
        style={{ minHeight: "48px", maxHeight: "120px" }}
      />

      {/* Character count */}
      {maxLength && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {message.length}/{maxLength}
        </div>
      )}

      {/* Loading indicator */}
      {isTyping && (
        <div className="absolute top-2 right-2">
          <LucideLoader className="h-4 w-4 animate-spin text-primary-dark-pink" />
        </div>
      )}
    </div>
  );
};

export default MessageTextArea;
