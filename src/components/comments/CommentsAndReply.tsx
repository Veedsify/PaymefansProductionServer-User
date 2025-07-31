"use client";
import { useState } from "react";
import CommentsHolder from "./Comments";
import ReplyPostComponent from "./ReplyTextarea";
import { Comment, PostData } from "@/types/Components";
import { useRouter } from "next/navigation";

const CommentsAndReply = ({ post }: { post: PostData }) => {
  const [postComments, setPostComments] = useState<Comment[]>([]);
  const router = useRouter();
  const setNewComment = (comment: Comment) => {
    setPostComments((prev) => {
      return [...new Set([comment, ...prev])];
    });
    router.refresh();
  };

  return (
    <>
      <ReplyPostComponent
        options={{
          id: post?.id,
          post_id: post?.post_id,
          post_audience: post?.post_audience,
          author_username: post?.user?.username!,
          setNewComment: setNewComment,
        }}
      />
      <div>
        {post && <CommentsHolder post={post} postComments={postComments} />}
      </div>
    </>
  );
};

export default CommentsAndReply;
