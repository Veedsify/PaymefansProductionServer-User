import { useInfiniteQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { LucideEye, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useStoryPause } from "@/contexts/StoryPauseContext";
import type { Story } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { formatDate } from "@/utils/FormatDate";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";
import FormatName from "@/lib/FormatName";

type StatusViewBlockProps = {
    story: Story;
};

type Viewer = {
    storyMediaId: string;
    viewCount: number;
    views: any[];
};

const fetchStatusViews = async ({
    pageParam,
    media_id,
}: {
    pageParam: number;
    media_id: string;
}) => {
    const response = await axiosInstance.get(
        `/story/views/${media_id}${pageParam === 0 ? "" : `?cursor=${pageParam}`}`,
    );
    if (response.status === 200) {
        const data = response.data;
        return data;
    }
};

const StatusViewBlock = ({ story }: StatusViewBlockProps) => {
    const [statusViewOpen, setStatusViewOpen] = useState(false);
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 1,
    });
    const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetching } =
        useInfiniteQuery({
            queryKey: ["statusViews", story.media_id],
            queryFn: ({ pageParam }) =>
                fetchStatusViews({ pageParam, media_id: story.media_id }),
            initialPageParam: 0,
            getNextPageParam: (lastPage) => {
                if (lastPage?.nextCursor) {
                    return lastPage.nextCursor;
                }
                return undefined;
            },
            enabled: !!story.media_id,
        });
    const viewers = data?.pages.flatMap((page) => page.data) as Viewer[];
    const viewsCount = viewers?.[0]?.viewCount || 0;
    const { setIsPaused } = useStoryPause();

    useEffect(() => {
        setIsPaused(statusViewOpen);
    }, [statusViewOpen, setIsPaused]);

    const handleViewSection = () => {
        setStatusViewOpen(!statusViewOpen);
    };

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, fetchNextPage, hasNextPage]);

    return (
        <>
            <div
                className={`absolute w-full z-[200] h-full ${
                    statusViewOpen
                        ? "pointer-events-all"
                        : "pointer-events-none"
                } `}
            >
                <AnimatePresence>
                    {statusViewOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={`absolute bottom-0 pointer-events-auto text-black bg-white ${
                                viewsCount > 0 ? "h-96" : "h-auto"
                            } w-full z-10`}
                        >
                            <div className="p-2 md:p-6">
                                <div className="flex items-center justify-between p-2 mb-4">
                                    <h2 className="text-lg font-bold">
                                        Views {viewsCount}
                                    </h2>
                                    <button
                                        onClick={handleViewSection}
                                        className="text-gray-500 cursor-pointer hover:text-gray-700c"
                                    >
                                        <X />
                                    </button>
                                </div>
                                {isError && (
                                    <div className="text-center text-red-500">
                                        Error fetching status views
                                    </div>
                                )}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="overflow-y-auto space-y-2 h-72"
                                >
                                    {!isFetching &&
                                        viewers[0]?.views?.map((view) => (
                                            <div
                                                key={view.viewer_id}
                                                className="flex items-center p-2 rounded-lg gap-3 hover:bg-gray-100"
                                            >
                                                <div className="w-12 h-12 overflow-hidden bg-gray-200 rounded-full">
                                                    <Link
                                                        href={`/${view.viewer.username}`}
                                                    >
                                                        <Image
                                                            src={
                                                                view.viewer
                                                                    .profile_image
                                                            }
                                                            alt="Profile"
                                                            width={48}
                                                            height={48}
                                                            className="object-cover"
                                                        />
                                                    </Link>
                                                </div>
                                                <div className="font-medium">
                                                    <h3>
                                                        <Link
                                                            href={`/${view.viewer.username}`}
                                                        >
                                                            {FormatName(
                                                                view.viewer
                                                                    .name,
                                                            )}
                                                        </Link>
                                                    </h3>
                                                    <span>
                                                        <Link
                                                            href={`/${view.viewer.username}`}
                                                        >
                                                            {
                                                                view.viewer
                                                                    .username
                                                            }
                                                        </Link>
                                                    </span>
                                                </div>
                                                <span className="ml-auto text-gray-500">
                                                    {formatDate(view.viewed_at)}
                                                </span>
                                            </div>
                                        ))}
                                    {isLoading && <LoadingSpinner />}
                                    {viewsCount === 0 && (
                                        <div className="flex justify-center">
                                            <p>No Views Yet</p>
                                        </div>
                                    )}
                                    <div ref={loadMoreRef}></div>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="absolute bottom-0 flex items-center justify-center w-full h-24 bg-transparent z-[150]">
                <button className="cursor-pointer" onClick={handleViewSection}>
                    <LucideEye stroke="white" size={24} />
                </button>
            </div>
        </>
    );
};

export default StatusViewBlock;
