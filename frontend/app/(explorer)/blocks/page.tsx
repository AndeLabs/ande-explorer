'use client';

import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBlocks } from '@/lib/hooks/useBlocks';
import { api } from '@/lib/api/client';
import { BlockCard } from '@/components/blocks/BlockCard';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Pagination } from '@/components/ui/pagination';
import { Package, Radio, RefreshCw } from 'lucide-react';
import { config } from '@/lib/config';

export default function BlocksPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch, isFetching, dataUpdatedAt } = useBlocks(page);
  const queryClient = useQueryClient();
  const [newBlockHashes, setNewBlockHashes] = useState<Set<string>>(new Set());
  const prevBlocksRef = useRef<string[]>([]);

  // Track new blocks for animation
  useEffect(() => {
    if (data?.items && page === 1) {
      const currentHashes = data.items.map(b => b.hash);
      const prevHashes = prevBlocksRef.current;

      // Find new blocks (hashes that weren't in previous data)
      if (prevHashes.length > 0) {
        const newHashes = currentHashes.filter(hash => !prevHashes.includes(hash));
        if (newHashes.length > 0) {
          setNewBlockHashes(new Set(newHashes));
          // Clear animation after 2 seconds
          setTimeout(() => setNewBlockHashes(new Set()), 2000);
        }
      }

      prevBlocksRef.current = currentHashes;
    }
  }, [data, page]);

  // PREFETCH: Pre-cargar la siguiente página para navegación instantánea
  useEffect(() => {
    if (data?.next_page_params) {
      // Prefetch siguiente página
      queryClient.prefetchQuery({
        queryKey: ['blocks', page + 1],
        queryFn: () => api.getBlocks(page + 1),
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
            Latest blocks on the {config.chain.name} blockchain
          </p>
        </div>

        {/* Real-time indicator */}
        {page === 1 && (
          <div className="flex items-center gap-3">
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
          </div>
        )}
      </div>

      {/* Blocks List */}
      <div className="space-y-4">
        {data.items.map((block, index) => (
          <div
            key={block.hash}
            className={`transition-all duration-500 ${
              newBlockHashes.has(block.hash)
                ? 'animate-pulse ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900'
                : ''
            }`}
          >
            <BlockCard
              block={block}
              isNew={page === 1 && newBlockHashes.has(block.hash)}
            />
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
