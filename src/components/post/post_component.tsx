"use client";

import React, {
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import swal from "sweetalert";
import { useInView } from "react-intersection-observer";
import {
  DollarSign,
  LucideEye,
  LucideLock,
  LucidePlus,
  LucideUsers,
} from "lucide-react";
import { HiPlay } from "react-icons/hi";

import usePostComponent from "@/contexts/post-component-preview";
import QuickPostActions from "../sub_components/quick_post_actions";
import { PostCompInteractions } from "./post-interactions";
import HLSVideoPlayer from "../sub_components/videoplayer";
import { useUserAuthContext } from "@/lib/userUseContext";
import { getSocket } from "../sub_components/sub/socket";

import {
  ImageCompProps,
  PostComponentProps,
  UserMediaProps,
  VideoComponentProps,
} from "@/types/components";

// ---------- Helper component functions ---------- //

function AudienceIcon({ audience }: { audience: string }): JSX.Element | null {
  switch (audience) {
    case "public":
      return <LucideEye size={15} />;
    case "private":
      return <LucideLock size={15} />;
    case "subscribers":
      return <LucideUsers size={15} />;
    case "price":
      return <Image src="/site/coin.svg" alt="" width={15} height={15} />;
    default:
      return null;
  }
}

// ---------- Main PostComponent ---------- //

const PostComponent: React.FC<PostComponentProps> = ({
  user,
  data,
  was_repost,
  repost_username,
  repost_id,
}) => {
  const router = useRouter();
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });

  const { fullScreenPreview } = usePostComponent();
  const { user: authUser } = useUserAuthContext();
  const socket = getSocket();

  // --- Permission/role checks --- //
  const isSubscribed = data.isSubscribed;
  const isCreator = user?.id === authUser?.id;
  const hasPaid = authUser?.purchasedPosts?.includes(data?.id as number);
  // const isAdmin = user.role === "admin"; // Default commented

  const canView =
    isCreator ||
    data.post_audience === "public" ||
    (data.post_audience === "subscribers" && isSubscribed) ||
    (data.post_audience === "price" && hasPaid);

  // --- Side effect: mark as viewed --- //
  useEffect(() => {
    if (data.post_status === "approved" && inView && authUser?.id) {
      socket.emit("post-viewed", {
        userId: authUser.id,
        postId: data.id,
      });
    }
  }, [data.post_status, inView, authUser?.id, data.id, socket]);

  // --- Render formatted post text --- //
  const formattedText = useCallback(() => {
    const text = data.post.replace(/\r?\n/g, "<br/>");
    if (!isSubscribed && data.post_audience === "subscribers" && !isCreator) {
      return "<p class='text-sm text-emerald-500'>This post is only available to subscribers</p>";
    }
    if (data.post_audience === "price" && !hasPaid && !isCreator) {
      return "<p class='text-sm text-emerald-500'>This post is only available to paid users</p>";
    }
    if (text.length >= 200) return text.slice(0, 200) + "...";
    return text;
  }, [data.post, isSubscribed, hasPaid, isCreator, data.post_audience]);

  // --- Handle image/video click event --- //
  const handleMediaClick = useCallback(
    (media: { url: string; media_type: string; index: number }) => {
      if (
        data.post_audience === "subscribers" &&
        !(isSubscribed || isCreator)
      ) {
        toast.error("You need to be a subscriber to view this post");
        return;
      }
      fullScreenPreview({
        url: media.url,
        type: media.media_type,
        open: true,
        ref: media.index,
        otherUrl: data.media
          .filter((item) => item.media_state !== "processing")
          .map((media) => ({
            url: media.url,
            type: media.media_type as "video" | "image",
            isBlob: false,
          })),
      });
    },
    [isSubscribed, data.post_audience, data.media, isCreator, fullScreenPreview]
  );

  // --- Click post routing logic --- //
  const promptSubscription = () =>
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
      if (willSubscribe) router.push(`/subscribe/${user.user_id}`);
    });

  const promptPayment = () =>
    swal({
      title: "This post is locked",
      text: `You need to pay ${data.post_price} coins to view this post.`,
      icon: "warning",
      buttons: {
        cancel: true,
        confirm: {
          text: "Pay",
          className: "bg-primary-dark-pink text-white",
        },
      },
    }).then((willPay) => {
      if (willPay) router.push(`/posts/${data.post_id}`);
    });

  const onPostClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target instanceof HTMLAnchorElement ||
      target instanceof HTMLButtonElement
    )
      return;
    e.preventDefault();

    if (data.post_audience === "subscribers" && !(isSubscribed || isCreator))
      return promptSubscription();

    if (data.post_status !== "approved") {
      swal({
        title: "This post is still processing",
        text: "Only you can view this. Post anytime — the borders will disappear when it's fully ready.",
        icon: "warning",
      });
      return;
    }

    if (
      data.post_audience === "price" &&
      !(data.user?.user_id === authUser?.user_id)
    )
      return promptPayment();

    router.push(`/posts/${data.post_id}`);
  };

  // --- Handles various locked overlays or actions on media click --- //
  const handleNonSubscriberClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (data.post_audience === "subscribers" && !(isSubscribed || isCreator)) {
      e.preventDefault();
      return promptSubscription();
    }
    if (data.post_status !== "approved") {
      e.preventDefault();
      return swal({
        title: "This post is still processing",
        text: "Only you can view this. Post anytime — the borders will disappear when it's fully ready.",
        icon: "warning",
      });
    }
    if (data.post_audience === "price" && !(isCreator || hasPaid)) {
      e.preventDefault();
      return promptPayment();
    }
  };

  const imageLength = data?.media?.length;

  return (
    <div className="px-2 py-6 duration-300  md:px-5">
      <div
        className="cursor-pointer"
        ref={ref}
        onClick={onPostClick}
        role="link"
        data-href={`/posts/${data.post_id}`}
      >
        {was_repost && (
          <div className="mb-3">
            <Link
              href={`/posts/${repost_id}`}
              className="text-purple-700 bg-purple-200 inline-block text-xs rounded-md px-2 font-bold py-1"
            >
              Reposted from {repost_username}
            </Link>
          </div>
        )}
        <div className="flex items-center mb-2 text-sm text-gray-500 justify-between">
          <div className="flex items-center gap-1 md:gap-3 dark:text-white">
            <Image
              width={50}
              height={50}
              priority
              src={user?.image.trimEnd()}
              alt=""
              className="object-cover w-8 rounded-full md:w-10 aspect-square"
            />
            <Link
              href={user?.link}
              className="flex items-center gap-1 text-xs md:text-sm"
            >
              <p className="font-bold text-black dark:text-white">
                {user.name}
              </p>
              {user.username}
            </Link>
            <small className="ml-auto">{data.time}</small>
            <div className="text-black dark:text-white">
              <AudienceIcon audience={data.post_audience} />
            </div>
          </div>
          <QuickPostActions
            options={{
              content: data.content,
              post_id: data.post_id,
              username: user.username,
              price: data?.post_price,
              post_audience: data.post_audience,
            }}
          />
        </div>
        <div
          className="py-2 leading-loose text-gray-700 dark:text-white"
          dangerouslySetInnerHTML={{ __html: formattedText() as TrustedHTML }}
        ></div>
        {/* Media Grid */}
        <div
          className={`grid gap-3 ${data.media.length === 2
            ? "grid-cols-2"
            : data.media.length >= 3
              ? "grid-cols-3"
              : "grid-cols-1"
            }`}
        >
          {data.media.slice(0, 3).map((media: UserMediaProps, i) => (
            <MediaGridItem
              key={i}
              media={media}
              i={i}
              data={data}
              canView={canView}
              imageLength={imageLength}
              handleNonSubscriberClick={handleNonSubscriberClick}
              handleMediaClick={handleMediaClick}
              isSubscribed={isSubscribed}
            />
          ))}
        </div>
      </div>
      <PostCompInteractions data={data} />
    </div>
  );
};

export default PostComponent;

// ---------- Sub-Components ---------- //

const MediaGridItem = ({
  media,
  i,
  data,
  canView,
  imageLength,
  handleNonSubscriberClick,
  handleMediaClick,
  isSubscribed,
}: {
  media: UserMediaProps;
  i: number;
  data: any;
  canView: boolean | undefined;
  imageLength: number;
  handleNonSubscriberClick: (e: MouseEvent) => void;
  handleMediaClick: (media: {
    url: string;
    media_type: string;
    index: number;
  }) => void;
  isSubscribed: boolean | undefined;
}) => {
  // Locked overlays for paid/subscriber content
  const lockedOverlay = (type: "price" | "subscribers") => (
    <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-lg bg-black/20">
      <Image
        src={media.blur ? media.blur.trimEnd() : "/site/blur.jpg"}
        alt=""
        width={300}
        height={300}
        className="w-full aspect-[3/4] md:aspect-square object-cover absolute inset-0"
      />
      <span className="flex flex-col items-center justify-center gap-2 text-white">
        {type === "price" && i === 0 ? (
          <p className="flex items-center justify-center gap-2 text-base font-bold leading-4 text-center">
            <Image
              width={20}
              height={20}
              src="/site/coin.svg"
              className="h-5 w-auto aspect-square"
              alt=""
            />
            {data.post_price}
          </p>
        ) : (
          <button className="absolute text-lg font-bold text-white">
            <LucideLock />
          </button>
        )}
      </span>
    </div>
  );

  return (
    <div
      className={`relative rounded-xl overflow-hidden ${data.post_status !== "approved" ? "border-fuchsia-500 border-2" : ""
        }`}
      onClick={handleNonSubscriberClick}
    >
      {media.media_type === "video" ? (
        !canView ? (
          <Image
            src={media.blur}
            alt=""
            width={300}
            height={300}
            unoptimized
            priority
            blurDataURL={media.blur}
            className="w-full h-full rounded-lg aspect-[3/4] md:aspect-square object-cover cursor-pointer"
          />
        ) : (
          <VideoComponent
            media={{ ...media, index: i }}
            data={data}
            clickImageEvent={handleMediaClick}
            isSubscriber={isSubscribed as boolean}
          />
        )
      ) : !canView ? (
        <Image
          src={media.blur}
          alt={data.post}
          unoptimized
          width={400}
          height={400}
          priority
          blurDataURL={media.blur}
          className="w-full h-full rounded-lg aspect-[3/4] md:aspect-square object-cover cursor-pointer"
        />
      ) : (
        <ImageComponent
          media={{ ...media, index: i }}
          data={data}
          clickImageEvent={handleMediaClick}
        />
      )}
      {/* Show more overlay (for grid index 2 and extra media) */}
      {i === 2 && data.media.length > 3 && (
        <Link
          href={
            data.post_audience === "private" ? "#" : `/posts/${data.post_id}`
          }
          className="flex flex-col absolute inset-0 items-center justify-center rounded-lg aspect-[3/4] md:aspect-square bg-gray-500/70 cursor-pointer select-none"
        >
          <div>
            <LucidePlus
              size={40}
              fill="#ffffff"
              stroke="#ffffff"
              className="text-white border-4 rounded-full"
            />
          </div>
          <p className="text-lg font-bold text-white select-none">
            {imageLength - 3} more
          </p>
        </Link>
      )}
      {/* Locked Overlays */}
      {!canView && data.post_audience === "price" && lockedOverlay("price")}
      {!canView &&
        data.post_audience === "subscribers" &&
        lockedOverlay("subscribers")}
    </div>
  );
};

const ImageComponent: React.FC<ImageCompProps> = ({
  media,
  data,
  clickImageEvent,
}) => (
  <Image
    src={media.url.trimEnd()}
    alt={data.post}
    width={900}
    height={900}
    unselectable="on"
    blurDataURL={media.poster ? media.poster : ""}
    onClick={() => clickImageEvent(media)}
    className="w-full h-full rounded-lg aspect-[3/4] md:aspect-square object-cover cursor-pointer"
  />
);

const VideoComponent: React.FC<VideoComponentProps> = ({
  media,
  data,
  clickImageEvent,
  isSubscriber,
}) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [canplay, setCanplay] = useState<boolean>(false);

  const playPauseVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.post_audience === "subscribers" && !isSubscriber) {
      toast.error("You need to be a subscriber to view this post");
      return;
    }
    const videoElement = document.getElementById(
      "video_player_post"
    ) as HTMLVideoElement | null;
    if (videoElement) {
      if (playing) {
        videoElement.pause();
      } else {
        if (canplay) {
          videoElement.play();
          setPlaying(true);
        } else {
          swal({
            title: "Video is still processing",
            icon: "warning",
            timer: 1500,
          });
        }
      }
      setPlaying(!playing);
    }
  };

  useEffect(() => {
    const videoElement = document.getElementById(
      "video_player_post"
    ) as HTMLVideoElement | null;
    if (!videoElement) return;
    const handleVideoEnd = () => {
      videoElement.controls = false;
      setPlaying(false);
    };
    videoElement.addEventListener("ended", handleVideoEnd);
    videoElement.addEventListener("play", () => setPlaying(true));
    return () => videoElement.removeEventListener("ended", handleVideoEnd);
  }, []);

  if (media.media_state === "processing") {
    return (
      <div className="h-full select-none shadow-md aspect aspect-[3/4] md:aspect-square w-full object-cover bg-black flex flex-col font-bold gap-2 items-center text-center text-sm md:text-base p-4 justify-center text-white">
        <h1>Your Media is still processing</h1>
        <small>Please wait for a few minutes</small>
      </div>
    );
  }

  return (
    <>
      <HLSVideoPlayer
        streamUrl={media.url}
        autoPlay={true}
        modalOpen={false}
        allOthers={{
          id: "video_player_post",
          playsInline: true,
          onClick: (e: MouseEvent<HTMLVideoElement>) => {
            e.currentTarget.muted = true;
            clickImageEvent(media);
          },
          onCanPlay: () => {
            setCanplay(true);
            setPlaying(true);
          },
          onEnded: () => setPlaying(false),
          poster: media.poster ? media.poster : "",
          muted: true,
        }}
        className="h-full shadow-md aspect-[3/4] md:aspect-square w-full object-cover"
      />
      {!playing && (
        <div
          onClick={playPauseVideo}
          className="absolute inset-0 flex items-center justify-center text-white rounded-lg cursor-pointer bg-black/20"
        >
          <button className="flex items-center justify-center flex-shrink-0 w-12 h-12 p-1 rounded-full bg-primary-dark-pink/30 aspect-square">
            <HiPlay className="text-white" size={50} />
          </button>
        </div>
      )}
    </>
  );
};
