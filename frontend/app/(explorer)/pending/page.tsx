'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import { Clock, Activity, Zap } from 'lucide-react';
import { config } from '@/lib/config';

export default function PendingTransactionsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', 'pending'],
    queryFn: async () => {
      // BlockScout API v2 endpoint for pending transactions
      try {
        return await api.getTransactions(1); // Will be filtered for pending in future
      } catch (err) {
        return { items: [], next_page_params: null };
      }
    },
    refetchInterval: 3_000, // Refetch every 3 seconds for mempool updates
    staleTime: 1_000,
  });

  // Filter only pending transactions
  const pendingTxs = data?.items?.filter(tx => tx.status === 'pending') || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load pending transactions"
        message={(error as Error).message}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Pending Transactions</h1>
        <p className="mt-2 text-muted-foreground">
          Transactions waiting to be included in the next block
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5" />
              Pending Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingTxs.length}</div>
            <p className="text-sm text-muted-foreground">
              Transactions in mempool
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5" />
              Update Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3s</div>
            <p className="text-sm text-muted-foreground">
              Auto-refresh interval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5" />
              Avg Block Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">~12s</div>
            <p className="text-sm text-muted-foreground">
              Expected confirmation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Transactions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Transactions</CardTitle>
            <Badge variant="secondary" className="animate-pulse">
              <Activity className="mr-1 h-3 w-3" />
              Live
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            These transactions are waiting to be confirmed in the next block
          </p>
        </CardHeader>
        <CardContent>
          {pendingTxs.length > 0 ? (
            <div className="space-y-4">
              {pendingTxs.map((tx) => (
                <TransactionCard key={tx.hash} tx={tx} showBlock={false} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No pending transactions"
              description="The mempool is empty. All transactions have been included in blocks."
            />
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>About Pending Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            Pending transactions are broadcast to the network but haven't been included in a block yet.
            They are stored in the mempool (memory pool) until miners/validators pick them up.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold">Why transactions are pending:</h4>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                <li>Waiting in the mempool queue</li>
                <li>Low gas price compared to others</li>
                <li>Network congestion</li>
                <li>Nonce gaps in transaction sequence</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Transaction priority:</h4>
              <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
                <li>Higher gas price = faster confirmation</li>
                <li>ANDE Chain average block time: ~12s</li>
                <li>Auto-refresh every 3 seconds</li>
                <li>Transactions may drop if gas too low</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
