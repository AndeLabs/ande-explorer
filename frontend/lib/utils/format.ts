import { formatEther, formatGwei, parseEther } from 'viem';
import { formatDistanceToNow, format as formatDate } from 'date-fns';

/**
 * Format wei to ETH with specified decimals
 */
export function formatWeiToEther(wei: string | bigint, decimals = 4): string {
  try {
    const ether = formatEther(BigInt(wei));
    const num = parseFloat(ether);
    return num.toFixed(decimals);
  } catch {
    return '0';
  }
}

/**
 * Format wei to Gwei
 */
export function formatWeiToGwei(wei: string | bigint): string {
  try {
    return formatGwei(BigInt(wei));
  } catch {
    return '0';
  }
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatNumber(num: number | string): string {
  const value = typeof num === 'string' ? parseFloat(num) : num;

  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2) + 'B';
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(2) + 'K';
  }
  return value.toLocaleString();
}

/**
 * Format address to shortened version
 */
export function formatAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format transaction hash
 */
export function formatHash(hash: string, startChars = 10, endChars = 8): string {
  if (!hash) return '';
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

/**
 * Format timestamp to relative time
 */
export function formatTimeAgo(timestamp: number | Date): string {
  try {
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

/**
 * Format timestamp to full date
 */
export function formatFullDate(timestamp: number | Date): string {
  try {
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : timestamp;
    return formatDate(date, 'PPpp'); // e.g., "Apr 29, 2023, 9:30:00 AM"
  } catch {
    return 'Unknown';
  }
}

/**
 * Format gas price to human-readable string
 */
export function formatGasPrice(gasPrice: string | bigint): string {
  const gwei = formatWeiToGwei(gasPrice);
  return `${parseFloat(gwei).toFixed(2)} Gwei`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format USD value
 */
export function formatUSD(value: number, decimals = 2): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
