'use client';

/**
 * Transactions Stats Sidebar
 *
 * Real-time statistics and visualizations for transactions page.
 * Shows transaction metrics, success rates, and network activity.
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useBlockScoutStats } from '@/lib/hooks/useBlockScoutStats';
import { formatCount } from '@/lib/utils/blockchain-numbers';
import { formatEther } from '@/lib/utils/format';
import {
  Activity,
  Zap,
  CheckCircle2,
  XCircle,
  TrendingUp,
  DollarSign,
  Gauge,
} from 'lucide-react';
import type { Transaction } from '@/lib/types';

interface TransactionsStatsSidebarProps {
  recentTransactions?: Transaction[];
}

export function TransactionsStatsSidebar({ recentTransactions = [] }: TransactionsStatsSidebarProps) {
  const { data: stats, isFetching } = useBlockScoutStats();

  // Calculate success rate from recent transactions
  const successRate = React.useMemo(() => {
    if (recentTransactions.length === 0) return 100;

    const successful = recentTransactions.filter(tx => tx.status === 'ok').length;
    return (successful / recentTransactions.length) * 100;
  }, [recentTransactions]);

  // Calculate average transaction value
  const avgTxValue = React.useMemo(() => {
    if (recentTransactions.length === 0) return '0';

    const total = recentTransactions.reduce((sum, tx) => {
      const value = parseFloat(tx.value || '0');
      return sum + value;
    }, 0);

    return (total / recentTransactions.length).toString();
  }, [recentTransactions]);

  // Calculate average gas price
  const avgGasPrice = React.useMemo(() => {
    if (recentTransactions.length === 0) return 0;

    const gasPrices = recentTransactions
      .filter(tx => tx.gas_price)
      .map(tx => parseFloat(tx.gas_price || '0'));

    if (gasPrices.length === 0) return 0;

    const total = gasPrices.reduce((sum, price) => sum + price, 0);
    return total / gasPrices.length / 1e9; // Convert to Gwei
  }, [recentTransactions]);

  // Count pending transactions
  const pendingCount = React.useMemo(() => {
    return recentTransactions.filter(tx => !tx.status).length;
  }, [recentTransactions]);

  return (
    <div className="space-y-4">
      {/* Transaction Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-600" />
            Transaction Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Success Rate */}
          <div>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Success Rate (Recent)</span>
              <span className="font-semibold">{successRate.toFixed(1)}%</span>
            </div>
            <Progress
              value={successRate}
              indicatorClassName={
                successRate > 95
                  ? 'bg-green-500'
                  : successRate > 80
                  ? 'bg-amber-500'
                  : 'bg-red-500'
              }
            />
          </div>

          {/* Transactions in Pool (if available) */}
          {stats && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Txs in Pool</span>
              <span className="font-semibold">
                {formatCount(stats.total_transactions).display}
              </span>
            </div>
          )}

          {/* Pending Count */}
          {pendingCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="font-semibold text-amber-600">{pendingCount}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            Transaction Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Total Transactions */}
          {stats && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Txns</span>
              <span className="font-mono font-semibold">
                {formatCount(stats.total_transactions).display}
              </span>
            </div>
          )}

          {/* Average Gas Price */}
          {avgGasPrice > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5" />
                Avg Gas Price
              </span>
              <span className="font-mono font-semibold">
                {avgGasPrice.toFixed(2)} Gwei
              </span>
            </div>
          )}

          {/* Average Transaction Value */}
          {recentTransactions.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                Avg Value
              </span>
              <span className="font-mono font-semibold">
                {formatEther(avgTxValue)} ANDE
              </span>
            </div>
          )}

          {/* Transactions per Block (if stats available) */}
          {stats && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Txns per Block</span>
              <span className="font-semibold">
                {(stats.total_transactions / stats.total_blocks).toFixed(1)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Breakdown */}
      {recentTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Successful Transactions */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                Successful
              </span>
              <span className="font-semibold text-green-600">
                {recentTransactions.filter(tx => tx.status === 'ok').length}
              </span>
            </div>

            {/* Failed Transactions */}
            {recentTransactions.some(tx => tx.status === 'error') && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5 text-red-600" />
                  Failed
                </span>
                <span className="font-semibold text-red-600">
                  {recentTransactions.filter(tx => tx.status === 'error').length}
                </span>
              </div>
            )}

            {/* Contract Creations */}
            {recentTransactions.some(tx => !tx.to) && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Contract Creates
                </span>
                <span className="font-semibold">
                  {recentTransactions.filter(tx => !tx.to).length}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Gas Prices (from network stats) */}
      {stats?.gas_prices && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gauge className="h-4 w-4 text-amber-600" />
              Gas Prices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Slow</span>
              <span className="font-mono font-semibold text-green-600">
                {stats.gas_prices.slow?.toFixed(2) || 0} Gwei
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average</span>
              <span className="font-mono font-semibold text-amber-600">
                {stats.gas_prices.average?.toFixed(2) || 0} Gwei
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fast</span>
              <span className="font-mono font-semibold text-red-600">
                {stats.gas_prices.fast?.toFixed(2) || 0} Gwei
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Indicator */}
      <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
        </span>
        <span className="text-sm font-medium text-green-700 dark:text-green-400">
          {isFetching ? 'Updating...' : 'Live'}
        </span>
      </div>
    </div>
  );
}
