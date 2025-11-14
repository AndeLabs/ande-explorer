'use client';

import { TransactionChart } from '@/components/charts/TransactionChart';
import { GasChart } from '@/components/charts/GasChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNetworkStats } from '@/lib/hooks/useNetworkStats';
import { formatNumber, formatWeiToGwei } from '@/lib/utils/format';
import {
  BarChart3,
  TrendingUp,
  Zap,
  Activity,
  Users,
  Package,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { data: stats } = useNetworkStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Network Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time statistics and charts for {process.env.NEXT_PUBLIC_CHAIN_NAME}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blocks</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatNumber(stats.total_blocks) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average {stats?.average_block_time.toFixed(2)}s block time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatNumber(stats.total_transactions) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats ? formatNumber(stats.transactions_today) : '-'} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Addresses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatNumber(stats.total_addresses) : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Unique addresses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Utilization</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? `${stats.network_utilization_percentage.toFixed(1)}%` : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Current utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Gas Tracker */}
      {stats?.gas_prices && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Current Gas Prices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-2 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-muted-foreground">Slow</span>
                </div>
                <div className="text-2xl font-bold">
                  {stats.gas_prices.slow?.toFixed(2) || '-'} Gwei
                </div>
                <p className="text-xs text-muted-foreground">~60 seconds</p>
              </div>

              <div className="flex flex-col gap-2 rounded-lg border bg-orange-50 p-4 dark:bg-orange-900/10">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium text-muted-foreground">Average</span>
                </div>
                <div className="text-2xl font-bold">
                  {stats.gas_prices.average?.toFixed(2) || '-'} Gwei
                </div>
                <p className="text-xs text-muted-foreground">~30 seconds</p>
              </div>

              <div className="flex flex-col gap-2 rounded-lg border bg-red-50 p-4 dark:bg-red-900/10">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-muted-foreground">Fast</span>
                </div>
                <div className="text-2xl font-bold">
                  {stats.gas_prices.fast?.toFixed(2) || '-'} Gwei
                </div>
                <p className="text-xs text-muted-foreground">~15 seconds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TransactionChart />
        <GasChart />
      </div>

      {/* Additional Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Additional Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats?.gas_used_today && (
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Gas Used Today</span>
                <span className="text-lg font-semibold">
                  {formatNumber(stats.gas_used_today)}
                </span>
              </div>
            )}

            {stats?.total_gas_used && (
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Total Gas Used</span>
                <span className="text-lg font-semibold">
                  {formatNumber(stats.total_gas_used)}
                </span>
              </div>
            )}

            {stats?.coin_price && (
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Coin Price</span>
                <span className="text-lg font-semibold">${stats.coin_price}</span>
                {stats.coin_price_change_percentage && (
                  <span
                    className={`text-xs ${
                      stats.coin_price_change_percentage > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stats.coin_price_change_percentage > 0 ? '+' : ''}
                    {stats.coin_price_change_percentage.toFixed(2)}%
                  </span>
                )}
              </div>
            )}

            {stats?.market_cap && (
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Market Cap</span>
                <span className="text-lg font-semibold">${formatNumber(stats.market_cap)}</span>
              </div>
            )}

            {stats?.tvl && (
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Total Value Locked</span>
                <span className="text-lg font-semibold">${formatNumber(stats.tvl)}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Average Block Time</span>
              <span className="text-lg font-semibold">
                {stats?.average_block_time.toFixed(2)}s
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
