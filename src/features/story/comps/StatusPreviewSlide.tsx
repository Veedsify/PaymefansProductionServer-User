import { useInfiniteQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { LucideEye, LucideLoader, LucideSend, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import swal from "sweetalert";
import { v4 as uuid } from "uuid";
import { usePointsStore } from "@/contexts/PointsContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import HlsViewer from "@/features/media/HlsViewer";
import type { Story } from "@/types/Components";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";
import { createNewConversation } from "@/utils/data/CreateConversation";
import { formatDate } from "@/utils/FormatDate";
import { getSocket } from "../../../components/common/Socket";
import VideoPlayer from "../../media/videoplayer";
import CaptionElement from "./CaptionElement";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

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
    <div className="absolute inset-0 w-full z-[100] h-full">
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
  }, [inView, fetchNextPage, hasNextPage]);
  return (
    <>
      <div
        className={`absolute w-full z-[200] h-full ${
          statusViewOpen ? "pointer-events-all" : "pointer-events-none"
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
                  <h2 className="text-lg font-bold">Views {viewsCount}</h2>
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
      <div className="absolute bottom-0 flex items-center justify-center w-full h-24 bg-gradient-to-t from-black to-transparent z-[150]">
        <button className="cursor-pointer" onClick={handleViewSection}>
          <LucideEye stroke="white" size={24} />
        </button>
      </div>
    </>
  );
};
// Reply Input Component
const StoryReplyInput = ({ story }: { story: Story }) => {
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const { user } = useAuthContext();
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
        userId: user?.user_id as string,
        profileId: receiverUserId,
      });
      const conversation = conversationResponse;
      const conversationId = conversation?.data?.conversation_id;
      if (!conversationId) {
        throw new Error("Failed to create conversation");
      }
      // Create message object for socket with story reply data
      const storyReplyData = {
        story_media_id: story.media_id,
        story_preview_url: story.media_url,
        story_type: story.media_type,
        story_owner_username: story.user.username,
        story_owner_profile_image: story.user.profile_image,
      };
      const newMessage = {
        message_id: uuid(),
        sender_id: user.user_id,
        receiver_id: receiverUserId,
        conversationId: conversationId,
        message: replyText,
        attachment: [],
        rawFiles: [],
        story_reply: storyReplyData,
        triggerSend: true,
        created_at: new Date().toISOString(),
        seen: false,
      };
      // Debug: Log the message being sent
      // Get socket and emit message
      const socket = getSocket();
      socket?.emit("new-message", newMessage);
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
    <div className="absolute z-100 bottom-4 left-4 right-4 w-full">
      <AnimatePresence>
        {showReplyInput ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-3 rounded-lg bg-black/80 backdrop-blur-sm w-full"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Send Message`}
                className="flex-1 px-3 py-3 text-white border bg-white/10 placeholder-white/70 border-white/20 rounded-xl focus:outline-none focus:border-white/40"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isReplying) {
                    handleReplySubmit();
                  }
                }}
                disabled={isReplying}
              />
              <button
                onClick={handleReplySubmit}
                disabled={!replyText.trim() || isReplying}
                className="p-2 text-white rounded-lg bg-primary-dark-pink disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-text-dark-pink transition-colors"
              >
                {isReplying ? (
                  <LoadingSpinner />
                ) : (
                  <LucideSend className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setShowReplyInput(false)}
                className="p-1 text-white/70 hover:text-white"
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
            className="flex items-center px-4 py-2 text-white rounded-full bg-black/50 backdrop-blur-sm gap-2 hover:bg-black/70 transition-colors"
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
  const { user } = useAuthContext();
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
  }, [story.media_id, refCounter]);
  return (
    <div className="relative flex items-center justify-center w-full h-full max-w-full max-h-full">
      {story.media_type === "image" ? (
        <div className="relative flex items-center justify-center w-full h-full">
          <Image
            src={story.media_url}
            alt={story?.caption || "Story image"}
            fill
            style={{ objectFit: "contain" }}
            priority={index === activeIndex}
            loading={index === activeIndex ? "eager" : "lazy"}
            className="z-30 bg-black rounded-lg shadow-lg"
            onError={() => {
              console.error("Image failed to load:", story.media_url);
            }}
          />
          {/* Caption Overlay for Images */}
          {canShowViewBlock && <StatusViewBlock story={story} />}
          <CaptionOverlay story={story} />
          <StoryReplyInput story={story} />
        </div>
      ) : story.media_type === "video" ? (
        <div className="relative flex items-center justify-center w-full h-full">
          <HlsViewer
            className="w-auto h-full object-contain bg-black rounded-lg shadow-lg"
            streamUrl={story.media_url}
            muted={false}
            isOpen={true}
            showControls={false}
          />
          {/* Caption Overlay for Videos */}
          {canShowViewBlock && <StatusViewBlock story={story} />}
          <CaptionOverlay story={story} />
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
