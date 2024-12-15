import CommentsHolder from "@/components/route_component/comments";
import CommentsAndReply from "@/components/route_component/comments-and-reply";
import {PostCompInteractions} from "@/components/route_component/post-interactions";
import ReplyPostComponent from "@/components/route_component/reply-post-textarea";
import PostPageImage from "@/components/sub_components/postpage-image";
import QuickPostActions from "@/components/sub_components/quick_post_actions";
import {formatDate} from "@/utils/format-date";
import axios from "axios";
import {LucideEye, LucideLock, LucideUsers} from "lucide-react";
import {redirect} from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import getUserData from "@/utils/data/user-data";
import {AuthUserProps} from "@/types/user";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";

interface PostPageprops {
    params: Promise<{
        id: string;
    }>;
}

const Post = async ({params}: PostPageprops) => {
    const secure_id = (await params).id;
    const user: AuthUserProps | null = await getUserData()
    let isSubscriber: boolean = false;

    async function getPost() {
        try {
            const request = await axios.get(
                `${process.env.NEXT_PUBLIC_EXPRESS_URL}/posts/${secure_id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            return request.data.data;
        } catch (error) {
            console.log(error);
            redirect("/404");
        }
    }

    const post = await getPost();


    const content = {
        __html: `${post?.content.replace(/(?:\r\n|\r|\n)/g, "<br>")}`,
    };

    if (post?.post_audience === "subscribers") {
        if (user?.user_id !== null) {
            const isOwner = post?.user_id == user?.id;
            const findSubscriber = post?.user?.Subscribers?.some((subscriber: any) =>
                subscriber.subscriber_id === user?.id
            );
            isSubscriber = findSubscriber ? true : isOwner;  // Set to true if found, false otherwise
        } else {
            isSubscriber = false;
        }
    } else {
        isSubscriber = true;  // If the audience is not "subscribers", assume the user is a subscriber
    }


    return (
        <div className="p-4 mt-8">
            <div className="mb-10">
                <div className="flex items-center justify-between dark:text-white text-gray-500 text-sm mb-2">
                    <div className="flex items-center gap-3">
                        <Image
                            width={40}
                            height={40}
                            src={post.user.profile_image}
                            alt=""
                            className="w-8 md:w-10 rounded-full aspect-square object-cover"
                        />
                        <Link
                            href={`/${[post?.user.username]}`}
                            className="flex items-center gap-1"
                        >
                            <p className="dark:text-white text-black font-bold">
                                {post?.user.name}
                            </p>
                            {post?.user.username}
                        </Link>
                        <small className="ml-auto">
                            {formatDate(new Date(post?.created_at))}
                        </small>
                        <div className="text-black">
                            {post?.post_audience === "public" ? (
                                <LucideEye size={15}/>
                            ) : post?.post_audience === "private" ? (
                                <LucideLock size={15}/>
                            ) : (
                                <LucideUsers size={15}/>
                            )}
                        </div>
                    </div>
                    <QuickPostActions
                        options={{
                            post_id: post?.post_id,
                            username: post?.user.username,
                            post_audience: post?.post_audience,
                        }}
                    />
                </div>

                <div
                    className="text-sm font-medium py-2 leading-loose dark:text-white text-gray-700"
                    dangerouslySetInnerHTML={content}
                ></div>
                <div className={`grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`}>
                    {post?.UserMedia.map((media: any, index: number) => (
                        <PostPageImage
                            key={index}
                            media={media}
                            indexId={index}
                            postOwnerId={post?.user?.user_id}
                            isSubscriber={isSubscriber}
                            medias={post?.UserMedia}
                        />
                    ))}
                </div>
                <PostCompInteractions data={post}/>
                <CommentsAndReply post={post}/>
            </div>
        </div>
    );
};

export default Post;
