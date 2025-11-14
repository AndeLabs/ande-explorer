'use client';

import { useState } from 'react';
import { useBlocks } from '@/lib/hooks/useBlocks';
import { BlockCard } from '@/components/blocks/BlockCard';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Pagination } from '@/components/ui/pagination';
import { Package, Search } from 'lucide-react';

export default function BlocksPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch } = useBlocks(page);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Blocks</h1>
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Blocks</h1>
        <ErrorState
          title="Failed to load blocks"
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
        <h1 className="text-3xl font-bold">Blocks</h1>
        <EmptyState
          icon={Package}
          title="No blocks found"
          description="There are no blocks to display at this time."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blocks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest blocks on the {process.env.NEXT_PUBLIC_CHAIN_NAME} blockchain
          </p>
        </div>
      </div>

      {/* Blocks List */}
      <div className="space-y-4">
        {data.items.map((block, index) => (
          <BlockCard key={block.hash} block={block} isNew={page === 1 && index === 0} />
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
