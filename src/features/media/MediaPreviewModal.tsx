"use client";

import { X } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { A11y, Keyboard, Navigation, Pagination } from "swiper/modules";
import { Swiper, type SwiperClass, SwiperSlide } from "swiper/react";
import "swiper/css/bundle";
import { motion, useReducedMotion } from "framer-motion";
import { ImagePreview } from "@/features/post/ImagePreviewWithCanvas";
import MediaErrorBoundary from "../../providers/MediaErrorBoundary";
import NavigationButton from "../navigation/NavigationButton";
import {
  MEDIA_CONSTANTS,
  type MediaItem,
  mediaReducer,
  preloadMedia,
  type UserProfile,
} from "./mediaPreviewTypes";
import VideoPreview from "./VideoPreview";

interface MediaPreviewModalProps {
  open: boolean;
  onClose: () => void;
  mediaItems: any[];
  initialIndex?: number;
  username?: string;
  userProfile?: UserProfile | null;
  watermarkEnabled?: boolean;
}

const MediaPreviewModal = memo(
  ({
    open,
    onClose,
    mediaItems: rawMediaItems,
    initialIndex = 0,
    username,
    userProfile,
    watermarkEnabled = false,
  }: MediaPreviewModalProps) => {
    const swiperRef = useRef<SwiperClass | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [mediaState, dispatchMedia] = useReducer(mediaReducer, {
      loaded: new Set<number>(),
      errors: new Set<number>(),
    });
    const shouldReduceMotion = useReducedMotion();
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

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
      []
    );

    const mediaItems = useMemo(() => {
      if (!Array.isArray(rawMediaItems)) return [];
      return rawMediaItems.map((item, index) => validateMediaItem(item, index));
    }, [rawMediaItems, validateMediaItem]);

    const { totalSlides, isFirstSlide, isLastSlide } = useMemo(
      () => ({
        totalSlides: mediaItems.length,
        isFirstSlide: currentSlide === 0,
        isLastSlide: currentSlide === mediaItems.length - 1,
      }),
      [mediaItems.length, currentSlide]
    );

    const shouldLoadSlide = useCallback(
      (index: number) => {
        if (!initialLoadComplete) {
          // Load current slide and adjacent slides on initial load
          return Math.abs(index - currentSlide) <= 1;
        }
        // After initial load, use wider preload range
        return Math.abs(index - currentSlide) <= MEDIA_CONSTANTS.PRELOAD_RANGE;
      },
      [currentSlide, initialLoadComplete]
    );

    // Preload media with priority
    useEffect(() => {
      if (!open || !mediaItems.length) return;

      // Preload current slide first
      const currentItem = mediaItems[currentSlide];
      if (currentItem && !mediaState.loaded.has(currentSlide)) {
        preloadMedia(currentItem.url, currentItem.type);
      }

      // Then preload adjacent slides
      mediaItems.forEach((item, index) => {
        if (
          shouldLoadSlide(index) &&
          !mediaState.loaded.has(index) &&
          index !== currentSlide
        ) {
          preloadMedia(item.url, item.type);
        }
      });

      // Mark initial load as complete after first render
      if (!initialLoadComplete && mediaItems.length > 0) {
        setTimeout(() => setInitialLoadComplete(true), 500);
      }
    }, [
      currentSlide,
      mediaItems,
      mediaState.loaded,
      shouldLoadSlide,
      open,
      initialLoadComplete,
    ]);

    // Handlers
    const handleClose = useCallback(() => {
      onClose();
      setCurrentSlide(0);
      dispatchMedia({ type: "RESET" });
      setInitialLoadComplete(false);
      setTimeout(() => {
        if (swiperRef.current) swiperRef.current.slideTo(0, 0, false);
      }, MEDIA_CONSTANTS.ANIMATION_DURATION);
    }, [onClose]);

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
      if (swiperRef.current && typeof initialIndex === "number" && open) {
        const targetSlide = Math.max(
          0,
          Math.min(initialIndex, totalSlides - 1)
        );
        swiperRef.current.slideTo(targetSlide, 0, false);
        setCurrentSlide(targetSlide);
      }
    }, [initialIndex, totalSlides, open]);

    // Control body scroll
    useEffect(() => {
      if (open) {
        const originalOverflow = document.body.style.overflow;
        const originalPosition = document.body.style.position;
        const originalTop = document.body.style.top;

        // Prevent body scroll while maintaining scroll position
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollTop}px`;

        return () => {
          document.body.style.overflow = originalOverflow;
          document.body.style.position = originalPosition;
          document.body.style.top = originalTop;
          window.scrollTo(0, parseInt(document.body.style.top || "0") * -1);
        };
      }
    }, [open]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        dispatchMedia({ type: "RESET" });
      };
    }, []);

    if (!mediaItems.length) return null;

    if (!open) return null;
    return (
      <motion.div
        role="dialog"
        aria-labelledby="media-preview-title"
        aria-modal="true"
        className="fixed inset-0 z-[9999] flex h-screen items-center justify-center bg-black"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className="sr-only" id="media-preview-title">
          Media Preview Modal
        </div>

        {/* Close button */}
        <button
          className="absolute z-20 p-2 text-white bg-black/60 hover:bg-black/80 rounded-full top-3 right-3 md:top-4 md:right-4 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors backdrop-blur-sm"
          onClick={handleClose}
          aria-label="Close preview"
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Slide counter */}
        {totalSlides > 1 && (
          <div
            aria-live="polite"
            className="absolute z-20 px-3 py-1 text-xs md:text-sm text-white rounded-full top-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm"
          >
            {currentSlide + 1} / {totalSlides}
          </div>
        )}

        <Swiper
          {...MEDIA_CONSTANTS.SWIPER_CONFIG}
          modules={[Navigation, Pagination, Keyboard, A11y]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={handleSlideChange}
          className="select-none bg-black w-full h-full"
          keyboard={{ enabled: true }}
          a11y={{
            prevSlideMessage: "Previous slide",
            nextSlideMessage: "Next slide",
            firstSlideMessage: "This is the first slide",
            lastSlideMessage: "This is the last slide",
          }}
        >
          {mediaItems.map((item, index) => (
            <SwiperSlide
              key={`media-${index}-${item.url.slice(-20)}`}
              className="relative h-screenbg-black"
              aria-label={`Slide ${index + 1} of ${totalSlides}`}
            >
              <MediaErrorBoundary>
                {shouldLoadSlide(index) ? (
                  item.type === "image" ? (
                    <ImagePreview
                      url={item.url}
                      username={username}
                      alt={item.alt || `Media preview ${index + 1}`}
                      index={index}
                      className="object-contain max-h-screen"
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index)}
                      userProfile={userProfile}
                      shouldWatermark={watermarkEnabled}
                    />
                  ) : (
                    <VideoPreview
                      url={item.url}
                      isBlob={!!item.isBlob}
                      playAction={currentSlide === index}
                      index={index}
                      userProfile={userProfile}
                    />
                  )
                ) : (
                  // Placeholder for unloaded slides
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </MediaErrorBoundary>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation buttons */}
        {totalSlides > 1 && (
          <>
            <NavigationButton
              direction="prev"
              className="left-2 md:left-4 top-1/2"
              ariaLabel="Previous slide"
              onClick={handlePrevSlide}
              disabled={isFirstSlide}
            />
            <NavigationButton
              direction="next"
              className="right-2 md:right-4 top-1/2"
              ariaLabel="Next slide"
              onClick={handleNextSlide}
              disabled={isLastSlide}
            />
          </>
        )}
      </motion.div>
    );
  }
);

MediaPreviewModal.displayName = "MediaPreviewModal";

export default MediaPreviewModal;
