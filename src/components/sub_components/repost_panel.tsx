import { RespostPanelProps } from "@/types/components";
import { formatDate } from "@/utils/format-date";
import PostComponent from "../route_component/post_component";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useUserAuthContext } from "@/lib/userUseContext";
import RepostPanelFetch from "../custom-hooks/repost-panel-fetch";
import { LucideLoader } from "lucide-react";

const RepostPanel = ({ userdata }: RespostPanelProps) => {
    const [page, setPage] = useState(1);
    const { posts, loading, hasMore, error } = RepostPanelFetch({ isForViewer: false, pageNumber: page, userdata });
    const { ref, inView } = useInView({
        threshold: 0.5
    });

    useEffect(() => {
        if (loading) return;
        if (inView && hasMore) {
            setPage(prev => prev + 1);
        }
    }, [inView, hasMore, loading]);

    const EndMessage = () => (
        <div className="px-3 py-2">
            <p className="text-gray-500 italic text-center font-medium">
                No Post Found
            </p>
        </div>
    );

    return (
        <div className="mt-3 mb-12 select-none">
            {error && (
                <div className="px-3 py-2 text-red-500 italic text-center font-medium">
                    An error occurred while fetching posts.
                </div>
            )}
            {posts.map((post, index) => (
                <div
                    key={index}
                    ref={index === posts.length - 1 ? ref : null}
                >
                    <PostComponent
                        was_repost={true}
                        repost_id={post.post_id}
                        repost_username={post.user?.username}
                        user={{
                            id: post.user?.id,
                            user_id: post.user?.user_id,
                            name: post.user?.name,
                            link: `/${post.user?.username}`,
                            username: post.user?.username,
                            image: post.user?.profile_image
                        }}
                        isSubscriber={true}
                        data={{
                            ...post,
                            post: post.content,
                            media: post.UserMedia,
                            time: formatDate(new Date(post.created_at))
                        }}
                    />
                </div>
            ))}
            {loading && (
                <div className="flex justify-center">
                    <LucideLoader size={30} className="animate-spin" stroke="purple" />
                </div>
            )}
            {!hasMore && <EndMessage />}
        </div>
    );
}

export default RepostPanel;
