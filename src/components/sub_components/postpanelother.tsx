"use client"
import PostComponent from "../route_component/post_component";
import LoadingPost from "./loading_post";
import { formatDate } from "@/utils/format-date";
import { useCallback, useEffect, useState } from "react";
import { fetchItemsOther } from "./infinite-query";
import InfiniteScroll from "react-infinite-scroll-component";
import { useUserAuthContext } from "@/lib/userUseContext";
import { ProfileUserProps } from "@/types/user";
import { UserPostPropsOther } from "@/types/components";
import PostPanelFetchOther from "../custom-hooks/post-panel-other-fetch";
import { useInView } from "react-intersection-observer";
import { LucideLoader } from "lucide-react";



const PostPanelOther = ({
    userdata
}: {
    userdata: ProfileUserProps
}) => {
    const [page, setPage] = useState(1);
    const { posts, loading, hasMore } = PostPanelFetchOther(userdata.id, page);
    const { ref, inView } = useInView({
        threshold: 1
    })

    useEffect(() => {
        if (loading) return;
        if (inView && hasMore) {
            setPage(prev => prev + 1);
        }
    }, [inView, hasMore, loading])

    const EndMessage = () => (
        <div className="px-3 py-2">
            <p className="text-gray-500 italic text-center font-medium">
                No Post Found
            </p>
        </div>
    )

    return (
        <div className="mt-3 mb-12 select-none">
            {posts.map((post, index) => (
                <div
                    key={index}
                    ref={index === posts.length - 1 ? ref : null}
                >
                    <PostComponent
                        user={{
                            id: post.user.id,
                            user_id: post.user.user_id,
                            name: post.user.name,
                            link: `/${post.user.username}`,
                            username: post.user.username,
                            image: post.user.profile_image
                        }}
                        isSubscriber={post.user.Subscribers.some((sub) => sub.subscriber_id === userdata.id)}
                        data={{
                            ...post,
                            post: post.content,
                            media: post.UserMedia,
                            time: formatDate(new Date(post.created_at))
                        }}
                    />
                </div>
            ))}
            {loading && <div className="flex justify-center"> <LucideLoader size={30} className="animate-spin" stroke="purple" /></div>}
            {!hasMore && <EndMessage />}
        </div >
    );
}

export default PostPanelOther;