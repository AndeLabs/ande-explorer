/**
 * Upstash Redis Cache Client
 * Optimized for Vercel serverless environment
 * Uses REST API for better serverless performance
 */

import { Redis } from '@upstash/redis';

// TTL Constants (in seconds)
export const CACHE_TTL = {
  BLOCK_CONFIRMED: 0, // Permanent - blocks don't change
  BLOCK_LATEST: 2, // 2 seconds - latest block changes fast
  TX_CONFIRMED: 0, // Permanent - transactions don't change
  TX_PENDING: 1, // 1 second - pending state changes
  ADDRESS: 10, // 10 seconds - balance changes slowly
  STATS: 5, // 5 seconds - aggregated stats
  SEARCH: 30, // 30 seconds - search results
  TOKEN: 60, // 1 minute - token info
  GAS_PRICE: 3, // 3 seconds - gas price updates frequently
} as const;

class UpstashCache {
  private client: Redis | null = null;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.REDIS_ENABLED === 'true';

    if (this.isEnabled) {
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;

      if (url && token) {
        try {
          this.client = new Redis({
            url,
            token,
            // Automatic retry with exponential backoff
            retry: {
              retries: 3,
              backoff: (retryCount) => Math.min(1000 * 2 ** retryCount, 3000),
            },
          });

          console.log('[Upstash] Redis client initialized');
        } catch (error) {
          console.error('[Upstash] Failed to initialize:', error);
          this.isEnabled = false;
        }
      } else {
        console.warn('[Upstash] Missing credentials (URL or TOKEN)');
        this.isEnabled = false;
      }
    } else {
      console.log('[Cache] Redis disabled - using only React Query cache');
    }
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.client) return null;

    try {
      const value = await this.client.get<T>(key);
      return value;
    } catch (error) {
      console.error('[Upstash] Get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (0 = permanent = 1 year)
   */
  async set(key: string, value: any, ttl: number = 60): Promise<boolean> {
    if (!this.isEnabled || !this.client) return false;

    try {
      if (ttl === 0) {
        // "Permanent" cache = 1 year (max TTL)
        await this.client.setex(key, 31536000, value);
      } else {
        // Cache with custom expiration
        await this.client.setex(key, ttl, value);
      }

      return true;
    } catch (error) {
      console.error('[Upstash] Set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.client) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('[Upstash] Delete error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isEnabled || !this.client) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('[Upstash] Exists error:', error);
      return false;
    }
  }

  /**
   * Clear all cache (use with caution!)
   */
  async clear(): Promise<boolean> {
    if (!this.isEnabled || !this.client) return false;

    try {
      await this.client.flushdb();
      return true;
    } catch (error) {
      console.error('[Upstash] Clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    keys: number;
    enabled: boolean;
    provider: string;
  } | null> {
    if (!this.isEnabled || !this.client) {
      return {
        keys: 0,
        enabled: false,
        provider: 'none',
      };
    }

    try {
      const keys = await this.client.dbsize();

      return {
        keys,
        enabled: true,
        provider: 'upstash',
      };
    } catch (error) {
      console.error('[Upstash] Stats error:', error);
      return null;
    }
  }

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return this.isEnabled && this.client !== null;
  }

  /**
   * Increment counter (for analytics)
   */
  async incr(key: string): Promise<number> {
    if (!this.isEnabled || !this.client) return 0;

    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error('[Upstash] Incr error:', error);
      return 0;
    }
  }
}

// Singleton instance
export const redis = new UpstashCache();

// Helper function to generate cache keys
export function getCacheKey(type: string, ...args: (string | number)[]): string {
  return `ande:${type}:${args.join(':')}`;
}

// Export cache utilities
export { UpstashCache };
