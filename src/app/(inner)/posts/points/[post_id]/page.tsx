import getAllPoints from "@/utils/data/get-points";
import PointsBuy from "@/components/sub_components/points";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/utils/format-date";
import { LucideEye, LucideLock, LucideUsers } from "lucide-react";
import QuickPostActions from "@/components/sub_components/quick_post_actions";
import PostPageImage from "@/components/sub_components/postpage-image";
import React from "react";
import { cookies } from "next/headers";
import axios from "axios";
import { redirect } from "next/navigation";
import { getPost } from "@/app/(inner)/posts/[id]/page";
import getUserData from "@/utils/data/user-data";

type Points = {
  points: number;
  amount: number;
  points_buy_id: string;
};

type params = Promise<{ post_id: string }>;

async function Page({ params }: { params: params }) {
  const user = await getUserData();
  const postId = (await params).post_id;
  const post = await getPost(postId);
  const points: Points[] = await getAllPoints();

  if (!post?.user?.is_model) {
    redirect(`/posts/${postId}`);
  }

  const content = {
    __html: `${post?.content.replace(/\r\n|\r|\n/g, "<br>")}`,
  };
  let isSubscriber: boolean = false;
  if (post?.post_audience === "subscribers") {
    if (user?.user_id !== null) {
      const isOwner = post?.user_id == user?.id;
      const findSubscriber = post?.user?.Subscribers?.some(
        (subscriber: any) => subscriber.subscriber_id === user?.id
      );
      isSubscriber = findSubscriber ? true : isOwner; // Set to true if found, false otherwise
    } else {
      isSubscriber = false;
    }
  } else {
    isSubscriber = true; // If the audience is not "subscribers", assume the user is a subscriber
  }

  return (
    <div>
      <div className="p-4 md:p-8">
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
            <PostPageImage
              key={index}
              media={media}
              indexId={index}
              postOwnerId={post?.user?.user_id}
              isSubscriber={isSubscriber}
              medias={post?.UserMedia}
            />
          ))}
        </div>
      </div>
      <div className={"pt-6 p-4 md:p-8"}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-2">
          Show Some Love ❤️
        </h2>
        <p className="text-gray-600 text-lg">
          Support your favorite creator by sending them coins!
        </p>
      </div>
      <div className="p-4 md:p-8 dark:text-white">
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-20 md:mb-0">
          {points.map((point, index) => (
            <PointsBuy key={index} point={point} postId={postId} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Page;
