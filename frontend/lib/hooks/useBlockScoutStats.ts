/**
 * React Query hook for BlockScout stats
 */

import { useQuery } from '@tanstack/react-query';
import { getStats, BlockScoutStats } from '@/lib/api/blockscout';
import { config } from '@/lib/config';

export function useBlockScoutStats() {
  return useQuery({
    queryKey: ['blockscout-stats'],
    queryFn: getStats,
    staleTime: config.cache.stats,
    refetchInterval: config.refresh.stats,
    retry: 3,
    retryDelay: 1000,
  });
}

export type { BlockScoutStats };
