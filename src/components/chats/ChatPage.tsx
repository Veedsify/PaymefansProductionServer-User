import Link from "next/link";
import ActiveProfileTag from "../sub_components/sub/ActiveProfileTag";
import {
  LucideArrowLeft,
  LucideGrip,
  LucideLoader2,
  LucideVerified,
} from "lucide-react";
import Image from "next/image";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  FetchConversationReceiver,
  GetConversationMessages,
} from "@/utils/data/GetConversationMessages";
import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import MessageBubble from "../messages/MessageBubble";
import { useInView } from "react-intersection-observer";
import { Message } from "@/types/Components";
import { useChatStore } from "@/contexts/ChatContext";
import MessageInputComponent from "../messages/MessageInputComponent";
import { getSocket } from "../sub_components/sub/Socket";
import { useUserStore } from "@/lib/UserUseContext";

const ChatPage = ({ conversationId }: { conversationId: string }) => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const messages = useChatStore((state) => state.messages);
  const addNewMessage = useChatStore((state) => state.addNewMessage);
  const paginateMessages = useChatStore((state) => state.paginateMessages);
  const updateSeenMessages = useChatStore((state) => state.updateSeenMessages);
  const socket = getSocket();
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 1,
  });
  const {
    data: receiverData,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["chatData", conversationId],
    queryFn: () =>
      FetchConversationReceiver({
        conversationId: conversationId,
        cursor: 1,
        pageParam: 1, // Assuming pageParam is always 1 for initial load
      }),
    refetchInterval: false,
    refetchOnMount: true,
    enabled: !!conversationId,
  });
  const receiver = receiverData?.receiver;
  const profilePicture = useMemo(
    () => receiver?.profile_image || "/site/avatar.png",
    [receiver]
  );
  if (!receiver && isError) {
    router.push("/messages");
  }
  const {
    data: conversationMessages,
    isError: IsMessageError,
    isLoading: IsMessageLoading,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["chatMessages", conversationId],
    queryFn: ({ pageParam }) =>
      GetConversationMessages({ conversationId, cursor: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.nextCursor) {
        return lastPage.nextCursor;
      }
      return null;
    },
    refetchInterval: false,
    refetchOnMount: true,
    initialPageParam: undefined,
    enabled: !!conversationId,
  });

  useEffect(() => {
    const paginatedMessages = conversationMessages?.pages.flatMap(
      (page) => page.messages
    ) as Message[];

    paginateMessages(paginatedMessages);
  }, [conversationMessages, paginateMessages]);

  useEffect(() => {
    // Event: New message
    const handleMessageReceived = (msg: Message) => {
      addNewMessage(msg);
      if (!msg.seen) {
        socket.emit("message-seen", {
          conversationId,
          lastMessageId: msg.message_id,
          userId: user?.user_id,
          receiver_id: receiver?.user_id,
        });
      }
      // Only scroll if the user is not scrolled up
      // if (!userScrolledUp) {
      //   scrollToBottom();
      // }
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
    const handleMessageSeenUpdated = ({ messageId }: { messageId: string }) => {
      updateSeenMessages([messageId]);
    };

    // Join conversation and set up listeners
    socket.emit("join", conversationId);
    socket.on("message", handleMessageReceived);
    socket.on("message-error", handleMessageError);
    // socket.on("sender-typing", handleSenderTyping);
    socket.on("message-seen-updated", handleMessageSeenUpdated);
    // Clean up
    return () => {
      socket.off("message", handleMessageReceived);
      socket.off("message-error", handleMessageError);
      // socket.off("sender-typing", handleSenderTyping);
      socket.off("message-seen-updated", handleMessageSeenUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, user?.user_id, receiver?.user_id]);

  return (
    <div className="flex flex-col h-full ">
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
              {/* {typing && (
                <span className="text-primary-dark-pink">typing...</span>
              )} */}
            </div>
          </div>
        </div>
        <div className="ml-auto">
          <Link
            href={`/chats/${conversationId}/settings`}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Settings"
          >
            <LucideGrip
              size={24}
              className="text-gray-900 cursor-pointer dark:text-white"
              aria-label="More options"
            />
          </Link>
        </div>
      </div>
      <div
        className="flex-1 max-h-[calc(100dvh-230px)] p-4 space-y-4 overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-950"
        ref={messagesContainerRef}
      >
        <div ref={loadMoreRef}></div>
        {isFetchingNextPage && (
          <div className="flex items-center justify-center w-full py-4">
            <LucideLoader2 className="text-primary-dark-pink h-6 w-6 animate-spin" />
          </div>
        )}
        {messages?.map((message) => (
          <div
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
      <div className="sticky bottom-0 z-50 p-4 bg-white border-t border-black/30 dark:bg-gray-800 dark:border-gray-950 shrink-0">
        <MessageInputComponent
          receiver={receiver}
          conversationId={conversationId}
          isFirstMessage={messages.length === 0}
        />
      </div>
    </div>
  );
};

export default ChatPage;
