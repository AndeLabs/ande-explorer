/**
 * Network Information Hook
 *
 * Combines static network configuration with dynamic blockchain data.
 * Provides a unified interface for network information across components.
 */

import { useBlockScoutStats } from './useBlockScoutStats';
import { NETWORK_CONFIG, hasPriceData, hasMarketCapData } from '@/lib/config/network';

export interface NetworkInfo {
  // Static configuration
  network: typeof NETWORK_CONFIG;

  // Dynamic stats from blockchain
  stats: {
    totalBlocks?: string;
    totalAddresses?: string;
    totalTransactions?: string;
    avgBlockTime?: number;
    gasUsedToday?: string;
    transactionsToday?: string;
    networkUtilization?: number;
  };

  // Price data (when available)
  price?: {
    usd?: string | null;
    changePercentage?: number | null;
    hasPriceData: boolean;
  };

  // Market data (when available)
  market?: {
    cap?: string | null;
    hasMarketCapData: boolean;
  };

  // Loading states
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
}

/**
 * Hook to access complete network information
 * Combines configuration with real-time blockchain data
 */
export function useNetworkInfo(): NetworkInfo {
  const { data: stats, isLoading, error, isFetching } = useBlockScoutStats();

  return {
    network: NETWORK_CONFIG,

    stats: {
      totalBlocks: stats?.total_blocks,
      totalAddresses: stats?.total_addresses,
      totalTransactions: stats?.total_transactions,
      avgBlockTime: stats?.average_block_time,
      gasUsedToday: stats?.gas_used_today,
      transactionsToday: stats?.transactions_today,
      networkUtilization: stats?.network_utilization_percentage,
    },

    price: {
      usd: stats?.coin_price,
      changePercentage: stats?.coin_price_change_percentage,
      hasPriceData: hasPriceData(stats?.coin_price),
    },

    market: {
      cap: stats?.market_cap,
      hasMarketCapData: hasMarketCapData(stats?.market_cap),
    },

    isLoading,
    error,
    isFetching,
  };
}

/**
 * Helper hook for just network config (no API calls)
 */
export function useNetworkConfig() {
  return NETWORK_CONFIG;
}
