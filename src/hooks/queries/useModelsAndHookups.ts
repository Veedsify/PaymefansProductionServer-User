import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { shuffle, uniqBy } from "lodash";
import {
  modelsService,
  ModelsAndHookupsResponse,
} from "@/services/modelsService";

export interface UseModelsAndHookupsOptions {
  staleTime?: number;
  refetchInterval?: number;
  enabled?: boolean;
}

export const useModelsAndHookups = (options?: UseModelsAndHookupsOptions) => {
  const queryClient = useQueryClient();

  const {
    staleTime = 2 * 60 * 1000, // 2 minutes
    refetchInterval = 5 * 60 * 1000, // 5 minutes
    enabled = true,
  } = options || {};

  // Main query for fetching models and hookups
  const query = useQuery({
    queryKey: ["modelsAndHookups"],
    queryFn: () => modelsService.fetchModelsAndHookups(),
    staleTime,
    refetchInterval,
    refetchIntervalInBackground: true,
    retry: 2, // Reduced retry attempts
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    enabled,
    // Consider empty arrays as successful responses
    select: (data) => ({
      models: data?.models || [],
      hookups: data?.hookups || [],
    }),
  });

  // Send location and invalidate queries
  const updateLocation = useCallback(() => {
    modelsService.sendUserLocation();
    queryClient.invalidateQueries({ queryKey: ["modelsAndHookups"] });
  }, [queryClient]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = modelsService.subscribeToUpdates((newData) => {
      queryClient.setQueryData(
        ["modelsAndHookups"],
        (oldData: ModelsAndHookupsResponse | undefined) => {
          if (!oldData) return oldData;

          return {
            models: newData.models?.length ? newData.models : oldData.models,
            hookups: newData.hookups?.length
              ? newData.hookups
              : oldData.hookups,
          };
        },
      );
    });

    // Send location updates periodically
    const locationInterval = setInterval(updateLocation, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      unsubscribe();
      clearInterval(locationInterval);
    };
  }, [queryClient, updateLocation, enabled]);

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
    updateLocation,
    refetch: query.refetch,
    isLoading: isReallyLoading,
    error: query.error,
    isError: query.isError,
    hasLoadedData,
    isEmpty: query.isSuccess && !hasLoadedData,
  };
};

export default useModelsAndHookups;
