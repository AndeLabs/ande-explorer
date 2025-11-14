'use client';

import { useNetworkStats, useLatestBlock } from '@/lib/hooks/useNetworkStats';
import { StatsCard } from './StatsCard';
import { formatNumber } from '@/lib/utils/format';

export function StatsGrid() {
  const { data: stats, isLoading: statsLoading } = useNetworkStats();
  const { data: latestBlock, isLoading: blockLoading } = useLatestBlock();

  const loading = statsLoading || blockLoading;

  return (
    <section className="py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Latest Block"
            value={latestBlock ? `#${formatNumber(latestBlock.height)}` : '-'}
            icon="📦"
            loading={loading}
          />

          <StatsCard
            title="Total Transactions"
            value={stats ? formatNumber(stats.total_transactions) : '-'}
            icon="💸"
            loading={loading}
          />

          <StatsCard
            title="Total Addresses"
            value={stats ? formatNumber(stats.total_addresses) : '-'}
            icon="👤"
            loading={loading}
          />

          <StatsCard
            title="Average Block Time"
            value={stats ? `${stats.average_block_time.toFixed(2)}s` : '-'}
            icon="⏱️"
            loading={loading}
          />
        </div>
      </div>
    </section>
  );
}
