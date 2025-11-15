# Configurar Dominio explorer.ande.network en Vercel

## Paso 1: Acceder a tu proyecto en Vercel

1. Ve a https://vercel.com/dashboard
2. Busca el proyecto "ande-explorer"
3. Click en el proyecto

## Paso 2: Configurar Dominio Personalizado

1. Ve a **Settings** → **Domains**
2. Click **"Add"**
3. Escribe: `explorer.ande.network`
4. Click **"Add"**

## Paso 3: Configurar DNS en Cloudflare

El DNS ya está configurado correctamente:
- explorer.ande.network → CNAME → 5fced6cf-92eb-4167-abd3-d0b9397613cc.cfargotunnel.com

Pero necesitas cambiar esto para apuntar a Vercel:

### Opción A: CNAME a Vercel (Recomendado)
```
Type: CNAME
Name: explorer
Content: cname.vercel-dns.com
Proxied: No (Gris, no naranja)
```

### Opción B: A Records a Vercel
```
Type: A
Name: explorer
Content: 76.76.21.21
Proxied: No
```

## Paso 4: Verificar en Vercel

1. Después de configurar el DNS, vuelve a Vercel
2. El dominio debería verificarse automáticamente
3. Verás un check verde ✅ cuando esté listo

## Paso 5: Variables de Entorno en Vercel

Ve a **Settings** → **Environment Variables** y agrega:

```
NEXT_PUBLIC_CHAIN_ID = 6174
NEXT_PUBLIC_CHAIN_NAME = ANDE Network
NEXT_PUBLIC_RPC_URL = https://rpc.ande.network
NEXT_PUBLIC_WS_URL = wss://ws.ande.network
NEXT_PUBLIC_NETWORK_CURRENCY = ANDE
NEXT_PUBLIC_IS_L2_NETWORK = true
NEXT_PUBLIC_ENABLE_WEBSOCKETS = true
```

## Paso 6: Redeploy

1. Ve a **Deployments**
2. Click en los 3 puntos del deployment más reciente
3. Click **"Redeploy"**
4. Click **"Redeploy"** en el popup

## URLs Finales

- Production: https://explorer.ande.network
- Preview: https://ande-explorer.vercel.app
- GitHub: https://github.com/AndeLabs/ande-explorer

## Status Check

Después de 5-10 minutos, prueba:
```bash
curl https://explorer.ande.network
```

## Si hay problemas:

1. **Error de SSL**: Espera 5 minutos más para propagación
2. **404 Error**: Verifica que el build esté correcto en Vercel
3. **Página en blanco**: Check las variables de entorno
4. **No conecta al chain**: Verifica que rpc.ande.network responda

## Comandos útiles:

```bash
# Verificar DNS
nslookup explorer.ande.network

# Test RPC
curl https://rpc.ande.network

# Check deployment
curl -I https://explorer.ande.network
```