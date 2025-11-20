'use client';

import { useRealtimeBlockScoutStats } from '@/lib/hooks/useBlockScoutStats';
import { StatsCard } from './StatsCard';
import {
  formatBlockNumber,
  formatCount,
  formatPercentageValue,
} from '@/lib/utils/blockchain-numbers';
import { LiveIndicator } from '@/components/ui/live-indicator';
import { Activity, Blocks, Clock, Zap } from 'lucide-react';

export function StatsGrid() {
  const { data: stats, isLoading, error, isFetching, dataUpdatedAt } = useRealtimeBlockScoutStats();

  // Log errors for debugging
  if (error) {
    console.error('Stats loading error:', error);
  }

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container-custom">
        {/* Header with Live indicator */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Network Stats</h2>
          <LiveIndicator
            isFetching={isFetching}
            dataUpdatedAt={dataUpdatedAt}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Latest Block"
            value={stats ? `#${formatBlockNumber(stats.total_blocks).display}` : '-'}
            subtitle={stats ? `${stats.average_block_time.toFixed(1)}s avg` : ''}
            icon={<Blocks className="h-6 w-6" />}
            loading={isLoading}
            updating={isFetching}
            colorClass="bg-primary/10 text-primary"
          />

          <StatsCard
            title="Gas Price"
            value={stats ? `${stats.gas_prices.average.toFixed(2)} Gwei` : '-'}
            subtitle="Current network fee"
            icon={<Zap className="h-6 w-6" />}
            loading={isLoading}
            updating={isFetching}
            colorClass="bg-secondary/10 text-secondary"
          />

          <StatsCard
            title="Network Usage"
            value={stats ? formatPercentageValue(stats.network_utilization_percentage, { decimals: 1 }) : '-'}
            subtitle="Gas utilization"
            icon={<Activity className="h-6 w-6" />}
            loading={isLoading}
            updating={isFetching}
            colorClass="bg-lavender/10 text-lavender-700"
          />

          <StatsCard
            title="Block Time"
            value={stats ? `${stats.average_block_time.toFixed(1)}s` : '-'}
            subtitle={stats ? `${formatCount(stats.total_transactions).display} transactions` : 'Transactions per second'}
            icon={<Clock className="h-6 w-6" />}
            loading={isLoading}
            updating={isFetching}
            colorClass="bg-peach/10 text-peach-700"
          />
        </div>
      </div>
    </section>
  );
}
