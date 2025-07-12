"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { HiPlay } from "react-icons/hi";
import usePostComponent from "@/contexts/PostComponentPreview";
import Image from "next/image";
import swal from "sweetalert";
import { UserMediaProps } from "@/types/Components";
import Link from "next/link";
import { LucideLock } from "lucide-react";
import { useRouter } from "next/navigation";
import HLSVideoPlayer from "../sub_components/videoplayer";
import { MouseEvent } from "react";
import { useInView } from "react-intersection-observer";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { getSocket } from "../sub_components/sub/Socket";
import toast from "react-hot-toast";
import payForPost from "@/utils/data/PayForPost";
import { useQueryClient } from "@tanstack/react-query";
import { usePointsStore } from "@/contexts/PointsContext";

// Define props type for the component
interface PostPageImageProps {
  indexId: number;
  medias: UserMediaProps[];
  showWaterMark?: boolean;
  username?: string;
  canView: boolean;
  data: {
    id: number;
    post_status: string;
    post_price: number;
    userId: number;
  };
  media: UserMediaProps;
  postOwnerId: string;
}

const PostPageImage: React.FC<PostPageImageProps> = ({
  indexId,
  username,
  canView,
  medias,
  media,
  data,
  showWaterMark,
  postOwnerId,
}) => {
  const router = useRouter();
  const { fullScreenPreview } = usePostComponent();
  const { user: authUser } = useUserAuthContext();
  const [canplay, setCanplay] = useState(false);
  const points = usePointsStore((state) => state.points);
  const queryClient = useQueryClient();
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });
  const socket = getSocket();

  // Mark post as viewed
  useEffect(() => {
    if (data.post_status === "approved" && inView && authUser?.id) {
      socket.emit("post-viewed", {
        userId: authUser.id,
        postId: data.id,
      });
    }
  }, [data.id, data.post_status, inView, authUser?.id, socket]);

  const handleClick = () => {
    if (!canView) return;
    if (media.media_type === "video" && !canplay) {
      swal({
        title: "Video not ready",
        text: "Please wait for the video to load",
        icon: "warning",
        timer: 2000,
      });
      return;
    }
    const otherUrl = medias
      .filter((item) => item.media_state !== "processing")
      .map((media) => ({
        url: media.url,
        type: media.media_type as "image" | "video",
        isBlob: false,
      }));
    fullScreenPreview({
      username,
      watermarkEnabled: showWaterMark,
      url: media.url,
      type: media.media_type,
      open: true,
      ref: indexId,
      otherUrl,
    });
  };

  useEffect(() => {
    if (media && media.media_type === "video") setCanplay(true);
    setCanplay(true);
    return () => {
      setCanplay(false);
    };
  }, [media]);

  const handleMediaClick = () => {
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
  };

  const handlePriceClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    swal({
      title: `You need to pay ${data.post_price} points to view this post`,
      icon: "warning",
      buttons: {
        cancel: true,
        confirm: {
          text: "Pay",
          className: "bg-primary-dark-pink text-white",
        },
      },
    }).then(async (willSubscribe) => {
      if (willSubscribe) {
        const price = Number(data.post_price);
        if (price > points) {
          return toast.error(
            "You don't have enough points to pay for this post",
            {
              id: "pay-for-post",
            },
          );
        }
        const pay = await payForPost({ price, postId: data.id });
        if (pay.error) {
          return toast.error(pay.message, {
            id: "pay-for-post",
          });
        }
        toast.success(pay.message, {
          id: "pay-for-post",
        });
        await queryClient.invalidateQueries({
          queryKey: ["user-points", data.userId],
        });
        router.refresh();
      }
    });
  };

  if (
    media.media_state == "processing" &&
    media.media_type.startsWith("video")
  ) {
    return (
      <div className="flex flex-col items-center justify-center object-cover w-full h-full gap-2 text-white bg-black shadow-md select-none aspect-square">
        <h1>Your Media is still processing</h1>
        <small>Please wait for a few minutes</small>
      </div>
    );
  }

  const mediaUrl = canView ? media.url : media.blur;

  return (
    <div className="relative">
      {media.media_type === "video" ? (
        <div className="relative">
          <HLSVideoPlayer
            autoPlay={true}
            streamUrl={media.url}
            allOthers={{
              onClick: handleClick,
              autoPlay: true,
              muted: true,
              poster: canView ? media.poster : "/site/blur.jpg",
            }}
            className="w-full block aspect-[5/3] md:aspect-square object-cover cursor-pointer"
          ></HLSVideoPlayer>
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
          src={mediaUrl}
          blurDataURL={mediaUrl}
          alt=""
          className="w-full aspect-[5/3] md:aspect-square object-cover block cursor-pointer"
        />
      )}
      {media.accessible_to === "subscribers" && !canView && (
        <div
          onClick={handleMediaClick}
          className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-black/20"
        >
          <Image
            src={media.blur ? media.blur.trimEnd() : "/site/blur.jpg"}
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
      {media.accessible_to === "price" && !canView && (
        <div
          onClick={handlePriceClick}
          className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-black/20"
        >
          <Image
            src={media.blur ? media.blur.trimEnd() : "/site/blur.jpg"}
            alt=""
            width={300}
            priority
            height={300}
            className="w-full aspect-[3/4] md:aspect-square object-cover absolute inset-0"
          />
          <div className="lock-icon absolute inset-0 w-[85%] h-[65%] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-lg flex items-center justify-center dark:bg-slate-900/70 bg-slate-900/40">
            <span className="flex flex-col items-center justify-center gap-2 text-white">
              {indexId == 0 ? (
                <p className="flex items-center justify-center gap-2 text-base font-bold leading-4 text-center">
                  <Image
                    width={20}
                    height={20}
                    priority
                    src="/site/coin.svg"
                    className="w-auto h-5 aspect-square"
                    alt=""
                  />
                  {data.post_price}
                </p>
              ) : (
                <>
                  <button className="absolute text-lg font-bold text-white">
                    <LucideLock />
                  </button>
                </>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostPageImage;
