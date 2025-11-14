'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTokens } from '@/lib/hooks/useTokens';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Pagination } from '@/components/ui/pagination';
import { formatNumber } from '@/lib/utils/format';
import { Coins, TrendingUp } from 'lucide-react';

export default function TokensPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useTokens({ page });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Tokens</h1>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Tokens</h1>
        <ErrorState
          title="Failed to load tokens"
          message={(error as Error).message}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Empty state
  if (!data || data.items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Tokens</h1>
        <EmptyState
          icon={Coins}
          title="No tokens found"
          description="There are no tokens to display at this time."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tokens</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ERC-20, ERC-721, and ERC-1155 tokens on {process.env.NEXT_PUBLIC_CHAIN_NAME}
          </p>
        </div>
      </div>

      {/* Tokens List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.items.map((token) => (
          <Link key={token.address} href={`/tokens/${token.address}`}>
            <Card className="p-6 transition-all hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {token.icon_url ? (
                    <img
                      src={token.icon_url}
                      alt={token.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600">
                      <Coins className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-600 hover:underline">
                      {token.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{token.symbol}</p>
                  </div>
                </div>
                <Badge variant="outline">{token.type}</Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Holders</span>
                  <p className="font-semibold">{formatNumber(parseInt(token.holders))}</p>
                </div>
                {token.total_supply && (
                  <div>
                    <span className="text-muted-foreground">Supply</span>
                    <p className="font-mono font-semibold">
                      {formatNumber(parseInt(token.total_supply))}
                    </p>
                  </div>
                )}
                {token.exchange_rate && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Price</span>
                    <p className="flex items-center gap-1 font-semibold">
                      ${parseFloat(token.exchange_rate).toFixed(6)}
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        hasNextPage={!!data.next_page_params}
        onPageChange={setPage}
        className="py-8"
      />
    </div>
  );
}
