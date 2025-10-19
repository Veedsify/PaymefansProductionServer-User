"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { useChatMessages } from "../hooks/useChatMessages";
import { useChatScroll } from "../hooks/useChatScroll";
import { checkIfBlockedBy } from "@/utils/data/BlockUser";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import MessageInputContainer from "./MessageInput/MessageInputContainer";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

interface ChatPageContainerProps {
  conversationId: string;
}

export const ChatPageContainer: React.FC<ChatPageContainerProps> = ({
  conversationId,
}) => {
  const router = useRouter();
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [isBlockedByReceiver, setIsBlockedByReceiver] = useState(false);
  const [blockCheckLoading, setBlockCheckLoading] = useState(true);

  const { chat } = useApi();

  // Fetch receiver data
  const {
    data: receiverData,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["chatData", conversationId],
    queryFn: () =>
      chat.getConversations().then((res) => {
        const conversation = res.data.data.find(
          (conv: any) => conv.conversation_id === conversationId
        );
        return { receiver: conversation?.receiver };
      }),
    refetchInterval: false,
    refetchOnMount: true,
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const receiver = receiverData?.receiver;

  // Chat messages hook
  const {
    chatMessages,
    loading: messagesLoading,
    error: messagesError,
    hasMore,
    fetchNextPage,
    searchForSpecificMessage,
  } = useChatMessages({ conversationId });

  // Chat scroll hook
  const {
    messagesContainerRef,
    highlightedMessageId,
    isSearchingMessage,
    scrollToBottom,
    handleScroll,
  } = useChatScroll({
    messages: chatMessages,
    isUserScrolledUp,
    setIsUserScrolledUp,
  });

  // Check if current user is blocked by the receiver
  useEffect(() => {
    const checkBlockStatus = async () => {
      if (!receiver?.id) return;

      setBlockCheckLoading(true);
      try {
        const result = await checkIfBlockedBy(receiver.id);
        if (result.status && !result.error) {
          setIsBlockedByReceiver(result.isBlocked);
        }
      } catch (error) {
        console.error("Error checking block status:", error);
      } finally {
        setBlockCheckLoading(false);
      }
    };

    if (receiver?.id) {
      checkBlockStatus();
    } else {
      setBlockCheckLoading(false);
    }
  }, [receiver?.id]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push("/messages");
  }, [router]);

  // Redirect if conversation not found
  if (!receiver && isError) {
    router.push("/messages");
    return null;
  }

  // Show loading state while checking block status
  if (blockCheckLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner text="Loading chat" />
      </div>
    );
  }

  // Show blocked message if user is blocked by receiver
  if (isBlockedByReceiver) {
    return (
      <div className="flex flex-col h-full">
        <ChatHeader
          receiver={receiver}
          conversationId={conversationId}
          onBack={handleBack}
        />
        <div className="flex items-center justify-center flex-1 p-8">
          <div className="max-w-md text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full dark:bg-gray-700">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              You can&apos;t message this user
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This user has restricted who can message them. You&apos;re unable
              to send messages to them at this time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        receiver={receiver}
        conversationId={conversationId}
        onBack={handleBack}
      />

      <ChatMessageList
        messages={chatMessages}
        receiver={receiver}
        conversationId={conversationId}
        hasMore={hasMore}
        loading={messagesLoading}
        highlightedMessageId={highlightedMessageId}
        isSearchingMessage={isSearchingMessage}
        onLoadMore={fetchNextPage}
        messagesContainerRef={messagesContainerRef}
        onScroll={handleScroll}
      />

      <div className="sticky bottom-0 z-50 p-4 bg-white border-t border-black/30 dark:bg-black dark:border-gray-950 shrink-0">
        <MessageInputContainer
          receiver={receiver}
          conversationId={conversationId}
          isFirstMessage={chatMessages.length === 0}
          isBlockedByReceiver={isBlockedByReceiver}
        />
      </div>
    </div>
  );
};

export default ChatPageContainer;
