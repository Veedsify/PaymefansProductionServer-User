"use client";
// Removed framer-motion import to reduce bundle size
import type React from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { useAuthContext } from "@/contexts/UserUseContext";
import { formatDate } from "@/lib/FormatDate";
import { Attachment, type MessageBubbleProps } from "@/types/Components";
import { getSocket } from "../../../components/common/Socket";
import MessageBubbleContent from "./MessageBubbleContent";
import StoryReplyPreview from "./StoryReplyPreview";

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
  const { user } = useAuthContext();
  const isSender = sender === user?.user_id;
  const hasAttachments = attachment && attachment.length > 0 ? true : false;
  const hasRawFiles = rawFiles.length > 0;
  const hasMessage = Boolean(message?.message?.trim());
  const hasStoryReply = Boolean(message?.story_reply);
  const { ref, inView } = useInView({ threshold: 1, triggerOnce: true });

  // Prevent duplicate socket sends for the same message
  const socket = getSocket();

  // // Handle triggerSend for text-only messages
  useEffect(() => {
    function sendMessageSeen() {
      if (!message) return;
      if (seen && !inView) return;
      if (message.sender_id === user?.user_id) return;
      socket?.emit("message-seen", {
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

  const handleStoryClick = useCallback(() => {
    if (message?.story_reply) {
      // Create story data structure that matches StatusModal expectations
      const storyData = {
        id: 1,
        story_id: message.story_reply.story_media_id,
        user_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: 1,
          username: message.story_reply.story_owner_username,
          profile_image: message.story_reply.story_owner_profile_image,
          bio: null,
          name: message.story_reply.story_owner_username,
          LiveStream: [],
          Follow: [],
          Subscribers: [],
          role: "fan",
        },
        StoryMedia: [
          {
            id: 1,
            media_id: message.story_reply.story_media_id,
            media_type: message.story_reply.story_type,
            filename: "",
            duration: 5000,
            caption: "",
            captionElements: "[]",
            story_content: null,
            media_url: message.story_reply.story_preview_url,
            user_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: {
              id: 1,
              username: message.story_reply.story_owner_username,
              profile_image: message.story_reply.story_owner_profile_image,
              bio: null,
              name: message.story_reply.story_owner_username,
              LiveStream: [],
              Follow: [],
              Subscribers: [],
              role: "fan",
            },
          },
        ],
      };

      // openStoryModal([storyData]);
      console.log("Story reply clicked:", message.story_reply);
    }
  }, [message?.story_reply]);

  // Bubble content with time & seen
  const Bubble = (
    <div className="max-w-[85%] md:max-w-[60%] " ref={ref}>
      {/* Story Reply Preview */}
      {message?.story_reply && (
        <StoryReplyPreview
          storyReply={message.story_reply}
          onStoryClick={handleStoryClick}
        />
      )}

      <MessageBubbleContent
        isSender={isSender}
        hasAttachments={hasAttachments}
        hasMessage={hasMessage}
        hasRawFiles={hasRawFiles && isSender}
        rawFiles={isSender ? rawFiles : []}
        attachment={attachment}
        message={message?.message?.trim() || ""}
      />
      <small
        className={`text-xs mt-2 flex items-center dark:text-gray-200 ${
          isSender ? "pt-1 float-right" : ""
        }`}
      >
        {formatDate(date)}
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
      className={`flex items-center w-full animate-in slide-in-from-right-4 fade-in duration-300 ${
        isSender ? "justify-end" : "justify-start"
      }`}
    >
      {Bubble}
    </div>
  );
};

export default MessageBubble;
