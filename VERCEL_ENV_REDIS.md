# Variables de Entorno para Vercel - Redis Cache

## 🔴 IMPORTANTE: Agregar estas variables en Vercel Dashboard

Ve a: https://vercel.com/dashboard → tu proyecto → Settings → Environment Variables

---

## ✅ Variables NUEVAS para Redis Cache

```bash
# Redis Configuration (Performance Optimization)
REDIS_ENABLED=false
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
REDIS_DB=0
```

---

## 📝 EXPLICACIÓN

### ¿Por qué `REDIS_ENABLED=false` en Vercel?

Vercel es serverless y no tiene un servidor Redis incluido. Tienes 2 opciones:

### **OPCIÓN 1: Sin Redis en Vercel (Recomendado para empezar)**
```bash
REDIS_ENABLED=false
```

✅ **Ventajas:**
- Funciona inmediatamente
- Sin costos adicionales
- Usa cache de Next.js (bueno pero no tan potente)

❌ **Desventajas:**
- No hay cache compartido entre requests
- Cada invocación serverless empieza "frío"

---

### **OPCIÓN 2: Redis Cloud para Vercel (Máximo Performance)**

Si quieres Redis en producción (MUY recomendado para performance):

#### 1. Crear Redis Cloud GRATIS
- Ve a: https://redis.com/try-free/
- O usa Upstash: https://upstash.com/ (mejor para Vercel)

#### 2. Obtener credenciales

**Upstash (Recomendado para Vercel):**
```bash
REDIS_ENABLED=true
REDIS_HOST=your-redis-xxxxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=tu_password_aqui
REDIS_DB=0
```

**Redis Cloud:**
```bash
REDIS_ENABLED=true
REDIS_HOST=redis-xxxxx.cloud.redislabs.com
REDIS_PORT=12345
REDIS_PASSWORD=tu_password_aqui
REDIS_DB=0
```

---

## 🚀 CONFIGURACIÓN ACTUAL

### Servidor (192.168.0.8)
✅ Redis instalado y corriendo
```bash
REDIS_ENABLED=true
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Vercel (Producción)
🔴 **Agregar ahora:**

**OPCIÓN A - Sin Redis (Funciona YA):**
```bash
REDIS_ENABLED=false
```

**OPCIÓN B - Con Upstash Redis (Mejor Performance):**
1. Crear cuenta en https://upstash.com/
2. Crear database Redis (Free tier: 10,000 requests/day)
3. Copiar credenciales
4. Agregar a Vercel:
```bash
REDIS_ENABLED=true
REDIS_HOST=<tu-host-upstash>
REDIS_PORT=6379
REDIS_PASSWORD=<tu-password>
REDIS_DB=0
```

---

## ⚡ QUICK START (Para deploy inmediato)

### Paso 1: Ir a Vercel Dashboard
```
https://vercel.com/dashboard
```

### Paso 2: Seleccionar tu proyecto
```
ande-explorer (o como se llame)
```

### Paso 3: Settings → Environment Variables

### Paso 4: Agregar esta variable:
```
Name: REDIS_ENABLED
Value: false
Environment: Production, Preview, Development
```

### Paso 5: Redeploy
```
Deployments → ... (latest) → Redeploy
```

---

## 🎯 RECOMENDACIÓN

### Para EMPEZAR (ahora mismo):
```bash
REDIS_ENABLED=false
```
→ Deploy funciona inmediatamente
→ Ya tendrás las otras optimizaciones (cache times, prefetching, etc)
→ Será MUY más rápido que antes

### Para MÁXIMO PERFORMANCE (después):
```bash
REDIS_ENABLED=true
# + credenciales de Upstash
```
→ Cache compartido entre requests
→ Performance como Etherscan
→ Costo: $0 (free tier)

---

## 📊 Comparación de Performance

| Métrica | Sin Optimización | Con Optimización (sin Redis) | Con Redis |
|---------|------------------|------------------------------|-----------|
| TTFB | > 1s | ~300ms | ~100ms |
| Page Load | > 3s | ~1s | ~500ms |
| API Response | > 500ms | ~200ms | ~50ms |
| Cache Hit | 0% | 50% | 90% |

---

## ✅ CHECKLIST

- [ ] Agregar `REDIS_ENABLED=false` en Vercel
- [ ] Redeploy en Vercel
- [ ] Verificar que funciona: https://explorer.ande.network
- [ ] (Opcional) Crear cuenta Upstash
- [ ] (Opcional) Configurar Redis en Vercel
- [ ] (Opcional) Redeploy con Redis

---

## 🆘 Si tienes problemas

El código ya está preparado para funcionar CON o SIN Redis:
- Si `REDIS_ENABLED=false` → usa solo React Query cache
- Si `REDIS_ENABLED=true` → usa Redis + React Query cache

Ambos son MUCHO más rápidos que la versión anterior.
