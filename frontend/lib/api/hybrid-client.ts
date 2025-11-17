/**
 * Hybrid API Client - ANDE Explorer
 *
 * Sistema híbrido que usa:
 * - RPC directo para datos en tiempo real
 * - BlockScout API cuando esté disponible para datos indexados
 * - Fallback automático entre ambos
 */

import { createPublicClient, http, webSocket, formatEther } from 'viem';
import * as BlockScoutAPI from './blockscout';

// Configuración
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8546';
const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '6174');

// Cliente RPC HTTP
export const publicClient = createPublicClient({
  chain: {
    id: CHAIN_ID,
    name: 'ANDE Chain',
    network: 'ande',
    nativeCurrency: {
      decimals: 18,
      name: 'ANDE',
      symbol: 'ANDE',
    },
    rpcUrls: {
      default: { http: [RPC_URL] },
      public: { http: [RPC_URL] },
    },
  },
  transport: http(RPC_URL, {
    timeout: 30_000,
    retryCount: 3,
    retryDelay: 1000,
  }),
  batch: {
    multicall: true,
  },
});

// Cliente WebSocket para tiempo real
export const wsClient = createPublicClient({
  chain: {
    id: CHAIN_ID,
    name: 'ANDE Chain',
    network: 'ande',
    nativeCurrency: {
      decimals: 18,
      name: 'ANDE',
      symbol: 'ANDE',
    },
    rpcUrls: {
      default: { http: [RPC_URL], webSocket: [WS_URL] },
      public: { http: [RPC_URL], webSocket: [WS_URL] },
    },
  },
  transport: webSocket(WS_URL),
});

// ============================================================================
// TYPES
// ============================================================================

export interface HybridBlock {
  number: bigint;
  hash: string;
  timestamp: bigint;
  parentHash: string;
  miner: string;
  gasUsed: bigint;
  gasLimit: bigint;
  baseFeePerGas?: bigint;
  transactions: string[] | any[];
  transactionCount: number;
  size: bigint;
  difficulty: bigint;
  totalDifficulty?: bigint;
  nonce?: string;
  extraData: string;
}

export interface HybridTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: bigint;
  gas: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  input: string;
  nonce: number;
  blockNumber: bigint;
  blockHash: string;
  transactionIndex: number;
  type: string;
  status?: 'success' | 'failed';
  gasUsed?: bigint;
  effectiveGasPrice?: bigint;
  cumulativeGasUsed?: bigint;
  contractAddress?: string | null;
  logs?: any[];
  timestamp?: bigint;
}

export interface HybridAddress {
  address: string;
  balance: bigint;
  balanceFormatted: string;
  transactionCount: number;
  isContract: boolean;
  contractCode?: string;
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

let blockscoutAvailable = false;

export async function checkBlockScoutHealth(): Promise<boolean> {
  try {
    const result = await BlockScoutAPI.healthCheck();
    blockscoutAvailable = result.healthy;
    return result.healthy;
  } catch {
    blockscoutAvailable = false;
    return false;
  }
}

// Check health every 30 seconds
if (typeof window !== 'undefined') {
  setInterval(checkBlockScoutHealth, 30000);
  checkBlockScoutHealth(); // Initial check
}

// ============================================================================
// BLOCKS
// ============================================================================

/**
 * Obtener bloque por número o hash
 * Intenta BlockScout primero, fallback a RPC
 */
export async function getBlock(blockNumberOrHash: bigint | string): Promise<HybridBlock> {
  try {
    // Intentar BlockScout si está disponible
    if (blockscoutAvailable && typeof blockNumberOrHash === 'number') {
      const blockScoutData = await BlockScoutAPI.getBlock(blockNumberOrHash);
      return {
        number: BigInt(blockScoutData.height),
        hash: blockScoutData.hash,
        timestamp: BigInt(new Date(blockScoutData.timestamp).getTime() / 1000),
        parentHash: blockScoutData.parent_hash,
        miner: blockScoutData.miner.hash,
        gasUsed: BigInt(blockScoutData.gas_used),
        gasLimit: BigInt(blockScoutData.gas_limit),
        baseFeePerGas: BigInt(blockScoutData.base_fee_per_gas || 0),
        transactions: [], // Se cargan por separado
        transactionCount: blockScoutData.tx_count,
        size: BigInt(blockScoutData.size),
        difficulty: BigInt(blockScoutData.difficulty),
        nonce: blockScoutData.nonce,
        extraData: blockScoutData.extra_data,
      };
    }
  } catch (error) {
    console.warn('BlockScout getBlock failed, using RPC:', error);
  }

  // Fallback a RPC
  const block = await publicClient.getBlock({
    blockNumber: typeof blockNumberOrHash === 'bigint' ? blockNumberOrHash : undefined,
    blockHash: typeof blockNumberOrHash === 'string' ? blockNumberOrHash as `0x${string}` : undefined,
    includeTransactions: false,
  });

  return {
    number: block.number!,
    hash: block.hash!,
    timestamp: block.timestamp,
    parentHash: block.parentHash,
    miner: block.miner!,
    gasUsed: block.gasUsed,
    gasLimit: block.gasLimit,
    baseFeePerGas: block.baseFeePerGas,
    transactions: block.transactions as string[],
    transactionCount: block.transactions.length,
    size: block.size,
    difficulty: block.difficulty,
    totalDifficulty: block.totalDifficulty,
    nonce: block.nonce || undefined,
    extraData: block.extraData,
  };
}

/**
 * Obtener bloques recientes
 */
export async function getLatestBlocks(limit: number = 10): Promise<HybridBlock[]> {
  try {
    // Intentar BlockScout si está disponible
    if (blockscoutAvailable) {
      const data = await BlockScoutAPI.getBlocks({ limit });
      return data.items.map(block => ({
        number: BigInt(block.height),
        hash: block.hash,
        timestamp: BigInt(new Date(block.timestamp).getTime() / 1000),
        parentHash: block.parent_hash,
        miner: block.miner.hash,
        gasUsed: BigInt(block.gas_used),
        gasLimit: BigInt(block.gas_limit),
        baseFeePerGas: BigInt(block.base_fee_per_gas || 0),
        transactions: [],
        transactionCount: block.tx_count,
        size: BigInt(block.size),
        difficulty: BigInt(block.difficulty),
        nonce: block.nonce,
        extraData: block.extra_data,
      }));
    }
  } catch (error) {
    console.warn('BlockScout getLatestBlocks failed, using RPC:', error);
  }

  // Fallback a RPC
  const latestBlockNumber = await publicClient.getBlockNumber();
  const blocks: HybridBlock[] = [];

  for (let i = 0; i < limit; i++) {
    const blockNumber = latestBlockNumber - BigInt(i);
    if (blockNumber < 0n) break;

    const block = await getBlock(blockNumber);
    blocks.push(block);
  }

  return blocks;
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

/**
 * Obtener transacción por hash
 */
export async function getTransaction(hash: string): Promise<HybridTransaction> {
  try {
    // Intentar BlockScout si está disponible
    if (blockscoutAvailable) {
      const tx = await BlockScoutAPI.getTransaction(hash);
      return {
        hash: tx.hash,
        from: tx.from.hash,
        to: tx.to?.hash || null,
        value: BigInt(tx.value),
        gas: BigInt(tx.gas_limit),
        gasPrice: BigInt(tx.gas_price),
        maxFeePerGas: BigInt(tx.max_fee_per_gas || 0),
        maxPriorityFeePerGas: BigInt(tx.max_priority_fee_per_gas || 0),
        input: tx.raw_input,
        nonce: tx.nonce,
        blockNumber: BigInt(tx.block),
        blockHash: '', // No disponible en respuesta
        transactionIndex: tx.position,
        type: String(tx.type),
        status: tx.status === 'ok' ? 'success' : 'failed',
        gasUsed: BigInt(tx.gas_used || 0),
        timestamp: BigInt(new Date(tx.timestamp).getTime() / 1000),
      };
    }
  } catch (error) {
    console.warn('BlockScout getTransaction failed, using RPC:', error);
  }

  // Fallback a RPC
  const tx = await publicClient.getTransaction({ hash: hash as `0x${string}` });
  const receipt = await publicClient.getTransactionReceipt({ hash: hash as `0x${string}` });

  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    gas: tx.gas,
    gasPrice: tx.gasPrice!,
    maxFeePerGas: tx.maxFeePerGas,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
    input: tx.input,
    nonce: tx.nonce,
    blockNumber: tx.blockNumber!,
    blockHash: tx.blockHash!,
    transactionIndex: tx.transactionIndex!,
    type: tx.type,
    status: receipt.status === 'success' ? 'success' : 'failed',
    gasUsed: receipt.gasUsed,
    effectiveGasPrice: receipt.effectiveGasPrice,
    cumulativeGasUsed: receipt.cumulativeGasUsed,
    contractAddress: receipt.contractAddress,
    logs: receipt.logs,
  };
}

/**
 * Obtener transacciones recientes
 */
export async function getLatestTransactions(limit: number = 10): Promise<HybridTransaction[]> {
  try {
    // Intentar BlockScout si está disponible
    if (blockscoutAvailable) {
      const data = await BlockScoutAPI.getTransactions({ limit });
      return data.items.map(tx => ({
        hash: tx.hash,
        from: tx.from.hash,
        to: tx.to?.hash || null,
        value: BigInt(tx.value),
        gas: BigInt(tx.gas_limit),
        gasPrice: BigInt(tx.gas_price),
        maxFeePerGas: BigInt(tx.max_fee_per_gas || 0),
        maxPriorityFeePerGas: BigInt(tx.max_priority_fee_per_gas || 0),
        input: tx.raw_input,
        nonce: tx.nonce,
        blockNumber: BigInt(tx.block),
        blockHash: '',
        transactionIndex: tx.position,
        type: String(tx.type),
        status: tx.status === 'ok' ? 'success' : 'failed',
        gasUsed: BigInt(tx.gas_used || 0),
        timestamp: BigInt(new Date(tx.timestamp).getTime() / 1000),
      }));
    }
  } catch (error) {
    console.warn('BlockScout getLatestTransactions failed, using RPC:', error);
  }

  // Fallback a RPC - obtener transacciones de bloques recientes
  const latestBlocks = await getLatestBlocks(5);
  const transactions: HybridTransaction[] = [];

  for (const block of latestBlocks) {
    const fullBlock = await publicClient.getBlock({
      blockNumber: block.number,
      includeTransactions: true,
    });

    const blockTxs = (fullBlock.transactions as any[]).slice(0, Math.ceil(limit / 5));

    for (const tx of blockTxs) {
      if (transactions.length >= limit) break;

      transactions.push({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        gas: tx.gas,
        gasPrice: tx.gasPrice || 0n,
        input: tx.input,
        nonce: tx.nonce,
        blockNumber: tx.blockNumber!,
        blockHash: tx.blockHash!,
        transactionIndex: tx.transactionIndex!,
        type: tx.type,
        timestamp: block.timestamp,
      });
    }

    if (transactions.length >= limit) break;
  }

  return transactions.slice(0, limit);
}

// ============================================================================
// ADDRESSES
// ============================================================================

/**
 * Obtener información de una dirección
 */
export async function getAddress(address: string): Promise<HybridAddress> {
  // Obtener balance desde RPC (siempre actualizado)
  const balance = await publicClient.getBalance({ address: address as `0x${string}` });
  const code = await publicClient.getCode({ address: address as `0x${string}` });
  const txCount = await publicClient.getTransactionCount({ address: address as `0x${string}` });

  return {
    address,
    balance,
    balanceFormatted: formatEther(balance),
    transactionCount: txCount,
    isContract: code !== undefined && code !== '0x',
    contractCode: code,
  };
}

/**
 * Obtener transacciones de una dirección
 */
export async function getAddressTransactions(
  address: string,
  limit: number = 20
): Promise<HybridTransaction[]> {
  try {
    // Intentar BlockScout si está disponible
    if (blockscoutAvailable) {
      const data = await BlockScoutAPI.getAddressTransactions(address, { limit });
      return data.items.map(tx => ({
        hash: tx.hash,
        from: tx.from.hash,
        to: tx.to?.hash || null,
        value: BigInt(tx.value),
        gas: BigInt(tx.gas_limit),
        gasPrice: BigInt(tx.gas_price),
        input: tx.raw_input,
        nonce: tx.nonce,
        blockNumber: BigInt(tx.block),
        blockHash: '',
        transactionIndex: tx.position,
        type: String(tx.type),
        status: tx.status === 'ok' ? 'success' : 'failed',
        gasUsed: BigInt(tx.gas_used || 0),
        timestamp: BigInt(new Date(tx.timestamp).getTime() / 1000),
      }));
    }
  } catch (error) {
    console.warn('BlockScout getAddressTransactions failed, using RPC fallback:', error);
  }

  // Fallback: buscar en bloques recientes (limitado)
  const latestBlocks = await getLatestBlocks(50);
  const transactions: HybridTransaction[] = [];

  for (const block of latestBlocks) {
    const fullBlock = await publicClient.getBlock({
      blockNumber: block.number,
      includeTransactions: true,
    });

    for (const tx of fullBlock.transactions as any[]) {
      if (tx.from.toLowerCase() === address.toLowerCase() ||
          tx.to?.toLowerCase() === address.toLowerCase()) {
        transactions.push({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          gas: tx.gas,
          gasPrice: tx.gasPrice || 0n,
          input: tx.input,
          nonce: tx.nonce,
          blockNumber: tx.blockNumber!,
          blockHash: tx.blockHash!,
          transactionIndex: tx.transactionIndex!,
          type: tx.type,
          timestamp: block.timestamp,
        });

        if (transactions.length >= limit) break;
      }
    }

    if (transactions.length >= limit) break;
  }

  return transactions;
}

// ============================================================================
// STATS
// ============================================================================

export async function getNetworkStats() {
  try {
    if (blockscoutAvailable) {
      return await BlockScoutAPI.getStats();
    }
  } catch (error) {
    console.warn('BlockScout getStats failed, using RPC:', error);
  }

  // Fallback a RPC
  const [blockNumber, gasPrice] = await Promise.all([
    publicClient.getBlockNumber(),
    publicClient.getGasPrice(),
  ]);

  return {
    total_blocks: blockNumber.toString(),
    average_block_time: 5, // Estimado
    gas_prices: {
      average: Number(gasPrice) / 1e9,
      fast: Number(gasPrice) * 1.2 / 1e9,
      slow: Number(gasPrice) * 0.8 / 1e9,
    },
  };
}

// ============================================================================
// SEARCH
// ============================================================================

/**
 * Búsqueda universal
 */
export async function search(query: string): Promise<{
  type: 'block' | 'transaction' | 'address' | 'unknown';
  data?: any;
}> {
  const cleanQuery = query.trim().toLowerCase();

  // Es un número de bloque?
  if (/^\d+$/.test(cleanQuery)) {
    try {
      const block = await getBlock(BigInt(cleanQuery));
      return { type: 'block', data: block };
    } catch {}
  }

  // Es un hash de transacción? (0x + 64 caracteres hex)
  if (/^0x[a-f0-9]{64}$/i.test(cleanQuery)) {
    try {
      const tx = await getTransaction(cleanQuery);
      return { type: 'transaction', data: tx };
    } catch {
      // Podría ser un block hash
      try {
        const block = await getBlock(cleanQuery);
        return { type: 'block', data: block };
      } catch {}
    }
  }

  // Es una dirección? (0x + 40 caracteres hex)
  if (/^0x[a-f0-9]{40}$/i.test(cleanQuery)) {
    try {
      const address = await getAddress(cleanQuery);
      return { type: 'address', data: address };
    } catch {}
  }

  return { type: 'unknown' };
}
