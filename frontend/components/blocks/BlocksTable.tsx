'use client';

/**
 * Blocks Table - Compact and Dense View
 *
 * Optimized for desktop viewing with maximum information density.
 * Shows key block data in a scannable table format.
 */

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatTimeAgo, formatAddress, extractAddress } from '@/lib/utils/format';
import { BlockNumberDisplay, CountDisplay } from '@/components/blockchain-numbers';
import type { Block } from '@/lib/types';
import { Package, Zap, Flame, Clock } from 'lucide-react';

interface BlocksTableProps {
  blocks: Block[];
  newBlockHashes?: Set<string>;
}

export function BlocksTable({ blocks, newBlockHashes = new Set() }: BlocksTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-3 text-left font-semibold">Block</th>
            <th className="p-3 text-left font-semibold">Age</th>
            <th className="p-3 text-left font-semibold">Txns</th>
            <th className="p-3 text-left font-semibold">Miner</th>
            <th className="p-3 text-left font-semibold">Gas Used</th>
            <th className="p-3 text-right font-semibold">Size</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => {
            const gasPercentage = (parseInt(block.gas_used) / parseInt(block.gas_limit)) * 100;
            const isNew = newBlockHashes.has(block.hash);

            return (
              <tr
                key={block.hash}
                className={`border-b transition-all hover:bg-muted/30 ${
                  isNew ? 'animate-pulse bg-green-50 dark:bg-green-950/20' : ''
                }`}
              >
                {/* Block Number */}
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <Link
                      href={`/blocks/${block.height}`}
                      className="font-mono font-semibold text-blue-600 hover:underline"
                    >
                      <BlockNumberDisplay number={block.height} />
                    </Link>
                    {isNew && (
                      <Badge variant="success" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Age */}
                <td className="p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="whitespace-nowrap">
                      {formatTimeAgo(new Date(block.timestamp))}
                    </span>
                  </div>
                </td>

                {/* Transactions */}
                <td className="p-3">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-medium">{block.tx_count}</span>
                  </div>
                </td>

                {/* Miner */}
                <td className="p-3">
                  <Link
                    href={`/address/${extractAddress(block.miner)}`}
                    className="font-mono text-xs text-blue-600 hover:underline"
                  >
                    {formatAddress(block.miner)}
                  </Link>
                </td>

                {/* Gas Used with Progress Bar */}
                <td className="p-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono">
                        <CountDisplay count={block.gas_used} />
                      </span>
                      <span className="text-muted-foreground">
                        {gasPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={gasPercentage}
                      className="h-1.5"
                      indicatorClassName={
                        gasPercentage > 90
                          ? 'bg-red-500'
                          : gasPercentage > 70
                          ? 'bg-amber-500'
                          : 'bg-green-500'
                      }
                    />
                  </div>
                </td>

                {/* Size */}
                <td className="p-3 text-right">
                  <span className="font-mono text-xs text-muted-foreground">
                    <CountDisplay count={block.size} /> B
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
