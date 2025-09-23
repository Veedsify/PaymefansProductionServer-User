"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import type { ProfileUserProps } from "@/features/user/types/user";
import axiosInstance from "@/utils/Axios";
import { formatDate } from "@/utils/FormatDate";
import dynamic from "next/dynamic";
const PostComponent = dynamic(() => import("./PostComponent"), { ssr: true });
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

const PostPanelOther = ({ userdata }: { userdata: ProfileUserProps }) => {
  const postPerPage = Number(process.env.NEXT_PUBLIC_POST_PER_PAGE);

  const fetchPosts = async ({ pageParam = 1 }) => {
    const api = `/post/user/${userdata?.id}`;
    const response = await axiosInstance.get(api, {
      params: {
        page: pageParam,
        limit: postPerPage,
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
      <p className="text-sm font-medium text-center text-gray-500">
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
      {loading && <LoadingSpinner />}
      {!hasMore && !loading && <EndMessage />}
    </div>
  );
};

export default PostPanelOther;
