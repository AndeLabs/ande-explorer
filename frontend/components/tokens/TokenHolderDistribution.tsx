'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatNumber, formatAddress } from '@/lib/utils/format';
import { PieChartIcon, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TokenHolderDistributionProps {
  holders: any[];
  totalSupply: string;
  isLoading?: boolean;
}

// ANDE institutional colors
const COLORS = [
  '#2455B8', // Azul Profundo (primary)
  '#FF9F1C', // Naranja Vibrante
  '#BFA4FF', // Lavanda Suave
  '#FFC77D', // Durazno Claro
  '#6366F1', // Indigo
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
];

export function TokenHolderDistribution({ holders, totalSupply, isLoading }: TokenHolderDistributionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Holder Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!holders || holders.length === 0) {
    return null;
  }

  // Take top 10 holders for the chart
  const topHolders = holders.slice(0, 10);

  // Calculate total held by top holders
  const topHoldersTotal = topHolders.reduce((acc, holder) => {
    return acc + parseFloat(holder.value || '0');
  }, 0);

  // Calculate "Others" percentage
  const totalSupplyNum = parseFloat(totalSupply || '0');
  const othersPercentage = totalSupplyNum > 0
    ? ((totalSupplyNum - topHoldersTotal) / totalSupplyNum) * 100
    : 0;

  // Prepare data for pie chart
  const chartData = topHolders.map((holder, index) => ({
    name: holder.address.name || formatAddress(holder.address.hash),
    fullAddress: holder.address.hash,
    value: parseFloat(holder.value || '0'),
    percentage: totalSupplyNum > 0
      ? ((parseFloat(holder.value || '0') / totalSupplyNum) * 100).toFixed(2)
      : '0.00',
    fill: COLORS[index % COLORS.length],
  }));

  // Add "Others" if there are more holders
  if (othersPercentage > 0.01 && holders.length > 10) {
    chartData.push({
      name: 'Others',
      fullAddress: '',
      value: totalSupplyNum - topHoldersTotal,
      percentage: othersPercentage.toFixed(2),
      fill: '#9A9A9A', // Gris Medio
    });
  }

  // Custom label for the pie chart
  const renderLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-semibold">{data.name}</p>
          {data.fullAddress && (
            <p className="font-mono text-xs text-muted-foreground">{formatAddress(data.fullAddress)}</p>
          )}
          <p className="mt-1 text-sm">
            <span className="font-semibold">{formatNumber(data.value)}</span> tokens
          </p>
          <p className="text-sm text-muted-foreground">{data.percentage}% of total supply</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Holder Distribution
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Top {Math.min(holders.length, 10)} holders visualization
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie Chart */}
          <div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend with Stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4" />
              Distribution Breakdown
            </div>
            <div className="max-h-[280px] space-y-2 overflow-y-auto pr-2">
              {chartData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-2 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.fullAddress && (
                        <p className="font-mono text-xs text-muted-foreground">
                          {formatAddress(item.fullAddress)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{item.percentage}%</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(item.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Top 10 Control:</span>
                <span className="font-semibold">
                  {((topHoldersTotal / totalSupplyNum) * 100).toFixed(2)}%
                </span>
              </div>
              {holders.length > 10 && (
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remaining Holders:</span>
                  <span className="font-semibold">{holders.length - 10}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
