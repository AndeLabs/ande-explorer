'use client';

import { useState } from 'react';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Pagination } from '@/components/ui/pagination';
import { ExportButton } from '@/components/ui/export-button';
import { transactionsToCSV, downloadCSV, generateFilename } from '@/lib/utils/export';
import { ArrowRightLeft } from 'lucide-react';

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useTransactions(page);

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
            Latest transactions on the {process.env.NEXT_PUBLIC_CHAIN_NAME} blockchain
          </p>
        </div>
        <ExportButton
          onExport={() => {
            const csv = transactionsToCSV(data.items);
            const filename = generateFilename('transactions');
            downloadCSV(csv, filename);
          }}
          disabled={!data || data.items.length === 0}
        />
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {data.items.map((tx) => (
          <TransactionCard key={tx.hash} tx={tx} showBlock />
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
