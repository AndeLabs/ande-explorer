# Variables de Entorno para Vercel - ANDE Explorer

## 📋 COPIAR Y PEGAR EN VERCEL

### Método 1: Via Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Copia y pega estas variables:

```bash
# ==============================================================================
# CHAIN CONFIGURATION
# ==============================================================================
NEXT_PUBLIC_CHAIN_ID=6174
NEXT_PUBLIC_CHAIN_NAME=Ande Chain
NEXT_PUBLIC_NETWORK_CURRENCY=ANDE
NEXT_PUBLIC_NETWORK_CURRENCY_NAME=Ande Token
NEXT_PUBLIC_NETWORK_CURRENCY_SYMBOL=ANDE
NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS=18
NEXT_PUBLIC_IS_L2_NETWORK=true

# ==============================================================================
# RPC ENDPOINTS - PRODUCCIÓN
# ==============================================================================
NEXT_PUBLIC_RPC_URL=https://rpc.ande.network
NEXT_PUBLIC_WS_URL=wss://rpc.ande.network

# ==============================================================================
# BLOCKSCOUT API ENDPOINTS
# ==============================================================================
NEXT_PUBLIC_API_HOST=http://192.168.0.8:4000
NEXT_PUBLIC_API_BASE_PATH=/api/v2
NEXT_PUBLIC_API_WEBSOCKET_PROTOCOL=ws
NEXT_PUBLIC_ENABLE_API=true

# ==============================================================================
# MICROSERVICES
# ==============================================================================
NEXT_PUBLIC_STATS_API_HOST=http://192.168.0.8:8080
NEXT_PUBLIC_VISUALIZE_API_HOST=http://192.168.0.8:8051

# ==============================================================================
# FEATURES
# ==============================================================================
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_SHOW_GAS_TRACKER=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_HIDE_INDEXING_ALERT=false

# ==============================================================================
# THEME
# ==============================================================================
NEXT_PUBLIC_DEFAULT_THEME=light

# ==============================================================================
# APP INFO
# ==============================================================================
NEXT_PUBLIC_APP_NAME=ANDE Explorer
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_APP_DESCRIPTION=Professional Blockchain Explorer for Ande Chain

# ==============================================================================
# SOCIAL LINKS
# ==============================================================================
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/andechain
NEXT_PUBLIC_DISCORD_URL=https://discord.gg/andechain
NEXT_PUBLIC_GITHUB_URL=https://github.com/andelabs
NEXT_PUBLIC_DOCS_URL=https://docs.ande.network
```

### Método 2: Via Vercel CLI

Crea archivo `.env.production` en el frontend:

```bash
cd /Users/munay/dev/ande-labs/ande-explorer/frontend
cat > .env.production << 'EOF'
NEXT_PUBLIC_CHAIN_ID=6174
NEXT_PUBLIC_CHAIN_NAME=Ande Chain
NEXT_PUBLIC_NETWORK_CURRENCY=ANDE
NEXT_PUBLIC_NETWORK_CURRENCY_NAME=Ande Token
NEXT_PUBLIC_NETWORK_CURRENCY_SYMBOL=ANDE
NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS=18
NEXT_PUBLIC_IS_L2_NETWORK=true
NEXT_PUBLIC_RPC_URL=https://rpc.ande.network
NEXT_PUBLIC_WS_URL=wss://rpc.ande.network
NEXT_PUBLIC_API_HOST=http://192.168.0.8:4000
NEXT_PUBLIC_API_BASE_PATH=/api/v2
NEXT_PUBLIC_API_WEBSOCKET_PROTOCOL=ws
NEXT_PUBLIC_ENABLE_API=true
NEXT_PUBLIC_STATS_API_HOST=http://192.168.0.8:8080
NEXT_PUBLIC_VISUALIZE_API_HOST=http://192.168.0.8:8051
NEXT_PUBLIC_ENABLE_WEBSOCKETS=true
NEXT_PUBLIC_SHOW_GAS_TRACKER=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_HIDE_INDEXING_ALERT=false
NEXT_PUBLIC_DEFAULT_THEME=light
NEXT_PUBLIC_APP_NAME=ANDE Explorer
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_APP_DESCRIPTION=Professional Blockchain Explorer for Ande Chain
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/andechain
NEXT_PUBLIC_DISCORD_URL=https://discord.gg/andechain
NEXT_PUBLIC_GITHUB_URL=https://github.com/andelabs
NEXT_PUBLIC_DOCS_URL=https://docs.ande.network
EOF
```

Luego importa automáticamente:

```bash
vercel env pull .env.production.local
vercel --prod
```

### Método 3: Via vercel.json (Recomendado)

Ya existe el archivo, actualízalo:

```json
{
  "env": {
    "NEXT_PUBLIC_CHAIN_ID": "6174",
    "NEXT_PUBLIC_CHAIN_NAME": "Ande Chain",
    "NEXT_PUBLIC_RPC_URL": "https://rpc.ande.network",
    "NEXT_PUBLIC_WS_URL": "wss://rpc.ande.network",
    "NEXT_PUBLIC_API_HOST": "http://192.168.0.8:4000",
    "NEXT_PUBLIC_ENABLE_API": "true"
  }
}
```

## 🚀 DEPLOYMENT RÁPIDO

```bash
# 1. Ir al frontend
cd /Users/munay/dev/ande-labs/ande-explorer/frontend

# 2. Deploy
vercel --prod

# Vercel automáticamente detectará las variables en vercel.json
```

## 🌐 CONFIGURAR DOMINIO

Una vez desplegado:

1. Ve a Vercel Dashboard → Settings → Domains
2. Agrega: `explorer.ande.network`
3. Configura DNS:
   ```
   Type: CNAME
   Name: explorer
   Value: cname.vercel-dns.com
   ```

## ⚠️ IMPORTANTE

**CORS para APIs Locales**:

Si las APIs de BlockScout están en `192.168.0.8`, NO serán accesibles desde Vercel (solo desde localhost).

**Solución**: Necesitas exponer las APIs públicamente o usar un proxy.

### Opción A: Proxy en Vercel (Recomendado)

Crear `frontend/next.config.js`:

```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/v2/:path*',
        destination: 'http://192.168.0.8:4000/api/v2/:path*',
      },
      {
        source: '/stats/:path*',
        destination: 'http://192.168.0.8:8080/:path*',
      },
    ];
  },
};
```

Y cambiar las variables:

```bash
NEXT_PUBLIC_API_HOST=https://explorer.ande.network
NEXT_PUBLIC_API_BASE_PATH=/api/v2
NEXT_PUBLIC_STATS_API_HOST=https://explorer.ande.network/stats
```

### Opción B: Cloudflare Tunnel (Mejor para producción)

```bash
# En el servidor
cloudflared tunnel create ande-explorer
cloudflared tunnel route dns ande-explorer api.explorer.ande.network

# Luego usar
NEXT_PUBLIC_API_HOST=https://api.explorer.ande.network
```

---

**Archivo creado**: `/VERCEL_ENV_VARIABLES.md`

## 📝 RESUMEN

1. ✅ Copia las variables al Dashboard de Vercel
2. ✅ O usa el método CLI con .env.production
3. ✅ Deploy con `vercel --prod`
4. ⚠️ Configura proxy o tunnel para APIs locales
5. ✅ Configura dominio `explorer.ande.network`

---

**Siguiente**: Arreglar BlockScout backend
