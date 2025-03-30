"use client";
import usePostComponent from "@/contexts/post-component-preview";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Loader from "../lib_components/loading-animation";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Pagination } from "swiper/modules";
import "swiper/css/bundle";
import Hls from "hls.js";
import HLSVideoPlayer from "../sub_components/videoplayer";

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

  useEffect(() => {
    const handleEscKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        close();
      }
    };
    window.addEventListener("keydown", handleEscKeyPress);
    return () => {
      window.removeEventListener("keydown", handleEscKeyPress);
    };
  }, [close, open]);

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

  if (open === false) return null;

  return (
    <>
      {open && (
        <div
          className={`fixed inset-0 w-full h-screen z-[999] smooth-opacity select-none ${
            open ? "active" : ""
          }`}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 p-2 bg-white rounded-full text-black shadow-md z-50"
          >
            <X className="md:h-[30px] h-[20px] md:w-[30px] w-[20px]" />
          </button>

          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            className="h-screen"
            modules={[Navigation, Pagination]}
            draggable={false}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
          >
            {otherUrl.map((item, index) => (
              <SwiperSlide
                key={index}
                className="flex items-center justify-center h-full"
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
                      className={`h-screen object-contain w-auto transition-all duration-200 border-none animate-in z-10`}
                      alt="Media Preview"
                    />
                  </>
                )}
              </SwiperSlide>
            ))}
            {/* Custom Navigation */}
            {otherUrl.length > 1 && (
              <>
                <button
                  onClick={() => swiperRef.current?.slidePrev()}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-gray-200 p-2 opacity-0 md:opacity-20 pointer-events-none md:pointer-events-auto hover:opacity-100 rounded-full hover:bg-gray-300"
                >
                  <ChevronLeft className="md:h-[30px] h-[20px] md:w-[30px] w-[20px]" />
                </button>
                <button
                  onClick={() => swiperRef.current?.slideNext()}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-gray-200 p-2 opacity-0 md:opacity-20 pointer-events-none md:pointer-events-auto hover:opacity-100 rounded-full hover:bg-gray-300"
                >
                  <ChevronRight className="md:h-[30px] h-[20px] md:w-[30px] w-[20px]" />
                </button>
              </>
            )}
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
  // Handle play/pause action using video element with id
  useEffect(() => {
    const videoElement = document.getElementById(
      "video_player_full"
    ) as HTMLVideoElement | null;

    if (!videoElement) return;

    if (playAction) {
      videoElement.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    } else {
      videoElement.pause();
    }
  }, [playAction]);

  // Handle video state changes (play, pause, ended) using video element with id
  useEffect(() => {
    const videoElement = document.getElementById(
      "video_player_full"
    ) as HTMLVideoElement | null;

    if (!videoElement) return;

    const handleStateChange = () => {
      if (videoElement.ended) {
        videoElement.currentTime = 0;
        videoElement.play();
      }
    };

    // Add event listeners for play, pause, and ended states
    videoElement.addEventListener("play", handleStateChange);
    videoElement.addEventListener("pause", handleStateChange);
    videoElement.addEventListener("ended", handleStateChange);

    return () => {
      videoElement.removeEventListener("play", handleStateChange);
      videoElement.removeEventListener("pause", handleStateChange);
      videoElement.removeEventListener("ended", handleStateChange);
    };
  }, []);

  return (
    <div className="relative">
      <HLSVideoPlayer
        streamUrl={url}
        autoPlay={true}
        modalOpen={true}
        allOthers={{
          id: "video_player_full",
          muted: false,
        }}
        className="h-screen object-contain mx-auto w-full max-w-3xl transition-all duration-200 border-none animate-in scale-100 fullscreen-video"
      />
    </div>
  );
};

export default PostComponentPreview;
