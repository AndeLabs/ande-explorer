'use client';

import { use } from 'react';
import Link from 'next/link';
import { useBlock } from '@/lib/hooks/useBlocks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import {
  formatTimeAgo,
  formatFullDate,
  formatNumber,
  formatAddress,
  formatWeiToEther,
  formatWeiToGwei,
  copyToClipboard,
} from '@/lib/utils/format';
import {
  Package,
  Clock,
  Zap,
  HardDrive,
  Hash,
  User,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react';
import { useState } from 'react';

export default function BlockDetailsPage({ params }: { params: Promise<{ height: string }> }) {
  const { height } = use(params);
  const { data: block, isLoading, error, refetch } = useBlock(height);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/blocks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blocks
          </Link>
        </Button>
        <ErrorState
          title="Failed to load block"
          message={(error as Error).message}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!block) {
    return (
      <ErrorState title="Block not found" message="The requested block could not be found." />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/blocks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Block #{formatNumber(block.height)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatTimeAgo(new Date(block.timestamp))} ({formatFullDate(new Date(block.timestamp))})
          </p>
        </div>
        <Badge variant="success">Confirmed</Badge>
      </div>

      {/* Block Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Block Height */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Height:</span>
              <span className="font-mono font-semibold">{formatNumber(block.height)}</span>
            </div>

            {/* Timestamp */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Timestamp:</span>
              <div className="text-right">
                <div className="font-medium">{formatTimeAgo(new Date(block.timestamp))}</div>
                <div className="text-xs text-muted-foreground">
                  {formatFullDate(new Date(block.timestamp))}
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Transactions:</span>
              <span className="font-semibold">{block.tx_count}</span>
            </div>

            {/* Miner */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Miner:</span>
              <Link
                href={`/address/${block.miner}`}
                className="font-mono text-sm text-blue-600 hover:underline"
              >
                {formatAddress(block.miner)}
              </Link>
            </div>

            {/* Block Reward */}
            {block.rewards && block.rewards.length > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Block Reward:</span>
                <span className="font-mono font-medium">
                  {formatWeiToEther(block.rewards[0].reward)} ETH
                </span>
              </div>
            )}

            {/* Size */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Size:</span>
              <span className="font-mono">{formatNumber(block.size)} bytes</span>
            </div>
          </CardContent>
        </Card>

        {/* Gas Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Gas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Gas Used */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Gas Used:</span>
              <span className="font-mono font-semibold">
                {formatNumber(parseInt(block.gas_used))}
              </span>
            </div>

            {/* Gas Limit */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Gas Limit:</span>
              <span className="font-mono">{formatNumber(parseInt(block.gas_limit))}</span>
            </div>

            {/* Gas Usage % */}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Gas Usage:</span>
              <div className="text-right">
                <div className="font-semibold">
                  {((parseInt(block.gas_used) / parseInt(block.gas_limit)) * 100).toFixed(2)}%
                </div>
                <div className="mt-2 h-2 w-32 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-blue-600"
                    style={{
                      width: `${(parseInt(block.gas_used) / parseInt(block.gas_limit)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Base Fee */}
            {block.base_fee_per_gas && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Base Fee:</span>
                <span className="font-mono">
                  {formatWeiToGwei(block.base_fee_per_gas)} Gwei
                </span>
              </div>
            )}

            {/* Burnt Fees */}
            {block.burnt_fees && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Burnt Fees:</span>
                <span className="font-mono text-orange-600">
                  🔥 {formatWeiToEther(block.burnt_fees)} ETH
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hashes Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Hashes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Block Hash */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Block Hash:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(block.hash, 'hash')}
                className="h-6"
              >
                {copiedField === 'hash' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <code className="block break-all rounded bg-muted p-3 font-mono text-sm">
              {block.hash}
            </code>
          </div>

          {/* Parent Hash */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Parent Hash:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(block.parent_hash, 'parent')}
                className="h-6"
              >
                {copiedField === 'parent' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Link
              href={`/blocks/${parseInt(height) - 1}`}
              className="block break-all rounded bg-muted p-3 font-mono text-sm text-blue-600 hover:underline"
            >
              {block.parent_hash}
            </Link>
          </div>

          {/* State Root */}
          {block.state_root && (
            <div>
              <div className="mb-2 text-sm font-medium text-muted-foreground">State Root:</div>
              <code className="block break-all rounded bg-muted p-3 font-mono text-sm">
                {block.state_root}
              </code>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Difficulty */}
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Difficulty:</span>
            <span className="font-mono">{formatNumber(parseInt(block.difficulty))}</span>
          </div>

          {/* Total Difficulty */}
          {block.total_difficulty && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Difficulty:</span>
              <span className="font-mono">{formatNumber(parseInt(block.total_difficulty))}</span>
            </div>
          )}

          {/* Nonce */}
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Nonce:</span>
            <code className="font-mono text-sm">{block.nonce}</code>
          </div>

          {/* Extra Data */}
          {block.extra_data && (
            <div>
              <div className="mb-2 text-sm text-muted-foreground">Extra Data:</div>
              <code className="block break-all rounded bg-muted p-3 font-mono text-sm">
                {block.extra_data}
              </code>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
