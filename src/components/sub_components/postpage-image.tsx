"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { HiPlay } from "react-icons/hi";
import usePostComponent from "@/contexts/post-component-preview";
import Image from "next/image";
import swal from "sweetalert";
import { UserMediaProps } from "@/types/components";
import Link from "next/link";
import { LucideLock } from "lucide-react";
import { useRouter } from "next/navigation";
import HLSVideoPlayer from "./videoplayer";
import { MouseEvent } from "react";
import { useInView } from "react-intersection-observer";
import { useUserAuthContext } from "@/lib/userUseContext";
import { socket } from "./sub/socket";

// Define props type for the component
interface PostPageImageProps {
  indexId: number;
  medias: UserMediaProps[];
  canView: boolean;
  data: {
    id: string;
    post_status: string;
  }
  media: UserMediaProps;
  postOwnerId: string;
}

const PostPageImage: React.FC<PostPageImageProps> = ({
  indexId,
  canView,
  medias,
  media,
  data,
  postOwnerId,
}) => {
  const router = useRouter();
  const { fullScreenPreview } = usePostComponent();
    const { user: authUser } = useUserAuthContext();
  const [canplay, setCanplay] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true
  });

  // Mark post as viewed
  useEffect(() => {
    if (data.post_status === "approved" && inView && authUser?.id) {
      socket.emit("post-viewed", {
        userId: authUser.id,
        postId: data.id,
      });
    }
  }, [data.id, data.post_status, inView, authUser?.id]);

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
        type: media.media_type,
      }));
    fullScreenPreview({
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

  const handlePriceClick = (e: MouseEvent<HTMLDivElement>)=>{
    e.preventDefault()
    swal({
      title: "You need to pay 5,000 coins to view this post",
      icon: "warning",
      buttons: {
        cancel: true,
        confirm: {
          text: "Pay",
          className: "bg-primary-dark-pink text-white",
        },
      },
    }).then((willSubscribe) => {
      if (willSubscribe) {
        router.push(`/wallet`);
      }
    });
  }

  if (
    media.media_state == "processing" &&
    media.media_type.startsWith("video")
  ) {
    return (
      <div className="h-full select-none shadow-md aspect-square w-full object-cover bg-black flex flex-col gap-2 items-center justify-center text-white">
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
              poster: canView ? media.poster : "/site/blur.jpg",
            }}
            className="w-full block aspect-square object-cover cursor-pointer"
          ></HLSVideoPlayer>
          <div
            onClick={handleClick}
            className="absolute inset-0 text-white bg-black/50 flex items-center justify-center cursor-pointer"
          >
            <button className="h-12 w-12 p-1 flex-shrink-0 rounded-full flex items-center justify-center bg-primary-dark-pink aspect-square">
              <HiPlay className="text-white" size={50} />
            </button>
          </div>
        </div>
      ) : (
        <Image
          unoptimized
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
          className="absolute inset-0 bg-black/20 rounded-lg overflow-hidden flex items-center justify-center z-10"
        >
          <Image
            src={media.blur ? media.blur.trimEnd() : "/site/blur.jpg"}
            alt=""
            width={300}
            height={300}
            className="w-full aspect-[3/4] md:aspect-square object-cover absolute inset-0"
          />
          <button className="text-white absolute text-lg font-bold">
            <LucideLock />
          </button>
        </div>
      )}
      {media.accessible_to === "price" && !canView && (
        <div
            onClick={handlePriceClick}
            className="absolute inset-0 bg-black/20 rounded-lg overflow-hidden flex items-center justify-center z-10">
          <Image
            src={media.blur ? media.blur.trimEnd() : "/site/blur.jpg"}
            alt=""
            width={300}
            height={300}
            className="w-full aspect-[3/4] md:aspect-square object-cover absolute inset-0"
          />
          <div className="lock-icon absolute inset-0 w-[85%] h-[65%] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-lg flex items-center justify-center dark:bg-slate-900/70 bg-slate-900/40">
            <span className="flex items-center justify-center flex-col gap-2 text-white">
              {indexId == 0 ? (
                <p className="text-base font-bold text-center leading-4 flex items-center justify-center gap-2">
                  <Image
                    width={20}
                    height={20}
                    src="/site/coin.svg"
                    className="w-auto h-5 aspect-square"
                    alt=""
                  />
                  5,000
                </p>
              ) : (
                <>
                  <button className="text-white absolute text-lg font-bold">
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
