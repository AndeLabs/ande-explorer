'use client';

/**
 * Blocks Stats Sidebar
 *
 * Real-time statistics and visualizations for blocks page.
 * Shows network health, recent block times, and gas usage trends.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useBlockScoutStats } from '@/lib/hooks/useBlockScoutStats';
import { formatCount } from '@/lib/utils/blockchain-numbers';
import {
  Activity,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Layers,
  Gauge,
} from 'lucide-react';
import type { Block } from '@/lib/types';

interface BlocksStatsSidebarProps {
  recentBlocks?: Block[];
}

export function BlocksStatsSidebar({ recentBlocks = [] }: BlocksStatsSidebarProps) {
  const { data: stats, isFetching } = useBlockScoutStats();

  // Calculate average block time from recent blocks
  const avgRecentBlockTime = React.useMemo(() => {
    if (recentBlocks.length < 2) return null;

    const times: number[] = [];
    for (let i = 0; i < recentBlocks.length - 1 && i < 10; i++) {
      const current = new Date(recentBlocks[i].timestamp).getTime();
      const next = new Date(recentBlocks[i + 1].timestamp).getTime();
      times.push((current - next) / 1000);
    }

    return times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : null;
  }, [recentBlocks]);

  // Calculate average gas usage from recent blocks
  const avgGasUsage = React.useMemo(() => {
    if (recentBlocks.length === 0) return 0;

    const gasPercentages = recentBlocks
      .slice(0, 10)
      .map(block => (parseInt(block.gas_used) / parseInt(block.gas_limit)) * 100);

    return gasPercentages.reduce((a, b) => a + b, 0) / gasPercentages.length;
  }, [recentBlocks]);

  return (
    <div className="space-y-4">
      {/* Network Health */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-600" />
            Network Health
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Network Utilization */}
          <div>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Utilization</span>
              <span className="font-semibold">
                {stats?.network_utilization_percentage?.toFixed(1) || 0}%
              </span>
            </div>
            <Progress
              value={stats?.network_utilization_percentage || 0}
              indicatorClassName={
                (stats?.network_utilization_percentage || 0) > 80
                  ? 'bg-red-500'
                  : (stats?.network_utilization_percentage || 0) > 60
                  ? 'bg-amber-500'
                  : 'bg-green-500'
              }
            />
          </div>

          {/* Average Gas Usage (Recent 10 blocks) */}
          <div>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Avg Gas (10 blocks)</span>
              <span className="font-semibold">{avgGasUsage.toFixed(1)}%</span>
            </div>
            <Progress
              value={avgGasUsage}
              indicatorClassName={
                avgGasUsage > 80
                  ? 'bg-red-500'
                  : avgGasUsage > 60
                  ? 'bg-amber-500'
                  : 'bg-green-500'
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Block Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            Block Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Latest Block */}
          {stats && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Latest Block</span>
              <span className="font-mono font-semibold">
                #{formatCount(stats.total_blocks).display}
              </span>
            </div>
          )}

          {/* Average Block Time (Network) */}
          {stats && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Avg Time (Global)
              </span>
              <span className="font-semibold">
                {stats.average_block_time.toFixed(1)}s
              </span>
            </div>
          )}

          {/* Average Block Time (Recent) */}
          {avgRecentBlockTime !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Time (Recent)</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">
                  {avgRecentBlockTime.toFixed(1)}s
                </span>
                {stats && (
                  avgRecentBlockTime < stats.average_block_time ? (
                    <TrendingDown className="h-3.5 w-3.5 text-green-600" />
                  ) : avgRecentBlockTime > stats.average_block_time ? (
                    <TrendingUp className="h-3.5 w-3.5 text-red-600" />
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Total Transactions */}
          {stats && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" />
                Total Txns
              </span>
              <span className="font-mono font-semibold">
                {formatCount(stats.total_transactions).display}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gas Prices */}
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

// Add React import at top
import * as React from 'react';
