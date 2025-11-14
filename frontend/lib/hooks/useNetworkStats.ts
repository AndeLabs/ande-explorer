import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { config } from '@/lib/config';

export function useNetworkStats() {
  return useQuery({
    queryKey: ['network-stats'],
    queryFn: () => api.getNetworkStats(),
    refetchInterval: config.refresh.stats,
    staleTime: config.cache.stats,
  });
}

export function useLatestBlock() {
  return useQuery({
    queryKey: ['latest-block'],
    queryFn: () => api.getLatestBlock(),
    refetchInterval: config.refresh.latestBlocks,
    staleTime: config.cache.blocks,
  });
}

export function useGasPrices() {
  return useQuery({
    queryKey: ['gas-prices'],
    queryFn: () => api.getGasPrices(),
    refetchInterval: config.refresh.gasPrice,
    staleTime: config.cache.gasPrice,
  });
}
