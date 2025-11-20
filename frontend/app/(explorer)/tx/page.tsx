'use client';

import { useState, useEffect, useRef } from 'react';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Pagination } from '@/components/ui/pagination';
import { ExportButton } from '@/components/ui/export-button';
import { transactionsToCSV, downloadCSV, generateFilename } from '@/lib/utils/export';
import { ArrowRightLeft, Radio, RefreshCw } from 'lucide-react';
import { config } from '@/lib/config';

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch, isFetching, dataUpdatedAt } = useTransactions(page);
  const [newTxHashes, setNewTxHashes] = useState<Set<string>>(new Set());
  const prevTxRef = useRef<string[]>([]);

  // Track new transactions for animation
  useEffect(() => {
    if (data?.items && page === 1) {
      const currentHashes = data.items.map(tx => tx.hash);
      const prevHashes = prevTxRef.current;

      if (prevHashes.length > 0) {
        const newHashes = currentHashes.filter(hash => !prevHashes.includes(hash));
        if (newHashes.length > 0) {
          setNewTxHashes(new Set(newHashes));
          setTimeout(() => setNewTxHashes(new Set()), 2000);
        }
      }

      prevTxRef.current = currentHashes;
    }
  }, [data, page]);

  // Format time since last update
  const getTimeSinceUpdate = () => {
    if (!dataUpdatedAt) return '';
    const seconds = Math.floor((Date.now() - dataUpdatedAt) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <ErrorState
          title="Failed to load transactions"
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
        <h1 className="text-3xl font-bold">Transactions</h1>
        <EmptyState
          icon={ArrowRightLeft}
          title="No transactions found"
          description="There are no transactions to display at this time."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest transactions on the {config.chain.name} blockchain
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Real-time indicator */}
          {page === 1 && (
            <>
              {/* Live indicator */}
              <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900/20">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  Live
                </span>
              </div>

              {/* Last update time */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {isFetching ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Radio className="h-3 w-3" />
                    <span>Updated {getTimeSinceUpdate()}</span>
                  </>
                )}
              </div>
            </>
          )}

          <ExportButton
            onExport={() => {
              const csv = transactionsToCSV(data.items);
              const filename = generateFilename('transactions');
              downloadCSV(csv, filename);
            }}
            disabled={!data || data.items.length === 0}
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {data.items.map((tx) => (
          <div
            key={tx.hash}
            className={`transition-all duration-500 ${
              newTxHashes.has(tx.hash)
                ? 'animate-pulse ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
                : ''
            }`}
          >
            <TransactionCard tx={tx} showBlock />
          </div>
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
