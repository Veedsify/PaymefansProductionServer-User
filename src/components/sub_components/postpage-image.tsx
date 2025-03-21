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

// Define props type for the component
interface PostPageImageProps {
  indexId: number;
  medias: UserMediaProps[];
  isSubscriber: boolean;
  media: UserMediaProps;
  postOwnerId: string;
}

const PostPageImage: React.FC<PostPageImageProps> = ({
  indexId,
  isSubscriber,
  medias,
  media,
  postOwnerId,
}) => {
  const router = useRouter();
  const { fullScreenPreview } = usePostComponent();
  const [canplay, setCanplay] = useState(false);

  const handleClick = () => {
    if (!isSubscriber) return;
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

  return (
    <div className="relative">
      {!isSubscriber && (
        <div
          onClick={handleMediaClick}
          className="absolute inset-0 bg-black/20 rounded-lg overflow-hidden flex items-center justify-center z-10 cursor-pointer"
        >
          <Image
            src={media.blur ? media.blur.trimEnd() : "/site/blur.jpg"}
            alt=""
            width={300}
            height={300}
            className="w-full h-full aspect-[4/3] md:aspect-square object-cover absolute inset-0"
          />
          <button className="text-white absolute text-lg font-bold">
            <LucideLock />
          </button>
        </div>
      )}
      {media.media_type === "video" ? (
        <div className="relative">
          <HLSVideoPlayer
            autoPlay={true}
            streamUrl={isSubscriber ? media.url : "/site/blur.jpg"}
            allOthers={{
              onClick: handleClick,
              autoPlay: true,
              poster: isSubscriber ? media.poster : "/site/blur.jpg",
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
          src={isSubscriber ? media.url : media.blur}
          blurDataURL={isSubscriber ? media.url : media.blur}
          alt=""
          className="w-full aspect-[5/3] md:aspect-square object-cover block cursor-pointer"
        />
      )}
    </div>
  );
};

export default PostPageImage;
