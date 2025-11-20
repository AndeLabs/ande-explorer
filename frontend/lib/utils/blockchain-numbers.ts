/**
 * ANDE Explorer - Full Precision Blockchain Number Formatting
 *
 * This module provides precision-preserving number formatting for blockchain data.
 * NEVER uses parseFloat/toFixed for blockchain values to prevent precision loss.
 *
 * Key principles:
 * 1. All calculations use BigInt to preserve precision
 * 2. String manipulation for display formatting
 * 3. Configurable display modes (compact, full, hover-full)
 * 4. Proper thousand separators without precision loss
 */

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

export type NumberDisplayMode = 'full' | 'compact' | 'scientific';

export interface FormatOptions {
  /** Number of decimal places to show (default: 18 for ETH, varies for tokens) */
  decimals?: number;
  /** Display mode for the number */
  displayMode?: NumberDisplayMode;
  /** Maximum decimal places to show in compact mode (default: 4) */
  maxDisplayDecimals?: number;
  /** Minimum decimal places to show (default: 0) */
  minDisplayDecimals?: number;
  /** Whether to show thousand separators (default: true) */
  showThousandSeparators?: boolean;
  /** Symbol to append (e.g., 'ANDE', 'ETH', 'Gwei') */
  symbol?: string;
  /** Locale for number formatting (default: 'en-US') */
  locale?: string;
  /** Whether to trim trailing zeros (default: true in compact mode) */
  trimTrailingZeros?: boolean;
}

export interface FormattedNumber {
  /** The formatted display string */
  display: string;
  /** The full precision value as string (for tooltips) */
  full: string;
  /** The raw BigInt value */
  raw: bigint;
  /** Whether the display is truncated from full */
  isTruncated: boolean;
  /** The symbol if provided */
  symbol?: string;
}

// Common token decimals
export const TOKEN_DECIMALS = {
  ETH: 18,
  ANDE: 18,
  GWEI: 9,
  WEI: 0,
  USDT: 6,
  USDC: 6,
} as const;

// Default formatting options
const DEFAULT_OPTIONS: Required<Omit<FormatOptions, 'symbol'>> = {
  decimals: 18,
  displayMode: 'compact',
  maxDisplayDecimals: 6,
  minDisplayDecimals: 0,
  showThousandSeparators: true,
  locale: 'en-US',
  trimTrailingZeros: true,
};

// =============================================================================
// CORE FORMATTING FUNCTIONS
// =============================================================================

/**
 * Convert a BigInt wei value to a decimal string with full precision
 * This is the core function that NEVER loses precision
 */
export function bigIntToDecimalString(value: bigint, decimals: number): string {
  if (decimals === 0) return value.toString();

  const isNegative = value < 0n;
  const absValue = isNegative ? -value : value;
  const str = absValue.toString().padStart(decimals + 1, '0');

  const integerPart = str.slice(0, -decimals) || '0';
  const decimalPart = str.slice(-decimals);

  const result = decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  return isNegative ? `-${result}` : result;
}

/**
 * Add thousand separators to the integer part of a number string
 */
export function addThousandSeparators(numberStr: string, locale: string = 'en-US'): string {
  const parts = numberStr.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Get the appropriate separator for the locale
  const separator = locale === 'en-US' ? ',' :
                    locale === 'de-DE' ? '.' :
                    locale === 'es-ES' ? '.' : ',';

  // Handle negative numbers
  const isNegative = integerPart.startsWith('-');
  const absInteger = isNegative ? integerPart.slice(1) : integerPart;

  // Add separators from right to left
  const withSeparators = absInteger.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  const formattedInteger = isNegative ? `-${withSeparators}` : withSeparators;

  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

/**
 * Trim trailing zeros from decimal part
 */
export function trimTrailingZeros(numberStr: string): string {
  if (!numberStr.includes('.')) return numberStr;

  const [integer, decimal] = numberStr.split('.');
  const trimmed = decimal.replace(/0+$/, '');

  return trimmed ? `${integer}.${trimmed}` : integer;
}

/**
 * Truncate decimal places while preserving precision indication
 */
export function truncateDecimals(
  numberStr: string,
  maxDecimals: number,
  minDecimals: number = 0
): { result: string; wasTruncated: boolean } {
  if (!numberStr.includes('.')) {
    if (minDecimals > 0) {
      return {
        result: `${numberStr}.${'0'.repeat(minDecimals)}`,
        wasTruncated: false
      };
    }
    return { result: numberStr, wasTruncated: false };
  }

  const [integer, decimal] = numberStr.split('.');

  if (decimal.length <= maxDecimals) {
    if (decimal.length < minDecimals) {
      return {
        result: `${integer}.${decimal.padEnd(minDecimals, '0')}`,
        wasTruncated: false
      };
    }
    return { result: numberStr, wasTruncated: false };
  }

  const truncated = decimal.slice(0, maxDecimals);
  const result = minDecimals > 0 || truncated !== '0'.repeat(maxDecimals)
    ? `${integer}.${truncated}`
    : integer;

  return { result, wasTruncated: true };
}

/**
 * Format a number in scientific notation
 */
export function toScientificNotation(numberStr: string, precision: number = 4): string {
  // Remove thousand separators if present
  const cleanStr = numberStr.replace(/,/g, '');

  if (cleanStr === '0' || cleanStr === '0.0') return '0';

  const isNegative = cleanStr.startsWith('-');
  const absStr = isNegative ? cleanStr.slice(1) : cleanStr;

  // Split into integer and decimal
  const [intPart, decPart = ''] = absStr.split('.');

  // Find first non-zero digit
  let exponent = 0;
  let significand = '';

  if (intPart !== '0') {
    exponent = intPart.length - 1;
    significand = intPart[0] + '.' + intPart.slice(1) + decPart;
  } else {
    // Find first non-zero in decimal
    for (let i = 0; i < decPart.length; i++) {
      if (decPart[i] !== '0') {
        exponent = -(i + 1);
        significand = decPart[i] + '.' + decPart.slice(i + 1);
        break;
      }
    }
  }

  // Truncate significand
  const [sigInt, sigDec = ''] = significand.split('.');
  const truncatedDec = sigDec.slice(0, precision);
  const finalSignificand = truncatedDec ? `${sigInt}.${truncatedDec}` : sigInt;

  const result = exponent !== 0
    ? `${finalSignificand}e${exponent >= 0 ? '+' : ''}${exponent}`
    : finalSignificand;

  return isNegative ? `-${result}` : result;
}

// =============================================================================
// MAIN FORMATTING API
// =============================================================================

/**
 * Format a blockchain number (BigInt) for display with full precision preservation
 *
 * @param value - The BigInt value in smallest unit (wei, satoshi, etc.)
 * @param options - Formatting options
 * @returns FormattedNumber object with display and full precision values
 *
 * @example
 * // Format 1.5 ANDE
 * formatBlockchainNumber(1500000000000000000n, { symbol: 'ANDE' })
 * // => { display: '1.5 ANDE', full: '1.500000000000000000', ... }
 *
 * @example
 * // Format with specific decimals (USDC has 6)
 * formatBlockchainNumber(1500000n, { decimals: 6, symbol: 'USDC' })
 * // => { display: '1.5 USDC', full: '1.500000', ... }
 */
export function formatBlockchainNumber(
  value: bigint | string | number,
  options: FormatOptions = {}
): FormattedNumber {
  // Convert to BigInt
  let bigIntValue: bigint;
  try {
    if (typeof value === 'bigint') {
      bigIntValue = value;
    } else if (typeof value === 'string') {
      // Handle hex strings
      if (value.startsWith('0x')) {
        bigIntValue = BigInt(value);
      } else {
        // Handle decimal strings (may have scientific notation)
        bigIntValue = BigInt(value.replace(/[^0-9-]/g, '') || '0');
      }
    } else {
      bigIntValue = BigInt(Math.floor(value));
    }
  } catch {
    bigIntValue = 0n;
  }

  // Merge options with defaults
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Convert to full precision decimal string
  const fullPrecision = bigIntToDecimalString(bigIntValue, opts.decimals);

  // Format based on display mode
  let displayStr: string;
  let wasTruncated = false;

  switch (opts.displayMode) {
    case 'scientific':
      displayStr = toScientificNotation(fullPrecision, opts.maxDisplayDecimals);
      wasTruncated = true;
      break;

    case 'full':
      displayStr = fullPrecision;
      if (opts.trimTrailingZeros) {
        displayStr = trimTrailingZeros(displayStr);
      }
      break;

    case 'compact':
    default:
      const truncated = truncateDecimals(
        fullPrecision,
        opts.maxDisplayDecimals,
        opts.minDisplayDecimals
      );
      displayStr = truncated.result;
      wasTruncated = truncated.wasTruncated;

      if (opts.trimTrailingZeros) {
        displayStr = trimTrailingZeros(displayStr);
      }
      break;
  }

  // Add thousand separators
  if (opts.showThousandSeparators) {
    displayStr = addThousandSeparators(displayStr, opts.locale);
  }

  // Add symbol
  if (opts.symbol) {
    displayStr = `${displayStr} ${opts.symbol}`;
  }

  // Format full precision for tooltip
  let fullDisplay = fullPrecision;
  if (opts.trimTrailingZeros && opts.displayMode !== 'full') {
    fullDisplay = trimTrailingZeros(fullDisplay);
  }
  if (opts.showThousandSeparators) {
    fullDisplay = addThousandSeparators(fullDisplay, opts.locale);
  }
  if (opts.symbol) {
    fullDisplay = `${fullDisplay} ${opts.symbol}`;
  }

  return {
    display: displayStr,
    full: fullDisplay,
    raw: bigIntValue,
    isTruncated: wasTruncated,
    symbol: opts.symbol,
  };
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Format wei to ANDE/ETH with precision preservation
 */
export function formatWei(
  wei: bigint | string,
  options: Omit<FormatOptions, 'decimals'> = {}
): FormattedNumber {
  return formatBlockchainNumber(wei, {
    decimals: 18,
    symbol: 'ANDE',
    ...options,
  });
}

/**
 * Format wei to Gwei with precision preservation
 */
export function formatToGwei(
  wei: bigint | string,
  options: Omit<FormatOptions, 'decimals' | 'symbol'> = {}
): FormattedNumber {
  // Convert wei to gwei (divide by 10^9)
  const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
  return formatBlockchainNumber(weiValue, {
    decimals: 9,
    symbol: 'Gwei',
    maxDisplayDecimals: 2,
    ...options,
  });
}

/**
 * Format a token amount with custom decimals
 */
export function formatTokenAmount(
  amount: bigint | string,
  decimals: number,
  symbol?: string,
  options: Omit<FormatOptions, 'decimals' | 'symbol'> = {}
): FormattedNumber {
  return formatBlockchainNumber(amount, {
    decimals,
    symbol,
    ...options,
  });
}

/**
 * Format a block number with thousand separators
 */
export function formatBlockNumber(
  blockNumber: bigint | number | string
): FormattedNumber {
  const value = typeof blockNumber === 'bigint'
    ? blockNumber
    : BigInt(blockNumber.toString());

  return formatBlockchainNumber(value, {
    decimals: 0,
    displayMode: 'full',
    showThousandSeparators: true,
  });
}

/**
 * Format a transaction count or similar integer
 */
export function formatCount(
  count: bigint | number | string,
  options: { useShortFormat?: boolean; symbol?: string } = {}
): FormattedNumber {
  const value = typeof count === 'bigint'
    ? count
    : BigInt(count.toString());

  if (options.useShortFormat) {
    // Convert to number for short format (K, M, B)
    // Only use this for display purposes where precision isn't critical
    const num = Number(value);
    let display: string;

    if (num >= 1_000_000_000) {
      display = `${(num / 1_000_000_000).toFixed(2)}B`;
    } else if (num >= 1_000_000) {
      display = `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      display = `${(num / 1_000).toFixed(2)}K`;
    } else {
      display = num.toString();
    }

    if (options.symbol) {
      display = `${display} ${options.symbol}`;
    }

    return {
      display,
      full: addThousandSeparators(value.toString()),
      raw: value,
      isTruncated: num >= 1_000,
      symbol: options.symbol,
    };
  }

  return formatBlockchainNumber(value, {
    decimals: 0,
    displayMode: 'full',
    symbol: options.symbol,
  });
}

/**
 * Format gas price from wei
 */
export function formatGasPriceFromWei(
  weiValue: bigint | string,
  options: Omit<FormatOptions, 'decimals' | 'symbol'> = {}
): FormattedNumber {
  return formatToGwei(weiValue, {
    maxDisplayDecimals: 2,
    minDisplayDecimals: 2,
    ...options,
  });
}

/**
 * Format a percentage with precision
 */
export function formatPercentageValue(
  value: number,
  options: { decimals?: number; showSymbol?: boolean } = {}
): string {
  const { decimals = 2, showSymbol = true } = options;
  const formatted = value.toFixed(decimals);
  return showSymbol ? `${formatted}%` : formatted;
}

/**
 * Format USD value
 */
export function formatUSDValue(
  value: number,
  options: { decimals?: number; showSymbol?: boolean } = {}
): string {
  const { decimals = 2, showSymbol = true } = options;
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return showSymbol ? `$${formatted}` : formatted;
}

// =============================================================================
// PARSING FUNCTIONS (String to BigInt)
// =============================================================================

/**
 * Parse a decimal string to BigInt with given decimals
 * Inverse of bigIntToDecimalString
 */
export function parseDecimalToBigInt(decimalStr: string, decimals: number): bigint {
  // Clean the string
  const clean = decimalStr.replace(/[,\s]/g, '');

  if (!clean || clean === '0') return 0n;

  const isNegative = clean.startsWith('-');
  const absStr = isNegative ? clean.slice(1) : clean;

  const [intPart, decPart = ''] = absStr.split('.');

  // Pad or truncate decimal part to match expected decimals
  const paddedDec = decPart.padEnd(decimals, '0').slice(0, decimals);

  const combined = intPart + paddedDec;
  const result = BigInt(combined);

  return isNegative ? -result : result;
}

/**
 * Parse ether string to wei BigInt
 */
export function parseEtherToWei(etherStr: string): bigint {
  return parseDecimalToBigInt(etherStr, 18);
}

/**
 * Parse gwei string to wei BigInt
 */
export function parseGweiToWei(gweiStr: string): bigint {
  return parseDecimalToBigInt(gweiStr, 9);
}

// =============================================================================
// COMPARISON UTILITIES
// =============================================================================

/**
 * Check if a BigInt value is zero
 */
export function isZero(value: bigint | string): boolean {
  const bigIntValue = typeof value === 'string' ? BigInt(value) : value;
  return bigIntValue === 0n;
}

/**
 * Compare two BigInt values
 */
export function compareBigInt(a: bigint | string, b: bigint | string): -1 | 0 | 1 {
  const aVal = typeof a === 'string' ? BigInt(a) : a;
  const bVal = typeof b === 'string' ? BigInt(b) : b;

  if (aVal < bVal) return -1;
  if (aVal > bVal) return 1;
  return 0;
}
