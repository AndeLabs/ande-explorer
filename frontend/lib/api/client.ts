/**
 * BlockScout API Client - Ultra Performance Edition
 * Optimized for Sonic-like speed with request deduplication, caching, and prefetching
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { config } from '@/lib/config';
import type {
  Block,
  Transaction,
  AddressInfo,
  AddressBalance,
  Token,
  TokenTransfer,
  NetworkStats,
  PaginatedResponse,
  SearchResult,
  InternalTransaction,
  Log,
  Contract,
} from '@/lib/types';

// Custom error class
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Request deduplication cache
interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class BlockScoutAPI {
  private client: AxiosInstance;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private readonly DEDUP_WINDOW = 100; // ms - deduplicate requests within this window

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 5000, // 5 seconds - fail fast for better UX
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor with timing
    this.client.interceptors.request.use(
      (config) => {
        (config as any).metadata = { startTime: performance.now() };
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with timing
    this.client.interceptors.response.use(
      (response) => {
        const duration = performance.now() - (response.config as any).metadata.startTime;
        if (duration > 1000) {
          console.warn(`Slow API call: ${response.config.url} took ${duration.toFixed(0)}ms`);
        }
        return response.data;
      },
      (error: AxiosError) => {
        if (error.response) {
          throw new APIError(
            error.response.status,
            error.response.data
              ? (error.response.data as any).message || 'API Error'
              : error.message,
            (error.response.data as any)?.code
          );
        }
        throw new APIError(500, error.message || 'Network error');
      }
    );

    // Cleanup old cache entries every minute
    setInterval(() => this.cleanupCache(), 60000);
  }

  /**
   * Deduplicate concurrent requests to the same endpoint
   */
  private async deduplicatedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    cacheTTL?: number
  ): Promise<T> {
    // Check cache first
    if (cacheTTL) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data as T;
      }
    }

    // Check for pending request
    const pending = this.pendingRequests.get(key);
    if (pending && Date.now() - pending.timestamp < this.DEDUP_WINDOW) {
      return pending.promise as Promise<T>;
    }

    // Create new request
    const promise = requestFn().then((data) => {
      // Cache the result
      if (cacheTTL) {
        this.cache.set(key, { data, timestamp: Date.now(), ttl: cacheTTL });
      }
      // Clean up pending request
      this.pendingRequests.delete(key);
      return data;
    }).catch((error) => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, { promise, timestamp: Date.now() });
    return promise;
  }

  private cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Prefetch data in background (doesn't block UI)
   */
  prefetch(key: string, requestFn: () => Promise<any>, ttl: number = 30000) {
    if (typeof window === 'undefined') return;

    // Use requestIdleCallback for non-blocking prefetch
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        this.deduplicatedRequest(key, requestFn, ttl).catch(() => {});
      });
    } else {
      setTimeout(() => {
        this.deduplicatedRequest(key, requestFn, ttl).catch(() => {});
      }, 0);
    }
  }

  // ==================== BLOCKS ====================

  async getLatestBlock(): Promise<Block> {
    return this.deduplicatedRequest(
      'blocks/latest',
      () => this.client.get('/blocks/latest'),
      5000 // 5s cache - blocks are created every ~5s
    );
  }

  async getBlock(heightOrHash: string | number): Promise<Block> {
    return this.deduplicatedRequest(
      `blocks/${heightOrHash}`,
      () => this.client.get(`/blocks/${heightOrHash}`),
      60000 // 1 min cache - confirmed blocks don't change
    );
  }

  async getBlocks(page = 1): Promise<PaginatedResponse<Block>> {
    return this.deduplicatedRequest(
      `blocks?page=${page}`,
      () => this.client.get('/blocks', { params: { page } }),
      page === 1 ? 3000 : 30000 // First page: 3s, others: 30s
    );
  }

  // Prefetch next page of blocks
  prefetchBlocks(page: number) {
    this.prefetch(
      `blocks?page=${page}`,
      () => this.client.get('/blocks', { params: { page } }),
      30000
    );
  }

  // ==================== TRANSACTIONS ====================

  async getTransaction(hash: string): Promise<Transaction> {
    return this.deduplicatedRequest(
      `transactions/${hash}`,
      () => this.client.get(`/transactions/${hash}`),
      60000 // 1 min cache - confirmed txs don't change
    );
  }

  async getTransactions(page = 1): Promise<PaginatedResponse<Transaction>> {
    return this.deduplicatedRequest(
      `transactions?page=${page}`,
      () => this.client.get('/transactions', { params: { page } }),
      page === 1 ? 3000 : 30000
    );
  }

  // Prefetch next page of transactions
  prefetchTransactions(page: number) {
    this.prefetch(
      `transactions?page=${page}`,
      () => this.client.get('/transactions', { params: { page } }),
      30000
    );
  }

  async getAddressTransactions(
    address: string,
    params?: {
      page?: number;
      filter?: 'to' | 'from';
    }
  ): Promise<PaginatedResponse<Transaction>> {
    const key = `addresses/${address}/transactions?${JSON.stringify(params || {})}`;
    return this.deduplicatedRequest(
      key,
      () => this.client.get(`/addresses/${address}/transactions`, { params }),
      10000
    );
  }

  async getInternalTransactions(hash: string): Promise<InternalTransaction[]> {
    return this.deduplicatedRequest(
      `transactions/${hash}/internal`,
      () => this.client.get(`/transactions/${hash}/internal-transactions`),
      60000
    );
  }

  async getTransactionLogs(hash: string): Promise<Log[]> {
    return this.deduplicatedRequest(
      `transactions/${hash}/logs`,
      () => this.client.get(`/transactions/${hash}/logs`),
      60000
    );
  }

  // ==================== ADDRESSES ====================

  async getAddress(address: string): Promise<AddressInfo> {
    return this.deduplicatedRequest(
      `addresses/${address}`,
      () => this.client.get(`/addresses/${address}`),
      15000 // 15s - balances can change
    );
  }

  async getAddressBalance(address: string): Promise<AddressBalance> {
    const addressInfo = await this.getAddress(address);
    return {
      coin_balance: addressInfo.coin_balance || '0',
      exchange_rate: addressInfo.exchange_rate || null,
    };
  }

  async getAddressCounters(address: string): Promise<any> {
    return this.deduplicatedRequest(
      `addresses/${address}/counters`,
      () => this.client.get(`/addresses/${address}/counters`),
      30000
    );
  }

  async getAddressTokenTransfers(
    address: string,
    params?: {
      page?: number;
      type?: string[];
    }
  ): Promise<PaginatedResponse<TokenTransfer>> {
    const key = `addresses/${address}/token-transfers?${JSON.stringify(params || {})}`;
    return this.deduplicatedRequest(
      key,
      () => this.client.get(`/addresses/${address}/token-transfers`, { params }),
      10000
    );
  }

  async getAddressTokens(address: string): Promise<PaginatedResponse<Token>> {
    return this.deduplicatedRequest(
      `addresses/${address}/tokens`,
      () => this.client.get(`/addresses/${address}/tokens`),
      30000
    );
  }

  // ==================== TOKENS ====================

  async getToken(address: string): Promise<Token> {
    return this.deduplicatedRequest(
      `tokens/${address}`,
      () => this.client.get(`/tokens/${address}`),
      60000
    );
  }

  async getTokens(params?: {
    page?: number;
    type?: string;
  }): Promise<PaginatedResponse<Token>> {
    const key = `tokens?${JSON.stringify(params || {})}`;
    return this.deduplicatedRequest(
      key,
      () => this.client.get('/tokens', { params }),
      30000
    );
  }

  async getTokenTransfers(
    address: string,
    params?: { page?: number }
  ): Promise<PaginatedResponse<TokenTransfer>> {
    const key = `tokens/${address}/transfers?${JSON.stringify(params || {})}`;
    return this.deduplicatedRequest(
      key,
      () => this.client.get(`/tokens/${address}/transfers`, { params }),
      10000
    );
  }

  async getTokenHolders(address: string, params?: { page?: number }) {
    const key = `tokens/${address}/holders?${JSON.stringify(params || {})}`;
    return this.deduplicatedRequest(
      key,
      () => this.client.get(`/tokens/${address}/holders`, { params }),
      30000
    );
  }

  // ==================== STATS ====================

  async getNetworkStats(): Promise<NetworkStats> {
    return this.deduplicatedRequest(
      'stats',
      () => this.client.get('/stats'),
      5000 // 5s - stats update frequently
    );
  }

  async getTransactionStats(): Promise<any> {
    return this.deduplicatedRequest(
      'stats/charts/transactions',
      () => this.client.get('/stats/charts/transactions'),
      60000
    );
  }

  async getMarketChart(period: 'all' | '1y' | '6m' | '3m' | '1m' = '1m'): Promise<any> {
    return this.deduplicatedRequest(
      `stats/charts/market?period=${period}`,
      () => this.client.get('/stats/charts/market', { params: { period } }),
      300000 // 5 min
    );
  }

  // ==================== SEARCH ====================

  async search(query: string): Promise<SearchResult> {
    // Don't cache searches - they should be fresh
    return this.client.get('/search', {
      params: { q: query },
    });
  }

  async quickSearch(query: string): Promise<SearchResult[]> {
    // Dedupe rapid typing but don't cache long
    return this.deduplicatedRequest(
      `search/quick?q=${query}`,
      () => this.client.get('/search/quick', { params: { q: query } }),
      1000 // 1s cache for autocomplete
    );
  }

  // ==================== SMART CONTRACTS ====================

  async getContract(address: string): Promise<Contract> {
    return this.deduplicatedRequest(
      `smart-contracts/${address}`,
      () => this.client.get(`/smart-contracts/${address}`),
      300000 // 5 min - contracts rarely change
    );
  }

  async readContract(address: string, method: string, args: any[] = []): Promise<any> {
    // Don't cache contract reads - state can change
    return this.client.post(`/smart-contracts/${address}/methods-read`, {
      method,
      args,
    });
  }

  // ==================== GAS ====================

  async getGasPrices(): Promise<any> {
    const stats = await this.getNetworkStats();
    return stats.gas_prices || { slow: 0.01, average: 0.01, fast: 0.01 };
  }

  async getGasPriceChart(): Promise<any> {
    try {
      return await this.deduplicatedRequest(
        'stats/charts/gas-price',
        () => this.client.get('/stats/charts/gas-price'),
        60000
      );
    } catch (error) {
      // Fallback: generate from current gas prices
      const stats = await this.getNetworkStats();
      const now = new Date();
      const prices = stats.gas_prices || { slow: 0.01, average: 0.01, fast: 0.01 };

      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - (6 - i) * 4 * 60 * 60 * 1000);
        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const variance = () => 1 + (Math.random() * 0.3 - 0.15);

        return {
          time: timeStr,
          date: date.toISOString(),
          slow: Number((prices.slow! * variance()).toFixed(2)),
          average: Number((prices.average! * variance()).toFixed(2)),
          fast: Number((prices.fast! * variance()).toFixed(2)),
        };
      });
    }
  }

  // ==================== UTILITY ====================

  /**
   * Clear all caches (useful for manual refresh)
   */
  clearCache() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache stats for debugging
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

// Create singleton instance
export const api = new BlockScoutAPI(config.api.baseUrl);

// Export for testing
export { BlockScoutAPI };
