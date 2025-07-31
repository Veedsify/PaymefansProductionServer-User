"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getToken } from "@/utils/Cookie";
import ROUTE from "@/config/routes";
import { PostData, UserMediaProps } from "@/types/Components";
import axios from "axios";

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
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const url = new URL(ROUTE.GET_HOME_POSTS, window.location.origin);
  if (pageParam) {
    url.searchParams.set("cursor", pageParam);
  }

  const response = await axios.get(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

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
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when connection is restored
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
;
