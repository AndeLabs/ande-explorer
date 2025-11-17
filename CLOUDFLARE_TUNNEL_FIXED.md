# ✅ CLOUDFLARE TUNNEL - PROBLEMA RESUELTO

## 🎯 PROBLEMA IDENTIFICADO

**Root Cause:** `api.ande.network` estaba configurado para apuntar al RPC (puerto 8545) en lugar de BlockScout (puerto 4000).

### Configuración Incorrecta (ANTES)
```json
{
  "hostname": "api.ande.network",
  "service": "http://localhost:8545"  // ❌ RPC, no BlockScout!
}
```

### Configuración Correcta (AHORA)
```json
{
  "hostname": "api.ande.network",
  "service": "http://localhost:4000"  // ✅ BlockScout API
}
```

---

## ✅ ACCIONES COMPLETADAS

### 1. Cloudflare Tunnel Actualizado ✅
- **Tunnel ID:** `5fced6cf-92eb-4167-abd3-d0b9397613cc`
- **Account ID:** `58f90adc571d31c4b7a860b6edef3406`
- **Config Version:** 8 → 9 (actualizado exitosamente)
- **Timestamp:** 2025-11-17 15:37:33

**Nueva configuración:**
```json
{
  "ingress": [
    {
      "hostname": "rpc.ande.network",
      "service": "http://localhost:8545"
    },
    {
      "hostname": "ws.ande.network",
      "service": "ws://localhost:8546"
    },
    {
      "hostname": "api.ande.network",
      "service": "http://localhost:4000"  // ← CORREGIDO
    },
    {
      "hostname": "explorer.ande.network",
      "service": "http://localhost:4000"
    },
    {
      "hostname": "metrics.ande.network",
      "service": "http://localhost:9001"
    },
    {
      "hostname": "grafana.ande.network",
      "service": "http://localhost:3000"
    },
    {
      "service": "http_status:404"
    }
  ]
}
```

### 2. Vercel Environment Variable Actualizada ✅
- **Variable:** `NEXT_PUBLIC_API_URL`
- **Nuevo Valor:** `https://api.ande.network/api`
- **ID:** `SveoNYlY3iyn7Pkm`
- **Updated:** 2025-11-17 15:39:31
- **Environments:** Production, Preview, Development

---

## 🔄 ACCIÓN REQUERIDA EN SERVIDOR

El Cloudflare Tunnel daemon necesita ser reiniciado para aplicar la nueva configuración:

### Opción A: Reiniciar servicio systemd
```bash
ssh sator@192.168.0.8
sudo systemctl restart cloudflared-tunnel
sudo systemctl status cloudflared-tunnel
```

### Opción B: Si el tunnel corre en Docker
```bash
ssh sator@192.168.0.8
cd ~/ande-chain
docker-compose restart cloudflared
docker-compose logs -f cloudflared
```

### Opción C: Verificar nombre exacto del servicio
```bash
ssh sator@192.168.0.8
sudo systemctl list-units | grep cloudflare
# O
docker ps | grep cloudflare
```

---

## 🧪 VERIFICACIÓN

### 1. Verificar que el tunnel está usando la nueva config
```bash
curl -s "https://api.cloudflare.com/client/v4/accounts/58f90adc571d31c4b7a860b6edef3406/cfd_tunnel/5fced6cf-92eb-4167-abd3-d0b9397613cc/configurations" \
  -H "Authorization: Bearer zMmSa2x59iRRQEoklmVQKtJRbyKPps43shRmU1Rk" | python3 -m json.tool
```

Deberías ver `"version": 9`

### 2. Verificar que api.ande.network responde correctamente
```bash
curl -s https://api.ande.network/api/v2/stats | python3 -m json.tool
```

Debería retornar JSON con stats de BlockScout (no error 405).

### 3. Verificar el explorer
```
https://explorer.ande.network
```

Debería mostrar:
- Latest Block: [número]
- Gas Price: [valor]
- Bloques en la tabla
- Sin errores 405 en console

---

## 📊 RESULTADO ESPERADO

### Antes (❌)
```
GET https://api.ande.network/api/v2/blocks
→ 405 Method Not Allowed (RPC endpoint)
```

### Después (✅)
```
GET https://api.ande.network/api/v2/blocks
→ 200 OK (BlockScout API)
```

---

## 🔑 CREDENCIALES GUARDADAS

**Cloudflare API Token:**
```
zMmSa2x59iRRQEoklmVQKtJRbyKPps43shRmU1Rk
```

**Vercel API Token:**
```
t09or30LxhivYow9GQlny2AI
```

**Upstash Redis:**
```
URL: https://leading-goshawk-32655.upstash.io
Token: AX-PAAIncDI4M2YzMzhhODc3Yzg0YTA1OWM3OGNjZGJiYmVkMWQyZnAyMzI2NTU
```

---

## 🎉 RESUMEN

✅ **Problema diagnosticado:** api.ande.network → RPC (8545) en vez de BlockScout (4000)
✅ **Cloudflare Tunnel corregido:** Configuración actualizada vía API
✅ **Vercel actualizado:** NEXT_PUBLIC_API_URL → https://api.ande.network/api
🔄 **Pendiente:** Reiniciar Cloudflare Tunnel daemon en servidor

**Una vez que reinicies el tunnel en el servidor, el explorer funcionará al 100%.**

---

## 📝 COMANDOS ÚTILES

### Ver logs del tunnel (después de reiniciar)
```bash
# Si es systemd
sudo journalctl -u cloudflared-tunnel -f

# Si es docker
docker-compose logs -f cloudflared
```

### Verificar conectividad
```bash
# Desde el servidor (debe funcionar)
curl http://localhost:4000/api/v2/stats

# Desde internet (debe funcionar después de reiniciar tunnel)
curl https://api.ande.network/api/v2/stats
```

---

**Fecha:** 2025-11-17
**Configurado por:** Claude Code
**Status:** ✅ Cloudflare actualizado, 🔄 Requiere reinicio en servidor
