'use client';

import { Radio, RefreshCw } from 'lucide-react';

interface LiveIndicatorProps {
  /** Whether data is currently being fetched */
  isFetching?: boolean;
  /** Timestamp of last data update */
  dataUpdatedAt?: number;
  /** Whether to show the indicator */
  show?: boolean;
  /** Custom label for live indicator */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

/**
 * Reusable Live indicator component with pulsing dot and update timestamp
 */
export function LiveIndicator({
  isFetching = false,
  dataUpdatedAt,
  show = true,
  label = 'Live',
  size = 'md',
}: LiveIndicatorProps) {
  if (!show) return null;

  // Format time since last update
  const getTimeSinceUpdate = () => {
    if (!dataUpdatedAt) return '';
    const seconds = Math.floor((Date.now() - dataUpdatedAt) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';
  const iconSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3';
  const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Live indicator */}
      <div className={`flex items-center gap-1.5 sm:gap-2 rounded-full bg-green-100 ${padding} dark:bg-green-900/20`}>
        <span className={`relative flex ${dotSize}`}>
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75`}></span>
          <span className={`relative inline-flex ${dotSize} rounded-full bg-green-500`}></span>
        </span>
        <span className={`${textSize} font-medium text-green-700 dark:text-green-400`}>
          {label}
        </span>
      </div>

      {/* Last update time */}
      <div className={`flex items-center gap-1 sm:gap-1.5 ${textSize} text-muted-foreground`}>
        {isFetching ? (
          <>
            <RefreshCw className={`${iconSize} animate-spin`} />
            <span className="hidden sm:inline">Updating...</span>
          </>
        ) : (
          <>
            <Radio className={iconSize} />
            <span className="hidden sm:inline">Updated {getTimeSinceUpdate()}</span>
          </>
        )}
      </div>
    </div>
  );
}

interface AnimatedListItemProps {
  /** Unique key for the item */
  itemKey: string;
  /** Set of new item keys to animate */
  newItems: Set<string>;
  /** Ring color for animation */
  ringColor?: 'green' | 'blue' | 'orange' | 'purple';
  /** Children to render */
  children: React.ReactNode;
}

/**
 * Wrapper component that adds animation to new items in a list
 */
export function AnimatedListItem({
  itemKey,
  newItems,
  ringColor = 'green',
  children,
}: AnimatedListItemProps) {
  const isNew = newItems.has(itemKey);

  const ringColors = {
    green: 'ring-green-500',
    blue: 'ring-blue-500',
    orange: 'ring-orange-500',
    purple: 'ring-purple-500',
  };

  return (
    <div
      className={`transition-all duration-500 ${
        isNew
          ? `animate-pulse ring-2 ${ringColors[ringColor]} ring-offset-2 dark:ring-offset-gray-900`
          : ''
      }`}
    >
      {children}
    </div>
  );
}
