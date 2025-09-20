"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LucideLoader } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import usePostComponent from "@/contexts/PostComponentPreview";
import { useAuthContext } from "@/contexts/UserUseContext";
import {
  type PostCommentAttachments,
  PostCompomentProps,
  type PostData,
} from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";
import { getCommentReplies } from "@/utils/data/GetCommentReplies";
import { getUserComments } from "@/utils/data/GetPostComments";
import CommentReplyChildren from "./CommentsReplyWithchildren";
import ReplyInteractions from "./ReplyInteraction";
import ReplyPostComponent from "./ReplyTextarea";

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
  const { isGuest, user } = useAuthContext();
  const fullScreenPreview = usePostComponent(
    (state) => state.fullScreenPreview,
  );
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

  // TanStack Query infinite query for comments
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["comments", post.id, user?.id],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getUserComments(post, pageParam, user?.id);
      return result;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.hasMore) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    enabled: !!post.id,
  });

  // Flatten all comments from all pages
  const allComments = data?.pages.flatMap((page) => page?.data || []) || [];

  // Remove duplicates based on comment_id
  const uniqueComments = allComments.filter(
    (comment, index, self) =>
      index === self.findIndex((c) => c.comment_id === comment.comment_id),
  );

  // Infinite scroll: load next page when inView and hasNextPage
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Add new comment callback
  const setNewComment = useCallback(() => {
    router.refresh();
  }, [router]);

  // Track comment view (optional - can be used for analytics if needed)
  const trackCommentView = useCallback(
    async (commentId: string) => {
      if (viewedComments.has(commentId)) return;

      try {
        await axiosInstance.post(`/comments/view`, {
          commentId,
        });
        setViewedComments((prev) => new Set(prev).add(commentId));
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
        userProfile: null,
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
      {isError && (
        <div className="text-center p-4">
          <p className="text-red-500 text-sm">
            Failed to load comments. Please try again.
          </p>
        </div>
      )}

      <div className="relative overflow-hidden" ref={commentsRef}>
        {uniqueComments.length > 1 && (
          <div
            className="absolute top-4 left-[14px] lg:left-9 w-[1px] h-full bg-black/20 dark:bg-slate-700"
            style={{
              width: "1px",
              height: `${calculateHeight()}px`,
            }}
          ></div>
        )}
        {uniqueComments.map((comment: Comment, index: number) => (
          <div
            className={`flex gap-1 md:gap-3 items-start relative w-full`}
            key={comment.comment_id}
          >
            <Link href={`/${comment.username}`}>
              <Image
                src={comment.profile_image}
                width={50}
                height={50}
                className="w-8 h-auto rounded-full aspect-square md:w-14"
                alt={`${comment.name}'s profile image`}
              />
            </Link>
            <div className="w-full">
              <h3 className="mb-2">
                <Link
                  href={`/${comment.username}`}
                  className="text-sm font-bold md:text-base"
                >
                  {comment.name}
                </Link>
                &nbsp;
                <Link
                  href={`/${comment.username}`}
                  className="text-sm md:text-base  hidden md:inline-block"
                >
                  {comment.username}
                </Link>
                &nbsp;·&nbsp;
                <span className="text-xs md:text-base">
                  {formatDate(comment.date)}
                </span>
              </h3>
              <div
                className="mb-2 text-sm cursor-pointer md:text-base"
                onClick={() => handleOpenReply(comment.comment_id)}
              >
                <div
                  className="mb-3"
                  dangerouslySetInnerHTML={{ __html: comment.comment }}
                ></div>
                <div className="flex flex-wrap items-baseline max-w-md gap-2">
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
                        className="object-cover h-auto rounded-lg cursor-pointer max-w-40 aspect-square"
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
                !isGuest &&
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
        {(isLoading || isFetchingNextPage) && (
          <div className="flex items-center justify-center h-36">
            <LucideLoader
              size={20}
              className="animate-spin text-primary-dark-pink"
            />
          </div>
        )}
        {/* Infinite scroll trigger */}
        <div ref={ref}></div>
      </div>
      {!hasNextPage && !isLoading && !isFetchingNextPage && (
        <div className="text-center">
          {uniqueComments.length > 0 ? (
            <p className="text-sm font-semibold text-gray-400">
              No more comments
            </p>
          ) : (
            <p className="text-sm font-semibold text-gray-400">
              No comments yet
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default CommentsHolder;
