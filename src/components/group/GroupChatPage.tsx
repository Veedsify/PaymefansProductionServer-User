"use client";

import Link from "next/link";
import {
  LucideArrowLeft,
  LucideChevronLeft,
  LucideLoader2,
  LucideSettings,
  LucideUsers,
  LucideVerified,
} from "lucide-react";
import Image from "next/image";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useRouter, useParams } from "next/navigation";
import { useGroupChat, GroupMessage } from "@/contexts/GroupChatContext";
import GroupMessageInputComponent from "./GroupMessageInputComponent";
import { useUserStore } from "@/lib/UserUseContext";
import { getToken } from "@/utils/Cookie";
import toast from "react-hot-toast";
import {
  fetchGroupData,
  fetchGroupMessages,
  GroupData,
} from "@/utils/data/GroupAPI";
import GroupMessageBubble from "./GroupMessageBubble";

const GroupChatPage = () => {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const user = useUserStore((state) => state.user);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    state,
    joinGroupRoom,
    leaveGroupRoom,
    setCurrentGroup,
    getGroupMessages,
    getActiveMembers,
    getTypingUsers,
    markMessageAsSeen,
    restoreGroupRooms,
  } = useGroupChat();

  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    number | null
  >(null);
  const [isSearchingMessage, setIsSearchingMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<number | undefined>();
  const [hasMore, setHasMore] = useState(true);

  // Fetch group data
  const {
    data: groupData,
    isError: isGroupError,
    isLoading: isGroupLoading,
  } = useQuery({
    queryKey: ["groupData", groupId],
    queryFn: () => fetchGroupData(groupId),
    refetchInterval: false,
    refetchOnMount: true,
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get messages from context
  const messages = getGroupMessages(groupId);
  const activeMembers = getActiveMembers(groupId);
  const typingUsers = getTypingUsers(groupId);

  // Profile picture with fallback
  const groupProfilePicture = useMemo(
    () => groupData?.groupIcon || "/site/avatar.png",
    [groupData],
  );

  // Initialize group room and messages
  useEffect(() => {
    if (!groupId || !user || !state.isConnected) return;

    const initializeGroup = async () => {
      setLoading(true);
      setError(null);

      try {
        // Join the group room
        joinGroupRoom(groupId);
        setCurrentGroup(groupId);

        // Fetch initial messages if not already loaded
        if (messages.length === 0) {
          const res = await fetchGroupMessages(groupId);
          // Messages would be handled by the socket context
          setNextCursor(res.data.nextCursor ?? undefined);
          setHasMore(!!res.data.nextCursor);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load group");
        console.error("Error initializing group:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeGroup();

    // Cleanup on unmount
    return () => {
      leaveGroupRoom(groupId);
      setCurrentGroup(null);
    };
  }, [groupId, user, state.isConnected]);

  // Restore group rooms on reconnection
  useEffect(() => {
    if (state.isConnected && user) {
      restoreGroupRooms();
    }
  }, [state.isConnected, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!isUserScrolledUp && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isUserScrolledUp]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop === clientHeight;
      setIsUserScrolledUp(!isAtBottom);

      // Load more messages when scrolled to top
      if (scrollTop === 0 && hasMore && !loading) {
        loadMoreMessages();
      }
    }
  }, [hasMore, loading]);

  const loadMoreMessages = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const res = await fetchGroupMessages(groupId, nextCursor);
      setNextCursor(res.data.nextCursor ?? undefined);
      setHasMore(!!res.data.nextCursor);
    } catch (err) {
      console.error("Error loading more messages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mark messages as seen when they come into view
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.senderId !== user?.user_id) {
        markMessageAsSeen(groupId, latestMessage.id);
      }
    }
  }, [messages, groupId, user]);

  // Handle group error or if user is not a member
  if (isGroupError || (!groupData && !isGroupLoading)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Group Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This group doesn't exist or you don't have access to it.
          </p>
          <Link
            href="/groups"
            className="inline-flex items-center px-4 py-2 bg-primary-dark-pink text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <LucideArrowLeft size={16} className="mr-2" />
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  if (isGroupLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LucideLoader2 className="animate-spin w-8 h-8 text-primary-dark-pink" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Group Header */}
      <div className="flex items-center border-b dark:border-gray-800 py-3 px-5 bg-white dark:bg-gray-900">
        <div className="mr-4 sm:mr-6 dark:text-white">
          <Link href="/groups">
            <LucideChevronLeft
              size={30}
              className="cursor-pointer hover:text-primary-dark-pink transition-colors"
            />
          </Link>
        </div>

        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <Image
              className="rounded-full aspect-square object-cover"
              width={50}
              height={50}
              priority
              src={groupProfilePicture}
              alt={groupData?.name || "Group"}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/site/avatar.png";
              }}
            />
            {/* Online indicator for active members */}
            {activeMembers.length > 0 && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            )}
          </div>

          <div className="dark:text-white flex-1">
            <div className="font-bold text-sm md:text-base flex items-center gap-2">
              <span>{groupData?.name}</span>
              {groupData?.admin.is_verified && (
                <LucideVerified size={16} className="text-blue-500" />
              )}
            </div>
            <div className="flex gap-1 items-center text-xs md:text-xs text-gray-600 dark:text-gray-400">
              <LucideUsers size={12} />
              <span>{groupData?.membersCount} members</span>
              {activeMembers.length > 0 && (
                <>
                  <span>•</span>
                  <span>{activeMembers.length} online</span>
                </>
              )}
              {typingUsers.length > 0 && (
                <>
                  <span>•</span>
                  <span className="text-primary-dark-pink">
                    {typingUsers.length === 1
                      ? `${typingUsers[0].username} is typing...`
                      : `${typingUsers.length} people are typing...`}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Group Actions */}
        <div className="flex items-center gap-2 dark:text-white">
          <Link href={`/groups/settings/${groupId}`}>
            <LucideSettings
              size={20}
              className="cursor-pointer hover:text-primary-dark-pink transition-colors"
            />
          </Link>
        </div>
      </div>

      {/* Messages Container */}
      <div className="relative flex-1 flex flex-col">
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 w-full h-full max-h-[calc(100vh-300px)] lg:max-h-[calc(100vh-187px)] overflow-y-auto p-4 md:p-6 space-y-4"
        >
          {/* Loading indicator for pagination */}
          {loading && (
            <div className="flex justify-center py-4">
              <LucideLoader2 className="animate-spin w-6 h-6 text-primary-dark-pink" />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="text-center py-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Messages */}
          {messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-gray-500 dark:text-gray-400">
                <LucideUsers size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  Welcome to {groupData?.name}!
                </h3>
                <p className="text-sm">
                  Start the conversation by sending your first message.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <GroupMessageBubble
                key={message.id}
                message={message}
                isHighlighted={highlightedMessageId === message.id}
                currentUserId={user?.user_id || ""}
                groupData={groupData}
              />
            ))
          )}
        </div>

        {/* Scroll to bottom button */}
        {isUserScrolledUp && (
          <button
            onClick={() => {
              if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop =
                  messagesContainerRef.current.scrollHeight;
                setIsUserScrolledUp(false);
              }
            }}
            className="absolute bottom-20 right-6 bg-primary-dark-pink text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-all z-10"
          >
            <LucideArrowLeft size={20} className="rotate-[-90deg]" />
          </button>
        )}

        {/* Message Input */}
        <GroupMessageInputComponent
          groupId={groupId}
          groupData={groupData}
          disabled={!state.isConnected || !groupData?.isActive}
        />
      </div>
    </div>
  );
};

export default GroupChatPage;
