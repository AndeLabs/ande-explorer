# Guía de Deployment en Vercel - Ande Explorer

## 🔍 Problema Identificado

El proyecto tiene una estructura monorepo:
```
/
├── public/          # Solo index.html estático (obsoleto)
├── frontend/        # ✅ Aplicación Next.js COMPLETA (usar este)
├── vercel.json      # Configuración de deployment
└── ...
```

**Error**: Vercel intentaba construir desde la raíz buscando `public/`, pero la aplicación Next.js real está en `/frontend/`.

## ✅ Solución Implementada

### Opción 1: Configuración en Vercel Dashboard (RECOMENDADA)

Esta es la mejor práctica para estructuras monorepo según Vercel 2025.

#### Pasos en Vercel Dashboard:

1. **Ve a tu proyecto en Vercel** → Settings → General

2. **Root Directory**
   - Click en "Edit"
   - Cambia de `.` (raíz) a `frontend`
   - Guarda los cambios

3. **Build & Development Settings**
   - Framework Preset: `Next.js` (debería auto-detectarse)
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)
   - Install Command: `npm install` (auto)

4. **Environment Variables** (ya configuradas en vercel.json, pero puedes agregarlas manualmente):
   ```
   NEXT_PUBLIC_API_HOST=explorer.ande.network
   NEXT_PUBLIC_API_PROTOCOL=https
   NEXT_PUBLIC_APP_HOST=explorer.ande.chain
   NEXT_PUBLIC_APP_PROTOCOL=https
   NEXT_PUBLIC_NETWORK_NAME=Ande Chain
   NEXT_PUBLIC_NETWORK_ID=42170
   NEXT_PUBLIC_NETWORK_CURRENCY_NAME=ETH
   NEXT_PUBLIC_NETWORK_CURRENCY_SYMBOL=ETH
   NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS=18
   NEXT_PUBLIC_IS_L2_NETWORK=true
   NEXT_PUBLIC_SHOW_GAS_TRACKER=true
   NEXT_PUBLIC_HIDE_INDEXING_ALERT=false
   NEXT_PUBLIC_DEFAULT_THEME=light
   BACKEND_URL=https://explorer.ande.network
   ```

5. **Redeploy**
   - Ve a Deployments
   - Click en "Redeploy" en el último deployment

### Opción 2: Usar Vercel CLI con configuración manual

```bash
# Desde la raíz del proyecto
vercel --prod

# Cuando te pregunte por el Root Directory, especifica: frontend
```

## 📊 Configuración de Escalabilidad

### 1. Edge Functions (Opcional - Pro/Enterprise)
Para mejor rendimiento global, Next.js en Vercel puede usar Edge Runtime:

En `frontend/next.config.js`:
```javascript
module.exports = {
  // ... configuración existente

  experimental: {
    runtime: 'edge', // Para Edge Functions
  },
}
```

### 2. Image Optimization
Vercel optimiza imágenes automáticamente con Next.js Image component.

### 3. Caching Strategy
Next.js + Vercel incluye:
- Static Generation (SSG)
- Incremental Static Regeneration (ISR)
- Server-Side Rendering (SSR)
- Edge Caching

### 4. Monitoring y Analytics
Habilita en Vercel Dashboard:
- **Analytics**: Settings → Analytics → Enable
- **Speed Insights**: Settings → Speed Insights → Enable
- **Web Vitals**: Automático con Analytics

### 5. Regiones de Deployment
Configurado en `vercel.json`:
```json
"regions": ["iad1"]  // US East (Virginia)
```

Para escalar globalmente (Enterprise):
```json
"regions": ["iad1", "sfo1", "lhr1", "hnd1"]
```

## 🚀 Mejores Prácticas Implementadas

✅ Estructura de monorepo con Root Directory
✅ Framework Next.js 14+ con App Router
✅ Variables de entorno configuradas
✅ Headers de seguridad (X-Frame-Options, CSP, etc.)
✅ Región optimizada (IAD1 - US East)
✅ TypeScript + ESLint + Prettier
✅ React Query para data fetching
✅ Zustand para state management
✅ WebSockets con Socket.io

## 🔧 Troubleshooting

### Si el deployment sigue fallando:

1. **Verifica que Root Directory = `frontend`**
   ```bash
   vercel --debug
   ```

2. **Limpia caché de Vercel**
   En Dashboard → Settings → General → "Clear Build Cache"

3. **Verifica dependencias**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

4. **Revisa logs en tiempo real**
   En Vercel Dashboard → Deployments → [tu deployment] → View Function Logs

### Errores Comunes:

| Error | Solución |
|-------|----------|
| "Missing public directory" | Root Directory debe ser `frontend` |
| "No Output Directory found" | Vercel debe detectar Next.js automáticamente |
| "Module not found" | Ejecuta `npm install` en `/frontend` |
| "Build failed" | Revisa `frontend/next.config.js` |

## 📈 Métricas de Performance Esperadas

Con esta configuración optimizada:
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.9s
- **Cumulative Layout Shift (CLS)**: < 0.1

## 🔐 Seguridad

Headers implementados:
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

## 💡 Próximos Pasos para Optimización

1. **Habilitar ISR** (Incremental Static Regeneration)
2. **Implementar Edge Functions** para rutas críticas
3. **Configurar CDN Caching** para assets estáticos
4. **Agregar Monitoring** con Vercel Analytics
5. **Implementar A/B Testing** con Vercel Edge Config
6. **Configurar Preview Deployments** para branches

## 📞 Soporte

Si necesitas ayuda:
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Next.js Docs: https://nextjs.org/docs
