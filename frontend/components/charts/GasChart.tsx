'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Fuel } from 'lucide-react';

export function GasChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['gas-chart'],
    queryFn: () => api.getGasPrices(),
    refetchInterval: 15_000, // Refetch every 15 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Gas Price Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Mock data for demonstration (BlockScout might return different format)
  const chartData = data?.history || [
    { time: '00:00', slow: 20, average: 25, fast: 30 },
    { time: '04:00', slow: 18, average: 23, fast: 28 },
    { time: '08:00', slow: 22, average: 27, fast: 32 },
    { time: '12:00', slow: 25, average: 30, fast: 35 },
    { time: '16:00', slow: 23, average: 28, fast: 33 },
    { time: '20:00', slow: 21, average: 26, fast: 31 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5" />
          Gas Price Tracker
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gas prices over the last 24 hours (in Gwei)
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorFast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{ value: 'Gwei', angle: -90, position: 'insideLeft' }}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value} Gwei`, '']}
            />
            <Area
              type="monotone"
              dataKey="fast"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorFast)"
              name="Fast"
            />
            <Area
              type="monotone"
              dataKey="average"
              stroke="#f59e0b"
              fillOpacity={1}
              fill="url(#colorAverage)"
              name="Average"
            />
            <Area
              type="monotone"
              dataKey="slow"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorSlow)"
              name="Slow"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
