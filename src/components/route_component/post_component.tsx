"use client"
// import '@vidstack/react/player/styles/base.css';
import {MediaPlayer, MediaPlayerInstance, MediaProvider} from '@vidstack/react';
import {
    LucideEye,
    LucideHeart,
    LucideLock,
    LucideMessageSquare,
    LucidePlus,
    LucideRepeat2,
    LucideShare,
    LucideUsers
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import usePostComponent from "@/contexts/post-component-preview";
import {HiPlay} from "react-icons/hi";
import {MouseEvent, useCallback, useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import toast from "react-hot-toast";
import QuickPostActions from "../sub_components/quick_post_actions";
import swal from 'sweetalert';
import {PostCompInteractions} from './post-interactions';
import {ImageCompProps, PostComponentProps, UserMediaProps, VideoComponentProps} from '@/types/components';


const PostComponent: React.FC<PostComponentProps> = ({user, data, isSubscriber, was_repost, repost_username, repost_id}) => {
    const imageLength = data.media.length;
    const {fullScreenPreview} = usePostComponent();
    // const [isSubscriber, setIsSubscriber] = useState<boolean>(false);
    const router = useRouter();
    const videoRef = useRef<MediaPlayerInstance>(null);
    const formattedText = () => {
        const text = data.post.replace(/\r?\n/g, '<br/>');
        if (data.post_audience === "subscribers" && !isSubscriber) {
            return "<p class='text-sm text-emerald-500'>This post is only available to subscribers</p>";
        } else if (text.length >= 200) {
            return text.slice(0, 200) + "...";
        } else {
            return text;
        }
    }

    const clickImageEvent = useCallback((media: { url: string; media_type: string, index: number }) => {
        if (data.post_audience === "subscribers" && !isSubscriber) {
            toast.error("You need to be a subscriber to view this post");
            return;
        }
        fullScreenPreview({
            url: media.url,
            type: media.media_type,
            open: true,
            ref: media.index,
            otherUrl: data.media.map(media => ({url: media.url, type: media.media_type}))
        });
    }, [isSubscriber, data.post_audience, data.media, fullScreenPreview]);

    const redirectToPost = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLDivElement;
        if (!(target instanceof HTMLAnchorElement) && !(target instanceof HTMLButtonElement)) {
            e.preventDefault();
            if (data.post_audience === "subscribers" && !isSubscriber) {
                swal({
                    title: "You need to be a subscriber to view this post",
                    icon: "/icons/error.svg",
                    buttons: {
                        cancel: true,
                        confirm: {
                            text: "Subscribe",
                            className: "bg-primary-dark-pink text-white",
                        }
                    },
                }).then((willSubscribe) => {
                    if (willSubscribe) {
                        router.push(`/subscribe/${user.user_id}`);
                    }
                });
                return;
            } else if (data.post_audience === "private") {
                return
            } else {
                router.push(`/posts/${data.post_id}`);
            }
        }
    }, [router, data.post_id, data.post_audience, isSubscriber, user.user_id]);

    const handleNonSubscriberClick = (e: MouseEvent) => {
        e.stopPropagation()
        if (data.post_audience === "subscribers" && !isSubscriber) {
            e.preventDefault();
            swal({
                title: "You need to be a subscriber to view this post",
                icon: "warning",
                buttons: {
                    cancel: true,
                    confirm: {
                        text: "Subscribe",
                        className: "bg-primary-dark-pink text-white",
                    }
                },
            }).then((willSubscribe) => {
                if (willSubscribe) {
                    router.push(`/subscribe/${user.user_id}`);
                }
            });
        }
    }

    return (
        <div className='hover:bg-gray-100 dark:hover:bg-slate-900 py-6 px-2 md:px-5 duration-300'>
            <div className="cursor-pointer" onClick={redirectToPost}>
                {was_repost && <div className="mb-3">
                    <Link href={`/posts/${repost_id}`}
                          className={"text-purple-700 bg-purple-200 inline-block text-xs rounded-md px-2 font-bold py-1"}>
                        Reposted from {repost_username}
                    </Link>
                </div>}
                <div className="flex items-center justify-between text-gray-500 text-sm mb-2">
                    <div className="flex items-center gap-1 md:gap-3 dark:text-white">
                        <Image width={50} height={50} priority src={user?.image.trimEnd()} alt=""
                               className="w-8 md:w-10 rounded-full aspect-square object-cover"/>
                        <Link href={user?.link} className="md:flex items-center gap-1">
                            <p className="text-black dark:text-white font-bold">{user.name}</p>{user.username}
                        </Link>
                        <small className="ml-auto">{data.time}</small>
                        <div className="text-black dark:text-white">
                            {data.post_audience === "public" ?
                                <LucideEye size={15}/> : data.post_audience === "private" ? <LucideLock size={15}/> :
                                    <LucideUsers size={15}/>}
                        </div>
                    </div>
                    <QuickPostActions
                        options={{post_id: data.post_id, username: user.username, post_audience: data.post_audience}}/>
                </div>
                <div className="py-2 leading-loose text-gray-700 dark:text-white"
                     dangerouslySetInnerHTML={{__html: formattedText() as TrustedHTML}}></div>
                <div
                    className={`grid gap-3 ${data.media.length === 2 ? "grid-cols-2" : data.media.length >= 3 ? "grid-cols-3" : "grid-cols-1"}`}>
                    {data.media.slice(0, 3).map((media: UserMediaProps, i) => (
                        <div className="relative rounded-lg overflow-hidden" key={i} onClick={handleNonSubscriberClick}>
                            {(!isSubscriber && data.post_audience === "subscribers") && (
                                <div
                                    className="absolute inset-0 bg-black bg-opacity-20 rounded-lg overflow-hidden flex items-center justify-center z-10">
                                    <Image src={media.blur ? media.blur.trimEnd() : "/site/blur.jpg"} alt="" width={300}
                                           height={300}
                                           className="w-full aspect-[3/4] md:aspect-square object-cover absolute inset-0"/>
                                    <Link href="/subscribe" className="text-white absolute text-lg font-bold">
                                        <LucideLock/>
                                    </Link>
                                </div>
                            )}
                            {media.media_type === 'video' && (
                                <>
                                    {(!isSubscriber && data.post_audience === "subscribers") ? (
                                        <Image src={"/site/blur.jpg"} alt={data.post} width={300} height={300}
                                               unoptimized priority blurDataURL={media.blur}
                                               className="w-full h-full rounded-lg aspect-[3/4] md:aspect-square object-cover cursor-pointer"/>
                                    ) : (
                                        <div className="relative">
                                            <VideoComponent media={{...media, index: i}} data={data}
                                                            clickImageEvent={clickImageEvent}
                                                            isSubscriber={isSubscriber}/>
                                        </div>
                                    )}
                                </>
                            )}
                            {media.media_type !== "video" && (
                                <>
                                    {(!isSubscriber && data.post_audience === "subscribers") ? (
                                        <Image src={media.blur} alt={data.post} unoptimized width={400} height={400}
                                               priority blurDataURL={media.blur}
                                               className="w-full h-full rounded-lg aspect-[3/4] md:aspect-square object-cover cursor-pointer"/>
                                    ) : (
                                        <ImageComponent media={{...media, index: i}} data={data}
                                                        clickImageEvent={clickImageEvent}/>
                                    )}
                                </>
                            )}
                            {i === 2 && data.media.length > 3 && (
                                <Link href={data.post_audience === "private" ? "#" : `/posts/${data.post_id}`}
                                      className="flex flex-col absolute inset-0 items-center justify-center bg-black rounded-lg aspect-[3/4] md:aspect-square bg-opacity-40 cursor-pointer select-none">
                                    <div><LucidePlus size={40} stroke="#fff" className="border-4 rounded-full"/></div>
                                    <p className="text-lg font-bold select-none text-white">{imageLength - 3} more</p>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <PostCompInteractions data={data}/>
        </div>
    );
}


const ImageComponent: React.FC<ImageCompProps> = ({media, data, clickImageEvent}) => {
    return (
        <>
            <Image src={media.url.trimEnd()} alt={data.post} width={900} height={900} unselectable="on"
                   blurDataURL={media.poster ? media.poster : ""} onClick={() => clickImageEvent(media)}
                   className="w-full h-full rounded-lg aspect-[3/4] md:aspect-square object-cover cursor-pointer"/>
        </>
    )
}

const VideoComponent: React.FC<VideoComponentProps> = ({media, data, clickImageEvent, isSubscriber}) => {
    const [playing, setPlaying] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [canplay, setCanplay] = useState<boolean>(false);
    const playPauseVideo = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (data.post_audience === "subscribers" && !isSubscriber) {
            toast.error("You need to be a subscriber to view this post");
            return;
        }
        if (videoRef.current) {
            if (playing) {
                videoRef.current.pause();
            } else {
                if (canplay) {
                    videoRef.current.play();
                    setPlaying(true);
                } else {
                    swal({
                        title: "Video is still processing",
                        icon: "warning",
                        timer: 1500
                    })
                }
            }
            setPlaying(!playing);
        }
    }, [isSubscriber, data.post_audience, playing, canplay]);

    useEffect(() => {
        const videoElement = videoRef.current;

        if (!videoElement) return;

        const handleVideoEnd = () => {
            if (videoElement) {
                videoElement.controls = false;
                setPlaying(false);
            }
        };

        videoElement.addEventListener("ended", handleVideoEnd);
        videoElement.addEventListener("play", () => setPlaying(true));

        return () => {
            videoElement.removeEventListener("ended", handleVideoEnd);
        };
    }, []);

    return (
        <>
            <video
                ref={videoRef}
                playsInline
                className="h-full shadow-md aspect-square w-full object-cover"
                onClick={(e: MouseEvent<HTMLVideoElement>) => {
                    e.currentTarget.muted = true
                    clickImageEvent(media);
                }}
                onCanPlay={() => {
                    setCanplay(true)
                    setPlaying(true)
                }}
                onEnded={() => setPlaying(false)}
                poster={media.poster ? media.poster : ""}
                title={data.post}
                muted
                autoPlay={true}
                // controls={playing}
            >
                <source src={media.url}/>
            </video>
            {!playing && (
                <div onClick={playPauseVideo}
                     className="absolute inset-0 text-white bg-black bg-opacity-20 rounded-lg flex items-center justify-center cursor-pointer">
                    <button
                        className="h-12 w-12 p-1 flex-shrink-0 rounded-full flex items-center justify-center bg-primary-dark-pink bg-opacity-30 aspect-square">
                        <HiPlay className="text-white" size={50}/>
                    </button>
                </div>
            )}
        </>
    );
}


export default PostComponent;
