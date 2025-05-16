"use client";

import React, { useEffect, useRef, useState, memo } from "react";
import Image from "next/image";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "swiper/css/bundle";
import { motion } from "framer-motion";
import usePostComponent from "@/contexts/post-component-preview";
import Loader from "../lib_components/loading-animation";
import HLSVideoPlayer from "../sub_components/videoplayer";

// Define types
interface MediaItem {
  url: string;
  isBlob?: boolean;
  type: "image" | "video";
}

// Navigation Button Props
interface NavigationButtonProps {
  direction: "prev" | "next";
  className: string;
  ariaLabel: string;
}

// Video Preview Props
interface VideoPreviewProps {
  url: string;
  isBlob: boolean;
  playAction: boolean;
}

// Video Preview Component
const VideoPreview = memo(({ url, isBlob, playAction }: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Handle video play/pause based on active slide
  useEffect(() => {
    if (videoRef.current) {
      if (playAction) {
        videoRef.current.play().catch((error) => {
          console.error("Video playback error:", error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [playAction]);

  // Handle video looping
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch((error) => {
        console.error("Video loop error:", error);
      });
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, []);

  if (isBlob) {
    return (
      <video
        ref={videoRef}
        className="h-dvh w-auto object-contain"
        controls
        autoPlay={playAction}
        loop
        muted
      >
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <HLSVideoPlayer
        streamUrl={url}
        autoPlay={true}
        modalOpen={true}
        allOthers={{
          id: "video_player_full",
          muted: false,
        }}
        className="h-dvh w-auto max-w-3xl object-contain transition-all duration-200"
      />
    </div>
  );
});
VideoPreview.displayName = "VideoPreview";

// Navigation Button Component
const NavigationButton: React.FC<NavigationButtonProps> = ({
  direction,
  className,
  ariaLabel,
}) => (
  <button
    className={`${className} absolute z-10 -translate-y-1/2 rounded-full bg-gray-200 p-2 opacity-0 transition-opacity duration-200 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white md:opacity-50`}
    aria-label={ariaLabel}
  >
    {direction === "prev" ? (
      <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
    ) : (
      <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
    )}
  </button>
);

// Main Component
const PostComponentPreview = memo(() => {
  const { ref: objectRef, otherUrl, open, close } = usePostComponent();
  const [loaded, setLoaded] = useState<boolean>(false);
  const swiperRef = useRef<SwiperClass | null>(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) close();
    };
    window.addEventListener("keydown", handleEscKeyPress);
    return () => window.removeEventListener("keydown", handleEscKeyPress);
  }, [close, open]);

  // Scroll to specific slide when objectRef changes
  useEffect(() => {
    if (swiperRef.current && objectRef !== undefined) {
      swiperRef.current.slideTo(objectRef, 0, false);
    }
  }, [objectRef]);

  // Lock scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle image load
  const handleLoaded = () => setLoaded(true);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[999] h-dvh w-full select-none bg-black transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Close Button */}
      <button
        onClick={close}
        className="absolute right-4 top-4 z-50 rounded-full bg-white p-2 text-black shadow-md focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Close preview"
      >
        <X className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Swiper Slider */}
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        className="h-dvh"
        modules={[Navigation]}
        touchRatio={1.5}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        navigation={{
          prevEl: ".swiper-prev",
          nextEl: ".swiper-next",
        }}
      >
        {otherUrl.map((item: MediaItem, index: number) => (
          <SwiperSlide
            key={index}
            className="flex h-full items-center justify-center"
            onDoubleClick={close}
          >
            {item.type === "video" ? (
              <VideoPreview
                url={item.url}
                isBlob={item.isBlob || false}
                playAction={swiperRef.current?.realIndex === index}
              />
            ) : (
              <div className="relative flex h-full items-center justify-center">
                {!loaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader />
                  </div>
                )}
                <Image
                  src={item.url.trimEnd()}
                  width={2000}
                  height={2000}
                  quality={100}
                  loading="lazy"
                  className="h-dvh w-auto object-contain transition-opacity duration-300"
                  alt={`Media preview ${index + 1}`}
                  onLoad={handleLoaded}
                  onError={handleLoaded}
                  onDragStart={(e) => e.preventDefault()}
                />
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation Buttons */}
      {otherUrl.length > 1 && (
        <>
          <NavigationButton
            direction="prev"
            className="swiper-prev left-4 top-1/2"
            ariaLabel="Previous slide"
          />
          <NavigationButton
            direction="next"
            className="swiper-next right-4 top-1/2"
            ariaLabel="Next slide"
          />
        </>
      )}
    </div>
  );
});

PostComponentPreview.displayName = "PostComponentPreview";
export default PostComponentPreview;
