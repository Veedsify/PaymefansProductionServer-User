import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useStoryStore } from "@/contexts/StoryContext";

interface CustomSwiperProps {
  children: React.ReactNode[];
  onSlideChange?: (index: number) => void;
  initialSlide?: number;
}

export const CustomSwiper = ({
  children,
  onSlideChange,
  initialSlide = 0,
}: CustomSwiperProps) => {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const swiperRef = useRef<HTMLDivElement>(null);
  const { setEditingSlide } = useStoryStore();
  const totalSlides = children.length;
  const minSwipeDistance = 50;

  const slideChange = useCallback(
    (newIndex: number) => {
      setEditingSlide(newIndex);
    },
    [setEditingSlide]
  );

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides || isTransitioning) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      onSlideChange?.(index);
      slideChange(index);
      setTimeout(() => setIsTransitioning(false), 300);
    },
    [totalSlides, isTransitioning, onSlideChange, slideChange]
  );

  const nextSlide = useCallback(
    () => goToSlide(currentSlide + 1),
    [goToSlide, currentSlide]
  );

  const prevSlide = useCallback(
    () => goToSlide(currentSlide - 1),
    [goToSlide, currentSlide]
  );

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, nextSlide, prevSlide]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black shadow-2xl rounded-xl">
      {/* Slides Container */}
      <div
        ref={swiperRef}
        className="flex h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children.map((child, index) => (
          <div key={index} className="h-full min-w-full relative">
            {child}
          </div>
        ))}
      </div>
      {totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="absolute z-50 p-3 text-white border rounded-full left-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/50 transition-all duration-200 border-white/10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="absolute z-50 p-3 text-white border rounded-full right-4 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/50 transition-all duration-200 border-white/10"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
      {totalSlides > 1 && (
        <div className="absolute z-50 flex bottom-6 left-1/2 -translate-x-1/2 gap-2">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
      <div className="absolute z-50 px-3 py-1 text-sm font-medium text-white border rounded-full bottom-6 right-6 bg-black/30 backdrop-blur-sm border-white/10">
        {currentSlide + 1} / {totalSlides}
      </div>
    </div>
  );
};
