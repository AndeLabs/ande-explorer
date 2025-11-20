/**
 * Centralized Network Configuration
 *
 * Single source of truth for network metadata and features.
 * Configuration is driven by environment variables for scalability.
 */

export interface NetworkConfig {
  name: string;
  shortName?: string;
  chainId: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  links: {
    rpc?: string;
    faucet?: string;
    docs?: string;
    website?: string;
    github?: string;
  };
  features: {
    showPrice: boolean;
    showMarketCap: boolean;
    showAbout: boolean;
    showNetworkInfo: boolean;
  };
  about?: string;
  type: 'mainnet' | 'testnet';
}

/**
 * Network configuration loaded from environment variables
 * All values are configurable without code changes
 */
export const NETWORK_CONFIG: NetworkConfig = {
  // Basic network info
  name: process.env.NEXT_PUBLIC_NETWORK_NAME || 'ANDE Network',
  shortName: process.env.NEXT_PUBLIC_NETWORK_SHORT_NAME,
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || '6174',

  // Currency info
  currency: {
    name: process.env.NEXT_PUBLIC_NETWORK_CURRENCY_NAME || 'ANDE',
    symbol: process.env.NEXT_PUBLIC_NETWORK_CURRENCY_SYMBOL || 'ANDE',
    decimals: parseInt(process.env.NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS || '18'),
  },

  // External links
  links: {
    rpc: process.env.NEXT_PUBLIC_RPC_URL,
    faucet: process.env.NEXT_PUBLIC_FAUCET_URL,
    docs: process.env.NEXT_PUBLIC_DOCS_URL,
    website: process.env.NEXT_PUBLIC_WEBSITE_URL,
    github: process.env.NEXT_PUBLIC_GITHUB_URL,
  },

  // Feature flags (enable/disable sections without code changes)
  features: {
    showPrice: process.env.NEXT_PUBLIC_SHOW_COIN_PRICE === 'true',
    showMarketCap: process.env.NEXT_PUBLIC_SHOW_MARKET_CAP === 'true',
    showAbout: process.env.NEXT_PUBLIC_SHOW_NETWORK_ABOUT === 'true',
    showNetworkInfo: process.env.NEXT_PUBLIC_SHOW_NETWORK_INFO !== 'false', // default true
  },

  // Network description
  about: process.env.NEXT_PUBLIC_NETWORK_DESCRIPTION,

  // Network type
  type: process.env.NEXT_PUBLIC_IS_TESTNET === 'true' ? 'testnet' : 'mainnet',
} as const;

/**
 * Helper to check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof NetworkConfig['features']): boolean => {
  return NETWORK_CONFIG.features[feature];
};

/**
 * Helper to get formatted chain name
 */
export const getChainDisplayName = (): string => {
  return NETWORK_CONFIG.shortName || NETWORK_CONFIG.name;
};

/**
 * Helper to check if price data is available
 */
export const hasPriceData = (coinPrice?: string | null): boolean => {
  return Boolean(coinPrice && parseFloat(coinPrice) > 0);
};

/**
 * Helper to check if market cap data is available
 */
export const hasMarketCapData = (marketCap?: string | null): boolean => {
  return Boolean(marketCap && parseFloat(marketCap) > 0);
};
