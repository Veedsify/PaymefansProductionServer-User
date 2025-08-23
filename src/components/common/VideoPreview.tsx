"use client";

import React, { useEffect, useRef, useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import HLSVideoPlayer from "../sub_components/videoplayer";
import { MEDIA_CONSTANTS, UserProfile } from "./mediaPreviewTypes";

interface VideoPreviewProps {
  url: string;
  isBlob: boolean;
  playAction: boolean;
  index: number;
  userProfile?: UserProfile | null;
}

const VideoPreview = memo(
  ({ url, isBlob, playAction, index, userProfile }: VideoPreviewProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">(
      "loading"
    );
    const [retryCount, setRetryCount] = useState(0);

    const handleVideoLoad = useCallback(() => {
      setStatus("ready");
    }, []);

    const handleVideoError = useCallback(() => {
      if (retryCount < 2) {
        console.warn(`Video failed to load at index ${index}, retrying...`);
        setRetryCount((prev) => prev + 1);
        setTimeout(() => {
          const video = videoRef.current;
          if (video) {
            video.load();
          }
        }, 500);
      } else {
        setStatus("error");
        console.warn(`Video failed to load at index ${index} after retries`);
      }
    }, [index, retryCount]);

    const handleVideoEnded = useCallback(() => {
      const video = videoRef.current;
      if (video && status === "ready") {
        video.currentTime = 0;
        video.play().catch((e) => {
          console.warn(`Video ended but could not replay: ${e.message}`);
        });
      }
    }, [status]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || status !== "ready") return;

      const playVideo = async () => {
        if (playAction) {
          try {
            await video.play();
          } catch (err: any) {
            console.warn(`Video play failed: ${err.message}`);
            if (err.name !== "AbortError") {
              setStatus("error");
            }
          }
        } else {
          video.pause();
        }
      };
      playVideo();
    }, [playAction, status]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const abortController = new AbortController();
      video.addEventListener("ended", handleVideoEnded, {
        signal: abortController.signal,
      });
      video.addEventListener("loadeddata", handleVideoLoad, {
        signal: abortController.signal,
      });
      video.addEventListener("error", handleVideoError, {
        signal: abortController.signal,
      });

      return () => {
        abortController.abort();
        video.pause();
        video.removeAttribute("src");
        video.load();
        if (isBlob) URL.revokeObjectURL(url);
      };
    }, [
      handleVideoEnded,
      handleVideoLoad,
      handleVideoError,
      url,
      isBlob,
      retryCount,
    ]);

    if (status === "error") {
      return (
        <motion.div
          className="flex items-center justify-center h-full text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center space-y-4 p-4">
            <div className="text-4xl md:text-6xl">🎥</div>
            <p className="text-base md:text-lg">Video unavailable</p>
            <p className="text-xs md:text-sm text-gray-400">
              This video could not be loaded
            </p>
            <button
              onClick={() => {
                setStatus("loading");
                setRetryCount(0);
              }}
              className="mt-2 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              Retry
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="relative flex items-center justify-center h-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          duration: MEDIA_CONSTANTS.ANIMATION_DURATION_SEC,
          type: "spring",
        }}
      >
        {isBlob ? (
          <video
            ref={videoRef}
            className="object-contain w-auto h-dvh"
            controls={false}
            loop
            muted
            playsInline
            preload={playAction ? "metadata" : "none"}
            aria-label={`Video ${index + 1}`}
          >
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <HLSVideoPlayer
            streamUrl={url}
            autoPlay={playAction}
            modalOpen={true}
            userProfile={userProfile}
            allOthers={{
              id: `video_player_full_${index}`,
              muted: false,
              playsInline: true,
            }}
            className="object-contain h-dvh transition-all duration-200"
          />
        )}
      </motion.div>
    );
  }
);
VideoPreview.displayName = "VideoPreview";

export default VideoPreview;
