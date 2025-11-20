/**
 * React Query hook for BlockScout stats with real-time updates
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useRef } from 'react';
import { getStats, BlockScoutStats } from '@/lib/api/blockscout';
import { config } from '@/lib/config';
import { wsClient, WS_EVENTS } from '@/lib/websocket/client';

// Expected block time range for ANDE Chain
const EXPECTED_BLOCK_TIME = 12;
const MIN_VALID_BLOCK_TIME = 1;
const MAX_VALID_BLOCK_TIME = 60;

export function useBlockScoutStats() {
  return useQuery({
    queryKey: ['blockscout-stats'],
    queryFn: async () => {
      const data = await getStats();

      // Validate and fix average_block_time if it's unreasonable
      // BlockScout sometimes returns 5010 or other invalid values
      if (
        data.average_block_time < MIN_VALID_BLOCK_TIME ||
        data.average_block_time > MAX_VALID_BLOCK_TIME
      ) {
        console.warn(
          `[Stats] Invalid average_block_time: ${data.average_block_time}s, using fallback: ${EXPECTED_BLOCK_TIME}s`
        );
        return {
          ...data,
          average_block_time: EXPECTED_BLOCK_TIME,
        };
      }

      return data;
    },
    staleTime: 0, // Always consider data stale for fresh updates
    gcTime: 5_000, // Keep in cache for 5 seconds
    refetchInterval: 5_000, // Refresh every 5 seconds
    refetchIntervalInBackground: false,
    // Keep previous data while fetching for smooth transitions
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook for real-time stats with WebSocket integration
 * Updates immediately when new blocks arrive
 */
export function useRealtimeBlockScoutStats() {
  const queryClient = useQueryClient();
  const lastBlockRef = useRef<number | null>(null);

  // Invalidate stats when new block arrives
  const handleNewBlock = useCallback((data: any) => {
    const blockNumber = data?.block?.height || data?.height;

    if (blockNumber && blockNumber !== lastBlockRef.current) {
      lastBlockRef.current = blockNumber;
      // Invalidate stats to trigger immediate refetch
      queryClient.invalidateQueries({ queryKey: ['blockscout-stats'] });
    }
  }, [queryClient]);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!config.features.enableWebSockets) return;

    wsClient.connect();
    const unsubscribe = wsClient.subscribe(WS_EVENTS.NEW_BLOCK, handleNewBlock);

    return () => {
      unsubscribe();
    };
  }, [handleNewBlock]);

  return useBlockScoutStats();
}

export type { BlockScoutStats };
