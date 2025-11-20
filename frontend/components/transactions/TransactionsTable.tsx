'use client';

/**
 * Transactions Table - Compact and Dense View
 *
 * Optimized for desktop viewing with maximum information density.
 * Shows key transaction data in a scannable table format.
 */

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo, formatAddress, extractAddress } from '@/lib/utils/format';
import { CountDisplay, Balance } from '@/components/blockchain-numbers';
import type { Transaction } from '@/lib/types';
import { ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
  newTxHashes?: Set<string>;
}

export function TransactionsTable({ transactions, newTxHashes = new Set() }: TransactionsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-3 text-left font-semibold">Status</th>
            <th className="p-3 text-left font-semibold">Hash</th>
            <th className="p-3 text-left font-semibold">Method</th>
            <th className="p-3 text-left font-semibold">From → To</th>
            <th className="p-3 text-right font-semibold">Value</th>
            <th className="p-3 text-left font-semibold">Age</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isNew = newTxHashes.has(tx.hash);
            const isSuccess = tx.status === 'ok';
            const isPending = !tx.status;

            return (
              <tr
                key={tx.hash}
                className={`border-b transition-all hover:bg-muted/30 ${
                  isNew ? 'animate-pulse bg-green-50 dark:bg-green-950/20' : ''
                }`}
              >
                {/* Status */}
                <td className="p-3">
                  {isPending ? (
                    <Clock className="h-4 w-4 text-amber-500" title="Pending" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" title="Success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" title="Failed" />
                  )}
                </td>

                {/* Hash */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tx/${tx.hash}`}
                      className="font-mono text-xs text-blue-600 hover:underline"
                    >
                      {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                    </Link>
                    {isNew && (
                      <Badge variant="success" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Method */}
                <td className="p-3">
                  {tx.method ? (
                    <Badge variant="secondary" className="text-xs font-mono">
                      {tx.method}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Transfer</span>
                  )}
                </td>

                {/* From → To */}
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/address/${extractAddress(tx.from)}`}
                      className="font-mono text-xs text-blue-600 hover:underline"
                    >
                      {formatAddress(tx.from)}
                    </Link>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    {tx.to ? (
                      <Link
                        href={`/address/${extractAddress(tx.to)}`}
                        className="font-mono text-xs text-blue-600 hover:underline"
                      >
                        {formatAddress(tx.to.hash)}
                      </Link>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Contract Creation
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Value */}
                <td className="p-3 text-right">
                  <span className="font-mono text-xs font-semibold">
                    <Balance wei={tx.value} maxDecimals={4} />
                  </span>
                </td>

                {/* Age */}
                <td className="p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="whitespace-nowrap">
                      {formatTimeAgo(new Date(tx.timestamp))}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
