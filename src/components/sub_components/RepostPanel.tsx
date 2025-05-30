import { RespostPanelProps } from "@/types/components";
import { formatDate } from "@/utils/format-date";
import PostComponent from "../post/post_component";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useUserAuthContext } from "@/lib/userUseContext";
import RepostPanelFetch from "../custom-hooks/repost-panel-fetch";
import { LucideLoader } from "lucide-react";
import axios, { AxiosResponse } from "axios";
import { getToken } from "@/utils/cookie.get";
import { useInfiniteQuery } from "@tanstack/react-query";
const RepostPanel = ({ userdata }: RespostPanelProps) => {
  async function fetchPost(pageNumber: number) {
    const token = getToken();
    let cancel: any;
    const api =
      userdata && userdata.id
        ? `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/reposts/${userdata.id}`
        : `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/my-reposts`;
    const postPerPage = parseInt(
      process.env.NEXT_PUBLIC_POST_PER_PAGE || "5",
      10
    );
    const response = await axios<any, AxiosResponse>(api, {
      method: "GET",
      params: { page: pageNumber, limit: postPerPage },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
      <p className="text-gray-500 text-sm text-center font-medium">
        No Post Found
      </p>
    </div>
  );
  return (
    <div className="mt-2 mb-12 select-none">
      {error && (
        <div className="px-3 py-2 text-red-500 italic text-center font-medium">
          An error occurred while fetching posts.
        </div>
      )}
      {reposts.map((post, index) => (
        <div key={index}>
          <PostComponent
            was_repost={true}
            repost_id={post.post_id}
            repost_username={post.user?.username}
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
      {loading && (
        <div className="flex justify-center">
          <LucideLoader size={30} className="animate-spin" stroke="purple" />
        </div>
      )}
      {!hasMore && !loading && <EndMessage />}
    </div>
  );
};
export default RepostPanel;
