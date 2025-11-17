/**
 * Application configuration
 * Centralized configuration for the entire app
 */

export const config = {
  // Chain configuration
  chain: {
    id: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 6174,
    name: process.env.NEXT_PUBLIC_CHAIN_NAME || 'Ande Chain',
    currency: process.env.NEXT_PUBLIC_NETWORK_CURRENCY || 'ANDE',
    decimals: Number(process.env.NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS) || 18,
    isL2: process.env.NEXT_PUBLIC_IS_L2_NETWORK === 'true',
  },

  // API endpoints
  api: {
    // BlockScout API base URL (client adds /v2/... paths)
    baseUrl: process.env.NEXT_PUBLIC_API_HOST || 'https://api.ande.network',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'wss://ws.ande.network',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.ande.network',
  },

  // Explorer URLs
  explorer: {
    main: process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://explorer.ande.network',
    advanced:
      process.env.NEXT_PUBLIC_ADVANCED_EXPLORER_URL || 'https://explorer.ande.network',
  },

  // Features
  features: {
    showGasTracker: process.env.NEXT_PUBLIC_SHOW_GAS_TRACKER === 'true',
    enableWebSockets: process.env.NEXT_PUBLIC_ENABLE_WEBSOCKETS === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },

  // App info
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'ANDE Explorer',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
    description:
      process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Professional Blockchain Explorer for Ande Chain',
  },

  // Theme
  theme: {
    default: (process.env.NEXT_PUBLIC_DEFAULT_THEME || 'light') as 'light' | 'dark' | 'system',
  },

  // Pagination
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // Cache times (in milliseconds)
  // Optimized for performance - bloques confirmados no cambian!
  cache: {
    blocks: 60_000, // 1 minuto - bloques confirmados son inmutables
    transactions: 60_000, // 1 minuto - TX confirmadas son inmutables
    address: 5 * 60_000, // 5 minutos - balances cambian poco
    stats: 30_000, // 30 segundos - stats agregadas
    gasPrice: 10_000, // 10 segundos - gas price más estable
  },

  // Refresh intervals (in milliseconds)
  refresh: {
    stats: 5_000, // 5 seconds - faster updates
    latestBlocks: 5_000, // 5 seconds - faster than block time
    gasPrice: 5_000, // 5 seconds - faster updates
  },

  // Social links (optional)
  social: {
    twitter: 'https://twitter.com/andechain',
    discord: 'https://discord.gg/andechain',
    github: 'https://github.com/AndeLabs',
    docs: 'https://docs.ande.network',
  },
} as const;

// Type-safe config access
export type Config = typeof config;
