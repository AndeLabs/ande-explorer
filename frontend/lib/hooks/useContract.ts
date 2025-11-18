import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { config } from '@/lib/config';

/**
 * Hook to fetch contract verification data
 */
export function useContract(address: string) {
  return useQuery({
    queryKey: ['contract', address],
    queryFn: () => api.getContract(address),
    enabled: !!address && address.startsWith('0x') && address.length === 42,
    staleTime: Infinity, // Contract verification is immutable
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1, // Only retry once if contract not verified
  });
}
