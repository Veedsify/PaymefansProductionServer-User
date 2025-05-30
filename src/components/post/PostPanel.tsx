"use client";
import { useUserAuthContext } from "@/lib/UserUseContext";
import PostComponent from "../post/PostComponent";
import React, { useEffect, useState } from "react";
import { formatDate } from "@/utils/FormatDate";
import PostPanelFetch from "../custom-hooks/PostPanelFetch";
import { useInView } from "react-intersection-observer";
import { LucideLoader } from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { getToken } from "@/utils/Cookie";
async function fetchPost(pageNumber: number) {
  const token = getToken();
  const api = `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/my-posts`;
  const postPerPage = process.env.NEXT_PUBLIC_POST_PER_PAGE as string;
  let cancel;
  const res = await axios<any, AxiosResponse>(api, {
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
  return res.data;
}

const PostPanel = () => {
  const { user } = useUserAuthContext();
  const {
    data,
    error,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["personal-posts"],
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
      <p className="text-gray-500 text-sm text-center font-medium">
        No Post Found
      </p>
    </div>
  );

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
