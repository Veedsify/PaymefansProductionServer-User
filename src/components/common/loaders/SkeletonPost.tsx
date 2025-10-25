import React from "react";

interface SkeletonPostProps {
  showMedia?: boolean;
  className?: string;
}

export function SkeletonPost({
  showMedia = true,
  className = "",
}: SkeletonPostProps) {
  return (
    <div className={`animate-pulse border-b pb-4 mb-4 ${className}`}>
      {/* Header with avatar and name */}
      <div className="flex items-center mb-3">
        <div className="h-12 w-12 bg-gray-300 rounded-full dark:bg-gray-700" />
        <div className="ml-3 flex-1">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2 dark:bg-gray-700" />
          <div className="h-3 bg-gray-200 rounded w-1/6 dark:bg-gray-600" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-16 dark:bg-gray-600" />
      </div>

      {/* Content lines */}
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-gray-200 rounded w-full dark:bg-gray-600" />
        <div className="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-600" />
        <div className="h-4 bg-gray-200 rounded w-1/2 dark:bg-gray-600" />
      </div>

      {/* Media placeholder */}
      {showMedia && (
        <div className="h-64 bg-gray-300 rounded mt-3 dark:bg-gray-700" />
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex space-x-4">
          <div className="h-8 w-16 bg-gray-200 rounded dark:bg-gray-600" />
          <div className="h-8 w-16 bg-gray-200 rounded dark:bg-gray-600" />
          <div className="h-8 w-16 bg-gray-200 rounded dark:bg-gray-600" />
        </div>
        <div className="h-8 w-20 bg-gray-200 rounded dark:bg-gray-600" />
      </div>
    </div>
  );
}

