'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealtimeBlocks, useRealtimeTransactions } from '@/lib/hooks/useWebSocket';
import { formatTimeAgo, formatNumber, formatWeiToEther, formatAddress } from '@/lib/utils/format';
import Link from 'next/link';
import { Activity, Package, ArrowRightLeft, Circle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function RealtimeFeed() {
  const { blocks, isConnected: blocksConnected } = useRealtimeBlocks(5);
  const { transactions, isConnected: txConnected } = useRealtimeTransactions(10);

  const isConnected = blocksConnected && txConnected;

  if (!isConnected) {
    return (
      <section className="py-16">
        <div className="container-custom">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Live Activity</h2>
            <Badge variant="secondary" className="gap-1">
              <Circle className="h-2 w-2 fill-gray-400 text-gray-400" />
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
                <Skeleton className="h-64 w-full" />
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
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/20">
      <div className="container-custom">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Live Activity</h2>
            <p className="mt-1 text-muted-foreground">Real-time blockchain updates via WebSocket</p>
          </div>
          <Badge variant="success" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Circle className="h-2 w-2 animate-pulse fill-green-600 text-green-600" />
            Live
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Latest Blocks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Latest Blocks
                </CardTitle>
                <Link
                  href="/blocks"
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  View all →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blocks.length > 0 ? (
                  blocks.map((block) => (
                    <Link
                      key={block.hash}
                      href={`/blocks/${block.height}`}
                      className="block rounded-lg border p-3 transition-all hover:border-blue-400 hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="font-semibold">
                              Block #{formatNumber(block.height)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {block.tx_count} transactions
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {formatTimeAgo(new Date(block.timestamp))}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-lg border p-8 text-center text-muted-foreground">
                    Waiting for new blocks...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Latest Transactions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  Latest Transactions
                </CardTitle>
                <Link
                  href="/tx"
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  View all →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <Link
                      key={tx.hash}
                      href={`/tx/${tx.hash}`}
                      className="block rounded-lg border p-3 transition-all hover:border-blue-400 hover:bg-muted/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <code className="font-mono text-sm">
                              {formatAddress(tx.hash)}
                            </code>
                            <Badge
                              variant={
                                tx.status === 'ok'
                                  ? 'success'
                                  : tx.status === 'error'
                                  ? 'destructive'
                                  : 'warning'
                              }
                              className="text-xs"
                            >
                              {tx.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>From: {formatAddress(tx.from)}</span>
                            <ArrowRightLeft className="h-3 w-3" />
                            <span>To: {tx.to ? formatAddress(tx.to) : '[Contract Creation]'}</span>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="font-semibold">
                            {formatWeiToEther(tx.value)} ANDE
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tx.timestamp && formatTimeAgo(new Date(tx.timestamp))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-lg border p-8 text-center text-muted-foreground">
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
            <Activity className="mt-0.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Real-time Updates Powered by WebSocket
              </p>
              <p className="mt-1 text-blue-800 dark:text-blue-200">
                This feed is updated automatically as new blocks are mined and transactions are broadcast
                to the ANDE Chain network. No need to refresh the page!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
