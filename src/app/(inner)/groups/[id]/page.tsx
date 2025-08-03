"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import GroupChatHeader from "@/components/group/GroupChatHeader";
import GroupChatInput from "@/components/group/GroupChatInput";
import GroupMessageBubble from "@/components/group/GroupMessageBubble";
import { motion } from "framer-motion";
import {
  GroupMessage,
  GroupMember,
  useGroupChatStore,
  TypingUser,
} from "@/contexts/GroupChatContext";
import {
  fetchGroupMessages,
  fetchGroupData,
  GroupData,
} from "@/utils/data/GroupAPI";
import { useUserAuthContext, useUserStore } from "@/lib/UserUseContext";
import toast from "react-hot-toast";
import { getSocket } from "@/components/sub_components/sub/Socket";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";
const GroupChatPage = () => {
  const params = useParams();
  const groupId = Number(params.id) as number;
  const { user } = useUserAuthContext();
  const router = useRouter();

  const {
    setCurrentGroup,
    getMessages,
    setMessages,
    isConnected,
    currentGroupId,
    leaveGroupRoom,
    getTypingUsers,
    loadMoreMessages,
    getPaginationState,
    setPaginationData,
  } = useGroupChatStore();

  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messages = getMessages();
  const typingUsers = getTypingUsers();
  const { isLoadingMessages, hasMoreMessages, totalMessages } =
    getPaginationState();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);

  const {
    setConnected,
    addMessage,
    memberJoined,
    memberLeft,
    setTyping,
    messageSeen,
    setActiveMembers,
    joinGroupRoom,
  } = useGroupChatStore();

  // Scroll to bottom function
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // Check if user is near bottom of chat
  const checkIfNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    const threshold = 100; // pixels from bottom
    return scrollHeight - scrollTop - clientHeight < threshold;
  }, []);

  // Handle scroll event
  const handleScroll = useCallback(() => {
    setIsNearBottom(checkIfNearBottom());
  }, [checkIfNearBottom]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    const handleConnect = () => {
      setConnected(true);
      socket?.emit("group-user-connected", { userId: user.id.toString() });
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleNewGroupMessage = (message: GroupMessage) => {
      // Only add message if it's for the current group
      if (
        message.groupId === currentGroupId ||
        message.groupId.toString() === currentGroupId?.toString()
      ) {
        const wasNearBottom = checkIfNearBottom();
        addMessage(message);

        // Auto-scroll to bottom if user was near bottom or if it's their own message
        if (wasNearBottom || message.senderId === user?.id) {
          setTimeout(() => scrollToBottom(), 100);
        }
      }
    };

    const handleMemberJoined = (data: {
      groupId: number;
      user: any;
      timestamp?: string;
    }) => {
      // Only handle if it's for the current group
      if (
        data.groupId === currentGroupId ||
        data.groupId.toString() === currentGroupId?.toString()
      ) {
        const member: GroupMember = {
          userId: data.user.id.toString(),
          username: data.user.username,
          profile_image: data.user.profile_image || "/site/avatar.png",
          is_verified: data.user.is_verified || false,
          role: "MEMBER",
          joinedAt: data.timestamp || new Date().toISOString(),
          isActive: true,
        };
        memberJoined(member);
      }
    };

    const handleMemberLeft = (data: { groupId: number; user: any }) => {
      // Only handle if it's for the current group
      if (
        data.groupId === currentGroupId ||
        data.groupId.toString() === currentGroupId?.toString()
      ) {
        memberLeft(data.user.id.toString());
      }
    };

    const handleGroupTyping = (data: {
      groupId: number;
      userId: string;
      username: string;
      isTyping: boolean;
      timestamp: string;
    }) => {
      // Only handle if it's for the current group
      if (
        data.groupId === currentGroupId ||
        data.groupId.toString() === currentGroupId?.toString()
      ) {
        const typingUser: TypingUser = {
          userId: data.userId,
          username: data.username,
          isTyping: data.isTyping,
          timestamp: data.timestamp,
        };
        setTyping(typingUser);
      }
    };

    const handleGroupMessageSeen = (data: {
      groupId: number;
      messageId: number;
      userId: string;
    }) => {
      // Only handle if it's for the current group
      if (
        data.groupId === currentGroupId ||
        data.groupId.toString() === currentGroupId?.toString()
      ) {
        messageSeen(data.messageId, data.userId);
      }
    };

    const handleGroupError = (error: { message: string }) => {
      toast.error(error.message);
    };

    const handleGroupRoomJoined = (data: {
      groupId: number;
      roomName: string;
      message: string;
    }) => {
      // Only handle if it's for the current group
      if (
        data.groupId === currentGroupId ||
        data.groupId.toString() === currentGroupId?.toString()
      ) {
        // toast.success(`Joined group chat successfully`);
      }
    };

    const handleGroupActiveMembers = (data: {
      groupId: number;
      members: any[];
    }) => {
      // Only handle if it's for the current group
      if (
        data.groupId === currentGroupId ||
        data.groupId.toString() === currentGroupId?.toString()
      ) {
        const members: GroupMember[] = data.members.map((member) => ({
          userId: member.userId.toString(),
          username: member.username,
          profile_image: member.profile_image || "/site/avatar.png",
          is_verified: member.is_verified || false,
          role: member.role || "MEMBER",
          joinedAt: member.joinedAt,
          isActive: true,
        }));
        setActiveMembers(members);
      }
    };

    // Register event listeners
    socket?.on("connect", handleConnect);
    socket?.on("disconnect", handleDisconnect);
    socket?.on("new-group-message", handleNewGroupMessage);
    socket?.on("group-member-joined", handleMemberJoined);
    socket?.on("group-member-left", handleMemberLeft);
    socket?.on("group-typing", handleGroupTyping);
    socket?.on("group-message-seen", handleGroupMessageSeen);
    socket?.on("group-error", handleGroupError);
    socket?.on("group-room-joined", handleGroupRoomJoined);
    socket?.on("group-active-members", handleGroupActiveMembers);

    // If socket is already connected, emit user connected
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket?.off("connect", handleConnect);
      socket?.off("disconnect", handleDisconnect);
      socket?.off("new-group-message", handleNewGroupMessage);
      socket?.off("group-member-joined", handleMemberJoined);
      socket?.off("group-member-left", handleMemberLeft);
      socket?.off("group-typing", handleGroupTyping);
      socket?.off("group-message-seen", handleGroupMessageSeen);
      socket?.off("group-error", handleGroupError);
      socket?.off("group-room-joined", handleGroupRoomJoined);
      socket?.off("group-active-members", handleGroupActiveMembers);
    };
  }, [
    user,
    currentGroupId,
    setConnected,
    addMessage,
    memberJoined,
    memberLeft,
    setTyping,
    messageSeen,
    setActiveMembers,
    joinGroupRoom,
    checkIfNearBottom,
    scrollToBottom,
  ]);

  useEffect(() => {
    if (!groupId || !user) return;

    // If switching to a different group, clear previous group data
    if (currentGroupId && currentGroupId !== groupId) {
      leaveGroupRoom();
    }

    setLoading(true);
    setError(null);

    const initializeGroupChat = async () => {
      try {
        // Fetch group data
        const group = await fetchGroupData(groupId);
        setGroupData(group);

        // Set current group in context
        setCurrentGroup(groupId);

        // Fetch initial messages
        const messagesResponse = await fetchGroupMessages(
          groupId,
          undefined,
          100
        );
        if (messagesResponse.success && messagesResponse.data.messages) {
          setMessages(messagesResponse.data.messages);

          // Set pagination data
          const { pagination, nextCursor, hasMore } = messagesResponse.data;
          setPaginationData({
            hasMore: hasMore,
            cursor: nextCursor || null,
            total: pagination?.total || messagesResponse.data.messages.length,
          });

          // Scroll to bottom after initial load
          setTimeout(() => scrollToBottom(false), 100);
        }

        // Room will be joined when socket connects (handled in separate useEffect)
      } catch (err: any) {
        setError(err.message || "Failed to load group chat");
        toast.error("Failed to load group chat", {
          id: "group-chat-error",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeGroupChat();
  }, [
    groupId,
    user,
    isConnected,
    joinGroupRoom,
    setCurrentGroup,
    setMessages,
    scrollToBottom,
    setPaginationData,
    currentGroupId,
    leaveGroupRoom,
  ]);

  // Join group room when socket connects and we have set the current group
  useEffect(() => {
    if (isConnected && currentGroupId === groupId && user && !loading) {
      joinGroupRoom(groupId);
    }
  }, [isConnected, currentGroupId, groupId, user, joinGroupRoom, loading]);

  // Cleanup when component unmounts or group changes
  useEffect(() => {
    return () => {
      if (currentGroupId === groupId) {
        leaveGroupRoom();
      }
    };
  }, [groupId, currentGroupId, leaveGroupRoom]);

  // Handle infinite scroll for loading more messages
  const handleLoadMore = useCallback(() => {
    if (groupId && hasMoreMessages && !isLoadingMessages) {
      const container = messagesContainerRef.current;
      if (!container) return;

      // Store current scroll position relative to the bottom
      const scrollBottom = container.scrollHeight - container.scrollTop;

      loadMoreMessages(groupId).then(() => {
        // Maintain scroll position after loading more messages
        setTimeout(() => {
          if (container) {
            const newScrollTop = container.scrollHeight - scrollBottom;
            container.scrollTop = newScrollTop;
          }
        }, 50);
      });
    }
  }, [groupId, hasMoreMessages, isLoadingMessages, loadMoreMessages]);

  // Effect to handle scroll to bottom for new messages
  useEffect(() => {
    if (messages.length > prevMessagesLength && isNearBottom) {
      scrollToBottom();
    }
    setPrevMessagesLength(messages.length);
  }, [messages.length, prevMessagesLength, isNearBottom, scrollToBottom]);

  // Attach scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  if (loading) {
    return (
      <LoadingSpinner
        size="lg"
        text="Loading group chat..."
        className="flex-col items-center justify-center h-full"
      />
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-4 text-red-500">{error}</p>
        <button
          onClick={() => router.push("/groups")}
          className="px-4 py-2 text-white bg-primary-dark-pink rounded-md hover:bg-primary-text-dark-pink cursor-pointer"
        >
          Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <GroupChatHeader groupData={groupData} />
      <div
        ref={messagesContainerRef}
        className="flex-grow overflow-y-auto p-6 space-y-4 h-auto transition-all max-h-[calc(100vh-235px)]"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {/* Load more trigger for infinite scroll */}
            {hasMoreMessages && (
              <div className="flex justify-center py-4">
                {isLoadingMessages ? (
                  <LoadingSpinner size="sm" text="Loading more messages..." />
                ) : (
                  <button
                    onClick={handleLoadMore}
                    className="px-4 py-2 text-sm border rounded-full text-primary-dark-pink hover:text-primary-text-dark-pink transition-colors hover:bg-gray-50 border-primary-dark-pink/20"
                  >
                    Load more messages
                  </button>
                )}
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <GroupMessageBubble
                key={message.id}
                message={message}
                isSender={message.senderId === user?.id}
              />
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center px-4 py-2 space-x-2">
                <div className="flex space-x-1">
                  {/* Framer Motion animated typing dots */}
                  {["0", "0.1", "0.2"].map((delay, idx) => (
                    <motion.div
                      key={idx}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      initial={{ y: 0, opacity: 0.7 }}
                      animate={{
                        y: [0, -6, 0],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.7,
                        ease: "easeInOut",
                        delay: Number(delay),
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {typingUsers.length === 1
                    ? `${typingUsers[0].username} is typing...`
                    : `${typingUsers.length} people are typing...`}
                </span>
              </div>
            )}
          </>
        )}

        {/* Scroll to bottom button */}
        {!isNearBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom()}
            className="fixed z-10 p-3 text-white rounded-full shadow-lg bottom-24 right-6 bg-primary-dark-pink hover:bg-primary-text-dark-pink transition-colors"
            aria-label="Scroll to bottom"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.button>
        )}
      </div>
      <div className="flex-shrink-0 border-t">
        <GroupChatInput />
      </div>
    </div>
  );
};

export default GroupChatPage;
