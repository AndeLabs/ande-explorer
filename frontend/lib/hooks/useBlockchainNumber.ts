import { useMemo } from 'react';
import {
  formatBlockchainNumber,
  formatWei,
  formatToGwei,
  formatBlockNumber,
  formatTokenAmount,
  formatCount,
  formatGasPriceFromWei,
  type FormatOptions,
  type FormattedNumber,
} from '@/lib/utils/blockchain-numbers';

/**
 * Hook for formatting blockchain numbers with memoization
 *
 * @example
 * const { display, full, isTruncated } = useBlockchainNumber(weiValue, { symbol: 'ANDE' });
 */
export function useBlockchainNumber(
  value: bigint | string | number,
  options: FormatOptions = {}
): FormattedNumber {
  return useMemo(
    () => formatBlockchainNumber(value, options),
    [value, options.decimals, options.displayMode, options.maxDisplayDecimals,
     options.minDisplayDecimals, options.showThousandSeparators, options.symbol,
     options.locale, options.trimTrailingZeros]
  );
}

/**
 * Hook for formatting wei to ANDE
 *
 * @example
 * const balance = useFormattedWei(addressBalance, { maxDisplayDecimals: 4 });
 * return <span title={balance.full}>{balance.display}</span>;
 */
export function useFormattedWei(
  wei: bigint | string,
  options: Omit<FormatOptions, 'decimals'> = {}
): FormattedNumber {
  return useMemo(
    () => formatWei(wei, options),
    [wei, options.displayMode, options.maxDisplayDecimals, options.minDisplayDecimals,
     options.showThousandSeparators, options.symbol, options.locale, options.trimTrailingZeros]
  );
}

/**
 * Hook for formatting wei to Gwei
 *
 * @example
 * const gasPrice = useFormattedGwei(gasPriceWei);
 * return <span>{gasPrice.display}</span>;
 */
export function useFormattedGwei(
  wei: bigint | string,
  options: Omit<FormatOptions, 'decimals' | 'symbol'> = {}
): FormattedNumber {
  return useMemo(
    () => formatToGwei(wei, options),
    [wei, options.displayMode, options.maxDisplayDecimals, options.minDisplayDecimals,
     options.showThousandSeparators, options.locale, options.trimTrailingZeros]
  );
}

/**
 * Hook for formatting block numbers
 *
 * @example
 * const blockNum = useFormattedBlockNumber(latestBlock);
 * return <span>#{blockNum.display}</span>;
 */
export function useFormattedBlockNumber(
  blockNumber: bigint | number | string
): FormattedNumber {
  return useMemo(
    () => formatBlockNumber(blockNumber),
    [blockNumber]
  );
}

/**
 * Hook for formatting token amounts
 *
 * @example
 * const amount = useFormattedTokenAmount(tokenBalance, 6, 'USDC');
 * return <span title={amount.full}>{amount.display}</span>;
 */
export function useFormattedTokenAmount(
  amount: bigint | string,
  decimals: number,
  symbol?: string,
  options: Omit<FormatOptions, 'decimals' | 'symbol'> = {}
): FormattedNumber {
  return useMemo(
    () => formatTokenAmount(amount, decimals, symbol, options),
    [amount, decimals, symbol, options.displayMode, options.maxDisplayDecimals,
     options.minDisplayDecimals, options.showThousandSeparators, options.locale,
     options.trimTrailingZeros]
  );
}

/**
 * Hook for formatting counts/integers
 *
 * @example
 * const txCount = useFormattedCount(totalTransactions, { useShortFormat: true });
 * return <span title={txCount.full}>{txCount.display}</span>;
 */
export function useFormattedCount(
  count: bigint | number | string,
  options: { useShortFormat?: boolean; symbol?: string } = {}
): FormattedNumber {
  return useMemo(
    () => formatCount(count, options),
    [count, options.useShortFormat, options.symbol]
  );
}

/**
 * Hook for formatting gas price from wei
 *
 * @example
 * const gasPrice = useFormattedGasPrice(gasPriceWei);
 * return <span>{gasPrice.display}</span>; // "20.00 Gwei"
 */
export function useFormattedGasPrice(
  weiValue: bigint | string,
  options: Omit<FormatOptions, 'decimals' | 'symbol'> = {}
): FormattedNumber {
  return useMemo(
    () => formatGasPriceFromWei(weiValue, options),
    [weiValue, options.displayMode, options.maxDisplayDecimals, options.minDisplayDecimals,
     options.showThousandSeparators, options.locale, options.trimTrailingZeros]
  );
}

/**
 * Hook for formatting a balance with sensible defaults
 *
 * @example
 * const balance = useFormattedBalance(addressBalance);
 * return <span title={balance.full}>{balance.display}</span>;
 */
export function useFormattedBalance(
  wei: bigint | string,
  options: { symbol?: string; maxDecimals?: number } = {}
): FormattedNumber {
  const { symbol = 'ANDE', maxDecimals = 4 } = options;

  return useMemo(
    () => formatWei(wei, {
      symbol,
      maxDisplayDecimals: maxDecimals,
      trimTrailingZeros: true,
    }),
    [wei, symbol, maxDecimals]
  );
}

/**
 * Hook that returns multiple formatted versions of the same value
 * Useful when you need both compact and full representations
 *
 * @example
 * const { compact, full, scientific } = useMultiFormatNumber(value);
 */
export function useMultiFormatNumber(
  value: bigint | string | number,
  options: FormatOptions = {}
) {
  return useMemo(() => ({
    compact: formatBlockchainNumber(value, { ...options, displayMode: 'compact' }),
    full: formatBlockchainNumber(value, { ...options, displayMode: 'full' }),
    scientific: formatBlockchainNumber(value, { ...options, displayMode: 'scientific' }),
  }), [value, options.decimals, options.maxDisplayDecimals, options.minDisplayDecimals,
       options.showThousandSeparators, options.symbol, options.locale, options.trimTrailingZeros]);
}
