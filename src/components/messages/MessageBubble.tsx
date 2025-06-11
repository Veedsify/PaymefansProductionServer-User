"use client";
import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { Attachment, MessageBubbleProps } from "@/types/Components";
import { getSocket } from "../sub_components/sub/Socket";
import MessageBubbleContent from "./MessageBubbleContent";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

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
  const { ref, inView } = useInView({ threshold: 1, triggerOnce: true });

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
  const socket = getSocket();

  // // Handle triggerSend for text-only messages
  useEffect(() => {
    function sendMessageSeen() {
      if (!message) return;
      if (seen && !inView) return;
      if (message.sender_id === user?.user_id) return;
      socket.emit("message-seen", {
        conversationId,
        lastMessageId: message?.message_id,
        userId: user?.user_id,
        receiver_id: receiver?.user_id,
      });
    }
    sendMessageSeen();
  }, [
    message,
    conversationId,
    seen,
    user?.user_id,
    receiver?.user_id,
    socket,
    inView,
  ]);

  // Bubble content with time & seen
  const Bubble = (
    <div className="max-w-[85%] md:max-w-[60%] " ref={ref}>
      <MessageBubbleContent
        isSender={isSender}
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
    <motion.div
      initial={{ opacity: 0, x: isSender ? 50 : -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`flex items-center w-full ${
        isSender ? "justify-end" : "justify-start"
      }`}
    >
      {Bubble}
    </motion.div>
  );
};

export default MessageBubble;
