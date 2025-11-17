# 🚀 Upstash Redis Setup para ANDE Explorer

## Por qué Upstash

✅ **Serverless-native** - Diseñado para Vercel
✅ **Pay-per-request** - Pagas solo lo que usas
✅ **Free tier generoso** - 10K requests/día gratis
✅ **Global edge** - Latencia < 50ms
✅ **Auto-scaling** - Escala automáticamente
✅ **Integración 1-click** - Con Vercel

---

## 🎯 Setup Paso a Paso

### Opción A: Integración Directa desde Vercel (MÁS FÁCIL)

#### 1. Ve a tu proyecto en Vercel
```
https://vercel.com/dashboard → ande-explorer
```

#### 2. Marketplace → Buscar "Upstash"
```
Storage → Upstash Redis
```

#### 3. Click "Add Integration"
- Selecciona tu proyecto
- Click "Add"
- Upstash creará la database automáticamente
- Variables de entorno se agregan solas

✅ **LISTO! Variables ya configuradas automáticamente:**
```bash
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

---

### Opción B: Setup Manual (MÁS CONTROL)

#### 1. Crear cuenta en Upstash
```
https://console.upstash.com/
```
- Sign up con GitHub (recomendado)
- O usar email

#### 2. Crear Database Redis
```
1. Click "Create Database"
2. Nombre: ande-explorer-cache
3. Type: Regional (más barato) o Global (más rápido)
   - Recomendado: Regional (US East) si tu servidor está en USA
   - O Global si quieres latencia mínima mundial
4. Click "Create"
```

#### 3. Copiar Credenciales

Verás 2 opciones de conexión:

**A) REST API (Recomendado para Vercel):**
```bash
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ==
```

**B) Redis Protocol (Compatible con nuestro código):**
```bash
REDIS_HOST=xxxxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=tu-password-aqui
REDIS_TLS=true  # ⚠️ IMPORTANTE: Upstash usa TLS
```

#### 4. Agregar Variables en Vercel

**Opción 1: Usar REST API (más simple)**
```bash
# En Vercel Dashboard → Settings → Environment Variables
REDIS_ENABLED=true
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxQ==
```

**Opción 2: Usar Redis Protocol (nuestro código actual)**
```bash
REDIS_ENABLED=true
REDIS_HOST=xxxxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=tu-password-aqui
REDIS_TLS=true
```

#### 5. Actualizar código para TLS (si usas Redis Protocol)

Necesitas modificar `frontend/lib/cache/redis.ts`:

```typescript
this.client = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: Number(process.env.REDIS_DB) || 0,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined, // ← AGREGAR ESTO
  // ... resto del config
});
```

---

## 🔧 CÓDIGO OPTIMIZADO PARA UPSTASH

Voy a crear una versión que soporta AMBOS métodos:

```typescript
// frontend/lib/cache/redis.ts
import Redis from 'ioredis';

class RedisCache {
  private client: Redis | null = null;
  private isEnabled: boolean;
  private useRest: boolean;

  constructor() {
    this.isEnabled = process.env.REDIS_ENABLED === 'true';

    // Detectar si usa REST API de Upstash
    this.useRest = !!(
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    );

    if (this.isEnabled) {
      if (this.useRest) {
        // Usar REST API (Upstash)
        this.setupRestClient();
      } else {
        // Usar Redis Protocol (servidor local o Upstash con TLS)
        this.setupRedisClient();
      }
    }
  }

  private setupRedisClient() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      db: Number(process.env.REDIS_DB) || 0,
      tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
    });
  }

  private setupRestClient() {
    // Usar @upstash/redis para REST API
    // (más eficiente para serverless)
  }
}
```

---

## 📊 Comparación de Métodos

| Método | Ventajas | Desventajas |
|--------|----------|-------------|
| **REST API** | ✅ Más simple<br>✅ Mejor para serverless<br>✅ Sin conexiones persistentes | ❌ Requiere @upstash/redis package |
| **Redis Protocol** | ✅ Compatible con código actual<br>✅ Estándar Redis | ❌ Requiere TLS config<br>❌ Más overhead en serverless |

---

## 🎯 MI RECOMENDACIÓN

### Para ANDE Explorer:

**Usar REST API de Upstash:**

**1. Instalar @upstash/redis:**
```bash
cd frontend
npm install @upstash/redis
```

**2. Actualizar redis.ts para usar REST:**
```typescript
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

**3. Variables en Vercel:**
```bash
REDIS_ENABLED=true
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AxxxxxxxxxxxQ==
```

✅ **Más simple**
✅ **Mejor performance en serverless**
✅ **Menos código**

---

## 💰 Pricing Examples

### Tráfico Bajo (Inicio)
```
10,000 requests/día = FREE
$0/mes
```

### Tráfico Medio (Creciendo)
```
100,000 requests/día = ~3M/mes
$0.20 por 100K = $6/mes
```

### Tráfico Alto (Éxito)
```
1,000,000 requests/día = ~30M/mes
Plan Pro = $120/mes (incluye 3M requests/día)
Vs Redis Cloud = $200-500/mes
```

---

## 🚀 SIGUIENTE PASO

¿Quieres que:

**A)** Te ayude a integrar Upstash ahora mismo? (5 min)
- Crear cuenta
- Configurar en Vercel
- Actualizar código para REST API

**B)** Dejarlo para después?
- Agregar `REDIS_ENABLED=false` en Vercel
- Deploy funciona sin Redis
- Ya será 5x más rápido por otras optimizaciones

**C)** Usar Redis del servidor (192.168.0.8)?
- Configurar tunnel seguro
- Conectar Vercel → tu servidor
- $0 costo pero más complejo

---

## ✅ RESUMEN

**Para producción profesional:**
```
Upstash REST API > Upstash Redis Protocol > Redis Cloud
```

**Para empezar rápido:**
```
REDIS_ENABLED=false (usar solo React Query cache)
```

**Para máximo control:**
```
Redis en tu servidor + Cloudflare Tunnel
```

---

**¿Qué opción prefieres?**
