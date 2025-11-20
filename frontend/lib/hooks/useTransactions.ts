import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api/client';
import { config } from '@/lib/config';
import { wsClient, WS_EVENTS } from '@/lib/websocket/client';

/**
 * Hook to fetch a single transaction by hash
 */
export function useTransaction(hash: string) {
  return useQuery({
    queryKey: ['transaction', hash],
    queryFn: () => api.getTransaction(hash),
    enabled: !!hash && hash.startsWith('0x'),
    staleTime: Infinity, // TX confirmadas son immutables
    gcTime: Infinity, // Keep in cache forever
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * Hook to fetch paginated list of transactions with auto-refresh
 */
export function useTransactions(page = 1) {
  return useQuery({
    queryKey: ['transactions', page],
    queryFn: () => api.getTransactions(page),
    // Keep previous data while fetching new
    placeholderData: (previousData) => previousData,
    staleTime: config.cache.transactions,
    // Auto-refresh only on first page (latest transactions)
    refetchInterval: page === 1 ? config.refresh.latestBlocks : false,
    refetchIntervalInBackground: false,
  });
}

/**
 * Hook for real-time transactions with WebSocket integration
 */
export function useRealtimeTransactions(page = 1) {
  const queryClient = useQueryClient();
  const lastTxRef = useRef<string | null>(null);

  // Invalidate transactions query when new transaction arrives
  const handleNewTransaction = useCallback((data: any) => {
    const txHash = data?.transaction?.hash || data?.hash;

    if (txHash && txHash !== lastTxRef.current) {
      lastTxRef.current = txHash;
      queryClient.invalidateQueries({ queryKey: ['transactions', 1] });
    }
  }, [queryClient]);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!config.features.enableWebSockets) return;

    wsClient.connect();
    const unsubscribe = wsClient.subscribe(WS_EVENTS.NEW_TRANSACTION, handleNewTransaction);

    return () => {
      unsubscribe();
    };
  }, [handleNewTransaction]);

  return useTransactions(page);
}

/**
 * Hook to fetch internal transactions for a transaction
 */
export function useInternalTransactions(hash: string) {
  return useQuery({
    queryKey: ['internal-transactions', hash],
    queryFn: () => api.getInternalTransactions(hash),
    enabled: !!hash && hash.startsWith('0x'),
    staleTime: config.cache.transactions,
  });
}

/**
 * Hook to fetch transaction logs
 */
export function useTransactionLogs(hash: string) {
  return useQuery({
    queryKey: ['transaction-logs', hash],
    queryFn: () => api.getTransactionLogs(hash),
    enabled: !!hash && hash.startsWith('0x'),
    staleTime: config.cache.transactions,
  });
}
