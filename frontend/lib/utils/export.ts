/**
 * Export utilities for CSV generation
 */

import { formatWeiToEther } from './format';
import type { Transaction, TokenTransfer } from '@/lib/types';

/**
 * Convert transactions to CSV format
 */
export function transactionsToCSV(transactions: Transaction[]): string {
  const headers = [
    'Hash',
    'Block',
    'Timestamp',
    'From',
    'To',
    'Value (ANDE)',
    'Fee (ANDE)',
    'Gas Used',
    'Gas Price (Gwei)',
    'Status',
    'Method',
  ];

  const rows = transactions.map((tx) => [
    tx.hash,
    tx.block?.toString() || '',
    tx.timestamp || '',
    tx.from,
    tx.to || '[Contract Creation]',
    formatWeiToEther(tx.value),
    tx.fee ? formatWeiToEther(tx.fee.value) : '0',
    tx.gas_used || '0',
    tx.gas_price ? (parseInt(tx.gas_price) / 1e9).toFixed(9) : '0',
    tx.status,
    tx.method || '',
  ]);

  return arrayToCSV([headers, ...rows]);
}

/**
 * Convert token transfers to CSV format
 */
export function tokenTransfersToCSV(transfers: TokenTransfer[]): string {
  const headers = [
    'Tx Hash',
    'Block Hash',
    'Timestamp',
    'From',
    'To',
    'Token Name',
    'Token Symbol',
    'Token Address',
    'Value',
    'Type',
    'Method',
  ];

  const rows = transfers.map((transfer) => [
    transfer.tx_hash,
    transfer.block_hash,
    transfer.timestamp,
    transfer.from,
    transfer.to,
    transfer.token.name,
    transfer.token.symbol,
    transfer.token.address,
    transfer.total.value,
    transfer.type,
    transfer.method || '',
  ]);

  return arrayToCSV([headers, ...rows]);
}

/**
 * Convert array of arrays to CSV string
 */
function arrayToCSV(data: any[][]): string {
  return data
    .map((row) =>
      row
        .map((cell) => {
          // Handle cells that need quoting
          const cellStr = String(cell ?? '');
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(',')
    )
    .join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${prefix}_${timestamp}.csv`;
}
