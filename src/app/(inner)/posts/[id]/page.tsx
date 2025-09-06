"use client";
import CommentsAndReply from "@/features/comments/CommentsAndReply";
import { PostCompInteractions } from "@/features/post/PostInteractions";
import PostPageImage from "@/features/post/PostPageImage";
import QuickPostActions from "@/features/post/QuickPostActions";
import { formatDate } from "@/utils/FormatDate";
import {
  LucideEye,
  LucideLock,
  LucideUsers,
  LucideLoader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { ReactNode, useEffect, useMemo } from "react";
import { usePost } from "@/hooks/queries/usePost";
import { useParams, useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/UserUseContext";

const Post = React.memo(() => {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const { user, isGuest } = useAuthContext();
  const {
    data: post,
    isLoading: postLoading,
    error: postError,
  } = usePost(postId);

  // Memoized calculations - must be called before any conditional returns
  const { canView } = useMemo(() => {
    if (!post || !user)
      return {
        isCreator: false,
        isSubscribed: false,
        hasPaid: false,
        canView: false,
      };

    const isCreator = post?.user.id === user?.id;
    const isSubscribed = post?.isSubscribed;
    const hasPaid = post?.hasPaid;

    // Determine visibility
    const canView =
      isCreator || // Creator sees their own posts
      post?.post_audience === "public" || // Public posts are visible to all
      (post?.post_audience === "subscribers" && isSubscribed) || // Subscriber-only post for subscribed users
      (post?.post_audience === "price" && hasPaid); // Paid posts if the user has paid

    return { isCreator, isSubscribed, hasPaid, canView };
  }, [post, user]);

  const GetAudienceIcon = (audience: string): ReactNode => {
    switch (audience) {
      case "public":
        return <LucideEye size={15} />;
      case "private":
        return <LucideLock size={15} />;
      case "subscribers":
        return <LucideUsers size={15} />;
      case "price":
        return <Image src="/site/coin.svg" alt="" width={15} height={15} />;
      default:
        return null;
    }
  };

  // Handle errors
  if (postError) {
    if (isGuest) {
      router.push("/login");
    } else {
      router.push("/404");
    }
    return null;
  }

  // Loading state
  if (postLoading) {
    return (
      <div className="flex items-center justify-center p-4 mt-8">
        <div className="flex flex-col items-center gap-4">
          <LucideLoader2 className="w-8 h-8 animate-spin" />
          <p className="text-gray-500">Loading post...</p>
        </div>
      </div>
    );
  }

  // If no post data, show error
  if (!post) {
    router.push("/404");
    return null;
  }

  const content = {
    __html: `${post?.content.replace(/(?:\r\n|\r|\n)/g, "<br>")}`,
  };

  return (
    <div className="p-4 mt-8">
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2 text-sm text-gray-500 dark:text-white">
          <div className="flex items-center gap-3">
            <Image
              width={40}
              height={40}
              src={post.user.profile_image}
              alt=""
              className="object-cover w-8 rounded-full md:w-10 aspect-square"
            />
            <Link
              href={`/${[post?.user.username]}`}
              className="flex items-center gap-1"
            >
              <p className="font-bold text-black dark:text-white">
                {post?.user.name}
              </p>
              {post?.user.username}
            </Link>
            <small className="ml-auto">
              {formatDate(new Date(post?.created_at))}
            </small>
            <div className="text-black">
              {GetAudienceIcon(post?.post_audience)}
            </div>
          </div>
          <QuickPostActions
            options={{
              content: post?.content,
              post_id: post?.post_id,
              price: post?.post_price,
              username: post?.user.username,
              post_audience: post?.post_audience,
            }}
          />
        </div>

        <div
          className="py-2 text-sm font-medium leading-loose text-gray-700 dark:text-white"
          dangerouslySetInnerHTML={content}
        ></div>
        <div
          className={`grid gap-1 grid-cols-2 xl:grid-cols-3 overflow-hidden rounded-xl`}
        >
          {post?.UserMedia.map((media: any, index: number) => (
            <div key={index} className="relative">
              <PostPageImage
                key={index}
                username={post?.user.username}
                showWaterMark={post.watermark_enabled}
                data={{
                  id: post?.id,
                  post_status: post?.post_status,
                  post_price: post?.post_price,
                  userId: post?.user?.id,
                }}
                media={media}
                indexId={index}
                postOwnerId={post?.user?.user_id}
                canView={canView as boolean}
                medias={post?.UserMedia}
              />
            </div>
          ))}
        </div>
        <PostCompInteractions data={post} />
        <CommentsAndReply post={post} />
      </div>
    </div>
  );
});

Post.displayName = "Post";
export default Post;
