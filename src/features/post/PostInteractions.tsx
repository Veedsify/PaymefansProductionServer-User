"use client";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  LucideHeart,
  LucideMessageSquare,
  LucideRepeat2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import numeral from "numeral";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PiCurrencyDollarSimple } from "react-icons/pi";
import { useGuestModal } from "@/contexts/GuestModalContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import formatNumber from "@/lib/FormatNumbers";
import type { PostData } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { likePost } from "@/utils/PostLikeUtils";
import Link from "next/link";

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
      className={`flex items-center gap-1 text-sm font-medium cursor-pointer ${
        wasReposted ? " text-primary-dark-pink" : ""
      }`}
    >
      <LucideRepeat2 className={`w-5 h-5 lg:w-6 lg:h-6 `} />
      {postReposts}
    </span>
  );
};

export const PostCompInteractions = ({ data }: PostCompInteractionsProps) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [likeCount, setLikeCount] = useState(data?.post_likes || 0);
  const [isLiked, setIsLiked] = useState(data?.likedByme || false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const formattedNumber = (number: number) =>
    numeral(number).format("0a").toUpperCase(); // Converts the suffix to uppercase

  const { isGuest } = useAuthContext();
  const toggleModalOpen = useGuestModal((state) => state.toggleModalOpen);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Update state when data prop changes
  useEffect(() => {
    setLikeCount(data?.post_likes || 0);
    setIsLiked(data?.likedByme || false);
  }, [data?.post_likes, data?.likedByme]);

  // Handle like/unlike action
  const handleLike = useCallback(async () => {
    if (isGuest) {
      toggleModalOpen("You need to login to like this post.");
      return;
    }

    if (isLikeLoading || !data?.post_id) {
      return;
    }

    setIsLikeLoading(true);

    // Optimistic UI update
    const wasLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!wasLiked);
    setLikeCount(wasLiked ? Math.max(previousCount - 1, 0) : previousCount + 1);

    try {
      const response = await likePost(data.post_id);

      if (response.success) {
        // Update with actual response from server
        setIsLiked(response.isLiked);
        setLikeCount(response.likeCount);

        // Invalidate related queries to refresh cached data
        await queryClient.invalidateQueries({
          queryKey: ["personal-posts"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["posts", data.post_id],
        });
        if (location.pathname !== "/") {
          await queryClient.invalidateQueries({
            queryKey: ["homeFeed"],
          });
        }
        if (location.pathname !== "/") {
          await queryClient.invalidateQueries({
            queryKey: ["homeFeed"],
          });
        }
        await queryClient.invalidateQueries({
          queryKey: ["post", data.post_id],
        });
      } else {
        // Revert optimistic update on failure
        setIsLiked(wasLiked);
        setLikeCount(previousCount);
        toast.error("Failed to update like status");
      }
    } catch (error: any) {
      console.error("Error in handleLike:", error);

      // Revert optimistic update on error
      setIsLiked(wasLiked);
      setLikeCount(previousCount);

      toast.error(error.message || "Failed to update like status");
    } finally {
      setIsLikeLoading(false);
    }
  }, [
    isGuest,
    isLikeLoading,
    data?.post_id,
    isLiked,
    likeCount,
    toggleModalOpen,
    queryClient,
  ]);
  const repostThisPost = useCallback(async () => {
    if (isGuest) {
      toggleModalOpen("You need to login to like this post.");
      return;
    }
    try {
      const repost = await axiosInstance.post(
        `/post/repost/${data?.post_id}`,
        {}
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

  return (
    <>
      <div className="flex justify-around w-full py-6 mt-6 text-sm border-b dark:text-gray-300 dark:border-slate-700 border-black/20">
        <Link
          href={`/posts/${data?.post_id}/`}
          className="flex items-center text-sm font-medium cursor-pointer gap-1"
        >
          <LucideMessageSquare className="w-5 h-5 lg:w-6 lg:h-6" />
          {data?.post_comments}
        </Link>
        <PostRepost
          repostThisPost={repostThisPost}
          repostCount={data?.post_reposts || 0}
          isReposted={data?.wasReposted || false}
        />
        <span
          className={`flex items-center text-sm font-medium cursor-pointer gap-1 ${
            isLikeLoading ? "opacity-50 pointer-events-none" : ""
          }`}
          onClick={handleLike}
        >
          <LucideHeart
            fill={isLiked ? "#f20" : "none"}
            strokeWidth={isLiked ? 0 : 2}
            className="w-5 h-5 lg:w-6 lg:h-6"
          />
          {formattedNumber(likeCount)}
        </span>
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
