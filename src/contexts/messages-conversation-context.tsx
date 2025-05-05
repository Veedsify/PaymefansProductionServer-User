"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useUserAuthContext } from "@/lib/userUseContext";
import { getSocket } from "@/components/sub_components/sub/socket";
import { MESSAGE_CONFIG } from "@/config/config";
import { getToken } from "@/utils/cookie.get";
import axios from "axios";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

const MessagesConversationContext = createContext<ReturnType<
  typeof useProvideConversations
> | null>(null);

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_TS_EXPRESS_URL,
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

const fetchConversations = async (page: number) => {
  const res = await axiosInstance.get("/conversations/my-conversations", {
    params: {
      page,
      limit: MESSAGE_CONFIG.MESSAGE_PAGINATION,
    },
  });
  return res.data;
};

const useProvideConversations = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["conversations"],
      queryFn: ({ pageParam = 1 }) => fetchConversations(pageParam),
      getNextPageParam: (lastPage) =>
        lastPage?.hasMore ? lastPage.page + 1 : undefined,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      initialPageParam: 1,
    });

  return {
    conversations: data?.pages.flatMap((p) => p.conversations) || [],
    unreadCount: data?.pages[0]?.unreadCount || 0,
    hasMore: hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
};

export const MessagesConversationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { user } = useUserAuthContext();
  const socket = getSocket();
  const userid = useMemo(() => user?.user_id, [user?.user_id]);
  const username = useMemo(() => user?.username, [user?.username]);

  const value = useProvideConversations();

  useEffect(() => {
    if (userid && username) {
      socket.emit("user-connected", {
        userId: userid,
        username,
      });
    }
  }, [userid, username]);

  return (
    <MessagesConversationContext.Provider value={value}>
      {children}
    </MessagesConversationContext.Provider>
  );
};

export const useMessagesConversation = () => {
  const context = useContext(MessagesConversationContext);
  if (!context) {
    throw new Error(
      "useMessagesConversation must be used within a MessagesConversationProvider"
    );
  }
  return context;
};
