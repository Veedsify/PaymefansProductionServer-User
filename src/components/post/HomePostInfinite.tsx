"use client";
import { formatDate } from "@/utils/FormatDate";
import PostComponent from "./PostComponent";
import LoadingPost from "../sub_components/LoadingPost";
import { useHomeFeedInfinite } from "@/hooks/useHomeFeedInfinite";
import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

const HomePostInfinite = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useHomeFeedInfinite();

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  });

  // Trigger fetch when load more element comes into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all posts from all pages
  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  // Initial loading state
  if (isLoading) {
    return (
      <div className="relative p-2 md:p-5">
        <LoadingPost />
        <LoadingPost />
        <LoadingPost />
      </div>
    );
  }

  // Error state
  if (isError && allPosts.length === 0) {
    return (
      <div className="relative p-2 md:p-5">
        <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
          <p className="text-red-500 text-lg font-semibold">
            Failed to fetch home feed posts
          </p>
          <p className="text-gray-600 text-sm">
            {error instanceof Error ? error.message : "Please try again later"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No posts state
  if (!isLoading && allPosts.length === 0) {
    return (
      <div className="relative p-2 md:p-5">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500 text-lg">
            No posts found. Follow some users to see their content!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-2 md:p-5">
      {allPosts.map((post, index) => (
        <PostComponent
          key={`${post.id}-${index}`}
          data={{
            ...post,
            post: post.content,
            media: post.UserMedia,
            time: formatDate(new Date(post.created_at)),
          }}
          user={{
            id: post.user.id,
            user_id: post.user.user_id,
            name: post.user.name,
            link: `/${post.user.username}`,
            username: post.user.username,
            image: post.user.profile_image,
          }}
        />
      ))}

      {/* Infinite scroll trigger and loading states */}
      <div
        ref={loadMoreRef}
        className="w-full h-10 flex items-center justify-center mt-4"
      >
        {isFetchingNextPage && (
          <div className="space-y-4">
            <LoadingPost />
          </div>
        )}

        {!hasNextPage && allPosts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              🎉 You've reached the end! No more posts to load.
            </p>
          </div>
        )}

        {isError && allPosts.length > 0 && (
          <div className="text-center py-4">
            <p className="text-red-500 text-sm mb-2">
              Failed to load more posts
            </p>
            <button
              onClick={() => fetchNextPage()}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Background refresh indicator */}
      {data?.pages.some((page, index) => index === 0) && (
        <div className="fixed top-4 right-4 z-50">
          {/* You can add a subtle indicator here when background refresh happens */}
        </div>
      )}
    </div>
  );
};

export default HomePostInfinite;
