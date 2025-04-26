"use client";

import { socket } from "@/components/sub_components/sub/socket";
import { useUserAuthContext } from "@/lib/userUseContext";
import { UserConversations } from "@/types/components";
import { ReactNode, useEffect, useMemo } from "react";
import axios from "axios";
import { getToken } from "@/utils/cookie.get";
import _ from "lodash";
import { MESSAGE_CONFIG } from "@/config/config";
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";

// Axios instance for API calls
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_TS_EXPRESS_URL,
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// Fetch conversations function with pagination
const fetchConversations = async (page: number) => {
  const response = await axiosInstance.get(`/conversations/my-conversations`, {
    params: {
      page,
      limit: MESSAGE_CONFIG.MESSAGE_PAGINATION,
    },
  });
  return response.data;
};

// Custom hook for conversations using TanStack Query
export const useConversations = () => {
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["conversations"],
      queryFn: ({ pageParam = 1 }) => fetchConversations(pageParam),
      getNextPageParam: (lastPage) => {
        if (lastPage.hasMore) {
          return lastPage.page + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
    });

  // Prefetch conversations on socket event
  useEffect(() => {
    const handlePrefetch = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    const throttledPrefetch = _.throttle(handlePrefetch, 1000, {
      leading: true,
      trailing: false,
    });

    socket.on("prefetch-conversations", throttledPrefetch);

    return () => {
      socket.off("prefetch-conversations", throttledPrefetch);
    };
  }, [queryClient]);

  return {
    conversations: data?.pages.flatMap((page) => page.conversations) || [],
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
  const {
    conversations,
    unreadCount,
    hasMore,
    fetchNextPage,
    isFetchingNextPage,
  } = useConversations();

  const userid = useMemo(() => user?.user_id, [user?.user_id]);
  const username = useMemo(() => user?.username, [user?.username]);

  useEffect(() => {
    if (userid && username) {
      socket.emit("user-connected", {
        userId: userid,
        username: username,
      });
    }
  }, [userid, username]);

  return <>{children}</>;
};
