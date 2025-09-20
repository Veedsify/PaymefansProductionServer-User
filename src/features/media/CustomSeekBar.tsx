import type React from "react";
import { type MouseEvent, useRef, useState } from "react";

interface SeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isBuffering?: boolean;
}

const CustomSeekBar: React.FC<SeekBarProps> = ({
  currentTime,
  duration,
  onSeek,
  isBuffering = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const calculateSeekTime = (clientX: number) => {
    if (!progressRef.current || duration === 0) return;

    const rect = progressRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newTime = (offsetX / rect.width) * duration;
    onSeek(newTime);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    calculateSeekTime(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      calculateSeekTime(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    calculateSeekTime(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.preventDefault();
      calculateSeekTime(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return;

    const rect = progressRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newTime = (offsetX / rect.width) * duration;

    onSeek(newTime);
  };

  // Calculate percentage for progress
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={progressRef}
      className="relative w-full h-6 flex items-center cursor-pointer touch-none group"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={handleSeek}
      aria-label="Seek bar"
      tabIndex={0}
      role="slider"
      aria-valuenow={currentTime}
      aria-valuemin={0}
      aria-valuemax={duration}
    >
      {/* Track background */}
      <div className="absolute w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
        {/* Progress Fill */}
        <div
          className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 ${
            isBuffering ? "opacity-70 animate-pulse" : "opacity-100"
          }`}
          style={{
            width: `${progressPercentage}%`,
            transition: isDragging
              ? "none"
              : "width 0.18s cubic-bezier(0.4,0,0.2,1)",
          }}
        ></div>
      </div>

      {/* Seek Handle */}
      <div
        className={`absolute w-4 h-4 bg-white rounded-full shadow-lg border-2 border-indigo-500 transition-all duration-200
          ${isDragging ? "scale-125" : "scale-100"}
          ${isBuffering ? "animate-pulse" : ""}
          group-hover:scale-110`}
        style={{
          left: `${progressPercentage}%`,
          transform: "translate(-50%, -50%)",
          top: "50%",
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
          transition: isDragging
            ? "none"
            : "left 0.18s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1)",
        }}
      ></div>
    </div>
  );
};

export default CustomSeekBar;
