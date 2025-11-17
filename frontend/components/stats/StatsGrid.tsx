'use client';

import { useBlockScoutStats } from '@/lib/hooks/useBlockScoutStats';
import { StatsCard } from './StatsCard';
import { formatNumber } from '@/lib/utils/format';
import { Activity, Blocks, Clock, Zap } from 'lucide-react';

export function StatsGrid() {
  const { data: stats, isLoading, error } = useBlockScoutStats();

  // Log errors for debugging
  if (error) {
    console.error('Stats loading error:', error);
  }

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Latest Block"
            value={stats ? `#${formatNumber(Number(stats.total_blocks))}` : '-'}
            subtitle={stats ? `${stats.average_block_time.toFixed(1)}s avg` : ''}
            icon={<Blocks className="h-6 w-6" />}
            loading={isLoading}
            colorClass="bg-primary/10 text-primary"
          />

          <StatsCard
            title="Gas Price"
            value={stats ? `${stats.gas_prices.average.toFixed(2)} Gwei` : '-'}
            subtitle="Current network fee"
            icon={<Zap className="h-6 w-6" />}
            loading={isLoading}
            colorClass="bg-secondary/10 text-secondary"
          />

          <StatsCard
            title="Network Usage"
            value={stats ? `${stats.network_utilization_percentage.toFixed(1)}%` : '-'}
            subtitle="Gas utilization"
            icon={<Activity className="h-6 w-6" />}
            loading={isLoading}
            colorClass="bg-lavender/10 text-lavender-700"
          />

          <StatsCard
            title="Block Time"
            value={stats ? `${stats.average_block_time.toFixed(1)}s` : '-'}
            subtitle={stats ? `${Number(stats.total_transactions)} transactions` : 'Transactions per second'}
            icon={<Clock className="h-6 w-6" />}
            loading={isLoading}
            colorClass="bg-peach/10 text-peach-700"
          />
        </div>
      </div>
    </section>
  );
}
