"use client";

import { useRef, useEffect } from "react";
import UserFollowComp from "./UserFollowComp";
import { Followers } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { LucideLoader } from "lucide-react";

interface FollowersResponse {
  error: boolean;
  status: boolean;
  followers: Followers[];
  nextCursor?: number;
  hasMore?: boolean;
}

const fetchFollowers = async ({
  pageParam = 1,
}): Promise<FollowersResponse> => {
  try {
    const min = (pageParam - 1) * 30 + 1;
    const max = pageParam * 30;
    const response = await axiosInstance.post(
      `/follower/all?min=${min}&max=${max}`,
      {}
    );
    const data = response.data;
    return {
      error: false,
      status: true,
      followers: data.followers || [],
      nextCursor:
        data.followers && data.followers.length === 30
          ? pageParam + 1
          : undefined,
      hasMore: data.followers && data.followers.length === 30,
    };
  } catch (err) {
    console.error("Error fetching followers:", err);
    throw err;
  }
};

const FollowersDisplay = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["followers"],
    queryFn: fetchFollowers,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get all followers from all pages
  const followers = data?.pages.flatMap((page) => page.followers) || [];

  // Use intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  });

  // Fetch next page when load more element comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="p-2 md:p-4 overflow-y-auto max-h-[92vh]">
        <div className="flex items-center justify-center py-8">
          <LucideLoader className="w-6 h-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading followers...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-2 md:p-4 overflow-y-auto max-h-[92vh]">
        <div className="text-center py-8">
          <p className="text-xl font-medium text-red-500">
            Error loading followers
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {error?.message || "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4 overflow-y-auto max-h-[92vh]" ref={containerRef}>
      {followers.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-xl font-medium">No followers</p>
        </div>
      )}

      {followers.map((follower, index) => (
        <UserFollowComp
          key={`${follower.user.id}-${index}`}
          follower={follower}
        />
      ))}

      {/* Loading indicator for next page */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-4">
          <LucideLoader className="w-5 h-5 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading more followers...</span>
        </div>
      )}

      {/* End of list indicator */}
      {!hasNextPage && followers.length > 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No more followers to load</p>
        </div>
      )}

      {/* Invisible element to trigger loading more */}
      <div ref={loadMoreRef} className="h-1" />
    </div>
  );
};

export default FollowersDisplay;
