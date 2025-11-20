/**
 * Blockchain Number Components
 *
 * Components for displaying blockchain numbers with full precision.
 * All components preserve BigInt precision and show tooltips with full values.
 */

export {
  // Main components
  Amount,
  Balance,
  GasPrice,
  BlockNumberDisplay,
  TokenAmountDisplay,
  CountDisplay,
  TransactionValue,

  // Inline components
  InlineAmount,
  InlineGwei,

  // Base components for custom implementations
  BlockchainNumberBase,
  Tooltip,
} from './BlockchainNumber';

// Re-export formatting utilities
export {
  formatBlockchainNumber,
  formatWei,
  formatToGwei,
  formatBlockNumber,
  formatTokenAmount,
  formatCount,
  formatGasPriceFromWei,
  formatPercentageValue,
  formatUSDValue,

  // Parsing utilities
  parseDecimalToBigInt,
  parseEtherToWei,
  parseGweiToWei,

  // Comparison utilities
  isZero,
  compareBigInt,

  // Types
  type FormatOptions,
  type FormattedNumber,
  type NumberDisplayMode,

  // Constants
  TOKEN_DECIMALS,
} from '@/lib/utils/blockchain-numbers';
