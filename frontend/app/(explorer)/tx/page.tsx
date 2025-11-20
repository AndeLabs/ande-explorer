'use client';

import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { api } from '@/lib/api/client';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import { TransactionsTable } from '@/components/transactions/TransactionsTable';
import { TransactionsStatsSidebar } from '@/components/transactions/TransactionsStatsSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Pagination } from '@/components/ui/pagination';
import { ExportButton } from '@/components/ui/export-button';
import { transactionsToCSV, downloadCSV, generateFilename } from '@/lib/utils/export';
import { ArrowRightLeft, Radio, RefreshCw, LayoutGrid, LayoutList } from 'lucide-react';
import { config } from '@/lib/config';

type ViewMode = 'cards' | 'table';

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('table'); // Default to table for better density
  const { data, isLoading, error, refetch, isFetching, dataUpdatedAt } = useTransactions(page);
  const queryClient = useQueryClient();
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

  // PREFETCH: Pre-cargar la siguiente página para navegación instantánea
  useEffect(() => {
    if (data?.next_page_params) {
      queryClient.prefetchQuery({
        queryKey: ['transactions', page + 1],
        queryFn: () => api.getTransactions(page + 1),
        staleTime: 60_000, // 1 minuto
      });
    }
  }, [page, data, queryClient]);

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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
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

        {/* View Mode Toggle + Real-time indicator + Export */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 px-3"
            >
              <LayoutList className="h-4 w-4 mr-1.5" />
              Table
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              Cards
            </Button>
          </div>

          {/* Live indicator (only on page 1) */}
          {page === 1 && (
            <div className="flex items-center gap-3">
              {/* Live badge */}
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
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
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
            </div>
          )}

          {/* Export Button */}
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

      {/* Main Content: Transactions + Stats Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        {/* Transactions List */}
        <div className="space-y-4 min-w-0">
          {viewMode === 'table' ? (
            <TransactionsTable transactions={data.items} newTxHashes={newTxHashes} />
          ) : (
            data.items.map((tx) => (
              <div
                key={tx.hash}
                className={`transition-all duration-500 ${
                  newTxHashes.has(tx.hash)
                    ? 'animate-pulse ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900'
                    : ''
                }`}
              >
                <TransactionCard
                  tx={tx}
                  showBlock
                  isNew={page === 1 && newTxHashes.has(tx.hash)}
                />
              </div>
            ))
          )}
        </div>

        {/* Stats Sidebar (Desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <TransactionsStatsSidebar recentTransactions={data.items} />
          </div>
        </div>
      </div>

      {/* Stats Cards (Mobile - below transactions) */}
      <div className="lg:hidden">
        <TransactionsStatsSidebar recentTransactions={data.items} />
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
