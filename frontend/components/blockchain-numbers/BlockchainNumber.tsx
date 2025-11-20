'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  formatBlockchainNumber,
  formatWei,
  formatToGwei,
  formatBlockNumber as formatBlockNum,
  formatTokenAmount,
  formatCount,
  type FormatOptions,
  type FormattedNumber,
} from '@/lib/utils/blockchain-numbers';

// =============================================================================
// TOOLTIP COMPONENT
// =============================================================================

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

function Tooltip({ content, children, className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // Position above the element
      let top = triggerRect.top - tooltipRect.height - 8;
      let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);

      // Keep tooltip within viewport
      if (top < 0) {
        top = triggerRect.bottom + 8;
      }
      if (left < 8) {
        left = 8;
      }
      if (left + tooltipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width - 8;
      }

      setPosition({ top, left });
    }
  }, [isVisible]);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className={`cursor-help ${className}`}
      >
        {children}
      </span>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-3 py-2 text-xs font-mono bg-gray-900 text-white rounded-lg shadow-lg max-w-xs break-all"
          style={{ top: position.top, left: position.left }}
        >
          {content}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </>
  );
}

// =============================================================================
// BASE BLOCKCHAIN NUMBER COMPONENT
// =============================================================================

interface BlockchainNumberBaseProps {
  /** The formatted number object */
  formatted: FormattedNumber;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show tooltip with full value */
  showTooltip?: boolean;
  /** Whether to show a visual indicator when truncated */
  showTruncationIndicator?: boolean;
  /** Custom content to show in tooltip */
  tooltipContent?: string;
  /** Whether to allow copying on click */
  copyOnClick?: boolean;
}

function BlockchainNumberBase({
  formatted,
  className = '',
  showTooltip = true,
  showTruncationIndicator = false,
  tooltipContent,
  copyOnClick = false,
}: BlockchainNumberBaseProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    if (copyOnClick) {
      try {
        await navigator.clipboard.writeText(formatted.full);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const content = (
    <span
      className={`font-mono tabular-nums ${copyOnClick ? 'cursor-pointer hover:text-primary' : ''} ${className}`}
      onClick={handleClick}
    >
      {formatted.display}
      {showTruncationIndicator && formatted.isTruncated && (
        <span className="text-muted-foreground ml-0.5">...</span>
      )}
      {copied && (
        <span className="ml-2 text-xs text-green-500">Copied!</span>
      )}
    </span>
  );

  if (showTooltip && (formatted.isTruncated || tooltipContent)) {
    return (
      <Tooltip content={tooltipContent || formatted.full}>
        {content}
      </Tooltip>
    );
  }

  return content;
}

// =============================================================================
// SPECIFIC NUMBER COMPONENTS
// =============================================================================

interface AmountProps {
  /** Wei value as BigInt or string */
  wei: bigint | string;
  /** Display options */
  options?: Omit<FormatOptions, 'decimals'>;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show tooltip */
  showTooltip?: boolean;
  /** Whether to allow copying */
  copyOnClick?: boolean;
}

/**
 * Display ANDE/ETH amount from wei with full precision
 *
 * @example
 * <Amount wei={1500000000000000000n} />
 * // Displays: 1.5 ANDE (with tooltip showing full precision)
 */
export function Amount({
  wei,
  options = {},
  className = '',
  showTooltip = true,
  copyOnClick = false,
}: AmountProps) {
  const formatted = formatWei(wei, options);

  return (
    <BlockchainNumberBase
      formatted={formatted}
      className={className}
      showTooltip={showTooltip}
      copyOnClick={copyOnClick}
    />
  );
}

interface GasPriceProps {
  /** Wei value for gas price */
  wei: bigint | string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show tooltip */
  showTooltip?: boolean;
}

/**
 * Display gas price in Gwei from wei
 *
 * @example
 * <GasPrice wei={20000000000n} />
 * // Displays: 20.00 Gwei
 */
export function GasPrice({
  wei,
  className = '',
  showTooltip = true,
}: GasPriceProps) {
  const formatted = formatToGwei(wei, {
    maxDisplayDecimals: 2,
    minDisplayDecimals: 2,
  });

  return (
    <BlockchainNumberBase
      formatted={formatted}
      className={className}
      showTooltip={showTooltip}
    />
  );
}

interface BlockNumberDisplayProps {
  /** Block number */
  number: bigint | number | string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show # prefix */
  showPrefix?: boolean;
  /** Whether to allow copying */
  copyOnClick?: boolean;
}

/**
 * Display block number with thousand separators
 *
 * @example
 * <BlockNumberDisplay number={12345678} showPrefix />
 * // Displays: #12,345,678
 */
export function BlockNumberDisplay({
  number,
  className = '',
  showPrefix = false,
  copyOnClick = false,
}: BlockNumberDisplayProps) {
  const formatted = formatBlockNum(number);

  const display = showPrefix ? `#${formatted.display}` : formatted.display;
  const full = showPrefix ? `#${formatted.full}` : formatted.full;

  return (
    <BlockchainNumberBase
      formatted={{ ...formatted, display, full }}
      className={className}
      showTooltip={false}
      copyOnClick={copyOnClick}
    />
  );
}

interface TokenAmountDisplayProps {
  /** Token amount in smallest unit */
  amount: bigint | string;
  /** Token decimals */
  decimals: number;
  /** Token symbol */
  symbol?: string;
  /** Display options */
  options?: Omit<FormatOptions, 'decimals' | 'symbol'>;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show tooltip */
  showTooltip?: boolean;
  /** Whether to allow copying */
  copyOnClick?: boolean;
}

/**
 * Display token amount with custom decimals
 *
 * @example
 * <TokenAmountDisplay amount={1000000n} decimals={6} symbol="USDC" />
 * // Displays: 1.00 USDC
 */
export function TokenAmountDisplay({
  amount,
  decimals,
  symbol,
  options = {},
  className = '',
  showTooltip = true,
  copyOnClick = false,
}: TokenAmountDisplayProps) {
  const formatted = formatTokenAmount(amount, decimals, symbol, options);

  return (
    <BlockchainNumberBase
      formatted={formatted}
      className={className}
      showTooltip={showTooltip}
      copyOnClick={copyOnClick}
    />
  );
}

interface CountDisplayProps {
  /** Count value */
  count: bigint | number | string;
  /** Whether to use short format (K, M, B) */
  useShortFormat?: boolean;
  /** Symbol to append */
  symbol?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show tooltip */
  showTooltip?: boolean;
}

/**
 * Display count/integer with formatting
 *
 * @example
 * <CountDisplay count={1500000} useShortFormat />
 * // Displays: 1.50M (with tooltip showing 1,500,000)
 */
export function CountDisplay({
  count,
  useShortFormat = false,
  symbol,
  className = '',
  showTooltip = true,
}: CountDisplayProps) {
  const formatted = formatCount(count, { useShortFormat, symbol });

  return (
    <BlockchainNumberBase
      formatted={formatted}
      className={className}
      showTooltip={showTooltip && formatted.isTruncated}
    />
  );
}

interface BalanceProps {
  /** Balance in wei */
  wei: bigint | string;
  /** Symbol (default: ANDE) */
  symbol?: string;
  /** Max display decimals (default: 4) */
  maxDecimals?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show tooltip */
  showTooltip?: boolean;
  /** Whether to allow copying */
  copyOnClick?: boolean;
}

/**
 * Display balance with sensible defaults for UI
 *
 * @example
 * <Balance wei={1234567890123456789n} />
 * // Displays: 1.2345 ANDE (with tooltip showing full precision)
 */
export function Balance({
  wei,
  symbol = 'ANDE',
  maxDecimals = 4,
  className = '',
  showTooltip = true,
  copyOnClick = false,
}: BalanceProps) {
  const formatted = formatWei(wei, {
    symbol,
    maxDisplayDecimals: maxDecimals,
    trimTrailingZeros: true,
  });

  return (
    <BlockchainNumberBase
      formatted={formatted}
      className={className}
      showTooltip={showTooltip}
      copyOnClick={copyOnClick}
    />
  );
}

interface TransactionValueProps {
  /** Value in wei */
  wei: bigint | string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show tooltip */
  showTooltip?: boolean;
}

/**
 * Display transaction value
 *
 * @example
 * <TransactionValue wei={100000000000000000n} />
 * // Displays: 0.1 ANDE
 */
export function TransactionValue({
  wei,
  className = '',
  showTooltip = true,
}: TransactionValueProps) {
  const formatted = formatWei(wei, {
    symbol: 'ANDE',
    maxDisplayDecimals: 6,
    trimTrailingZeros: true,
  });

  return (
    <BlockchainNumberBase
      formatted={formatted}
      className={className}
      showTooltip={showTooltip}
    />
  );
}

// =============================================================================
// INLINE COMPONENTS FOR QUICK USE
// =============================================================================

interface InlineAmountProps {
  /** Wei value */
  wei: bigint | string;
  /** Max decimals to show */
  maxDecimals?: number;
  /** Whether to show symbol */
  showSymbol?: boolean;
}

/**
 * Simple inline amount display
 */
export function InlineAmount({
  wei,
  maxDecimals = 4,
  showSymbol = true,
}: InlineAmountProps) {
  const formatted = formatWei(wei, {
    symbol: showSymbol ? 'ANDE' : undefined,
    maxDisplayDecimals: maxDecimals,
    trimTrailingZeros: true,
  });

  return <span className="font-mono tabular-nums">{formatted.display}</span>;
}

interface InlineGweiProps {
  /** Wei value */
  wei: bigint | string;
}

/**
 * Simple inline gwei display
 */
export function InlineGwei({ wei }: InlineGweiProps) {
  const formatted = formatToGwei(wei, {
    maxDisplayDecimals: 2,
    trimTrailingZeros: false,
  });

  return <span className="font-mono tabular-nums">{formatted.display}</span>;
}

// Export the base component for custom implementations
export { BlockchainNumberBase, Tooltip };
