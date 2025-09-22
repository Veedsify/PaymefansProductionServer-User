import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useStoryPause } from "@/contexts/StoryPauseContext";
import type { StoryPreviewControlProps } from "@/types/Components";

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
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${stories.length}, 1fr)`,
        }}
        className="absolute top-0 left-0 items-center w-full justify-evenly gap-1"
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
      <div className="absolute top-1/2 w-full flex gap-2 items-center justify-between pointer-events-auto ">
        <motion.div
          onClick={moveToPrevSlide}
          className="h-[80px] w-full flex-[2] cursor-pointer text-transparent bg-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, times: [0, 0.7, 1], delay: 0 }}
        >
          L
        </motion.div>
        <motion.div
          onClick={clickToPlay}
          ref={ref}
          className="h-[80px] w-full flex-[3] cursor-pointer text-transparent bg-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, times: [0, 0.7, 1], delay: 0.2 }}
        >
          C
        </motion.div>
        <motion.div
          onClick={moveToNextSlide}
          className="h-[80px] w-full flex-[2] cursor-pointer text-transparent bg-white/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, times: [0, 0.5, 1], delay: 0.4 }}
        >
          R
        </motion.div>
      </div>
    </>
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
  const { isPaused } = useStoryPause();

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
        const updateInterval = 100;
        const totalIntervals = duration / updateInterval;
        const increment = 100 / totalIntervals;
        let lastTime = performance.now();

        const updateProgress = () => {
          if (isPaused) {
            // If paused, just schedule next frame without updating
            animationFrameRef.current = requestAnimationFrame(updateProgress);
            return;
          }

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
  }, [
    slideIndex,
    mainIndex,
    isIntersecting,
    duration,
    moveToNextSlide,
    isPaused,
  ]);

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
