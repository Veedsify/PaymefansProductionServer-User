import Image from "next/image";
import CaptionElement from "./CaptionElement";
import { Story } from "@/types/Components";
import { LucideEye, LucideLoader, LucideSend, X } from "lucide-react";
import VideoPlayer from "../sub_components/videoplayer";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axiosInstance from "@/utils/Axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { formatDate } from "@/utils/FormatDate";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import swal from "sweetalert";
import { createNewConversation } from "@/utils/data/CreateConversation";
import { getToken } from "@/utils/Cookie";
import { usePointsStore } from "@/contexts/PointsContext";
import { getSocket } from "../sub_components/sub/Socket";
import { v4 as uuid } from "uuid";

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
    }
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
  // Status View Starts
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
            className={`absolute bottom-0 bg-white ${
              viewsCount > 0 ? "h-96" : "h-auto"
            } w-full z-10`}
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
                  viewers[0]?.views?.map((view) => (
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

// Reply Input Component
const StoryReplyInput = ({ story }: { story: Story }) => {
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const { user } = useUserAuthContext();
  const points = usePointsStore((state) => state.points);

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !user) return;

    try {
      setIsReplying(true);

      // Get receiver's user_id and price per message
      const profileResponse = await axiosInstance.post(
        "/profile/user",
        { username: story.user.username },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
          withCredentials: true,
        }
      );

      const receiverUserId = profileResponse.data.user?.user_id;
      if (!receiverUserId) {
        throw new Error("Could not find receiver user ID");
      }

      const { data } = await axiosInstance.post(
        "/points/price-per-message",
        { user_id: receiverUserId },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
          withCredentials: true,
        }
      );

      const pricePerMessage = data.price_per_message || 0;

      const currentPoints = points || 0;

      // Check if user has enough points and show confirmation
      if (pricePerMessage > 0) {
        if (currentPoints < pricePerMessage && !user.admin) {
          return swal({
            icon: "info",
            title: "Insufficient Paypoints",
            text: `You have ${currentPoints} points but need ${pricePerMessage.toLocaleString()} paypoints to send a reply to ${
              story.user.username
            }`,
          });
        }

        const isToSend = await swal({
          icon: "info",
          title: "Notice from PayMeFans",
          text: `Sending a reply to ${
            story.user.username
          } costs ${pricePerMessage.toLocaleString()} paypoints`,
          dangerMode: true,
          buttons: ["Cancel", "Continue"],
        });

        if (!isToSend) {
          setIsReplying(false);
          return;
        }
      }

      // Create or find conversation
      const conversationResponse = await createNewConversation({
        userId: user.user_id,
        profileId: receiverUserId,
      });

      const conversation = await conversationResponse;
      const conversationId = conversation?.data?.conversation_id;

      if (!conversationId) {
        throw new Error("Failed to create conversation");
      }

      // Create message object for socket
      const newMessage = {
        message_id: uuid(),
        sender_id: user.user_id,
        receiver_id: receiverUserId,
        conversationId: conversationId,
        message: `Reply to story: ${replyText}`,
        attachment: [],
        rawFiles: [],
        triggerSend: true,
        created_at: new Date().toISOString(),
        seen: false,
      };

      // Get socket and emit message
      const socket = getSocket(user.user_id);
      socket.emit("new-message", newMessage);

      // Show success message
      swal({
        icon: "success",
        title: "Reply Sent!",
        text: "Your reply has been sent successfully",
        timer: 2000,
      });
      setReplyText("");
      setShowReplyInput(false);
    } catch (error: any) {
      console.error("Error sending reply:", error);

      if (error?.response?.data?.error === "INSUFFICIENT_POINTS") {
        swal({
          icon: "info",
          title: "Insufficient Paypoints",
          text: error.response.data.message,
        });
      } else {
        swal({
          icon: "error",
          title: "Error",
          text:
            error.response?.data?.message ||
            "Failed to send reply. Please try again.",
        });
      }
    } finally {
      setIsReplying(false);
    }
  };

  // Don't show reply input for own stories
  if (story.user.id === user?.id) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 z-50">
      <AnimatePresence>
        {showReplyInput ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-black/80 backdrop-blur-sm rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Send Message`}
                className="flex-1 bg-white/10 text-white placeholder-white/70 border border-white/20 rounded-xl px-3 py-3 focus:outline-none focus:border-white/40"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isReplying) {
                    handleReplySubmit()
                  }
                }}
                disabled={isReplying}
              />
              <button
                onClick={handleReplySubmit}
                disabled={!replyText.trim() || isReplying}
                className="bg-primary-dark-pink text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-text-dark-pink transition-colors"
              >
                {isReplying ? (
                  <LucideLoader className="w-5 h-5 animate-spin" />
                ) : (
                  <LucideSend className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setShowReplyInput(false)}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setShowReplyInput(true)}
            className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-black/70 transition-colors"
          >
            <LucideSend className="w-4 h-4" />
            <span>Reply</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatusPreviewSlide = ({
  story,
  index,
  activeIndex,
  moveToNextSlide,
}: StatusPreviewSlideProps) => {
  const refCounter = useRef(0);
  const { user } = useUserAuthContext();
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
        }
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
            onError={() => {
              console.error("Image failed to load:", story.media_url);
            }}
          />
          {/* Caption Overlay for Images */}
          <CaptionOverlay story={story} />
          {canShowViewBlock && <StatusViewBlock story={story} />}
          <StoryReplyInput story={story} />
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
          <StoryReplyInput story={story} />
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
