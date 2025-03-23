import CommentsHolder from "@/components/comments/comments";
import CommentsAndReply from "@/components/comments/comments-and-reply";
import { PostCompInteractions } from "@/components/post/post-interactions";
import ReplyPostComponent from "@/components/comments/reply-post-textarea";
import PostPageImage from "@/components/sub_components/postpage-image";
import QuickPostActions from "@/components/sub_components/quick_post_actions";
import { formatDate } from "@/utils/format-date";
import axios from "axios";
import { LucideEye, LucideLock, LucideUsers } from "lucide-react";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import getUserData from "@/utils/data/user-data";
import { AuthUserProps } from "@/types/user";
import React from "react";
import { getToken } from "@/utils/cookie.get";
import { cookies } from "next/headers";

interface PostPageprops {
  params: Promise<{
    id: string;
  }>;
}

export const getPost = async (postId: string) => {
  try {
    const token = (await cookies()).get("token")?.value;
    const request = await axios.get(
      `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/${postId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (request.data.status === false) {
      redirect("/404");
      return;
    }
    return request.data.data;
  } catch (error) {
    console.log(error);
    redirect("/404");
  }
};

const Post = React.memo(async ({ params }: PostPageprops) => {
  const postId = (await params).id;
  const user: AuthUserProps | null = await getUserData();
  const post = await getPost(postId);
  const content = {
    __html: `${post?.content.replace(/(?:\r\n|\r|\n)/g, "<br>")}`,
  };


  const isCreator = post?.user.id === user?.id;
  // const isAdmin = user.role === "admin";
  const isSubscribed = user?.subscriptions?.includes(post.user?.id as number);
  const hasPaid = user?.purchasedPosts?.includes(post?.id as number);

  // Determine visibility
  const canView =
    // isAdmin || // Admin sees all
    isCreator || // Creator sees their own posts
    post.post_audience === "public" || // Public posts are visible to all
    (post.post_audience === "subscribers" && isSubscribed) || // Subscriber-only post for subscribed users
    (post.post_audience === "price" && hasPaid); // Paid posts if the user has paid

  return (
    <div className="p-4 mt-8">
      <div className="mb-10">
        <div className="flex items-center justify-between dark:text-white text-gray-500 text-sm mb-2">
          <div className="flex items-center gap-3">
            <Image
              width={40}
              height={40}
              src={post.user.profile_image}
              alt=""
              className="w-8 md:w-10 rounded-full aspect-square object-cover"
            />
            <Link
              href={`/${[post?.user.username]}`}
              className="flex items-center gap-1"
            >
              <p className="dark:text-white text-black font-bold">
                {post?.user.name}
              </p>
              {post?.user.username}
            </Link>
            <small className="ml-auto">
              {formatDate(new Date(post?.created_at))}
            </small>
            <div className="text-black">
              {post?.post_audience === "public" ? (
                <LucideEye size={15} />
              ) : post?.post_audience === "private" ? (
                <LucideLock size={15} />
              ) : (
                <LucideUsers size={15} />
              )}
            </div>
          </div>
          <QuickPostActions
            options={{
              post_id: post?.post_id,
              username: post?.user.username,
              post_audience: post?.post_audience,
            }}
          />
        </div>

        <div
          className="text-sm font-medium py-2 leading-loose dark:text-white text-gray-700"
          dangerouslySetInnerHTML={content}
        ></div>
        <div
          className={`grid gap-1 grid-cols-2 xl:grid-cols-3 overflow-hidden rounded-xl`}
        >
          {post?.UserMedia.map((media: any, index: number) => (
            <div key={index} className="relative">
                <PostPageImage
                  key={index}
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
