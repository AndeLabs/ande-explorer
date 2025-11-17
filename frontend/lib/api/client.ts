/**
 * BlockScout API Client
 * Handles all API communication with BlockScout backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
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

class BlockScoutAPI {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000, // 10 segundos (antes: 30s) - fail fast
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br', // Compression
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
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
  }

  // ==================== BLOCKS ====================

  /**
   * Get latest block
   */
  async getLatestBlock(): Promise<Block> {
    return this.client.get('/v2/blocks/latest');
  }

  /**
   * Get block by height or hash
   */
  async getBlock(heightOrHash: string | number): Promise<Block> {
    return this.client.get(`/v2/blocks/${heightOrHash}`);
  }

  /**
   * Get list of blocks
   */
  async getBlocks(page = 1): Promise<PaginatedResponse<Block>> {
    return this.client.get('/v2/blocks', {
      params: { page },
    });
  }

  // ==================== TRANSACTIONS ====================

  /**
   * Get transaction by hash
   */
  async getTransaction(hash: string): Promise<Transaction> {
    return this.client.get(`/v2/transactions/${hash}`);
  }

  /**
   * Get list of transactions
   */
  async getTransactions(page = 1): Promise<PaginatedResponse<Transaction>> {
    return this.client.get('/v2/transactions', {
      params: { page },
    });
  }

  /**
   * Get transactions for an address
   */
  async getAddressTransactions(
    address: string,
    params?: {
      page?: number;
      filter?: 'to' | 'from';
    }
  ): Promise<PaginatedResponse<Transaction>> {
    return this.client.get(`/v2/addresses/${address}/transactions`, {
      params,
    });
  }

  /**
   * Get internal transactions for a transaction
   */
  async getInternalTransactions(hash: string): Promise<InternalTransaction[]> {
    return this.client.get(`/v2/transactions/${hash}/internal-transactions`);
  }

  /**
   * Get logs for a transaction
   */
  async getTransactionLogs(hash: string): Promise<Log[]> {
    return this.client.get(`/v2/transactions/${hash}/logs`);
  }

  // ==================== ADDRESSES ====================

  /**
   * Get address info
   */
  async getAddress(address: string): Promise<AddressInfo> {
    return this.client.get(`/v2/addresses/${address}`);
  }

  /**
   * Get address balance
   */
  async getAddressBalance(address: string): Promise<AddressBalance> {
    return this.client.get(`/v2/addresses/${address}/counters`);
  }

  /**
   * Get token transfers for an address
   */
  async getAddressTokenTransfers(
    address: string,
    params?: {
      page?: number;
      type?: string[];
    }
  ): Promise<PaginatedResponse<TokenTransfer>> {
    return this.client.get(`/v2/addresses/${address}/token-transfers`, {
      params,
    });
  }

  /**
   * Get tokens for an address
   */
  async getAddressTokens(address: string): Promise<PaginatedResponse<Token>> {
    return this.client.get(`/v2/addresses/${address}/tokens`);
  }

  // ==================== TOKENS ====================

  /**
   * Get token info
   */
  async getToken(address: string): Promise<Token> {
    return this.client.get(`/v2/tokens/${address}`);
  }

  /**
   * Get list of tokens
   */
  async getTokens(params?: {
    page?: number;
    type?: string;
  }): Promise<PaginatedResponse<Token>> {
    return this.client.get('/v2/tokens', { params });
  }

  /**
   * Get token transfers
   */
  async getTokenTransfers(
    address: string,
    params?: { page?: number }
  ): Promise<PaginatedResponse<TokenTransfer>> {
    return this.client.get(`/v2/tokens/${address}/transfers`, { params });
  }

  /**
   * Get token holders
   */
  async getTokenHolders(address: string, params?: { page?: number }) {
    return this.client.get(`/v2/tokens/${address}/holders`, { params });
  }

  // ==================== STATS ====================

  /**
   * Get network stats
   */
  async getNetworkStats(): Promise<NetworkStats> {
    return this.client.get('/v2/stats');
  }

  /**
   * Get transaction stats
   */
  async getTransactionStats(): Promise<any> {
    return this.client.get('/v2/stats/charts/transactions');
  }

  /**
   * Get market chart data
   */
  async getMarketChart(period: 'all' | '1y' | '6m' | '3m' | '1m' = '1m'): Promise<any> {
    return this.client.get('/v2/stats/charts/market', {
      params: { period },
    });
  }

  // ==================== SEARCH ====================

  /**
   * Search by query
   */
  async search(query: string): Promise<SearchResult> {
    return this.client.get('/v2/search', {
      params: { q: query },
    });
  }

  /**
   * Quick search (for autocomplete)
   */
  async quickSearch(query: string): Promise<SearchResult[]> {
    return this.client.get('/v2/search/quick', {
      params: { q: query },
    });
  }

  // ==================== SMART CONTRACTS ====================

  /**
   * Get contract info
   */
  async getContract(address: string): Promise<Contract> {
    return this.client.get(`/v2/smart-contracts/${address}`);
  }

  /**
   * Read contract method
   */
  async readContract(address: string, method: string, args: any[] = []): Promise<any> {
    return this.client.post(`/v2/smart-contracts/${address}/methods-read`, {
      method,
      args,
    });
  }

  // ==================== GAS ====================

  /**
   * Get gas prices
   */
  async getGasPrices(): Promise<any> {
    return this.client.get('/v2/stats/gas-prices');
  }
}

// Create singleton instance
export const api = new BlockScoutAPI(config.api.baseUrl);

// Export for testing
export { BlockScoutAPI };
