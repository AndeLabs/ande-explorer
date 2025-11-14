import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { config } from '@/lib/config';

/**
 * Hook to fetch a single block by height or hash
 */
export function useBlock(heightOrHash: string | number) {
  return useQuery({
    queryKey: ['block', heightOrHash],
    queryFn: () => api.getBlock(heightOrHash),
    enabled: !!heightOrHash,
    staleTime: Infinity, // Blocks don't change
    gcTime: Infinity,
  });
}

/**
 * Hook to fetch paginated list of blocks
 */
export function useBlocks(page = 1) {
  return useQuery({
    queryKey: ['blocks', page],
    queryFn: () => api.getBlocks(page),
    keepPreviousData: true,
    staleTime: config.cache.blocks,
  });
}
