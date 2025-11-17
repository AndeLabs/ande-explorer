/**
 * API Proxy with Redis Caching
 * Caches BlockScout API responses for better performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { redis, getCacheKey, CACHE_TTL } from '@/lib/cache/redis';

const BLOCKSCOUT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.0.8:4000/api';

/**
 * Determine TTL based on request path
 */
function getTTL(path: string): number {
  // Blocks
  if (path.includes('/blocks/latest')) return CACHE_TTL.BLOCK_LATEST;
  if (path.includes('/blocks/')) {
    // Individual confirmed blocks = permanent cache
    return CACHE_TTL.BLOCK_CONFIRMED;
  }
  if (path.includes('/blocks')) return CACHE_TTL.BLOCK_LATEST;

  // Transactions
  if (path.includes('/transactions/')) {
    // Individual confirmed TX = permanent cache
    return CACHE_TTL.TX_CONFIRMED;
  }
  if (path.includes('/transactions')) return CACHE_TTL.TX_PENDING;

  // Addresses
  if (path.includes('/addresses/')) return CACHE_TTL.ADDRESS;

  // Stats
  if (path.includes('/stats')) return CACHE_TTL.STATS;

  // Gas prices
  if (path.includes('/gas-prices')) return CACHE_TTL.GAS_PRICE;

  // Search
  if (path.includes('/search')) return CACHE_TTL.SEARCH;

  // Tokens
  if (path.includes('/tokens/')) return CACHE_TTL.TOKEN;

  // Default: 10 seconds
  return 10;
}

/**
 * Proxy all requests to BlockScout with caching
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const fullPath = searchParams ? `${path}?${searchParams}` : path;

  // Generate cache key
  const cacheKey = getCacheKey('api', fullPath);

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log(`[Cache HIT] ${fullPath}`);
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'X-Cache-Key': cacheKey,
      },
    });
  }

  console.log(`[Cache MISS] ${fullPath}`);

  try {
    // Fetch from BlockScout
    const url = `${BLOCKSCOUT_API_URL}/${fullPath}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      next: { revalidate: 0 }, // Don't use Next.js cache
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'BlockScout API error', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Determine TTL
    const ttl = getTTL(fullPath);

    // Cache the response
    if (ttl > 0 || ttl === 0) {
      await redis.set(cacheKey, data, ttl);
      console.log(`[Cache SET] ${fullPath} (TTL: ${ttl === 0 ? 'permanent' : ttl + 's'})`);
    }

    return NextResponse.json(data, {
      headers: {
        'X-Cache': 'MISS',
        'X-Cache-Key': cacheKey,
        'X-Cache-TTL': ttl.toString(),
      },
    });
  } catch (error) {
    console.error('[API Proxy Error]', error);
    return NextResponse.json(
      { error: 'Failed to fetch from BlockScout' },
      { status: 500 }
    );
  }
}
