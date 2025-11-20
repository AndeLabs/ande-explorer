/**
 * Unified BlockScout Stats Hook with Real-time Updates
 *
 * Single hook that provides blockchain statistics with WebSocket support.
 * WebSockets are enabled by default for instant updates.
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

interface UseBlockScoutStatsOptions {
  /**
   * Enable real-time updates via WebSockets
   * @default true
   */
  enableRealtime?: boolean;

  /**
   * Polling interval in milliseconds (fallback when WebSockets fail)
   * @default 3000
   */
  refetchInterval?: number;
}

/**
 * Unified hook for BlockScout statistics
 *
 * Features:
 * - Real-time updates via WebSockets (default)
 * - Automatic polling fallback (3s)
 * - Validates and fixes invalid data
 * - Smooth transitions between updates
 *
 * @example
 * // With real-time updates (default)
 * const { data, isLoading } = useBlockScoutStats();
 *
 * @example
 * // Polling only (disable WebSockets)
 * const { data, isLoading } = useBlockScoutStats({ enableRealtime: false });
 *
 * @example
 * // Custom polling interval
 * const { data, isLoading } = useBlockScoutStats({ refetchInterval: 5000 });
 */
export function useBlockScoutStats(options: UseBlockScoutStatsOptions = {}) {
  const {
    enableRealtime = true,
    refetchInterval = 3_000,
  } = options;

  const queryClient = useQueryClient();
  const lastBlockRef = useRef<number | null>(null);

  // Base query with polling
  const query = useQuery({
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
    gcTime: refetchInterval,
    refetchInterval,
    refetchIntervalInBackground: false,
    // Keep previous data while fetching for smooth transitions
    placeholderData: (previousData) => previousData,
  });

  // WebSocket integration (if enabled)
  const handleNewBlock = useCallback((data: any) => {
    const blockNumber = data?.block?.height || data?.height;

    if (blockNumber && blockNumber !== lastBlockRef.current) {
      lastBlockRef.current = blockNumber;
      // Invalidate stats to trigger immediate refetch
      queryClient.invalidateQueries({ queryKey: ['blockscout-stats'] });
    }
  }, [queryClient]);

  useEffect(() => {
    if (!enableRealtime || !config.features.enableWebSockets) return;

    // Connect to WebSocket and subscribe to new blocks
    wsClient.connect();
    const unsubscribe = wsClient.subscribe(WS_EVENTS.NEW_BLOCK, handleNewBlock);

    return () => {
      unsubscribe();
    };
  }, [enableRealtime, handleNewBlock]);

  return query;
}

export type { BlockScoutStats };
