// groupChatStore.ts
import { create } from "zustand";
import { getSocket } from "@/components/sub_components/sub/Socket";
import { useUserStore } from "@/lib/UserUseContext";
import toast from "react-hot-toast";
import React from "react";

export interface GroupMessage {
  id: number;
  groupId: string;
  content: string;
  messageType: string;
  senderId: string;
  sender: {
    user_id: string;
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
  createdAt: string;
  timestamp: string;
}

interface GroupMember {
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
  messages: Record<string, GroupMessage[]>;
  activeMembers: Record<string, GroupMember[]>;
  typingUsers: Record<string, TypingUser[]>;
  joinedRooms: string[];
  isConnected: boolean;
  currentGroupId: string | null;
}

// Define the Zustand store actions type
interface GroupChatActions {
  setConnected: (connected: boolean) => void;
  joinGroupRoom: (groupId: string) => void;
  leaveGroupRoom: (groupId: string) => void;
  setCurrentGroup: (groupId: string | null) => void;
  addMessage: (groupId: string, message: GroupMessage) => void;
  setMessages: (groupId: string, messages: GroupMessage[]) => void;
  paginateMessages: (groupId: string, messages: GroupMessage[]) => void;
  resetMessages: (groupId: string) => void;
  setActiveMembers: (groupId: string, members: GroupMember[]) => void;
  memberJoined: (groupId: string, member: GroupMember) => void;
  memberLeft: (groupId: string, userId: string) => void;
  setTyping: (groupId: string, user: TypingUser) => void;
  removeTyping: (groupId: string, userId: string) => void;
  messageSeen: (groupId: string, messageId: number, userId: string) => void;

  // Socket action helpers (will be called by the hook)
  sendMessage: (
    groupId: string,
    content: string,
    attachments?: any[],
    replyToId?: number,
  ) => void;
  setTypingStatus: (groupId: string, isTyping: boolean) => void;
  markMessageAsSeen: (groupId: string, messageId: number) => void;
  restoreGroupRooms: () => void;

  // Selector helpers (optional, but convenient)
  getGroupMessages: (groupId: string) => GroupMessage[];
  getActiveMembers: (groupId: string) => GroupMember[];
  getTypingUsers: (groupId: string) => TypingUser[];
}

// Combine state and actions for the store
type GroupChatStore = GroupChatState & GroupChatActions;

// Create the Zustand store
export const useGroupChatStore = create<GroupChatStore>()((set, get) => ({
  // Initial State
  messages: {},
  activeMembers: {},
  typingUsers: {},
  joinedRooms: [],
  isConnected: false,
  currentGroupId: null,

  // Actions
  setConnected: (payload) => set({ isConnected: payload }),
  joinGroupRoom: (groupId) =>
    set((state) => ({
      joinedRooms: [...new Set([...state.joinedRooms, groupId])],
    })),
  leaveGroupRoom: (groupId) =>
    set((state) => ({
      joinedRooms: state.joinedRooms.filter((room) => room !== groupId),
      messages: { ...state.messages, [groupId]: [] },
      activeMembers: { ...state.activeMembers, [groupId]: [] },
      typingUsers: { ...state.typingUsers, [groupId]: [] },
    })),
  setCurrentGroup: (groupId) => set({ currentGroupId: groupId }),
  addMessage: (groupId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [groupId]: [...(state.messages[groupId] || []), message],
      },
    })),
  setMessages: (groupId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [groupId]: messages,
      },
    })),
  paginateMessages: (groupId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [groupId]: [...messages, ...(state.messages[groupId] || [])],
      },
    })),
  resetMessages: (groupId) =>
    set((state) => ({
      messages: { ...state.messages, [groupId]: [] },
    })),
  setActiveMembers: (groupId, members) =>
    set((state) => ({
      activeMembers: {
        ...state.activeMembers,
        [groupId]: members,
      },
    })),
  memberJoined: (groupId, member) =>
    set((state) => {
      const currentMembers = state.activeMembers[groupId] || [];
      const memberExists = currentMembers.some(
        (m) => m.userId === member.userId,
      );
      if (memberExists) return state; // No change if member already exists
      return {
        activeMembers: {
          ...state.activeMembers,
          [groupId]: [...currentMembers, member],
        },
      };
    }),
  memberLeft: (groupId, userId) =>
    set((state) => ({
      activeMembers: {
        ...state.activeMembers,
        [groupId]: (state.activeMembers[groupId] || []).filter(
          (m) => m.userId !== userId,
        ),
      },
    })),
  setTyping: (groupId, user) =>
    set((state) => {
      const currentTyping = state.typingUsers[groupId] || [];
      const updatedTyping = currentTyping.filter(
        (t) => t.userId !== user.userId,
      );
      return {
        typingUsers: {
          ...state.typingUsers,
          [groupId]: user.isTyping ? [...updatedTyping, user] : updatedTyping,
        },
      };
    }),
  removeTyping: (groupId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [groupId]: (state.typingUsers[groupId] || []).filter(
          (t) => t.userId !== userId,
        ),
      },
    })),
  messageSeen: (groupId, messageId, userId) =>
    set((state) => {
      // Handle message seen status if needed
      // Example: Update message state to mark as seen by userId
      // This is a placeholder as the original reducer did nothing
      return state;
    }),

  // Socket action helpers (call socket.emit)
  sendMessage: (groupId, content, attachments = [], replyToId) => {
    const socket = getSocket();
    const user = useUserStore.getState().user;
    const { isConnected } = get();

    if (socket && user && isConnected) {
      socket.emit("send-group-message", {
        groupId,
        content,
        messageType: "text",
        attachments,
        replyToId,
      });

      // Optimistically add the message to the UI
      const optimisticMessage: GroupMessage = {
        id: Date.now(), // Temporary ID, will be replaced by server response
        groupId,
        content,
        messageType: "text",
        senderId: user.id.toString(),
        sender: {
          user_id: user.id.toString(),
          username: user.username || user.name,
          profile_image: user.profile_image || "/site/avatar.png",
          is_verified: user.is_verified || false,
        },
        replyTo: replyToId
          ? get().messages[groupId]?.find((m) => m.id === replyToId) || null
          : null,
        attachments: attachments || [],
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      };

      // Add the message to the specific group's messages
      set((state) => ({
        messages: {
          ...state.messages,
          [groupId]: [...(state.messages[groupId] || []), optimisticMessage],
        },
      }));
    }
  },
  setTypingStatus: (groupId, isTyping) => {
    const socket = getSocket();
    const user = useUserStore.getState().user;
    const { isConnected } = get();

    if (socket && user && isConnected) {
      socket.emit("group-typing", { groupId, isTyping });
    }
  },
  markMessageAsSeen: (groupId, messageId) => {
    const socket = getSocket();
    const user = useUserStore.getState().user;
    const { isConnected } = get();

    if (socket && user && isConnected) {
      socket.emit("group-message-seen", { groupId, messageId });
    }
  },
  restoreGroupRooms: () => {
    const socket = getSocket();
    const user = useUserStore.getState().user;
    const { isConnected } = get();

    if (socket && user && isConnected) {
      socket.emit("restore-group-rooms", { userId: user.id.toString() });
    }
  },

  // Selector helpers (optional, but convenient)
  getGroupMessages: (groupId) => get().messages[groupId] || [],
  getActiveMembers: (groupId) => get().activeMembers[groupId] || [],
  getTypingUsers: (groupId) => get().typingUsers[groupId] || [],
}));

// Hook to manage socket listeners (replaces useEffect in context provider)
export const useGroupChatSocketListeners = () => {
  const {
    setConnected,
    addMessage,
    memberJoined,
    memberLeft,
    setTyping,
    messageSeen,
    setActiveMembers,
    joinGroupRoom, // Needed for the group-room-joined handler
  } = useGroupChatStore();

  // We need to get the latest user state inside the listeners
  const user = useUserStore((state) => state.user);

  React.useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    const handleConnect = () => {
      setConnected(true);
      socket.emit("group-user-connected", { userId: user.id.toString() });
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleNewGroupMessage = (message: GroupMessage) => {
      addMessage(message.groupId, message);
    };

    const handleMemberJoined = (data: {
      groupId: string;
      user: any;
      timestamp?: string;
    }) => {
      const member: GroupMember = {
        userId: data.user.id,
        username: data.user.username,
        profile_image: data.user.profile_image || "/site/avatar.png",
        is_verified: data.user.is_verified || false,
        role: "MEMBER",
        joinedAt: data.timestamp || new Date().toISOString(),
        isActive: true,
      };
      memberJoined(data.groupId, member);
    };

    const handleMemberLeft = (data: { groupId: string; user: any }) => {
      memberLeft(data.groupId, data.user.id);
    };

    const handleGroupTyping = (data: {
      groupId: string;
      userId: string;
      username: string;
      isTyping: boolean;
      timestamp: string;
    }) => {
      const typingUser: TypingUser = {
        userId: data.userId,
        username: data.username,
        isTyping: data.isTyping,
        timestamp: data.timestamp,
      };
      setTyping(data.groupId, typingUser);
    };

    const handleGroupMessageSeen = (data: {
      groupId: string;
      messageId: number;
      userId: string;
    }) => {
      messageSeen(data.groupId, data.messageId, data.userId);
    };

    const handleGroupError = (error: { message: string }) => {
      console.error("Group chat error:", error);
      toast.error(error.message);
    };

    const handleGroupRoomJoined = (data: {
      groupId: string;
      roomName: string;
      message: string;
    }) => {
      console.log("Successfully joined group room:", data);
      // Zustand doesn't have a direct toast like the context did,
      // but you can call toast here or handle it in the component calling joinGroupRoom
      toast.success(`Joined group chat successfully`);
      // Ensure the room is in the joinedRooms list
      joinGroupRoom(data.groupId);
    };

    const handleGroupActiveMembers = (data: {
      groupId: string;
      members: any[];
    }) => {
      const members: GroupMember[] = data.members.map((member) => ({
        userId: member.userId,
        username: member.username,
        profile_image: member.profile_image || "/site/avatar.png",
        is_verified: member.is_verified || false,
        role: member.role || "MEMBER",
        joinedAt: member.joinedAt,
        isActive: true,
      }));
      setActiveMembers(data.groupId, members);
    };

    // Register event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("new-group-message", handleNewGroupMessage);
    socket.on("group-member-joined", handleMemberJoined);
    socket.on("group-member-left", handleMemberLeft);
    socket.on("group-typing", handleGroupTyping);
    socket.on("group-message-seen", handleGroupMessageSeen);
    socket.on("group-error", handleGroupError);
    socket.on("group-room-joined", handleGroupRoomJoined);
    socket.on("group-active-members", handleGroupActiveMembers);

    // If socket is already connected, emit user connected
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("new-group-message", handleNewGroupMessage);
      socket.off("group-member-joined", handleMemberJoined);
      socket.off("group-member-left", handleMemberLeft);
      socket.off("group-typing", handleGroupTyping);
      socket.off("group-message-seen", handleGroupMessageSeen);
      socket.off("group-error", handleGroupError);
      socket.off("group-room-joined", handleGroupRoomJoined);
      socket.off("group-active-members", handleGroupActiveMembers);
    };
  }, [
    user,
    setConnected,
    addMessage,
    memberJoined,
    memberLeft,
    setTyping,
    messageSeen,
    setActiveMembers,
    joinGroupRoom,
  ]); // Dependencies
};

// Optional: Create a hook that combines the store and socket setup for convenience
export const useGroupChat = () => {
  // This hook ensures socket listeners are set up when the hook is used
  useGroupChatSocketListeners();

  // Return the entire store state and actions
  return useGroupChatStore();
};
