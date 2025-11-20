import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatTimeAgo, formatAddress, extractAddress } from '@/lib/utils/format';
import {
  BlockNumberDisplay,
  CountDisplay,
} from '@/components/blockchain-numbers';
import { config } from '@/lib/config';
import type { Block } from '@/lib/types';
import { Package, Clock, Zap, Flame } from 'lucide-react';

interface BlockCardProps {
  block: Block;
  isNew?: boolean;
  className?: string;
}

export function BlockCard({ block, isNew, className = '' }: BlockCardProps) {
  const gasPercentage = (parseInt(block.gas_used) / parseInt(block.gas_limit)) * 100;

  return (
    <Card className={`p-6 transition-all hover:shadow-lg ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left Section */}
        <div className="flex-1 space-y-3">
          {/* Block Number */}
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <Link
              href={`/blocks/${block.height}`}
              prefetch={true}
              className="text-lg font-semibold text-blue-600 hover:underline"
            >
              Block #<BlockNumberDisplay number={block.height} />
            </Link>
            {isNew && (
              <Badge variant="success" className="ml-2">
                New
              </Badge>
            )}
          </div>

          {/* Block Info */}
          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
            {/* Miner */}
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground">Miner:</span>
              <Link
                href={`/address/${extractAddress(block.miner)}`}
                prefetch={true}
                className="font-mono text-blue-600 hover:underline"
              >
                {formatAddress(block.miner)}
              </Link>
            </div>

            {/* Transactions */}
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Transactions:</span>
              <span className="font-medium">{block.tx_count}</span>
            </div>

            {/* Gas Used with Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">Gas Used:</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono font-medium">
                    <CountDisplay count={block.gas_used} />
                  </span>
                  <span className="font-semibold text-muted-foreground">
                    {gasPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={gasPercentage}
                  className="h-2"
                  indicatorClassName={
                    gasPercentage > 90
                      ? 'bg-red-500'
                      : gasPercentage > 70
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }
                />
                <div className="text-xs text-muted-foreground">
                  Limit: <CountDisplay count={block.gas_limit} />
                </div>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatTimeAgo(new Date(block.timestamp))}
              </span>
            </div>
          </div>

          {/* Block Hash */}
          <div className="flex items-start gap-2 text-xs">
            <span className="text-muted-foreground">Hash:</span>
            <code className="rounded bg-muted px-2 py-1 font-mono">
              {block.hash.slice(0, 16)}...{block.hash.slice(-14)}
            </code>
          </div>
        </div>

        {/* Right Section - Size */}
        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-xs text-muted-foreground">Size</span>
          <span className="text-lg font-semibold">
            <CountDisplay count={block.size} /> bytes
          </span>
        </div>
      </div>
    </Card>
  );
}
