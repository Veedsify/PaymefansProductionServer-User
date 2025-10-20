"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import ROUTE from "@/config/routes";
import { type PostData } from "@/types/Components";
import axiosInstance from "@/utils/Axios";

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
    `${ROUTE.GET_HOME_POSTS}?cursor=${pageParam}`
  );

  const data = response.data;
  return data;
};

export default function useHomeFeedInfinite() {
  return useInfiniteQuery({
    queryKey: ["homeFeed"],
    queryFn: fetchHomeFeed,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes - posts don't change frequently
    refetchOnWindowFocus: false, // Disable to reduce unnecessary requests
    refetchOnReconnect: true, // Keep this for network recovery
    refetchOnMount: false, // Use cached data if available
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
}
