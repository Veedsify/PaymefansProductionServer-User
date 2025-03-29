"use client";
import {
  DollarSign,
  LucideEye,
  LucideLock,
  LucidePlus,
  LucideUsers,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import usePostComponent from "@/contexts/post-component-preview";
import { HiPlay } from "react-icons/hi";
import {
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import QuickPostActions from "../sub_components/quick_post_actions";
import swal from "sweetalert";
import { PostCompInteractions } from "./post-interactions";
import {
  ImageCompProps,
  PostComponentProps,
  UserMediaProps,
  VideoComponentProps,
} from "@/types/components";
import Hls from "hls.js";
import HLSVideoPlayer from "../sub_components/videoplayer";
import { useUserAuthContext } from "@/lib/userUseContext";
import { socket } from "../sub_components/sub/socket";
import { useInView } from "react-intersection-observer";

const PostComponent: React.FC<PostComponentProps> = ({
  user,
  data,
  was_repost,
  repost_username,
  repost_id,
}) => {
  const imageLength = data.media.length;
  const { fullScreenPreview } = usePostComponent();
  const { user: authUser } = useUserAuthContext();
  const isCreator = user?.id === authUser?.id;
  // const isAdmin = user.role === "admin";
  const isSubscribed = authUser?.subscriptions?.includes(
    data.user?.id as number
  );
  const hasPaid = authUser?.purchasedPosts?.includes(data?.id as number);
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true
  });

  // Mark post as viewed
  useEffect(() => {
    if (data.post_status === "approved" && inView && authUser?.user_id) {
      socket.emit("post-viewed", {
        userId: authUser.id,
        postId: data.id,
      });
    }
  }, [data.id, data.post_status, inView, authUser?.user_id]);

  // Determine visibility
  const canView =
    // isAdmin || // Admin sees all
    isCreator || // Creator sees their own posts
    data.post_audience === "public" || // Public posts are visible to all
    (data.post_audience === "subscribers" && isSubscribed) || // Subscriber-only post for subscribed users
    (data.post_audience === "price" && hasPaid); // Paid posts if the user has paid

  const router = useRouter();

  
  const formattedText = useCallback(() => {
    const text = data.post.replace(/\r?\n/g, "<br/>");
    if (!isSubscribed && data.post_audience === "subscribers" && !isCreator) {
      return "<p class='text-sm text-emerald-500'>This post is only available to subscribers</p>";
    }
    if (data.post_audience === "price" && !hasPaid && !isCreator) {
      return "<p class='text-sm text-emerald-500'>This post is only available to paid users</p>";
    }
    if (text.length >= 200) {
      return text.slice(0, 200) + "...";
    }

    return text;
  }, [data.post, isSubscribed, hasPaid, isCreator, data.post_audience]);

  const clickImageEvent = useCallback(
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
            type: media.media_type,
          })),
      });
    },
    [isSubscribed, data.post_audience, data.media, fullScreenPreview]
  );

  const redirectToPost = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLDivElement;
      if (
        !(target instanceof HTMLAnchorElement) &&
        !(target instanceof HTMLButtonElement)
      ) {
        e.preventDefault();
        if (
          data.post_audience === "subscribers" &&
          !(isSubscribed || isCreator)
        ) {
          swal({
            title: "You need to be a subscriber to view this post",
            icon: "/icons/error.svg",
            buttons: {
              cancel: true,
              confirm: {
                text: "Subscribe",
                className: "bg-primary-dark-pink text-white",
              },
            },
          }).then((willSubscribe) => {
            if (willSubscribe) {
              router.push(`/subscribe/${user.user_id}`);
            }
          });
          return;
        }
        if (data.post_status !== "approved") {
          e.preventDefault();
          swal({
            title: "This post is still processing",
            text: "Only you can preview this. Post while processing; it's done when borders disappear.",
            icon: "warning",
          });
          return;
        }

        if (
          data.post_audience === "price" &&
          !(data.user?.user_id === authUser?.user_id)
        ) {
          e.preventDefault();
          swal({
            title: "This post is locked",
            text: "You need to pay 5,000 coins to view this post.",
            icon: "warning",
            buttons: {
              cancel: true,
              confirm: {
                text: "Pay",
                className: "bg-primary-dark-pink text-white",
              },
            },
          }).then((willPay) => {
            if (willPay) {
              router.push(`/posts/${data.post_id}`);
            }
          });
          return;
        }
        router.push(`/posts/${data.post_id}`);
      }
    },
    [
      router,
      data.post_status,
      data.post_id,
      data.post_audience,
      isSubscribed,
      user.user_id,
      data.user?.user_id,
      authUser?.user_id,
    ]
  );

  const handleNonSubscriberClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (data.post_audience === "subscribers" && !(isSubscribed || isCreator)) {
      e.preventDefault();
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
          router.push(`/subscribe/${user.user_id}`);
        }
      });
    }
    if (data.post_status !== "approved") {
      e.preventDefault();
      swal({
        title: "This post is still processing",
        text: "Only you can preview this. Post while processing; it's done when borders disappear.",
        icon: "warning",
      });
    }
    if (data.post_audience === "price" && !(isCreator || hasPaid)) {
      e.preventDefault();
      swal({
        title: "This post is paid",
        text: "You need to pay 5,000 coins to view this post.",
        icon: "warning",
        buttons: {
          cancel: true,
          confirm: {
            text: "Pay",
            className: "bg-primary-dark-pink text-white",
          },
        },
      }).then((willPay) => {
        if (willPay) {
          router.push(`/posts/${data.post_id}`);
        }
      });
    }
  };

  const GetAudienceIcon = (audience: string): ReactNode => {
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
  };

  return (
    <div className=" py-6 px-2 md:px-5 duration-300">
      <div
        className="cursor-pointer"
        onClick={redirectToPost}
        role="link"
        ref={ref}
        data-href={`/posts/${data.post_id}`}
      >
        {was_repost && (
          <div className="mb-3">
            <Link
              href={`/posts/${repost_id}`}
              className={
                "text-purple-700 bg-purple-200 inline-block text-xs rounded-md px-2 font-bold py-1"
              }
            >
              Reposted from {repost_username}
            </Link>
          </div>
        )}
        <div className="flex items-center justify-between text-gray-500 text-sm mb-2">
          <div className="flex items-center gap-1 md:gap-3 dark:text-white">
            <Image
              width={50}
              height={50}
              priority
              src={user?.image.trimEnd()}
              alt=""
              className="w-8 md:w-10 rounded-full aspect-square object-cover"
            />
            <Link
              href={user?.link}
              className="flex items-center gap-1 text-xs md:text-sm"
            >
              <p className="text-black dark:text-white font-bold">
                {user.name}
              </p>
              {user.username}
            </Link>
            <small className="ml-auto">{data.time}</small>
            <div className="text-black dark:text-white">
              {GetAudienceIcon(data.post_audience)}
            </div>
          </div>
          <QuickPostActions
            options={{
              content: data.content,
              post_id: data.post_id,
              username: user.username,
              post_audience: data.post_audience,
            }}
          />
        </div>
        <div
          className="py-2 leading-loose text-gray-700 dark:text-white"
          dangerouslySetInnerHTML={{ __html: formattedText() as TrustedHTML }}
        ></div>
        <div
          className={`grid gap-3 ${
            data.media.length === 2
              ? "grid-cols-2"
              : data.media.length >= 3
              ? "grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {data.media.slice(0, 3).map((media: UserMediaProps, i) => (
            <div
              className={`relative rounded-xl overflow-hidden ${
                data.post_status !== "approved" && "border-fuchsia-500 border-2"
              }`}
              key={i}
              onClick={handleNonSubscriberClick}
            >
              <>
                {media.media_type === "video" && (
                  <>
                    {!canView ? (
                      <Image
                        src={"/site/blur.jpg"}
                        alt={data.post}
                        width={300}
                        height={300}
                        unoptimized
                        priority
                        blurDataURL={media.blur}
                        className="w-full h-full rounded-lg aspect-[3/4] md:aspect-square object-cover cursor-pointer"
                      />
                    ) : (
                      <div className="relative">
                        <VideoComponent
                          media={{ ...media, index: i }}
                          data={data}
                          clickImageEvent={clickImageEvent}
                          isSubscriber={isSubscribed as boolean}
                        />
                      </div>
                    )}
                  </>
                )}
                {media.media_type !== "video" && (
                  <>
                    {!canView ? (
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
                        clickImageEvent={clickImageEvent}
                      />
                    )}
                  </>
                )}
                {i === 2 && data.media.length > 3 && (
                  <Link
                    href={
                      data.post_audience === "private"
                        ? "#"
                        : `/posts/${data.post_id}`
                    }
                    className="flex flex-col absolute inset-0 items-center justify-center rounded-lg aspect-[3/4] md:aspect-square bg-gray-500/70 cursor-pointer select-none"
                  >
                    <div>
                      <LucidePlus
                        size={40}
                        fill="#ffffff"
                        stroke="#ffffff"
                        className="border-4 text-white rounded-full"
                      />
                    </div>
                    <p className="text-lg font-bold select-none text-white">
                      {imageLength - 3} more
                    </p>
                  </Link>
                )}
              </>
              <>
                {data.post_audience === "price" && !canView && (
                  <div className="absolute inset-0 bg-black/20 rounded-lg overflow-hidden flex items-center justify-center z-10">
                    <Image
                      src={media.blur ? media.blur.trimEnd() : "/site/blur.jpg"}
                      alt=""
                      width={300}
                      height={300}
                      className="w-full aspect-[3/4] md:aspect-square object-cover absolute inset-0"
                    />
                    <div className="lock-icon absolute inset-0 w-[85%] h-[65%] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rounded-lg flex items-center justify-center dark:bg-slate-900/70 bg-slate-900/40 cursor-not-allowed">
                      <span className="flex items-center justify-center flex-col gap-2 text-white">
                        {i == 0 ? (
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
                {data.post_audience === "subscribers" && !canView && (
                  <div className="absolute inset-0 bg-black/20 rounded-lg overflow-hidden flex items-center justify-center z-10">
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
              </>
            </div>
          ))}
        </div>
      </div>
      <PostCompInteractions data={data} />
    </div>
  );
};

const ImageComponent: React.FC<ImageCompProps> = ({
  media,
  data,
  clickImageEvent,
}) => {
  return (
    <>
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
    </>
  );
};

const VideoComponent: React.FC<VideoComponentProps> = ({
  media,
  data,
  clickImageEvent,
  isSubscriber,
}) => {
  const [playing, setPlaying] = useState<boolean>(false);
  const [canplay, setCanplay] = useState<boolean>(false);

  const playPauseVideo = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [isSubscriber, data.post_audience, playing, canplay]
  );

  useEffect(() => {
    const videoElement = document.getElementById(
      "video_player_post"
    ) as HTMLVideoElement | null;

    if (!videoElement) return;

    const handleVideoEnd = () => {
      if (videoElement) {
        videoElement.controls = false;
        setPlaying(false);
      }
    };

    videoElement.addEventListener("ended", handleVideoEnd);
    videoElement.addEventListener("play", () => setPlaying(true));

    return () => {
      videoElement.removeEventListener("ended", handleVideoEnd);
    };
  }, []);

  if (media.media_state == "processing") {
    return (
      <div className="h-full select-none shadow-md aspect aspect-[3/4] md:aspect-square w-full object-cover bg-black flex flex-col gap-2 items-center justify-center text-white">
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
          className="absolute inset-0 text-white bg-black/20 rounded-lg flex items-center justify-center cursor-pointer"
        >
          <button className="h-12 w-12 p-1 flex-shrink-0 rounded-full flex items-center justify-center bg-primary-dark-pink/30 aspect-square">
            <HiPlay className="text-white" size={50} />
          </button>
        </div>
      )}
    </>
  );
};

export default PostComponent;
