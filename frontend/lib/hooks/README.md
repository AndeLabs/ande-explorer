# Hooks Architecture - Escalabilidad y Mejores Prácticas

## 🎯 Principios de Diseño

### 1. **Un Hook = Una Responsabilidad**
Cada hook debe tener una responsabilidad clara y única. No crear múltiples hooks que hagan lo mismo.

### 2. **Real-time por Defecto**
Todos los hooks de datos blockchain deben usar WebSockets por defecto para actualizaciones instantáneas.

### 3. **Degradación Elegante**
Si WebSockets fallan, debe haber polling automático como fallback.

---

## 📊 Hook Principal: `useBlockScoutStats`

### Características
- ✅ **WebSockets habilitados por defecto** - Actualizaciones instantáneas
- ✅ **Polling automático como fallback** - 3 segundos por defecto
- ✅ **Configurable** - Opciones para personalizar comportamiento
- ✅ **Type-safe** - TypeScript completo
- ✅ **Validación de datos** - Detecta y corrige datos inválidos

### Uso Básico

```typescript
import { useBlockScoutStats } from '@/lib/hooks/useBlockScoutStats';

function MyComponent() {
  // ✅ Con real-time (default - RECOMENDADO)
  const { data, isLoading, error, isFetching } = useBlockScoutStats();

  return (
    <div>
      <p>Total Blocks: {data?.total_blocks}</p>
      <p>Status: {isFetching ? 'Updating...' : 'Live'}</p>
    </div>
  );
}
```

### Uso Avanzado

```typescript
// Desactivar WebSockets (solo polling)
const { data } = useBlockScoutStats({
  enableRealtime: false
});

// Custom polling interval
const { data } = useBlockScoutStats({
  refetchInterval: 5000 // 5 segundos
});

// Polling más lento para secciones no críticas
const { data } = useBlockScoutStats({
  refetchInterval: 10000 // 10 segundos
});
```

---

## 🏗️ Arquitectura de Datos

```
┌─────────────────────────────────────────────┐
│  Component Layer (React Components)         │
│  - NetworkInfoWidget                        │
│  - StatsGrid                                │
│  - Dashboard                                │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Hook Layer (Data Access)                   │
│  - useBlockScoutStats() ← SINGLE SOURCE     │
│  - useNetworkInfo()                         │
│  - useBlocks()                              │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  API Layer (Data Fetching)                  │
│  - BlockScout REST API                      │
│  - WebSocket Client                         │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Blockchain (Source of Truth)               │
│  - ANDE Chain Node                          │
│  - BlockScout Indexer                       │
└─────────────────────────────────────────────┘
```

---

## 🚀 Cómo Escalar

### 1. **Para Nuevos Datos de Blockchain**

Crear hook siguiendo el mismo patrón:

```typescript
export function useBlocks(options: UseBlocksOptions = {}) {
  const {
    enableRealtime = true,
    refetchInterval = 3_000,
    limit = 10,
  } = options;

  const queryClient = useQueryClient();

  // Base query
  const query = useQuery({
    queryKey: ['blocks', { limit }],
    queryFn: () => getBlocks({ limit }),
    staleTime: 0,
    refetchInterval,
  });

  // WebSocket integration
  useEffect(() => {
    if (!enableRealtime) return;

    wsClient.connect();
    const unsubscribe = wsClient.subscribe(
      WS_EVENTS.NEW_BLOCK,
      () => queryClient.invalidateQueries(['blocks'])
    );

    return unsubscribe;
  }, [enableRealtime]);

  return query;
}
```

### 2. **Para Datos de Múltiples Fuentes**

Combinar hooks en un hook de nivel superior:

```typescript
export function useDashboardData() {
  const stats = useBlockScoutStats();
  const blocks = useBlocks({ limit: 5 });
  const txs = useTransactions({ limit: 5 });

  return {
    stats: stats.data,
    recentBlocks: blocks.data,
    recentTxs: txs.data,
    isLoading: stats.isLoading || blocks.isLoading || txs.isLoading,
  };
}
```

### 3. **Para Optimizar Performance**

```typescript
// Sección crítica - actualización rápida
const { data } = useBlockScoutStats({
  refetchInterval: 2000
});

// Sección no crítica - actualización más lenta
const { data } = useBlockScoutStats({
  refetchInterval: 10000
});

// Vista estática - sin real-time
const { data } = useBlockScoutStats({
  enableRealtime: false,
  refetchInterval: 30000
});
```

---

## ✅ Checklist para Nuevos Hooks

- [ ] Un solo hook por tipo de dato
- [ ] WebSockets habilitados por defecto
- [ ] Polling como fallback
- [ ] Opciones configurables
- [ ] TypeScript completo
- [ ] Validación de datos
- [ ] Documentación con ejemplos
- [ ] Error handling
- [ ] Loading states
- [ ] Tests unitarios

---

## 🎓 Mejores Prácticas

### ✅ DO

```typescript
// ✅ Usar el hook unificado
const { data } = useBlockScoutStats();

// ✅ Mantener hooks simples y enfocados
const { data } = useNetworkInfo(); // Combina config + stats

// ✅ Configurar según necesidad
const { data } = useBlockScoutStats({ refetchInterval: 5000 });
```

### ❌ DON'T

```typescript
// ❌ NO crear múltiples hooks para lo mismo
const { data } = useBlockScoutStats();
const { data } = useRealtimeBlockScoutStats(); // ELIMINADO

// ❌ NO hacer fetch directo en componentes
const [data, setData] = useState();
useEffect(() => {
  fetch('/api/stats').then(r => r.json()).then(setData);
}, []); // Usar hook en su lugar

// ❌ NO duplicar lógica de WebSockets
// Usar el hook que ya tiene WebSockets integrados
```

---

## 📈 Métricas de Performance

| Método | Latencia | Cuando Usar |
|--------|----------|-------------|
| WebSockets | < 500ms | Secciones críticas (default) |
| Polling 3s | 0-3s | Fallback automático |
| Polling 5s | 0-5s | Secciones secundarias |
| Polling 10s+ | Variable | Datos estáticos |

---

## 🔮 Roadmap Futuro

### Fase 1: Optimización ✅
- [x] Un solo hook unificado
- [x] WebSockets por defecto
- [x] Polling configurable

### Fase 2: Más Features (Próximo)
- [ ] Hook para transacciones en tiempo real
- [ ] Hook para bloques en tiempo real
- [ ] Hook para eventos de contratos

### Fase 3: Advanced (Futuro)
- [ ] Query caching inteligente
- [ ] Prefetching automático
- [ ] Offline support
- [ ] State persistence

---

**Mantenido por:** ANDE Labs
**Última actualización:** 2025-11-20
**Versión:** 2.0
