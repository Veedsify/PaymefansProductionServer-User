"use client";
import { PiCurrencyDollarSimple } from "react-icons/pi";
import {
  BarChart,
  LucideHeart,
  LucideMessageSquare,
  LucideRepeat2,
  LucideShare,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useUserAuthContext } from "@/lib/userUseContext";
import { LikeThisPost } from "@/utils/postinteractions";
import numeral from "numeral";
import { PostData } from "@/types/components";
import Link from "next/link";
import formatNumber from "@/lib/formatnumbers";
import { usePersonalProfileStore } from "@/contexts/personal-profile-context";
import axiosInstance from "@/utils/axios";
import { getToken } from "@/utils/cookie.get";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type PostCompInteractionsProps = {
  data: PostData | undefined;
};

interface PostRepostProps {
  repostThisPost: () => void;
  repostCount: number;
  isReposted: boolean;
}

const PostRepost = ({ repostThisPost, repostCount, isReposted }: PostRepostProps) => {
  const [wasReposted, setWasReposted] = useState(isReposted);
  const [postReposts, setPostReposts] = useState(repostCount);

  const handleRepost = useCallback(() => {
    repostThisPost();
    setWasReposted(!wasReposted);
    setPostReposts(prev => wasReposted ? prev - 1 : prev + 1);
  }, [repostThisPost, wasReposted]);

  return (
    <span
      onClick={handleRepost}
      className={`flex items-center gap-1 text-sm font-medium cursor-pointer ${wasReposted ? " text-primary-dark-pink" : ""}`}
    >
      <LucideRepeat2 className={`w-5 h-5 lg:w-6 lg:h-6 `} />
      {postReposts}
    </span>
  );
}


export const PostCompInteractions = ({ data }: PostCompInteractionsProps) => {
  const { likePost: likeThisPost, unlikePost } = usePersonalProfileStore();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const formattedNumber = (number: number) =>
    numeral(number).format("0a").toUpperCase(); // Converts the suffix to uppercase
  const [like, setLike] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(data?.post_likes!);
  const { user } = useUserAuthContext();
  const token = getToken();
  const router = useRouter();

  const repostThisPost = useCallback(async () => {
    try {
      const repost = await axiosInstance.post(
        `/post/repost/${data?.post_id}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (repost.status === 200) {
        toast.success(repost.data.message, {
          id: "repost",
        });
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to repost", {
        id: "repost-error",
      })
    }
  }, [router, data?.post_id, token]);

  const handleLikePost = async () => {
    try {
      const response = await LikeThisPost({ data: data! });

      if (response) {
        if (like) {
          // If the post is already liked, unlike it
          unlikePost(data?.post_id as string, user?.id as number);
          setLikesCount((prevCount) => Math.max(prevCount - 1, 0)); // Ensure likes count doesn't go below 0
        } else {
          // If the post is not liked, like it
          likeThisPost(data?.post_id as string);
          setLikesCount((prevCount) => prevCount + 1);
        }
        setLike((prevLike) => !prevLike); // Toggle like state
      }
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    }
  };

  useEffect(() => {
    setLike(data!.likedByme); // Ensure `likedByme` is treated as a boolean
  }, [user, data]);

  return (
    <>
      <div className="flex justify-around w-full py-6 mt-6 text-sm border-b dark:text-gray-300 dark:border-slate-700 border-black/20">
        <span
          className="flex items-center gap-1 text-sm font-medium cursor-pointer"
          onClick={handleLikePost}
        >
          <LucideHeart
            fill={like ? "#f20" : "none"}
            strokeWidth={like ? 0 : 2}
            className="w-5 h-5 lg:w-6 lg:h-6"
          />
          {formattedNumber(likesCount)}
        </span>
        <span className="flex items-center gap-1 text-sm font-medium cursor-pointer">
          <LucideMessageSquare className="w-5 h-5 lg:w-6 lg:h-6" />
          {data?.post_comments}
        </span>
        <PostRepost
          repostThisPost={repostThisPost}
          repostCount={data?.post_reposts || 0}
          isReposted={data?.wasReposted || false}
        />
        {data && data.post_audience !== "private" && data.user?.is_model && (
          <Link
            href={`/posts/points/${data.post_id}/`}
            className="flex items-center gap-1 text-sm font-medium cursor-pointer"
          >
            <PiCurrencyDollarSimple className="w-5 h-5 lg:w-6 lg:h-6" />
          </Link>
        )}
        <span
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-1 text-sm font-medium cursor-pointer"
        >
          <BarChart className="w-5 h-5 lg:w-6 lg:h-6" />
          {formatNumber(data?.post_impressions as number)}
        </span>
      </div>
    </>
  );
};
