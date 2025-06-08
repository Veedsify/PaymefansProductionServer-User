"use client";
import { formatDate } from "@/utils/FormatDate";
import FetchHomeFeedPosts from "../custom-hooks/FetchHomeFeedPosts";
import PostComponent from "./PostComponent";
import LoadingPost from "../sub_components/LoadingPost";
import { useHomeFeedStore } from "@/contexts/HomeFeedContext";

const HomePostComponent = () => {
  const { loading, error } = FetchHomeFeedPosts();
  const { posts } = useHomeFeedStore();

  if (loading) {
    return (
      <>
        <LoadingPost />
        <LoadingPost />
        <LoadingPost />
      </>
    );
  }

  if (error && !loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-red-500 text-lg font-semibold">
            Failed to fetch home feed posts. Please try again later.
          </p>
        </div>
      </>
    );
  }

  return (
    <div className="relative p-2 md:p-5">
      {posts.map((post, index) => (
        <PostComponent
          key={index}
          data={{
            ...post,
            post: post.content,
            media: post.UserMedia,
            time: formatDate(new Date(post.created_at)),
          }}
          user={{
            id: post.user?.id!,
            user_id: post.user?.user_id!,
            name: post.user?.name!,
            link: `/${post.user?.username}`,
            username: post.user?.username!,
            image: post.user?.profile_image!,
          }}
        />
      ))}
    </div>
  );
};

export default HomePostComponent;
