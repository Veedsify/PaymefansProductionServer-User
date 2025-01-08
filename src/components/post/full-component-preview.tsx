"use client";
import usePostComponent from "@/contexts/post-component-preview";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Loader from "../lib_components/loading-animation";
import { Play, X } from "lucide-react";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Pagination } from "swiper/modules";
import "swiper/css/bundle";
import ReactHlsPlayer from "react-hls-player";

const PostComponentPreview = () => {
  const {
    ref: objectRef,
    otherUrl,
    type,
    open,
    close,
    withOptions,
  } = usePostComponent();
  const [loaded, setLoaded] = useState<boolean>(false);
  const swiperRef = useRef<SwiperClass | null>(null);

  // Scroll to the specific slide when objectRef changes
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(objectRef, 0, false);
    }
  }, [objectRef]);

  // Lock the scroll when the component is open
  useLayoutEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  // Toggle loaded state on image load
  const handleLoaded = () => setLoaded(true);

  return (
    <>
      {open && (
        <div
          className={`fixed inset-0 w-full min-h-screen z-[999] smooth-opacity select-none ${
            open ? "active" : ""
          }`}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 p-2 bg-white rounded-full text-black shadow-md z-50"
          >
            <X size={40} />
          </button>

          {/* {withOptions && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute flex items-center gap-3 z-50 bottom-0 md:w-2/3 w-full left-1/2 -translate-x-1/2 p-4 bg-white bg-opacity-15 backdrop-blur-lg"
            >
              <button className="p-2 px-4 text-sm font-bold bg-white rounded-md text-black shadow-md">
                Download
              </button>
              <button className="p-2 px-4 text-sm font-bold bg-white rounded-md text-black shadow-md">
                <LucideShare2 size={20} />
              </button>
            </div>
          )} */}

          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            className=""
            loop={true}
            modules={[Navigation, Thumbs, Pagination]}
            navigation
            onSwiper={(swiper) => (swiperRef.current = swiper)}
          >
            {otherUrl.map((item, index) => (
              <SwiperSlide
                key={index}
                className="flex items-center justify-center h-screen"
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={close}
              >
                {item.type === "video" ? (
                  <VideoPreview
                    url={item.url}
                    playAction={
                      swiperRef.current?.realIndex === index &&
                      item.type === "video"
                    }
                  />
                ) : (
                  <>
                    {!loaded && (
                      <div className="add-loaders opacity-70">
                        <Loader />
                      </div>
                    )}
                    <Image
                      onLoad={handleLoaded}
                      width={2000}
                      height={2000}
                      quality={100}
                      draggable={false}
                      src={item.url.trimEnd()}
                      className={`h-screen object-contain mx-auto w-auto transition-all duration-200 border-none animate-in z-10`}
                      alt="Media Preview"
                    />
                  </>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </>
  );
};

const VideoPreview = ({
  url,
  playAction,
}: {
  url: string;
  playAction: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Single useEffect to handle playAction prop changes
  useEffect(() => {
    if (!videoRef.current) return;

    if (playAction) {
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    } else {
      videoRef.current.pause();
    }
  }, [playAction]);

  // Single useEffect to handle video state changes
  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const handleStateChange = () => {
      if (video.ended) {
        video.currentTime = 0;
        video.play();
      }
    };

    // Add event listeners for all relevant state changes
    video.addEventListener("play", handleStateChange);
    video.addEventListener("pause", handleStateChange);
    video.addEventListener("ended", handleStateChange);

    return () => {
      video.removeEventListener("play", handleStateChange);
      video.removeEventListener("pause", handleStateChange);
      video.removeEventListener("ended", handleStateChange);
    };
  }, []); // Only run once on mount

  return (
    <div className="relative">
      <ReactHlsPlayer
        hlsConfig={{
          maxLoadingDelay: 4,
          minAutoBitrate: 0,
          lowLatencyMode: true,
        }}
        controls
        title="Video Preview"
        playerRef={videoRef}
        src={url}
        className="h-screen object-contain mx-auto w-auto transition-all duration-200 border-none animate-in scale-100 fullscreen-video"
      ></ReactHlsPlayer>
    </div>
  );
};

export default PostComponentPreview;
