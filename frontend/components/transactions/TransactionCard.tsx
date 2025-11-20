import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  formatTimeAgo,
  formatAddress,
  formatHash,
} from '@/lib/utils/format';
import {
  Balance,
  BlockNumberDisplay,
  CountDisplay,
} from '@/components/blockchain-numbers';
import type { Transaction } from '@/lib/types';
import { ArrowRight, Clock, Coins } from 'lucide-react';

interface TransactionCardProps {
  tx: Transaction;
  showBlock?: boolean;
  compact?: boolean;
  className?: string;
}

export function TransactionCard({
  tx,
  showBlock = true,
  compact = false,
  className = '',
}: TransactionCardProps) {
  const statusVariant = {
    ok: 'success' as const,
    error: 'destructive' as const,
    pending: 'warning' as const,
  };

  return (
    <Card className={`${compact ? 'p-4' : 'p-6'} transition-all hover:shadow-lg ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left Section */}
        <div className="flex-1 space-y-3">
          {/* Transaction Hash */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/tx/${tx.hash}`}
              className="font-mono text-sm text-blue-600 hover:underline sm:text-base"
            >
              {formatHash(tx.hash)}
            </Link>
            <Badge variant={statusVariant[tx.status]}>{tx.status.toUpperCase()}</Badge>
            {tx.method && (
              <Badge variant="outline" className="font-mono text-xs">
                {tx.method}
              </Badge>
            )}
          </div>

          {/* From → To */}
          <div className="space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">From:</span>
              <Link
                href={`/address/${tx.from}`}
                className="font-mono text-blue-600 hover:underline"
              >
                {formatAddress(tx.from)}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">To:</span>
              {tx.to ? (
                <Link
                  href={`/address/${tx.to}`}
                  className="font-mono text-blue-600 hover:underline"
                >
                  {formatAddress(tx.to)}
                </Link>
              ) : (
                <span className="italic text-muted-foreground">[Contract Creation]</span>
              )}
            </div>
          </div>

          {/* Block & Time */}
          {showBlock && tx.block && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>Block:</span>
                <Link href={`/blocks/${tx.block}`} className="text-blue-600 hover:underline">
                  <BlockNumberDisplay number={tx.block} />
                </Link>
              </div>
              {tx.timestamp && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(new Date(tx.timestamp))}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section - Value & Fee */}
        <div className="flex flex-col items-end gap-2 text-right">
          {/* Value */}
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-semibold">
              <Balance wei={tx.value} maxDecimals={6} copyOnClick />
            </span>
          </div>

          {/* Fee */}
          {tx.fee && (
            <div className="text-xs text-muted-foreground">
              Fee: <Balance wei={tx.fee.value} maxDecimals={6} />
            </div>
          )}

          {/* Gas */}
          {tx.gas_used && (
            <div className="text-xs text-muted-foreground">
              Gas: <CountDisplay count={tx.gas_used} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
