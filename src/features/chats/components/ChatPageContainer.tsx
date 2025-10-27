"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/lib/api/client";
import { useChatMessages } from "../hooks/useChatMessages";
import { useChatScroll } from "../hooks/useChatScroll";
import { checkIfBlockedBy } from "@/utils/data/BlockUser";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import MessageInputComponent from "../comps/MessageInputComponent";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";
import { getSocket } from "@/components/common/Socket";
import { useAuthContext } from "@/contexts/UserUseContext";

interface ChatPageContainerProps {
  conversationId: string;
}

export const ChatPageContainer: React.FC<ChatPageContainerProps> = ({
  conversationId,
}) => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [isBlockedByReceiver, setIsBlockedByReceiver] = useState(false);
  const [blockCheckLoading, setBlockCheckLoading] = useState(true);
  const socket = getSocket();
  const { chat } = useApi();

  // Fetch receiver data
  const {
    data: receiverData,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["chatReceiver", conversationId],
    queryFn: async () => {
      try {
        console.log("Fetching receiver for conversationId:", conversationId);
        const res = await chat.getReceiver(conversationId);
        console.log("Receiver response:", res.data);

        if (!res.data.receiver) {
          throw new Error("Receiver not found");
        }

        return { receiver: res.data.receiver };
      } catch (error) {
        console.error("Error fetching receiver:", error);
        throw error;
      }
    },
    refetchInterval: false,
    refetchOnMount: true,
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  useEffect(() => {
    if (user?.username && user?.user_id) {
      socket?.emit("join", conversationId);
    }
  }, [conversationId, user?.user_id, user?.username]);

  const receiver = useMemo(
    () => receiverData?.receiver,
    [receiverData?.receiver]
  );

  // Chat messages hook
  const {
    chatMessages,
    loading: messagesLoading,
    hasMore,
    fetchNextPage,
    addMessageOptimistically,
  } = useChatMessages({ conversationId });

  // Chat scroll hook
  const {
    messagesContainerRef,
    highlightedMessageId,
    isSearchingMessage,
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
        const result = await checkIfBlockedBy(Number(receiver.id));
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

  // Redirect if conversation not found (temporarily disabled for debugging)
  if (!receiver && isError) {
    console.log(
      "Redirecting to /messages - receiver:",
      receiver,
      "isError:",
      isError
    );
    // router.push("/messages"); // Temporarily disabled
    // return null;
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
        <MessageInputComponent
          receiver={receiver}
          conversationId={conversationId}
          isFirstMessage={chatMessages.length === 0}
          isBlockedByReceiver={isBlockedByReceiver}
          addMessageOptimistically={addMessageOptimistically}
        />
      </div>
    </div>
  );
};

