"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getToken } from "@/utils/Cookie";
import ROUTE from "@/config/routes";

interface Post {
  id: number;
  content: string;
  created_at: string;
  user_id: number;
  post_likes: number;
  post_comments: number;
  post_reposts: number;
  post_audience: string;
  post_is_visible: boolean;
  post_status: string;
  score: number;
  likedByme: boolean;
  wasReposted: boolean;
  isSubscribed: boolean;
  user: {
    id: number;
    user_id: string;
    name: string;
    username: string;
    profile_image: string;
    profile_banner: string;
    bio: string;
    is_model: boolean;
    total_followers: number;
  };
  UserMedia: Array<{
    id: number;
    post_id: number;
    media_url: string;
    media_type: string;
  }>;
}

interface HomeFeedResponse {
  posts: Post[];
  nextCursor?: string;
  hasMore: boolean;
}

const fetchHomeFeed = async ({ pageParam }: { pageParam?: string }): Promise<HomeFeedResponse> => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication required");
  }

  const url = new URL(ROUTE.GET_HOME_POSTS, window.location.origin);
  if (pageParam) {
    url.searchParams.set("cursor", pageParam);
  }

  const response = await fetch(url.toString(), {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store", // Ensure fresh data for feeds
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch posts: ${response.status}`);
  }

  const data = await response.json();
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
      if (error instanceof Error && error.message.includes("401") || error.message.includes("403")) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type { Post, HomeFeedResponse };
