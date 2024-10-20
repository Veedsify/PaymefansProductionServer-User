import { StoryPreviewProps } from "@/types/components";
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Pagination } from 'swiper/modules';
import 'swiper/css/bundle';
import Image from "next/image";
import StoryPreviewControlls from "./story-preview-controls";
import { useEffect, useRef } from "react";


const StoryPreviewComponent = ({ className, width, height, onAllStoriesEnd, stories }: StoryPreviewProps) => {
    const swiperRef = useRef<SwiperClass | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const moveToNextSlide = () => {
        if (swiperRef.current) {
            if (swiperRef.current?.isEnd) {
                onAllStoriesEnd()
                // swiperRef.current.slideTo(0, 0, false)
            } else {
                swiperRef.current.slideNext(0, false)
            }
        }
    }
    const moveToPrevSlide = () => {
        if (swiperRef.current) {
            swiperRef.current.slidePrev(0, false)
        }
    }
    const PlayVideo = (isVideo: boolean) => {
        if (videoRef.current && isVideo) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    // Automatic playback started!
                    // Show playing UI.
                })
                    .catch(error => {
                        // Auto-play was prevented
                        // Show paused UI.
                    });
            }
        }
    }

    const PlayIfVideo = (canPlay: boolean) => {
        if (canPlay) PlayVideo(true)
    }

    useEffect(() => {

    }, []);

    return (
        <div
            style={{
                width,
                height
            }}
            className={`${className}`}
        >
            <Swiper
                spaceBetween={0}
                slidesPerView={1}
                className="h-full bg-black"
                onSwiper={(swiper) => (swiperRef.current = swiper)}
            >
                {stories.map((story, index) => (
                    <SwiperSlide key={index}>
                        <div className="flex items-center justify-center flex-col h-full relative">
                            <StoryPreviewControlls
                                type={story.type}
                                moveToNextSlide={moveToNextSlide}
                                playVideoOnLoad={PlayIfVideo}
                                clickToPlay={() => PlayVideo(story.type === "video")}
                                stories={stories}
                                index={index}
                                moveToPrevSlide={moveToPrevSlide}
                            />
                            {story.type === "image" && (
                                <Image src={story.url} alt={story?.caption ? story.caption : ""} width="1000"
                                    height="10000"
                                    className="object-contain w-full h-full"
                                />
                            )}
                            {story.type === "video" && (
                                <video
                                    ref={videoRef}
                                    playsInline={true}
                                    autoPlay={true}
                                    loop={true}
                                    preload={'video'}
                                    className="w-full object-contain h-full"
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
}

export default StoryPreviewComponent;