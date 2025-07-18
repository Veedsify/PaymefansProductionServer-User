"use client";
import { Story, StoryPreviewProps } from "@/types/Components";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import "swiper/css/bundle";
import Image from "next/image";
import StoryPreviewControlls from "./StatusPreviewControls";
import { useCallback, useEffect, useRef, useState } from "react";
import StoriesHeader from "./StatusHeader";
import VideoPlayer from "../sub_components/videoplayer";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { Eye, LucideEye, X } from "lucide-react";
import StatusPreviewSlide from "./StatusPreviewSlide";

// Caption Element Component

const StoryPreviewComponent = ({
  className,
  onAllStoriesEnd,
  stories,
}: StoryPreviewProps) => {
  const swiperRef = useRef<SwiperClass | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperKey, setSwiperKey] = useState(0);
  const [showViewsBottomSheet, setShowViewsBottomSheet] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const { user } = useUserAuthContext();
  const viewedStories = useRef<Set<string>>(new Set());

  // Memoize the function to prevent unnecessary rerenders
  const moveToNextSlide = useCallback(() => {
    if (!swiperRef.current) return;

    if (swiperRef.current.isEnd) {
      // Handle end of slides
      onAllStoriesEnd().then(() => {
        setActiveIndex(0);
        setSwiperKey((prev) => prev + 1); // Force swiper re-render
      });
    } else {
      swiperRef.current.slideNext(300, true);
    }
  }, [onAllStoriesEnd]);

  const moveToPrevSlide = useCallback(() => {
    if (!swiperRef.current) return;

    // Reset video if it's playing
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    // If at beginning of slides and trying to go back, wrap to end
    if (swiperRef.current.activeIndex === 0) {
      swiperRef.current.slideTo(stories.length - 1, 300, true);
    } else {
      swiperRef.current.slidePrev(300, true);
    }
  }, [stories.length]);

  const PlayVideo = useCallback((isVideo: boolean) => {
    if (videoRef.current && isVideo) {
      // Pause any previously playing videos
      document.querySelectorAll("video").forEach((video) => {
        if (video !== videoRef.current) {
          video.pause();
        }
      });
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Auto-play was prevented:", error);
        });
      }
    }
  }, []);

  const PlayIfVideo = useCallback(
    (canPlay: boolean) => {
      if (canPlay) PlayVideo(true);
    },
    [PlayVideo],
  );

  // Handle slide change to update video references
  const handleSlideChange = useCallback(
    (swiper: SwiperClass) => {
      const newIndex = swiper.activeIndex;
      setActiveIndex(newIndex);

      // Reset any playing videos
      document.querySelectorAll("video").forEach((video) => {
        video.pause();
        video.currentTime = 0;
      });

      // Find the video in the current slide and update videoRef
      const currentSlide = swiper.slides[newIndex];
      if (currentSlide) {
        const video = currentSlide.querySelector("video");
        if (video) {
          videoRef.current = video as HTMLVideoElement;
          // Small timeout to ensure DOM is ready
          setTimeout(() => PlayVideo(true), 100);
        } else {
          videoRef.current = null;
        }
      }

      // Record story view for individual media
      const currentStory = stories[newIndex];
      if (
        currentStory &&
        currentStory.media_id &&
        !viewedStories.current.has(currentStory.media_id)
      ) {
        viewedStories.current.add(currentStory.media_id);
      }
    },
    [PlayVideo, stories],
  );

  // Preload adjacent slides for smoother transitions
  useEffect(() => {
    const preloadAdjacentSlides = () => {
      if (!stories || stories.length === 0) return;

      const nextIndex =
        activeIndex + 1 < stories.length ? activeIndex + 1 : null;
      const prevIndex = activeIndex - 1 >= 0 ? activeIndex - 1 : null;

      // Preload next image
      if (nextIndex !== null && stories[nextIndex].media_type === "image") {
        const img = new window.Image();
        img.src = stories[nextIndex].media_url;
      }

      // Preload previous image
      if (prevIndex !== null && stories[prevIndex].media_type === "image") {
        const img = new window.Image();
        img.src = stories[prevIndex].media_url;
      }
    };

    preloadAdjacentSlides();
  }, [activeIndex, stories]);

  // Reset component when unmounting
  useEffect(() => {
    return () => {
      // Cleanup function - reset state when component unmounts
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
      }
    };
  }, []);

  // Early return if no stories
  if (!stories || stories.length === 0) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center min-h-dvh bg-black ${className}`}
      >
        <p className="text-white">No stories available</p>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center min-h-dvh bg-black ${className}`}
    >
      {/* Header */}
      <div className="lg:max-w-3xl w-full mx-auto z-20 absolute top-0 left-1/2 -translate-x-1/2">
        <StoriesHeader
          username={stories[activeIndex]?.user?.username || ""}
          timestamp={stories[activeIndex]?.created_at || ""}
          profileImage={
            stories[activeIndex]?.user?.profile_image?.trimEnd() || ""
          }
        />
      </div>

      {/* Main Content Area */}
      <div className="relative lg:max-w-3xl w-full h-dvh flex items-center justify-center">
        {/* Controls */}
        <div className="absolute w-full mx-auto left-1/2 -translate-x-1/2 top-2 pointer-events-none z-[550]">
          <StoryPreviewControlls
            type={stories[activeIndex]?.media_type || "image"}
            moveToNextSlide={moveToNextSlide}
            playVideoOnLoad={PlayIfVideo}
            clickToPlay={() =>
              PlayVideo(stories[activeIndex]?.media_type === "video")
            }
            stories={stories}
            index={activeIndex}
            moveToPrevSlide={moveToPrevSlide}
          />
        </div>

        {/* Swiper Container */}
        <div className="w-full h-full">
          <Swiper
            key={swiperKey}
            spaceBetween={0}
            slidesPerView={1}
            allowTouchMove={true}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="w-full h-full"
            onSlideChange={handleSlideChange}
            speed={300}
            initialSlide={activeIndex}
            watchSlidesProgress={true}
          >
            {stories.map((story, index) => (
              <SwiperSlide
                className="flex items-center justify-center bg-black relative"
                key={`${story.media_url}-${index}-${swiperKey}`}
              >
                <StatusPreviewSlide
                  index={index}
                  activeIndex={activeIndex}
                  moveToNextSlide={moveToNextSlide}
                  story={story}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Bottom View Count (for story owner) */}
      {stories[activeIndex]?.user?.id === user?.id && viewCount > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={() => setShowViewsBottomSheet(true)}
            className="flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-black/80 transition-colors"
          >
            <Eye size={16} />
            <span className="text-sm font-medium">
              {viewCount} view{viewCount !== 1 ? "s" : ""}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryPreviewComponent;
