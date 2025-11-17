/**
 * Redis Cache Client
 * High-performance caching layer for BlockScout API responses
 */

import Redis from 'ioredis';

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

class RedisCache {
  private client: Redis | null = null;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.REDIS_ENABLED === 'true';

    if (this.isEnabled) {
      try {
        this.client = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD,
          db: Number(process.env.REDIS_DB) || 0,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: true,
        });

        this.client.on('error', (err) => {
          console.error('[Redis] Connection error:', err);
        });

        this.client.on('connect', () => {
          console.log('[Redis] Connected successfully');
        });

        // Connect asynchronously
        this.client.connect().catch((err) => {
          console.error('[Redis] Failed to connect:', err);
          this.isEnabled = false;
        });
      } catch (error) {
        console.error('[Redis] Initialization error:', error);
        this.isEnabled = false;
      }
    }
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.client) return null;

    try {
      const value = await this.client.get(key);
      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      console.error('[Redis] Get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (0 = permanent)
   */
  async set(key: string, value: any, ttl: number = 60): Promise<boolean> {
    if (!this.isEnabled || !this.client) return false;

    try {
      const serialized = JSON.stringify(value);

      if (ttl === 0) {
        // Permanent cache
        await this.client.set(key, serialized);
      } else {
        // Cache with expiration
        await this.client.setex(key, ttl, serialized);
      }

      return true;
    } catch (error) {
      console.error('[Redis] Set error:', error);
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
      console.error('[Redis] Delete error:', error);
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
      console.error('[Redis] Exists error:', error);
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
      console.error('[Redis] Clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    keys: number;
    memory: string;
    hits: number;
    misses: number;
  } | null> {
    if (!this.isEnabled || !this.client) return null;

    try {
      const dbsize = await this.client.dbsize();
      const info = await this.client.info('stats');

      // Parse info string
      const stats = info.split('\r\n').reduce((acc, line) => {
        const [key, value] = line.split(':');
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      return {
        keys: dbsize,
        memory: stats.used_memory_human || 'unknown',
        hits: parseInt(stats.keyspace_hits || '0', 10),
        misses: parseInt(stats.keyspace_misses || '0', 10),
      };
    } catch (error) {
      console.error('[Redis] Stats error:', error);
      return null;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return this.isEnabled && this.client !== null;
  }
}

// Singleton instance
export const redis = new RedisCache();

// Helper function to generate cache keys
export function getCacheKey(type: string, ...args: (string | number)[]): string {
  return `ande:${type}:${args.join(':')}`;
}

// Export cache utilities
export { RedisCache };
