"use client";
import { useUserAuthContext } from "@/lib/UserUseContext";
import PostComponent from "../post/PostComponent";
import React, { useEffect } from "react";
import { formatDate } from "@/utils/FormatDate";
import { useInView } from "react-intersection-observer";
import { LucideLoader } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getToken } from "@/utils/Cookie";
import axios, { AxiosResponse } from "axios";

async function fetchPrivatePost(pageNumber: number) {
  const token = getToken();
  const api = `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/personal/private-post`;
  const postPerPage = process.env.NEXT_PUBLIC_POST_PER_PAGE as string;
  let cancel: any;
  const response = await axios<any, AxiosResponse>(api, {
    method: "GET",
    params: {
      page: pageNumber,
      limit: postPerPage,
    },
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cancelToken: new axios.CancelToken((c) => (cancel = c)),
  });
  return response.data;
}

const PrivatePanel = () => {
  const { user } = useUserAuthContext();
  const {
    data,
    error,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["private-posts"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      fetchPrivatePost(Number(pageParam)),
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
    if (loading) return;
    if (inView && hasMore) {
      fetchNextPage();
    }
  }, [inView, hasMore, loading, fetchNextPage]);

  const EndMessage = () => (
    <div className="px-3 py-2">
      <p className="text-sm font-medium text-center text-gray-500">
        No Private Post Found
      </p>
    </div>
  );

  if (error) {
    return (
      <div className="px-3 py-2 italic font-medium text-center text-red-500">
        An error occurred while fetching posts.
      </div>
    );
  }

  return (
    <div className="mt-3 mb-12 select-none">
      {posts.map((post, index) => (
        <div key={index} ref={index === posts.length - 1 ? ref : null}>
          <PostComponent
            user={{
              id: user?.id!,
              user_id: user?.user_id!,
              name: user?.name!,
              link: `/${user?.username}`,
              username: user?.username!,
              image: user?.profile_image!,
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

export default PrivatePanel;
