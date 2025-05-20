"use client";
import PostComponent from "../post/post_component";
import LoadingPost from "./loading_post";
import { formatDate } from "@/utils/format-date";
import { useCallback, useEffect, useState } from "react";
import { fetchItemsOther } from "./infinite-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { useUserAuthContext } from "@/lib/userUseContext";
import { ProfileUserProps } from "@/types/user";
import { UserPostPropsOther } from "@/types/components";
import PostPanelFetchOther from "../custom-hooks/post-panel-other-fetch";
import { useInView } from "react-intersection-observer";
import { LucideLoader } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "@/utils/cookie.get";

const PostPanelOther = ({ userdata }: { userdata: ProfileUserProps }) => {
  const postPerPage = Number(process.env.NEXT_PUBLIC_POST_PER_PAGE);

  const fetchPosts = async ({ pageParam = 1 }) => {
    const token = getToken();
    const api = `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/user/${userdata?.id}`;
    const response = await axios.get(api, {
      params: {
        page: pageParam,
        limit: postPerPage,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["posts-other", userdata?.id],
      queryFn: async ({ pageParam }) => await fetchPosts({ pageParam }),
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.hasMore) {
          return allPages.length + 1;
        }
        return undefined;
      },
      initialPageParam: 1,
    });

  const posts = data?.pages?.flatMap((page: any) => page.data) || [];
  const loading = isLoading || isFetchingNextPage;
  const hasMore = !!hasNextPage;

  const { ref, inView } = useInView({ threshold: 1 });

  useEffect(() => {
    if (loading) return;
    if (inView && hasMore) {
      fetchNextPage();
    }
  }, [inView, hasMore, loading, fetchNextPage]);

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
              id: post?.user?.id,
              user_id: post?.user?.user_id,
              name: post?.user?.name,
              link: `/${post?.user?.username}`,
              username: post?.user?.username,
              image: post?.user?.profile_image,
            }}
            data={{
              ...post,
              post: post?.content,
              media: post?.UserMedia,
              time: formatDate(new Date(post?.created_at)),
            }}
          />
        </div>
      ))}
      <div ref={ref} />
      {loading && (
        <div className="flex justify-center">
          <LucideLoader size={30} className="animate-spin" stroke="purple" />
        </div>
      )}
      {!hasMore && !loading && <EndMessage />}
    </div>
  );
};

export default PostPanelOther;
