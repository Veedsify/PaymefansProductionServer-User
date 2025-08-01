import CommentsAndReply from "@/components/comments/CommentsAndReply";
import { PostCompInteractions } from "@/components/post/PostInteractions";
import PostPageImage from "@/components/post/PostPageImage";
import QuickPostActions from "@/components/sub_components/QuickPostActions";
import { formatDate } from "@/utils/FormatDate";
import { LucideEye, LucideLock, LucideUsers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import getUserData from "@/utils/data/UserData";
import { AuthUserProps } from "@/types/User";
import React, { ReactNode } from "react";
import { getPost } from "@/utils/data/GetPost";

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

const Post = React.memo(async ({ params }: PostPageProps) => {
  const postId = (await params).id;
  const user: AuthUserProps | null = await getUserData();
  const post = await getPost(postId);
  const content = {
    __html: `${post?.content.replace(/(?:\r\n|\r|\n)/g, "<br>")}`,
  };

  const isCreator = post?.user.id === user?.id;
  // const isAdmin = user.role === "admin";
  const isSubscribed = post.isSubscribed;
  const hasPaid = post.hasPaid;

  // Determine visibility
  const canView =
    // isAdmin || // Admin sees all
    isCreator || // Creator sees their own posts
    post.post_audience === "public" || // Public posts are visible to all
    (post.post_audience === "subscribers" && isSubscribed) || // Subscriber-only post for subscribed users
    (post.post_audience === "price" && hasPaid); // Paid posts if the user has paid

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
