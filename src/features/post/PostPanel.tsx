"use client";
import { useAuthContext } from "@/contexts/UserUseContext";
import PostComponent from "./PostComponent";
import React, { useEffect } from "react";
import { formatDate } from "@/utils/FormatDate";
import { useInView } from "react-intersection-observer";
import { LucideLoader } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import axiosInstance from "@/utils/Axios";

async function fetchPost(pageNumber: number) {
  const api = `/post/personal/posts`;
  const postPerPage = process.env.NEXT_PUBLIC_POST_PER_PAGE as string;
  let cancel;
  const res = await axiosInstance<any, AxiosResponse>(api, {
    method: "GET",
    params: {
      page: pageNumber,
      limit: postPerPage,
    },
    cancelToken: new axios.CancelToken((c) => (cancel = c)),
  });
  return res.data;
}

const PostPanel = () => {
  const { user } = useAuthContext();
  const {
    data,
    error,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["personal-posts"],
    refetchOnWindowFocus: true,
    staleTime: 5 * 1000 * 60, // 5 minutes
    retry: 2,
    refetchInterval: 5 * 1000 * 60, // 5 minutes
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      fetchPost(Number(pageParam)),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Flatten posts from all pages
  const posts = data?.pages?.flatMap((page: any) => page.data) || [];
  const loading = isLoading || isFetchingNextPage;
  const hasMore = hasNextPage;

  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (isLoading) return;
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isLoading, fetchNextPage]);

  const EndMessage = () => (
    <div className="px-3 py-2">
      <p className="text-sm font-medium text-center text-gray-500">
        No Post Found
      </p>
    </div>
  );

  // Helper to safely provide image src or undefined
  const getSafeImage = (img: string | undefined | null) => {
    if (!img || img === "") return null;
    return img;
  };

  return (
    <div className="mt-3 mb-12 select-none">
      {posts?.map((post, index) => (
        <div key={index}>
          <PostComponent
            user={{
              id: user?.id!,
              user_id: user?.user_id!,
              name: user?.name!,
              link: `/${user?.username}`,
              username: user?.username!,
              image: getSafeImage(user?.profile_image) as string,
            }}
            data={{
              ...post,
              post: post.content,
              media: post.UserMedia,
              time: formatDate(new Date(post.created_at)),
            }}
          />
        </div>
      ))}
      <div ref={ref}></div>
      {loading && (
        <div className="flex justify-center">
          {" "}
          <LucideLoader size={30} className="animate-spin" stroke="purple" />
        </div>
      )}
      {!hasMore && !loading && <EndMessage />}
    </div>
  );
};

export default PostPanel;
