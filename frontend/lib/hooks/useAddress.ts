import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { config } from '@/lib/config';

/**
 * Hook to fetch address information
 */
export function useAddress(address: string) {
  return useQuery({
    queryKey: ['address', address],
    queryFn: () => api.getAddress(address),
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    staleTime: config.cache.address,
  });
}

/**
 * Hook to fetch address balance
 */
export function useAddressBalance(address: string) {
  return useQuery({
    queryKey: ['address-balance', address],
    queryFn: () => api.getAddressBalance(address),
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    staleTime: config.cache.address,
  });
}

/**
 * Hook to fetch address transactions
 */
export function useAddressTransactions(
  address: string,
  params?: {
    page?: number;
    filter?: 'to' | 'from';
  }
) {
  return useQuery({
    queryKey: ['address-transactions', address, params],
    queryFn: () => api.getAddressTransactions(address, params),
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    keepPreviousData: true,
    staleTime: config.cache.address,
  });
}

/**
 * Hook to fetch address token transfers
 */
export function useAddressTokenTransfers(
  address: string,
  params?: {
    page?: number;
    type?: string[];
  }
) {
  return useQuery({
    queryKey: ['address-token-transfers', address, params],
    queryFn: () => api.getAddressTokenTransfers(address, params),
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    keepPreviousData: true,
    staleTime: config.cache.address,
  });
}

/**
 * Hook to fetch address tokens
 */
export function useAddressTokens(address: string) {
  return useQuery({
    queryKey: ['address-tokens', address],
    queryFn: () => api.getAddressTokens(address),
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    staleTime: config.cache.address,
  });
}

/**
 * Hook to fetch address counters (transactions, token transfers, gas usage)
 */
export function useAddressCounters(address: string) {
  return useQuery({
    queryKey: ['address-counters', address],
    queryFn: () => api.getAddressCounters(address),
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    staleTime: config.cache.address,
  });
}
