"use client";

import { useQuery } from "@tanstack/react-query";
import { LucideEye, LucideLock, LucideUsers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";
import { useAuthContext } from "@/contexts/UserUseContext";
import PointsBuy from "@/features/points/Points";
import PostPageImage from "@/features/post/PostPageImage";
import QuickPostActions from "@/features/post/QuickPostActions";
import type { PostData } from "@/types/Components";
import getAllPoints from "@/utils/data/GetPoints";
import { getPost } from "@/utils/data/GetPost";
import { formatDate } from "@/utils/FormatDate";

type Points = {
  points: number;
  amount: number;
  points_buy_id: string;
};

export default function Page() {
  const params = useParams();
  const postId = params?.post_id as string;
  const { user, isGuest } = useAuthContext();
  const {
    data: post,
    isLoading,
    error,
  } = useQuery<PostData, Error>({
    queryKey: ["usePostData", postId],
    queryFn: () => getPost(postId),
  });

  const { data: points } = useQuery({
    queryKey: ["getAllPoints"],
    queryFn: async () => getAllPoints(),
  });

  console.log("Post data:", post);

  if (isLoading) {
    return <LoadingSpinner className="py-4" />;
  }
  if (error) {
    return <div className="p-4">Error loading post data.</div>;
  }
  if (!post) {
    return <div className="p-4">No post data found</div>;
  }

  const isCreator = post?.user?.id === user?.id;
  // const isAdmin = user?.role === "admin";
  const isSubscribed = post?.isSubscribed;
  const hasPaid = post?.hasPaid;

  // Determine visibility
  const canView =
    // isAdmin || // Admin sees all
    isCreator ||
    post.post_audience === "public" ||
    (post.post_audience === "subscribers" && !isGuest && isSubscribed) ||
    (post.post_audience === "price" && !isGuest && hasPaid);

  const content = {
    __html: `${post?.content?.replace(/\r\n|\r|\n/g, "<br>")}`,
  };

  return (
    <div>
      <div className="p-4 md:p-8">
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
            <PostPageImage
              key={index}
              data={{
                id: post.id,
                post_status: post.post_status,
                post_price: post.post_price,
                userId: post.user.id,
              }}
              media={media}
              indexId={index}
              canView={canView as boolean}
              postOwnerId={post.user.user_id}
              medias={post?.UserMedia}
            />
          ))}
        </div>
      </div>
      <div className={"pt-6 p-4 md:p-8"}>
        <h2 className="mb-2 text-2xl font-extrabold text-gray-800 md:text-3xl dark:text-white">
          Show Some Love ❤️
        </h2>
        <p className="text-lg text-gray-600 dark:text-white">
          Support your favorite creator by sending them coins!
        </p>
      </div>
      <div className="p-4 md:p-8 dark:text-white">
        <div className="mb-20 grid grid-cols-3 gap-3 md:gap-6 md:mb-0">
          {points?.map((point: Points, index: number) => (
            <PointsBuy
              key={index}
              {...point}
              postId={postId}
              userId={post.user?.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
