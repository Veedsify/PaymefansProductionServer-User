"use client";
import {LucideLoader, LucideLock, LucidePlay} from "lucide-react";
import {BiSolidLock} from "react-icons/bi";
import React, {useCallback, useEffect, useState} from "react";
import Image from "next/image";
import usePostComponent from "@/contexts/post-component-preview";
import {getToken} from "@/utils/cookie.get";
import {ProfileUserProps} from "@/types/user";
import {useUserAuthContext} from "@/lib/userUseContext";
import {MediaDataTypeOtherProps} from "@/types/components";
import HLSVideoPlayer from "./videoplayer";
import {LockedMediaOverlay} from "./sub/locked-media-overlay";
import {useOtherMediaContext} from "@/contexts/profile-media-context";

const getUniqueItems = (arr: MediaDataTypeOtherProps[]) => {
    const uniqueMap = new Map();
    arr.forEach((item) => uniqueMap.set(item.id, item)); // Replace 'id' with the unique property
    return Array.from(uniqueMap.values());
};

interface MediaPanelMediaCardProps {
    media: MediaDataTypeOtherProps;
    PreviewImageHandler: (
        media: MediaDataTypeOtherProps,
        type: string,
        isSubscriber: boolean,
        indexId: number
    ) => void;
    indexId: number;
}

const MediaPanelImageCardOther = React.memo(
    ({sort, userdata}: { sort: string; userdata: ProfileUserProps }) => {
        const {data, setData} = useOtherMediaContext()
        const [sorted, setSorted] = useState<MediaDataTypeOtherProps[]>([]);
        const [page, setPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const {fullScreenPreview} = usePostComponent();
        const token = getToken();
        const [hasMore, setHasMore] = useState(true);
        const [loading, setLoading] = useState(false);
        useEffect(() => {
            const sortData = (data: MediaDataTypeOtherProps[]) => {
                return sort === "all"
                    ? data
                    : data.filter((media) => media.media_type === sort);
            };
            setSorted(sortData(data));
        }, [data, sort]);

        const fetchInitialData = useCallback(async () => {
            setLoading(true); // Set loading to true before fetching
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/media/${userdata.id}?page=1&limit=${process.env.NEXT_PUBLIC_POST_MEDIA_PER_PAGE}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await res.json();
            setData(data.data);
            setTotalPages(data.total);
            setHasMore(data.data.length > 0);
            setLoading(false); // Set loading to false after fetching
            setPage(2); // Start with the next page
        }, [token, userdata.id]);

        useEffect(() => {
            fetchInitialData();
        }, [fetchInitialData]);

        const fetchAdditionalData = async () => {
            setLoading(true); // Set loading to true before fetching
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/post/media/${userdata.id}?page=${page}&limit=${process.env.NEXT_PUBLIC_POST_MEDIA_PER_PAGE}`,
                {
                    method: "GET",
                    next: {revalidate: 30},
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await res.json();
            setData(data.data);
            setHasMore(data.data.length > 0);
            setPage((prev) => prev + 1); // Increment the page after fetching data
            setLoading(false); // Set loading to false after fetching
        };

        const PreviewImageHandler = (
            media: MediaDataTypeOtherProps,
            type: string,
            isSubscriber: boolean,
            indexId: number
        ) => {
            if (media.accessible_to === "subscribers" && !isSubscriber) return;

            const filteredMedias = sorted
                .filter((item) => item.media_state !== "processing")
                .filter((media) => media.accessible_to !== "price")
                .filter(
                    (media) => !(media.accessible_to === "subscribers" && !isSubscriber)
                );

            // Get the new index after filtering
            const newIndexId = filteredMedias.findIndex(
                (item) => item.id === media.id
            );

            const medias = filteredMedias.map((media) => ({
                url: media.url,
                type: media.media_type,
            }));

            fullScreenPreview({
                url: media.url,
                type,
                open: true,
                ref: newIndexId, // Use new index
                otherUrl: medias,
            });
        };
        return (
            <>
                <div className="grid grid-cols-2 overflow-hidden rounded-xl lg:grid-cols-3 gap-1 select-none">
                    {sorted.map((media, index) => (
                        <div
                            key={index}
                            className="aspect-[4/3] md:aspect-square overflow-hidden relative"
                        >
                            <MediaPanelMediaCard
                                media={media}
                                PreviewImageHandler={PreviewImageHandler}
                                indexId={index}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col items-center justify-center col-span-3 py-2 mb-20">
                    {loading && (
                        <div className="flex justify-center col-span-3">
                            <LucideLoader
                                size={30}
                                className="animate-spin"
                                stroke="purple"
                            />
                        </div>
                    )}
                    {hasMore && !loading && (
                        <button
                            className="col-span-3 px-4 py-2 rounded-lg text-sm font-bold bg-gray-200"
                            onClick={fetchAdditionalData}
                        >
                            Load More
                        </button>
                    )}
                    {!hasMore && !loading && (
                        <p className="col-span-3 text-gray-500 italic text-center font-medium">
                            No more media
                        </p>
                    )}
                </div>
            </>
        );
    }
);

const MediaPanelMediaCard = ({
                                 media,
                                 PreviewImageHandler,
                                 indexId,
                             }: MediaPanelMediaCardProps) => {
    const {user: authUser} = useUserAuthContext();
    const isCreator = media.post.user.id === authUser?.id;
    // const isAdmin = user.role === "admin";
    const isSubscribed = authUser?.subscriptions?.includes(
        media.post.user.id as number
    );
    const hasPaid = authUser?.purchasedPosts?.includes(media.post?.id as number);

    // Determine visibility
    const canView =
        // isAdmin || // Admin sees all
        isCreator || // Creator sees their own posts
        media.accessible_to === "public" || // Public posts are visible to all
        (media.accessible_to === "subscribers" && isSubscribed) || // Subscriber-only post for subscribed users
        (media.accessible_to === "price" && hasPaid); // Paid posts if the user has paid

    return (
        <>
            {media.media_type === "video" ? (
                <>
                    {canView ? (
                        <div className="relative w-full h-full">
                            <HLSVideoPlayer
                                streamUrl={media.url}
                                autoPlay={false}
                                className="w-[400px] h-[400px] cursor-pointer object-cover transition-all duration-300 ease-in-out"
                                allOthers={{
                                    width: 400,
                                    height: 400,
                                    poster: media.poster,
                                    onClick: () =>
                                        PreviewImageHandler(
                                            media,
                                            media.media_type,
                                            isSubscribed as boolean,
                                            indexId
                                        ),
                                }}
                            />
                            <div
                                onClick={() =>
                                    PreviewImageHandler(
                                        media,
                                        media.media_type,
                                        isSubscribed as boolean,
                                        indexId
                                    )
                                }
                                className="absolute bg-black/20 w-full h-full inset-0 cursor-pointer flex items-center justify-center"
                            >
                                <LucidePlay stroke="white" size={30} strokeWidth={2}/>
                            </div>
                        </div>
                    ) : (
                        <Image
                            width={400}
                            height={400}
                            priority
                            src={media.blur}
                            alt=""
                            className="w-full h-full cursor-pointer object-cover transition-all duration-300 ease-in-out hover:scale-105"
                        />
                    )}
                </>
            ) : (
                <>
                    {!canView ? (
                        <Image
                            width={400}
                            height={400}
                            priority
                            src={media.blur}
                            alt=""
                            className="w-full h-full cursor-pointer object-cover transition-all duration-300 ease-in-out hover:scale-105"
                        />
                    ) : (
                        <Image
                            width={400}
                            height={400}
                            priority
                            onClick={() =>
                                PreviewImageHandler(
                                    media,
                                    media.media_type,
                                    isSubscribed as boolean,
                                    indexId
                                )
                            }
                            src={media.url}
                            alt=""
                            className="w-full h-full cursor-pointer object-cover transition-all duration-300 ease-in-out hover:scale-105"
                        />
                    )}
                </>
            )}
            {!canView && (
                <LockedMediaOverlay
                    type={media.accessible_to === "price" ? "price" : "subscribers"}
                    mediaIsVideo={media.media_type === "video"}
                    duration={media.duration}
                />
            )}
        </>
    );
};

MediaPanelImageCardOther.displayName = "MediaPanelImageCardOther";

export default MediaPanelImageCardOther;
