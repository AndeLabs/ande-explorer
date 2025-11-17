/**
 * Custom React Hooks for Hybrid Data Fetching
 * Usa TanStack Query + Hybrid Client
 */

import { useQuery, useInfiniteQuery, UseQueryOptions } from '@tanstack/react-query';
import * as HybridClient from '../api/hybrid-client';

// ============================================================================
// BLOCKS
// ============================================================================

/**
 * Hook para obtener un bloque específico
 */
export function useBlock(blockNumberOrHash: bigint | string | undefined) {
  return useQuery({
    queryKey: ['block', blockNumberOrHash?.toString()],
    queryFn: () => HybridClient.getBlock(blockNumberOrHash!),
    enabled: blockNumberOrHash !== undefined,
    staleTime: 30_000, // Los bloques no cambian, cache por 30s
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

/**
 * Hook para obtener bloques recientes
 */
export function useLatestBlocks(limit: number = 10) {
  return useQuery({
    queryKey: ['blocks', 'latest', limit],
    queryFn: () => HybridClient.getLatestBlocks(limit),
    refetchInterval: 12_000, // Actualizar cada 12 segundos (tiempo de bloque promedio)
    staleTime: 10_000,
  });
}

/**
 * Hook para bloques con scroll infinito
 */
export function useInfiniteBlocks(pageSize: number = 20) {
  return useInfiniteQuery({
    queryKey: ['blocks', 'infinite', pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      const latestBlockNumber = await HybridClient.publicClient.getBlockNumber();
      const startBlock = latestBlockNumber - BigInt(pageParam * pageSize);
      const blocks: typeof HybridClient.HybridBlock[] = [];

      for (let i = 0; i < pageSize; i++) {
        const blockNum = startBlock - BigInt(i);
        if (blockNum < 0n) break;
        const block = await HybridClient.getBlock(blockNum);
        blocks.push(block);
      }

      return {
        blocks,
        nextCursor: pageParam + 1,
        hasMore: startBlock - BigInt(pageSize) > 0n,
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: 0,
  });
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

/**
 * Hook para obtener una transacción específica
 */
export function useTransaction(hash: string | undefined) {
  return useQuery({
    queryKey: ['transaction', hash],
    queryFn: () => HybridClient.getTransaction(hash!),
    enabled: !!hash && hash.startsWith('0x'),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener transacciones recientes
 */
export function useLatestTransactions(limit: number = 10) {
  return useQuery({
    queryKey: ['transactions', 'latest', limit],
    queryFn: () => HybridClient.getLatestTransactions(limit),
    refetchInterval: 12_000,
    staleTime: 10_000,
  });
}

// ============================================================================
// ADDRESSES
// ============================================================================

/**
 * Hook para obtener información de una dirección
 */
export function useAddress(address: string | undefined) {
  return useQuery({
    queryKey: ['address', address],
    queryFn: () => HybridClient.getAddress(address!),
    enabled: !!address && address.startsWith('0x'),
    staleTime: 10_000, // Balance puede cambiar
    refetchInterval: 30_000, // Refetch cada 30s
  });
}

/**
 * Hook para obtener transacciones de una dirección
 */
export function useAddressTransactions(address: string | undefined, limit: number = 20) {
  return useQuery({
    queryKey: ['address', address, 'transactions', limit],
    queryFn: () => HybridClient.getAddressTransactions(address!, limit),
    enabled: !!address && address.startsWith('0x'),
    staleTime: 30_000,
  });
}

/**
 * Hook para transacciones de address con scroll infinito
 */
export function useInfiniteAddressTransactions(address: string | undefined, pageSize: number = 20) {
  return useInfiniteQuery({
    queryKey: ['address', address, 'transactions', 'infinite', pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      if (!address) return { transactions: [], nextCursor: 0, hasMore: false };

      // Por ahora limitado a búsqueda en bloques recientes
      // TODO: Cuando BlockScout esté activo, usar paginación real
      const allTxs = await HybridClient.getAddressTransactions(address, pageSize * (pageParam + 1));
      const start = pageParam * pageSize;
      const end = start + pageSize;
      const transactions = allTxs.slice(start, end);

      return {
        transactions,
        nextCursor: pageParam + 1,
        hasMore: allTxs.length > end,
      };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: 0,
    enabled: !!address && address.startsWith('0x'),
  });
}

// ============================================================================
// STATS
// ============================================================================

/**
 * Hook para estadísticas de red
 */
export function useNetworkStats() {
  return useQuery({
    queryKey: ['stats', 'network'],
    queryFn: HybridClient.getNetworkStats,
    refetchInterval: 30_000, // Actualizar cada 30s
    staleTime: 20_000,
  });
}

/**
 * Hook para número de bloque actual
 */
export function useBlockNumber() {
  return useQuery({
    queryKey: ['blockNumber'],
    queryFn: () => HybridClient.publicClient.getBlockNumber(),
    refetchInterval: 5_000, // Actualizar cada 5s
    staleTime: 3_000,
  });
}

/**
 * Hook para precio de gas
 */
export function useGasPrice() {
  return useQuery({
    queryKey: ['gasPrice'],
    queryFn: () => HybridClient.publicClient.getGasPrice(),
    refetchInterval: 15_000, // Actualizar cada 15s
    staleTime: 10_000,
  });
}

// ============================================================================
// SEARCH
// ============================================================================

/**
 * Hook para búsqueda universal
 */
export function useSearch(query: string | undefined) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => HybridClient.search(query!),
    enabled: !!query && query.length > 2,
    staleTime: 60_000,
  });
}

// ============================================================================
// REAL-TIME (WebSocket)
// ============================================================================

/**
 * Hook para suscribirse a nuevos bloques en tiempo real
 */
export function useWatchBlocks(onBlock?: (block: any) => void) {
  return useQuery({
    queryKey: ['watchBlocks'],
    queryFn: async () => {
      const unwatch = HybridClient.wsClient.watchBlocks({
        onBlock: (block) => {
          if (onBlock) onBlock(block);
        },
        poll: true,
        pollingInterval: 5_000,
      });

      return unwatch;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/**
 * Hook para suscribirse a pending transactions
 */
export function useWatchPendingTransactions(onTransaction?: (tx: string) => void) {
  return useQuery({
    queryKey: ['watchPendingTransactions'],
    queryFn: async () => {
      try {
        const unwatch = HybridClient.wsClient.watchPendingTransactions({
          onTransactions: (txs) => {
            if (onTransaction) {
              txs.forEach(tx => onTransaction(tx));
            }
          },
          poll: true,
          pollingInterval: 3_000,
        });

        return unwatch;
      } catch {
        // Fallback si no hay WebSocket
        return null;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Hook para verificar salud de BlockScout
 */
export function useBlockScoutHealth() {
  return useQuery({
    queryKey: ['blockscout', 'health'],
    queryFn: HybridClient.checkBlockScoutHealth,
    refetchInterval: 30_000,
    staleTime: 20_000,
  });
}

/**
 * Hook para obtener código de contrato
 */
export function useContractCode(address: string | undefined) {
  return useQuery({
    queryKey: ['contract', address, 'code'],
    queryFn: () => HybridClient.publicClient.getCode({ address: address as `0x${string}` }),
    enabled: !!address && address.startsWith('0x'),
    staleTime: 5 * 60 * 1000, // El código de contrato no cambia
  });
}

/**
 * Hook para verificar si es un contrato
 */
export function useIsContract(address: string | undefined) {
  const { data: code } = useContractCode(address);
  return {
    isContract: code !== undefined && code !== '0x',
    code,
  };
}
