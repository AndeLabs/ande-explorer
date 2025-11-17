'use client';

import { useNetworkStats } from '@/lib/hooks/useNetworkStatsRPC';
import { useWatchBlocks } from '@/lib/hooks/useBlocksRPC';
import { StatsCard } from './StatsCard';
import { formatNumber } from '@/lib/utils/format';
import { Activity, Blocks, Clock, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function StatsGrid() {
  const { data: stats, isLoading } = useNetworkStats();
  const queryClient = useQueryClient();
  
  // Watch for new blocks via WebSocket and invalidate stats
  useWatchBlocks({
    onNewBlock: () => {
      queryClient.invalidateQueries({ queryKey: ['network-stats'] });
    },
  });

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Latest Block"
            value={stats ? `#${formatNumber(Number(stats.latestBlockNumber))}` : '-'}
            subtitle={stats?.latestBlock.timestamp ? new Date(Number(stats.latestBlock.timestamp) * 1000).toLocaleTimeString() : ''}
            icon={<Blocks className="h-6 w-6" />}
            loading={isLoading}
            colorClass="bg-primary/10 text-primary"
          />

          <StatsCard
            title="Gas Price"
            value={stats ? `${stats.gasPrice.gwei} Gwei` : '-'}
            subtitle="Current network fee"
            icon={<Zap className="h-6 w-6" />}
            loading={isLoading}
            colorClass="bg-secondary/10 text-secondary"
          />

          <StatsCard
            title="Network Usage"
            value={stats ? `${(stats.networkUtilization * 100).toFixed(1)}%` : '-'}
            subtitle="Gas utilization"
            icon={<Activity className="h-6 w-6" />}
            loading={isLoading}
            colorClass="bg-lavender/10 text-lavender-700"
          />

          <StatsCard
            title="Block Time"
            value={stats ? `${stats.avgBlockTime.toFixed(1)}s` : '-'}
            subtitle={stats ? `~${stats.tps.toFixed(2)} TPS` : 'Transactions per second'}
            icon={<Clock className="h-6 w-6" />}
            loading={isLoading}
            colorClass="bg-peach/10 text-peach-700"
          />
        </div>
      </div>
    </section>
  );
}
