import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { usePointsStore } from "@/contexts/PointsContext";
import { GetUserPointBalance } from "@/utils/data/GetUserPointBalance";

interface UseUserPointsOptions {
  userId?: number;
  enableBackgroundUpdates?: boolean;
}

export const useUserPoints = ({
  userId,
  enableBackgroundUpdates = false,
}: UseUserPointsOptions) => {
  const updatePoints = usePointsStore((state) => state.updatePoints);
  const currentPoints = usePointsStore((state) => state.points);

  const queryResult = useQuery({
    queryKey: ["userPoints", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await GetUserPointBalance(userId);
      // Only update store if points have changed to prevent unnecessary re-renders
      if (
        response?.data?.points !== undefined &&
        response.data.points !== currentPoints
      ) {
        updatePoints(response.data.points);
      }
      return response;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!userId,
  });

  // Memoize formatted points
  const formattedPoints = useMemo(() => {
    const points = queryResult.data?.data?.points ?? currentPoints ?? 0;
    return points.toLocaleString("en-US");
  }, [queryResult.data?.data?.points, currentPoints]);

  // Memoize loading state - only show loading on initial load
  const isInitialLoading = queryResult.isLoading && !queryResult.data;

  return {
    ...queryResult,
    points: queryResult.data?.data?.points ?? currentPoints ?? 0,
    formattedPoints,
    isInitialLoading,
    refresh: queryResult.refetch,
  };
};
