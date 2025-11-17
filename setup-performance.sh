#!/bin/bash

###########################################
# ANDE Explorer Performance Setup
# Script ÚNICO para optimizar el explorer
# Se ejecuta en el servidor (192.168.0.8)
###########################################

set -e

echo "🚀 ANDE Explorer Performance Optimization Setup"
echo "================================================================"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ================================================================
# PASO 1: Instalar Redis
# ================================================================
echo ""
echo -e "${BLUE}PASO 1: Instalando Redis Cache${NC}"
echo "================================================================"

sudo apt-get update -qq
sudo apt-get install -y redis-server

echo -e "${GREEN}✅ Redis instalado${NC}"

# Configurar Redis para producción
echo -e "${YELLOW}⚙️  Configurando Redis...${NC}"

sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup 2>/dev/null || true

sudo tee /etc/redis/redis.conf > /dev/null <<EOF
# ANDE Explorer Redis Cache Configuration
bind 127.0.0.1
port 6379
timeout 0
tcp-keepalive 300

# Memory: 1GB cache
maxmemory 1gb
maxmemory-policy allkeys-lru

# Sin persistencia (pure cache)
save ""
appendonly no

# Performance
stop-writes-on-bgsave-error no
rdbcompression yes
rdbchecksum yes

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Limits
maxclients 10000
slowlog-log-slower-than 10000
slowlog-max-len 128
EOF

sudo chown redis:redis /etc/redis/redis.conf
sudo chmod 640 /etc/redis/redis.conf

# Iniciar Redis
sudo systemctl enable redis-server
sudo systemctl restart redis-server
sleep 2

if redis-cli ping | grep -q "PONG"; then
    echo -e "${GREEN}✅ Redis corriendo correctamente${NC}"
else
    echo -e "${RED}❌ Redis no responde${NC}"
    exit 1
fi

# ================================================================
# PASO 2: Configurar Variables de Entorno
# ================================================================
echo ""
echo -e "${BLUE}PASO 2: Configurando Variables de Entorno${NC}"
echo "================================================================"

# Actualizar .env para producción
cat >> ~/ande-explorer/frontend/.env.local <<EOF

# ================================================================
# PERFORMANCE OPTIMIZATIONS
# ================================================================
REDIS_ENABLED=true
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
EOF

echo -e "${GREEN}✅ Variables de entorno configuradas${NC}"

# ================================================================
# PASO 3: Instalar dependencias de Node.js
# ================================================================
echo ""
echo -e "${BLUE}PASO 3: Instalando dependencias${NC}"
echo "================================================================"

cd ~/ande-explorer/frontend

# Instalar ioredis si no está
if ! grep -q "ioredis" package.json; then
    npm install ioredis
    echo -e "${GREEN}✅ ioredis instalado${NC}"
else
    echo -e "${YELLOW}⚠️  ioredis ya está en package.json${NC}"
fi

npm install
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# ================================================================
# RESUMEN
# ================================================================
echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}🎉 Performance Optimization Setup Complete!${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
echo -e "${YELLOW}📊 Redis Status:${NC}"
redis-cli INFO server | grep "redis_version"
redis-cli INFO memory | grep "used_memory_human"
echo ""
echo -e "${YELLOW}🚀 Optimizaciones implementadas:${NC}"
echo "  ✅ Redis cache (1GB)"
echo "  ✅ React Query optimizado"
echo "  ✅ Prefetching habilitado"
echo "  ✅ Cache times optimizados"
echo "  ✅ API timeout reducido (10s)"
echo ""
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo "  1. Rebuild frontend: cd ~/ande-explorer/frontend && npm run build"
echo "  2. Restart app o deploy a Vercel"
echo "  3. Monitorear cache: redis-cli MONITOR"
echo "  4. Ver stats: curl localhost:3000/api/cache?action=stats"
echo ""
echo -e "${GREEN}================================================================${NC}"
