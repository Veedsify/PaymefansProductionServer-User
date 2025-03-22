"use client";
import Hls from "hls.js";
import {
  LucideMaximize,
  LucidePause,
  LucidePlay,
  LucideSettings,
} from "lucide-react";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

const VideoPlayer = ({
  streamUrl,
  autoPlay = false,
  className,
  modalOpen = false,
  allOthers,
}: {
  streamUrl: string;
  autoPlay?: boolean;
  modalOpen?: boolean;
  allOthers?: React.VideoHTMLAttributes<HTMLVideoElement>;
  className: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null); // Store HLS instance
  const { ref: intersectionRef, inView } = useInView({ threshold: 0.5 });

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [qualityLevels, setQualityLevels] = useState<
    { index: number; label: string }[]
  >([]);
  const [showResolutionMenu, setShowResolutionMenu] = useState(false);
  const [manualPlayPause, setManualPlayPause] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<number | "auto">(
    "auto"
  );

  const GetResoultion = (height: number) => {
    if (height >= 2160) return "4K";
    if (height >= 1440) return "2K";
    if (height >= 1080) return "1080p";
    if (height >= 720) return "720p";
    if (height >= 480) return "480p";
    if (height >= 360) return "360p";
    return "Auto";
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hlsRef.current = hls; // Store the HLS instance

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels
          .filter((level) => level.height !== undefined) // Remove undefined heights
          .sort((a, b) => (b.height || 0) - (a.height || 0)) // Sort safely
          .map((level, index) => ({
            index: hls.levels.length - 1 - index, // Flip the index
            label: GetResoultion(level.height),
            height: level.height,
          }));
        const quality = localStorage.getItem("selectedQuality");
        setSelectedQuality(quality ? parseInt(quality) : levels[0].index);
        setQualityLevels([...levels, { index: -1, label: "Auto" }]);
      });

      hls.on(Hls.Events.ERROR, (event, data) =>
        console.log("HLS Error:", data)
      );

      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    }
  }, [streamUrl]);

  // **Fix: Autoplay logic should not conflict with manual play/pause**
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (inView && autoPlay && !isPlaying && !manualPlayPause) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Playback error:", err));
    } else if (!inView && isPlaying) {
      video.pause();
      setIsPlaying(false);
      setManualPlayPause(false); //reset the manual override when out of view.
    }
  }, [inView, autoPlay, isPlaying, manualPlayPause]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && !video.paused) {
      video.pause();
      setIsPlaying(false);
    } else {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Playback error:", err));
    }
    setManualPlayPause(true);
  }, [videoRef, isPlaying]);

  // Seek bar updates
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  // Change seek position
  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (newTime < 0 || newTime > duration) return;
    setCurrentTime(newTime);
    // Update video current time
    if (video.paused) {
      video.play();
    }
    // Set the new time
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    }
    // Set the new Time
    video.currentTime = newTime;
  };

  // Change quality
  const changeQuality = (level: number) => {
    if (hlsRef.current) {
      localStorage.setItem("selectedQuality", level.toString());
      hlsRef.current.currentLevel = level;
      setSelectedQuality(level);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  return (
    <div className="relative max-w-[600px] mx-auto bg-black rounded-lg overflow-hidden shadow-xl">
      <div
        ref={intersectionRef}
        className="relative group"
        onClick={(e) => {
          // Close resolution menu when clicking elsewhere
          if (showResolutionMenu) {
            setShowResolutionMenu(false);
            e.stopPropagation();
          }
        }}
      >
        <video
          ref={videoRef}
          {...allOthers}
          className={`w-full h-full object-cover ${className}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          muted
        ></video>
        {modalOpen && (
          <>
            {/* Overlay gradient for better control visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Controls overlay at the bottom */}
            <div className="absolute left-0 right-0 bottom-16 px-4 py-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Play/Pause button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="bg-black/60 hover:bg-black/80 p-2.5 rounded-full transition-all duration-200 transform hover:scale-105 aspect-square flex items-center justify-center"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <LucidePause className="w-5 h-5 text-white" />
                ) : (
                  <LucidePlay className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>

              {/* Right-side controls */}
              <div className="flex items-center gap-2">
                {/* Resolution toggle button */}
                <button
                  onClick={(e) => {
                    setShowResolutionMenu(!showResolutionMenu);
                    e.stopPropagation();
                  }}
                  className="bg-black/60 hover:bg-black/80 p-2 rounded-full transition-all duration-200 flex items-center justify-center"
                  aria-label="Video quality"
                >
                  <LucideSettings className="w-4 h-4 text-white" />
                </button>

                {/* Fullscreen button */}
                <button
                  onClick={toggleFullscreen}
                  className="bg-black/60 hover:bg-black/80 p-2 rounded-full transition-all duration-200 flex items-center justify-center"
                  aria-label="Toggle fullscreen"
                >
                  <LucideMaximize className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Resolution menu popup */}
            {showResolutionMenu && (
              <div className="absolute right-12 bottom-16 bg-gray-900 border border-gray-700 rounded-md py-2 px-1 shadow-lg z-10">
                <div className="text-xs font-medium text-gray-300 px-2 pb-1 mb-1 border-b border-gray-700">
                  Resolution
                </div>
                {qualityLevels.map(({ index, label }) => (
                  <button
                    key={index}
                    onClick={() => {
                      changeQuality(index);
                      setShowResolutionMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded hover:bg-gray-800 transition-colors ${
                      selectedQuality === index ? "text-blue-400" : "text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls Panel - Time and seek bar */}
      {modalOpen && (
        <div className="absolute flex flex-col gap-3 px-5 py-4 bg-gray-950/25 bottom-0 w-full text-white">
          {/* Seek Bar with custom styling */}
          <CustomSeekBar
            currentTime={currentTime}
            duration={duration}
            onSeek={(newTime) => handleSeek(newTime)}
          />

          {/* Time display */}
          <div className="flex text-xs font-medium text-gray-300">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Time formatter
const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
};

// Custom
interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const CustomSeekBar: React.FC<SeekBarProps> = ({
  currentTime,
  duration,
  onSeek,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return;

    const rect = progressRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newTime = (offsetX / rect.width) * duration;

    onSeek(newTime);
  };

  return (
    <div
      ref={progressRef}
      className="relative w-full h-1 bg-gray-700 rounded-full cursor-pointer"
      onMouseDown={() => setIsDragging(true)}
      onClick={handleSeek}
      onMouseMove={(e) => isDragging && handleSeek(e)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Progress Fill */}
      <div
        className="absolute top-0 left-0 h-full bg-white rounded-full"
        style={{ width: `${(currentTime / duration) * 100}%` }}
      ></div>

      {/* Seek Handle */}
      <div
        className="absolute h-4 w-4 bg-blue-500 rounded-full transform -translate-y-1/2"
        style={{
          left: `${(currentTime / duration) * 100}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      ></div>
    </div>
  );
};

export default VideoPlayer;
