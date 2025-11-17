/**
 * React Query hooks for addresses using direct RPC
 */

import { useQuery } from '@tanstack/react-query';
import { rpcClient } from '@/lib/rpc/client';
import { config } from '@/lib/config';

/**
 * Hook to fetch address balance
 */
export function useAddressBalance(address: string) {
  return useQuery({
    queryKey: ['address', address, 'balance'],
    queryFn: () => rpcClient.getBalance(address as `0x${string}`),
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    staleTime: config.cache.address,
    refetchInterval: config.cache.address,
  });
}

/**
 * Hook to fetch address transaction count (nonce)
 */
export function useAddressTransactionCount(address: string) {
  return useQuery({
    queryKey: ['address', address, 'txCount'],
    queryFn: () => rpcClient.getTransactionCount(address as `0x${string}`),
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    staleTime: config.cache.address,
  });
}

/**
 * Hook to fetch address code (to check if contract)
 */
export function useAddressCode(address: string) {
  return useQuery({
    queryKey: ['address', address, 'code'],
    queryFn: async () => {
      const code = await rpcClient.getCode(address as `0x${string}`);
      const isContract = code !== undefined && code !== '0x';
      
      return {
        code,
        isContract,
      };
    },
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    staleTime: Infinity, // Contract code doesn't change
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook to fetch complete address info
 */
export function useAddress(address: string) {
  const balanceQuery = useAddressBalance(address);
  const txCountQuery = useAddressTransactionCount(address);
  const codeQuery = useAddressCode(address);
  
  return useQuery({
    queryKey: ['address', address, 'complete'],
    queryFn: async () => {
      const [balance, txCount, codeInfo] = await Promise.all([
        balanceQuery.refetch(),
        txCountQuery.refetch(),
        codeQuery.refetch(),
      ]);
      
      return {
        address,
        balance: balance.data,
        transactionCount: txCount.data,
        isContract: codeInfo.data?.isContract || false,
        code: codeInfo.data?.code,
      };
    },
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    staleTime: config.cache.address,
  });
}

/**
 * Hook to fetch address transactions from recent blocks
 * Note: This is less efficient than indexed DB, but works without backend
 */
export function useAddressTransactions(address: string, maxBlocks = 100) {
  return useQuery({
    queryKey: ['address', address, 'transactions', maxBlocks],
    queryFn: async () => {
      const latestBlockNumber = await rpcClient.getBlockNumber();
      const startBlock = latestBlockNumber;
      const endBlock = latestBlockNumber - BigInt(maxBlocks);
      
      const transactions: any[] = [];
      
      // Fetch blocks in batches to find transactions involving this address
      const batchSize = 10;
      for (let i = startBlock; i > endBlock && i >= 0n; i -= BigInt(batchSize)) {
        const blockPromises: Promise<any>[] = [];
        
        for (let j = i; j > i - BigInt(batchSize) && j > endBlock && j >= 0n; j--) {
          blockPromises.push(rpcClient.getBlock(j));
        }
        
        const blocks = await Promise.all(blockPromises);
        
        // Filter transactions involving the address
        for (const block of blocks) {
          if (block.transactions && Array.isArray(block.transactions)) {
            for (const tx of block.transactions) {
              const txFrom = tx.from?.toLowerCase();
              const txTo = tx.to?.toLowerCase();
              const targetAddress = address.toLowerCase();
              
              if (txFrom === targetAddress || txTo === targetAddress) {
                transactions.push({
                  ...tx,
                  blockNumber: block.number,
                  blockHash: block.hash,
                  timestamp: block.timestamp,
                });
              }
            }
          }
        }
        
        // Stop if we found enough transactions
        if (transactions.length >= 50) break;
      }
      
      return transactions.sort((a, b) => 
        Number(b.blockNumber - a.blockNumber)
      );
    },
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    staleTime: config.cache.address,
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
