/**
 * React hooks for WebSocket functionality
 */

import { useEffect, useState } from 'react';
import { wsClient, WS_EVENTS } from '@/lib/websocket/client';
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
 * @param limit Maximum number of blocks to keep
 */
export function useRealtimeBlocks(limit = 10) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const status = useWebSocketStatus();

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

  return { blocks, isConnected: status === 'connected' };
}

/**
 * Hook to receive real-time transactions
 * @param limit Maximum number of transactions to keep
 */
export function useRealtimeTransactions(limit = 20) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const status = useWebSocketStatus();

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

  return { transactions, isConnected: status === 'connected' };
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
