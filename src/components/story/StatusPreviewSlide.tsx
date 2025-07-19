import Image from "next/image";
import CaptionElement from "./CaptionElement";
import { Story } from "@/types/Components";
import { LucideEye, LucideLoader, X } from "lucide-react";
import VideoPlayer from "../sub_components/videoplayer";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axiosInstance from "@/utils/Axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { formatDate } from "@/utils/FormatDate";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { useInView } from "react-intersection-observer";
import Link from "next/link";

type StatusPreviewSlideProps = {
  story: Story;
  index: number;
  activeIndex: number;
  moveToNextSlide: () => void;
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
    {
      withCredentials: true,
    },
  );
  if (response.status === 200) {
    const data = response.data;
    return data;
  }
};

// Caption Overlay Component
const CaptionOverlay = ({ story }: { story: Story }) => {
  const parsedCaptionElements = JSON.parse(story.captionElements);
  if (!parsedCaptionElements || parsedCaptionElements.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-50 w-full h-full">
      {parsedCaptionElements.map((element: any) => (
        <CaptionElement key={element.id} element={element} />
      ))}
    </div>
  );
};

const StatusViewBlock = ({ story }: { story: Story }) => {
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
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage?.nextCursor) {
          return lastPage.nextCursor;
        }
        return undefined;
      },
      enabled: !!story.media_id,
    });

  const viewers = data?.pages.flatMap((page) => page.data) as Viewer[];
  const viewsCount = viewers?.[0]?.viewCount || 0;

  const handleViewSection = () => {
    setStatusViewOpen(!statusViewOpen);
  };

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  return (
    <div className="absolute h-full z-50 w-full">
      <AnimatePresence>
        {statusViewOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`absolute bottom-0 bg-white ${viewsCount > 0 ? "h-96" : "h-auto"} w-full z-10`}
          >
            <div className="p-2 md:p-6">
              <div className="flex justify-between items-center mb-4 p-2">
                <h2 className="font-bold text-lg">Views {viewsCount}</h2>
                <button
                  onClick={handleViewSection}
                  className="text-gray-500 hover:text-gray-700c cursor-pointer"
                >
                  <X />
                </button>
              </div>
              {isError && (
                <div className="text-red-500 text-center">
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
                  viewers[0]?.views?.map((view, index) => (
                    <div
                      key={view.viewer_id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                        <Link href={`/${view.viewer.username}`}>
                          <Image
                            src={view.viewer.profile_image}
                            alt="Profile"
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </Link>
                      </div>
                      <div className="font-medium">
                        <h3>
                          <Link href={`/${view.viewer.username}`}>
                            {view.viewer.name}
                          </Link>
                        </h3>
                        <span>
                          <Link href={`/${view.viewer.username}`}>
                            {view.viewer.username}
                          </Link>
                        </span>
                      </div>
                      <span className="text-gray-500 ml-auto">
                        {formatDate(view.viewed_at)}
                      </span>
                    </div>
                  ))}
                {isLoading && (
                  <div className="flex justify-center">
                    <LucideLoader className="animate-spin text-primary-dark-pink h-8" />
                  </div>
                )}
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
      <div className="absolute bottom-0 h-24 w-full bg-gradient-to-t from-black to-transparent flex items-center justify-center">
        <button className="cursor-pointer" onClick={handleViewSection}>
          <LucideEye stroke="white" size={24} />
        </button>
      </div>
    </div>
  );
};

const StatusPreviewSlide = ({
  story,
  index,
  activeIndex,
  moveToNextSlide,
}: StatusPreviewSlideProps) => {
  const { user } = useUserAuthContext();
  const refCounter = useRef(0);

  const canShowViewBlock = story.user.id === user?.id;

  useEffect(() => {
    async function storyViewed() {
      if (refCounter.current > 1) {
        return;
      }
      await axiosInstance.post(
        "/story/view",
        { storyMediaId: story.media_id },
        {
          withCredentials: true,
        },
      );
      refCounter.current++;
    }
    storyViewed();

    return () => {
      refCounter.current = 0;
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full h-full max-w-full max-h-full">
      {story.media_type === "image" ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={story.media_url}
            alt={story?.caption || "Story image"}
            fill
            style={{ objectFit: "contain" }}
            quality={100}
            priority={index === activeIndex}
            loading={index === activeIndex ? "eager" : "lazy"}
            className="rounded-lg shadow-lg bg-black z-30"
            onError={(e) => {
              console.error("Image failed to load:", story.media_url);
            }}
          />
          {/* Caption Overlay for Images */}
          <CaptionOverlay story={story} />
          {canShowViewBlock && <StatusViewBlock story={story} />}
        </div>
      ) : story.media_type === "video" ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <VideoPlayer
            modalOpen={false}
            autoPlay={index === activeIndex}
            allOthers={{
              className: "z-30",
              playsInline: true,
              muted: false,
              controls: false,
              loop: false,
              preload: index === activeIndex ? "auto" : "metadata",
              onEnded: () => moveToNextSlide(),
              style: {
                width: "100%",
                height: "100%",
                maxHeight: "calc(100vh - 120px)",
                objectFit: "contain",
                background: "black",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 24px rgba(0,0,0,0.7)",
              },
            }}
            className="w-full h-full rounded-lg shadow-lg bg-black"
            streamUrl={story.media_url}
          />
          {/* Caption Overlay for Videos */}
          <CaptionOverlay story={story} />
          {canShowViewBlock && <StatusViewBlock story={story} />}
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-full text-white">
          <p>Unsupported media type</p>
        </div>
      )}
    </div>
  );
};
export default StatusPreviewSlide;
