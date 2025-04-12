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
import PostShareModal from "../sub_components/post-share-component";
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

  const RepostThisPost = useCallback(async () => {
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
        toast.success(repost.data.message);
        router.refresh();
      }
    } catch (error: any) {
      swal(error.response.data.message, {
        icon: "info",
      });
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
      <div className="flex mt-6 justify-around text-sm w-full dark:text-gray-300 py-6 dark:border-slate-700 border-b border-black/20">
        <span
          className="flex items-center gap-1 text-sm cursor-pointer font-medium"
          onClick={handleLikePost}
        >
          <LucideHeart
            fill={like ? "#f20" : "none"}
            strokeWidth={like ? 0 : 2}
            size={25}
          />
          {formattedNumber(likesCount)}
        </span>
        <span className="flex items-center gap-1 text-sm cursor-pointer font-medium">
          <LucideMessageSquare size={25} />
          {data?.post_comments}
        </span>
        <span
          onClick={RepostThisPost}
          className="flex items-center gap-1 text-sm cursor-pointer font-medium"
        >
          <LucideRepeat2 size={25} />
          {data?.post_reposts}
        </span>
        {data && data.post_audience !== "private" && data.user?.is_model && (
          <Link
            href={`/posts/points/${data.post_id}/`}
            className="flex items-center gap-1 text-sm cursor-pointer font-medium"
          >
            <PiCurrencyDollarSimple size={25} />
          </Link>
        )}
        <span
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-1 text-sm cursor-pointer font-medium"
        >
          <BarChart size={23} />
          {formatNumber(data?.post_impressions as number)}
        </span>
      </div>
    </>
  );
};
