"use client";
import usePostComponent from "@/contexts/post-component-preview";
import '@vidstack/react/player/styles/base.css';
import {
  Captions, Controls, MediaPlayer, MediaProvider, MuteButton, PlayButton,
  TimeSlider, VolumeSlider, useMediaState
} from '@vidstack/react';
import { PlayIcon } from '@vidstack/react/icons';
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Loader from "../lib_components/loading-animation";
import { LucideShare2, Play, X } from "lucide-react";
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Pagination } from 'swiper/modules';
import 'swiper/css/bundle';
import { InView, useInView } from "react-intersection-observer";

const PostComponentPreview = () => {
  const { ref: objectRef, otherUrl, type, open, close, withOptions } = usePostComponent();
  const [loaded, setLoaded] = useState<boolean>(false);
  const swiperRef = useRef<SwiperClass | null>(null);

  // Scroll to the specific slide when objectRef changes
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(objectRef, 0, false);
    }
  }, [objectRef]);

  // Lock the scroll when the component is open
  useLayoutEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  // Toggle loaded state on image load
  const handleLoaded = () => setLoaded(true);

  return (
    <>
      {open && (
        <div
          className={`fixed inset-0 w-full min-h-screen z-[999] smooth-opacity select-none ${open ? "active" : ""}`}>
          <button
            onClick={close}
            className="absolute top-4 right-4 p-2 bg-white rounded-full text-black shadow-md z-50"
          >
            <X size={40} />
          </button>

          {/* {withOptions && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute flex items-center gap-3 z-50 bottom-0 md:w-2/3 w-full left-1/2 -translate-x-1/2 p-4 bg-white bg-opacity-15 backdrop-blur-lg"
            >
              <button className="p-2 px-4 text-sm font-bold bg-white rounded-md text-black shadow-md">
                Download
              </button>
              <button className="p-2 px-4 text-sm font-bold bg-white rounded-md text-black shadow-md">
                <LucideShare2 size={20} />
              </button>
            </div>
          )} */}

          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            className=""
            loop={true}
            modules={[Navigation, Thumbs, Pagination]}
            navigation
            onSwiper={(swiper) => (swiperRef.current = swiper)}
          >
            {otherUrl.map((item, index) => (
              <SwiperSlide
                key={index}
                className="flex items-center justify-center h-screen"
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={close}
              >
                {item.type === "video" ? (
                  <VideoPreview url={item.url} playAction={
                    swiperRef.current?.realIndex === index && item.type === "video"
                  } />
                ) : (
                  <>
                    {!loaded && (
                      <div className="add-loaders opacity-70">
                        <Loader />
                      </div>
                    )}
                    <Image
                      onLoad={handleLoaded}
                      width={2000}
                      height={2000}
                      quality={100}
                      draggable={false}
                      src={item.url}
                      className={`h-screen object-contain mx-auto w-auto transition-all duration-200 border-none animate-in z-10`}
                      alt="Media Preview"
                    />
                  </>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </>
  );
};


const VideoPreview = ({ url, playAction }: { url: string, playAction: boolean }) => {
  const [showPlay, setShowPlay] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && !videoRef.current.paused) {
      setShowPlay(false)
    } else if (videoRef.current?.ended) {
      setShowPlay(true)
    } else {
      setShowPlay(true)
    }
  }, []);

  const handleClickFunction = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setShowPlay(false);
      } else {
        videoRef.current.pause();
        setShowPlay(true);
      }
    }
  };

  return (
    <div className="relative">
      <div
        onClick={handleClickFunction}
        className={`absolute bg-black bg-opacity-20 inset-0 w-full h-full flex items-center justify-center z-50
        ${showPlay ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} transition-all duration-200 cursor-pointer
        `}>
        <Play
          className="text-white cursor-pointer"
          size={30}
        />
      </div>
      <video
        controls
        title="Video Preview"
        ref={videoRef}
        className="h-screen object-contain mx-auto w-auto transition-all duration-200 border-none animate-in scale-100 fullscreen-video"
      >
        <source src={url} />
      </video>
    </div>
  );
}



export default PostComponentPreview;