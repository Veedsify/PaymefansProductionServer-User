import { useInfiniteQuery } from "@tanstack/react-query";
import type { StoreAllProductsResponse } from "@/types/Components.d";
import fetchStoreProducts from "@/utils/data/FetchStoreProducts";

export const useStoreProducts = (limit: number = 10) => {
  return useInfiniteQuery<StoreAllProductsResponse>({
    queryKey: ["store-products", limit],
    queryFn: ({ pageParam = 1 }) => fetchStoreProducts(pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
