"use client";
import { useUserAuthContext } from "@/lib/userUseContext";
import { Conversation, LastMessage } from "@/types/conversations";
import { LucideLink2, LucideVerified } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { MouseEvent, useEffect, useState } from "react";
import ActiveProfileTag from "./sub/active-profile-tag";
import { useInView } from "react-intersection-observer";
import { socket } from "./sub/socket";
import { useMessageContext } from "@/contexts/messages-conversation-context";

const ConversationComponent = () => {
  const [loading, setLoading] = useState(true);
  const { hasMore, setPage, page, conversations } = useMessageContext();

  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView && hasMore) {
      setPage(page + 1);
    }
  }, [page, setPage, inView, hasMore]);

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
  <div>
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="animate-pulse flex items-center gap-2 md:gap-5 p-3"
      >
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 md:w-16 md:h-16 aspect-square bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="flex flex-1 text-sm gap-4 mb-2 w-full">
              <div className="w-24 h-4 bg-gray-300 rounded-md"></div>
              <div className="w-16 h-4 bg-gray-300 rounded-md"></div>
            </div>
            <div className="text-sm">
              <div className="w-36 h-4 bg-gray-300 rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
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

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).tagName !== "A") {
        router.push(`/chats/${conversation.conversation_id}`);
      }
    };
    useEffect(() => {
      socket.emit("join", conversation.conversation_id);
    }, [conversation.conversation_id]);

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
    return (
      <div
        onClick={handleClick}
        className={`block border-b border-black/20 dark:border-black/90 ${
          isUnread ? "bg-messages-unread dark:text-black" : "dark:text-white"
        } dark:bg-gray-900 cursor-pointer`}
      >
        <div className="flex items-center gap-2 md:gap-5 p-3 dark:text-white">
          <Link
            onClick={(e) => e.stopPropagation()}
            className="relative"
            href={`/${conversation.receiver.username}`}
          >
            <Image
              width={65}
              height={65}
              src={conversation.receiver.profile_image}
              alt="user messages"
              className="object-cover rounded-full w-12 md:w-16 aspect-square"
            />
            <div className="absolute right-0 scale-110 bg-white p-1 rounded-full bottom-1">
              <ActiveProfileTag
                scale={1.2}
                userid={conversation.receiver.username}
              />
            </div>
          </Link>
          <div className="flex-1">
            <div className="flex flex-1 text-sm gap-4 mb-2 w-full">
              <Link
                onClick={(e) => e.stopPropagation()}
                href={`/${conversation.receiver.username}`}
              >
                <h1 className="font-bold flex gap-1">
                  {conversation.receiver.name}
                  {conversation.receiver.username === "@paymefans" && (
                    <LucideVerified size={20} className="text-yellow-600" />
                  )}
                </h1>
              </Link>
              <Link
                onClick={(e) => e.stopPropagation()}
                href={`/${conversation.receiver.username}`}
              >
                {conversation.receiver.username !== "@paymefans" && (
                  <p className="hidden md:block">
                    {conversation.receiver.username}
                  </p>
                )}
              </Link>
              <div className="flex items-center gap-2 ml-auto">
                <p className="block">{lastMessageTime}</p>
                {(conversation.lastMessage && !conversation.lastMessage.seen )&& (
                  <span className="text-white w-2 h-2 bg-primary-dark-pink rounded-2xl block"></span>
                )}
              </div>
            </div>
            <div className="text-sm">
              <Link href={`/chats/${conversation.conversation_id}`}>
                {conversation.lastMessage?.created_at ? (
                  <div>
                    <div
                      className="text-xs md:text-sm"
                      dangerouslySetInnerHTML={{
                        __html: `${String(
                          conversation.lastMessage.message
                        ).substring(0, 100)}${
                          conversation.lastMessage.message.length > 100
                            ? "..."
                            : ""
                        }`,
                      }}
                    />
                    {conversation.lastMessage.attachment?.length > 0 && (
                      <div className="flex gap-1">
                        {conversation.lastMessage.attachment
                          .slice(0, 6)
                          .map((file, index) => (
                            <LucideLink2
                              className="text-gray-500"
                              key={index}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                ) : (
                  "New Conversation"
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ConversationCard.displayName = "ConversationCard";

export default ConversationComponent;
