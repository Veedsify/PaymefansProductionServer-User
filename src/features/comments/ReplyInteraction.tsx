import { LucideBarChart, LucideHeart, LucideMessageSquare } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGuestModal } from "@/contexts/GuestModalContext";
import { useAuthContext } from "@/contexts/UserUseContext";
import axiosInstance from "@/utils/Axios";

const ReplyInteractions = ({
  likedByMe,
  commentId,
  parentId,
  replies,
  likes,
  impressions,
}: {
  likedByMe: boolean;
  commentId: string;
  parentId: string;
  replies: number;
  likes: number;
  impressions: number;
}) => {
  const [isLiked, setIsLiked] = useState(likedByMe);
  const [likesCount, setLikesCount] = useState(likes);
  const [impressionsCount, setImpressionsCount] = useState(impressions);
  const [isLoading, setIsLoading] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);
  const { isGuest } = useAuthContext();
  const { toggleModalOpen } = useGuestModal();

  // Update state when props change
  useEffect(() => {
    setIsLiked(Boolean(likedByMe)); // Explicitly convert to boolean
    setLikesCount(likes);
    setImpressionsCount(impressions);
  }, [likedByMe, likes, impressions]);

  // Track view when component becomes visible
  useEffect(() => {
    const trackedComponent = componentRef.current;
    const trackView = async () => {
      if (viewTracked) return;

      try {
        const response = await axiosInstance.post(
          `/comments/view`,
          {
            commentId,
          },
          {
            withCredentials: true,
          },
        );

        const data = response.data;
        if (data.status) {
          setImpressionsCount((prev) => prev + 1);
          setViewTracked(true);
        }
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    };

    // Use Intersection Observer to track when component is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !viewTracked) {
            trackView();
          }
        });
      },
      { threshold: 0.5 }, // Trigger when 50% visible
    );

    if (trackedComponent) {
      observer.observe(trackedComponent);
    }

    return () => {
      if (trackedComponent) {
        observer.unobserve(trackedComponent);
      }
    };
  }, [commentId, viewTracked]);

  const likeComment = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
        `/comments/like`,
        {
          commentId,
        },
        {
          withCredentials: true,
        },
      );

      const data = response.data;
      if (!data.status) {
        throw new Error(data.message || "Failed to like comment");
      }
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(likedByMe);
      setLikesCount(likes);
      console.error("Error liking comment:", error);
    } finally {
      setIsLoading(false);
    }
  }, [commentId, isLoading, likedByMe, likes]);

  const handleLike = useCallback(() => {
    if (isLoading) return;
    if (isGuest) {
      toggleModalOpen("You need to be logged in to like comments.");
      return;
    }

    // Optimistic update
    setIsLiked((prev) => !prev);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    likeComment();
  }, [isLiked, isLoading, likeComment]);

  return (
    <div className="flex items-center justify-between p-2 md:p-6">
      <button
        className="flex items-center text-xs font-medium gap-1 transition-colors duration-200 disabled:opacity-50 hover:text-red-500"
        onClick={handleLike}
        disabled={isLoading}
        aria-label={isLiked ? "Unlike comment" : "Like comment"}
        title={isLiked ? "Unlike comment" : "Like comment"}
      >
        <LucideHeart
          size={18}
          className={`${
            isLiked ? "fill-red-500 stroke-0" : "fill-white stroke-2"
          } transition-colors duration-200`}
        />
        {likesCount > 0 ? likesCount : ""}
      </button>
      <span
        className="flex items-center text-xs font-medium text-gray-600 gap-1 dark:text-gray-400"
        title={`${replies} ${replies === 1 ? "reply" : "replies"}`}
      >
        <LucideMessageSquare size={18} />
        {replies > 0 ? replies : ""}
      </span>
      <span
        className="flex items-center text-xs font-medium text-gray-600 gap-1 dark:text-gray-400"
        title={`${impressions} ${impressions === 1 ? "view" : "views"}`}
      >
        <LucideBarChart size={18} />
        {impressions > 0 ? impressions : ""}
      </span>
    </div>
  );
};

export default ReplyInteractions;
