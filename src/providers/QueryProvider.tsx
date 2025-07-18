"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 10 * 10 * 10 * 5, // 5 minutes
                refetchInterval: 1000 * 10, //
            },
        },
    })

    return <QueryClientProvider client={queryClient}>
        {children}
    </QueryClientProvider>;
}

export default QueryProvider;