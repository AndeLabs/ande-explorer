'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatWeiToEther, formatAddress } from '@/lib/utils/format';
import { ArrowRightLeft, GitBranch, ArrowDown, AlertCircle } from 'lucide-react';
import type { InternalTransaction } from '@/lib/types';

interface InternalTransactionsTreeProps {
  transactions: InternalTransaction[];
}

export function InternalTransactionsTree({ transactions }: InternalTransactionsTreeProps) {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Internal Transactions ({transactions.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Internal calls made during transaction execution
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((itx, index) => (
            <div
              key={index}
              className={`relative rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                itx.error ? 'border-destructive/50 bg-destructive/5' : 'border-border'
              }`}
            >
              {/* Connection line to previous transaction */}
              {index > 0 && (
                <div className="absolute -top-3 left-6 h-3 w-0.5 bg-border" />
              )}

              <div className="flex items-start justify-between gap-4">
                {/* Left side - From/To */}
                <div className="flex-1 space-y-3">
                  {/* Index & Type */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      #{index}
                    </Badge>
                    <Badge variant="secondary">{itx.type}</Badge>
                    {itx.error && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Error
                      </Badge>
                    )}
                  </div>

                  {/* From */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">From:</span>
                    <Link
                      href={`/address/${itx.from}`}
                      className="font-mono text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {formatAddress(itx.from)}
                    </Link>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center gap-2 pl-2">
                    <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* To */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">To:</span>
                    {itx.to ? (
                      <Link
                        href={`/address/${itx.to}`}
                        className="font-mono text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {formatAddress(itx.to)}
                      </Link>
                    ) : itx.created_contract ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm italic text-muted-foreground">
                          [Contract Creation]
                        </span>
                        <Link
                          href={`/address/${itx.created_contract}`}
                          className="font-mono text-sm text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {formatAddress(itx.created_contract)}
                        </Link>
                      </div>
                    ) : (
                      <span className="text-sm italic text-muted-foreground">
                        [No recipient]
                      </span>
                    )}
                  </div>

                  {/* Error message */}
                  {itx.error && (
                    <div className="rounded-md bg-destructive/10 p-2">
                      <p className="text-sm text-destructive">
                        <strong>Error:</strong> {itx.error}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right side - Value & Gas */}
                <div className="flex flex-col items-end gap-2 text-right">
                  {/* Value */}
                  <div>
                    <div className="text-lg font-bold">
                      {formatWeiToEther(itx.value)} ANDE
                    </div>
                    {parseFloat(itx.value) === 0 && (
                      <div className="text-xs text-muted-foreground">No value transfer</div>
                    )}
                  </div>

                  {/* Gas info */}
                  {itx.gas_used && (
                    <div className="text-xs text-muted-foreground">
                      <div>Gas Used: {parseInt(itx.gas_used).toLocaleString()}</div>
                      {itx.gas && (
                        <div>
                          Limit: {parseInt(itx.gas).toLocaleString()} (
                          {((parseInt(itx.gas_used) / parseInt(itx.gas)) * 100).toFixed(1)}%)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowRightLeft className="h-4 w-4" />
            <span>Total Internal Calls</span>
          </div>
          <div className="font-semibold">{transactions.length}</div>
        </div>
      </CardContent>
    </Card>
  );
}
