/**
 * API Route: Cache Middleware
 * Handles caching for BlockScout API requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { redis, getCacheKey, CACHE_TTL } from '@/lib/cache/redis';

/**
 * GET /api/cache/stats
 * Get cache statistics
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'stats') {
    const stats = await redis.getStats();

    if (!stats) {
      return NextResponse.json(
        { error: 'Redis not available' },
        { status: 503 }
      );
    }

    const hitRate =
      stats.hits + stats.misses > 0
        ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2)
        : '0';

    return NextResponse.json({
      ...stats,
      hitRate: `${hitRate}%`,
      enabled: redis.isAvailable(),
    });
  }

  return NextResponse.json({ message: 'Cache API' });
}

/**
 * POST /api/cache/clear
 * Clear cache (admin only)
 */
export async function POST(request: NextRequest) {
  // TODO: Add authentication
  const { action } = await request.json();

  if (action === 'clear') {
    const cleared = await redis.clear();

    if (!cleared) {
      return NextResponse.json(
        { error: 'Failed to clear cache' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
