"use client";
import Hls from "hls.js";
import {
  LucideLoader,
  LucideLoaderCircle,
  LucideMaximize,
  LucidePause,
  LucidePlay,
  LucideSettings,
  LucideVolume2,
  LucideVolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import UserProfileOverlay from "@/features/post/UserProfileOverlay";
import CustomSeekBar from "./CustomSeekBar";

interface UserProfile {
  name: string;
  username: string;
  avatar?: string;
}

interface VideoPlayerProps {
  streamUrl: string;
  autoPlay?: boolean;
  className: string;
  modalOpen?: boolean;
  allOthers?: React.VideoHTMLAttributes<HTMLVideoElement>;
  userProfile?: UserProfile | null; // New prop for user profile
}

const VideoPlayer = ({
  streamUrl,
  autoPlay = false,
  className,
  modalOpen = false,
  allOthers,
  userProfile,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const { ref: intersectionRef, inView } = useInView({ threshold: 0.5 });
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // New states for loading and buffering
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);

  const GetResolution = (height: number) => {
    if (height >= 2160) return "4K";
    if (height >= 1440) return "2K";
    if (height >= 1080) return "1080p";
    if (height >= 720) return "720p";
    if (height >= 480) return "480p";
    if (height >= 360) return "360p";
    return "Auto";
  };

  // Reset controls visibility timer
  const resetControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    setControlsVisible(true);

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setControlsVisible(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Handle mouse move to show controls
  const handleMouseMove = useCallback(() => {
    resetControlsTimer();
  }, [resetControlsTimer]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels
          .filter((level) => level.height !== undefined)
          .sort((a, b) => (b.height || 0) - (a.height || 0))
          .map((level, index) => ({
            index: hls.levels.length - 1 - index,
            label: GetResolution(level.height),
            height: level.height,
          }));

        const quality = localStorage.getItem("selectedQuality");
        setSelectedQuality(
          quality ? parseInt(quality) : levels[0]?.index ?? -1
        );
        setQualityLevels([...levels, { index: -1, label: "Auto" }]);

        setIsLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.log("HLS Error:", data);
      });

      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;

      video.addEventListener("loadeddata", () => {
        setIsLoading(false);
      });
    }
  }, [streamUrl]);

  // Handle buffering events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => setIsLoading(false);

    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("loadeddata", handleLoadedData);

    return () => {
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("loadeddata", handleLoadedData);
    };
  }, []);

  // Autoplay logic
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
      setManualPlayPause(false);
    }
  }, [inView, autoPlay, isPlaying, manualPlayPause]);

  // Volume control
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

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
    resetControlsTimer();
  }, [isPlaying, resetControlsTimer]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (newTime < 0 || newTime > duration) return;
    setCurrentTime(newTime);
    video.currentTime = newTime;
  };

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

  return (
    <div className="w-full flex items-center overflow-hidden bg-black h-full flex ">
      <div
        ref={intersectionRef}
        className="relative group h-full flex items-center justify-center w-full"
        onClick={(e) => {
          if (showResolutionMenu) {
            setShowResolutionMenu(false);
            e.stopPropagation();
          }
        }}
        onMouseMove={handleMouseMove}
      >
        <video
          {...allOthers}
          ref={videoRef}
          loop={shouldLoop}
          className={`${className} object-center`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          style={{ background: "#000000" }}
        ></video>

        {/* Loading Spinner Overlay */}
        {isLoading && modalOpen && (
          <div className="absolute inset-0 flex items-center justify-center min-w-sm bg-black/50">
            <div className="p-3 rounded-full bg-black/50">
              <LucideLoaderCircle className="w-8 h-8 text-gray-200 animate-spin" />
            </div>
          </div>
        )}

        {/* Buffering Indicator */}
        {!isLoading && isBuffering && modalOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="p-3 rounded-full bg-black/50">
              <LucideLoaderCircle className="w-8 h-8 text-gray-200 animate-spin" />
            </div>
          </div>
        )}

        {/* Play Button Overlay (when not playing) */}
        {/* {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="p-4 bg-black/50 rounded-full hover:bg-black/70 transition-all"
              aria-label="Play"
            >
              <LucidePlay className="w-12 h-12 text-white ml-1" />
            </button>
          </div>
        )} */}

        <div className="max-w-3xl">
          {modalOpen && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity min-w-sm  duration-300">
                {/* Overlay gradient for better control visibility */}
                <div
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
                        controlsVisible
                            ? "lg:bg-gradient-to-t lg:from-black/80 lg:via-black/30 lg:to-transparent"
                            : ""
                    }`}
                ></div>

                {/* User Profile Card - Top Left */}
                {userProfile && (
                    <div
                        className="absolute bottom-48 md:bottom-48 left-4 z-20 flex items-center gap-3 p-2 rounded-full">
                      <UserProfileOverlay userProfile={userProfile}/>
                    </div>
                )}

                {/* Controls overlay */}
                <div
                    className={`absolute left-0 right-0 z-20 flex items-center justify-between px-6 py-4 transition-opacity duration-300 ${
                        controlsVisible ? "opacity-100" : "opacity-0"
                    } bottom-28`}
                >
                  {/* Play/Pause button */}
                  <div className="flex items-center gap-2">
                    {/* Volume Control */}
                    <div className="relative flex items-center">
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMute();
                          }}
                          className="p-3 rounded-full outline-gray-700 bg-black/70 hover:bg-black/90"
                          aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted || volume === 0 ? (
                            <LucideVolumeX className="w-5 h-5 text-white"/>
                        ) : (
                            <LucideVolume2 className="w-5 h-5 text-white"/>
                        )}
                      </button>

                      <div
                          className="ml-2 w-0 overflow-hidden transition-all duration-300"
                          onMouseEnter={() => setShowVolumeSlider(true)}
                          onMouseLeave={() => setShowVolumeSlider(false)}
                      >
                        <CustomSeekBar
                            currentTime={isMuted ? 0 : volume * 100}
                            duration={100}
                            onSeek={(newTime) => handleVolumeChange(newTime / 100)}
                            isBuffering={false}
                        />
                      </div>
                    </div>
                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay();
                        }}
                        className="flex items-center justify-center p-3 rounded-full shadow-lg transform outline outline-gray-700 bg-black/70 hover:bg-black/90 hover:scale-110 aspect-square"
                        aria-label={isPlaying ? "Pause" : "Play"}
                        disabled={isLoading}
                    >
                      {isPlaying ? (
                          <LucidePause className="w-5 h-5 text-white"/>
                      ) : (
                          <LucidePlay className="w-5 h-5 text-white ml-0.5"/>
                      )}
                    </button>
                  </div>

                  {/* Right-side controls */}
                  <div className="flex items-center gap-3">
                    {/* Resolution toggle button */}
                    <button
                        onClick={(e) => {
                          setShowResolutionMenu(!showResolutionMenu);
                          e.stopPropagation();
                        }}
                        className="bg-black hover:bg-black/90 p-3 rounded-full shadow-lg flex items-center justify-center border border-gray-700"
                        aria-label="Video quality"
                        disabled={isLoading}
                    >
                      <LucideSettings className="w-5 h-5 text-white"/>
                    </button>

                    {/* Fullscreen button */}
                    <button
                        onClick={toggleFullscreen}
                        className="bg-black/70 hover:bg-black/90 p-3 rounded-full shadow-lg flex items-center justify-center border border-gray-700"
                        aria-label="Toggle fullscreen"
                        disabled={isLoading}
                    >
                      <LucideMaximize className="w-5 h-5 text-white"/>
                    </button>
                  </div>
                </div>

                {/* Resolution menu popup */}
                {showResolutionMenu && (
                    <div
                        className="absolute right-16 bottom-28 bg-black border border-gray-700 rounded-lg py-2 px-2 shadow-2xl z-30 min-w-[120px] animate-fade-in">
                      <div
                          className="px-2 pb-1 mb-1 text-xs font-semibold tracking-wide text-gray-300 border-b border-gray-700">
                        Resolution
                      </div>
                      {qualityLevels.map(({index, label}) => (
                          <button
                              key={index}
                              onClick={() => {
                                changeQuality(index);
                                setShowResolutionMenu(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-800/80 transition-colors ${
                                  selectedQuality === index
                                      ? "text-purple-400 bg-gray-800/60"
                                      : "text-white"
                              }`}
                          >
                            {label}
                          </button>
                      ))}
                    </div>
                )}
              </div>
          )}

          {/* Controls Panel - Time and seek bar */}
          {modalOpen && !isLoading && (
              <div
                  className={`absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex  ${
                      controlsVisible ? "opacity-100" : "opacity-0"
                  } bottom-10 left-0 z-10 flex flex-col w-full px-6 py-3 text-white gap-2`}
              >
                {/* Seek Bar */}
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
