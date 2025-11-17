# 🚀 ANDE Explorer - Performance Optimization Plan

## 📊 Diagnóstico Actual

### Problemas Identificados
1. **Lentitud en carga de datos** - La web https://explorer.ande.network/ es muy lenta
2. **Sin caching efectivo** - Cada request va directamente a BlockScout/RPC
3. **No hay CDN caching** - Assets no están optimizados
4. **Queries no optimizadas** - Sin prefetching ni lazy loading
5. **BlockScout sin optimizar** - Configuración por defecto

---

## 🎯 Objetivos

- **Tiempo de carga inicial**: < 1 segundo
- **Time to First Byte (TTFB)**: < 200ms
- **Interactividad**: Sentirse tan rápido como Etherscan/Arbiscan
- **API Response Time**: < 100ms para datos cacheados

---

## 🔥 Estrategia de Optimización (Inspirada en Etherscan/Arbiscan)

### 1. **CACHING MULTI-CAPA** (Prioridad: CRÍTICA)

#### A. Redis Cache Layer (Backend)
```
Frontend → Redis Cache → BlockScout API → Database
          ↑
       CACHE HIT (< 10ms)
```

**Implementación:**
- Instalar Redis en servidor (192.168.0.8)
- Crear middleware de cache para Next.js API routes
- Cache strategy:
  - **Bloques confirmados**: Cache permanente (inmutables)
  - **Último bloque**: Cache 2 segundos
  - **Transacciones confirmadas**: Cache permanente
  - **Pending transactions**: Cache 1 segundo
  - **Stats**: Cache 5 segundos
  - **Address info**: Cache 10 segundos

**TTL Strategy:**
```typescript
const CACHE_TTL = {
  BLOCK_CONFIRMED: 'permanent', // Bloques no cambian
  BLOCK_LATEST: 2,              // 2 segundos
  TX_CONFIRMED: 'permanent',    // TX no cambian
  TX_PENDING: 1,                // 1 segundo
  ADDRESS: 10,                  // 10 segundos
  STATS: 5,                     // 5 segundos
  SEARCH: 30,                   // 30 segundos
};
```

#### B. Browser Cache (Frontend)
```typescript
// React Query con cache agresivo
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,      // 1 minuto
      cacheTime: 5 * 60_000,  // 5 minutos
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});
```

#### C. CDN Caching (Vercel Edge)
- Cache static assets: 1 año
- Cache API responses: según TTL
- Edge runtime para API routes más rápidas

---

### 2. **NEXT.JS OPTIMIZACIONES** (Prioridad: ALTA)

#### A. Incremental Static Regeneration (ISR)
```typescript
// Para páginas de bloques antiguos
export async function generateStaticParams() {
  return { revalidate: 3600 }; // 1 hora
}
```

#### B. Prefetching Inteligente
```typescript
// Prefetch próximo bloque mientras usuario ve actual
<Link href={`/blocks/${blockNumber + 1}`} prefetch={true}>
  Next Block
</Link>
```

#### C. Lazy Loading
```typescript
// Cargar tabs bajo demanda
const InternalTxs = lazy(() => import('./InternalTxs'));
const Logs = lazy(() => import('./Logs'));
```

#### D. Image Optimization
```typescript
// next.config.js
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200],
  minimumCacheTTL: 31536000, // 1 año
}
```

---

### 3. **BLOCKSCOUT OPTIMIZATIONS** (Prioridad: ALTA)

Basado en BlockScout 6.0+ mejores prácticas:

#### A. Database Optimizations
```elixir
# env.common en BlockScout
POOL_SIZE=50                          # Más conexiones
POOL_SIZE_API=50                      # Pool separado para API
DATABASE_READ_ONLY_API_URL=<replica>  # Replica para lectura
INDEXER_DISABLE_PENDING_TRANSACTIONS_FETCHER=false
INDEXER_DISABLE_INTERNAL_TRANSACTIONS_FETCHER=false
```

#### B. Índices Críticos
```sql
-- Agregar índices para queries frecuentes
CREATE INDEX CONCURRENTLY idx_blocks_timestamp ON blocks(timestamp DESC);
CREATE INDEX CONCURRENTLY idx_transactions_block_hash ON transactions(block_hash);
CREATE INDEX CONCURRENTLY idx_transactions_from_address ON transactions(from_address_hash);
CREATE INDEX CONCURRENTLY idx_transactions_to_address ON transactions(to_address_hash);
CREATE INDEX CONCURRENTLY idx_address_coin_balances ON address_coin_balances(address_hash, block_number DESC);
```

#### C. Internal Transactions Optimization
```
# Solo fetch para contratos inteligentes
INDEXER_INTERNAL_TRANSACTIONS_TRACER_TYPE=call_tracer
```

---

### 4. **API OPTIMIZATIONS** (Prioridad: ALTA)

#### A. Request Batching
```typescript
// Batch múltiples requests en uno
const batchedData = await api.batch([
  api.getBlock(123),
  api.getTransactions(123),
  api.getStats(),
]);
```

#### B. GraphQL para queries complejas
```graphql
# Una sola query para toda la página
query BlockPage($height: Int!) {
  block(height: $height) {
    hash
    timestamp
    transactions { hash, from, to }
    stats { gasUsed, gasLimit }
  }
}
```

#### C. Compression
```typescript
// next.config.js
compress: true, // Gzip/Brotli

// API client
headers: {
  'Accept-Encoding': 'br, gzip, deflate'
}
```

---

### 5. **FRONTEND OPTIMIZATIONS** (Prioridad: MEDIA)

#### A. Code Splitting
```typescript
// Dynamic imports para rutas
const BlockPage = dynamic(() => import('./BlockPage'), {
  loading: () => <Skeleton />,
});
```

#### B. Virtual Scrolling para listas largas
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

// Para lista de 10,000+ transacciones
const virtualizer = useVirtualizer({
  count: transactions.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 60,
});
```

#### C. Optimistic Updates
```typescript
// Mostrar TX inmediatamente mientras se confirma
useMutation({
  onMutate: async (newTx) => {
    queryClient.setQueryData(['transactions'], (old) => [newTx, ...old]);
  },
});
```

---

### 6. **WEBSOCKET OPTIMIZATIONS** (Prioridad: MEDIA)

```typescript
// Usar WebSockets solo para updates en tiempo real
const wsClient = new WebSocket(config.api.wsUrl);

// Subscribe solo a datos visibles
wsClient.send(JSON.stringify({
  event: 'subscribe',
  topics: ['new_blocks', 'new_transactions']
}));

// Throttle updates
const throttledUpdate = throttle((data) => {
  updateUI(data);
}, 1000); // Máximo 1 update/segundo
```

---

### 7. **RPC OPTIMIZATIONS** (Prioridad: MEDIA)

#### A. RPC Caching
```typescript
const rpcCache = new Map();

async function cachedRpcCall(method, params) {
  const key = `${method}:${JSON.stringify(params)}`;
  if (rpcCache.has(key)) return rpcCache.get(key);

  const result = await rpc.call(method, params);
  rpcCache.set(key, result);
  setTimeout(() => rpcCache.delete(key), 5000); // 5s TTL

  return result;
}
```

#### B. Batch RPC Calls
```typescript
// En vez de 3 calls separados:
const [block, balance, code] = await Promise.all([
  rpc.getBlock(123),
  rpc.getBalance(address),
  rpc.getCode(address),
]);

// Usar batch RPC:
const results = await rpc.batch([
  { method: 'eth_getBlockByNumber', params: [123, true] },
  { method: 'eth_getBalance', params: [address, 'latest'] },
  { method: 'eth_getCode', params: [address, 'latest'] },
]);
```

---

## 📈 Métricas de Éxito

### Antes de Optimización (Actual)
- TTFB: > 1 segundo ❌
- Page Load: > 3 segundos ❌
- API Response: > 500ms ❌
- Interactividad: Lenta ❌

### Después de Optimización (Objetivo)
- TTFB: < 200ms ✅
- Page Load: < 1 segundo ✅
- API Response: < 100ms (cached) / < 300ms (fresh) ✅
- Interactividad: Instantánea ✅

---

## 🛠️ Plan de Implementación

### Fase 1: Backend Caching (1-2 días)
1. ✅ Instalar Redis en servidor
2. ✅ Crear cache middleware para API routes
3. ✅ Implementar cache warming para stats
4. ✅ Configurar cache invalidation

### Fase 2: Frontend Optimization (1 día)
1. ✅ Actualizar React Query config
2. ✅ Implementar prefetching
3. ✅ Agregar lazy loading
4. ✅ Optimizar bundle size

### Fase 3: BlockScout Tuning (1 día)
1. ✅ Agregar índices a base de datos
2. ✅ Configurar database replica
3. ✅ Optimizar pool size
4. ✅ Tune internal transactions fetcher

### Fase 4: Advanced Features (1-2 días)
1. ✅ Implementar ISR para bloques antiguos
2. ✅ Agregar virtual scrolling
3. ✅ Implementar RPC batching
4. ✅ WebSocket throttling

---

## 🚀 Quick Wins (Implementar YA)

### 1. Aumentar Cache Times
```typescript
// lib/config/index.ts
cache: {
  blocks: 60_000,        // 1 minuto (antes: 5s)
  transactions: 60_000,  // 1 minuto (antes: 5s)
  address: 5 * 60_000,   // 5 minutos (antes: 10s)
  stats: 30_000,         // 30 segundos (antes: 3s)
}
```

### 2. Agregar Prefetching
```typescript
// Componente BlocksList
<Link href={`/blocks/${block.height}`} prefetch={true}>
```

### 3. Lazy Load Tabs Pesados
```typescript
const Logs = lazy(() => import('./Logs'));
const InternalTxs = lazy(() => import('./InternalTxs'));
```

### 4. Comprimir Responses
```typescript
// next.config.js
compress: true,
```

---

## 🔍 Monitoring

### Herramientas
- **Vercel Analytics**: Performance metrics
- **Web Vitals**: LCP, FID, CLS
- **Custom Metrics**: API response times, cache hit rate

### Dashboards
```typescript
// Agregar performance logging
console.log('[PERF]', {
  route: '/blocks',
  loadTime: Date.now() - startTime,
  cacheHit: true,
  source: 'redis'
});
```

---

## 💡 Referencias

- [BlockScout 6.0 Performance](https://www.blog.blockscout.com/performance-update/)
- [Etherscan Architecture](https://etherscan.io/apis)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/important-defaults)

---

## ✅ Checklist

- [ ] Redis instalado y configurado
- [ ] Cache middleware implementado
- [ ] React Query config optimizada
- [ ] Prefetching habilitado
- [ ] Lazy loading implementado
- [ ] BlockScout índices agregados
- [ ] Database replica configurada
- [ ] ISR implementado
- [ ] Virtual scrolling para listas
- [ ] RPC batching
- [ ] WebSocket throttling
- [ ] Compression habilitada
- [ ] Monitoring configurado

---

**Prioridad de implementación**:
1. 🔴 Redis caching (máximo impacto)
2. 🟠 React Query optimization
3. 🟡 BlockScout tuning
4. 🟢 Advanced features
