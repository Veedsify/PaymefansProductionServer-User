// groupChatStore.ts
import { create } from "zustand";
import { getSocket } from "@/components/sub_components/sub/Socket";
import { useUserStore } from "@/lib/UserUseContext";
import toast from "react-hot-toast";
import React from "react";
import _ from "lodash";
import { fetchGroupMessages } from "@/utils/data/GroupAPI";

export interface GroupMessage {
  id: number;
  groupId: number;
  content: string;
  messageType: string;
  senderId: number;
  sender: {
    user_id: number;
    username: string;
    profile_image: string;
    is_verified: boolean;
  };
  replyTo?: GroupMessage | null;
  attachments: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
  created_at: string;
  timestamp: string;
}

export interface GroupMember {
  userId: string;
  username: string;
  profile_image: string;
  is_verified: boolean;
  role: "ADMIN" | "MODERATOR" | "MEMBER";
  joinedAt: string;
  isActive: boolean;
}

export interface TypingUser {
  userId: string;
  username: string;
  isTyping: boolean;
  timestamp: string;
}

// Define the Zustand store state type
interface GroupChatState {
  messages: GroupMessage[];
  activeMembers: GroupMember[];
  typingUsers: TypingUser[];
  isConnected: boolean;
  currentGroupId: number | null;
  isJoined: boolean;
  // Pagination state
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  currentCursor: number | null;
  totalMessages: number;
}

// Define the Zustand store actions type
interface GroupChatActions {
  setConnected: (connected: boolean) => void;
  joinGroupRoom: (groupId: number) => void;
  leaveGroupRoom: () => void;
  setCurrentGroup: (groupId: number | null) => void;
  addMessage: (message: GroupMessage) => void;
  setMessages: (messages: GroupMessage[]) => void;
  paginateMessages: (messages: GroupMessage[]) => void;
  resetMessages: () => void;
  setActiveMembers: (members: GroupMember[]) => void;
  memberJoined: (member: GroupMember) => void;
  memberLeft: (userId: string) => void;
  setTyping: (user: TypingUser) => void;
  removeTyping: (userId: string) => void;
  messageSeen: (messageId: number, userId: string) => void;

  // Pagination actions
  setLoadingMessages: (loading: boolean) => void;
  setHasMoreMessages: (hasMore: boolean) => void;
  setCursor: (cursor: number | null) => void;
  setTotalMessages: (total: number) => void;
  loadMoreMessages: (groupId: number) => Promise<void>;
  setPaginationData: (data: {
    hasMore: boolean;
    cursor: number | null;
    total: number;
  }) => void;

  // Socket action helpers
  sendMessage: (
    content: string,
    attachments?: any[],
    replyToId?: number,
  ) => void;
  setTypingStatus: (isTyping: boolean) => void;
  markMessageAsSeen: (messageId: number) => void;
  restoreGroupRoom: () => void;

  // Selector helpers
  getMessages: () => GroupMessage[];
  getActiveMembers: () => GroupMember[];
  getTypingUsers: () => TypingUser[];
  getPaginationState: () => {
    isLoadingMessages: boolean;
    hasMoreMessages: boolean;
    currentCursor: number | null;
    totalMessages: number;
  };
}

// Combine state and actions for the store
type GroupChatStore = GroupChatState & GroupChatActions;

// Create the Zustand store
export const useGroupChatStore = create<GroupChatStore>()((set, get) => ({
  // Initial State
  messages: [],
  activeMembers: [],
  typingUsers: [],
  isConnected: false,
  currentGroupId: null,
  isJoined: false,
  // Pagination state
  isLoadingMessages: false,
  hasMoreMessages: true,
  currentCursor: null,
  totalMessages: 0,

  // Actions
  setConnected: (payload) => set({ isConnected: payload }),
  joinGroupRoom: (groupId) => {
    const socket = getSocket();
    const user = useUserStore.getState().user;
    const { isConnected, currentGroupId, isJoined } = get();

    // Don't emit if already joined to this group
    if (currentGroupId === groupId && isJoined) {
      return;
    }

    set({
      currentGroupId: groupId,
      isJoined: true,
    });

    // Emit socket event to actually join the room
    if (socket && user && isConnected) {
      socket.emit("join-group-room", {
        groupId: groupId.toString(),
        userId: user.id.toString(),
      });
    }
  },
  leaveGroupRoom: () => {
    const socket = getSocket();
    const user = useUserStore.getState().user;
    const { isConnected, currentGroupId } = get();

    // Emit socket event to leave the room
    if (socket && user && isConnected && currentGroupId) {
      socket.emit("leave-group-room", {
        groupId: currentGroupId.toString(),
        userId: user.id.toString(),
      });
    }

    set({
      isJoined: false,
      messages: [],
      activeMembers: [],
      typingUsers: [],
      currentGroupId: null,
    });
  },
  setCurrentGroup: (groupId) =>
    set({
      currentGroupId: groupId,
      // Reset pagination when switching groups
      currentCursor: null,
      hasMoreMessages: true,
      totalMessages: 0,
    }),
  addMessage: (message) =>
    set((state) => {
      // Check if message already exists to prevent duplicates
      const messageExists = state.messages.some((m) => m.id === message.id);
      if (messageExists) {
        return state;
      }
      return {
        messages: [...state.messages, message],
      };
    }),
  setMessages: (messages) =>
    set({
      messages: _.reverse(messages),
    }),
  paginateMessages: (messages) =>
    set((state) => {
      // Filter out duplicates before adding
      const existingMessageIds = new Set(state.messages.map((m) => m.id));
      const uniqueNewMessages = messages.filter(
        (message) => !existingMessageIds.has(message.id),
      );

      if (uniqueNewMessages.length === 0) {
        return state;
      }

      const reversedNewMessages = _.reverse([...uniqueNewMessages]);

      const combinedMessages = [...reversedNewMessages, ...state.messages];

      return {
        messages: combinedMessages,
      };
    }),
  resetMessages: () =>
    set({
      messages: [],
      currentCursor: null,
      hasMoreMessages: true,
      totalMessages: 0,
    }),
  setActiveMembers: (members) =>
    set({
      activeMembers: members,
    }),
  memberJoined: (member) =>
    set((state) => {
      const memberExists = state.activeMembers.some(
        (m) => m.userId === member.userId,
      );
      if (memberExists) return state;
      return {
        activeMembers: [...state.activeMembers, member],
      };
    }),
  memberLeft: (userId) =>
    set((state) => ({
      activeMembers: state.activeMembers.filter((m) => m.userId !== userId),
    })),
  setTyping: (user) =>
    set((state) => {
      const updatedTyping = state.typingUsers.filter(
        (t) => t.userId !== user.userId,
      );
      return {
        typingUsers: user.isTyping ? [...updatedTyping, user] : updatedTyping,
      };
    }),
  removeTyping: (userId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter((t) => t.userId !== userId),
    })),
  messageSeen: (messageId, userId) => {
    // Handle message seen status if needed
    // This is a placeholder as the original reducer did nothing
  },

  // Pagination actions
  setLoadingMessages: (loading) => set({ isLoadingMessages: loading }),
  setHasMoreMessages: (hasMore) => set({ hasMoreMessages: hasMore }),
  setCursor: (cursor) => set({ currentCursor: cursor }),
  setTotalMessages: (total) => set({ totalMessages: total }),
  setPaginationData: (data) =>
    set({
      hasMoreMessages: data.hasMore,
      currentCursor: data.cursor,
      totalMessages: data.total,
    }),

  loadMoreMessages: async (groupId) => {
    const { currentCursor, isLoadingMessages, hasMoreMessages } = get();

    if (isLoadingMessages || !hasMoreMessages) return Promise.resolve();

    set({ isLoadingMessages: true });

    try {
      const response = await fetchGroupMessages(groupId, currentCursor, 100);

      if (response.success && response.data) {
        const { messages, nextCursor, hasMore } = response.data;

        // Only proceed if we have messages
        if (messages && messages.length > 0) {
          // Add messages to the beginning of the array (older messages)
          get().paginateMessages(messages);

          set({
            currentCursor: nextCursor || null,
            hasMoreMessages: hasMore,
            isLoadingMessages: false,
          });
        } else {
          set({
            isLoadingMessages: false,
            hasMoreMessages: false,
          });
        }
      } else {
        console.warn("Failed to load more messages:", response);
        set({
          isLoadingMessages: false,
          hasMoreMessages: false,
        });
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
      set({
        isLoadingMessages: false,
        hasMoreMessages: false,
      });
      // Don't throw error to prevent uncaught promise rejections
    }
  },

  // Socket action helpers
  sendMessage: (content, attachments = [], replyToId) => {
    const socket = getSocket();
    const user = useUserStore.getState().user;
    const { isConnected, currentGroupId } = get();

    if (socket && user && isConnected && currentGroupId) {
      socket?.emit("send-group-message", {
        groupId: currentGroupId.toString(),
        content,
        messageType: "text",
        attachments,
        replyToId,
      });

      // Don't add optimistic message - wait for server confirmation
      // This prevents duplicate messages when server broadcasts back
    }
  },
  setTypingStatus: (isTyping) => {
    const socket = getSocket();
    const user = useUserStore.getState().user;
    const { isConnected, currentGroupId } = get();

    if (socket && user && isConnected && currentGroupId) {
      socket?.emit("group-typing", { groupId: currentGroupId, isTyping });
    }
  },
  markMessageAsSeen: (messageId) => {
    const socket = getSocket();
    const user = useUserStore.getState().user;
    const { isConnected, currentGroupId } = get();

    if (socket && user && isConnected && currentGroupId) {
      socket?.emit("group-message-seen", {
        groupId: currentGroupId,
        messageId,
      });
    }
  },
  restoreGroupRoom: () => {
    const socket = getSocket();
    const user = useUserStore.getState().user;
    const { isConnected } = get();

    if (socket && user && isConnected) {
      socket?.emit("restore-group-rooms", { userId: user.id.toString() });
    }
  },

  // Selector helpers
  getMessages: () => get().messages,
  getActiveMembers: () => get().activeMembers,
  getTypingUsers: () => get().typingUsers,
  getPaginationState: () => {
    const { isLoadingMessages, hasMoreMessages, currentCursor, totalMessages } =
      get();
    return { isLoadingMessages, hasMoreMessages, currentCursor, totalMessages };
  },
}));
