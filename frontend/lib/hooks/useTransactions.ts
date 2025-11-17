import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { config } from '@/lib/config';

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
 * Hook to fetch paginated list of transactions
 */
export function useTransactions(page = 1) {
  return useQuery({
    queryKey: ['transactions', page],
    queryFn: () => api.getTransactions(page),
    keepPreviousData: true,
    staleTime: config.cache.transactions,
  });
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
