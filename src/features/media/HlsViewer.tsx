"use client";
import Hls from "hls.js";
import {
  LucidePause,
  LucidePlay,
  LucideVolume2,
  LucideVolumeOff,
} from "lucide-react";
import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useInView } from "react-intersection-observer";

interface VideoPlayerProps {
  streamUrl: string;
  muted?: boolean;
  className: string;
  isOpen?: boolean;
  showControls?: boolean;
}

const HlsViewer = memo(
  ({
    streamUrl,
    className,
    muted = true,
    isOpen = false,
    showControls = false,
  }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const mp4Ref = useRef<HTMLVideoElement>(null);
    const isMp4 = streamUrl.endsWith(".mp4");
    const { ref, inView } = useInView({
      triggerOnce: false,
      threshold: 0.5, // Only trigger when 50% of video is visible
    });

    // State management
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(muted); // Default to muted

    // Get the current video element
    const getCurrentVideo = useCallback(() => {
      return isMp4 ? mp4Ref.current : videoRef.current;
    }, [isMp4]);

    // Auto-play/pause logic based on visibility and isOpen
    useEffect(() => {
      const video = getCurrentVideo();
      if (!video) return;

      // Only auto-play if the modal/viewer is open and video is in view
      if (isOpen && inView) {
        video.play().catch((error) => {
          console.error("Error attempting to auto-play:", error);
        });
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }, [inView, isOpen, getCurrentVideo]);

    // Mute logic based on isOpen prop
    useEffect(() => {
      const video = getCurrentVideo();
      if (!video) return;

      // If viewer is closed, always mute. If open, respect user's mute preference
      const shouldBeMuted = !isOpen || isMuted;
      video.muted = shouldBeMuted;
    }, [isOpen, isMuted, getCurrentVideo]);

    // HLS setup for non-MP4 streams
    useLayoutEffect(() => {
      if (isMp4) return;

      const video = videoRef.current;
      if (!video) return;

      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error("HLS fatal error:", data);
          }
        });

        return () => {
          hls.destroy();
          hlsRef.current = null;
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      }
    }, [streamUrl, isMp4]);

    // Manual play/pause toggle
    const togglePlayPause = useCallback(() => {
      const video = getCurrentVideo();
      if (!video) return;

      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        video.play().catch((error) => {
          console.error("Error attempting to play:", error);
        });
        setIsPlaying(true);
      }
    }, [isPlaying, getCurrentVideo]);

    // Manual mute toggle
    const toggleMute = useCallback(() => {
      const video = getCurrentVideo();
      if (!video) return;

      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      video.muted = newMutedState;
    }, [isMuted, getCurrentVideo]);

    // Video event handlers
    const handleVideoPlay = useCallback(() => {
      setIsPlaying(true);
    }, []);

    const handleVideoPause = useCallback(() => {
      setIsPlaying(false);
    }, []);

    return (
      <div ref={ref} className={`${className} relative`}>
        {isMp4 ? (
          <video
            ref={mp4Ref}
            controlsList="nodownload noremoteplayback nofullscreen"
            className={className}
            autoPlay={isOpen && inView}
            muted={!isOpen || isMuted}
            loop
            playsInline
            preload="metadata"
            style={{ background: "#000000" }}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
          >
            <source src={streamUrl} type="video/mp4" />
          </video>
        ) : (
          <video
            ref={videoRef}
            controlsList="nodownload noremoteplayback nofullscreen nopip noplaybackrate"
            className={className}
            muted={!isOpen || isMuted}
            loop
            autoPlay={isOpen && inView}
            playsInline
            preload="metadata"
            style={{ background: "#000000" }}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
          />
        )}

        {/* Play/Pause Button - Only show when isOpen or on hover */}
        {showControls && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <button
              onClick={togglePlayPause}
              className="bg-black bg-opacity-50 text-white p-4 rounded-full cursor-pointer hover:bg-opacity-70 transition-all duration-200"
              aria-label={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <LucidePause size={32} /> : <LucidePlay size={32} />}
            </button>
          </div>
        )}

        {/* Mute Button - Only show when isOpen */}
        {showControls && (
          <div className="absolute bottom-4 left-4">
            <button
              onClick={toggleMute}
              className="bg-black bg-opacity-50 text-white p-2 rounded-full cursor-pointer hover:bg-opacity-70 transition-all duration-200"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              {isMuted ? (
                <LucideVolumeOff size={18} />
              ) : (
                <LucideVolume2 size={18} />
              )}
            </button>
          </div>
        )}
      </div>
    );
  },
);

HlsViewer.displayName = "HlsViewer";

export default HlsViewer;
