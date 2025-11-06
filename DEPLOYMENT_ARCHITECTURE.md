# Ande Chain Explorer - Arquitectura de Despliegue

## 📋 Resumen de la Arquitectura

Este es un **despliegue híbrido** que combina:

1. **Frontend en Vercel** (servido globalmente)
2. **Backend en Docker** (servidores dedicados)
3. **API Gateway** (conexión entre frontend y backend)

## 🏗️ ¿Qué va a cada plataforma?

### 📦 **GitHub Repository (TODO el proyecto)**
```
ande-explorer/
├── frontend/              # ← Este va a Vercel
├── docker/               # ← Este va a servidores dedicados
├── config/               # ← Compartido entre ambos
├── vercel.json          # ← Configuración de Vercel
└── README.md            # ← Documentación completa
```

### 🌐 **Vercel (FRONTEND SOLAMENTE)**
- **Qué se despliega**: Solo los archivos estáticos del frontend
- **No se despliega**: Los servicios Docker (database, redis, backend)

### 🐳 **Servidores Dedicados (BACKEND COMPLETO)**
- **Qué corre acá**: Todos los servicios Docker
- **Qué NO corre acá**: El frontend web

## 🔄 Flujo de Comunicación

```
Usuario → Vercel (Frontend) → API Gateway → Docker Backend
    ↓           ↓                     ↓
  CDN Edge    Static Files        PostgreSQL/Redis
```

## 📂 Estructura de Archivos por Plataforma

### 🌐 **Para Vercel (archivos clave)**
```
├── public/                    # Archivos estáticos del explorer
├── api/                       # Funciones serverless de Vercel
├── vercel.json               # Configuración de rutas
├── package.json              # Dependencias de frontend
└── .vercelignore            # Excluir backend de Vercel
```

### 🐳 **Para Servidores Docker**
```
├── docker/
│   ├── docker-compose.yml              # Todos los servicios
│   └── docker-compose.production.yml  # Configuración de producción
├── infra/
│   ├── nginx/                         # Proxy reverso
│   └── scripts/                       # Scripts de gestión
└── config/                           # Configuración compartida
```

## 🚀 Proceso de Despliegue

### Paso 1: Preparar el Repository

1. **Subir todo a GitHub**:
```bash
git add .
git commit -m "Setup Ande Chain Explorer - Vercel + Docker hybrid"
git push origin main
```

2. **Configurar `.vercelignore`**:
```gitignore
# Excluir backend del despliegue de Vercel
docker/
infra/
config/blockscout/
*.md
!README.md
```

### Paso 2: Desplegar Frontend a Vercel

```bash
# 1. Conectar repo a Vercel
vercel link

# 2. Desplegar solo frontend
vercel --prod

# 3. Configurar dominios
vercel domains add explorer.ande.chain
vercel domains add explorer-advanced.ande.chain
```

### Paso 3: Desplegar Backend en Servidores

```bash
# 1. En tus servidores dedicados
git clone https://github.com/AndeLabs/ande-explorer.git
cd ande-explorer

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales del servidor

# 3. Iniciar servicios backend
bash infra/scripts/start.sh prod
```

## 🔧 Configuración de Conexión

### En Vercel (Frontend)
El `vercel.json` configura:
- **API Routes**: Proxies a `explorer-advanced.ande.chain`
- **Static Assets**: Servidos por Vercel CDN
- **Security Headers**: Protección en el edge

### En Servidores (Backend)
El `docker-compose.yml` configura:
- **BlockScout Backend**: API y procesamiento de blockchain
- **PostgreSQL + Redis**: Base de datos y caché
- **Nginx**: Proxy para acceso directo

## 🌍 URLs y Dominios

### Frontend (Vercel)
```
https://explorer.ande.chain          # Explorer principal
https://explorer-advanced.ande.chain # Analytics y datos avanzados
```

### Backend API (Servidores)
```
https://explorer-advanced.ande.chain/api/v2/*  # Todas las APIs
```

## 📊 ¿Por qué esta arquitectura?

### ✅ **Ventajas del Frontend en Vercel**
- **Global CDN**: Rápido en cualquier país
- **SSL Automático**: Certificados gestionados
- **DDoS Protection**: Seguridad empresarial
- **Zero Downtime**: Despliegues continuos
- **Coste Eficiente**: Solo por lo que se usa

### ✅ **Ventajas del Backend Docker**
- **Control Total**: Configuración personalizada
- **Base de Datos Local**: Acceso directo a PostgreSQL
- **Procesamiento Pesado**: Indexing, analytics
- **Seguridad Completa**: Red privada
- **Escalabilidad Horizontal**: Más servidores si se necesita

## 🔄 Flujo de Datos Real

```
1. Usuario abre explorer.ande.chain (Vercel CDN)
2. Frontend carga desde CDN global
3. Usuario busca transacción → API call a explorer-advanced.ande.chain/api/v2/
4. Vercel hace proxy a tus servidores Docker
5. BlockScout Backend procesa en PostgreSQL
6. Respuesta vuelve por mismo camino
```

## 🚨 Puntos Críticos

### 🔐 **Seguridad**
- API endpoints protegidos por rate limiting
- CORS configurado para solo tus dominios
- Headers de seguridad en ambos lados

### ⚡ **Performance**
- Frontend cacheado en Vercel Edge
- Backend optimizado con Redis cache
- CDN para assets estáticos

### 🔧 **Mantenimiento**
- Frontend: Push a GitHub → Deploy automático
- Backend: `bash infra/scripts/health-check.sh`

## 📋 Checklist de Despliegue

### ✅ **Vercel Checklist**
- [ ] Conectar repository a Vercel
- [ ] Configurar dominios custom
- [ ] Verificar DNS CNAME records
- [ ] Testear SSL certificates
- [ ] Probar API proxy functionality

### ✅ **Backend Checklist**
- [ ] Clonar repo en servidores
- [ ] Configurar variables .env
- [ ] Iniciar servicios Docker
- [ ] Configurar firewall y puertos
- [ ] Verificar health checks

### ✅ **Integración Checklist**
- [ ] Probar frontend → backend API calls
- [ ] Verificar CORS headers
- [ ] Testear WebSocket connections
- [ ] Monitorizar rendimiento global
- [ ] Configurar alerts de monitoreo

## 🆘 Troubleshooting

### Frontend Issues
- **404s**: Verificar `vercel.json` routes
- **CORS**: Check API proxy configuration
- **SSL**: Confirm DNS propagation

### Backend Issues
- **Connection timeout**: Verificar firewall
- **Database errors**: Check Docker containers
- **Performance**: Monitor PostgreSQL queries

---

Esta arquitectura te da lo mejor de ambos mundos: 
🚀 **Performance global** con Vercel + 🔧 **Control total** con Docker backend.