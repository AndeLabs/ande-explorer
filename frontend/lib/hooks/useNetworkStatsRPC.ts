/**
 * React Query hooks for network stats using direct RPC
 */

import { useQuery } from '@tanstack/react-query';
import { rpcClient } from '@/lib/rpc/client';
import { config } from '@/lib/config';

/**
 * Hook to fetch current gas price
 */
export function useGasPrice() {
  return useQuery({
    queryKey: ['gasPrice'],
    queryFn: () => rpcClient.getGasPrice(),
    staleTime: config.cache.gasPrice,
    refetchInterval: config.refresh.gasPrice,
  });
}

/**
 * Hook to fetch fee history for gas estimation
 */
export function useFeeHistory(blockCount = 20) {
  return useQuery({
    queryKey: ['feeHistory', blockCount],
    queryFn: () => rpcClient.getFeeHistory(blockCount, 'latest'),
    staleTime: config.cache.gasPrice,
    refetchInterval: config.refresh.gasPrice,
  });
}

/**
 * Hook to fetch network statistics
 */
export function useNetworkStats() {
  return useQuery({
    queryKey: ['networkStats'],
    queryFn: async () => {
      // Fetch multiple data points in parallel
      const [
        latestBlockNumber,
        latestBlock,
        gasPrice,
        feeHistory,
      ] = await Promise.all([
        rpcClient.getBlockNumber(),
        rpcClient.getBlock('latest'),
        rpcClient.getGasPrice(),
        rpcClient.getFeeHistory(10, 'latest'),
      ]);

      // Calculate average block time from recent blocks
      let avgBlockTime = 12; // Default 12 seconds
      if (latestBlock && latestBlock.number && latestBlock.number > 10n) {
        const olderBlock = await rpcClient.getBlock(latestBlock.number - 10n);
        if (olderBlock && latestBlock.timestamp && olderBlock.timestamp) {
          const timeDiff = Number(latestBlock.timestamp - olderBlock.timestamp);
          avgBlockTime = timeDiff / 10;
        }
      }

      // Calculate TPS from recent blocks
      let tps = 0;
      if (latestBlock.transactions && Array.isArray(latestBlock.transactions)) {
        const txCount = latestBlock.transactions.length;
        tps = txCount / avgBlockTime;
      }

      return {
        latestBlockNumber,
        latestBlock: {
          number: latestBlock.number,
          hash: latestBlock.hash,
          timestamp: latestBlock.timestamp,
          transactions: latestBlock.transactions?.length || 0,
          gasUsed: latestBlock.gasUsed,
          gasLimit: latestBlock.gasLimit,
        },
        gasPrice: {
          value: gasPrice.value,
          formatted: gasPrice.formatted,
          gwei: gasPrice.formatted,
        },
        avgBlockTime,
        tps: Math.round(tps * 100) / 100,
        networkUtilization: latestBlock.gasUsed && latestBlock.gasLimit
          ? Number((latestBlock.gasUsed * 100n) / latestBlock.gasLimit) / 100
          : 0,
      };
    },
    staleTime: config.cache.stats,
    refetchInterval: config.refresh.stats,
  });
}

/**
 * Hook to calculate network activity over time
 */
export function useNetworkActivity(blocks = 100) {
  return useQuery({
    queryKey: ['networkActivity', blocks],
    queryFn: async () => {
      const latestBlockNumber = await rpcClient.getBlockNumber();
      const startBlock = latestBlockNumber;
      const endBlock = latestBlockNumber - BigInt(blocks);

      const blockPromises: Promise<any>[] = [];
      
      // Sample every 10 blocks for efficiency
      const sampleRate = 10;
      for (let i = startBlock; i > endBlock && i >= 0n; i -= BigInt(sampleRate)) {
        blockPromises.push(rpcClient.getBlock(i));
      }

      const sampledBlocks = await Promise.all(blockPromises);

      // Calculate metrics
      const data = sampledBlocks.map(block => ({
        blockNumber: Number(block.number),
        timestamp: Number(block.timestamp),
        transactions: Array.isArray(block.transactions) ? block.transactions.length : 0,
        gasUsed: Number(block.gasUsed),
        gasLimit: Number(block.gasLimit),
        utilization: block.gasUsed && block.gasLimit
          ? Number((block.gasUsed * 100n) / block.gasLimit)
          : 0,
      })).reverse(); // Oldest to newest

      return data;
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
