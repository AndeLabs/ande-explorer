# BlockScout Backend for ANDE Explorer

Este directorio contiene la configuración de BlockScout backend que proporciona indexación y API para el ANDE Explorer.

## 🏗️ Arquitectura

```
┌──────────────────────┐
│   ANDE Chain RPC     │
│  rpc.ande.network    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  BlockScout Backend  │
│  - Indexer           │
│  - API v2            │
│  - WebSocket         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    PostgreSQL DB     │
│  (Datos indexados)   │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  Frontend Custom     │
│   (../frontend/)     │
└──────────────────────┘
```

## 🚀 Quick Start

### 1. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env y configurar:
# - POSTGRES_PASSWORD (usar password fuerte)
# - SECRET_KEY_BASE (generar con: openssl rand -base64 64)
```

### 2. Iniciar servicios

```bash
# Servicios básicos (Backend + DB + Redis)
docker-compose up -d

# Con Smart Contract Verifier
docker-compose --profile with-verifier up -d

# Con Stats Service
docker-compose --profile with-stats up -d

# Todo incluido
docker-compose --profile with-verifier --profile with-stats --profile with-visualizer up -d
```

### 3. Verificar estado

```bash
# Ver logs
docker-compose logs -f backend

# Ver estado de servicios
docker-compose ps

# Verificar health
curl http://localhost:4000/api/v2/health

# Ver progreso de indexación
curl http://localhost:4000/api/v2/stats
```

## 📊 Endpoints

### Backend API
- **Health Check**: http://localhost:4000/api/v2/health
- **Stats**: http://localhost:4000/api/v2/stats
- **Blocks**: http://localhost:4000/api/v2/blocks
- **Transactions**: http://localhost:4000/api/v2/transactions
- **Addresses**: http://localhost:4000/api/v2/addresses/:hash
- **Docs**: http://localhost:4000/api/docs

### Database
- **PostgreSQL**: localhost:7432
- **User**: blockscout
- **Database**: blockscout

### Redis
- **Port**: 6379

## 🔧 Comandos Útiles

### Ver logs
```bash
# Backend
docker-compose logs -f backend

# Database
docker-compose logs -f db

# Todos
docker-compose logs -f
```

### Reiniciar servicios
```bash
# Reiniciar backend
docker-compose restart backend

# Reiniciar todo
docker-compose restart
```

### Acceder a PostgreSQL
```bash
docker-compose exec db psql -U blockscout -d blockscout

# Ver bloques indexados
SELECT COUNT(*) FROM blocks;

# Ver transacciones
SELECT COUNT(*) FROM transactions;

# Ver última sincronización
SELECT MAX(number) FROM blocks;
```

### Limpiar y reiniciar
```bash
# CUIDADO: Borra todos los datos
docker-compose down -v
docker-compose up -d
```

## 📈 Monitoring

### Verificar sincronización
```bash
# Último bloque en la chain
cast block-number --rpc-url https://rpc.ande.network

# Último bloque indexado
curl -s http://localhost:4000/api/v2/stats | jq '.total_blocks'

# Diferencia (cuántos bloques faltan)
```

### Métricas de performance
```bash
# Queries lentas en PostgreSQL
docker-compose exec db psql -U blockscout -d blockscout -c \
  "SELECT query, calls, total_time/1000 as total_seconds 
   FROM pg_stat_statements 
   ORDER BY total_time DESC LIMIT 10;"
```

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Ver logs completos
docker-compose logs backend

# Verificar conexión a RPC
curl -X POST https://rpc.ande.network \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

### Indexación lenta
1. Reducir `INDEXER_CATCHUP_BLOCKS_BATCH_SIZE`
2. Aumentar `POOL_SIZE`
3. Verificar performance de PostgreSQL

### Error de conexión a DB
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps db

# Ver logs de PostgreSQL
docker-compose logs db

# Probar conexión
docker-compose exec db pg_isready -U blockscout
```

## 🔐 Seguridad

### Cambiar passwords en producción

```bash
# Generar SECRET_KEY_BASE
openssl rand -base64 64

# Generar POSTGRES_PASSWORD
openssl rand -base64 32

# Actualizar en .env
```

### Firewall
Solo exponer puertos necesarios:
- `4000` - BlockScout API (si se accede externamente)
- `7432` - PostgreSQL (solo si se necesita acceso externo - NO RECOMENDADO)

## 📚 Documentación

- [BlockScout Docs](https://docs.blockscout.com/)
- [API v2 Documentation](https://docs.blockscout.com/for-users/api/api-documentation)
- [Docker Setup](https://github.com/blockscout/blockscout/tree/master/docker-compose)

## 🎯 Próximos Pasos

1. ✅ Configurar `.env`
2. ✅ Levantar servicios con `docker-compose up -d`
3. ✅ Verificar que indexe correctamente
4. ⏳ Actualizar frontend para usar BlockScout API
5. ⏳ Desplegar en producción (servidor 192.168.0.8)
