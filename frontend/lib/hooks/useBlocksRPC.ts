/**
 * React Query hooks for blocks using direct RPC
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { rpcClient } from '@/lib/rpc/client';
import { config } from '@/lib/config';

/**
 * Hook to fetch latest block number
 */
export function useLatestBlockNumber() {
  return useQuery({
    queryKey: ['blockNumber'],
    queryFn: () => rpcClient.getBlockNumber(),
    refetchInterval: config.refresh.latestBlocks,
    staleTime: config.cache.blocks,
  });
}

/**
 * Hook to fetch a single block
 */
export function useBlock(blockNumber: bigint | string | number) {
  return useQuery({
    queryKey: ['block', blockNumber.toString()],
    queryFn: async () => {
      const blockParam = typeof blockNumber === 'bigint' 
        ? blockNumber 
        : typeof blockNumber === 'string' && blockNumber.startsWith('0x')
        ? blockNumber
        : BigInt(blockNumber);
      
      const block = await rpcClient.getBlock(blockParam);
      return block;
    },
    enabled: !!blockNumber,
    staleTime: Infinity, // Blocks don't change
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch latest blocks (paginated)
 */
export function useLatestBlocks(pageSize = 20) {
  return useInfiniteQuery({
    queryKey: ['blocks', 'latest', pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      // Get latest block number
      const latestBlockNumber = await rpcClient.getBlockNumber();
      
      // Calculate block range for this page
      const startBlock = latestBlockNumber - BigInt(pageParam * pageSize);
      const endBlock = startBlock - BigInt(pageSize - 1);
      
      // Fetch blocks in parallel
      const blockPromises: Promise<any>[] = [];
      for (let i = startBlock; i >= endBlock && i >= 0n; i--) {
        blockPromises.push(rpcClient.getBlock(i));
      }
      
      const blocks = await Promise.all(blockPromises);
      
      return {
        blocks,
        nextCursor: pageParam + 1,
        hasMore: endBlock > 0n,
      };
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: 0,
    staleTime: config.cache.blocks,
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch multiple blocks by numbers
 */
export function useBlocks(blockNumbers: (bigint | number)[]) {
  return useQuery({
    queryKey: ['blocks', 'multiple', blockNumbers.map(String)],
    queryFn: async () => {
      const blocks = await Promise.all(
        blockNumbers.map(num => 
          rpcClient.getBlock(typeof num === 'bigint' ? num : BigInt(num))
        )
      );
      return blocks;
    },
    enabled: blockNumbers.length > 0,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
  });
}

/**
 * Hook to watch for new blocks (WebSocket)
 */
export function useWatchBlocks(onBlock: (block: any) => void) {
  return useQuery({
    queryKey: ['watchBlocks'],
    queryFn: () => {
      if (!config.features.enableWebSockets) {
        throw new Error('WebSocket not enabled');
      }
      
      const unwatch = rpcClient.watchBlocks((block) => {
        onBlock(block);
      });
      
      return unwatch;
    },
    enabled: config.features.enableWebSockets,
    staleTime: Infinity,
    gcTime: 0, // Don't cache
  });
}
