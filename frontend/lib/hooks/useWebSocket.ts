/**
 * React hooks for real-time data
 * Uses WebSocket when available, falls back to fast polling for Sonic-like speed
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { wsClient, WS_EVENTS } from '@/lib/websocket/client';
import { api } from '@/lib/api/client';
import type { Block, Transaction } from '@/lib/types';

// Polling intervals for different data types
const POLLING_INTERVALS = {
  BLOCKS: 2000,      // 2s - new blocks ~5s, so 2s is responsive
  TRANSACTIONS: 2000, // 2s - same as blocks
  STATS: 5000,       // 5s - stats don't change as fast
  FAST: 1000,        // 1s - for immediate feel
} as const;

/**
 * Hook to get connection status (WebSocket or polling)
 */
export function useWebSocketStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    wsClient.connect();

    const updateStatus = () => {
      const wsStatus = wsClient.getStatus();
      setStatus(wsStatus === 'connected' ? 'connected' : isPolling ? 'connected' : wsStatus);
    };

    const unsubscribeConnect = wsClient.subscribe(WS_EVENTS.CONNECT, () => {
      setIsPolling(false);
      updateStatus();
    });

    const unsubscribeDisconnect = wsClient.subscribe(WS_EVENTS.DISCONNECT, () => {
      setIsPolling(true);
      updateStatus();
    });

    // After 2 seconds, if still not connected, enable polling
    const pollTimer = setTimeout(() => {
      if (wsClient.getStatus() !== 'connected') {
        setIsPolling(true);
        setStatus('connected'); // Polling counts as "connected"
      }
    }, 2000);

    updateStatus();

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
      clearTimeout(pollTimer);
    };
  }, [isPolling]);

  return { status, isPolling };
}

/**
 * Hook to receive real-time blocks with fast polling fallback
 */
export function useRealtimeBlocks(limit = 10) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialData, setHasInitialData] = useState(false);
  const { status, isPolling } = useWebSocketStatus();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastBlockHeight = useRef<number>(0);

  // Fetch blocks function
  const fetchBlocks = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);

      const response = await api.getBlocks(1);
      if (response.items && response.items.length > 0) {
        const newBlocks = response.items.slice(0, limit);

        // Check if we have new blocks
        const latestHeight = newBlocks[0]?.height || 0;
        if (latestHeight > lastBlockHeight.current) {
          lastBlockHeight.current = latestHeight;
          setBlocks(newBlocks);
        } else if (!hasInitialData) {
          setBlocks(newBlocks);
        }

        setHasInitialData(true);
      }
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [limit, hasInitialData]);

  // Initial fetch
  useEffect(() => {
    fetchBlocks(true);
  }, [fetchBlocks]);

  // Polling fallback when WebSocket is not available
  useEffect(() => {
    if (isPolling && hasInitialData) {
      // Start fast polling
      pollingRef.current = setInterval(() => {
        fetchBlocks(false);
      }, POLLING_INTERVALS.BLOCKS);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }
  }, [isPolling, hasInitialData, fetchBlocks]);

  // WebSocket subscription
  useEffect(() => {
    if (status !== 'connected' || isPolling) return;

    const unsubscribe = wsClient.subscribe(WS_EVENTS.NEW_BLOCK, (block: Block) => {
      setBlocks((prev) => {
        const newBlocks = [block, ...prev];
        return newBlocks.slice(0, limit);
      });
      lastBlockHeight.current = block.height;
    });

    return unsubscribe;
  }, [status, isPolling, limit]);

  return {
    blocks,
    isConnected: hasInitialData,
    isLoading,
    isPolling,
  };
}

/**
 * Hook to receive real-time transactions with fast polling fallback
 */
export function useRealtimeTransactions(limit = 20) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialData, setHasInitialData] = useState(false);
  const { status, isPolling } = useWebSocketStatus();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const seenTxHashes = useRef<Set<string>>(new Set());

  // Fetch transactions function
  const fetchTransactions = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);

      const response = await api.getTransactions(1);
      if (response.items && response.items.length > 0) {
        const newTxs = response.items.slice(0, limit);

        // Check for new transactions
        const hasNew = newTxs.some(tx => !seenTxHashes.current.has(tx.hash));

        if (hasNew || !hasInitialData) {
          // Update seen hashes
          newTxs.forEach(tx => seenTxHashes.current.add(tx.hash));
          // Keep set from growing too large
          if (seenTxHashes.current.size > 1000) {
            const txArray = Array.from(seenTxHashes.current);
            seenTxHashes.current = new Set(txArray.slice(-500));
          }

          setTransactions(newTxs);
        }

        setHasInitialData(true);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [limit, hasInitialData]);

  // Initial fetch
  useEffect(() => {
    fetchTransactions(true);
  }, [fetchTransactions]);

  // Polling fallback
  useEffect(() => {
    if (isPolling && hasInitialData) {
      pollingRef.current = setInterval(() => {
        fetchTransactions(false);
      }, POLLING_INTERVALS.TRANSACTIONS);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }
  }, [isPolling, hasInitialData, fetchTransactions]);

  // WebSocket subscription
  useEffect(() => {
    if (status !== 'connected' || isPolling) return;

    const unsubscribe = wsClient.subscribe(WS_EVENTS.NEW_TRANSACTION, (tx: Transaction) => {
      setTransactions((prev) => {
        const newTxs = [tx, ...prev];
        return newTxs.slice(0, limit);
      });
      seenTxHashes.current.add(tx.hash);
    });

    return unsubscribe;
  }, [status, isPolling, limit]);

  return {
    transactions,
    isConnected: hasInitialData,
    isLoading,
    isPolling,
  };
}

/**
 * Hook to receive pending transactions
 */
export function useRealtimePendingTransactions(limit = 10) {
  const [pendingTxs, setPendingTxs] = useState<Transaction[]>([]);
  const { status, isPolling } = useWebSocketStatus();

  useEffect(() => {
    if (status !== 'connected' || isPolling) return;

    const unsubscribe = wsClient.subscribe(
      WS_EVENTS.NEW_PENDING_TRANSACTION,
      (tx: Transaction) => {
        setPendingTxs((prev) => {
          const newTxs = [tx, ...prev];
          return newTxs.slice(0, limit);
        });
      }
    );

    return unsubscribe;
  }, [status, isPolling, limit]);

  return { pendingTxs, isConnected: status === 'connected' };
}

/**
 * Hook to subscribe to address updates
 */
export function useAddressUpdates(address: string | null) {
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const { status, isPolling } = useWebSocketStatus();

  useEffect(() => {
    if (status !== 'connected' || !address || isPolling) return;

    wsClient.emit('subscribe_address', { address });

    const unsubscribe = wsClient.subscribe(WS_EVENTS.ADDRESS_UPDATE, (data: any) => {
      if (data.address === address) {
        setLastUpdate(data);
      }
    });

    return () => {
      wsClient.emit('unsubscribe_address', { address });
      unsubscribe();
    };
  }, [status, address, isPolling]);

  return lastUpdate;
}

/**
 * Hook to receive network stats with fast polling
 */
export function useRealtimeStats() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { status, isPolling } = useWebSocketStatus();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getNetworkStats();
      setStats(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Polling
  useEffect(() => {
    pollingRef.current = setInterval(fetchStats, POLLING_INTERVALS.STATS);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchStats]);

  // WebSocket subscription
  useEffect(() => {
    if (status !== 'connected' || isPolling) return;

    const unsubscribe = wsClient.subscribe(WS_EVENTS.STATS_UPDATE, (data: any) => {
      setStats(data);
    });

    return unsubscribe;
  }, [status, isPolling]);

  return { stats, isConnected: !isLoading, isLoading };
}

/**
 * Hook for ultra-fast polling (1 second intervals)
 * Use sparingly - only for critical real-time data
 */
export function useFastPolling<T>(
  fetchFn: () => Promise<T>,
  interval: number = POLLING_INTERVALS.FAST
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const fetch = useCallback(async () => {
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetch();
    pollingRef.current = setInterval(fetch, interval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetch, interval]);

  return { data, isLoading, error };
}
