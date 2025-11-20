import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { config } from '@/lib/config';

/**
 * Hook to fetch token info
 */
export function useToken(address: string) {
  return useQuery({
    queryKey: ['token', address],
    queryFn: () => api.getToken(address),
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    staleTime: config.cache.address,
  });
}

/**
 * Hook to fetch paginated list of tokens with auto-refresh
 */
export function useTokens(params?: { page?: number; type?: string }) {
  const page = params?.page || 1;

  return useQuery({
    queryKey: ['tokens', params],
    queryFn: () => api.getTokens(params),
    // Keep previous data while fetching new
    placeholderData: (previousData) => previousData,
    staleTime: config.cache.address,
    // Auto-refresh only on first page (latest tokens)
    refetchInterval: page === 1 ? 10_000 : false, // 10 seconds for tokens
    refetchIntervalInBackground: false,
  });
}

/**
 * Hook to fetch token transfers
 */
export function useTokenTransfers(address: string, params?: { page?: number }) {
  return useQuery({
    queryKey: ['token-transfers', address, params],
    queryFn: () => api.getTokenTransfers(address, params),
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    keepPreviousData: true,
    staleTime: config.cache.address,
  });
}

/**
 * Hook to fetch token holders
 */
export function useTokenHolders(address: string, params?: { page?: number }) {
  return useQuery({
    queryKey: ['token-holders', address, params],
    queryFn: () => api.getTokenHolders(address, params),
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    keepPreviousData: true,
    staleTime: config.cache.address,
  });
}
