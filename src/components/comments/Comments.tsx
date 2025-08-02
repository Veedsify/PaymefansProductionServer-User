"use client";
import Image from "next/image";
import { LucideLoader } from "lucide-react";
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
import { getCommentReplies } from "@/utils/data/GetCommentReplies";
import CommentReplyChildren from "./CommentsReplyWithchildren";
import ReplyInteractions from "./ReplyInteraction";

export interface Comment {
  comment_id: string;
  name: string;
  username: string;
  userId: number;
  postId: string;
  parentId: string | null;
  profile_image: string;
  comment: string;
  attachment?: any;
  likes: number;
  impressions: number;
  replies: number;
  date: Date;
  likedByme: boolean;
  children?: Comment[];
  totalReplies?: number;
  hasMoreReplies?: boolean;
  showReplies?: boolean;
  loadingReplies?: boolean;
}

interface CommentsHolderProps {
  post: PostData;
  postComments: Comment[];
}

const CommentsHolder = ({ post, postComments }: CommentsHolderProps) => {
  const [loading, setLoading] = useState(true);
  const [postComment, setPostComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { fullScreenPreview } = usePostComponent();
  const commentsRef = useRef<HTMLDivElement>(null);
  const [openReply, setOpenReply] = useState<{
    commentId: string;
    open: boolean;
  } | null>(null);
  const [viewedComments, setViewedComments] = useState<Set<string>>(new Set());
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

  // Fetch comments with enhanced backend data
  useEffect(() => {
    let cancelled = false;
    const fetchComments = async () => {
      setLoading(true);
      const comments = await getUserComments(post, page);
      if (!cancelled && comments) {
        setHasMore(comments.hasMore);
        setPostComments((prev) =>
          _.uniqBy([...prev, ...comments.data], "comment_id"),
        );
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

  // Track comment view (optional - can be used for analytics if needed)
  const trackCommentView = useCallback(
    async (commentId: string) => {
      if (viewedComments.has(commentId)) return;

      try {
        const token = getToken();
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/comments/view`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ commentId }),
          },
        );

        if (response.ok) {
          setViewedComments((prev) => new Set(prev).add(commentId));
          // Note: We don't update local impressions count here anymore
          // since the actual count should come from the server
        }
      } catch (error) {
        console.error("Failed to track comment view:", error);
      }
    },
    [viewedComments],
  );

  // Format date for comments
  const formatDate = useCallback((dateString: string | Date) => {
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
    (media: PostCommentAttachments, comment: Comment) => {
      const allMedia = comment?.attachment?.map((item: any) => ({
        url: item.path,
        type: "image",
      }));
      const currentIndex = comment?.attachment?.findIndex(
        (item: any) => item.name === media.name,
      );
      fullScreenPreview({
        url: media.path,
        type: "image",
        open: true,
        otherUrl: allMedia as any,
        ref: currentIndex as number,
      });
    },
    [fullScreenPreview],
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
          postComments.length > 1 ? "border-black/30 dark:border-slate-700" : ""
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
        {postComment.map((comment, index) => (
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
                  {comment.attachment?.map((media: any, idx: number) => (
                    <div
                      key={media.name || idx}
                      onClick={() => previewImage(media, comment as any)}
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
                replies={comment.totalReplies || comment.replies || 0}
                likes={comment.likes}
                impressions={comment.impressions || 0}
                parentId={comment.parentId || ""}
                commentId={comment.comment_id}
                likedByMe={comment.likedByme || false}
              />
              {(comment.totalReplies || comment.replies) > 0 && (
                <CommentReplyChildren
                  replies={comment.totalReplies || comment.replies}
                  commentId={comment.comment_id}
                  childComments={comment.children}
                  hasMoreReplies={comment.hasMoreReplies}
                  formatDate={formatDate}
                  previewImage={previewImage}
                  trackCommentView={trackCommentView}
                />
              )}
              {openReply &&
                openReply.open &&
                openReply.commentId === comment.comment_id && (
                  <ReplyPostComponent
                    isReply={true}
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

export default CommentsHolder;
