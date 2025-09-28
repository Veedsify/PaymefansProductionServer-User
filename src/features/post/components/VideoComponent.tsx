import { type MouseEvent, memo, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiPlay } from "react-icons/hi";
import swal from "sweetalert";
import type { VideoComponentProps } from "@/types/Components";
import HLSVideoPlayer from "../../media/videoplayer";

const VideoComponent = memo<VideoComponentProps>(
  ({ media, data, clickImageEvent, isSingle, isSubscriber }) => {
    const [playing, setPlaying] = useState<boolean>(false);
    const [canplay, setCanplay] = useState<boolean>(false);

    const playPauseVideo = (e: MouseEvent) => {
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

      const handlePlay = () => setPlaying(true);

      videoElement.addEventListener("ended", handleVideoEnd);
      videoElement.addEventListener("play", handlePlay);

      return () => {
        videoElement.removeEventListener("ended", handleVideoEnd);
        videoElement.removeEventListener("play", handlePlay);
      };
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
          isSingle={isSingle}
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
          className="shadow-md aspect-[3/4] md:aspect-square w-full object-cover"
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
  }
);

VideoComponent.displayName = "VideoComponent";
export default VideoComponent;
