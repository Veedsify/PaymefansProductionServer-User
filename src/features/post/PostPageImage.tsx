"use client";
import { useQueryClient } from "@tanstack/react-query";
import { LucideLock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { HiPlay } from "react-icons/hi";
import { useInView } from "react-intersection-observer";
import swal from "sweetalert";
import { usePointsStore } from "@/contexts/PointsContext";
import usePostComponent from "@/contexts/PostComponentPreview";
import { useAuthContext } from "@/contexts/UserUseContext";
import type { UserMediaProps } from "@/types/Components";
import payForPost from "@/utils/data/PayForPost";
import { getSocket } from "../../components/common/Socket";
import HLSVideoPlayer from "../media/videoplayer";

// Cache socket instance to prevent recreation on every render
let socketInstance: ReturnType<typeof getSocket> | null = null;
const getSocketInstance = () => {
  if (!socketInstance) {
    socketInstance = getSocket();
  }
  return socketInstance;
};

// Define props type for the component
interface PostPageImageProps {
  indexId: number;
  medias: UserMediaProps[];
  showWaterMark?: boolean;
  username?: string;
  canView: boolean;
  isSingle?: boolean;
  data: {
    id: number;
    post_status: string;
    post_price: number;
    userId: number;
  };
  media: UserMediaProps;
  postOwnerId: string;
}

const PostPageImage: React.FC<PostPageImageProps> = memo(
  ({
    indexId,
    username,
    canView,
    medias,
    media,
    data,
    showWaterMark,
    isSingle = false,
    postOwnerId,
  }) => {
    const router = useRouter();
    const fullScreenPreview = usePostComponent(
      (state) => state.fullScreenPreview
    );
    const { user: authUser } = useAuthContext();
    const [canplay, setCanplay] = useState(false);
    const points = usePointsStore((state) => state.points);
    const queryClient = useQueryClient();
    const { ref, inView } = useInView({
      threshold: 0.5,
      triggerOnce: true,
    });

    // Use cached socket instance
    const socketRef = useRef(getSocketInstance());
    const socket = socketRef.current;

    // Memoize stable values to prevent unnecessary recalculations
    const stableValues = useMemo(
      () => ({
        postId: data.id,
        postStatus: data.post_status,
        postPrice: Number(data.post_price),
        userId: data.userId,
        isVideo: media.media_type === "video",
        isProcessing:
          media.media_state === "processing" &&
          media.media_type.startsWith("video"),
        mediaUrl: canView ? media.url : media.blur,
        needsSubscription: media.accessible_to === "subscribers" && !canView,
        needsPayment: media.accessible_to === "price" && !canView,
      }),
      [
        data.id,
        data.post_status,
        data.post_price,
        data.userId,
        media.media_type,
        media.media_state,
        media.url,
        media.blur,
        media.accessible_to,
        canView,
      ]
    );

    // Memoize filtered media URLs for better performance
    const filteredMediaUrls = useMemo(
      () =>
        medias
          .filter((item) => item.media_state !== "processing")
          .map((media) => ({
            url: media.url,
            type: media.media_type as "image" | "video",
            isBlob: false,
          })),
      [medias]
    );

    // Mark post as viewed with optimized dependencies
    useEffect(() => {
      if (
        stableValues.postStatus === "approved" &&
        inView &&
        authUser?.id &&
        socket
      ) {
        socket.emit("post-viewed", {
          userId: authUser.id,
          postId: stableValues.postId,
        });
      }
    }, [
      stableValues.postStatus,
      stableValues.postId,
      inView,
      authUser?.id,
      socket,
    ]);

    const handleClick = useCallback(() => {
      if (!canView) return;

      if (stableValues.isVideo && !canplay) {
        swal({
          title: "Video not ready",
          text: "Please wait for the video to load",
          icon: "warning",
          timer: 2000,
        });
        return;
      }

      fullScreenPreview({
        username,
        watermarkEnabled: showWaterMark,
        url: media.url,
        userProfile: null,
        type: media.media_type,
        open: true,
        ref: indexId,
        otherUrl: filteredMediaUrls,
      });
    }, [
      canView,
      stableValues.isVideo,
      canplay,
      fullScreenPreview,
      username,
      showWaterMark,
      media.url,
      media.media_type,
      indexId,
      filteredMediaUrls,
    ]);

    useEffect(() => {
      if (media && media.media_type === "video") setCanplay(true);
      setCanplay(true);
      return () => {
        setCanplay(false);
      };
    }, [media]);

    const handleMediaClick = useCallback(() => {
      swal({
        title: "You need to be a subscriber to view this post",
        icon: "warning",
        buttons: {
          cancel: true,
          confirm: {
            text: "Subscribe",
            className: "bg-primary-dark-pink text-white",
          },
        },
      }).then((willSubscribe) => {
        if (willSubscribe) {
          router.push(`/subscribe/${postOwnerId}`);
        }
      });
    }, [router, postOwnerId]);

    const handlePriceClick = useCallback(
      async (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        swal({
          title: `You need to pay ${stableValues.postPrice} points to view this post`,
          icon: "warning",
          buttons: {
            cancel: true,
            confirm: {
              text: "Pay",
              className: "bg-primary-dark-pink text-white",
            },
          },
        }).then(async (willPay) => {
          if (willPay) {
            if (stableValues.postPrice > points) {
              return toast.error(
                "You don't have enough points to pay for this post",
                {
                  id: "pay-for-post",
                }
              );
            }
            const pay = await payForPost({
              price: stableValues.postPrice,
              postId: stableValues.postId,
            });
            if (pay.error) {
              return toast.error(pay.message, {
                id: "pay-for-post",
              });
            }
            toast.success(pay.message, {
              id: "pay-for-post",
            });
            await queryClient.invalidateQueries({
              queryKey: ["user-points", stableValues.userId],
            });
            router.refresh();
          }
        });
      },
      [
        stableValues.postPrice,
        stableValues.postId,
        stableValues.userId,
        points,
        queryClient,
        router,
      ]
    );

    // Early return for processing videos using memoized value
    if (stableValues.isProcessing) {
      return (
        <div className="flex flex-col items-center justify-center object-cover w-full h-full text-white bg-black shadow-md select-none gap-2 aspect-square">
          <h1>Your Media is still processing</h1>
          <small>Please wait for a few minutes</small>
        </div>
      );
    }

    return (
      <div className="relative">
        {stableValues.isVideo ? (
          <div className="relative">
            <HLSVideoPlayer
              autoPlay={true}
              streamUrl={media.url}
              isSingle={isSingle}
              allOthers={{
                onClick: handleClick,
                autoPlay: true,
                muted: true,
                poster: canView ? media.poster : "/site/blur.jpg",
              }}
              className="w-full block aspect-[5/3] md:aspect-square object-cover cursor-pointer"
            />
            <div
              onClick={handleClick}
              className="absolute inset-0 flex items-center justify-center text-white cursor-pointer bg-black/50"
            >
              <button className="flex items-center justify-center flex-shrink-0 w-12 h-12 p-1 rounded-full bg-primary-dark-pink aspect-square">
                <HiPlay className="text-white" size={50} />
              </button>
            </div>
          </div>
        ) : (
          <Image
            height={300}
            priority
            width={300}
            onClick={handleClick}
            src={stableValues.mediaUrl}
            blurDataURL={stableValues.mediaUrl}
            alt=""
            className="w-full aspect-[5/3] md:aspect-square object-cover block cursor-pointer"
          />
        )}

        {/* Subscription overlay */}
        {stableValues.needsSubscription && (
          <div
            onClick={handleMediaClick}
            className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-black/20"
          >
            <Image
              src={media.blur ? media.blur.trim() : "/site/blur.jpg"}
              alt=""
              priority
              width={300}
              height={300}
              className="w-full aspect-[3/4] md:aspect-square object-cover absolute inset-0"
            />
            <button className="absolute text-lg font-bold text-white">
              <LucideLock />
            </button>
          </div>
        )}

        {/* Price overlay */}
        {stableValues.needsPayment && (
          <div
            onClick={handlePriceClick}
            className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-black/20"
          >
            <Image
              src={media.blur ? media.blur.trim() : "/site/blur.jpg"}
              alt=""
              width={300}
              priority
              height={300}
              className="w-full aspect-[3/4] md:aspect-square object-cover absolute inset-0"
            />
            <div className="lock-icon absolute inset-0 w-[85%] h-[65%] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-lg flex items-center justify-center dark:bg-slate-900/70 bg-slate-900/40">
              <span className="flex flex-col items-center justify-center text-white gap-2">
                {indexId === 0 ? (
                  <p className="flex items-center justify-center text-base font-bold text-center gap-2 leading-4">
                    <Image
                      width={20}
                      height={20}
                      priority
                      src="/site/coin.svg"
                      className="w-5 h-5 aspect-square"
                      alt=""
                    />
                    {stableValues.postPrice}
                  </p>
                ) : (
                  <button className="absolute text-lg font-bold text-white">
                    <LucideLock />
                  </button>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for better memoization
    // Only re-render if these critical props change
    return (
      prevProps.canView === nextProps.canView &&
      prevProps.media.url === nextProps.media.url &&
      prevProps.media.media_state === nextProps.media.media_state &&
      prevProps.media.accessible_to === nextProps.media.accessible_to &&
      prevProps.data.post_status === nextProps.data.post_status &&
      prevProps.data.post_price === nextProps.data.post_price &&
      prevProps.indexId === nextProps.indexId &&
      prevProps.showWaterMark === nextProps.showWaterMark &&
      prevProps.username === nextProps.username &&
      prevProps.postOwnerId === nextProps.postOwnerId &&
      JSON.stringify(prevProps.medias) === JSON.stringify(nextProps.medias)
    );
  }
);

PostPageImage.displayName = "PostPageImage";
export default PostPageImage;
