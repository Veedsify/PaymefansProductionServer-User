"use client";
import { StoryPreviewProps } from "@/types/components";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import "swiper/css/bundle";
import Image from "next/image";
import StoryPreviewControlls from "./status-preview-controls";
import { useCallback, useEffect, useRef, useState } from "react";
import StoriesHeader from "./stories_header";
import VideoPlayer from "../sub_components/videoplayer";

const StoryPreviewComponent = ({
  className,
  onAllStoriesEnd,
  stories,
}: StoryPreviewProps) => {
  const swiperRef = useRef<SwiperClass | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [resetSwiper, setResetSwiper] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Memoize the function to prevent unnecessary rerenders
  const moveToNextSlide = useCallback(() => {
    if (!swiperRef.current) return;

    if (swiperRef.current.isEnd) {
      // Handle end of slides
      onAllStoriesEnd().then(() => {
        // Use requestAnimationFrame instead of setTimeout for better performance
        requestAnimationFrame(() => {
          if (swiperRef.current) {
            swiperRef.current.slideTo(0, 0, false);
            setResetSwiper(true);
          }
        });
      });
    } else {
      // Handle next slide
      requestAnimationFrame(() => {
        if (swiperRef.current) {
          swiperRef.current.slideNext(300, true);
          setActiveIndex(swiperRef.current.activeIndex);
        }
      });
    }
  }, [onAllStoriesEnd]);

  const moveToPrevSlide = useCallback(() => {
    if (swiperRef.current) {
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

      setActiveIndex(swiperRef.current.activeIndex);
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
    [PlayVideo]
  );

  // Handle slide change to update video references
  const handleSlideChange = useCallback(
    (swiper: SwiperClass) => {
      const newIndex = swiper.activeIndex;
      setActiveIndex(newIndex);

      // Reset any playing videos
      document.querySelectorAll("video").forEach((video) => {
        if (video !== videoRef.current) {
          video.pause();
          video.currentTime = 0;
        }
      });

      // Find the video in the current slide and update videoRef
      const currentSlide = swiper.slides[newIndex];
      if (currentSlide) {
        const video = currentSlide.querySelector("video");
        if (video) {
          videoRef.current = video as HTMLVideoElement;
          // Small timeout to ensure DOM is ready
          setTimeout(() => PlayVideo(true), 50);
        }
      }
    },
    [PlayVideo]
  );

  // Preload adjacent slides for smoother transitions
  useEffect(() => {
    const preloadAdjacentSlides = () => {
      if (!stories || !swiperRef.current) return;

      const currentIndex = swiperRef.current.activeIndex;
      const nextIndex =
        currentIndex + 1 < stories.length ? currentIndex + 1 : null;
      const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : null;

      // Preload next image/video
      if (nextIndex !== null && stories[nextIndex].type === "image") {
        const img = new window.Image();
        img.src = stories[nextIndex].url;
      }

      // Preload previous image/video
      if (prevIndex !== null && stories[prevIndex].type === "image") {
        const img = new window.Image();
        img.src = stories[prevIndex].url;
      }
    };

    preloadAdjacentSlides();
  }, [activeIndex, stories]);

  useEffect(() => {
    if (resetSwiper) {
      setResetSwiper(false); // Reset the flag after rendering
    }
  }, [resetSwiper]);

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

  // When active slide changes, ensure proper cleanup and setup
  useEffect(() => {
    // Cleanup previous video if exists
    document.querySelectorAll("video").forEach((video) => {
      if (video !== videoRef.current) {
        video.pause();
        video.currentTime = 0;
      }
    });

    // Reset swiper when needed
    if (resetSwiper) {
      setResetSwiper(false);
      // Force reload active content
      if (videoRef.current && stories[activeIndex]?.type === "video") {
        videoRef.current.load();
        PlayVideo(true);
      }
    }
  }, [resetSwiper, activeIndex, stories, PlayVideo]);

  return (
    <div className={`${className}`}>
      {stories.length > 0 && (
        <StoriesHeader
          username={stories[activeIndex].user.username}
          timestamp={stories[activeIndex].created_at}
          profileImage={stories[activeIndex].user.profile_image.trimEnd()}
        />
      )}
      <div className="relative">
        {stories.length > 0 && (
          <StoryPreviewControlls
            type={stories[activeIndex].type}
            moveToNextSlide={moveToNextSlide}
            playVideoOnLoad={PlayIfVideo}
            clickToPlay={() => PlayVideo(stories[activeIndex].type === "video")}
            stories={stories}
            index={activeIndex}
            moveToPrevSlide={moveToPrevSlide}
          />
        )}
        <Swiper
          key={`stories-swiper-${activeIndex}-${stories.length}-${resetSwiper}`}
          spaceBetween={0}
          slidesPerView={1}
          className="h-full bg-black w-full"
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={handleSlideChange}
          speed={300}
          initialSlide={activeIndex}
        >
          {stories.map((story, index) => (
            <SwiperSlide
              className="swiper-status-class"
              key={`${story.url}-${index}`}
            >
              <div className="flex items-center justify-center flex-col w-full h-screen object-contain relative">
                {story.type === "image" && (
                  <Image
                    src={story.url}
                    alt={story?.caption ? story.caption : ""}
                    width={1000}
                    height={1000}
                    priority={index === activeIndex}
                    loading={index === activeIndex ? "eager" : "lazy"}
                    // className="object-contain w-full max-h-[calc(100vh-120px)]"
                  />
                )}
                {story.type === "video" && (
                  <VideoPlayer
                    modalOpen={false}
                    autoPlay={index === activeIndex}
                    allOthers={{
                      playsInline: true,
                      muted: false,
                      controls: false,
                      loop: false,
                      preload: index === activeIndex ? "auto" : "metadata",
                      onEnded: () => moveToNextSlide,
                      style: { width: "100%", maxHeight: "calc(100vh - 120px)" }
                    }}
                    className="object-contain w-full"
                    streamUrl={story.url}
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default StoryPreviewComponent;
