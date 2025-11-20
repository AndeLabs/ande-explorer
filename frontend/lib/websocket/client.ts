/**
 * WebSocket client for real-time updates from BlockScout
 * Handles connection, reconnection, and event subscriptions
 */

import { io, Socket } from 'socket.io-client';
import { config } from '@/lib/config';

type EventCallback = (data: any) => void;

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isConnecting = false;

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.socket?.connected || this.isConnecting || !config.features.enableWebSockets) {
      return;
    }

    this.isConnecting = true;

    try {
      this.socket = io(config.api.wsUrl, {
        // BlockScout uses Phoenix Channels at /socket path
        path: '/socket/websocket',
        // Allow fallback to polling if WebSocket fails
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 30000, // Increased max delay
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 30000, // Increased timeout for slow networks
        // Performance optimizations
        perMessageDeflate: false, // Phoenix doesn't use this
        pingInterval: 30000, // Match backend keepalive
        pingTimeout: 90000, // Longer timeout for stability
        // Reuse connection
        forceNew: false,
        multiplex: true,
        rememberUpgrade: true,
        autoConnect: true,
      });

      this.setupEventListeners();
      this.isConnecting = false;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
    }
  }

  /**
   * Setup connection event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  /**
   * Subscribe to an event
   * @param event Event name
   * @param callback Callback function
   * @returns Unsubscribe function
   */
  subscribe(event: string, callback: EventCallback) {
    if (!this.socket) {
      this.connect();
    }

    if (!this.socket) {
      console.warn('WebSocket not available');
      return () => {};
    }

    this.socket.on(event, callback);

    // Return unsubscribe function
    return () => {
      this.socket?.off(event, callback);
    };
  }

  /**
   * Emit an event
   * @param event Event name
   * @param data Data to send
   */
  emit(event: string, data?: any) {
    if (!this.socket?.connected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get connection status
   */
  getStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (this.isConnecting) return 'connecting';
    if (this.socket?.connected) return 'connected';
    return 'disconnected';
  }
}

// Create singleton instance
export const wsClient = new WebSocketClient();

// Event names (based on BlockScout WebSocket API)
export const WS_EVENTS = {
  // Block events
  NEW_BLOCK: 'new_block',
  BLOCK_UPDATE: 'block_update',

  // Transaction events
  NEW_TRANSACTION: 'new_transaction',
  NEW_PENDING_TRANSACTION: 'new_pending_transaction',
  TRANSACTION_UPDATE: 'transaction_update',

  // Address events
  ADDRESS_UPDATE: 'address_update',
  ADDRESS_COIN_BALANCE: 'address_coin_balance',

  // Token events
  TOKEN_TRANSFER: 'token_transfer',

  // Stats events
  STATS_UPDATE: 'stats_update',

  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
} as const;

// Export for testing
export { WebSocketClient };
