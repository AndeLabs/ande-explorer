'use client';

/**
 * Network Info Widget
 *
 * Modular component that displays native coin information.
 * Automatically adapts based on available data and feature flags.
 */

import { useNetworkInfo } from '@/lib/hooks/useNetworkInfo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCount } from '@/lib/utils/blockchain-numbers';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Layers,
  Users,
  Activity,
  Info,
} from 'lucide-react';

export function NetworkInfoWidget() {
  const { network, stats, price, market, isLoading } = useNetworkInfo();

  // Don't show if feature is disabled
  if (!network.features.showNetworkInfo) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              {network.currency.name}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Native Currency
            </p>
          </div>
          <Badge variant="secondary" className="font-mono">
            {network.currency.symbol}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Currency Details */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Currency Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Symbol:</span>
              <p className="font-mono font-semibold">{network.currency.symbol}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Decimals:</span>
              <p className="font-mono font-semibold">{network.currency.decimals}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Chain ID:</span>
              <p className="font-mono font-semibold">{network.chainId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Type:</span>
              <p className="font-semibold capitalize">{network.type}</p>
            </div>
          </div>
        </div>

        {/* Price Info (if available and enabled) */}
        {network.features.showPrice && price?.hasPriceData && (
          <div className="space-y-3 border-t pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground">Price</h3>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">
                ${parseFloat(price.usd || '0').toFixed(2)}
              </div>
              {price.changePercentage !== null && price.changePercentage !== undefined && (
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    price.changePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {price.changePercentage >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(price.changePercentage).toFixed(2)}%
                </div>
              )}
            </div>
          </div>
        )}

        {/* Market Cap (if available and enabled) */}
        {network.features.showMarketCap && market?.hasMarketCapData && (
          <div className="space-y-3 border-t pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground">Market Cap</h3>
            <div className="text-xl font-bold">
              ${formatCount(market.cap || '0').display}
            </div>
          </div>
        )}

        {/* Network Stats */}
        <div className="space-y-3 border-t pt-6">
          <h3 className="text-sm font-semibold text-muted-foreground">Network Activity</h3>
          <div className="space-y-3">
            {stats.totalBlocks && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span>Total Blocks</span>
                </div>
                <span className="font-mono font-semibold">
                  {formatCount(stats.totalBlocks).display}
                </span>
              </div>
            )}

            {stats.totalTransactions && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>Total Transactions</span>
                </div>
                <span className="font-mono font-semibold">
                  {formatCount(stats.totalTransactions).display}
                </span>
              </div>
            )}

            {stats.totalAddresses && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Total Addresses</span>
                </div>
                <span className="font-mono font-semibold">
                  {formatCount(stats.totalAddresses).display}
                </span>
              </div>
            )}

            {stats.avgBlockTime && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>Avg Block Time</span>
                </div>
                <span className="font-semibold">{stats.avgBlockTime.toFixed(1)}s</span>
              </div>
            )}
          </div>
        </div>

        {/* About section (if enabled and content provided) */}
        {network.features.showAbout && network.about && (
          <div className="space-y-3 border-t pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground">About</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {network.about}
            </p>
          </div>
        )}

        {/* Price placeholder (if price feature enabled but no data yet) */}
        {network.features.showPrice && !price?.hasPriceData && (
          <div className="rounded-lg border border-dashed border-muted-foreground/20 bg-muted/20 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              💰 Price data will be available when {network.currency.symbol} is listed on exchanges
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
