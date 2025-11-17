/**
 * React Query hooks for transactions using direct RPC
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { rpcClient } from '@/lib/rpc/client';
import { config } from '@/lib/config';

/**
 * Hook to fetch a single transaction
 */
export function useTransaction(hash: string) {
  return useQuery({
    queryKey: ['transaction', hash],
    queryFn: async () => {
      const tx = await rpcClient.getTransaction(hash as `0x${string}`);
      const receipt = await rpcClient.getTransactionReceipt(hash as `0x${string}`);
      
      return {
        ...tx,
        receipt,
      };
    },
    enabled: !!hash && hash.startsWith('0x'),
    staleTime: Infinity, // Transactions don't change
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch latest transactions from recent blocks
 */
export function useLatestTransactions(pageSize = 20) {
  return useInfiniteQuery({
    queryKey: ['transactions', 'latest', pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      // Get latest block number
      const latestBlockNumber = await rpcClient.getBlockNumber();
      
      // Fetch recent blocks to get transactions
      const blocksToFetch = 10; // Fetch last 10 blocks
      const startBlock = latestBlockNumber - BigInt(pageParam * blocksToFetch);
      
      const blockPromises: Promise<any>[] = [];
      for (let i = startBlock; i > startBlock - BigInt(blocksToFetch) && i >= 0n; i--) {
        blockPromises.push(rpcClient.getBlock(i));
      }
      
      const blocks = await Promise.all(blockPromises);
      
      // Extract transactions from blocks
      const transactions: any[] = [];
      for (const block of blocks) {
        if (block.transactions && Array.isArray(block.transactions)) {
          for (const tx of block.transactions) {
            transactions.push({
              ...tx,
              blockNumber: block.number,
              blockHash: block.hash,
              timestamp: block.timestamp,
            });
          }
        }
      }
      
      // Sort by block number and transaction index (most recent first)
      transactions.sort((a, b) => {
        if (a.blockNumber !== b.blockNumber) {
          return Number(b.blockNumber - a.blockNumber);
        }
        return (b.transactionIndex || 0) - (a.transactionIndex || 0);
      });
      
      // Paginate
      const paginatedTxs = transactions.slice(0, pageSize);
      
      return {
        transactions: paginatedTxs,
        nextCursor: pageParam + 1,
        hasMore: transactions.length >= pageSize,
      };
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: 0,
    staleTime: config.cache.transactions,
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch transactions for a specific block
 */
export function useBlockTransactions(blockNumber: bigint | number | string) {
  return useQuery({
    queryKey: ['block', blockNumber.toString(), 'transactions'],
    queryFn: async () => {
      const blockParam = typeof blockNumber === 'bigint' 
        ? blockNumber 
        : typeof blockNumber === 'string' && blockNumber.startsWith('0x')
        ? blockNumber
        : BigInt(blockNumber);
      
      const block = await rpcClient.getBlock(blockParam);
      
      if (!block.transactions || !Array.isArray(block.transactions)) {
        return [];
      }
      
      return block.transactions.map((tx: any) => ({
        ...tx,
        blockNumber: block.number,
        blockHash: block.hash,
        timestamp: block.timestamp,
      }));
    },
    enabled: !!blockNumber,
    staleTime: Infinity, // Block transactions don't change
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to watch for pending transactions (WebSocket)
 */
export function useWatchPendingTransactions(onTransaction: (hash: string) => void) {
  return useQuery({
    queryKey: ['watchPendingTransactions'],
    queryFn: () => {
      if (!config.features.enableWebSockets) {
        throw new Error('WebSocket not enabled');
      }
      
      const unwatch = rpcClient.watchPendingTransactions((hash) => {
        onTransaction(hash);
      });
      
      return unwatch;
    },
    enabled: config.features.enableWebSockets,
    staleTime: Infinity,
    gcTime: 0, // Don't cache
  });
}
