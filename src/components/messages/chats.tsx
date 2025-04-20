"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LucideArrowLeft, LucideGrip, LucideVerified } from "lucide-react";
import MessageBubble from "../sub_components/message_bubble";
import MessageInput from "../sub_components/message_input";
import { useUserAuthContext } from "@/lib/userUseContext";
import { socket } from "../sub_components/sub/socket";
import swal from "sweetalert";
import { MediaFile, Message } from "@/types/components";
import ActiveProfileTag from "../sub_components/sub/active-profile-tag";
import { MediaProvider } from "@/contexts/message-media-context";

interface ChatProps {
  allMessages: Message[];
  lastMessage: Message | undefined | null;
  conversationId: string;
  receiver?: {
    id: number;
    user_id: string;
    name: string;
    username: string;
    profile_image: string | null;
    Settings: any;
  } | null;
}

const Chats = React.memo(
  ({ allMessages, lastMessage, conversationId, receiver }: ChatProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [typing, setTyping] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const { user } = useUserAuthContext();
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop =
          scrollRef.current.scrollHeight - scrollRef.current.clientHeight;
      }
    }, [messages]);

    useEffect(() => {
      if (conversationId) {
        setMessages(allMessages);
        scrollToBottom();
      }
    }, [conversationId, allMessages]);

    // Memoize profile picture
    const profilePicture = React.useMemo(
      () => receiver?.profile_image || "/site/avatar.png",
      [receiver?.profile_image]
    );

    // Handle new message
    const sendMessageToReceiver = useCallback(
      ({ message_id, message, sender_id, attachment, rawFiles }: Message) => {
        const newMessage = {
          id: messages.length + 1,
          message_id: message_id,
          message,
          sender_id,
          attachment,
          seen: false,
          created_at: new Date().toISOString(),
          rawFiles,
          triggerSend: true,
        };
        setMessages((prev) => [...prev, newMessage]);
        // socket.emit("new-message", {
        //   ...newMessage,
        //   receiver_id: receiver?.user_id,
        //   conversationId,
        //   date: newMessage.created_at,
        // });
      },
      [receiver?.user_id, conversationId, messages.length]
    );

    // Handle typing
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
      [user?.user_id, conversationId]
    );

    // Socket and message handling
    useEffect(() => {
      // Scroll to bottom on mount or message update
      scrollToBottom();

      // Socket event handlers
      const handleJoined = ({ message }: { message: string }) => {
        // toast.success(message);
      };

      const handleMessageReceived = (message: Message) => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            message_id: message.message_id,
            seen: false,
            attachment: message.attachment,
            message: message.message,
            sender_id: message.sender_id,
            created_at: new Date().toISOString(),
            rawFiles: [],
            triggerSend: false,
          },
        ]);
        if (message.sender_id !== user?.user_id) {
          socket.emit("message-seen", {
            conversationId,
            lastMessageId: message.message_id,
            userId: user?.user_id,
            receiver_id: receiver?.user_id,
          });
        }
        scrollToBottom();
      };

      const handleSeenByReceiver = ({ messageId }: { messageId: number }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.message_id === messageId && !msg.seen
              ? { ...msg, seen: true }
              : msg
          )
        );
      };

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
        }).then((value) => {
          if (value) window.location.reload();
        });
      };

      const handleSenderTyping = ({
        sender_id,
        value,
      }: {
        sender_id: string;
        value: string;
      }) => {
        if (sender_id !== user?.user_id) {
          setTyping(value);
          if (value) {
            if (typingTimeoutRef.current)
              clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setTyping(""), 10000);
          }
        }
      };

      // Set up socket listeners
      socket.emit("join", conversationId);
      socket.on("joined", handleJoined);
      socket.on("message", handleMessageReceived);
      socket.on("message-seen-updated", handleSeenByReceiver);
      socket.on("message-error", handleMessageError);
      socket.on("sender-typing", handleSenderTyping);

      // Clean up
      return () => {
        socket.off("joined", handleJoined);
        socket.off("message", handleMessageReceived);
        socket.off("message-seen-updated", handleSeenByReceiver);
        socket.off("message-error", handleMessageError);
        socket.off("sender-typing", handleSenderTyping);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    }, [conversationId, user?.user_id, receiver?.user_id, scrollToBottom]);

    // Handle last message seen status
    useEffect(() => {
      if (lastMessage && lastMessage.sender_id !== user?.user_id) {
        socket.emit("message-seen", {
          conversationId,
          lastMessageId: lastMessage.message_id,
          userId: user?.user_id,
          receiver_id: receiver?.user_id,
        });
      }
    }, [lastMessage, user?.user_id, conversationId, receiver?.user_id]);

    return (
      <div className="flex flex-col h-[calc(100vh-60px)]">
        {" "}
        {/* Use h-dvh for dynamic viewport height */}
        {/* Header */}
        <div className="flex items-center border-b border-black/30 dark:border-gray-800 py-4 px-5 shrink-0">
          <Link href="/messages" className="mr-6 sm:mr-10">
            <LucideArrowLeft
              size={24}
              className="text-gray-900 dark:text-white"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Image
              className="rounded-full object-cover"
              width={40}
              height={40}
              priority
              src={profilePicture}
              alt={`${receiver?.name}'s profile`}
            />
            <div>
              <Link
                href={`/${receiver?.username}`}
                className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white"
              >
                {receiver?.name}
                {receiver?.username === "@paymefans" && (
                  <LucideVerified className="text-yellow-600 ml-1" size={16} />
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
              className="text-gray-900 dark:text-white cursor-pointer"
            />
          </div>
        </div>
        {/* Messages */}
        <div
          className="flex-1 overflow-auto p-4 space-y-4 bg-white dark:bg-gray-900"
          ref={scrollRef}
        >
          {messages.map((message, index) => (
            <div
              key={message.message_id}
              className="message-bubble"
              id={String(message.message_id)}
            >
              <MessageBubble
                receiver={receiver}
                seen={message.seen}
                attachment={message.attachment}
                sender={message.sender_id}
                date={message.created_at}
                message={message}
                conversationId={conversationId}
                rawFiles={message.rawFiles as MediaFile[]}
                triggerSend={message.triggerSend}
              />
            </div>
          ))}
        </div>
        {/* Input */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-800 p-4 z-50 shrink-0">
          <MediaProvider>
            <MessageInput
              receiver={receiver}
              isFirstMessage={messages.length === 0}
              sendMessage={sendMessageToReceiver}
              sendTyping={sendTyping}
            />
          </MediaProvider>
        </div>
      </div>
    );
  }
);

Chats.displayName = "Chats";
export default Chats;
