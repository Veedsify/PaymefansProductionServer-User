"use client";
import { socket } from "@/components/sub_components/sub/socket";
import { useUserAuthContext } from "@/lib/userUseContext";
import { UserConversations } from "@/types/components";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { getToken } from "@/utils/cookie.get";
import _ from "lodash";
import { MESSAGE_CONFIG } from "@/config/config";
import { create } from "zustand";
import { Conversation } from "@/types/conversations";
import toast from "react-hot-toast";

interface MessageContextType {
  conversations: UserConversations[];
  hasMore: boolean;
  unreadCount: number;
  page: number;
  setPage: (number: number) => void;
  setHasMore: (value: boolean) => void;
  setConversations: (Conversation: UserConversations[]) => void;
  setCount: (number: number) => void;
}

export const useMessageContext = create<MessageContextType>((set) => ({
  conversations: [],
  unreadCount: 0,
  hasMore: false,
  page: 1,
  setPage: (number) => set({ page: number }),
  setHasMore: (value) => set((state) => ({ hasMore: value })),
  setConversations: (conversations) =>
    set((state) => {
      return {
        conversations: Array.from(
          [...state.conversations, ...conversations].reduce((map, obj) => {
            map.set(obj.conversation_id, obj); // Always overwrite with the latest object
            return map;
          }, new Map<string, UserConversations>())
        ).map(([_, value]) => value),
      };
    }),
  setCount: (number) =>
    set({
      unreadCount: number,
    }),
}));

export const MessagesConversationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user } = useUserAuthContext();
  const { setConversations, page, setCount, setHasMore, conversations } =
    useMessageContext();

  const userid = useMemo(() => user?.user_id, [user?.user_id]);
  const username = useMemo(() => user?.username, [user?.username]);
  const token = getToken();

  useEffect(() => {
    if (userid && username) {
      socket.emit("user-connected", {
        userId: userid,
        username: username,
      });
    }
  }, [userid, username]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/conversations/my-conversations?page=${page}&limit=${MESSAGE_CONFIG.MESSAGE_PAGINATION}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setConversations(response.data.conversations);
        setCount(response.data.unreadCount);
        setHasMore(response.data.hasMore);
      } catch (error) {
        console.error(error);
      }
    };

    // Initial fetch
    fetchConversations();

    // Define the handler outside to use the same reference
    const handlePrefetch = () => {
      fetchConversations();
    };

    // Add socket listener
    socket.on("prefetch-conversations", handlePrefetch);

    // Cleanup with the same handler reference
    return () => {
      socket.off("prefetch-conversations", handlePrefetch);
    };
  }, [page, token, setConversations, setCount, setHasMore]); // Remove setState functions from dependencies

  return <>{children}</>;
};
