'use client';

import { useWebSocketStatus } from '@/lib/hooks/useWebSocket';
import { Circle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WebSocketStatusProps {
  showLabel?: boolean;
  className?: string;
}

export function WebSocketStatus({ showLabel = true, className = '' }: WebSocketStatusProps) {
  const status = useWebSocketStatus();

  const statusConfig = {
    connected: {
      color: 'text-green-600 fill-green-600',
      animate: 'animate-pulse',
      label: 'Live',
      bgColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    connecting: {
      color: 'text-yellow-600 fill-yellow-600',
      animate: 'animate-spin',
      label: 'Connecting',
      bgColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    disconnected: {
      color: 'text-gray-400 fill-gray-400',
      animate: '',
      label: 'Offline',
      bgColor: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={`gap-1.5 ${config.bgColor} ${className}`}>
      <Circle className={`h-2 w-2 ${config.color} ${config.animate}`} />
      {showLabel && <span className="text-xs">{config.label}</span>}
    </Badge>
  );
}
