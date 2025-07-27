"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { getSocket } from "@/components/sub_components/sub/Socket";
import { useUserStore } from "@/lib/UserUseContext";
import toast from "react-hot-toast";

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

export interface GroupChatState {
  messages: Record<string, GroupMessage[]>;
  activeMembers: Record<string, GroupMember[]>;
  typingUsers: Record<string, TypingUser[]>;
  joinedRooms: string[];
  isConnected: boolean;
  currentGroupId: string | null;
}

type GroupChatAction =
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "JOIN_GROUP_ROOM"; payload: string }
  | { type: "LEAVE_GROUP_ROOM"; payload: string }
  | { type: "SET_CURRENT_GROUP"; payload: string | null }
  | { type: "ADD_MESSAGE"; payload: { groupId: string; message: GroupMessage } }
  | {
      type: "SET_MESSAGES";
      payload: { groupId: string; messages: GroupMessage[] };
    }
  | {
      type: "PAGINATE_MESSAGES";
      payload: { groupId: string; messages: GroupMessage[] };
    }
  | { type: "RESET_MESSAGES"; payload: string }
  | {
      type: "SET_ACTIVE_MEMBERS";
      payload: { groupId: string; members: GroupMember[] };
    }
  | { type: "MEMBER_JOINED"; payload: { groupId: string; member: GroupMember } }
  | { type: "MEMBER_LEFT"; payload: { groupId: string; userId: string } }
  | { type: "SET_TYPING"; payload: { groupId: string; user: TypingUser } }
  | { type: "REMOVE_TYPING"; payload: { groupId: string; userId: string } }
  | {
      type: "MESSAGE_SEEN";
      payload: { groupId: string; messageId: number; userId: string };
    };

const initialState: GroupChatState = {
  messages: {},
  activeMembers: {},
  typingUsers: {},
  joinedRooms: [],
  isConnected: false,
  currentGroupId: null,
};

function groupChatReducer(
  state: GroupChatState,
  action: GroupChatAction,
): GroupChatState {
  switch (action.type) {
    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload };

    case "JOIN_GROUP_ROOM":
      return {
        ...state,
        joinedRooms: [...new Set([...state.joinedRooms, action.payload])],
      };

    case "LEAVE_GROUP_ROOM":
      return {
        ...state,
        joinedRooms: state.joinedRooms.filter(
          (room) => room !== action.payload,
        ),
        messages: { ...state.messages, [action.payload]: [] },
        activeMembers: { ...state.activeMembers, [action.payload]: [] },
        typingUsers: { ...state.typingUsers, [action.payload]: [] },
      };

    case "SET_CURRENT_GROUP":
      return { ...state, currentGroupId: action.payload };

    case "ADD_MESSAGE":
      const { groupId, message } = action.payload;
      const existingMessages = state.messages[groupId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [groupId]: [...existingMessages, message],
        },
      };

    case "SET_MESSAGES":
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.groupId]: action.payload.messages,
        },
      };

    case "PAGINATE_MESSAGES":
      const currentMessages = state.messages[action.payload.groupId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.groupId]: [
            ...action.payload.messages,
            ...currentMessages,
          ],
        },
      };

    case "RESET_MESSAGES":
      return {
        ...state,
        messages: { ...state.messages, [action.payload]: [] },
      };

    case "SET_ACTIVE_MEMBERS":
      return {
        ...state,
        activeMembers: {
          ...state.activeMembers,
          [action.payload.groupId]: action.payload.members,
        },
      };

    case "MEMBER_JOINED":
      const currentMembers = state.activeMembers[action.payload.groupId] || [];
      const memberExists = currentMembers.some(
        (m) => m.userId === action.payload.member.userId,
      );
      if (memberExists) return state;

      return {
        ...state,
        activeMembers: {
          ...state.activeMembers,
          [action.payload.groupId]: [...currentMembers, action.payload.member],
        },
      };

    case "MEMBER_LEFT":
      const membersAfterLeave =
        state.activeMembers[action.payload.groupId] || [];
      return {
        ...state,
        activeMembers: {
          ...state.activeMembers,
          [action.payload.groupId]: membersAfterLeave.filter(
            (m) => m.userId !== action.payload.userId,
          ),
        },
      };

    case "SET_TYPING":
      const currentTyping = state.typingUsers[action.payload.groupId] || [];
      const updatedTyping = currentTyping.filter(
        (t) => t.userId !== action.payload.user.userId,
      );

      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.groupId]: action.payload.user.isTyping
            ? [...updatedTyping, action.payload.user]
            : updatedTyping,
        },
      };

    case "REMOVE_TYPING":
      const typingAfterRemove = state.typingUsers[action.payload.groupId] || [];
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.groupId]: typingAfterRemove.filter(
            (t) => t.userId !== action.payload.userId,
          ),
        },
      };

    case "MESSAGE_SEEN":
      // Handle message seen status if needed
      return state;

    default:
      return state;
  }
}

interface GroupChatContextType {
  state: GroupChatState;
  joinGroupRoom: (groupId: string) => void;
  leaveGroupRoom: (groupId: string) => void;
  sendMessage: (
    groupId: string,
    content: string,
    attachments?: any[],
    replyToId?: number,
  ) => void;
  setTyping: (groupId: string, isTyping: boolean) => void;
  markMessageAsSeen: (groupId: string, messageId: number) => void;
  setCurrentGroup: (groupId: string | null) => void;
  getGroupMessages: (groupId: string) => GroupMessage[];
  getActiveMembers: (groupId: string) => GroupMember[];
  getTypingUsers: (groupId: string) => TypingUser[];
  restoreGroupRooms: () => void;
}

const GroupChatContext = createContext<GroupChatContextType | undefined>(
  undefined,
);

export function GroupChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(groupChatReducer, initialState);
  const user = useUserStore((state) => state.user);
  const socket = getSocket();

  // Socket event listeners
  useEffect(() => {
    if (!socket || !user) return;

    // Connect to group socket namespace
    const handleConnect = () => {
      dispatch({ type: "SET_CONNECTED", payload: true });
      socket.emit("group-user-connected", { userId: user.user_id });
    };

    const handleDisconnect = () => {
      dispatch({ type: "SET_CONNECTED", payload: false });
    };

    const handleNewGroupMessage = (message: GroupMessage) => {
      dispatch({
        type: "ADD_MESSAGE",
        payload: { groupId: message.groupId, message },
      });
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
      dispatch({
        type: "MEMBER_JOINED",
        payload: { groupId: data.groupId, member },
      });
    };

    const handleMemberLeft = (data: { groupId: string; user: any }) => {
      dispatch({
        type: "MEMBER_LEFT",
        payload: { groupId: data.groupId, userId: data.user.id },
      });
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
      dispatch({
        type: "SET_TYPING",
        payload: { groupId: data.groupId, user: typingUser },
      });
    };

    const handleGroupMessageSeen = (data: {
      groupId: string;
      messageId: number;
      userId: string;
    }) => {
      dispatch({ type: "MESSAGE_SEEN", payload: data });
    };

    const handleGroupError = (error: { message: string }) => {
      toast.error(error.message);
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
      dispatch({
        type: "SET_ACTIVE_MEMBERS",
        payload: { groupId: data.groupId, members },
      });
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
      socket.off("group-active-members", handleGroupActiveMembers);
    };
  }, [socket, user]);

  const joinGroupRoom = (groupId: string) => {
    if (socket && user && state.isConnected) {
      socket.emit("join-group-room", { groupId, userId: user.user_id });
      dispatch({ type: "JOIN_GROUP_ROOM", payload: groupId });
    }
  };

  const leaveGroupRoom = (groupId: string) => {
    if (socket && user && state.isConnected) {
      socket.emit("leave-group-room", { groupId, userId: user.user_id });
      dispatch({ type: "LEAVE_GROUP_ROOM", payload: groupId });
    }
  };

  const sendMessage = (
    groupId: string,
    content: string,
    attachments?: any[],
    replyToId?: number,
  ) => {
    if (socket && user && state.isConnected) {
      socket.emit("send-group-message", {
        groupId,
        content,
        messageType: "text",
        attachments: attachments || [],
        replyToId,
      });
    }
  };

  const setTyping = (groupId: string, isTyping: boolean) => {
    if (socket && user && state.isConnected) {
      socket.emit("group-typing", { groupId, isTyping });
    }
  };

  const markMessageAsSeen = (groupId: string, messageId: number) => {
    if (socket && user && state.isConnected) {
      socket.emit("group-message-seen", { groupId, messageId });
    }
  };

  const setCurrentGroup = (groupId: string | null) => {
    dispatch({ type: "SET_CURRENT_GROUP", payload: groupId });
  };

  const restoreGroupRooms = () => {
    if (socket && user && state.isConnected) {
      socket.emit("restore-group-rooms", { userId: user.user_id });
    }
  };

  const getGroupMessages = (groupId: string): GroupMessage[] => {
    return state.messages[groupId] || [];
  };

  const getActiveMembers = (groupId: string): GroupMember[] => {
    return state.activeMembers[groupId] || [];
  };

  const getTypingUsers = (groupId: string): TypingUser[] => {
    return state.typingUsers[groupId] || [];
  };

  const contextValue: GroupChatContextType = {
    state,
    joinGroupRoom,
    leaveGroupRoom,
    sendMessage,
    setTyping,
    markMessageAsSeen,
    setCurrentGroup,
    getGroupMessages,
    getActiveMembers,
    getTypingUsers,
    restoreGroupRooms,
  };

  return (
    <GroupChatContext.Provider value={contextValue}>
      {children}
    </GroupChatContext.Provider>
  );
}

export function useGroupChat(): GroupChatContextType {
  const context = useContext(GroupChatContext);
  if (context === undefined) {
    throw new Error("useGroupChat must be used within a GroupChatProvider");
  }
  return context;
}
