import Link from "next/link";
import ActiveProfileTag from "../sub_components/sub/ActiveProfileTag";
import {
  LucideArrowLeft,
  LucideBan,
  LucideChevronUp,
  LucideGrip,
  LucideLoader2,
  LucideVerified,
} from "lucide-react";
import Image from "next/image";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchConversationReceiver,
  GetConversationMessages,
} from "@/utils/data/GetConversationMessages";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MessageBubble from "../messages/MessageBubble";
import { Message } from "@/types/Components";
import { useChatStore } from "@/contexts/ChatContext";
import MessageInputComponent from "../messages/MessageInputComponent";
import { getSocket } from "../sub_components/sub/Socket";
import { useUserStore } from "@/lib/UserUseContext";
import { reverse } from "lodash";
import { getToken } from "@/utils/Cookie";
import toast from "react-hot-toast";
import { checkIfBlockedBy } from "@/utils/data/BlockUser";
import axiosInstance from "@/utils/Axios";

const ChatPage = ({ conversationId }: { conversationId: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUserStore((state) => state.user);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);
  const messages = useChatStore((state) => state.messages);
  const addNewMessage = useChatStore((state) => state.addNewMessage);
  const paginateMessages = useChatStore((state) => state.paginateMessages);
  const resetMessages = useChatStore((state) => state.resetMessages);
  const updateSeenMessages = useChatStore((state) => state.updateSeenMessages);
  const socket = getSocket();
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);
  const [isSearchingMessage, setIsSearchingMessage] = useState(false);
  const {
    data: receiverData,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["chatData", conversationId],
    queryFn: () =>
      fetchConversationReceiver({
        conversationId: conversationId,
        cursor: 1,
        pageParam: 1, // Assuming pageParam is always 1 for initial load
      }),
    refetchInterval: false,
    refetchOnMount: true,
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 10, // 10 minutes - receiver data doesn't change often
  });

  const receiver = receiverData?.receiver;
  const profilePicture = useMemo(
    () => receiver?.profile_image || "/site/avatar.png",
    [receiver]
  );
  if (!receiver && isError) {
    router.push("/messages");
  }

  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState<number | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [isBlockedByReceiver, setIsBlockedByReceiver] = useState(false);
  const [blockCheckLoading, setBlockCheckLoading] = useState(true);

  // Fetch first page on mount or conversationId change
  useEffect(() => {
    if (!conversationId) return;
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await GetConversationMessages({
          conversationId,
          cursor: undefined,
        });
        setChatMessages(res.messages);
        setNextCursor(res.nextCursor ?? null);
        setHasMore(!!res.nextCursor);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Check if current user is blocked by the receiver
  useEffect(() => {
    const checkBlockStatus = async () => {
      if (!receiver?.id || !user?.id) return;

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
  }, [receiver?.id, user?.id]);

  // Function to fetch the next page
  const fetchNextPage = useCallback(async () => {
    if (!nextCursor || !hasMore) return;

    setLoading(true);
    setError(null);
    try {
      const res = await GetConversationMessages({
        conversationId,
        cursor: nextCursor,
      });
      setChatMessages((prev) => [...prev, ...res.messages]);
      setNextCursor(res.nextCursor ?? null);
      setHasMore(!!res.nextCursor);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [conversationId, nextCursor, hasMore]);

  useEffect(() => {
    return () => {
      // Cleanup function to reset messages when component unmounts
      paginateMessages([]);
      setChatMessages([]);
      setNextCursor(undefined);
      setHasMore(false);
      setLoading(false);
      setError(null);
    };
  }, [paginateMessages]);
  // Optional side effect to paginate externally
  useEffect(() => {
    paginateMessages(chatMessages);
  }, [chatMessages, paginateMessages]);

  useEffect(() => {
    return () => {
      setNextCursor(undefined);
      setHasMore(false);
      setLoading(false);
      setError(null);
      setChatMessages([]);
      resetMessages();
    };
  }, [resetMessages]); // cleanup only on unmount

  useEffect(() => {
    // Event: New message
    const handleMessageReceived = (msg: Message) => {
      console.log("📨 New message received via socket:", msg.message_id);
      addNewMessage(msg);

      // Mark message as seen if user is viewing this conversation
      if (!msg.seen && msg.conversationId === conversationId) {
        socket?.emit("message-seen", {
          conversationId,
          lastMessageId: msg.message_id,
          userId: user?.user_id,
          receiver_id: receiver?.user_id,
        });
      }

      // Auto-scroll if user is at bottom and no message is currently highlighted
      if (!isUserScrolledUp && !highlightedMessageId) {
        setTimeout(() => scrollToBottom(), 100);
      }
    };
    // Event: Error
    const handleMessageError = async (errorData: any) => {
      let title = "Error";
      let text = "The last message didn't go through. Refresh and try again.";
      let showRefresh = true;

      if (errorData && errorData.error) {
        switch (errorData.error) {
          case "INSUFFICIENT_POINTS":
            title = "Insufficient Points";
            text =
              errorData.message ||
              `You need more points to send this message. You have ${
                errorData.currentPoints || 0
              } points but need ${errorData.requiredPoints || 0} points.`;
            showRefresh = false;
            break;
          case "USERS_NOT_FOUND":
            title = "User Not Found";
            text = "Unable to find the recipient. Please try again.";
            showRefresh = false;
            break;
          default:
            text =
              errorData.message ||
              "An error occurred while sending this message.";
            break;
        }
      }

      const buttons = showRefresh
        ? {
            cancel: true,
            confirm: {
              text: "Refresh",
              className: "bg-primary-dark-pink text-white",
            },
          }
        : {
            cancel: false,
            confirm: {
              text: "OK",
              className: "bg-primary-dark-pink text-white",
            },
          };

      await swal({
        title,
        text,
        icon: "error",
        buttons,
      }).then((refresh) => {
        if (refresh && showRefresh) window.location.reload();
      });
    };

    // Event: Message seen
    const handleMessageSeenUpdated = ({ messageId }: { messageId: string }) => {
      updateSeenMessages([messageId]);
    };

    // Join conversation and set up listeners
    socket?.emit("join", conversationId);
    socket?.on("message", handleMessageReceived);
    socket?.on("message-error", handleMessageError);
    socket?.on("message-seen-updated", handleMessageSeenUpdated);

    // Handle typing indicators (optional enhancement)
    const handleTyping = (data: { sender_id: string; value: boolean }) => {
      // You can implement typing indicator UI here
      console.log("👤 Typing indicator:", data);
    };

    socket?.on("sender-typing", handleTyping);

    // Clean up
    return () => {
      socket?.off("message", handleMessageReceived);
      socket?.off("message-error", handleMessageError);
      socket?.off("message-seen-updated", handleMessageSeenUpdated);
      socket?.off("sender-typing", handleTyping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    conversationId,
    user?.user_id,
    receiver?.user_id,
    isUserScrolledUp,
    highlightedMessageId,
    addNewMessage,
    updateSeenMessages,
  ]);

  // Auto-scroll functions
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 50; // 50px threshold
      setIsUserScrolledUp(!isScrolledToBottom);
    }
  }, []);

  // Auto-scroll when new messages arrive (if user is at bottom)
  useEffect(() => {
    if (messages.length > 0 && !isUserScrolledUp) {
      setTimeout(() => scrollToBottom(), 100); // Small delay to ensure DOM is updated
    }
  }, [messages.length, isUserScrolledUp, scrollToBottom]);

  // Function to search for a specific message in the conversation
  const searchForSpecificMessage = useCallback(
    async (messageId: string) => {
      try {
        const response = await axiosInstance.post(
          `/conversations/search/messages/${conversationId}`,
          { q: messageId }
        );

        const searchResult = await response.data;
        return searchResult.messages?.find(
          (msg: Message) =>
            msg.message_id === messageId || String(msg.id) === messageId
        );
      } catch (error) {
        console.error("Error searching for specific message:", error);
      }
      return null;
    },
    [conversationId]
  );

  // Handle searched message from URL
  useEffect(() => {
    const messageId = searchParams.get("message_id");
    if (!messageId) return;

    // Function to search for message and scroll to it
    const findAndScrollToMessage = () => {
      // Try both message_id formats
      const messageElement =
        document.getElementById(messageId) ||
        document.getElementById(String(messageId)) ||
        document.querySelector(`[id="${messageId}"]`);

      if (messageElement && messagesContainerRef.current) {
        messageElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setHighlightedMessageId(messageId);

        // Remove highlight after 3 seconds
        setTimeout(() => setHighlightedMessageId(null), 3000);

        // Remove message_id from URL without page reload
        const url = new URL(window.location.href);
        url.searchParams.delete("message_id");
        window.history.replaceState({}, "", url.toString());
        return true;
      }
      return false;
    };

    // Function to recursively load messages until target is found
    const loadMessagesUntilFound = async (maxAttempts = 5) => {
      let attempts = 0;

      while (attempts < maxAttempts) {
        // Check if message exists in current messages
        if (findAndScrollToMessage()) {
          return;
        }

        // If no more messages to load, stop trying
        if (!hasMore || loading) {
          break;
        }

        // Try to load more messages
        try {
          await fetchNextPage();
          attempts++;
          // Wait a bit for messages to render
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (error) {
          console.error("Error loading more messages:", error);
          break;
        }
      }

      // If we still haven't found the message through pagination, try searching
      const foundMessage = await searchForSpecificMessage(messageId);
      if (foundMessage) {
        // If found through search, we need to reload the conversation
        // to include this message context - for now just highlight if it's now visible
        setTimeout(() => {
          if (findAndScrollToMessage()) {
            return;
          }
        }, 500);
      } else {
        // Show a toast notification that the message wasn't found
        toast.error("Message not found or may have been deleted", {
          duration: 3000,
        });
      }

      // If we still haven't found the message, remove the URL parameter
      const url = new URL(window.location.href);
      url.searchParams.delete("message_id");
      window.history.replaceState({}, "", url.toString());
    };

    // Only start searching if we have messages loaded
    if (messages.length > 0) {
      setIsSearchingMessage(true);
      // Small delay to ensure messages are rendered
      setTimeout(() => {
        loadMessagesUntilFound().finally(() => {
          setIsSearchingMessage(false);
        });
      }, 500);
    }
  }, [
    messages.length,
    searchParams,
    hasMore,
    loading,
    fetchNextPage,
    searchForSpecificMessage,
  ]);

  const Scroll = useCallback(() => {
    if (messages.length > 0) {
      const messageId = searchParams.get("message_id");
      if (messageId) {
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    }
  }, [messages.length, searchParams, scrollToBottom]);

  // Scroll to bottom on initial load
  useEffect(() => {
    Scroll();
  }, [Scroll]); // Only on conversation change

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Error loading your conversations</p>
      </div>
    );
  }

  // Show loading state while checking block status
  if (blockCheckLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <LucideLoader2 className="w-6 h-6 text-blue-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Show blocked message if user is blocked by receiver
  if (isBlockedByReceiver) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center px-5 py-4 border-b border-black/30 dark:border-gray-800 shrink-0">
          <Link href="/messages" className="mr-6 sm:mr-10" aria-label="Back">
            <LucideArrowLeft
              size={24}
              className="text-gray-900 dark:text-white"
            />
          </Link>
          {receiver && (
            <div className="flex items-center gap-3">
              <Image
                src={profilePicture}
                alt={receiver.name}
                width={40}
                height={40}
                className="object-cover rounded-full"
              />
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  {receiver.name}
                </h2>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center flex-1 p-8">
          <div className="max-w-md text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full dark:bg-gray-700">
              <LucideBan />
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
              href={
                receiver?.is_profile_hidden ? `#` : `/${receiver?.username}`
              }
              className="flex items-center text-sm font-semibold text-gray-900 gap-1 dark:text-white"
            >
              {receiver?.name}
              {receiver?.is_verified && (
                <LucideVerified className="ml-1 text-emerald-600" size={16} />
              )}
            </Link>
            <div className="flex items-center text-xs text-gray-500 gap-1 dark:text-gray-400">
              {receiver?.username && !receiver.is_profile_hidden && (
                <ActiveProfileTag userid={receiver.username} withText />
              )}
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
        className="flex-1 max-h-[calc(100dvh-230px)] p-4 space-y-4 overflow-y-auto overflow-x-hidden bg-white dark:bg-black"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {isSearchingMessage && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center text-sm text-gray-500 gap-2 dark:text-gray-400">
              <LucideLoader2 className="animate-spin" size={16} />
              <span>Searching for message...</span>
            </div>
          </div>
        )}
        {hasMore && (
          <div className="flex items-center justify-center mb-2">
            <button
              disabled={loading}
              onClick={() => fetchNextPage()}
              className="flex items-center justify-center rounded-full cursor-pointer h-7 w-7 aspect-square bg-primary-dark-pink"
            >
              {loading ? (
                <LucideLoader2
                  className="w-4 h-4 text-white animate-spin"
                  size={20}
                />
              ) : (
                <LucideChevronUp stroke="#ffffff" size={20} />
              )}
            </button>
          </div>
        )}
        {messages?.map((message) => (
          <div
            key={message.id} // Use `id` for optimistic messages
            className={`message-bubble transition-all duration-700 ${
              highlightedMessageId ===
              (message.message_id || String(message.id))
                ? "bg-[#fcf1ff] dark:bg-[#fcf1ff]/40 py-2 rounded"
                : ""
            }`}
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
      <div className="sticky bottom-0 z-50 p-4 bg-white border-t border-black/30 dark:bg-black dark:border-gray-950 shrink-0">
        <MessageInputComponent
          receiver={receiver}
          conversationId={conversationId}
          isFirstMessage={messages.length === 0}
          isBlockedByReceiver={isBlockedByReceiver}
        />
      </div>
    </div>
  );
};

export default ChatPage;
