/**
 * TypeScript types for BlockScout API
 * Based on BlockScout API v2 specification
 */

// Common types
export type Hash = `0x${string}`;
export type Address = `0x${string}`;

// Transaction status
export type TransactionStatus = 'ok' | 'error' | 'pending';

// Block type
export interface Block {
  height: number;
  timestamp: string;
  hash: Hash;
  parent_hash: Hash;
  miner: {
    hash: Address;
    name: string | null;
    is_contract: boolean;
    is_verified: boolean | null;
  } | Address; // Support both BlockScout object format and simple address string
  size: number;
  gas_used: string;
  gas_limit: string;
  base_fee_per_gas: string | null;
  burnt_fees: string | null;
  burnt_fees_percentage: number | null;
  difficulty: string;
  total_difficulty: string | null;
  nonce: string;
  tx_count: number;
  rewards: Array<{
    reward: string;
    type: string;
  }>;
  extra_data: string | null;
  state_root: string | null;
  transactions_root: string | null;
  receipts_root: string | null;
  type: string | null;
}

// Transaction type
export interface Transaction {
  hash: Hash;
  block: number | null;
  timestamp: string | null;
  from: Address;
  to: Address | null;
  value: string;
  fee: {
    type: string;
    value: string;
  };
  gas_price: string;
  gas_used: string | null;
  gas_limit: string;
  max_fee_per_gas: string | null;
  max_priority_fee_per_gas: string | null;
  priority_fee: string | null;
  type: number;
  nonce: number;
  position: number | null;
  status: TransactionStatus;
  method: string | null;
  confirmations: number | null;
  revert_reason: string | null;
  raw_input: string;
  decoded_input: {
    method_call: string;
    method_id: string;
    parameters: Array<{
      name: string;
      type: string;
      value: any;
    }>;
  } | null;
  token_transfers: TokenTransfer[] | null;
  tx_types: string[];
}

// Address type
export interface AddressInfo {
  hash: Address;
  name: string | null;
  is_contract: boolean;
  is_verified: boolean;
  ens_domain_name: string | null;
  creator_address_hash: Address | null;
  creation_tx_hash: Hash | null;
  token: {
    name: string;
    symbol: string;
    decimals: string;
    type: string;
    holders: string;
    exchange_rate: string | null;
  } | null;
  watchlist_names: any[];
  watchlist_address_id: number | null;
  implementations: any[];
  block_number_balance_updated_at: number | null;
}

// Address balance type
export interface AddressBalance {
  coin_balance: string;
  exchange_rate: string | null;
}

// Token transfer type
export interface TokenTransfer {
  block_hash: Hash;
  from: Address;
  to: Address;
  log_index: string;
  method: string | null;
  timestamp: string;
  token: {
    address: Address;
    name: string;
    symbol: string;
    decimals: string | null;
    type: string;
  };
  total: {
    decimals: string | null;
    value: string;
  };
  tx_hash: Hash;
  type: string;
}

// Token type
export interface Token {
  address: Address;
  name: string;
  symbol: string;
  decimals: string | null;
  type: string;
  holders: string;
  exchange_rate: string | null;
  total_supply: string | null;
  icon_url: string | null;
  circulating_market_cap: string | null;
}

// Stats type
export interface NetworkStats {
  total_blocks: string;
  total_addresses: string;
  total_transactions: string;
  average_block_time: number;
  coin_price: string | null;
  coin_price_change_percentage: number | null;
  gas_prices: {
    slow: number | null;
    average: number | null;
    fast: number | null;
  } | null;
  gas_used_today: string;
  market_cap: string | null;
  network_utilization_percentage: number;
  static_gas_price: string | null;
  total_gas_used: string;
  transactions_today: string;
  tvl: string | null;
}

// Paginated response type
export interface PaginatedResponse<T> {
  items: T[];
  next_page_params: {
    block_number?: number;
    index?: number;
    items_count?: number;
  } | null;
}

// API Response wrapper
export interface APIResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

// Search result type
export interface SearchResult {
  type: 'address' | 'transaction' | 'block' | 'token' | 'contract';
  address?: Address;
  name?: string;
  url?: string;
  is_smart_contract_verified?: boolean;
  block_hash?: Hash;
  block_number?: number;
  timestamp?: string;
  tx_hash?: Hash;
  token?: {
    address: Address;
    name: string;
    symbol: string;
    type: string;
  };
}

// Chart data type
export interface ChartDataPoint {
  date: string;
  value: number;
}

// Gas tracker data
export interface GasTracker {
  slow: {
    price: number;
    time: number;
    base_fee: number;
  };
  average: {
    price: number;
    time: number;
    base_fee: number;
  };
  fast: {
    price: number;
    time: number;
    base_fee: number;
  };
}

// Internal transaction type
export interface InternalTransaction {
  from: Address;
  to: Address | null;
  value: string;
  type: string;
  gas: string | null;
  gas_used: string | null;
  created_contract: Address | null;
  error: string | null;
  index: number;
  block: number;
  transaction_hash: Hash;
}

// Log type
export interface Log {
  address: Address;
  topics: Hash[];
  data: string;
  index: number;
  block_number: number;
  transaction_hash: Hash;
  transaction_index: number;
  decoded: {
    method_call: string;
    method_id: string;
    parameters: Array<{
      name: string;
      type: string;
      value: any;
      indexed: boolean;
    }>;
  } | null;
}

// Contract type
export interface Contract {
  address: Address;
  name: string | null;
  compiler_version: string | null;
  optimization_enabled: boolean | null;
  is_verified: boolean;
  has_constructor_args: boolean;
  source_code: string | null;
  abi: any[] | null;
  constructor_args: string | null;
  external_libraries: any[] | null;
  verified_at: string | null;
  language: string | null;
  license_type: string | null;
  is_proxy: boolean;
  implementations: any[] | null;
}
