import { useInfiniteQuery } from "@tanstack/react-query";
import axios, { type AxiosResponse } from "axios";
import { LucideLoader } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useAuthContext } from "@/contexts/UserUseContext";
import PostComponent from "@/features/post/PostComponent";
import type { RespostPanelProps } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";
import { formatDate } from "@/utils/FormatDate";
import RepostPanelFetch from "../../hooks/RepostPanelFetch";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

const RepostPanel = ({ userdata }: RespostPanelProps) => {
  async function fetchPost(pageNumber: number) {
    let cancel: any;
    const api =
      userdata && userdata.id
        ? `/post/other/reposts/${userdata.id}`
        : `/post/personal/reposts`;
    const postPerPage = parseInt(
      process.env.NEXT_PUBLIC_POST_PER_PAGE || "5",
      10,
    );
    const response = await axiosInstance<any, AxiosResponse>(api, {
      method: "GET",
      params: { page: pageNumber, limit: postPerPage },
      cancelToken: new axios.CancelToken((c) => (cancel = c)),
    });
    return response.data;
  }
  const {
    data,
    error,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["reposts"],
    queryFn: ({ pageParam = 1 }: { pageParam?: number }) =>
      fetchPost(Number(pageParam)),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.hasMore ? allPages.length + 1 : undefined;
    },
    staleTime: 0,
    initialPageParam: 1,
  });
  // Flatten posts from all pages
  const reposts = data?.pages?.flatMap((page: any) => page.data) || [];
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
  return (
    <div className="mt-2 mb-12 select-none">
      {error && (
        <div className="px-3 py-2 italic font-medium text-center text-red-500">
          An error occurred while fetching posts.
        </div>
      )}
      {reposts.map((post, index) => (
        <div key={index}>
          <PostComponent
            was_repost={true}
            repost_id={post.post_id}
            repost_username={post.user?.username}
            repost_name={post.user?.name}
            user={{
              id: post.user?.id,
              user_id: post.user?.user_id,
              name: post.user?.name,
              link: `/${post.user?.username}`,
              username: post.user?.username,
              image: post.user?.profile_image,
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
      {loading && <LoadingSpinner />}
      {!hasMore && !loading && <EndMessage />}
    </div>
  );
};
export default RepostPanel;
