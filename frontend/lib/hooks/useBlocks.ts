import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api/client';
import { config } from '@/lib/config';
import { wsClient, WS_EVENTS } from '@/lib/websocket/client';

/**
 * Hook to fetch a single block by height or hash
 */
export function useBlock(heightOrHash: string | number) {
  return useQuery({
    queryKey: ['block', heightOrHash],
    queryFn: () => api.getBlock(heightOrHash),
    enabled: !!heightOrHash,
    staleTime: Infinity, // Blocks don't change - IMMUTABLE
    gcTime: Infinity, // Keep in cache forever
    refetchOnMount: false, // Don't refetch on component mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });
}

/**
 * Hook to fetch paginated list of blocks with auto-refresh
 */
export function useBlocks(page = 1) {
  return useQuery({
    queryKey: ['blocks', page],
    queryFn: () => api.getBlocks(page),
    // Keep previous data while fetching new
    placeholderData: (previousData) => previousData,
    staleTime: config.cache.blocks,
    // Auto-refresh only on first page (latest blocks)
    refetchInterval: page === 1 ? config.refresh.latestBlocks : false,
    // Continue refreshing even when tab is not focused
    refetchIntervalInBackground: false,
  });
}

/**
 * Hook for real-time blocks with WebSocket integration
 * Automatically invalidates queries when new blocks arrive
 */
export function useRealtimeBlocks(page = 1) {
  const queryClient = useQueryClient();
  const lastBlockRef = useRef<number | null>(null);

  // Invalidate blocks query when new block arrives via WebSocket
  const handleNewBlock = useCallback((data: any) => {
    const newBlockNumber = data?.block?.height || data?.height || data?.number;

    // Avoid duplicate invalidations
    if (newBlockNumber && newBlockNumber !== lastBlockRef.current) {
      lastBlockRef.current = newBlockNumber;

      // Invalidate blocks list to refetch
      queryClient.invalidateQueries({ queryKey: ['blocks', 1] });

      // Also invalidate stats
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['blockscout-stats'] });
    }
  }, [queryClient]);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!config.features.enableWebSockets) return;

    // Connect to WebSocket
    wsClient.connect();

    // Subscribe to new block events
    const unsubscribe = wsClient.subscribe(WS_EVENTS.NEW_BLOCK, handleNewBlock);

    return () => {
      unsubscribe();
    };
  }, [handleNewBlock]);

  // Use the regular blocks query with auto-refresh
  return useBlocks(page);
}

/**
 * Hook to get latest block number with real-time updates
 */
export function useLatestBlockNumber() {
  const queryClient = useQueryClient();

  // Subscribe to new blocks and update latest number
  useEffect(() => {
    if (!config.features.enableWebSockets) return;

    wsClient.connect();

    const unsubscribe = wsClient.subscribe(WS_EVENTS.NEW_BLOCK, (data) => {
      const blockNumber = data?.block?.height || data?.height || data?.number;
      if (blockNumber) {
        queryClient.setQueryData(['latestBlockNumber'], blockNumber);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['latestBlockNumber'],
    queryFn: async () => {
      const blocks = await api.getBlocks(1);
      return blocks.items[0]?.height || 0;
    },
    refetchInterval: config.refresh.latestBlocks,
    staleTime: 0, // Always consider stale for real-time
  });
}
