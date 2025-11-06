# 🔄 Migración: explorer.ande.network → explorer.ande.chain

## 📋 Situación Actual

✅ **Backend FUNCIONAL**: `https://explorer.ande.network/api/v2/stats`  
✅ **Base de datos conectada**  
✅ **Servicios Docker operativos**

## 🎯 Objetivo

Migrar el frontend a tu nuevo dominio `explorer.ande.chain` manteniendo el backend actual.

## 🚀 Plan de Migración

### Paso 1: Configurar DNS para .chain

Agrega estos registros CNAME a tu DNS de `ande.chain`:

```
Tipo: CNAME
Nombre: explorer
Valor: cname.vercel-dns.com
TTL: 60

Tipo: CNAME
Nombre: explorer-advanced
Valor: cname.vercel-dns.com
TTL: 60
```

### Paso 2: Actualizar Configuración de Backend

En tu servidor donde corre el BlockScout actual:

```bash
# Editar archivo de configuración
cd /ruta/a/tu/blockscout
nano .env  # o docker-compose.yml

# Actualizar dominios:
BLOCKSCOUT_HOST=explorer.ande.chain
BLOCKSCOUT_HOST_ADVANCED=explorer-advanced.ande.chain

# Reiniciar servicios
docker-compose restart
```

### Paso 3: Desplegar Frontend a Vercel

```bash
# Clonar repositorio actual si no lo tienes
git clone https://github.com/AndeLabs/ande-explorer.git
cd ande-explorer

# Instalar Vercel CLI
npm i -g vercel

# Desplegar frontend
vercel login
vercel link
vercel --prod

# Agregar dominios
vercel domains add explorer.ande.chain
vercel domains add explorer-advanced.ande.chain
```

### Paso 4: Configurar API Proxy

Actualiza `vercel.json` para que apunte a tu backend actual:

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://explorer.ande.network/api/$1"
    }
  ]
}
```

### Paso 5: Verificación

```bash
# Verificar DNS
dig CNAME explorer.ande.chain

# Verificar SSL
curl -I https://explorer.ande.chain

# Verificar API
curl https://explorer.ande.chain/api/v2/stats
```

## 🔧 Configuración Archivos Clave

### .env (Backend)
```bash
# Actualizar dominios
BLOCKSCOUT_HOST=explorer.ande.chain
BLOCKSCOUT_HOST_ADVANCED=explorer-advanced.ande.chain
BLOCKSCOUT_PROTOCOL=https

# Mantener backend actual temporalmente
BACKEND_API_URL=https://explorer.ande.network
```

### vercel.json (Frontend)
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://explorer.ande.network/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_HOST": "explorer.ande.network",
    "NEXT_PUBLIC_APP_HOST": "explorer.ande.chain"
  }
}
```

## 📈 Estrategia de Migración Progresiva

### Fase 1: Frontend Nuevo + Backend Actual
- Frontend: `explorer.ande.chain` (Vercel)
- Backend API: `explorer.ande.network` (Docker actual)

### Fase 2: Backend Migrado
- Mover backend a `explorer-advanced.ande.chain`
- Actualizar frontend para usar nuevo backend

### Fase 3: Transición Completa
- Todo funcionando bajo `.chain`
- Desactivar viejo `.network`

## 🎯 URLs Finales Esperadas

```
Frontend: https://explorer.ande.chain
Analytics: https://explorer-advanced.ande.chain
API: https://explorer-advanced.ande.chain/api/v2/
```

## 🔍 Testing Post-Migración

```bash
# Test 1: Frontend carga
curl https://explorer.ande.chain

# Test 2: API responde
curl https://explorer.ande.chain/api/v2/stats

# Test 3: SSL certificates
openssl s_client -connect explorer.ande.chain:443

# Test 4: Headers de seguridad
curl -I https://explorer.ande.chain
```

## 🆘 Troubleshooting

### DNS Issues
```bash
# Verificar propagación DNS
dig +trace explorer.ande.chain
nslookup explorer.ande.chain
```

### SSL Issues
```bash
# Verificar certificado SSL
curl -v https://explorer.ande.chain
openssl s_client -connect explorer.ande.chain:443
```

### API Connection Issues
```bash
# Test API directo
curl https://explorer.ande.network/api/v2/health
curl https://explorer.ande.chain/api/v2/health
```

## 📋 Checklist de Migración

### Pre-Migración
- [ ] Backup de configuración actual
- [ ] Verificar estado actual del backend
- [ ] Documentar URLs actuales en uso

### Durante Migración
- [ ] Configurar DNS para .chain
- [ ] Desplegar frontend a Vercel
- [ ] Configurar API proxy
- [ ] Verificar funcionamiento

### Post-Migración
- [ ] Test completo de funcionalidad
- [ ] Monitorear errores
- [ ] Actualizar documentación
- [ ] Comunicar cambio a usuarios

## ⏰ Timeline Estimado

- **DNS Configuración**: 15 minutos
- **DNS Propagación**: 5-60 minutos
- **Vercel Deployment**: 10 minutos
- **Testing y Verificación**: 30 minutos
- **Total**: ~2 horas

## 🎉 ¡Resultado Final!

Usuarios accederán a:
- **https://explorer.ande.chain** - Explorer principal
- **https://explorer-advanced.ande.chain** - Analytics avanzados
- **Performance global** con Vercel CDN
- **SSL automático** y **DDoS protection**

## 🔄 Rollback Plan

Si algo falla:
```bash
# Revertir DNS a estado anterior
# Borrar proyecto Vercel
# Mantener explorer.ande.network funcionando
```

---

¿Listo para empezar con la configuración DNS? 🚀