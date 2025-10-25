"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes instead of 5 seconds
        refetchInterval: false, // Disable automatic refetching
        refetchOnWindowFocus: false, // Disable refetch on window focus
        retry: 2, // Limit retry attempts
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      },
      mutations: {
        retry: 1, // Limit mutation retries
      },
    },
  });

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default QueryProvider;
