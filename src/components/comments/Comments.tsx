"use client";
import Image from "next/image";
import {
  LucideBarChart,
  LucideChevronDown,
  LucideHeart,
  LucideLoader,
  LucideLoader2,
  LucideMessageSquare,
} from "lucide-react";
import ReplyPostComponent from "./ReplyTextarea";
import moment from "moment";
import usePostComponent from "@/contexts/PostComponentPreview";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  PostCommentAttachments,
  PostCompomentProps,
  PostData,
} from "@/types/Components";
import { useInView } from "react-intersection-observer";
import _ from "lodash";
import { getUserComments } from "@/utils/data/GetPostComments";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils/Cookie";

interface Comment {
  text: string;
  files: File[];
  author_username: string;
  time: Date;
  name: string;
  profile_image: string;
  comment_id: string;
}

interface CommentsHolderProps {
  post: PostData;
  postComments: Comment[];
}

const CommentsHolder = ({ post }: CommentsHolderProps) => {
  const [loading, setLoading] = useState(true);
  const [postComment, setPostComments] = useState<PostCompomentProps[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { fullScreenPreview } = usePostComponent();
  const commentsRef = useRef<HTMLDivElement>(null);
  const [openReply, setOpenReply] = useState<{
    commentId: string;
    open: boolean;
  } | null>(null);
  const router = useRouter();

  const { ref, inView } = useInView({
    threshold: 0,
  });

  // Infinite scroll: load next page when inView and hasMore and not loading
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, loading]);

  // Fetch comments
  useEffect(() => {
    let cancelled = false;
    const fetchComments = async () => {
      setLoading(true);
      const comments = await getUserComments(post, page);
      if (!cancelled && comments) {
        setHasMore(comments.hasMore);
        setPostComments((prev) => _.uniqBy([...prev, ...comments.data], "_id"));
      }
      setLoading(false);
    };
    fetchComments();
    return () => {
      cancelled = true;
    };
  }, [post, page]);

  // Add new comment callback
  const setNewComment = useCallback(() => {
    // Refresh the router to reload comments (or you could push new comment directly)
    router.refresh();
  }, [router]);

  // Format date for comments
  const formatDate = useCallback((dateString: string) => {
    return moment(dateString).fromNow();
  }, []);

  // Open/close reply textarea
  const handleOpenReply = useCallback((commentId: string) => {
    setOpenReply((prev) => ({
      commentId,
      open: prev?.commentId !== commentId ? true : !prev.open,
    }));
  }, []);

  // Preview image attachments
  const previewImage = useCallback(
    (media: PostCommentAttachments, comment: PostCompomentProps) => {
      const allMedia = comment?.attachment?.map((item) => ({
        url: item.path,
        type: "image",
      }));
      const currentIndex = comment?.attachment?.findIndex(
        (item) => item.name === media.name
      );
      fullScreenPreview({
        url: media.path,
        type: "image",
        open: true,
        otherUrl: allMedia as any,
        ref: currentIndex as number,
      });
    },
    [fullScreenPreview]
  );

  // Calculate height for vertical line (optional visual improvement)
  const calculateHeight = useCallback(() => {
    if (commentsRef.current) {
      const { height } = commentsRef.current.getBoundingClientRect();
      return Math.max(0, height - 700);
    }
    return 0;
  }, []);

  return (
    <>
      <div
        className={`${
          postComment.length > 1 ? "border-black/30 dark:border-slate-700" : ""
        } dark:text-gray-100 dark:border-slate-800 p-0 md:px-3 relative overflow-hidden`}
        ref={commentsRef}
      >
        <div
          className="absolute top-4 left-[14px] lg:left-9 w-[1px] h-full bg-black/20 dark:bg-slate-700"
          style={{
            width: "1px",
            height: `${calculateHeight()}px`,
          }}
        ></div>
        {postComment.map((comment) => (
          <div
            className={`flex gap-1 md:gap-3 items-start relative w-full`}
            key={comment.comment_id}
          >
            <Link href={`/${comment.username}`}>
              <Image
                src={comment.profile_image}
                width={50}
                height={50}
                className="h-auto aspect-square rounded-full w-8 md:w-14"
                alt={`${comment.name}'s profile image`}
              />
            </Link>
            <div className="w-full">
              <h3 className="mb-2">
                <Link
                  href={`/${comment.username}`}
                  className="md:text-base text-sm font-bold"
                >
                  {comment.name}
                </Link>
                &nbsp;
                <Link
                  href={`/${comment.username}`}
                  className="md:text-base text-sm"
                >
                  {comment.username}
                </Link>
                &nbsp;·&nbsp;
                <span className="md:text-base text-xs">
                  {formatDate(comment.date)}
                </span>
              </h3>
              <div
                className="md:text-base text-sm mb-2 cursor-pointer"
                onClick={() => handleOpenReply(comment.comment_id)}
              >
                <div
                  className="mb-3"
                  dangerouslySetInnerHTML={{ __html: comment.comment }}
                ></div>
                <div className="flex items-baseline flex-wrap max-w-md gap-2">
                  {comment.attachment?.map((media, idx) => (
                    <div
                      key={media.name || idx}
                      onClick={() => previewImage(media, comment)}
                    >
                      <Image
                        priority
                        src={media.path}
                        width={500}
                        height={500}
                        className="h-auto max-w-40 aspect-square rounded-lg object-cover cursor-pointer"
                        alt={media.name || "Attachment image"}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <ReplyInteractions
                replies={comment.replies}
                        likes={comment.likes}
                parentId={comment.parentId || ""}
                commentId={comment.comment_id}
                likedByMe={comment.likedByme}
              />
              {comment && comment.replies > 0 && (
                <CommentReplyChildren
                  replies={comment.replies}
                  commentId={comment.comment_id}
                />
              )}
              {openReply &&
                openReply.open &&
                openReply.commentId === comment.comment_id && (
                  <ReplyPostComponent
                    options={{
                      id: post?.id,
                      parentId: comment?.comment_id,
                      post_id: post?.post_id,
                      post_audience: post?.post_audience,
                      author_username: comment.username!,
                      setNewComment: setNewComment,
                    }}
                  />
                )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-center items-center h-36">
            <LucideLoader
              size={20}
              className="animate-spin text-primary-dark-pink"
            />
          </div>
        )}
        {/* Infinite scroll trigger */}
        <div ref={ref}></div>
      </div>
      {!hasMore && !loading && (
        <div className="text-center">
          {postComment.length > 0 ? (
            <p className="text-sm text-gray-400 font-semibold">
              No more comments
            </p>
          ) : (
            <p className="text-sm text-gray-400 font-semibold">
              No comments yet
            </p>
          )}
        </div>
      )}
    </>
  );
};

const CommentReplyChildren = ({
  replies,
  commentId,
}: {
  replies: number;
  commentId: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [repliesData, setRepliesData] = useState<PostCompomentProps[]>([]);
  const LoadReplies = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <>
      <div className="mb-8">
        <button
          onClick={LoadReplies}
          className="text-sm text-primary-dark-pink font-medium cursor-pointer flex gap-1 items-center"
        >
          {replies} replies {!loading && <LucideChevronDown />}{" "}
          {loading && <LucideLoader2 size={16} className="animate-spin" />}
        </button>
      </div>
    </>
  );
};

const ReplyInteractions = ({
  likedByMe,
  commentId,
  parentId,
  replies,
  likes,
}: {
  likedByMe: boolean;
  commentId: string;
  parentId: string;
  replies: number;
  likes: number;
}) => {
  const [isLiked, setIsLiked] = useState(likedByMe);
  const [likesCount, setLikesCount] = useState(likes);
  const [isLoading, setIsLoading] = useState(false);

  const likeComment = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    const token = getToken();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/comments/like`,
        {
          method: "POST",
          body: JSON.stringify({ commentId }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to like comment");
      }

      const data = await response.json();
      if (!data.status) {
        throw new Error(data.message || "Failed to like comment");
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(likedByMe);
      setLikesCount(likes);
      console.error("Error liking comment:", error);
    } finally {
      setIsLoading(false);
    }
  }, [commentId, isLoading, likedByMe, likes]);

  const handleLike = useCallback(() => {
    if (isLoading) return;

    // Optimistic update
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    likeComment();
  }, [isLiked, isLoading, likeComment]);

  return (
    <div className="flex items-center justify-between p-2 md:p-6">
      <button
        className="flex items-center gap-1 text-xs font-medium transition-colors duration-200 disabled:opacity-50"
        onClick={handleLike}
        disabled={isLoading}
        aria-label={isLiked ? "Unlike comment" : "Like comment"}
      >
        <LucideHeart
          size={18}
          className={`${
            isLiked ? "fill-red-500 stroke-0" : "fill-white stroke-2"
          } transition-colors duration-200`}
        />
        {likesCount}
      </button>
      <span className="flex items-center gap-1 text-xs font-medium">
        <LucideMessageSquare size={18} />
        {replies}
      </span>
      <span className="flex items-center gap-1 text-xs font-medium">
        <LucideBarChart size={18} />0
      </span>
    </div>
  );
};

export default CommentsHolder;
