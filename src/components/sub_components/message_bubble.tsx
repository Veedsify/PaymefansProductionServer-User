"use client";
import { useUserAuthContext } from "@/lib/userUseContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { Attachment, MessageBubbleProps } from "@/types/components";
import { socket } from "./sub/socket";
import MessageBubbleContent from "./message-bubble-content";

const server = process.env.NEXT_PUBLIC_TS_EXPRESS_URL_DIRECT as string;

const MessageBubble: React.FC<MessageBubbleProps> = ({
  receiver,
  sender,
  seen,
  message,
  date,
  attachment,
  conversationId,
  rawFiles,
  triggerSend,
}) => {
  const { user } = useUserAuthContext();

  const isSender = sender === user?.user_id;
  const hasAttachments = attachment && attachment.length > 0;
  const hasRawFiles = rawFiles && rawFiles.length > 0;
  const hasMessage = message && message.message.trim().length > 0;

  // Memoize formatted date string
  const dateString = useMemo(() => {
    const now = new Date();
    const inputDate = new Date(date);
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(now.getDate() - 1); // Subtract 1 days from today

    if (inputDate < oneDayAgo) {
      // Older than 1 days: Show full date + time (e.g., "Apr 5, 2024, 3:30 PM")
      return inputDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } else {
      // Within the last 2 days: Show only time (e.g., "3:30 PM")
      return inputDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    }
  }, [date]);


  const sentRef = useRef(false); // Use a ref to persist the sent state across renders

  function SendSocketMessage(attachment?: Attachment[]) {
    if (sentRef.current) return;  // Prevent sending if already sent
  
    sentRef.current = true;  // Set the flag to true once the message is sent
  
    socket.emit("new-message", {
      id: message?.id,
      message_id: message?.message_id,
      message: message?.message,
      sender_id: message?.sender_id,
      attachment: attachment && attachment.length > 0 ? attachment : [],
      seen: false,
      created_at: new Date().toISOString(),
      receiver_id: receiver?.user_id,
      conversationId,
      date: message?.created_at,
    });
  }
  
  useEffect(() => {
    function HandleMessageSend() {
      console.log("triggerSend:", triggerSend);
      console.log("rawFiles:", rawFiles);
      if (triggerSend && rawFiles?.length === 0) {
        SendSocketMessage([]);  // Send socket message
      }
    }
  
    HandleMessageSend();
  }, [rawFiles, triggerSend]);

  return (
    <div className="flex items-center">
      {isSender ? (
        <div className="ml-auto max-w-[85%] md:max-w-[60%]">
          <MessageBubbleContent
            isSender={isSender}
            hasAttachments={hasAttachments as boolean}
            hasMessage={hasMessage as boolean}
            hasRawFiles={hasRawFiles as boolean}
            rawFiles={rawFiles}
            attachment={attachment as Attachment[]}
            message={message?.message.trim() as string}
          />
          <small className="text-xs mt-2 pt-1 float-right flex dark:text-gray-200 items-center">
            {dateString}
            <span
              className={`ml-2 h-3 w-3 rounded-3xl ${
                seen ? "bg-primary-dark-pink" : "bg-gray-300"
              }`}
            />
          </small>
        </div>
      ) : (
        <div className="max-w-[85%] md:max-w-[60%]">
          <MessageBubbleContent
            isSender={isSender}
            hasAttachments={hasAttachments as boolean}
            hasMessage={hasMessage as boolean}
            hasRawFiles={hasRawFiles as boolean}
            rawFiles={rawFiles}
            attachment={attachment as Attachment[]}
            message={message?.message.trim() as string}
          />
          <small className="text-xs mt-2 flex items-center dark:text-gray-200">
            {dateString}
          </small>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
