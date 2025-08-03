"use client";

import React, {
  useEffect,
  useRef,
  useState,
  memo,
  useCallback,
  useMemo,
  useReducer,
} from "react";
import Image from "next/image";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard, A11y } from "swiper/modules";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "swiper/css/bundle";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import usePostComponent from "@/contexts/PostComponentPreview";
import Loader from "../lib_components/LoadingAnimation";
import HLSVideoPlayer from "../sub_components/videoplayer";
import { ImagePreview } from "./ImagePreviewWithCanvas";

// Centralized constants
export const CONSTANTS = {
  ANIMATION_DURATION: 100,
  ANIMATION_DURATION_SEC: 100 / 1000,
  IMAGE_DIMENSIONS: { width: 1500, height: 1500 },
  SWIPER_CONFIG: {
    spaceBetween: 0,
    slidesPerView: 1,
    touchRatio: 1.5,
    speed: 200,
    threshold: 15,
    longSwipesRatio: 0.5,
    watchSlidesProgress: true,
  },
  PRELOAD_RANGE: 2,
  IMAGE_QUALITY: {
    HIGH: 90,
    MEDIUM: 75,
    LOW: 50,
  },
};

// Types
interface MediaItem {
  url: string;
  isBlob?: boolean;
  type: "image" | "video";
  alt?: string;
  thumbnailUrl?: string;
}

interface NavigationButtonProps {
  direction: "prev" | "next";
  className: string;
  ariaLabel: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface VideoPreviewProps {
  url: string;
  isBlob: boolean;
  playAction: boolean;
  index: number;
}

interface ImagePreviewProps {
  url: string;
  alt: string;
  index: number;
  onLoad: () => void;
  onError: () => void;
}

// Media loading state reducer
type MediaState = { loaded: Set<number>; errors: Set<number> };
type MediaAction =
  | { type: "LOAD_SUCCESS"; index: number }
  | { type: "LOAD_ERROR"; index: number }
  | { type: "RESET" };

const mediaReducer = (state: MediaState, action: MediaAction): MediaState => {
  switch (action.type) {
    case "LOAD_SUCCESS":
      return { ...state, loaded: new Set([...state.loaded, action.index]) };
    case "LOAD_ERROR":
      return {
        ...state,
        errors: new Set([...state.errors, action.index]),
        loaded: new Set([...state.loaded, action.index]),
      };
    case "RESET":
      return { loaded: new Set(), errors: new Set() };
    default:
      return state;
  }
};

// Error boundary
class MediaErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center space-y-4">
              <div className="text-6xl">⚠️</div>
              <p className="text-lg">Media unavailable</p>
              <p className="text-sm text-gray-400">Failed to render media</p>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

// Preload media utility
const preloadMedia = (url: string, type: "image" | "video") => {
  if (type === "image") {
    const img = new window.Image();
    img.src = url;
  } else {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
  }
};

// Video Preview
const VideoPreview = memo(
  ({ url, isBlob, playAction, index }: VideoPreviewProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">(
      "loading",
    );

    const handleVideoLoad = useCallback(() => {
      setTimeout(() => setStatus("ready"), 100);
    }, []);

    const handleVideoError = useCallback(() => {
      setStatus("error");
      console.warn(`Video failed to load at index ${index}`);
    }, [index]);

    const handleVideoEnded = useCallback(() => {
      const video = videoRef.current;
      if (video && status === "ready") {
        video.currentTime = 0;
        video
          .play()
          .catch((e) =>
            console.warn(`Video ended but could not replay: ${e.message}`),
          );
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
            setStatus("error");
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
    }, [handleVideoEnded, handleVideoLoad, handleVideoError, url, isBlob]);

    if (status === "error") {
      return (
        <motion.div
          className="flex items-center justify-center h-full text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center space-y-4">
            <div className="text-6xl">🎥</div>
            <p className="text-lg">Video unavailable</p>
            <p className="text-sm text-gray-400">
              This video could not be loaded
            </p>
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
          duration: CONSTANTS.ANIMATION_DURATION_SEC,
          type: "spring",
        }}
      >
        {isBlob ? (
          <video
            ref={videoRef}
            className="object-contain w-auto h-dvh"
            controls
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
            allOthers={{ id: `video_player_full_${index}`, muted: false }}
            className="object-contain w-auto max-w-3xl h-dvh transition-all duration-200"
          />
        )}
      </motion.div>
    );
  },
);
VideoPreview.displayName = "VideoPreview";

// // Image Preview
// const ImagePreview = memo(
//   ({ url, alt, index, onLoad, onError }: ImagePreviewProps) => {
//     const [status, setStatus] = useState<"loading" | "ready" | "error">(
//       "loading"
//     );
//     const isSlowNetwork =
//       typeof navigator !== "undefined" &&
//       (navigator as any).connection?.saveData;

//     const handleImageLoad = useCallback(() => {
//       setTimeout(() => {
//         setStatus("ready");
//         onLoad();
//       }, 100);
//     }, [onLoad]);

//     const handleImageError = useCallback(() => {
//       setStatus("error");
//       onError();
//       console.warn(`Image failed to load at index ${index}: ${url}`);
//     }, [onError, index, url]);

//     const imageQuality = useMemo(
//       () =>
//         isSlowNetwork
//           ? CONSTANTS.IMAGE_QUALITY.LOW
//           : index < 3
//           ? CONSTANTS.IMAGE_QUALITY.HIGH
//           : CONSTANTS.IMAGE_QUALITY.MEDIUM,
//       [index, isSlowNetwork]
//     );

//     const sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw";

//     return (
//       <motion.div
//         className="relative flex items-center justify-center h-full"
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         transition={{
//           duration: CONSTANTS.ANIMATION_DURATION_SEC,
//           type: "spring",
//         }}
//       >
//         <AnimatePresence>
//           {status === "loading" && (
//             <motion.div
//               className="absolute inset-0 z-10 flex items-center justify-center bg-black/20"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0, transition: { duration: 0.2 } }}
//             >
//               <Loader />
//             </motion.div>
//           )}
//         </AnimatePresence>
//         <Image
//           src={url.trim()}
//           width={CONSTANTS.IMAGE_DIMENSIONS.width}
//           height={CONSTANTS.IMAGE_DIMENSIONS.height}
//           quality={imageQuality}
//           className={`h-dvh w-auto object-contain transition-opacity duration-200 ${
//             status === "loading" ? "opacity-0" : "opacity-100"
//           }`}
//           alt={alt}
//           onLoad={handleImageLoad}
//           onError={handleImageError}
//           onDragStart={(e) => e.preventDefault()}
//           sizes={sizes}
//           priority={index < 2}
//           unoptimized={url.startsWith("blob:")}
//           loading={index < 2 ? "eager" : "lazy"}
//         />
//       </motion.div>
//     );
//   }
// );
// ImagePreview.displayName = "ImagePreview";

// Navigation Button
const NavigationButton = memo(
  ({
    direction,
    className,
    ariaLabel,
    onClick,
    disabled,
  }: NavigationButtonProps) => (
    <motion.button
      className={`${className} absolute z-10 -translate-y-1/2 rounded-full bg-black/70 backdrop-blur-sm p-3 text-white transition-colors duration-200 hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-white/50 ${
        disabled ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
      }`}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      type="button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {direction === "prev" ? (
        <ChevronLeft className="w-5 h-5 md:h-6 md:w-6" />
      ) : (
        <ChevronRight className="w-5 h-5 md:h-6 md:w-6" />
      )}
    </motion.button>
  ),
);
NavigationButton.displayName = "NavigationButton";

// Main Component
const PostComponentPreview = memo(() => {
  const {
    ref: objectRef,
    otherUrl,
    open,
    close,
    username,
    watermarkEnabled,
  } = usePostComponent();
  const swiperRef = useRef<SwiperClass | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mediaState, dispatchMedia] = useReducer(mediaReducer, {
    loaded: new Set<number>(),
    errors: new Set<number>(),
  });
  const shouldReduceMotion = useReducedMotion();

  // Validate media items
  const validateMediaItem = useCallback(
    (item: any, index: number): MediaItem => {
      if (!item?.url || typeof item.url !== "string") {
        console.warn(`Invalid media item at index ${index}`, item);
        return {
          url: "/fallback-image.jpg",
          type: "image",
          alt: `Media preview ${index + 1}`,
        };
      }
      return {
        ...item,
        type: ["image", "video"].includes(item.type) ? item.type : "image",
        alt: item.alt || `Media preview ${index + 1}`,
      };
    },
    [],
  );

  const mediaItems = useMemo(() => {
    if (!Array.isArray(otherUrl)) return [];
    return otherUrl.map((item, index) => validateMediaItem(item, index));
  }, [otherUrl, validateMediaItem]);

  const { totalSlides, isFirstSlide, isLastSlide } = useMemo(
    () => ({
      totalSlides: mediaItems.length,
      isFirstSlide: currentSlide === 0,
      isLastSlide: currentSlide === mediaItems.length - 1,
    }),
    [mediaItems.length, currentSlide],
  );

  const shouldLoadSlide = useCallback(
    (index: number) =>
      Math.abs(index - currentSlide) <= CONSTANTS.PRELOAD_RANGE,
    [currentSlide],
  );

  // Preload media
  useEffect(() => {
    mediaItems.forEach((item, index) => {
      if (shouldLoadSlide(index) && !mediaState.loaded.has(index)) {
        preloadMedia(item.url, item.type);
      }
    });
  }, [currentSlide, mediaItems, mediaState.loaded, shouldLoadSlide]);

  // Handlers
  const handleClose = useCallback(() => {
    close();
    setCurrentSlide(0);
    dispatchMedia({ type: "RESET" });
    setTimeout(() => {
      if (swiperRef.current) swiperRef.current.slideTo(0, 0, false);
    }, CONSTANTS.ANIMATION_DURATION);
  }, [close]);

  const handleImageLoad = useCallback((index: number) => {
    dispatchMedia({ type: "LOAD_SUCCESS", index });
  }, []);

  const handleImageError = useCallback((index: number) => {
    dispatchMedia({ type: "LOAD_ERROR", index });
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperClass) => {
    setCurrentSlide(swiper.activeIndex);
  }, []);

  const handlePrevSlide = useCallback(() => {
    if (!isFirstSlide && swiperRef.current) swiperRef.current.slidePrev();
  }, [isFirstSlide]);

  const handleNextSlide = useCallback(() => {
    if (!isLastSlide && swiperRef.current) swiperRef.current.slideNext();
  }, [isLastSlide]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          handleClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrevSlide();
          break;
        case "ArrowRight":
        case " ":
          e.preventDefault();
          handleNextSlide();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose, handlePrevSlide, handleNextSlide]);

  // Initialize slide position
  useEffect(() => {
    if (swiperRef.current && typeof objectRef === "number" && open) {
      const targetSlide = Math.max(0, Math.min(objectRef, totalSlides - 1));
      swiperRef.current.slideTo(targetSlide, 0, false);
      setCurrentSlide(targetSlide);
    }
  }, [objectRef, totalSlides, open]);

  // Control body scroll
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!mediaItems.length) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-labelledby="media-preview-title"
          className="fixed inset-0 z-[9999] flex h-full w-full items-center justify-center bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : CONSTANTS.ANIMATION_DURATION_SEC,
            type: "spring",
          }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="sr-only" id="media-preview-title">
            Media Preview Modal
          </div>
          <button
            className="absolute z-20 p-2 text-white bg-black rounded-full top-4 right-4 hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
            onClick={handleClose}
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
          {totalSlides > 1 && (
            <div
              aria-live="polite"
              className="absolute z-20 px-3 py-1 text-sm text-white rounded-full top-4 left-1/2 -translate-x-1/2 bg-black/60"
            >
              {currentSlide + 1} / {totalSlides}
            </div>
          )}
          <Swiper
            {...CONSTANTS.SWIPER_CONFIG}
            modules={[Navigation, Pagination, Keyboard, A11y]}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            onSlideChange={handleSlideChange}
            className="relative w-full h-full"
            keyboard={{ enabled: true }}
            a11y={{
              prevSlideMessage: "Previous slide",
              nextSlideMessage: "Next slide",
            }}
          >
            {mediaItems.map((item, index) => (
              <SwiperSlide
                key={`media-${index}-${item.url.slice(-20)}`}
                className="flex items-center justify-center"
              >
                <MediaErrorBoundary>
                  {shouldLoadSlide(index) &&
                    (item.type === "image" ? (
                      <ImagePreview
                        url={item.url}
                        username={username}
                        alt={item.alt || `Media preview ${index + 1}`}
                        index={index}
                        onLoad={() => handleImageLoad(index)}
                        onError={() => handleImageError(index)}
                        shouldWatermark={watermarkEnabled}
                      />
                    ) : (
                      <VideoPreview
                        url={item.url}
                        isBlob={!!item.isBlob}
                        playAction={currentSlide === index}
                        index={index}
                      />
                    ))}
                </MediaErrorBoundary>
              </SwiperSlide>
            ))}
          </Swiper>
          {totalSlides > 1 && (
            <>
              <NavigationButton
                direction="prev"
                className="left-2 top-1/2"
                ariaLabel="Previous slide"
                onClick={handlePrevSlide}
                disabled={isFirstSlide}
              />
              <NavigationButton
                direction="next"
                className="right-2 top-1/2"
                ariaLabel="Next slide"
                onClick={handleNextSlide}
                disabled={isLastSlide}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
PostComponentPreview.displayName = "PostComponentPreview";

export default PostComponentPreview;
