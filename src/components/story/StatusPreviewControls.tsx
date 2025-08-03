import { StoryPreviewControlProps } from "@/types/Components";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

const StoryPreviewControlls = ({
  moveToNextSlide,
  type,
  moveToPrevSlide,
  clickToPlay,
  playVideoOnLoad,
  index,
  stories,
}: StoryPreviewControlProps) => {
  const { ref, inView } = useInView({
    threshold: 1,
    rootMargin: "0px 0px 0px 0px",
  });

  useEffect(() => {
    if (inView && type === "video") {
      playVideoOnLoad(true);
    }

    return () => {
      if (type === "video") {
        playVideoOnLoad(false);
      }
    };
  }, [inView, type, playVideoOnLoad]);

  return (
    <div className="flex absolute min-h-dvh w-full z-[600] inset-0">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${stories.length}, 1fr)`,
        }}
        className="absolute top-0 left-0 z-10 items-center w-full justify-evenly gap-1"
      >
        {stories.map((story, i) => (
          <ProgressBar
            key={i}
            slideIndex={i}
            mainIndex={index}
            moveToNextSlide={moveToNextSlide}
            duration={story.duration} // Pass the duration to ProgressBar
          />
        ))}
      </div>
      <div
        onClick={moveToPrevSlide}
        className="h-full w-full flex-[2] cursor-pointer text-transparent"
      >
        L
      </div>
      <div
        onClick={clickToPlay}
        ref={ref}
        className="h-full w-full flex-[3] cursor-pointer text-transparent"
      >
        C
      </div>
      <div
        onClick={moveToNextSlide}
        className="h-full w-full flex-[2] cursor-pointer text-transparent"
      >
        R
      </div>
    </div>
  );
};

const ProgressBar = ({
  slideIndex,
  mainIndex,
  duration,
  moveToNextSlide,
}: {
  slideIndex: number;
  mainIndex: number;
  duration: number;
  moveToNextSlide: () => void;
}) => {
  const [percent, setPercent] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hasMovedToNextSlide = useRef(false);
  const animationFrameRef = useRef<number>(null);

  // Intersection Observer effect
  useEffect(() => {
    const progressRef = progressBarRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 1, rootMargin: "0px 0px 0px 0px" }
    );

    if (progressRef) {
      observer.observe(progressRef);
    }

    return () => {
      if (progressRef) {
        observer.unobserve(progressRef);
      }
      observer.disconnect();
    };
  }, []);

  // Progress update effect
  useEffect(() => {
    const cleanupAnimation = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    if (mainIndex >= slideIndex) {
      // Reset state when slide changes
      setPercent(mainIndex === slideIndex ? 0 : 100);
      hasMovedToNextSlide.current = false;
      cleanupAnimation();

      if (mainIndex === slideIndex && isIntersecting) {
        const updateInterval = 50;
        const totalIntervals = duration / updateInterval;
        const increment = 50 / totalIntervals;
        let lastTime = performance.now();

        const updateProgress = () => {
          const currentTime = performance.now();
          if (currentTime - lastTime >= updateInterval) {
            setPercent((prevPercent) => {
              const newPercent = prevPercent + increment;

              if (newPercent >= 100) {
                cleanupAnimation();
                // Use requestAnimationFrame for the slide transition
                if (!hasMovedToNextSlide.current) {
                  hasMovedToNextSlide.current = true;
                  requestAnimationFrame(() => {
                    moveToNextSlide();
                  });
                }
                return 100;
              }

              lastTime = currentTime;
              return newPercent;
            });
          }

          animationFrameRef.current = requestAnimationFrame(updateProgress);
        };

        // Start the animation
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    }

    return cleanupAnimation;
  }, [slideIndex, mainIndex, isIntersecting, duration, moveToNextSlide]);

  return (
    <div
      ref={progressBarRef}
      style={{ gridColumn: `${slideIndex + 1} / ${slideIndex + 2}` }}
      className="relative h-1 bg-gray-400 rounded-lg"
    >
      <div
        style={{ width: `${percent}%` }}
        className="absolute top-0 left-0 h-full bg-white transition-all"
      ></div>
    </div>
  );
};

export default StoryPreviewControlls;
