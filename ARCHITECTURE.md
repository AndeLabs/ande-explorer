# ANDE Explorer - Architecture & Best Practices

## 🏗️ Architecture Overview

ANDE Explorer is a high-performance blockchain explorer built with modern web technologies, optimized for speed, scalability, and user experience.

### Tech Stack

- **Framework**: Next.js 14 (App Router, React Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with ANDE institutional colors
- **Data Fetching**: TanStack Query (React Query) + viem
- **RPC Client**: Direct connection to ANDE Chain node
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React

## 🎨 Design System - ANDE Institutional Colors

### Primary Colors
- **Azul Profundo** (#2455B8): Headers, botones principales, títulos, links clave
- **Naranja Vibrante** (#FF9F1C): Llamadas a la atención, energía, creatividad

### Secondary Colors
- **Lavanda Suave** (#BFA4FF): Fondos alternos, tarjetas, inspiración
- **Durazno Claro** (#FFC77D): Fondos suaves, elementos secundarios

### Neutral Colors
- **Gris Claro** (#F4F4F4): Backgrounds limpios
- **Gris Medio** (#9A9A9A): Textos secundarios
- **Gris Oscuro** (#393939): Textos principales en documentos oficiales

## 🚀 Performance Optimizations (Inspired by Blockscout)

### 1. Data Fetching Strategy

#### Direct RPC Connection
```typescript
// Instead of BlockScout backend, we use direct RPC for initial MVP
import { createPublicClient, http } from 'viem';

export const publicClient = createPublicClient({
  chain: andeChain,
  transport: http(config.api.rpcUrl, {
    timeout: 30_000,
    retryCount: 3,
    retryDelay: 1000,
  }),
  batch: {
    multicall: true, // Enable batching for efficiency
  },
  cacheTime: 4_000,
});
```

**Benefits**:
- ✅ No backend dependency (faster initial deployment)
- ✅ Real-time data directly from chain
- ✅ Reduced infrastructure costs
- ✅ Simpler architecture

**Trade-offs**:
- ⚠️ No historical indexing (only recent blocks)
- ⚠️ Limited address transaction history
- ⚠️ No advanced analytics without backend

#### Future: Hybrid Approach
For production scale, we'll add BlockScout backend for:
- Complete transaction history indexing
- Token tracking and analytics
- Contract verification
- Advanced search capabilities

### 2. Caching Strategy

```typescript
// Multi-level caching based on data volatility
export const config = {
  cache: {
    blocks: 30_000,      // 30 seconds (blocks don't change)
    transactions: 30_000, // 30 seconds
    address: 60_000,     // 1 minute
    stats: 10_000,       // 10 seconds (frequently updated)
    gasPrice: 5_000,     // 5 seconds (most volatile)
  },
  refresh: {
    stats: 30_000,       // Auto-refresh every 30s
    latestBlocks: 12_000, // Average block time
    gasPrice: 15_000,
  },
};
```

**Principles** (from Blockscout best practices):
1. **Immutable data**: Infinite cache (blocks, transactions)
2. **Semi-stable data**: Medium cache (address balances)
3. **Volatile data**: Short cache (gas prices, network stats)

### 3. Pagination Strategy

#### Keyset Pagination (Blockscout-style)
```typescript
export function useLatestBlocks(pageSize = 20) {
  return useInfiniteQuery({
    queryKey: ['blocks', 'latest', pageSize],
    queryFn: async ({ pageParam = 0 }) => {
      const latestBlockNumber = await rpcClient.getBlockNumber();
      const startBlock = latestBlockNumber - BigInt(pageParam * pageSize);
      const endBlock = startBlock - BigInt(pageSize - 1);
      
      // Parallel fetching for performance
      const blocks = await Promise.all(
        range(startBlock, endBlock).map(n => rpcClient.getBlock(n))
      );
      
      return {
        blocks,
        nextCursor: pageParam + 1,
        hasMore: endBlock > 0n,
      };
    },
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}
```

**Benefits**:
- ✅ Consistent pagination (no offset drift)
- ✅ Efficient for large datasets
- ✅ Works with infinite scroll

### 4. WebSocket for Real-time Updates

```typescript
// Watch for new blocks in real-time
export function useWatchBlocks(onBlock: (block: any) => void) {
  return useQuery({
    queryKey: ['watchBlocks'],
    queryFn: () => {
      return rpcClient.watchBlocks((block) => {
        onBlock(block);
      });
    },
    enabled: config.features.enableWebSockets,
  });
}
```

**Use Cases**:
- Live block feed on homepage
- Real-time transaction notifications
- Gas price updates
- Network stats dashboard

### 5. Batch Requests

```typescript
// Fetch multiple blocks in parallel
const blocks = await Promise.all([
  rpcClient.getBlock(100n),
  rpcClient.getBlock(101n),
  rpcClient.getBlock(102n),
]);

// Or use viem's multicall for contract reads
const results = await publicClient.multicall({
  contracts: [
    { address: token1, abi: erc20ABI, functionName: 'balanceOf', args: [address] },
    { address: token2, abi: erc20ABI, functionName: 'balanceOf', args: [address] },
  ],
});
```

**Benefits**:
- ✅ Reduced network round-trips
- ✅ Faster page loads
- ✅ Lower server load

## 📊 UI/UX Best Practices

### 1. Progressive Enhancement

```typescript
// Show skeleton while loading
if (loading) {
  return <Skeleton className="h-8 w-32" />;
}

// Show data when ready
return <StatsCard title="Latest Block" value={blockNumber} />;
```

### 2. Responsive Design

```typescript
// Tailwind responsive classes
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {stats.map(stat => <StatsCard key={stat.id} {...stat} />)}
</div>
```

### 3. Optimistic Updates

```typescript
// Show immediate feedback, update in background
const mutation = useMutation({
  mutationFn: submitTransaction,
  onMutate: async (newTx) => {
    // Optimistically update UI
    queryClient.setQueryData(['pendingTx'], (old) => [...old, newTx]);
  },
  onSettled: () => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries(['pendingTx']);
  },
});
```

## 🔍 SEO & Meta Tags (Blockscout Standards)

```typescript
// Dynamic OG tags for social sharing
export const metadata = {
  title: `Block #${blockNumber} | ANDE Explorer`,
  description: `View block ${blockNumber} with ${txCount} transactions on ANDE Chain`,
  openGraph: {
    title: `Block #${blockNumber} | ANDE Explorer`,
    description: `${txCount} transactions, mined by ${miner}`,
    images: ['/og-image-block.png'],
  },
};
```

## 🎯 Performance Metrics

### Target Metrics (Industry Standards)

| Metric | Target | Current |
|--------|--------|---------|
| **First Contentful Paint (FCP)** | < 1.0s | TBD |
| **Largest Contentful Paint (LCP)** | < 2.5s | TBD |
| **Time to Interactive (TTI)** | < 3.0s | TBD |
| **Cumulative Layout Shift (CLS)** | < 0.1 | TBD |
| **API Response Time** | < 200ms | TBD |
| **Block Fetch Time** | < 500ms | TBD |

### Monitoring Stack (Future)

- **Analytics**: Mixpanel / Google Analytics
- **Error Tracking**: Sentry
- **Performance**: Web Vitals + Lighthouse CI
- **Uptime**: UptimeRobot / Pingdom

## 🔐 Security Best Practices

### 1. Input Validation

```typescript
// Validate all user inputs
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}
```

### 2. Rate Limiting (Client-side)

```typescript
// Debounce search queries
const debouncedSearch = useDebouncedCallback((query) => {
  performSearch(query);
}, 300);
```

### 3. CSP Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  },
];
```

## 📱 Mobile-First Approach

### Responsive Breakpoints

```typescript
// Tailwind breakpoints
{
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

### Touch-Friendly UI

- Minimum touch target: 44x44px
- Swipe gestures for navigation
- Bottom navigation on mobile
- Compact card layouts

## 🚦 Error Handling

### 1. Network Errors

```typescript
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Usage
try {
  const block = await rpcClient.getBlock(blockNumber);
} catch (error) {
  if (error instanceof APIError) {
    if (error.statusCode === 404) {
      return <NotFound />;
    }
    if (error.statusCode >= 500) {
      return <ServerError />;
    }
  }
  return <GenericError />;
}
```

### 2. Graceful Degradation

```typescript
// Fallback to HTTP if WebSocket fails
const client = config.api.wsUrl && wsAvailable
  ? wsClient
  : publicClient;
```

## 🎓 Code Quality Standards

### 1. TypeScript Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### 2. ESLint + Prettier

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### 3. Component Structure

```
components/
├── ui/              # Primitive components (buttons, cards, etc.)
├── blocks/          # Block-related components
├── transactions/    # Transaction-related components
├── stats/           # Statistics components
├── charts/          # Data visualization
├── layout/          # Layout components
└── marketing/       # Landing page components
```

## 📈 Scalability Roadmap

### Phase 1: MVP (Current)
- ✅ Direct RPC connection
- ✅ Latest blocks/transactions
- ✅ Basic address lookup
- ✅ Real-time updates via WebSocket
- ✅ ANDE institutional branding

### Phase 2: Enhanced Features
- [ ] BlockScout backend integration
- [ ] Full transaction history indexing
- [ ] Token tracking (ERC-20, ERC-721, ERC-1155)
- [ ] Contract verification
- [ ] Advanced search

### Phase 3: Analytics
- [ ] Transaction charts
- [ ] Gas price history
- [ ] Network utilization graphs
- [ ] Top addresses/contracts
- [ ] MEV analytics

### Phase 4: Developer Tools
- [ ] GraphQL API
- [ ] REST API with rate limiting
- [ ] WebSocket subscriptions
- [ ] SDK for dApp integration
- [ ] API documentation

## 🔗 References

- [Blockscout Frontend Docs](https://github.com/blockscout/frontend)
- [Blockscout Best Practices](https://docs.blockscout.com/)
- [viem Documentation](https://viem.sh/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)

---

**Last Updated**: 2025-11-16  
**Version**: 2.0.0  
**Status**: Production Ready (MVP)
