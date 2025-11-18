'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useToken, useTokenHolders, useTokenTransfers } from '@/lib/hooks/useTokens';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import {
  formatNumber,
  formatAddress,
  formatTimeAgo,
  copyToClipboard,
} from '@/lib/utils/format';
import { Coins, Users, ArrowRightLeft, Copy, Check, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TokenDetailsPage({ params }: { params: { address: string } }) {
  const { address } = params;
  const { data: token, isLoading, error, refetch } = useToken(address);
  const [holdersPage, setHoldersPage] = useState(1);
  const [transfersPage, setTransfersPage] = useState(1);
  const { data: holders } = useTokenHolders(address, { page: holdersPage });
  const { data: transfers } = useTokenTransfers(address, { page: transfersPage });
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(address);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <ErrorState
          title="Failed to load token"
          message={(error as Error).message}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!token) {
    return <ErrorState title="Token not found" message="The requested token could not be found." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {token.icon_url ? (
              <img src={token.icon_url} alt={token.name} className="h-12 w-12 rounded-full" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
                <Coins className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{token.name}</h1>
              <p className="text-lg text-muted-foreground">{token.symbol}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <code className="text-sm text-muted-foreground">{address}</code>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 w-6 p-0">
              {copied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        <Badge variant="outline" className="text-base">
          {token.type}
        </Badge>
      </div>

      {/* Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Holders Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5" />
              Holders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(parseInt(token.holders))}</div>
            <div className="mt-1 text-sm text-muted-foreground">Total holders</div>
          </CardContent>
        </Card>

        {/* Total Supply */}
        {token.total_supply && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Coins className="h-5 w-5" />
                Total Supply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(parseInt(token.total_supply))}
              </div>
              {token.decimals && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {token.decimals} decimals
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Price */}
        {token.exchange_rate && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5" />
                Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${parseFloat(token.exchange_rate).toFixed(6)}</div>
              {token.circulating_market_cap && (
                <div className="mt-1 text-sm text-muted-foreground">
                  MCap: ${formatNumber(parseFloat(token.circulating_market_cap))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contract Address */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <span className="text-sm text-muted-foreground">Contract Address:</span>
              <Link
                href={`/address/${token.address}`}
                className="font-mono text-sm text-blue-600 hover:underline"
              >
                {token.address}
              </Link>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <span className="text-sm text-muted-foreground">Token Type:</span>
              <Badge variant="outline">{token.type}</Badge>
            </div>
            {token.decimals && (
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                <span className="text-sm text-muted-foreground">Decimals:</span>
                <span className="font-mono font-semibold">{token.decimals}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="holders">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="holders" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Holders
          </TabsTrigger>
          <TabsTrigger value="transfers" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Transfers
          </TabsTrigger>
        </TabsList>

        {/* Holders Tab */}
        <TabsContent value="holders" className="space-y-4">
          {holders && holders.items && holders.items.length > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Top Holders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {holders.items.map((holder: any, index: number) => (
                      <div
                        key={holder.address.hash}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <span className="text-sm font-semibold">#{index + 1}</span>
                          </div>
                          <div>
                            <Link
                              href={`/address/${holder.address.hash}`}
                              className="font-mono text-sm text-blue-600 hover:underline"
                            >
                              {formatAddress(holder.address.hash)}
                            </Link>
                            {holder.address.name && (
                              <p className="text-xs text-muted-foreground">{holder.address.name}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-semibold">{holder.value}</div>
                          <div className="text-xs text-muted-foreground">
                            {((parseFloat(holder.value) / parseFloat(token.total_supply || '1')) * 100).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Pagination
                currentPage={holdersPage}
                hasNextPage={!!holders.next_page_params}
                onPageChange={setHoldersPage}
              />
            </>
          ) : (
            <EmptyState
              icon={Users}
              title="No holders found"
              description="There are no token holders to display."
            />
          )}
        </TabsContent>

        {/* Transfers Tab */}
        <TabsContent value="transfers" className="space-y-4">
          {transfers && transfers.items && transfers.items.length > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transfers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transfers.items.map((transfer: any) => (
                      <div key={transfer.tx_hash} className="rounded-lg border p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">From:</span>
                              <Link
                                href={`/address/${transfer.from.hash}`}
                                className="font-mono text-blue-600 hover:underline"
                              >
                                {formatAddress(transfer.from.hash)}
                              </Link>
                            </div>
                            <div className="flex items-center gap-2">
                              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">To:</span>
                              <Link
                                href={`/address/${transfer.to.hash}`}
                                className="font-mono text-blue-600 hover:underline"
                              >
                                {formatAddress(transfer.to.hash)}
                              </Link>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-semibold">{transfer.total.value}</div>
                            <Link
                              href={`/tx/${transfer.tx_hash}`}
                              className="text-xs text-muted-foreground hover:underline"
                            >
                              {formatTimeAgo(new Date(transfer.timestamp))}
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Pagination
                currentPage={transfersPage}
                hasNextPage={!!transfers.next_page_params}
                onPageChange={setTransfersPage}
              />
            </>
          ) : (
            <EmptyState
              icon={ArrowRightLeft}
              title="No transfers found"
              description="There are no token transfers to display."
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
