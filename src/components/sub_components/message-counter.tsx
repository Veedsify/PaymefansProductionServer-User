"use client"
import { useConversations } from "@/contexts/messages-conversation-context";

const MessageCounter = () => {
     const { unreadCount } =
     useConversations();
    return (
        <div className="flex items-center mb-7">
            <span className="font-bold text-xl flex-shrink-0 dark:text-white">All Your Conversations</span>
            <div className="flex items-center justify-center w-8 h-8 aspect-square flex-shrink-0 ml-auto text-white md:py-3 md:px-3 py-1 px-1  bg-primary-text-dark-pink rounded-full font-bold">{unreadCount}</div>
        </div>
    )
};

export default MessageCounter;
