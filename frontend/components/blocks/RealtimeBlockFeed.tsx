'use client';

import { useRealtimeBlocks } from '@/lib/hooks/useWebSocket';
import { BlockCard } from './BlockCard';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Activity, WifiOff } from 'lucide-react';

interface RealtimeBlockFeedProps {
  limit?: number;
  showStatus?: boolean;
}

export function RealtimeBlockFeed({ limit = 10, showStatus = true }: RealtimeBlockFeedProps) {
  const { blocks, isConnected } = useRealtimeBlocks(limit);

  return (
    <div className="space-y-4">
      {/* Status Indicator */}
      {showStatus && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Real-time Blocks</h2>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Activity className="h-4 w-4 animate-pulse text-green-600" />
                <Badge variant="success" className="gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                  Live
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">Disconnected</Badge>
              </>
            )}
          </div>
        </div>
      )}

      {/* Blocks Feed */}
      {blocks.length > 0 ? (
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <BlockCard
              key={block.hash}
              block={block}
              isNew={index === 0}
              className="animate-slide-up"
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            {isConnected ? (
              <Activity className="h-8 w-8 animate-pulse text-green-600" />
            ) : (
              <WifiOff className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="mb-2 text-lg font-semibold">
            {isConnected ? 'Waiting for new blocks...' : 'Disconnected'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isConnected
              ? 'New blocks will appear here automatically'
              : 'Connect to see real-time updates'}
          </p>
        </Card>
      )}
    </div>
  );
}
