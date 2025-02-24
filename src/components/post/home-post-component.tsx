"use client";
import { formatDate } from "@/utils/format-date";
import FetchHomeFeedPosts from "../custom-hooks/fetch-home-feed-posts";
import PostComponent from "./post_component";
import LoadingPost from "../sub_components/loading_post";
import { useHomeFeedStore } from "@/contexts/home-feed-context";

const HomePostComponent = () => {
  const { loading, error, updatePage } = FetchHomeFeedPosts();
  const {posts} = useHomeFeedStore();
  const checkIfSubscriber = () => {
    return true;
  };

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
          isSubscriber={checkIfSubscriber()}
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
