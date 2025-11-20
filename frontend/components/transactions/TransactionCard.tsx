import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { ArrowRight, Clock, Coins, CheckCircle2, XCircle, AlertCircle, Zap, Flame } from 'lucide-react';

interface TransactionCardProps {
  tx: Transaction;
  showBlock?: boolean;
  compact?: boolean;
  isNew?: boolean;
  className?: string;
}

export function TransactionCard({
  tx,
  showBlock = true,
  compact = false,
  isNew = false,
  className = '',
}: TransactionCardProps) {
  const statusVariant = {
    ok: 'success' as const,
    error: 'destructive' as const,
    pending: 'warning' as const,
  };

  const StatusIcon = tx.status === 'ok' ? CheckCircle2 : tx.status === 'error' ? XCircle : AlertCircle;
  const statusColor = tx.status === 'ok' ? 'text-green-600' : tx.status === 'error' ? 'text-red-600' : 'text-amber-500';

  // Calculate gas usage percentage if gas_limit is available
  const gasPercentage = tx.gas_limit && tx.gas_used
    ? (parseInt(tx.gas_used) / parseInt(tx.gas_limit)) * 100
    : null;

  return (
    <Card className={`${compact ? 'p-4' : 'p-6'} transition-all hover:shadow-lg ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left Section */}
        <div className="flex-1 space-y-3">
          {/* Transaction Hash */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusIcon className={`h-5 w-5 ${statusColor}`} />
            <Link
              href={`/tx/${tx.hash}`}
              className="font-mono text-sm text-blue-600 hover:underline sm:text-base"
            >
              {formatHash(tx.hash)}
            </Link>
            <Badge variant={statusVariant[tx.status]}>{tx.status.toUpperCase()}</Badge>
            {isNew && (
              <Badge variant="success" className="ml-1">
                New
              </Badge>
            )}
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
                href={`/address/${tx.from.hash}`}
                className="font-mono text-blue-600 hover:underline"
              >
                {formatAddress(tx.from.hash)}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">To:</span>
              {tx.to ? (
                <Link
                  href={`/address/${tx.to.hash}`}
                  className="font-mono text-blue-600 hover:underline"
                >
                  {formatAddress(tx.to.hash)}
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

          {/* Gas Usage with Progress Bar */}
          {gasPercentage !== null && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">Gas Used:</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono font-medium">
                    <CountDisplay count={tx.gas_used || '0'} />
                  </span>
                  <span className="font-semibold text-muted-foreground">
                    {gasPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={gasPercentage}
                  className="h-2"
                  indicatorClassName={
                    gasPercentage > 90
                      ? 'bg-red-500'
                      : gasPercentage > 70
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }
                />
                <div className="text-xs text-muted-foreground">
                  Limit: <CountDisplay count={tx.gas_limit || '0'} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Value & Fee */}
        <div className="flex flex-col items-end gap-3 text-right">
          {/* Value */}
          <div>
            <div className="text-xs text-muted-foreground mb-1">Value</div>
            <div className="flex items-center gap-1.5">
              <Coins className="h-5 w-5 text-amber-500" />
              <span className="text-lg font-semibold">
                <Balance wei={tx.value} maxDecimals={6} copyOnClick />
              </span>
            </div>
          </div>

          {/* Fee */}
          {tx.fee && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Transaction Fee</div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm font-medium">
                  <Balance wei={tx.fee.value} maxDecimals={6} />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
