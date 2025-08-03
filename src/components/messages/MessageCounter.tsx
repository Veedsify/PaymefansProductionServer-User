"use client";
import { useMessagesConversation } from "@/contexts/MessageConversationContext";

const MessageCounter = () => {
  const { unreadCount } = useMessagesConversation();
  return (
    <div className="flex items-center mb-7">
      <span className="flex-shrink-0 text-xl font-bold dark:text-white">
        All Your Conversations
      </span>
      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 px-1 py-1 ml-auto font-bold text-white rounded-full aspect-square md:py-3 md:px-3  bg-primary-text-dark-pink">
        {unreadCount}
      </div>
    </div>
  );
};

export default MessageCounter;
