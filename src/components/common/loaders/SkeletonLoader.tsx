import React from "react";

interface SkeletonLoaderProps {
  variant?: "text" | "rectangular" | "circular" | "rounded";
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export function SkeletonLoader({
  variant = "rectangular",
  width = "100%",
  height = "1rem",
  className = "",
  count = 1,
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-gray-300 dark:bg-gray-700";

  const variantClasses = {
    text: "rounded",
    rectangular: "rounded",
    circular: "rounded-full",
    rounded: "rounded-lg",
  };

  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  if (count === 1) {
    return (
      <div
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        style={style}
      />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${variantClasses[variant]} ${className}`}
          style={style}
        />
      ))}
    </div>
  );
}

export default SkeletonLoader;
