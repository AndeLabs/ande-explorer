/**
 * BlockScout API Client
 *
 * Cliente para interactuar con la API v2 de BlockScout
 * Proporciona funciones para obtener datos indexados de la blockchain
 */

const API_HOST = process.env.NEXT_PUBLIC_API_HOST || 'http://localhost:4000';
const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/v2';
const STATS_API_HOST = process.env.NEXT_PUBLIC_STATS_API_HOST || 'http://localhost:8080';

const BASE_URL = `${API_HOST}${API_BASE_PATH}`;

/**
 * Wrapper para fetch con manejo de errores
 */
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      // Prevent all caching for real-time data
      cache: 'no-store',
      headers: {
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// ============================================================================
// TYPES
// ============================================================================

export interface BlockScoutBlock {
  height: number;
  timestamp: string;
  tx_count: number;
  miner: {
    hash: string;
    implementation_name: string | null;
    is_contract: boolean;
    is_verified: boolean | null;
    name: string | null;
    private_tags: any[];
    public_tags: any[];
    watchlist_names: any[];
  };
  size: number;
  hash: string;
  parent_hash: string;
  difficulty: string;
  total_difficulty: string | null;
  gas_used: string;
  gas_limit: string;
  nonce: string;
  base_fee_per_gas: string;
  burnt_fees: string;
  priority_fee: string | null;
  extra_data: string;
  uncles_hashes: string[];
  state_root: string;
  rewards: any[];
  gas_target_percentage: number | null;
  gas_used_percentage: number;
  burnt_fees_percentage: number | null;
  type: string;
  tx_fees: string;
  withdrawals_count?: number;
}

export interface BlockScoutTransaction {
  timestamp: string;
  fee: {
    type: string;
    value: string;
  };
  gas_limit: string;
  block: number;
  status: string;
  method: string | null;
  confirmations: number;
  type: number;
  exchange_rate: string;
  to: {
    hash: string;
    implementation_name: string | null;
    is_contract: boolean;
    is_verified: boolean | null;
    name: string | null;
    private_tags: any[];
    public_tags: any[];
    watchlist_names: any[];
  };
  tx_burnt_fee: string;
  max_fee_per_gas: string;
  result: string;
  hash: string;
  gas_price: string;
  priority_fee: string;
  base_fee_per_gas: string;
  from: {
    hash: string;
    implementation_name: string | null;
    is_contract: boolean;
    is_verified: boolean | null;
    name: string | null;
    private_tags: any[];
    public_tags: any[];
    watchlist_names: any[];
  };
  token_transfers: any[] | null;
  tx_types: string[];
  gas_used: string;
  created_contract: any | null;
  position: number;
  nonce: number;
  has_error_in_internal_txs: boolean;
  actions: any[];
  decoded_input: any | null;
  token_transfers_overflow: boolean;
  raw_input: string;
  value: string;
  max_priority_fee_per_gas: string;
  revert_reason: string | null;
  confirmation_duration: number[];
  tx_tag: string | null;
}

export interface BlockScoutAddress {
  hash: string;
  implementation_name: string | null;
  is_contract: boolean;
  is_verified: boolean | null;
  name: string | null;
  private_tags: any[];
  public_tags: any[];
  watchlist_names: any[];
  creator_address_hash: string | null;
  creation_tx_hash: string | null;
  token: any | null;
  coin_balance: string;
  exchange_rate: string;
  implementation_address: string | null;
  block_number_balance_updated_at: number | null;
}

export interface BlockScoutStats {
  total_blocks: string;
  total_addresses: string;
  total_transactions: string;
  average_block_time: number;
  coin_price: string;
  coin_price_change_percentage: number;
  market_cap: string;
  network_utilization_percentage: number;
  gas_prices: {
    average: number;
    fast: number;
    slow: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  next_page_params: any | null;
}

// ============================================================================
// BLOCKS
// ============================================================================

/**
 * Obtener lista de bloques recientes
 */
export async function getBlocks(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<BlockScoutBlock>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const query = searchParams.toString();
  return fetchAPI<PaginatedResponse<BlockScoutBlock>>(
    `/blocks${query ? `?${query}` : ''}`
  );
}

/**
 * Obtener detalles de un bloque específico
 */
export async function getBlock(blockNumber: number | string): Promise<BlockScoutBlock> {
  return fetchAPI<BlockScoutBlock>(`/blocks/${blockNumber}`);
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

/**
 * Obtener lista de transacciones recientes
 */
export async function getTransactions(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<BlockScoutTransaction>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const query = searchParams.toString();
  return fetchAPI<PaginatedResponse<BlockScoutTransaction>>(
    `/transactions${query ? `?${query}` : ''}`
  );
}

/**
 * Obtener detalles de una transacción específica
 */
export async function getTransaction(hash: string): Promise<BlockScoutTransaction> {
  return fetchAPI<BlockScoutTransaction>(`/transactions/${hash}`);
}

// ============================================================================
// ADDRESSES
// ============================================================================

/**
 * Obtener información de una dirección
 */
export async function getAddress(address: string): Promise<BlockScoutAddress> {
  return fetchAPI<BlockScoutAddress>(`/addresses/${address}`);
}

/**
 * Obtener transacciones de una dirección
 */
export async function getAddressTransactions(
  address: string,
  params?: {
    page?: number;
    limit?: number;
    filter?: 'to' | 'from';
  }
): Promise<PaginatedResponse<BlockScoutTransaction>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.filter) searchParams.set('filter', params.filter);

  const query = searchParams.toString();
  return fetchAPI<PaginatedResponse<BlockScoutTransaction>>(
    `/addresses/${address}/transactions${query ? `?${query}` : ''}`
  );
}

/**
 * Obtener tokens de una dirección
 */
export async function getAddressTokens(address: string): Promise<any> {
  return fetchAPI(`/addresses/${address}/tokens`);
}

// ============================================================================
// STATS
// ============================================================================

/**
 * Obtener estadísticas de la red
 */
export async function getStats(): Promise<BlockScoutStats> {
  return fetchAPI<BlockScoutStats>('/stats');
}

/**
 * Obtener estadísticas de charts del Stats Service
 */
export async function getChartStats(chart: string): Promise<any> {
  try {
    const response = await fetch(`${STATS_API_HOST}/api/v1/lines/${chart}`);
    if (!response.ok) throw new Error('Stats API error');
    return await response.json();
  } catch (error) {
    console.error('Error fetching chart stats:', error);
    return null;
  }
}

// ============================================================================
// SEARCH
// ============================================================================

/**
 * Búsqueda universal (bloques, txs, direcciones)
 */
export async function search(query: string): Promise<any> {
  return fetchAPI(`/search?q=${encodeURIComponent(query)}`);
}

// ============================================================================
// TOKENS
// ============================================================================

/**
 * Obtener lista de tokens
 */
export async function getTokens(params?: {
  page?: number;
  limit?: number;
  type?: 'ERC-20' | 'ERC-721' | 'ERC-1155';
}): Promise<any> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.type) searchParams.set('type', params.type);

  const query = searchParams.toString();
  return fetchAPI(`/tokens${query ? `?${query}` : ''}`);
}

/**
 * Obtener detalles de un token
 */
export async function getToken(address: string): Promise<any> {
  return fetchAPI(`/tokens/${address}`);
}

// ============================================================================
// SMART CONTRACTS
// ============================================================================

/**
 * Obtener código fuente de un contrato verificado
 */
export async function getContractSource(address: string): Promise<any> {
  return fetchAPI(`/smart-contracts/${address}`);
}

/**
 * Obtener métodos de lectura de un contrato
 */
export async function getContractReadMethods(address: string): Promise<any> {
  return fetchAPI(`/smart-contracts/${address}/methods-read`);
}

/**
 * Obtener métodos de escritura de un contrato
 */
export async function getContractWriteMethods(address: string): Promise<any> {
  return fetchAPI(`/smart-contracts/${address}/methods-write`);
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Verificar estado de la API
 */
export async function healthCheck(): Promise<{ healthy: boolean }> {
  try {
    await fetchAPI('/health');
    return { healthy: true };
  } catch {
    return { healthy: false };
  }
}
