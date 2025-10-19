"use client";

import React, { useCallback, useState } from "react";
import MessageTextArea from "./MessageTextArea";
import MessageMediaUploader from "./MessageMediaUploader";
import MessageSendButton from "./MessageSendButton";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

interface MessageInputProps {
  receiver: any;
  conversationId: string;
  isFirstMessage: boolean;
  isBlockedByReceiver?: boolean;
}

export const MessageInputContainer: React.FC<MessageInputProps> = ({
  receiver,
  conversationId,
  isFirstMessage,
  isBlockedByReceiver = false,
}) => {
  const [message, setMessage] = useState<string>("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file changes
  const handleFilesChange = useCallback((files: any[]) => {
    setAttachments(files);
  }, []);

  // Handle typing indicator
  const handleTyping = useCallback((isTyping: boolean) => {
    // This would be handled by the socket hook
  }, []);

  // Handle send message
  const handleSend = useCallback(async () => {
    if (!message.trim() && attachments.length === 0) return;
    if (isBlockedByReceiver) return;

    setIsSending(true);
    setError(null);

    try {
      // TODO: Implement actual message sending logic
      console.log("Sending message:", { message, attachments, conversationId });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage("");
      setAttachments([]);
    } catch (error: any) {
      console.error("Send message error:", error);
      setError(error.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  }, [message, attachments, isBlockedByReceiver]);

  const isLoading = isSending;
  const hasContent = message.trim().length > 0;
  const hasMedia = attachments.length > 0;
  const canSend =
    (hasContent || hasMedia) && !isBlockedByReceiver && !isLoading;

  if (isBlockedByReceiver) {
    return (
      <div className="flex items-center justify-center p-4 text-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          You cannot send messages to this user
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Error message */}
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}

      {/* Main input area */}
      <div className="flex items-end space-x-3">
        {/* Media uploader */}
        <MessageMediaUploader
          onFilesChange={handleFilesChange}
          disabled={isLoading}
          maxFiles={5}
        />

        {/* Text input */}
        <div className="flex-1">
          <MessageTextArea
            message={message}
            setMessage={setMessage}
            onSend={handleSend}
            onTyping={handleTyping}
            disabled={isLoading}
            placeholder="Type a message..."
            maxLength={1000}
          />
        </div>

        {/* Send button */}
        <MessageSendButton
          onSend={handleSend}
          disabled={!canSend}
          isLoading={isLoading}
          hasContent={hasContent}
          hasMedia={hasMedia}
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-2">
          <LoadingSpinner size="sm" text="Sending message..." />
        </div>
      )}

      {/* Character count */}
      {message.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          {message.length}/1000 characters
        </div>
      )}
    </div>
  );
};

export default MessageInputContainer;
