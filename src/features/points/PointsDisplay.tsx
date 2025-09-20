"use client";

import { memo } from "react";
import { usePointsStore } from "@/contexts/PointsContext";

interface PointsDisplayProps {
  className?: string;
  showIcon?: boolean;
}

/**
 * Lightweight points display that only reads from store.
 * Use this for areas where points are displayed frequently but don't need real-time updates.
 * Perfect for navigation bars, headers, or repeated list items.
 */
const PointsDisplay = memo(
  ({ className = "", showIcon = true }: PointsDisplayProps) => {
    const points = usePointsStore((state) => state.points);

    return (
      <span className={`flex items-center ${className}`}>
        {points?.toLocaleString("en-US") || "0"}
        {showIcon && (
          <span className="ml-1">
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 text-yellow-500"
            >
              <circle cx="12" cy="12" r="10" />
              <text x="12" y="16" textAnchor="middle" fontSize="8" fill="white">
                ₱
              </text>
            </svg>
          </span>
        )}
      </span>
    );
  },
);

PointsDisplay.displayName = "PointsDisplay";

export default PointsDisplay;
