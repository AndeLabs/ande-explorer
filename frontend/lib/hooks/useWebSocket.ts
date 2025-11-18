/**
 * React hooks for WebSocket functionality
 * Now with initial data loading via REST API for robustness
 */

import { useEffect, useState } from 'react';
import { wsClient, WS_EVENTS } from '@/lib/websocket/client';
import { api } from '@/lib/api/client';
import type { Block, Transaction } from '@/lib/types';

/**
 * Hook to get WebSocket connection status
 */
export function useWebSocketStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  useEffect(() => {
    wsClient.connect();

    const updateStatus = () => {
      setStatus(wsClient.getStatus());
    };

    // Update status on connect/disconnect
    const unsubscribeConnect = wsClient.subscribe(WS_EVENTS.CONNECT, updateStatus);
    const unsubscribeDisconnect = wsClient.subscribe(WS_EVENTS.DISCONNECT, updateStatus);

    // Initial status
    updateStatus();

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
    };
  }, []);

  return status;
}

/**
 * Hook to receive real-time blocks
 * Fetches initial data via API, then updates via WebSocket
 * @param limit Maximum number of blocks to keep
 */
export function useRealtimeBlocks(limit = 10) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialData, setHasInitialData] = useState(false);
  const status = useWebSocketStatus();

  // Fetch initial data via REST API
  useEffect(() => {
    const fetchInitialBlocks = async () => {
      try {
        const response = await api.getBlocks(1);
        if (response.items && response.items.length > 0) {
          setBlocks(response.items.slice(0, limit));
          setHasInitialData(true);
        }
      } catch (error) {
        console.error('Failed to fetch initial blocks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialBlocks();
  }, [limit]);

  // Subscribe to WebSocket for real-time updates
  useEffect(() => {
    if (status !== 'connected') return;

    const unsubscribe = wsClient.subscribe(WS_EVENTS.NEW_BLOCK, (block: Block) => {
      setBlocks((prev) => {
        const newBlocks = [block, ...prev];
        return newBlocks.slice(0, limit);
      });
    });

    return unsubscribe;
  }, [status, limit]);

  // Consider connected if we have initial data (even without WebSocket)
  return {
    blocks,
    isConnected: hasInitialData || status === 'connected',
    isLoading
  };
}

/**
 * Hook to receive real-time transactions
 * Fetches initial data via API, then updates via WebSocket
 * @param limit Maximum number of transactions to keep
 */
export function useRealtimeTransactions(limit = 20) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialData, setHasInitialData] = useState(false);
  const status = useWebSocketStatus();

  // Fetch initial data via REST API
  useEffect(() => {
    const fetchInitialTransactions = async () => {
      try {
        const response = await api.getTransactions(1);
        if (response.items && response.items.length > 0) {
          setTransactions(response.items.slice(0, limit));
          setHasInitialData(true);
        }
      } catch (error) {
        console.error('Failed to fetch initial transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialTransactions();
  }, [limit]);

  // Subscribe to WebSocket for real-time updates
  useEffect(() => {
    if (status !== 'connected') return;

    const unsubscribe = wsClient.subscribe(WS_EVENTS.NEW_TRANSACTION, (tx: Transaction) => {
      setTransactions((prev) => {
        const newTxs = [tx, ...prev];
        return newTxs.slice(0, limit);
      });
    });

    return unsubscribe;
  }, [status, limit]);

  // Consider connected if we have initial data (even without WebSocket)
  return {
    transactions,
    isConnected: hasInitialData || status === 'connected',
    isLoading
  };
}

/**
 * Hook to receive pending transactions
 * @param limit Maximum number of pending txs to keep
 */
export function useRealtimePendingTransactions(limit = 10) {
  const [pendingTxs, setPendingTxs] = useState<Transaction[]>([]);
  const status = useWebSocketStatus();

  useEffect(() => {
    if (status !== 'connected') return;

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
  }, [status, limit]);

  return { pendingTxs, isConnected: status === 'connected' };
}

/**
 * Hook to subscribe to address updates
 * @param address Address to watch
 */
export function useAddressUpdates(address: string | null) {
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const status = useWebSocketStatus();

  useEffect(() => {
    if (status !== 'connected' || !address) return;

    // Subscribe to address-specific channel
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
  }, [status, address]);

  return lastUpdate;
}

/**
 * Hook to receive network stats updates
 */
export function useRealtimeStats() {
  const [stats, setStats] = useState<any>(null);
  const status = useWebSocketStatus();

  useEffect(() => {
    if (status !== 'connected') return;

    const unsubscribe = wsClient.subscribe(WS_EVENTS.STATS_UPDATE, (data: any) => {
      setStats(data);
    });

    return unsubscribe;
  }, [status]);

  return { stats, isConnected: status === 'connected' };
}
