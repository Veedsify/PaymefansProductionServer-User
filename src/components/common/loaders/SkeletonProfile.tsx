import React from "react";

interface SkeletonProfileProps {
  showBanner?: boolean;
  showStats?: boolean;
  className?: string;
}

export function SkeletonProfile({
  showBanner = true,
  showStats = true,
  className = "",
}: SkeletonProfileProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {/* Banner */}
      {showBanner && (
        <div className="h-48 bg-gray-300 rounded-t-lg dark:bg-gray-700" />
      )}

      <div className="p-6">
        {/* Profile header */}
        <div className="flex items-start space-x-4 mb-6">
          {/* Avatar */}
          <div className="h-20 w-20 bg-gray-300 rounded-full dark:bg-gray-700 flex-shrink-0" />

          <div className="flex-1">
            {/* Name and username */}
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-2 dark:bg-gray-700" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3 dark:bg-gray-600" />

            {/* Bio */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full dark:bg-gray-600" />
              <div className="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-600" />
            </div>
          </div>

          {/* Follow button */}
          <div className="h-10 w-24 bg-gray-200 rounded dark:bg-gray-600" />
        </div>

        {/* Stats */}
        {showStats && (
          <div className="flex space-x-6 mb-6">
            <div className="text-center">
              <div className="h-6 bg-gray-300 rounded w-12 mx-auto mb-1 dark:bg-gray-700" />
              <div className="h-3 bg-gray-200 rounded w-16 dark:bg-gray-600" />
            </div>
            <div className="text-center">
              <div className="h-6 bg-gray-300 rounded w-12 mx-auto mb-1 dark:bg-gray-700" />
              <div className="h-3 bg-gray-200 rounded w-16 dark:bg-gray-600" />
            </div>
            <div className="text-center">
              <div className="h-6 bg-gray-300 rounded w-12 mx-auto mb-1 dark:bg-gray-700" />
              <div className="h-3 bg-gray-200 rounded w-16 dark:bg-gray-600" />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-4">
          <div className="h-8 bg-gray-200 rounded w-16 dark:bg-gray-600" />
          <div className="h-8 bg-gray-200 rounded w-16 dark:bg-gray-600" />
          <div className="h-8 bg-gray-200 rounded w-16 dark:bg-gray-600" />
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square bg-gray-300 rounded dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SkeletonProfile;
