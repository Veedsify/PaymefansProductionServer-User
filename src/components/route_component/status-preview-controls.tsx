import { StoryPreviewControlProps } from "@/types/components";
import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

const StoryPreviewControlls = ({
    moveToNextSlide,
    type,
    moveToPrevSlide,
    clickToPlay,
    playVideoOnLoad,
    index,
    stories
}: StoryPreviewControlProps) => {
    const { ref, inView } = useInView({
        threshold: 1,
        rootMargin: '0px 0px 0px 0px'
    });

    useEffect(() => {
        if (inView && type === 'video') {
            playVideoOnLoad(true);
        }
    }, [inView, type, playVideoOnLoad]);

    return (
        <div className="flex absolute min-h-screen w-full z-50 inset-0">
            <div
                style={{ display: 'grid', gridTemplateColumns: `repeat(${stories.length}, 1fr)` }}
                className="z-10 absolute top-1 left-0 w-full items-center justify-evenly gap-1"
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
}

export const ProgressBar = ({ slideIndex, mainIndex, duration, moveToNextSlide }: { slideIndex: number; mainIndex: number, duration: number, moveToNextSlide: () => void }) => {
    const [percent, setPercent] = useState(0);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const hasMovedToNextSlide = useRef(false); // To ensure moveToNextSlide is called only once

    useEffect(() => {
        const progressRef = progressBarRef.current;
        const observer = new IntersectionObserver(
            ([entry]) => setIsIntersecting(entry.isIntersecting),
            { threshold: 1, rootMargin: '0px 0px 0px 0px' }
        );

        if (progressRef) {
            observer.observe(progressRef);
        }

        return () => {
            if (progressRef) {
                observer.unobserve(progressRef);
            }
        };
    }, []);

    useEffect(() => {
        if (mainIndex >= slideIndex) {
            setPercent(mainIndex === slideIndex ? 0 : 100);
            hasMovedToNextSlide.current = false; // Reset the flag when slide changes

            if (mainIndex === slideIndex && isIntersecting) {
                const updateInterval = 50; // Update every 100ms
                const totalIntervals = duration / updateInterval;
                const increment = 50 / totalIntervals;

                intervalRef.current = setInterval(() => {
                    setPercent(prevPercent => {
                        if (prevPercent >= 100) {
                            if (intervalRef.current) clearInterval(intervalRef.current);
                            if (!hasMovedToNextSlide.current) {
                                moveToNextSlide(); // Trigger next slide
                                hasMovedToNextSlide.current = true; // Set flag to true
                            }
                            return 100;
                        }
                        return prevPercent + increment;
                    });
                }, updateInterval);
            }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [slideIndex, mainIndex, isIntersecting, duration, moveToNextSlide]);

    return (
        <div
            ref={progressBarRef}
            style={{ gridColumn: `${slideIndex + 1} / ${slideIndex + 2}` }}
            className={`h-1 rounded-lg bg-gray-400 relative`}
        >
            <div
                style={{ width: `${percent}%` }}
                className="absolute transition-all top-0 left-0 h-full bg-white"
            ></div>
        </div>
    );
};

export default StoryPreviewControlls;
