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
import { useAuthContext } from "@/contexts/UserUseContext";
import { LikeThisPost } from "@/utils/PostInteractions";
import numeral from "numeral";
import { PostData } from "@/types/Components";
import Link from "next/link";
import formatNumber from "@/lib/FormatNumbers";
import { usePersonalProfileStore } from "@/contexts/PersonalProfileContext";
import axiosInstance from "@/utils/Axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useGuestModal } from "@/contexts/GuestModalContext";
import {useQueryClient} from "@tanstack/react-query";

type PostCompInteractionsProps = {
  data: PostData | undefined;
};

interface PostRepostProps {
  repostThisPost: () => void;
  repostCount: number;
  isReposted: boolean;
}

const PostRepost = ({
  repostThisPost,
  repostCount,
  isReposted,
}: PostRepostProps) => {
  const { isGuest } = useAuthContext();
  const toggleModalOpen = useGuestModal((state) => state.toggleModalOpen);
  const [wasReposted, setWasReposted] = useState(isReposted);
  const [postReposts, setPostReposts] = useState(repostCount);

  const handleRepost = useCallback(() => {
    if (isGuest) {
      toggleModalOpen("You need to login to like this post.");
      return;
    }
    repostThisPost();
    setWasReposted(!wasReposted);
    setPostReposts((prev) => (wasReposted ? prev - 1 : prev + 1));
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
};

export const PostCompInteractions = ({ data }: PostCompInteractionsProps) => {
  const { likePost: likeThisPost, unlikePost } = usePersonalProfileStore();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const formattedNumber = (number: number) =>
    numeral(number).format("0a").toUpperCase(); // Converts the suffix to uppercase
  const [like, setLike] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(data?.post_likes!);
  const { user, isGuest } = useAuthContext();
  const toggleModalOpen = useGuestModal((state) => state.toggleModalOpen);
  const router = useRouter();
  const queryClient = useQueryClient()
  const repostThisPost = useCallback(async () => {
    if (isGuest) {
      toggleModalOpen("You need to login to like this post.");
      return;
    }
    try {
      const repost = await axiosInstance.post(
        `/post/repost/${data?.post_id}`,
        {},
      );
      if (repost.status === 200 && repost.data.error === false) {
        toast.success(repost.data.message, {
          id: "repost",
        });
        router.refresh();
      }
      if (repost.status === 200 && repost.data.error === true) {
        toast.error(repost.data.message, {
          id: "repost-error",
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to repost", {
        id: "repost-error",
      });
    }
  }, [router, data?.post_id]);

  const handleLikePost = async () => {
    if (isGuest) {
      toggleModalOpen("You need to login to like this post.");
      return;
    }
    try {
      const response = await LikeThisPost({ data: data! });
      if (response) {
        if (like) {
          // If the post is already liked, unlike it
          unlikePost(data?.post_id as string, user?.id as number);
          setLikesCount((prevCount) => Math.max(prevCount - 1, 0)); // Ensure likes count doesn't go below 0
          await queryClient.invalidateQueries({queryKey: ["personal-posts"]});
          await queryClient.invalidateQueries({queryKey: ["posts", data?.post_id]});
          await queryClient.invalidateQueries({queryKey: ["posts-other", data?.user.id]});
          await queryClient.invalidateQueries({queryKey: ["homeFeed"]});
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
          className="flex items-center text-sm font-medium cursor-pointer gap-1"
          onClick={handleLikePost}
        >
          <LucideHeart
            fill={like ? "#f20" : "none"}
            strokeWidth={like ? 0 : 2}
            className="w-5 h-5 lg:w-6 lg:h-6"
          />
          {formattedNumber(likesCount)}
        </span>
        <span className="flex items-center text-sm font-medium cursor-pointer gap-1">
          <LucideMessageSquare className="w-5 h-5 lg:w-6 lg:h-6" />
          {data?.post_comments}
        </span>
        <PostRepost
          repostThisPost={repostThisPost}
          repostCount={data?.post_reposts || 0}
          isReposted={data?.wasReposted || false}
        />
        {data && data.post_audience !== "private" && data.user?.is_model && (
          <button
            onClick={(e) => {
              e.preventDefault();
              if (isGuest) {
                toggleModalOpen("You need to login to view this post.");
                return;
              }
              router.push(`/posts/points/${data.post_id}/`);
            }}
            className="flex items-center text-sm font-medium cursor-pointer gap-1"
          >
            <PiCurrencyDollarSimple className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        )}
        <span
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center text-sm font-medium cursor-pointer gap-1"
        >
          <BarChart className="w-5 h-5 lg:w-6 lg:h-6" />
          {formatNumber(data?.post_impressions as number)}
        </span>
      </div>
    </>
  );
};
