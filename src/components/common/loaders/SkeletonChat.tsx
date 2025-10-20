import React from "react";

interface SkeletonChatProps {
  count?: number;
  className?: string;
}

export function SkeletonChat({ count = 3, className = "" }: SkeletonChatProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-center px-2 py-4">
            {/* Avatar */}
            <div className="h-14 w-14 bg-gray-300 rounded-full dark:bg-gray-700 flex-shrink-0" />

            <div className="ml-4 flex-1 min-w-0">
              {/* Name and time */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="h-4 bg-gray-300 rounded w-1/4 dark:bg-gray-700" />
                <div className="h-3 bg-gray-200 rounded w-12 dark:bg-gray-600" />
              </div>

              {/* Message preview */}
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-full dark:bg-gray-600" />
                <div className="h-3 bg-gray-200 rounded w-3/4 dark:bg-gray-600" />
              </div>
            </div>

            {/* Unread indicator */}
            <div className="ml-2 h-2.5 w-2.5 bg-gray-300 rounded-full dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonChat;
