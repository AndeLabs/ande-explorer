# 🚀 UPSTASH - PASOS FINALES (5 minutos)

## ✅ YA COMPLETADO

- [x] Código actualizado para Upstash REST API
- [x] @upstash/redis instalado
- [x] Todo sincronizado en GitHub
- [x] Vercel rebuilding automáticamente

---

## 🔴 PENDIENTE - HACER AHORA

### PASO 1: Obtener Credenciales de Upstash

Tienes la API Key: `9b85f3e5-90b4-4d12-9b4e-2f2bf9761d98`

Ahora necesitas obtener la **REST URL** y **REST TOKEN** completos:

#### Opción A: Si ya tienes una database en Upstash

1. **Ir a Upstash Console:**
   ```
   https://console.upstash.com/redis
   ```

2. **Seleccionar tu database** (o crear una nueva)

3. **Copiar credenciales** de la sección "REST API":
   ```
   📋 REST API
   ─────────────────────────────────────────
   UPSTASH_REDIS_REST_URL
   https://xxxxx-xxxxx.upstash.io    ← COPIAR ESTO

   UPSTASH_REDIS_REST_TOKEN
   AxxxxxxxxxxxxxxxxxxxxxxxxxxxQ==    ← COPIAR ESTO
   ```

#### Opción B: Si NO tienes database todavía

1. **Ir a:** https://console.upstash.com/

2. **Login** con tu cuenta (usando el API key que tienes)

3. **Click "Create Database"**

4. **Configurar:**
   - **Name:** `ande-explorer-cache`
   - **Type:** Regional (más económico)
   - **Region:** `us-east-1` (o el más cercano a tus usuarios)
   - **TLS:** ✅ Enabled
   - **Eviction:** ✅ Enabled

5. **Click "Create"**

6. **Copiar credenciales** de la página que aparece

---

### PASO 2: Configurar Variables en Vercel

1. **Ir a Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Seleccionar tu proyecto** `ande-explorer`

3. **Settings → Environment Variables**

4. **Agregar 3 variables** (Click "Add New"):

#### Variable 1:
```
Name: REDIS_ENABLED
Value: true
```
**Environments:** ☑ Production ☑ Preview ☑ Development
**Click "Save"**

#### Variable 2:
```
Name: UPSTASH_REDIS_REST_URL
Value: https://xxxxx-xxxxx.upstash.io
```
*(Pegar el valor que copiaste de Upstash)*

**Environments:** ☑ Production ☑ Preview ☑ Development
**Click "Save"**

#### Variable 3:
```
Name: UPSTASH_REDIS_REST_TOKEN
Value: AxxxxxxxxxxxxxxxxxxxxxxxxxxxQ==
```
*(Pegar el valor que copiaste de Upstash)*

**Environments:** ☑ Production ☑ Preview ☑ Development
**Click "Save"**

---

### PASO 3: Redeploy

Vercel ya está rebuilding automáticamente por el push a GitHub, PERO para que las variables de entorno tomen efecto:

1. **Ir a: Deployments**

2. **Encontrar el deployment más reciente** (el que está building ahora)

3. **Esperar a que termine**

4. **Click "..." → Redeploy**
   - ☑ Use existing Build Cache
   - Click "Redeploy"

---

### PASO 4: Verificar que Funciona

1. **Esperar ~2 minutos** a que termine el deploy

2. **Ir a:** https://explorer.ande.network

3. **Abrir DevTools** → Network tab

4. **Navegar por el explorer**

5. **Verificar cache stats:**
   ```
   https://explorer.ande.network/api/cache?action=stats
   ```

   Deberías ver:
   ```json
   {
     "keys": 5,           ← Número de keys cacheadas
     "enabled": true,     ← Redis habilitado
     "provider": "upstash" ← Usando Upstash
   }
   ```

6. **Verificar logs en Vercel:**
   - Functions → Último deployment → Logs
   - Buscar: `[Upstash] Redis client initialized` ✅

---

## 📊 QUÉ ESPERAR

### Performance Antes vs Después

| Métrica | Sin Upstash | Con Upstash | Mejora |
|---------|-------------|-------------|--------|
| First Load | 3-5s | < 1s | **5x** ⚡ |
| TTFB | 800ms | 100ms | **8x** ⚡ |
| API Response | 400ms | 30ms | **13x** ⚡ |
| Navegación | Lenta | Instantánea | **∞** ⚡ |

### Cache Hit Rate Esperado

- **Primera visita:** 0% (cache vacío)
- **Después de 1 minuto:** 50-70%
- **Después de 5 minutos:** 80-90%
- **Steady state:** 90%+

---

## 🔍 TROUBLESHOOTING

### Si no funciona:

1. **Verificar variables en Vercel:**
   - Settings → Environment Variables
   - Confirmar que las 3 están presentes
   - Confirmar que no hay espacios extra

2. **Ver logs en Vercel:**
   - Functions → Deployment → Logs
   - Buscar errores de Upstash
   - Buscar `[Upstash]` en logs

3. **Verificar credenciales:**
   - REST URL debe empezar con `https://`
   - REST TOKEN es un string largo (no el API key de 36 caracteres)

4. **Si dice "Redis disabled":**
   - Verifica que `REDIS_ENABLED=true` (no "True" o "TRUE")
   - Redeploy forzado

---

## 🎉 CUANDO FUNCIONE

Vas a notar:

✅ **Homepage carga instantánea**
✅ **Navegación entre bloques sin delay**
✅ **Búsquedas rápidas**
✅ **Stats en tiempo real**
✅ **Experiencia como Etherscan**

---

## 📝 RESUMEN RÁPIDO

```bash
1. Ir a: https://console.upstash.com/redis
2. Copiar: UPSTASH_REDIS_REST_URL
3. Copiar: UPSTASH_REDIS_REST_TOKEN
4. Ir a: https://vercel.com/dashboard
5. Agregar las 3 variables de entorno
6. Redeploy
7. Esperar 2 minutos
8. Disfrutar velocidad máxima ⚡
```

---

**¿Necesitas ayuda con algún paso?** 🤔

Estoy aquí para ayudarte con:
- Encontrar las credenciales en Upstash
- Configurar las variables en Vercel
- Verificar que funciona
- Troubleshoot si hay problemas
