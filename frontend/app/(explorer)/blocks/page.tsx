'use client';

import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBlocks } from '@/lib/hooks/useBlocks';
import { api } from '@/lib/api/client';
import { BlockCard } from '@/components/blocks/BlockCard';
import { BlocksTable } from '@/components/blocks/BlocksTable';
import { BlocksStatsSidebar } from '@/components/blocks/BlocksStatsSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Pagination } from '@/components/ui/pagination';
import { Package, Radio, RefreshCw, LayoutGrid, LayoutList } from 'lucide-react';
import { config } from '@/lib/config';

type ViewMode = 'cards' | 'table';

export default function BlocksPage() {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('table'); // Default to table for better density
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
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Blocks</h1>
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

        {/* View Mode Toggle + Real-time indicator */}
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
        </div>
      </div>

      {/* Main Content: Blocks + Stats Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        {/* Blocks List */}
        <div className="space-y-4 min-w-0">
          {viewMode === 'table' ? (
            <BlocksTable blocks={data.items} newBlockHashes={newBlockHashes} />
          ) : (
            data.items.map((block) => (
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
            ))
          )}
        </div>

        {/* Stats Sidebar (Desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <BlocksStatsSidebar recentBlocks={data.items} />
          </div>
        </div>
      </div>

      {/* Stats Cards (Mobile - below blocks) */}
      <div className="lg:hidden">
        <BlocksStatsSidebar recentBlocks={data.items} />
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
