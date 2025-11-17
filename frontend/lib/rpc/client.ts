/**
 * Direct RPC Client for ANDE Chain
 * Connects directly to the ANDE Chain node using viem
 * No BlockScout backend required
 */

import { createPublicClient, http, webSocket, formatEther, formatGwei } from 'viem';
import { defineChain } from 'viem';
import { config } from '@/lib/config';

/**
 * ANDE Chain definition
 */
export const andeChain = defineChain({
  id: config.chain.id,
  name: config.chain.name,
  nativeCurrency: {
    decimals: config.chain.decimals,
    name: config.chain.currency,
    symbol: config.chain.currency,
  },
  rpcUrls: {
    default: {
      http: [config.api.rpcUrl],
      webSocket: config.api.wsUrl ? [config.api.wsUrl] : undefined,
    },
    public: {
      http: [config.api.rpcUrl],
      webSocket: config.api.wsUrl ? [config.api.wsUrl] : undefined,
    },
  },
  blockExplorers: {
    default: {
      name: 'ANDE Explorer',
      url: config.explorer.main,
    },
  },
  testnet: false,
});

/**
 * HTTP Public Client
 */
export const publicClient = createPublicClient({
  chain: andeChain,
  transport: http(config.api.rpcUrl, {
    timeout: 30_000,
    retryCount: 3,
    retryDelay: 1000,
  }),
  batch: {
    multicall: true,
  },
  cacheTime: 4_000, // 4 seconds
});

/**
 * WebSocket Public Client (if enabled)
 */
export const wsClient = config.api.wsUrl
  ? createPublicClient({
      chain: andeChain,
      transport: webSocket(config.api.wsUrl, {
        timeout: 30_000,
        retryCount: 3,
        retryDelay: 1000,
      }),
    })
  : null;

/**
 * RPC Client Interface
 * Provides high-level methods for blockchain data
 */
export class AndeRPCClient {
  private client = publicClient;
  private wsClient = wsClient;

  /**
   * Get latest block number
   */
  async getBlockNumber(): Promise<bigint> {
    return this.client.getBlockNumber();
  }

  /**
   * Get block by number or hash
   */
  async getBlock(blockHashOrNumber: bigint | string | 'latest' | 'earliest' | 'pending') {
    const blockNumberOrTag = typeof blockHashOrNumber === 'string' && blockHashOrNumber.startsWith('0x')
      ? undefined
      : (blockHashOrNumber as any);
    
    const blockHash = typeof blockHashOrNumber === 'string' && blockHashOrNumber.startsWith('0x')
      ? (blockHashOrNumber as `0x${string}`)
      : undefined;

    return this.client.getBlock({
      blockNumber: blockNumberOrTag,
      blockHash: blockHash,
      includeTransactions: true,
    });
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(hash: `0x${string}`) {
    return this.client.getTransaction({ hash });
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(hash: `0x${string}`) {
    return this.client.getTransactionReceipt({ hash });
  }

  /**
   * Get balance of address
   */
  async getBalance(address: `0x${string}`) {
    const balance = await this.client.getBalance({ address });
    return {
      value: balance,
      formatted: formatEther(balance),
    };
  }

  /**
   * Get transaction count (nonce) for address
   */
  async getTransactionCount(address: `0x${string}`) {
    return this.client.getTransactionCount({ address });
  }

  /**
   * Get code at address (for contracts)
   */
  async getCode(address: `0x${string}`) {
    return this.client.getCode({ address });
  }

  /**
   * Get storage at address
   */
  async getStorageAt(address: `0x${string}`, slot: `0x${string}`) {
    return this.client.getStorageAt({ address, slot });
  }

  /**
   * Get gas price
   */
  async getGasPrice() {
    const gasPrice = await this.client.getGasPrice();
    return {
      value: gasPrice,
      formatted: formatGwei(gasPrice),
    };
  }

  /**
   * Get fee history
   */
  async getFeeHistory(blockCount: number, newestBlock: 'latest' | 'earliest' | 'pending' = 'latest') {
    return this.client.getFeeHistory({
      blockCount,
      blockTag: newestBlock,
      rewardPercentiles: [25, 50, 75],
    });
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(params: {
    account?: `0x${string}`;
    to?: `0x${string}`;
    data?: `0x${string}`;
    value?: bigint;
  }) {
    return this.client.estimateGas(params);
  }

  /**
   * Call contract method (read-only)
   */
  async call(params: {
    account?: `0x${string}`;
    to: `0x${string}`;
    data: `0x${string}`;
    value?: bigint;
  }) {
    return this.client.call(params);
  }

  /**
   * Get logs
   */
  async getLogs(params: {
    address?: `0x${string}` | `0x${string}`[];
    event?: any;
    args?: any;
    fromBlock?: bigint | 'latest' | 'earliest' | 'pending';
    toBlock?: bigint | 'latest' | 'earliest' | 'pending';
  }) {
    return this.client.getLogs(params as any);
  }

  /**
   * Watch for new blocks (requires WebSocket)
   */
  watchBlocks(callback: (block: any) => void) {
    if (!this.wsClient) {
      throw new Error('WebSocket client not available');
    }
    return this.wsClient.watchBlocks({
      onBlock: callback,
      includeTransactions: true,
    });
  }

  /**
   * Watch for new pending transactions (requires WebSocket)
   */
  watchPendingTransactions(callback: (hash: `0x${string}`) => void) {
    if (!this.wsClient) {
      throw new Error('WebSocket client not available');
    }
    return this.wsClient.watchPendingTransactions({
      onTransactions: callback,
    });
  }

  /**
   * Batch multiple RPC calls
   */
  async batch<T extends any[]>(calls: (() => Promise<any>)[]): Promise<T> {
    return Promise.all(calls.map(call => call())) as Promise<T>;
  }
}

/**
 * Export singleton instance
 */
export const rpcClient = new AndeRPCClient();

/**
 * Export viem clients for advanced usage
 */
export { publicClient as viemClient, wsClient as viemWsClient };
