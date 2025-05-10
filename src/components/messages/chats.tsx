"use client";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import _ from "lodash";
import Image from "next/image";
import {
  LucideArrowLeft,
  LucideGrip,
  LucideLoader,
  LucideLoader2,
  LucideVerified,
} from "lucide-react";
import MessageBubble from "../sub_components/message_bubble";
import MessageInput from "../sub_components/message_input";
import { useUserAuthContext } from "@/lib/userUseContext";
import { getSocket } from "../sub_components/sub/socket";
import swal from "sweetalert";
import { MediaFile, Message } from "@/types/components";
import ActiveProfileTag from "../sub_components/sub/active-profile-tag";
import { MediaProvider } from "@/contexts/message-media-context";
import { useInView } from "react-intersection-observer";
import Loader from "../lib_components/loading-animation";

// Types
interface ChatProps {
  allMessages: Message[];
  lastMessage: Message | undefined | null;
  setAllMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  conversationId: string;
  onLoadMore: () => void;
  isFetchingMore: boolean;
  receiver?: {
    id: number;
    user_id: string;
    name: string;
    username: string;
    active_status: boolean;
    profile_image: string | null;
    Settings: any;
  } | null;
}

// Main Chats component
const Chats: React.FC<ChatProps> = React.memo(
  ({
    allMessages,
    lastMessage,
    setAllMessages,
    conversationId,
    receiver,
    onLoadMore,
    isFetchingMore,
  }) => {
    const { user } = useUserAuthContext();
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [typing, setTyping] = React.useState("");
    const { ref: loadMoreRef, inView } = useInView({
      threshold: 1,
    });
    const socket = getSocket();

    const hasCalledRef = useRef(false);
    // Track if the user is at the bottom of the messages
    const [userScrolledUp, setUserScrolledUp] = React.useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom utility
    const scrollToBottom = useCallback(() => {
      scrollRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }, []);

    // Track scroll position to determine if user is at bottom
    useEffect(() => {
      const container = messagesContainerRef.current;
      if (!container) return;
      const handleScroll = () => {
        // If the user is within 100px of the bottom, consider as "at bottom"
        const isAtBottom =
          container.scrollHeight -
          container.scrollTop -
          container.clientHeight <
          100;
        setUserScrolledUp(!isAtBottom);
      };
      container.addEventListener("scroll", handleScroll);
      // Run once on mount in case already at bottom
      handleScroll();
      return () => {
        container.removeEventListener("scroll", handleScroll);
      };
    }, []);

    // On initial load, always scroll to bottom
    useEffect(() => {
      if (allMessages.length > 0) {
        scrollToBottom();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // only on mount

    // When new messages arrive (not from loading more), scroll to bottom if user is not scrolled up
    const prevMessagesLengthRef = useRef<number>(allMessages.length);
    useEffect(() => {
      // If length increased, and not fetching more, and user is not scrolled up
      if (
        allMessages.length > prevMessagesLengthRef.current &&
        !isFetchingMore &&
        !userScrolledUp
      ) {
        scrollToBottom();
      }
      prevMessagesLengthRef.current = allMessages.length;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allMessages.length, isFetchingMore, userScrolledUp]);

    // When loading more, do NOT scroll to bottom.
    useEffect(() => {
      if (inView && !isFetchingMore && !hasCalledRef.current) {
        hasCalledRef.current = true;
        onLoadMore();
      } else if (!inView) {
        hasCalledRef.current = false; // reset trigger when out of view
      }
    }, [inView, isFetchingMore, onLoadMore]);

    // Memoized profile picture
    const profilePicture = useMemo(
      () => receiver?.profile_image || "/site/avatar.png",
      [receiver?.profile_image],
    );

    // Typing handler: emits and manages local typing state
    const sendTyping = useCallback(
      (value: string) => {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit("typing", {
          sender_id: user?.user_id,
          value,
          conversationId,
        });
        typingTimeoutRef.current = setTimeout(() => setTyping(""), 10000);
      },
      [user?.user_id, conversationId, socket],
    );
    // Handle showing "typing..." when other user is typing
    const handleSenderTyping = useCallback(
      ({ sender_id, value }: { sender_id: string; value: string }) => {
        if (sender_id !== user?.user_id) {
          setTyping(value);
          if (value) {
            if (typingTimeoutRef.current)
              clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setTyping(""), 10000);
          }
        }
      },
      [user?.user_id],
    );
    // Optimistic message creation
    const sendMessage = useCallback(
      async (msg: Message) => {
        const newMessage = {
          ...msg,
          id: Math.random(),
          sender_id: user?.user_id!,
          triggerSend: true,
          rawFiles: msg.rawFiles,
          seen: false,
          conversationId,
          created_at: new Date().toISOString(),
        };

        if (!newMessage.rawFiles || newMessage.rawFiles.length === 0) {
          socket.emit("new-message", newMessage);
        }

        setAllMessages((prev) => _.uniqBy([...prev, newMessage], "id"));
      },
      [conversationId, user?.user_id, setAllMessages, socket],
    );
    // Socket event handling: message received, seen status, errors, typing
    useEffect(() => {
      // Event: New message
      const handleMessageReceived = (msg: Message) => {
        // Update the query cache with the new message
        setAllMessages((prev) => {
          const updatedMessages = prev.map((message) => {
            if (message.id === msg.id) {
              return { ...message, seen: true };
            }
            return message;
          });
          return [...updatedMessages, msg];
        });

        // Optimistically add the new message to the query cache or handle it here if required
        socket.emit("message-seen", {
          conversationId,
          lastMessageId: msg.message_id,
          userId: user?.user_id,
          receiver_id: receiver?.user_id,
        });
        // Only scroll if the user is not scrolled up
        if (!userScrolledUp) {
          scrollToBottom();
        }
      };
      // Event: Error
      const handleMessageError = () => {
        swal({
          title: "Error",
          text: "The last message didn't go through. Refresh and try again.",
          icon: "error",
          buttons: {
            cancel: true,
            confirm: {
              text: "Refresh",
              className: "bg-primary-dark-pink text-white",
            },
          },
        }).then((refresh) => {
          if (refresh) window.location.reload();
        });
      };

      // Event: Message seen
      const handleMessageSeenUpdated = ({
        messageId,
      }: {
        messageId: string;
      }) => {
        setAllMessages((prev) =>
          prev.map((message) =>
            message.message_id === messageId
              ? { ...message, seen: true }
              : message,
          ),
        );
      };

      // Join conversation and set up listeners
      socket.emit("join", conversationId);
      socket.on("message", handleMessageReceived);
      socket.on("message-error", handleMessageError);
      socket.on("sender-typing", handleSenderTyping);
      socket.on("message-seen-updated", handleMessageSeenUpdated);
      // Clean up
      return () => {
        socket.off("message", handleMessageReceived);
        socket.off("message-error", handleMessageError);
        socket.off("sender-typing", handleSenderTyping);
        socket.off("message-seen-updated", handleMessageSeenUpdated);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      conversationId,
      user?.user_id,
      receiver?.user_id,
      handleSenderTyping,
      scrollToBottom,
      userScrolledUp,
    ]);
    // Seen handler for last message on mount/change
    useEffect(() => {
      if (lastMessage && lastMessage.sender_id !== user?.user_id) {
        socket.emit("message-seen", {
          conversationId,
          lastMessageId: lastMessage.message_id,
          userId: user?.user_id,
          receiver_id: receiver?.user_id,
        });
      }
    }, [lastMessage, user?.user_id, conversationId, receiver?.user_id, socket]);
    // UI
    return (
      <div className="flex flex-col h-[calc(100vh-60px)]">
        {/* Header */}
        <div className="flex items-center px-5 py-4 border-b border-black/30 dark:border-gray-800 shrink-0">
          <Link href="/messages" className="mr-6 sm:mr-10" aria-label="Back">
            <LucideArrowLeft
              size={24}
              className="text-gray-900 dark:text-white"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Image
              className="object-cover rounded-full"
              width={40}
              height={40}
              priority
              src={
                receiver && receiver.active_status
                  ? profilePicture
                  : "/site/avatar.png"
              }
              alt={`${receiver?.name || "User"}'s profile`}
            />
            <div>
              <Link
                href={`/${receiver?.username}`}
                className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white"
              >
                {receiver?.name}
                {receiver?.username === "@paymefans" && (
                  <LucideVerified className="ml-1 text-yellow-600" size={16} />
                )}
              </Link>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <ActiveProfileTag
                  userid={receiver?.username as string}
                  withText
                />
                {typing && (
                  <span className="text-primary-dark-pink">typing...</span>
                )}
              </div>
            </div>
          </div>
          <div className="ml-auto">
            <LucideGrip
              size={24}
              className="text-gray-900 cursor-pointer dark:text-white"
              aria-label="More options"
            />
          </div>
        </div>
        {/* Messages */}
        <div
          className="flex-1 p-4 space-y-4 overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-950"
          ref={messagesContainerRef}
        >
          <div ref={loadMoreRef}></div>
          {isFetchingMore && (
            <div className="flex items-center justify-center w-full py-4">
              <LucideLoader2 className="text-primary-dark-pink h-6 w-6 animate-spin" />
            </div>
          )}
          {allMessages.map((message, index) => (
            <div
              ref={index === allMessages.length - 1 ? scrollRef : null}
              key={message.id} // Use `id` for optimistic messages
              className="message-bubble"
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
        </div>
        {/* Input */}
        <div className="sticky bottom-0 z-50 p-4 bg-white border-t dark:bg-gray-800 dark:border-gray-950 shrink-0">
          <MessageInput
            receiver={receiver}
            isFirstMessage={allMessages.length === 0}
            sendMessage={sendMessage} // Use the new sendMessage function
            sendTyping={sendTyping} // Pass the typing handler
          />
        </div>
      </div>
    );
  },
);
Chats.displayName = "Chats";
export default Chats;
