#!/bin/bash

# =============================================================================
# ANDE Explorer - BlockScout Deployment Script
# =============================================================================
# Este script despliega BlockScout con todos sus microservicios al servidor
# =============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
SERVER_USER="sator"
SERVER_HOST="192.168.0.8"
SERVER_PASSWORD="1992"
REMOTE_PATH="/home/sator/ande-explorer"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ANDE Explorer - BlockScout Deployment             ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Función para ejecutar comandos remotos
remote_exec() {
    sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_HOST} "$1"
}

# Función para copiar archivos
remote_copy() {
    sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no -r "$1" ${SERVER_USER}@${SERVER_HOST}:"$2"
}

# 1. Verificar conectividad
echo -e "${YELLOW}[1/8]${NC} Verificando conectividad con el servidor..."
if remote_exec "echo 'OK'" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Conexión establecida con ${SERVER_HOST}"
else
    echo -e "${RED}✗${NC} No se pudo conectar al servidor"
    exit 1
fi

# 2. Crear directorio remoto
echo -e "${YELLOW}[2/8]${NC} Creando directorio en el servidor..."
remote_exec "mkdir -p ${REMOTE_PATH}/blockscout"
echo -e "${GREEN}✓${NC} Directorio creado: ${REMOTE_PATH}/blockscout"

# 3. Copiar archivos de configuración
echo -e "${YELLOW}[3/8]${NC} Copiando archivos de configuración..."
remote_copy "./blockscout/docker-compose.yml" "${REMOTE_PATH}/blockscout/"
remote_copy "./blockscout/.env" "${REMOTE_PATH}/blockscout/"
echo -e "${GREEN}✓${NC} Archivos copiados"

# 4. Detener contenedores existentes
echo -e "${YELLOW}[4/8]${NC} Deteniendo contenedores existentes de BlockScout..."
remote_exec "cd ${REMOTE_PATH}/blockscout && docker-compose down || true"
echo -e "${GREEN}✓${NC} Contenedores detenidos"

# 5. Limpiar contenedor problemático
echo -e "${YELLOW}[5/8]${NC} Limpiando contenedor problemático..."
remote_exec "docker rm -f blockscout-backend || true"
echo -e "${GREEN}✓${NC} Contenedor limpiado"

# 6. Descargar imágenes
echo -e "${YELLOW}[6/8]${NC} Descargando imágenes de Docker..."
remote_exec "cd ${REMOTE_PATH}/blockscout && docker-compose pull"
echo -e "${GREEN}✓${NC} Imágenes descargadas"

# 7. Iniciar servicios
echo -e "${YELLOW}[7/8]${NC} Iniciando servicios de BlockScout..."
remote_exec "cd ${REMOTE_PATH}/blockscout && docker-compose up -d"
echo -e "${GREEN}✓${NC} Servicios iniciados"

# 8. Verificar estado
echo -e "${YELLOW}[8/8]${NC} Verificando estado de los servicios..."
sleep 5
echo ""
echo -e "${BLUE}Estado de los contenedores:${NC}"
remote_exec "docker ps --filter 'name=blockscout' --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Deployment Completado ✓                            ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Servicios desplegados:${NC}"
echo -e "  • BlockScout Backend:    http://${SERVER_HOST}:4000"
echo -e "  • Smart Contract Verifier: http://${SERVER_HOST}:8050"
echo -e "  • Visualizer:            http://${SERVER_HOST}:8051"
echo -e "  • Stats Service:         http://${SERVER_HOST}:8080"
echo -e "  • Sig Provider:          http://${SERVER_HOST}:8083"
echo -e "  • PostgreSQL:            ${SERVER_HOST}:7432"
echo -e "  • Redis:                 ${SERVER_HOST}:6379"
echo ""
echo -e "${YELLOW}Nota:${NC} El backend puede tardar 2-3 minutos en estar completamente operativo."
echo -e "${YELLOW}Monitorea los logs con:${NC} ssh ${SERVER_USER}@${SERVER_HOST} 'docker logs -f blockscout-backend'"
echo ""
