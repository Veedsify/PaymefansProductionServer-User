"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import ROUTE from "@/config/routes";
import { type PostData, UserMediaProps } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";

interface HomeFeedResponse {
  posts: PostData[];
  nextCursor?: string;
  hasMore: boolean;
}

const fetchHomeFeed = async ({
  pageParam,
}: {
  pageParam?: string;
}): Promise<HomeFeedResponse> => {
  const response = await axiosInstance.get(
    `${ROUTE.GET_HOME_POSTS}?cursor=${pageParam}`,
  );

  const data = response.data;
  return data;
};

export const useHomeFeedInfinite = () => {
  return useInfiniteQuery({
    queryKey: ["homeFeed"],
    queryFn: fetchHomeFeed,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 0, 
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when connection is restored
    refetchOnMount: true,
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors (auth issues)
      if (
        (error instanceof Error && error.message.includes("401")) ||
        error.message.includes("403")
      ) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
