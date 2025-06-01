"use client";

import React, {
  useEffect,
  useRef,
  useState,
  memo,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard, A11y } from "swiper/modules";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "swiper/css/bundle";
import { motion, AnimatePresence } from "framer-motion";
import usePostComponent from "@/contexts/PostComponentPreview";
import Loader from "../lib_components/LoadingAnimation";
import HLSVideoPlayer from "../sub_components/videoplayer";

// Define types
interface MediaItem {
  url: string;
  isBlob?: boolean;
  type: "image" | "video";
  alt?: string; // Added for better accessibility
  thumbnailUrl?: string; // Added for performance optimization
}

interface NavigationButtonProps {
  direction: "prev" | "next";
  className: string;
  ariaLabel: string;
  onClick?: () => void;
}

interface VideoPreviewProps {
  url: string;
  isBlob: boolean;
  playAction: boolean;
  index: number; // Added for better debugging/tracking
}

interface ImagePreviewProps {
  url: string;
  alt: string;
  index: number;
  onLoad: () => void;
  onError: () => void;
}

// Constants for better maintainability
const ANIMATION_DURATION = 200;
const SWIPER_CONFIG = {
  spaceBetween: 0,
  slidesPerView: 1 as const,
  touchRatio: 1.5,
  speed: 300,
  threshold: 10,
  longSwipesRatio: 0.5,
};

// Video Preview Component with improved error handling and performance
const VideoPreview = memo(
  ({ url, isBlob, playAction, index }: VideoPreviewProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Memoized video handlers
    const handleVideoLoad = useCallback(() => {
      setIsLoading(false);
      setHasError(false);
    }, []);

    const handleVideoError = useCallback(() => {
      setIsLoading(false);
      setHasError(true);
      console.error(`Video failed to load at index ${index}:`, url);
    }, [index, url]);

    const handleVideoEnded = useCallback(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch((error) => {
          console.error("Video loop error:", error);
        });
      }
    }, []);

    // Handle video play/pause based on active slide
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      if (playAction) {
        video.play().catch((error) => {
          console.error("Video playback error:", error);
          setHasError(true);
        });
      } else {
        video.pause();
      }
    }, [playAction]);

    // Handle video looping
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      video.addEventListener("ended", handleVideoEnded);
      video.addEventListener("loadeddata", handleVideoLoad);
      video.addEventListener("error", handleVideoError);

      return () => {
        video.removeEventListener("ended", handleVideoEnded);
        video.removeEventListener("loadeddata", handleVideoLoad);
        video.removeEventListener("error", handleVideoError);
      };
    }, [handleVideoEnded, handleVideoLoad, handleVideoError]);

    if (hasError) {
      return (
        <div className="flex h-full items-center justify-center text-white">
          <div className="text-center">
            <p className="mb-2">Failed to load video</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-400 hover:text-blue-300"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    const motionProps = {
      initial: { opacity: 0.3, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
      transition: { duration: ANIMATION_DURATION / 1000 },
    };

    if (isBlob) {
      return (
        <motion.div
          className="relative flex h-full items-center justify-center"
          {...motionProps}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader />
            </div>
          )}
          <video
            ref={videoRef}
            className="h-dvh w-auto object-contain"
            controls
            autoPlay={playAction}
            loop
            muted
            playsInline
            preload="metadata"
            aria-label={`Video ${index + 1}`}
          >
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="flex h-full items-center justify-center"
        {...motionProps}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader />
          </div>
        )}
        <HLSVideoPlayer
          streamUrl={url}
          autoPlay={playAction}
          modalOpen={true}
          allOthers={{
            id: `video_player_full_${index}`,
            muted: false,
          }}
          className="h-dvh w-auto max-w-3xl object-contain transition-all duration-200"
        />
      </motion.div>
    );
  }
);
VideoPreview.displayName = "VideoPreview";

// Image Preview Component for better separation of concerns
const ImagePreview = memo(
  ({ url, alt, index, onLoad, onError }: ImagePreviewProps) => {
    const [isLoading, setIsLoading] = useState(true);

    const handleImageLoad = useCallback(() => {
      setIsLoading(false);
      onLoad();
    }, [onLoad]);

    const handleImageError = useCallback(() => {
      setIsLoading(false);
      onError();
      console.error(`Image failed to load at index ${index}:`, url);
    }, [onError, index, url]);

    return (
      <motion.div
        className="relative flex h-full items-center justify-center"
        initial={{ opacity: 0.3, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: ANIMATION_DURATION / 1000 }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader />
          </div>
        )}
        <Image
          src={url.trimEnd()}
          width={2000}
          height={2000}
          quality={90} // Reduced from 100 for better performance
          className="h-dvh w-auto object-contain transition-opacity duration-300"
          alt={alt || `Media preview ${index + 1}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onDragStart={(e) => e.preventDefault()}
          sizes="100vw"
          priority
        />
      </motion.div>
    );
  }
);
ImagePreview.displayName = "ImagePreview";

// Navigation Button Component with improved accessibility
const NavigationButton = memo<NavigationButtonProps>(
  ({ direction, className, ariaLabel, onClick }) => (
    <button
      className={`${className} absolute z-10 -translate-y-1/2 rounded-full bg-black/50 backdrop-blur-sm p-3 text-white opacity-0 transition-all duration-200 hover:bg-black/70 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50 md:opacity-60 cursor-pointer active:scale-95`}
      aria-label={ariaLabel}
      onClick={onClick}
      type="button"
    >
      {direction === "prev" ? (
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      ) : (
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      )}
    </button>
  )
);
NavigationButton.displayName = "NavigationButton";

// Main Component with improved performance and accessibility
const PostComponentPreview = memo(() => {
  const { ref: objectRef, otherUrl, open, close } = usePostComponent();
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [currentSlide, setCurrentSlide] = useState(0);
  const swiperRef = useRef<SwiperClass | null>(null);

  // Memoized handlers for better performance
  const handleClose = useCallback(() => {
    close();
  }, [close]);

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  }, []);

  const handleImageError = useCallback((index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperClass) => {
    setCurrentSlide(swiper.realIndex);
  }, []);

  const handlePrevSlide = useCallback(() => {
    swiperRef.current?.slidePrev();
  }, []);

  const handleNextSlide = useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "Escape":
          handleClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrevSlide();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNextSlide();
          break;
        case " ":
          e.preventDefault();
          handleNextSlide();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose, handlePrevSlide, handleNextSlide]);

  // Scroll to specific slide when objectRef changes
  useEffect(() => {
    if (swiperRef.current && objectRef !== undefined) {
      swiperRef.current.slideTo(objectRef, 0, false);
      setCurrentSlide(objectRef);
    }
  }, [objectRef]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px"; // Prevent layout shift
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  // Memoized swiper configuration
  const swiperModules = useMemo(() => [Navigation, Keyboard, A11y], []);

  const swiperProps = useMemo(
    () => ({
      ...SWIPER_CONFIG,
      modules: swiperModules,
      onSwiper: (swiper: SwiperClass) => {
        swiperRef.current = swiper;
      },
      onSlideChange: handleSlideChange,
      keyboard: {
        enabled: true,
        onlyInViewport: false,
      },
      a11y: {
        prevSlideMessage: "Previous slide",
        nextSlideMessage: "Next slide",
        slideLabelMessage: "Slide {{index}} of {{slidesLength}}",
      },
    }),
    [swiperModules, handleSlideChange]
  );

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] h-dvh w-full select-none bg-black"
        role="dialog"
        aria-modal="true"
        aria-label="Media preview"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-black/50 backdrop-blur-sm p-2 text-white transition-all duration-200 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer active:scale-95"
          aria-label="Close preview"
          type="button"
        >
          <X className="h-6 w-6 md:h-8 md:w-8" />
        </button>

        {/* Media Counter */}
        {otherUrl.length > 1 && (
          <div className="absolute left-4 top-4 z-50 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-sm text-white">
            {currentSlide + 1} / {otherUrl.length}
          </div>
        )}

        {/* Swiper Slider */}
        <Swiper {...swiperProps} className="h-dvh">
          {otherUrl.map((item: MediaItem, index: number) => (
            <SwiperSlide
              key={`${item.url}-${index}`} // More stable key
              className="flex h-full items-center justify-center"
              onDoubleClick={handleClose}
            >
              {item.type === "video" ? (
                <VideoPreview
                  url={item.url}
                  isBlob={item.isBlob || false}
                  playAction={currentSlide === index}
                  index={index}
                />
              ) : (
                <ImagePreview
                  url={item.url}
                  alt={item.alt || `Media preview ${index + 1}`}
                  index={index}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageError(index)}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons */}
        {otherUrl.length > 1 && (
          <>
            <NavigationButton
              direction="prev"
              className="left-4 top-1/2"
              ariaLabel="Previous slide"
              onClick={handlePrevSlide}
            />
            <NavigationButton
              direction="next"
              className="right-4 top-1/2"
              ariaLabel="Next slide"
              onClick={handleNextSlide}
            />
          </>
        )}

        {/* Progress Indicator */}
        {otherUrl.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-50 lg:flex hidden -translate-x-1/2 space-x-2">
            {otherUrl.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-8 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? "bg-white"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                onClick={() => swiperRef.current?.slideTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

PostComponentPreview.displayName = "PostComponentPreview";
export default PostComponentPreview;
