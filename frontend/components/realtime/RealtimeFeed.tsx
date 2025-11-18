'use client';

import React, { memo, useMemo, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealtimeBlocks, useRealtimeTransactions } from '@/lib/hooks/useWebSocket';
import { formatTimeAgo, formatNumber, formatWeiToEther, formatAddress } from '@/lib/utils/format';
import Link from 'next/link';
import { Activity, Package, ArrowRightLeft, Circle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Block, Transaction } from '@/lib/types';

// Memoized block item for performance
const BlockItem = memo(function BlockItem({
  block,
  isNew
}: {
  block: Block;
  isNew: boolean;
}) {
  const formattedHeight = useMemo(() => formatNumber(block.height), [block.height]);
  const formattedTime = useMemo(() => formatTimeAgo(new Date(block.timestamp)), [block.timestamp]);

  return (
    <Link
      href={`/blocks/${block.height}`}
      className={`
        block rounded-lg border p-3 transition-all duration-300
        hover:border-blue-400 hover:bg-muted/50
        ${isNew ? 'animate-slide-in-left border-blue-400 bg-blue-50/50 dark:bg-blue-900/10' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-semibold">
              Block #{formattedHeight}
            </div>
            <div className="text-sm text-muted-foreground">
              {block.tx_count} transactions
            </div>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          {formattedTime}
        </div>
      </div>
    </Link>
  );
});

// Memoized transaction item for performance
const TransactionItem = memo(function TransactionItem({
  tx,
  isNew
}: {
  tx: Transaction;
  isNew: boolean;
}) {
  const formattedHash = useMemo(() => formatAddress(tx.hash), [tx.hash]);
  const formattedFrom = useMemo(() => formatAddress(tx.from), [tx.from]);
  const formattedTo = useMemo(() => tx.to ? formatAddress(tx.to) : '[Contract Creation]', [tx.to]);
  const formattedValue = useMemo(() => formatWeiToEther(tx.value), [tx.value]);
  const formattedTime = useMemo(
    () => tx.timestamp ? formatTimeAgo(new Date(tx.timestamp)) : '',
    [tx.timestamp]
  );

  return (
    <Link
      href={`/tx/${tx.hash}`}
      className={`
        block rounded-lg border p-3 transition-all duration-300
        hover:border-blue-400 hover:bg-muted/50
        ${isNew ? 'animate-slide-in-right border-green-400 bg-green-50/50 dark:bg-green-900/10' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <code className="font-mono text-sm truncate">
              {formattedHash}
            </code>
            <Badge
              variant={
                tx.status === 'ok'
                  ? 'success'
                  : tx.status === 'error'
                  ? 'destructive'
                  : 'warning'
              }
              className="text-xs shrink-0"
            >
              {tx.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">From: {formattedFrom}</span>
            <ArrowRightLeft className="h-3 w-3 shrink-0" />
            <span className="truncate">To: {formattedTo}</span>
          </div>
        </div>
        <div className="ml-4 text-right shrink-0">
          <div className="font-semibold">
            {formattedValue} ANDE
          </div>
          <div className="text-xs text-muted-foreground">
            {formattedTime}
          </div>
        </div>
      </div>
    </Link>
  );
});

// Individual skeleton items for better UX
const BlockSkeleton = memo(function BlockSkeleton() {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
});

const TransactionSkeleton = memo(function TransactionSkeleton() {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="space-y-2 text-right">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
});

// Loading state with individual skeletons
const LoadingState = memo(function LoadingState() {
  return (
    <section className="py-16 bg-muted/20">
      <div className="container-custom">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Live Activity</h2>
            <p className="mt-1 text-muted-foreground">Loading blockchain data...</p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Circle className="h-2 w-2 animate-pulse fill-yellow-400 text-yellow-400" />
            Connecting...
          </Badge>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Latest Blocks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <BlockSkeleton key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Latest Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <TransactionSkeleton key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
});

export function RealtimeFeed() {
  const { blocks, isConnected: blocksConnected, isLoading: blocksLoading } = useRealtimeBlocks(5);
  const { transactions, isConnected: txConnected, isLoading: txLoading } = useRealtimeTransactions(10);
  const [isPending, startTransition] = useTransition();

  const isLoading = blocksLoading || txLoading;
  const isConnected = blocksConnected || txConnected;

  // Track new items for animation (items added in last 3 seconds)
  const newBlockHashes = useMemo(() => {
    if (blocks.length === 0) return new Set<string>();
    const threeSecondsAgo = Date.now() - 3000;
    return new Set(
      blocks
        .filter(b => new Date(b.timestamp).getTime() > threeSecondsAgo)
        .map(b => b.hash)
    );
  }, [blocks]);

  const newTxHashes = useMemo(() => {
    if (transactions.length === 0) return new Set<string>();
    const threeSecondsAgo = Date.now() - 3000;
    return new Set(
      transactions
        .filter(tx => tx.timestamp && new Date(tx.timestamp).getTime() > threeSecondsAgo)
        .map(tx => tx.hash)
    );
  }, [transactions]);

  // Show loading state
  if (isLoading && !isConnected) {
    return <LoadingState />;
  }

  return (
    <section className="py-16 bg-muted/20">
      <div className="container-custom">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Live Activity</h2>
            <p className="mt-1 text-muted-foreground">Real-time blockchain updates</p>
          </div>
          <Badge
            variant="success"
            className={`gap-1 transition-colors duration-300 ${
              isConnected
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}
          >
            <Circle className={`h-2 w-2 ${isConnected ? 'animate-pulse fill-green-600 text-green-600' : 'fill-yellow-600 text-yellow-600'}`} />
            {isConnected ? 'Live' : 'Reconnecting...'}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Latest Blocks */}
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Latest Blocks
                </CardTitle>
                <Link
                  href="/blocks"
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400 transition-colors"
                >
                  View all →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blocks.length > 0 ? (
                  blocks.map((block) => (
                    <BlockItem
                      key={block.hash}
                      block={block}
                      isNew={newBlockHashes.has(block.hash)}
                    />
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    <Package className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    Waiting for new blocks...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Latest Transactions */}
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  Latest Transactions
                </CardTitle>
                <Link
                  href="/tx"
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400 transition-colors"
                >
                  View all →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TransactionItem
                      key={tx.hash}
                      tx={tx}
                      isNew={newTxHashes.has(tx.hash)}
                    />
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                    <ArrowRightLeft className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    Waiting for new transactions...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info about real-time updates */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm dark:bg-blue-900/10">
          <div className="flex items-start gap-2">
            <Activity className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Real-time Updates Active
              </p>
              <p className="mt-1 text-blue-800 dark:text-blue-200">
                New blocks and transactions appear automatically as they're mined on the ANDE Chain network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
