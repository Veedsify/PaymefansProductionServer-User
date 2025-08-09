import { useQuery } from "@tanstack/react-query";
import { shuffle, uniqBy } from "lodash";
import { modelsService } from "@/services/modelsService";

interface UseHookupsOptions {
  staleTime?: number;
  refetchInterval?: number;
  enabled?: boolean;
}

export const useHookups = (options?: UseHookupsOptions) => {
  const {
    staleTime = 2 * 60 * 1000, // 2 minutes
    refetchInterval = 5 * 60 * 1000, // 5 minutes
    enabled = true,
  } = options || {};

  // Query for fetching hookups via HTTP
  const query = useQuery({
    queryKey: ["hookups"],
    queryFn: () => modelsService.fetchHookups(),
    staleTime,
    refetchInterval,
    refetchIntervalInBackground: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    enabled,
    select: (data) => {
      // Shuffle and dedupe hookups for better distribution
      return shuffle(uniqBy(data || [], "username"));
    },
  });

  // Determine if we have actually loaded data (not just empty arrays)
  const hasLoadedData = query.isSuccess && query.data && query.data.length > 0;

  // Show loading only when actually loading, not when we have empty successful responses
  const isReallyLoading = query.isLoading && !query.isSuccess;

  return {
    ...query,
    hookups: query.data || [],
    isLoading: isReallyLoading,
    error: query.error,
    isError: query.isError,
    hasLoadedData,
    isEmpty: query.isSuccess && !hasLoadedData,
    refetch: query.refetch,
  };
};

