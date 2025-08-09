import { useQuery } from "@tanstack/react-query";
import { shuffle, uniqBy } from "lodash";
import { modelsService } from "@/services/modelsService";

interface UseModelsAndHookupsOptions {
  staleTime?: number;
  refetchInterval?: number;
  enabled?: boolean;
}

export const useModelsAndHookups = (options?: UseModelsAndHookupsOptions) => {
  const {
    staleTime = 2 * 60 * 1000, // 2 minutes
    refetchInterval = 5 * 60 * 1000, // 5 minutes
    enabled = true,
  } = options || {};

  // Main query for fetching models and hookups via HTTP
  const query = useQuery({
    queryKey: ["modelsAndHookups"],
    queryFn: () => modelsService.fetchModelsAndHookups(),
    staleTime,
    refetchInterval,
    refetchIntervalInBackground: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    enabled,
    select: (data) => ({
      models: data?.models || [],
      hookups: data?.hookups || [],
    }),
  });

  // Process data with shuffling for display
  const processedData = {
    models: query.data?.models?.length ? shuffle(query.data.models) : [],
    hookups: query.data?.hookups?.length
      ? shuffle(uniqBy(query.data.hookups, "username"))
      : [],
  };

  // Determine if we have actually loaded data (not just empty arrays)
  const hasLoadedData =
    query.isSuccess &&
    ((query.data?.models && query.data.models.length > 0) ||
      (query.data?.hookups && query.data.hookups.length > 0));

  // Show loading only when actually loading, not when we have empty successful responses
  const isReallyLoading = query.isLoading && !query.isSuccess;

  return {
    ...query,
    data: processedData,
    refetch: query.refetch,
    isLoading: isReallyLoading,
    error: query.error,
    isError: query.isError,
    hasLoadedData,
    isEmpty: query.isSuccess && !hasLoadedData,
  };
};

