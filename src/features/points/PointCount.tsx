"use client";

import Image from "next/image";
import { memo } from "react";
import { useUserPoints } from "../user/hooks/useUserPoints";

interface PointsCountProps {
  user: any;
  enableBackgroundUpdates?: boolean;
}

const PointsCount = memo(
  ({ user, enableBackgroundUpdates = false }: PointsCountProps) => {
    const { formattedPoints, isInitialLoading, error, isStale } = useUserPoints(
      {
        userId: user?.id,
        enableBackgroundUpdates,
      },
    );

    // Show loading only on initial load
    if (isInitialLoading) {
      return (
        <h2 className="flex items-center mb-1 text-xl font-bold leading-none">
          <span className="w-16 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-md"></span>
        </h2>
      );
    }

    // Show error state if needed
    if (error) {
      return (
        <h2 className="flex items-center mb-1 text-xl font-bold leading-none text-red-500">
          Error loading points
        </h2>
      );
    }

    return (
      <h2 className="flex items-center mb-1 text-xl font-bold leading-none">
        <span
          className={
            isStale ? "opacity-75 transition-opacity" : "transition-opacity"
          }
        >
          {formattedPoints}
        </span>
        <span className="ml-2">
          <Image
            width={20}
            height={20}
            src="/site/coin.svg"
            className="w-5 h-5 aspect-square"
            alt="Points"
            priority={false}
          />
        </span>
      </h2>
    );
  },
);

PointsCount.displayName = "PointsCount";

export default PointsCount;
