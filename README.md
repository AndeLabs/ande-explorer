# Ande Chain Explorer

Professional blockchain explorer for Ande Chain using **Vercel + Docker hybrid architecture**.

## 🏗️ Arquitectura Híbrida

Este es un despliegue **híbrido** que combina lo mejor de dos mundos:

### 🌐 **Frontend en Vercel** (Global CDN)
- Rápido en cualquier país con Edge Network
- SSL automático y DDoS protection
- Despliegues continuos con Git integration
- Coste eficiente (pago por uso)

### 🐳 **Backend en Docker** (Servidores Dedicados)
- Control total de base de datos PostgreSQL
- Procesamiento pesado de blockchain
- Configuración personalizada de BlockScout
- Seguridad en red privada

## 🚀 Flujo de Despliegue

### Paso 1: **Subir a GitHub**
```bash
# Subir TODO el repositorio
git add .
git commit -m "Setup Ande Chain Explorer - Vercel + Docker"
git push origin main
```

### Paso 2: **Desplegar Frontend a Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Conectar y desplegar SOLO el frontend
vercel link
vercel --prod

# Configurar dominios
vercel domains add explorer.ande.chain
vercel domains add explorer-advanced.ande.chain
```

### Paso 3: **Configurar DNS**
En tu proveedor de DNS de `ande.chain`:

```
Type: CNAME
Name: explorer
Value: cname.vercel-dns.com
TTL: 60

Type: CNAME
Name: explorer-advanced
Value: cname.vercel-dns.com
TTL: 60
```

### Paso 4: **Desplegar Backend en Servidores**
```bash
# En tus servidores dedicados
git clone https://github.com/AndeLabs/ande-explorer.git
cd ande-explorer

# Configurar variables
cp .env.example .env
# Editar .env con credenciales del servidor

# Iniciar servicios backend
bash infra/scripts/start.sh prod
```

## 🌍 URLs Finales

- **Main Explorer**: https://explorer.ande.chain
- **Advanced Explorer**: https://explorer-advanced.ande.chain
- **API Endpoints**: https://explorer-advanced.ande.chain/api/v2/

## 📂 ¿Qué va a cada plataforma?

### 🌐 **A Vercel** (Frontend)
```
✅ public/              # Archivos estáticos
✅ vercel.json          # Configuración de rutas
✅ package.json         # Metadatos del proyecto
✅ public/index.html    # Página principal
❌ docker/              # NO - Backend services
❌ infra/               # NO - Scripts de servidor
❌ config/              # NO - Configuración backend
```

### 🐳 **A Servidores Docker** (Backend)
```
✅ docker/docker-compose.yml           # Todos los servicios
✅ docker/docker-compose.production.yml # Config producción
✅ infra/nginx/                        # Proxy reverso
✅ infra/scripts/                      # Gestión de servicios
✅ config/blockscout/                  # Configuración BlockScout
❌ public/                             # NO - Frontend en Vercel
```

## 🔄 Flujo de Comunicación

```
Usuario → Vercel (CDN) → API Proxy → Docker Backend
   ↓         ↓              ↓           ↓
 Frontend   Static         PostgreSQL   Redis
   JS       Files          + Blockchain Cache
```

## 📁 Archivos Clave

### Configuración Vercel
- **`.vercelignore`** - Excluye backend del despliegue
- **`vercel.json`** - Rutas API y security headers
- **`public/index.html`** - Frontend con tema Ande Chain

### Backend Docker
- **`.env`** - Variables de entorno del backend
- **`docker/docker-compose.yml`** - Todos los servicios
- **`config/blockscout/custom-config.yml`** - Config BlockScout

### Integración
- **`infra/nginx/sites/main.conf`** - Config para explorer.ande.chain
- **`infra/nginx/sites/advanced.conf`** - Config para analytics

## ⚙️ Variables de Entorno

### Backend (.env)
```bash
# Database
DB_USER=blockscout
DB_PASSWORD=tu_password_seguro
DB_NAME=blockscout

# Network
RPC_URL=http://ev-reth-sequencer:8545
CHAIN_ID=42170

# Domains
BLOCKSCOUT_HOST_MAIN=explorer.ande.chain
BLOCKSCOUT_HOST_ADVANCED=explorer-advanced.ande.chain
```

### Vercel (vercel.json)
Las variables de entorno del frontend están configuradas en `vercel.json`:
- API proxy configuration
- Network parameters
- Security headers

## 🔧 Comandos de Gestión

### Frontend (Vercel)
```bash
# Desplegar cambios
vercel --prod

# Ver logs
vercel logs

# Dominios
vercel domains ls
```

### Backend (Servidores)
```bash
# Health check completo
bash infra/scripts/health-check.sh

# Ver logs de servicios
docker logs -f blockscout-main-backend

# Reiniciar servicios
bash infra/scripts/stop.sh && bash infra/scripts/start.sh prod

# Backup database
bash infra/scripts/backup.sh
```

## 🎯 Features

- ✅ **Dual Explorer** - Main UI + Advanced Analytics
- ✅ **Global CDN** - Vercel Edge Network
- ✅ **Real-time Data** - WebSocket connections
- ✅ **Smart Contract Verification** - Source code + ABI
- ✅ **Token Tracking** - ERC-20, ERC-721, ERC-1155
- ✅ **Advanced Analytics** - Metrics y export data
- ✅ **Professional Security** - SSL, CORS, Rate limiting
- ✅ **Auto-scaling** - Frontend en Vercel, Backend escalable

## 🔍 Verificación del Despliegue

### DNS Check
```bash
# Verificar CNAME records
dig CNAME explorer.ande.chain
dig CNAME explorer-advanced.ande.chain
```

### SSL Check
```bash
# Verificar certificados SSL
openssl s_client -connect explorer.ande.chain:443
openssl s_client -connect explorer-advanced.ande.chain:443
```

### Health Check
```bash
# Frontend health
curl https://explorer.ande.chain/_health

# Backend API health
curl https://explorer-advanced.ande.chain/api/v2/health
```

## 🔧 Troubleshooting

### Frontend Issues
- **404s**: Verificar `vercel.json` routes
- **CORS**: Check API proxy configuration
- **SSL**: Confirm DNS propagation (5-60 min)

### Backend Issues
- **Connection timeout**: Verificar firewall y puertos
- **Database errors**: Check Docker containers status
- **Performance**: Monitor PostgreSQL queries

```bash
# Debug completo
bash infra/scripts/health-check.sh --verbose
docker-compose -f docker/docker-compose.yml ps
```

## 🆘 Support

### Frontend Vercel
- Dashboard: https://vercel.com/dashboard
- Logs: `vercel logs --follow`
- Documentation: https://vercel.com/docs

### Backend Docker
- Health: `bash infra/scripts/health-check.sh`
- Logs: `docker logs -f [container-name]`
- Status: `docker-compose ps`

---

**Ande Labs** - Professional Blockchain Infrastructure

Esta arquitectura híbrida te da:
🚀 **Performance Global** (Vercel CDN) + 🔧 **Control Total** (Docker Backend)