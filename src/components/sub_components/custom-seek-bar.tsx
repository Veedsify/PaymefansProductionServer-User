import React, { useState, useRef, MouseEvent } from "react";

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
      e.preventDefault(); // Prevent scrolling
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

  return (
    <div
      ref={progressRef}
      className="relative w-full h-1.5 bg-gray-700 rounded-full cursor-pointer touch-none group"
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
      {/* Progress Fill */}
      <div
        className={`absolute top-0 left-0 h-full transition-all duration-200 rounded-full bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 ${
          isBuffering ? "opacity-60 animate-pulse" : "opacity-100"
        }`}
        style={{
          width: `${duration ? (currentTime / duration) * 100 : 0}%`,
          transition: "width 0.18s cubic-bezier(0.4,0,0.2,1)",
        }}
      ></div>

      {/* Seek Handle */}
      <div
        className={`absolute w-3 h-3 bg-white border-2 border-gray-300 shadow-md rounded-full transition-transform duration-200
        ${isDragging ? "scale-125" : "scale-100"}
        ${isBuffering ? "animate-pulse" : ""}
        group-hover:scale-110`}
        style={{
          left: `${duration ? (currentTime / duration) * 100 : 0}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2,
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
          transition:
            "left 0.18s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1)",
        }}
      ></div>

      {/* Time marker (dot) */}
      <div
        className="absolute w-1.5 h-1.5 bg-gray-400 rounded-full"
        style={{
          left: `${duration ? (currentTime / duration) * 100 : 0}%`,
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1,
          opacity: 0.7,
          transition: "left 0.18s cubic-bezier(0.4,0,0.2,1)",
        }}
      ></div>
    </div>
  );
};

export default CustomSeekBar;
