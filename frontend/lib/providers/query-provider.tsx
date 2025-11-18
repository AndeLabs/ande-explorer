'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // PERFORMANCE OPTIMIZATIONS FOR BLOCKCHAIN EXPLORER
            staleTime: 30_000, // 30 seconds - balance between fresh data and performance
            gcTime: 10 * 60_000, // 10 minutes - keep in memory for navigation

            // Refetch strategies
            refetchOnWindowFocus: false, // No refetch on window focus (use WebSocket for updates)
            refetchOnMount: 'always', // Always check cache on mount
            refetchOnReconnect: true, // Refetch when reconnecting (data might be stale)

            // Retry configuration
            retry: 2, // 2 retries for network resilience
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff

            // Network mode
            networkMode: 'online',

            // Structural sharing for better performance
            structuralSharing: true,

            // Refetch interval for real-time feel (fallback when WebSocket fails)
            refetchInterval: false, // Disabled by default, enable per-query as needed
          },
          mutations: {
            // Mutation defaults
            retry: 1,
            networkMode: 'online',
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}
