"use client";

import React from "react";
import { LucideChevronUp } from "lucide-react";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

// Dynamic imports for better performance
const MessageBubble = dynamic(() => import("../comps/MessageBubble"), {
  ssr: true,
});

interface ChatMessageListProps {
  messages: any[];
  receiver: any;
  conversationId: string;
  hasMore: boolean;
  loading: boolean;
  highlightedMessageId: string | null;
  isSearchingMessage: boolean;
  onLoadMore: () => void;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  receiver,
  conversationId,
  hasMore,
  loading,
  highlightedMessageId,
  isSearchingMessage,
  onLoadMore,
  messagesContainerRef,
  onScroll,
}) => {
  return (
    <div
      className="flex-1 max-h-[calc(100dvh-230px)] p-4 space-y-4 overflow-y-auto overflow-x-hidden bg-white dark:bg-black"
      ref={messagesContainerRef}
      onScroll={onScroll}
    >
      {/* Search indicator */}
      {isSearchingMessage && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center text-sm text-gray-500 gap-2 dark:text-gray-400">
            <LoadingSpinner text="Searching for message..." />
          </div>
        </div>
      )}

      {/* Load more button */}
      {hasMore && (
        <div className="flex items-center justify-center mb-2">
          <button
            disabled={loading}
            onClick={onLoadMore}
            className="flex items-center justify-center rounded-full cursor-pointer h-7 w-7 aspect-square bg-primary-dark-pink"
          >
            {loading ? (
              <LoadingSpinner className="text-white" />
            ) : (
              <LucideChevronUp stroke="#ffffff" size={20} />
            )}
          </button>
        </div>
      )}

      {/* Messages */}
      {messages?.map((message) => (
        <div
          key={message.id} // Use `id` for optimistic messages
          className={`message-bubble transition-all duration-700 ${
            highlightedMessageId === (message.message_id || String(message.id))
              ? "bg-[#fcf1ff] dark:bg-[#fcf1ff]/40 py-2 rounded"
              : ""
          }`}
          id={String(message.message_id || message.id)}
        >
          <MessageBubble
            receiver={receiver}
            seen={message.seen}
            attachment={message.attachment}
            sender={message.sender_id}
            date={message.created_at}
            message={message}
            conversationId={conversationId}
            rawFiles={message.rawFiles}
            triggerSend={message.triggerSend}
          />
        </div>
      ))}

      {/* Empty state */}
      {messages.length === 0 && !loading && (
        <div className="flex items-center justify-center h-32">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessageList;
