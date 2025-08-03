import { useQuery } from "@tanstack/react-query";
import { shuffle } from "lodash";
import { modelsService } from "@/services/modelsService";

export interface UseModelsOptions {
  staleTime?: number;
  refetchInterval?: number;
  enabled?: boolean;
  search?: string;
  limit?: number;
}

export const useModels = (options?: UseModelsOptions) => {
  const {
    staleTime = 2 * 60 * 1000, // 2 minutes
    refetchInterval = 5 * 60 * 1000, // 5 minutes
    enabled = true,
    search = "",
    limit = 50,
  } = options || {};

  // Query for fetching all models via HTTP
  const query = useQuery({
    queryKey: ["models", "all", { search, limit }],
    queryFn: async () => {
      if (search && search.trim()) {
        return await modelsService.searchModels(search.trim());
      }
      return await modelsService.fetchAllModels();
    },
    staleTime,
    refetchInterval: search ? undefined : refetchInterval, // Don't auto-refetch for search
    refetchIntervalInBackground: !search,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    enabled,
    select: (data) => {
      // Shuffle models for better distribution if not searching
      return search ? data || [] : shuffle(data || []);
    },
  });

  // Determine if we have actually loaded data (not just empty arrays)
  const hasLoadedData = query.isSuccess && query.data && query.data.length > 0;

  // Show loading only when actually loading, not when we have empty successful responses
  const isReallyLoading = query.isLoading && !query.isSuccess;

  return {
    ...query,
    models: query.data || [],
    isLoading: isReallyLoading,
    error: query.error,
    isError: query.isError,
    hasLoadedData,
    isEmpty: query.isSuccess && !hasLoadedData,
    refetch: query.refetch,
  };
};

export default useModels;
