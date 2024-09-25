"use client"
import { LucideHeart, LucideMessageSquare, LucideRepeat2, LucideShare } from "lucide-react";
import ReplyPostComponent from "@/components/route_component/reply-post-textarea";
import { useEffect, useState } from "react";
import { useUserAuthContext } from "@/lib/userUseContext";
import { useRouter } from "next/navigation";
import swal from "sweetalert";
import { LikeThisPost } from "@/utils/postinteractions";
import numeral from "numeral";
import { PostData } from "@/types/components";

export const PostCompInteractions = ({ data }: { data: PostData | undefined }) => {
    const formattedNumber = (number: number) => numeral(number).format('0a').toUpperCase(); // Converts the suffix to uppercase
    const [like, setLike] = useState<boolean>(false);
    const [likesCount, setLikesCount] = useState<number>(0);
    const { user } = useUserAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (data?.post_likes) {
            setLikesCount(data?.post_likes);
        }
    }, [data?.post_likes])

    const likePost = async () => {
        setLike(!like);
        setLikesCount(like ? likesCount - 1 : likesCount + 1);
        const res = await LikeThisPost({ data: data! });
        setLike(res);
    }

    useEffect(() => {
        const isLiked = data?.PostLike.some((like) => like.user_id === user?.id);
        setLike(isLiked!);
    }, [user, data])

    return (
        <div className="flex mt-6 justify-around text-sm w-full text-gray-600 py-6 dark:border-slate-700 border-b">
            <span className="flex items-center gap-1 text-sm cursor-pointer font-medium"
                onClick={likePost}
            >
                <LucideHeart
                    fill={like ? "#f20" : "none"}
                    strokeWidth={like ? 0 : 2}
                    size={25} />{formattedNumber(likesCount)}
            </span>
            <span className="flex items-center gap-1 text-sm cursor-pointer font-medium">
                <LucideMessageSquare size={25} />{data?.post_comments}
            </span>
            {(data?.user?.user_id !== user?.user_id) && (
                <span className="flex items-center gap-1 text-sm cursor-pointer font-medium">
                    <LucideRepeat2 size={25} />{data?.post_reposts}
                </span>
            )}
            <span className="flex items-center gap-1 text-sm cursor-pointer font-medium">
                <LucideShare size={25} />
            </span>
        </div>
    )
}