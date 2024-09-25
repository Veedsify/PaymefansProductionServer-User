import { useState } from "react"
import CommentsHolder from "./comments"
import ReplyPostComponent from "./reply-post-textarea"
import { Comment, PostData } from "@/types/components";


const CommentsAndReply = ({ post }: { post: PostData }) => {
    const [postComments, setPostComments] = useState<Comment[]>([])

    const setNewComment = (comment: Comment) => {
        setPostComments((prev) => {
            return [...new Set([comment, ...prev])]
        })
    }

    return (
        <>
            <ReplyPostComponent options={{
                id: post?.id,
                post_id: post?.post_id,
                post_audience: post?.post_audience,
                author_username: post?.user?.username!,
                setNewComment: setNewComment
            }} />
            <div>
                {post && <CommentsHolder post={post} postComments={postComments} />}
            </div>
        </>
    )
}

export default CommentsAndReply