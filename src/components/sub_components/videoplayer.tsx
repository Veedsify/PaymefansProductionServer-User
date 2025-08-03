"use client";
import Hls from "hls.js";
import {
  LucideMaximize,
  LucidePause,
  LucidePlay,
  LucideSettings,
  LucideLoader,
  LucideLoaderCircle,
} from "lucide-react";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import CustomSeekBar from "./CustomSeekBar";

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

  // New states for loading and buffering
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

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

    setIsLoading(true);

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

        // Set loading to false once manifest is parsed
        setIsLoading(false);
      });

      // Handle HLS errors
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.log("HLS Error:", data);
        // Could add additional error handling here
      });

      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;

      // For native HLS playback, we need to handle loading states differently
      video.addEventListener("loadeddata", () => {
        setIsLoading(false);
      });
    }
  }, [streamUrl]);

  // Handle buffering events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
    };

    // Initial load events
    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleLoadedData = () => {
      setIsLoading(false);
    };

    // Add event listeners
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("loadeddata", handleLoadedData);

    // Cleanup event listeners
    return () => {
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("loadeddata", handleLoadedData);
    };
  }, []);

  // Autoplay logic should not conflict with manual play/pause
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
      localStorage.setItem("selectedQuality", String(level));
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

  const shouldLoop = Boolean(inView) && Boolean(autoPlay);
  // const shouldMute = Boolean(autoPlay) && !manualPlayPause && !inView;

  return (
    <div className="w-full overflow-hidden bg-black">
      <div
        ref={intersectionRef}
        className="relative group"
        onClick={(e) => {
          if (showResolutionMenu) {
            setShowResolutionMenu(false);
            e.stopPropagation();
          }
        }}
      >
        <video
          {...allOthers}
          ref={videoRef}
          loop={shouldLoop}
          className={`w-full ${className} transition-all duration-300`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          style={{ background: "#000000" }}
        ></video>

        {/* Loading Spinner Overlay - shown during initial loading */}
        {isLoading && modalOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center">
              <LucideLoader className="w-10 h-10 text-pink-400 animate-spin" />
              <p className="mt-3 text-sm font-medium text-white">
                Loading video...
              </p>
            </div>
          </div>
        )}

        {/* Buffering Indicator - shown during playback buffering */}
        {!isLoading && isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="p-3 rounded-full bg-black/50">
              <LucideLoaderCircle className="w-8 h-8 text-gray-200 animate-spin" />
            </div>
          </div>
        )}

        {modalOpen && (
          <>
            {/* Overlay gradient for better control visibility */}
            <div className="absolute inset-0 opacity-100 pointer-events-none transition-opacity duration-300 lg:opacity-0 lg:bg-gradient-to-t lg:from-black/80 lg:via-black/30 lg:to-transparent lg:group-hover:opacity-100"></div>

            {/* Controls overlay at the bottom */}
            <div className="absolute left-0 right-0 z-20 flex items-center justify-between px-6 py-4 opacity-100 transition-opacity duration-300 lg:opacity-0  bottom-20 lg:group-hover:opacity-100">
              {/* Play/Pause button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="flex items-center justify-center p-3 rounded-full shadow-lg transition-all duration-200 transform outline outline-gray-700 bg-black/70 hover:bg-black/90 hover:scale-110 aspect-square"
                aria-label={isPlaying ? "Pause" : "Play"}
                disabled={isLoading}
              >
                {isPlaying ? (
                  <LucidePause className="w-6 h-6 text-white" />
                ) : (
                  <LucidePlay className="w-6 h-6 text-white ml-0.5" />
                )}
              </button>

              {/* Right-side controls */}
              <div className="flex items-center gap-3">
                {/* Resolution toggle button */}
                <button
                  onClick={(e) => {
                    setShowResolutionMenu(!showResolutionMenu);
                    e.stopPropagation();
                  }}
                  className="bg-black hover:bg-black/90 p-2.5 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center border border-gray-700"
                  aria-label="Video quality"
                  disabled={isLoading}
                >
                  <LucideSettings className="w-5 h-5 text-white" />
                </button>

                {/* Fullscreen button */}
                <button
                  onClick={toggleFullscreen}
                  className="bg-black/70 hover:bg-black/90 p-2.5 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center border border-gray-700"
                  aria-label="Toggle fullscreen"
                  disabled={isLoading}
                >
                  <LucideMaximize className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Resolution menu popup */}
            {showResolutionMenu && (
              <div className="absolute right-16 bottom-28 bg-black border border-gray-700 rounded-lg py-2 px-2 shadow-2xl z-30 min-w-[120px] animate-fade-in">
                <div className="px-2 pb-1 mb-1 text-xs font-semibold tracking-wide text-gray-300 border-b border-gray-700">
                  Resolution
                </div>
                {qualityLevels.map(({ index, label }) => (
                  <button
                    key={index}
                    onClick={() => {
                      changeQuality(index);
                      setShowResolutionMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-800/80 transition-colors ${selectedQuality === index
                      ? "text-blue-400 bg-gray-800/60"
                      : "text-white"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        {/* Controls Panel - Time and seek bar */}
        {modalOpen && !isLoading && (
          <div className="absolute bottom-0 left-0 z-10 flex flex-col w-full px-6 py-3 text-white gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            {/* Seek Bar with custom styling */}
            <CustomSeekBar
              currentTime={currentTime}
              duration={duration}
              onSeek={(newTime) => handleSeek(newTime)}
              isBuffering={isBuffering}
            />

            {/* Time display */}
            <div className="flex justify-end text-xs font-semibold tracking-wide text-gray-200">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1 opacity-70">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Time formatter
const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
};

export default VideoPlayer;
