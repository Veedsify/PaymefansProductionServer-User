"use client";
import { StoryPreviewProps } from "@/types/components";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Pagination } from "swiper/modules";
import "swiper/css/bundle";
import Image from "next/image";
import StoryPreviewControlls from "./status-preview-controls";
import { useCallback, useEffect, useRef, useState } from "react";
import StoriesHeader from "./stories_header";

const StoryPreviewComponent = ({
  className,
  onAllStoriesEnd,
  stories,
}: StoryPreviewProps) => {
  const swiperRef = useRef<SwiperClass | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [resetSwiper, setResetSwiper] = useState(false);

  // Memoize the function to prevent unnecessary rerenders
  const moveToNextSlide = useCallback(() => {
    if (!swiperRef.current) return;

    if (swiperRef.current.isEnd) {
      // Handle end of slides
      onAllStoriesEnd().then(() => {
        // Wrap state updates in a setTimeout to avoid render phase updates
        setTimeout(() => {
          if (swiperRef.current) {
            swiperRef.current.slideTo(0, 0, false);
            setResetSwiper(true);
          }
        }, 0);
      });
    } else {
      // Handle next slide
      requestAnimationFrame(() => {
        if (swiperRef.current) {
          swiperRef.current.slideNext(0, false);
        }
      });
    }
  }, [onAllStoriesEnd]);

  const moveToPrevSlide = useCallback(() => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev(0, false);
    }
  }, []);

  const PlayVideo = (isVideo: boolean) => {
    if (videoRef.current && isVideo) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then((_) => {
            // Automatic playback started!
            // Show playing UI.
          })
          .catch((error) => {
            // Auto-play was prevented
            // Show paused UI.
          });
      }
    }
  };

  const PlayIfVideo = (canPlay: boolean) => {
    if (canPlay) PlayVideo(true);
  };

  useEffect(() => {
    if (resetSwiper) {
      setResetSwiper(false); // Reset the flag after rendering
    }
  }, [resetSwiper]);

  return (
    <div className={`${className}`}>
      <Swiper
        key={stories.map((story) => story.id).join(",")} // Add key to force re-render
        spaceBetween={0}
        slidesPerView={1}
        className="h-full bg-black w-full"
        onSwiper={(swiper) => (swiperRef.current = swiper)}
      >
        {stories.map((story, index) => (
          <SwiperSlide className="swiper-status-class" key={index}>
            <div className="flex items-center justify-center flex-col w-full h-screen object-contain relative">
              <StoryPreviewControlls
                type={story.type}
                moveToNextSlide={moveToNextSlide}
                playVideoOnLoad={PlayIfVideo}
                clickToPlay={() => PlayVideo(story.type === "video")}
                stories={stories}
                index={index}
                moveToPrevSlide={moveToPrevSlide}
              />
              <StoriesHeader
                username={story.user.username}
                timestamp={story.created_at}
                profileImage={story.user.profile_image.trimEnd()}
              />
              {story.type === "image" && (
                <Image
                  src={story.url}
                  alt={story?.caption ? story.caption : ""}
                  width="1000"
                  height="10000"
                  className="object-contain w-full"
                />
              )}
              {story.type === "video" && (
                <video
                  ref={videoRef}
                  playsInline={true}
                  autoPlay={true}
                  loop={true}
                  preload={"video"}
                  className="object-contain h-full w-fit"
                >
                  <source src={story.url} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default StoryPreviewComponent;
