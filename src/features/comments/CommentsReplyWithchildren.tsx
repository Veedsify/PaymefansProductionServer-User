import { LucideChevronDown, LucideLoader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { PostCommentAttachments } from "@/types/Components";
import { getCommentReplies } from "@/utils/data/GetCommentReplies";
import type { Comment } from "./Comments";
import ReplyInteractions from "./ReplyInteraction";

const CommentReplyChildren = ({
  replies,
  commentId,
  childComments,
  hasMoreReplies,
  formatDate,
  previewImage,
  trackCommentView,
}: {
  replies: number;
  commentId: string;
  childComments?: Comment[];
  hasMoreReplies?: boolean;
  formatDate: (date: string | Date) => string;
  previewImage: (media: PostCommentAttachments, comment: Comment) => void;
  trackCommentView: (commentId: string) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [loadedChildren, setLoadedChildren] = useState<Comment[]>([]);
  const [replyPage, setReplyPage] = useState(1);
  const [hasMoreRepliesLocal, setHasMoreRepliesLocal] =
    useState(hasMoreReplies);

  useEffect(() => {
    trackCommentView(commentId);
  }, [commentId, trackCommentView]);

  // Initialize loadedChildren when children prop changes
  useEffect(() => {
    if (childComments && childComments.length > 0) {
      // Ensure likedByme property is preserved for each child
      const childrenWithLikedStatus = childComments.map((child) => ({
        ...child,
        likedByme: Boolean(child.likedByme), // Explicitly convert to boolean
      }));
      setLoadedChildren(childrenWithLikedStatus);
    }
  }, [childComments]);

  const LoadReplies = async () => {
    if (!showReplies) {
      // If we have children available, just show them
      if (loadedChildren && loadedChildren.length > 0) {
        setShowReplies(true);
      } else {
        // If no children, load them from API
        setLoading(true);
        try {
          const response = await getCommentReplies(commentId, 1);
          if (response && !response.error && response.data) {
            // Ensure likedByme property is preserved
            const repliesWithLikedStatus = response.data.map(
              (reply: Comment) => ({
                ...reply,
                likedByme: Boolean(reply.likedByme), // Explicitly convert to boolean
              }),
            );
            setLoadedChildren(repliesWithLikedStatus);
            setHasMoreRepliesLocal(response.hasMore);
            setShowReplies(true);
          } else {
            console.warn("No replies found or error:", response?.message);
          }
        } catch (error) {
          console.error("Failed to load replies:", error);
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Hide replies
      setShowReplies(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <button
          onClick={LoadReplies}
          className="flex items-center text-sm font-medium cursor-pointer text-primary-dark-pink gap-1"
        >
          {showReplies ? `Hide ${replies} replies` : `View ${replies} replies`}
          {!loading && (
            <LucideChevronDown className={showReplies ? "rotate-180" : ""} />
          )}
          {loading && <LucideLoader size={16} className="animate-spin" />}
        </button>

        {/* Render child comments */}
        {showReplies && loadedChildren && loadedChildren.length > 0 && (
          <div className="pl-4 mt-4 ml-4 border-gray-200 dark:border-gray-700 space-y-4">
            {loadedChildren.map((reply) => (
              <div key={reply.comment_id} className="flex gap-3">
                <Link href={`/${reply.username}`}>
                  <Image
                    src={reply.profile_image}
                    width={32}
                    height={32}
                    className="object-cover w-8 h-8 rounded-full"
                    alt={`${reply.name}'s profile image`}
                  />
                </Link>
                <div className="flex-1">
                  <h3 className="mb-2">
                    <Link
                      href={`/${reply.username}`}
                      className="text-sm font-bold"
                    >
                      {reply.name}
                    </Link>
                    &nbsp;
                    <Link href={`/${reply.username}`} className="text-sm">
                      {reply.username}
                    </Link>
                    &nbsp;·&nbsp;
                    <span className="text-xs">{formatDate(reply.date)}</span>
                  </h3>
                  <div className="mb-2 text-sm">
                    <div
                      className="mb-3"
                      dangerouslySetInnerHTML={{ __html: reply.comment }}
                    ></div>
                    <div className="flex flex-wrap items-baseline max-w-md gap-2">
                      {reply.attachment?.map((media: any, idx: number) => (
                        <div
                          key={media.name || idx}
                          onClick={() => previewImage(media, reply)}
                        >
                          <Image
                            priority
                            src={media.path}
                            width={120}
                            height={120}
                            className="object-cover h-auto rounded-lg cursor-pointer max-w-32 aspect-square"
                            alt={media.name || "Reply attachment"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/*<ReplyInteractions
                    replies={0}
                    likes={reply.likes}
                    impressions={reply.impressions || 0}
                    parentId={reply.parentId || ""}
                    commentId={reply.comment_id}
                    likedByMe={reply.likedByme || false}
                  />*/}
                </div>
              </div>
            ))}

            {/* Load More Replies Button */}
            {hasMoreRepliesLocal && (
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const nextPage = replyPage + 1;
                    const response = await getCommentReplies(
                      commentId,
                      nextPage,
                    );
                    if (response && !response.error && response.data) {
                      // Ensure likedByme property is preserved for new replies
                      const newRepliesWithLikedStatus = response.data.map(
                        (reply: Comment) => ({
                          ...reply,
                          likedByme: Boolean(reply.likedByme), // Explicitly convert to boolean
                        }),
                      );
                      setLoadedChildren((prev) => [
                        ...prev,
                        ...newRepliesWithLikedStatus,
                      ]);
                      setReplyPage(nextPage);
                      setHasMoreRepliesLocal(response.hasMore);
                    }
                  } catch (error) {
                    console.error("Failed to load more replies:", error);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="flex items-center text-sm font-medium cursor-pointer text-primary-dark-pink gap-1"
                disabled={loading}
              >
                {loading ? "Loading..." : "Load more replies"}
                {loading ? (
                  <LucideLoader size={16} className="animate-spin" />
                ) : (
                  <LucideChevronDown size={16} />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CommentReplyChildren;
