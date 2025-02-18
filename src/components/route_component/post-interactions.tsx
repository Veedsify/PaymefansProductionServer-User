"use client";
import { PiCurrencyDollarSimple } from "react-icons/pi";
import {
  LucideHeart,
  LucideMessageSquare,
  LucideRepeat2,
  LucideShare,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUserAuthContext } from "@/lib/userUseContext";
import { LikeThisPost } from "@/utils/postinteractions";
import numeral from "numeral";
import { PostData } from "@/types/components";
import PostShareModal from "../sub_components/post-share-component";
import Link from "next/link";

type PostCompInteractionsProps = {
  data: PostData | undefined;
};

export const PostCompInteractions = ({ data }: PostCompInteractionsProps) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const formattedNumber = (number: number) =>
    numeral(number).format("0a").toUpperCase(); // Converts the suffix to uppercase
  const [like, setLike] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const { user } = useUserAuthContext();

  useEffect(() => {
    if (data?.post_likes) {
      setLikesCount(data?.post_likes);
    }
  }, [data?.post_likes]);

  const likePost = async () => {
    setLike(!like);
    setLikesCount(like ? likesCount - 1 : likesCount + 1);
    const res = await LikeThisPost({ data: data! });
    setLike(res);
  };

  useEffect(() => {
    const isLiked = data?.PostLike.some((like) => like.user_id === user?.id);
    setLike(isLiked!);
  }, [user, data]);

  return (
    <>
      <PostShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={`${process.env.NEXT_PUBLIC_SERVER_URL}/posts/${data?.post_id}`}
        title={data?.content}
      />
      <div className="flex mt-6 justify-around text-sm w-full text-gray-600 py-6 dark:border-slate-700 border-b">
        <span
          className="flex items-center gap-1 text-sm cursor-pointer font-medium"
          onClick={likePost}
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
        <span className="flex items-center gap-1 text-sm cursor-pointer font-medium">
          <LucideRepeat2 size={25} />
          {data?.post_reposts}
        </span>

        {(data?.post_audience != "private" || data?.user?.is_model) && (
          <Link
            href={`/posts/points/${data?.post_id}/`}
            className="flex items-center gap-1 text-sm cursor-pointer font-medium"
          >
            <PiCurrencyDollarSimple size={25} />
          </Link>
        )}
        <span
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-1 text-sm cursor-pointer font-medium"
        >
          <LucideShare size={23} />
        </span>
      </div>
    </>
  );
};
