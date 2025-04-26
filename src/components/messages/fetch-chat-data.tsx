"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchConversationMessages } from "@/utils/data/get-conversation-messages";
import Chats from "./chats";
import { useRouter } from "next/navigation";
import { Message } from "@/types/components";
import { useEffect, useCallback } from "react";
import { socket } from "../sub_components/sub/socket";

const FetchChatData = ({ stringId }: { stringId: string }) => {
  const router = useRouter();
  const conversationId = stringId;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["conversationMessages", conversationId],
    queryFn: ({ pageParam }) =>
      fetchConversationMessages({ pageParam, conversationId }),
    getNextPageParam: (lastPage, allPages) => {
      // Use the hasMore boolean to determine if there are more pages
      return lastPage.hasMore ? allPages.length + 1 || null : undefined;
    },
    initialPageParam: 1,
  });

  // Prepend new messages to the start of the array
  const allMessages =
    data?.pages.reduceRight((acc, page) => {
      const messages = page.messages.map((message: Message) => ({
        ...message,
        triggerSend: false,
        rawFiles: Array.isArray(message.rawFiles) ? message.rawFiles : [], // <-- this line
      }));
      return [...messages, ...acc]; // Prepend new messages
    }, [] as Message[]) || [];

  const receiver = data?.pages[0]?.receiver;
  const lastMessage = allMessages[allMessages.length - 1];

  // Handle invalid conversation
  useEffect(() => {
    if (
      data?.pages[0]?.invalid_conversation &&
      data?.pages[0]?.status === false
    ) {
      router.push("/messages");
    }
  }, [data, router]);

  // Socket connection for joining/leaving conversation
  useEffect(() => {
    socket.emit("join", conversationId);
    return () => {
      socket.emit("leave", conversationId);
    };
  }, [conversationId]);

  // Function to load more data
  const loadMoreMessages = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    <div className="flex flex-col items-center justify-center h-full py-8 space-y-4">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-blue-500 text-base font-medium">
        Loading messages...
      </span>
    </div>;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 space-y-4 text-center">
        <svg
          className="w-10 h-10 text-red-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 5.636L5.636 18.364M5.636 5.636l12.728 12.728"
          />
        </svg>
        <p className="text-red-500 text-base font-medium">
          Failed to load the conversation.
        </p>
        <p className="text-gray-500 text-sm">
          Please check your connection or try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <Chats
      receiver={receiver}
      allMessages={allMessages}
      lastMessage={lastMessage}
      conversationId={conversationId}
      onLoadMore={loadMoreMessages}
      isFetchingMore={isFetchingNextPage}
    />
  );
};

export default FetchChatData;
