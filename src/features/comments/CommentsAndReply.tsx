"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthContext } from "@/contexts/UserUseContext";
import type { Comment, PostData } from "@/types/Components";
import CommentsHolder from "./Comments";
import ReplyPostComponent from "./ReplyTextarea";

const CommentsAndReply = ({ post }: { post: PostData }) => {
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const { isGuest } = useAuthContext();
  const router = useRouter();
  const setNewComment = (comment: Comment) => {
    setPostComments((prev) => {
      return [...new Set([comment, ...prev])];
    });
    router.refresh();
  };

  return (
    <>
      {!isGuest && (
        <ReplyPostComponent
          isReply={false}
          options={{
            id: post?.id,
            post_id: post?.post_id,
            post_audience: post?.post_audience,
            author_username: post?.user?.username!,
            setNewComment: setNewComment,
          }}
        />
      )}
      <div className="mt-4">
        {post && <CommentsHolder post={post} postComments={postComments} />}
      </div>
    </>
  );
};

export default CommentsAndReply;
