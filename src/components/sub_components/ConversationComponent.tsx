"use client";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { LastMessage } from "@/types/Conversations";
import { LucideLink2, LucideLoader, LucideVerified } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { MouseEvent, useEffect, useState } from "react";
import ActiveProfileTag from "./sub/ActiveProfileTag";
import { useInView } from "react-intersection-observer";
import { getSocket } from "./sub/Socket";
import { Conversation } from "@/types/Components";
import { useMessagesConversation } from "@/contexts/MessageConversationContext";
import { useQueryClient } from "@tanstack/react-query";

const ConversationComponent = () => {
  const [loading, setLoading] = useState(true);
  const { hasMore, conversations, fetchNextPage } = useMessagesConversation();
  const socket = getSocket();
  const queryClient = useQueryClient();
  useEffect(() => {
    const handlePrefetch = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };
    socket.on("prefetch-conversations", handlePrefetch);
    return () => {
      socket.off("prefetch-conversations", handlePrefetch);
    };
  }, [socket, queryClient]);

  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView && hasMore) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView, hasMore]);

  useEffect(() => {
    if (conversations) {
      setLoading(false);
    }
  }, [conversations]);

  if (loading) {
    return <ConversationCardLoader />;
  }

  if (!conversations) {
    return <div className="text-center">No conversations yet</div>;
  }
  return (
    <>
      {conversations.map((conversation) => (
        <ConversationCard
          key={conversation.conversation_id}
          conversation={conversation}
        />
      ))}
      <div ref={ref}></div>
    </>
  );
};

const ConversationCardLoader = () => (
  <div className="flex items-center gap-2 md:gap-5 p-3 dark:text-white justify-center">
    <LucideLoader className="animate-spin text-gray-700" size={25} />
  </div>
);

type ConversationCardProps = {
  conversation: {
    conversation: Conversation;
    conversation_id: string;
    lastMessage: LastMessage;
    receiver: {
      user_id: string;
      username: string;
      name: string;
      profile_image: string;
    };
  };
};
const ConversationCard = React.memo(
  ({ conversation }: ConversationCardProps) => {
    const router = useRouter();
    const { user } = useUserAuthContext();
    const socket = getSocket();

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).tagName !== "A") {
        router.push(`/chats/${conversation.conversation_id}`);
      }
    };
    useEffect(() => {
      socket.emit("join", conversation.conversation_id);
    }, [conversation.conversation_id, socket]);

    const isUnread =
      conversation.lastMessage &&
      !conversation.lastMessage.seen &&
      conversation.lastMessage.sender_id !== user?.user_id;

    const lastMessageTime = conversation.lastMessage?.created_at
      ? new Date(conversation.lastMessage.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    // Remove all <br /> tags from the message and truncate to 100 chars
    const lastMessageText = conversation?.lastMessage?.message
      ? (() => {
          const cleanMessage = String(conversation.lastMessage.message).replace(
            /<br\s*\/?>/gi,
            ""
          );
          return (
            cleanMessage.substring(0, 100) +
            (cleanMessage.length > 100 ? "..." : "")
          );
        })()
      : "";

    const verifiedUsernames = ["@paymefans", "@paymefans1", "@paymefans2"];
    const isVerified = verifiedUsernames.includes(
      conversation.receiver.username
    );
    const isPayMeFans = conversation.receiver.username === "@paymefans";

    return (
      // Improved Conversation Item Component
      <div
        onClick={handleClick}
        className={`
        group flex items-center p-4 
        border-b border-gray-200 dark:border-gray-800
        transition-all duration-200 ease-in-out
        ${
          isUnread
            ? "bg-indigo-50 dark:bg-indigo-900/30 font-medium"
            : "bg-white dark:bg-gray-950"
        }
        hover:bg-primary-light-pink/5 dark:hover:bg-primary-dark-pink/10
        cursor-pointer
      `}
      >
        {/* Profile Image with Active Status */}
        <Link
          onClick={(e) => e.stopPropagation()}
          className="relative flex-shrink-0 mr-4"
          href={`/${conversation.receiver.username}`}
          tabIndex={-1}
        >
          <div className="relative">
            <Image
              width={56}
              height={56}
              src={conversation.receiver.profile_image}
              alt={`${conversation.receiver.name} profile`}
              className="object-cover rounded-full w-14 aspect-square 
                  border-2 transition-colors duration-200
                  group-hover:border-primary-dark-pink
                  border-primary-light-pink/70 dark:border-primary-light-pink/50"
            />
            <div className="absolute -right-1 -bottom-1 bg-white dark:bg-gray-900 p-0.5 rounded-full shadow-md">
              <ActiveProfileTag
                scale={1.1}
                userid={conversation.receiver.username}
              />
            </div>
          </div>
        </Link>

        {/* Content Container */}
        <div className="flex-1 min-w-0">
          {/* Header: Name, Username, Time, Unread Indicator */}
          <div className="flex items-center gap-2 mb-1.5">
            {/* Name with Verification Badge */}
            <Link
              onClick={(e) => e.stopPropagation()}
              href={`/${conversation.receiver.username}`}
              className="truncate font-semibold text-gray-900 dark:text-gray-100"
            >
              <span className="flex items-center gap-1 truncate">
                {conversation.receiver.name}
                {isVerified && (
                  <LucideVerified size={16} className="text-yellow-500" />
                )}
              </span>
            </Link>

            {/* Username (hidden on small screens) */}
            {!isPayMeFans && (
              <Link
                onClick={(e) => e.stopPropagation()}
                href={`/${conversation.receiver.username}`}
                className="hidden xl:inline-block text-gray-500 dark:text-gray-400 text-sm truncate"
              >
                {conversation.receiver.username}
              </Link>
            )}

            {/* Time and Unread Indicator */}
            <div className="flex items-center gap-2 ml-auto">
              {lastMessageTime && (
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {lastMessageTime}
                </span>
              )}
              {isUnread && (
                <span className="w-2.5 h-2.5 bg-primary-dark-pink rounded-full animate-pulse" />
              )}
            </div>
          </div>

          {/* Message Preview */}
          <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
            <Link
              href={`/chats/${conversation.conversation_id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1"
            >
              {conversation.lastMessage?.created_at ? (
                <>
                  <span
                    className="truncate max-w-[90%]"
                    dangerouslySetInnerHTML={{
                      __html: lastMessageText,
                    }}
                  />
                  {conversation.lastMessage.attachment?.length > 0 && (
                    <span className="flex gap-1 items-center text-gray-400">
                      {conversation.lastMessage.attachment
                        .slice(0, 3)
                        .map((_, idx) => (
                          <LucideLink2
                            className="text-gray-500"
                            size={16}
                            key={idx}
                          />
                        ))}
                      {conversation.lastMessage.attachment.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{conversation.lastMessage.attachment.length - 3}
                        </span>
                      )}
                    </span>
                  )}
                </>
              ) : (
                <span className="italic text-gray-400">New Conversation</span>
              )}
            </Link>
          </div>
        </div>
      </div>
    );
  }
);

ConversationCard.displayName = "ConversationCard";

export default ConversationComponent;
