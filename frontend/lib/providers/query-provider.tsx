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
            // PERFORMANCE OPTIMIZATIONS
            staleTime: 5 * 60_000, // 5 minutos - datos blockchain cambian lento
            gcTime: 10 * 60_000, // 10 minutos - mantener en memoria
            refetchOnWindowFocus: false, // No refetch al cambiar de ventana
            refetchOnMount: false, // No refetch al montar (usa cache)
            refetchOnReconnect: false, // No refetch al reconectar
            retry: 1, // Solo 1 retry (más rápido failure)
            retryDelay: 1000, // 1 segundo entre retries
            // Network mode
            networkMode: 'online', // Solo queries cuando hay internet
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}
