"use client";

import { X } from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
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
import { useSwipeGesture } from "@/hooks/useSwipeGesture";
import { usePinchZoom } from "@/hooks/usePinchZoom";

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
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [currentSlide, setCurrentSlide] = useState(initialIndex);
    const [mediaState, dispatchMedia] = useReducer(mediaReducer, {
      loaded: new Set<number>(),
      errors: new Set<number>(),
    });
    const shouldReduceMotion = useReducedMotion();
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [slideTransition, setSlideTransition] = useState(true);

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

    // Pinch zoom for images
    const {
      transform,
      handlers: zoomHandlers,
      resetZoom,
      isZoomed,
    } = usePinchZoom({
      minZoom: 1,
      maxZoom: 4,
      enabled: open && mediaItems[currentSlide]?.type === "image",
    });

    // Navigate to next/prev slide
    const goToSlide = useCallback(
      (index: number) => {
        if (index >= 0 && index < mediaItems.length) {
          setSlideTransition(true);
          setCurrentSlide(index);
          resetZoom();
        }
      },
      [mediaItems.length, resetZoom]
    );

    const handlePrevSlide = useCallback(() => {
      if (!isFirstSlide && !isZoomed) {
        goToSlide(currentSlide - 1);
      }
    }, [isFirstSlide, isZoomed, goToSlide, currentSlide]);

    const handleNextSlide = useCallback(() => {
      if (!isLastSlide && !isZoomed) {
        goToSlide(currentSlide + 1);
      }
    }, [isLastSlide, isZoomed, goToSlide, currentSlide]);

    // Swipe gesture for navigation
    const swipeGesture = useSwipeGesture({
      onSwipeLeft: handleNextSlide,
      onSwipeRight: handlePrevSlide,
      threshold: 50,
      enabled: open && !isZoomed,
    });

    // Handlers
    const handleClose = useCallback(() => {
      onClose();
      setCurrentSlide(0);
      dispatchMedia({ type: "RESET" });
      setInitialLoadComplete(false);
      resetZoom();
    }, [onClose, resetZoom]);

    const handleImageLoad = useCallback((index: number) => {
      dispatchMedia({ type: "LOAD_SUCCESS", index });
    }, []);

    const handleImageError = useCallback((index: number) => {
      dispatchMedia({ type: "LOAD_ERROR", index });
    }, []);

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
      if (typeof initialIndex === "number" && open) {
        const targetSlide = Math.max(
          0,
          Math.min(initialIndex, totalSlides - 1)
        );
        setSlideTransition(false);
        setCurrentSlide(targetSlide);
        setTimeout(() => setSlideTransition(true), 100);
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
        className="fixed inset-0 z-[9999] flex h-dvh items-center justify-center bg-black"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className="sr-only" id="media-preview-title">
          Media Preview Modal
        </div>

        {/* Close button */}
        <button
          className="absolute z-50 p-2 text-white bg-black/30 hover:bg-black/80 rounded-full top-2 right-2 md:top-4 md:right-4"
          onClick={handleClose}
          aria-label="Close preview"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
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

        {/* Custom Slider Container */}
        <div
          ref={containerRef}
          className="relative w-full h-full overflow-hidden bg-black"
          {...swipeGesture}
        >
          <div
            className="flex h-full"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
              transition: slideTransition ? "transform 0.3s ease-out" : "none",
            }}
          >
            {mediaItems.map((item, index) => (
              <div
                key={`media-${index}-${item.url.slice(-20)}`}
                className="relative min-w-full h-full flex items-center justify-center"
                aria-label={`Slide ${index + 1} of ${totalSlides}`}
                style={{
                  transform:
                    isZoomed && index === currentSlide
                      ? `scale(${transform.scale}) translate(${transform.posX}px, ${transform.posY}px)`
                      : "none",
                  transition: isZoomed ? "none" : "transform 0.3s ease-out",
                }}
                {...(item.type === "image" ? zoomHandlers : {})}
              >
                <MediaErrorBoundary>
                  {shouldLoadSlide(index) ? (
                    item.type === "image" ? (
                      <ImagePreview
                        url={item.url}
                        username={username}
                        alt={item.alt || `Media preview ${index + 1}`}
                        index={index}
                        className="object-contain max-h-dvh"
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
              </div>
            ))}
          </div>
        </div>

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
