"use client";
import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { useUserAuthContext } from "@/lib/userUseContext";
import { Attachment, MessageBubbleProps } from "@/types/components";
import { getSocket } from "./sub/socket";
import MessageBubbleContent from "./message-bubble-content";

const MessageBubble: React.FC<MessageBubbleProps> = ({
  receiver,
  sender,
  seen,
  message,
  date,
  attachment = [],
  conversationId,
  rawFiles = [],
  triggerSend,
}) => {
  const { user } = useUserAuthContext();
  const isSender = sender === user?.user_id;
  const hasAttachments = attachment && attachment.length > 0 ? true : false;
  const hasRawFiles = rawFiles.length > 0;
  const hasMessage = Boolean(message?.message?.trim());

  // Format date string for chat bubble
  const dateString = useMemo(() => {
    const now = new Date();
    const inputDate = new Date(date);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (inputDate < yesterday) {
      // Older than 1 day: full date + time
      return inputDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    }
    // Within the last 1 day: only time
    return inputDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }, [date]);

  // Prevent duplicate socket sends for the same message
  const sentRef = useRef(false);
  const socket = getSocket();
  const handleSendSocketMessage = useCallback(
    (attachments?: Attachment[]) => {
      if (sentRef.current) return;
      sentRef.current = true;
      socket.emit("new-message", {
        id: message?.id,
        message_id: message?.message_id,
        message: message?.message,
        sender_id: message?.sender_id,
        attachment: attachments ?? [],
        seen: false,
        created_at: new Date().toISOString(),
        receiver_id: receiver?.user_id,
        conversationId,
        date: message?.created_at,
      });
    },
    [message, receiver?.user_id, conversationId]
  );

  // // Handle triggerSend for text-only messages
  // useEffect(() => {
  //   if (triggerSend && !rawFiles.length) {
  //     handleSendSocketMessage([]);
  //   }
  // }, [triggerSend, rawFiles, handleSendSocketMessage]);

  // Bubble content with time & seen
  const Bubble = (
    <div className="max-w-[85%] md:max-w-[60%]">
      <MessageBubbleContent
        isSender={isSender}
        SendSocketMessage={handleSendSocketMessage}
        hasAttachments={hasAttachments}
        hasMessage={hasMessage}
        hasRawFiles={hasRawFiles}
        rawFiles={rawFiles}
        attachment={attachment}
        message={message?.message?.trim() || ""}
      />
      <small
        className={`text-xs mt-2 flex items-center dark:text-gray-200 ${
          isSender ? "pt-1 float-right" : ""
        }`}
      >
        {dateString}
        {isSender && (
          <span
            className={`ml-2 h-3 w-3 rounded-3xl ${
              seen ? "bg-primary-dark-pink" : "bg-gray-300"
            }`}
            aria-label={seen ? "Seen" : "Not seen"}
          />
        )}
      </small>
    </div>
  );

  return (
    <div
      className={`flex items-center w-full ${
        isSender ? "justify-end" : "justify-start"
      }`}
    >
      {Bubble}
    </div>
  );
};

export default MessageBubble;
