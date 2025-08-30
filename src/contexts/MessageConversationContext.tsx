"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useAuthContext } from "@/contexts/UserUseContext";
import { getSocket } from "@/components/common/Socket";
import { MESSAGE_CONFIG } from "@/config/config";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/utils/Axios";

const MessageConversationContext = createContext<ReturnType<
  typeof useProvideConversations
> | null>(null);

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
  const queryClient = useQueryClient();
  const { isGuest } = useAuthContext();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["conversations"],
      queryFn: ({ pageParam = 1 }) => fetchConversations(pageParam),
      getNextPageParam: (lastPage) =>
        lastPage?.hasMore ? lastPage.page + 1 : undefined,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnMount: false,
      enabled: !isGuest,
      refetchOnWindowFocus: false,
      initialPageParam: 1,
    });

  // Listen for socket events to invalidate conversations and update unread count
  useEffect(() => {
    const socket = getSocket();

    // Handle conversation prefetch events
    const handlePrefetchConversations = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    // Handle unread count updates
    const handleUnreadCountUpdate = (data: { unreadCount: number }) => {
      queryClient.setQueryData(["conversations"], (oldData: any) => {
        if (!oldData) return oldData;

        // Update the unread count in the first page
        const newPages = [...oldData.pages];
        if (newPages[0]) {
          newPages[0] = { ...newPages[0], unreadCount: data.unreadCount };
        }

        return { ...oldData, pages: newPages };
      });
    };

    socket?.on("prefetch-conversations", handlePrefetchConversations);
    socket?.on("unread-count-updated", handleUnreadCountUpdate);

    return () => {
      socket?.off("prefetch-conversations", handlePrefetchConversations);
      socket?.off("unread-count-updated", handleUnreadCountUpdate);
    };
  }, [queryClient]);

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
  const { user } = useAuthContext();
  const socket = getSocket();
  const userid = useMemo(() => user?.user_id, [user?.user_id]);
  const username = useMemo(() => user?.username, [user?.username]);

  const value = useProvideConversations();

  useEffect(() => {
    if (userid && username) {
      socket?.emit("user-connected", {
        userId: userid,
        username,
      });
    }
  }, [userid, username, socket]);

  return (
    <MessageConversationContext.Provider value={value}>
      {children}
    </MessageConversationContext.Provider>
  );
};

export const useMessagesConversation = () => {
  const context = useContext(MessageConversationContext);
  if (!context) {
    throw new Error(
      "useMessagesConversation must be used within a MessagesConversationProvider",
    );
  }
  return context;
};
