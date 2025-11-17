#!/bin/bash

###########################################
# Cloudflare Tunnel Setup
# Expone BlockScout de forma segura a internet
###########################################

set -e

echo "🚀 Configurando Cloudflare Tunnel para BlockScout"
echo "================================================================"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ================================================================
# PASO 1: Instalar cloudflared
# ================================================================
echo -e "${BLUE}PASO 1: Instalando cloudflared${NC}"

if command -v cloudflared &> /dev/null; then
    echo -e "${YELLOW}⚠️  cloudflared ya está instalado${NC}"
    cloudflared --version
else
    echo -e "${YELLOW}📦 Descargando cloudflared...${NC}"
    curl -L --output /tmp/cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i /tmp/cloudflared.deb
    rm /tmp/cloudflared.deb
    echo -e "${GREEN}✅ cloudflared instalado${NC}"
fi

# ================================================================
# PASO 2: Verificar que BlockScout está corriendo
# ================================================================
echo ""
echo -e "${BLUE}PASO 2: Verificando BlockScout${NC}"

if curl -s http://localhost:4000/api/v2/stats > /dev/null 2>&1; then
    echo -e "${GREEN}✅ BlockScout está corriendo en puerto 4000${NC}"
else
    echo -e "${RED}❌ BlockScout no responde en localhost:4000${NC}"
    echo -e "${YELLOW}Ejecuta: cd ~/ande-explorer/blockscout && docker-compose up -d${NC}"
    exit 1
fi

# ================================================================
# PASO 3: Autenticar con Cloudflare
# ================================================================
echo ""
echo -e "${BLUE}PASO 3: Autenticación con Cloudflare${NC}"
echo -e "${YELLOW}================================================================${NC}"
echo -e "${YELLOW}Se abrirá tu navegador para autorizar${NC}"
echo -e "${YELLOW}1. Inicia sesión en Cloudflare${NC}"
echo -e "${YELLOW}2. Selecciona el dominio: ande.network${NC}"
echo -e "${YELLOW}3. Click 'Authorize'${NC}"
echo -e "${YELLOW}================================================================${NC}"
echo ""
read -p "Presiona ENTER para continuar..."

cloudflared tunnel login

if [ ! -f ~/.cloudflared/cert.pem ]; then
    echo -e "${RED}❌ Autenticación falló${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Autenticado con Cloudflare${NC}"

# ================================================================
# PASO 4: Crear tunnel
# ================================================================
echo ""
echo -e "${BLUE}PASO 4: Creando tunnel${NC}"

TUNNEL_NAME="ande-blockscout-api"

# Eliminar tunnel existente si existe
cloudflared tunnel delete $TUNNEL_NAME 2>/dev/null || true

# Crear nuevo tunnel
TUNNEL_ID=$(cloudflared tunnel create $TUNNEL_NAME | grep -oP 'Created tunnel.*with id \K[a-f0-9-]+' | head -1)

if [ -z "$TUNNEL_ID" ]; then
    # Intentar obtener ID de tunnel existente
    TUNNEL_ID=$(cloudflared tunnel list | grep $TUNNEL_NAME | awk '{print $1}')
fi

if [ -z "$TUNNEL_ID" ]; then
    echo -e "${RED}❌ No se pudo crear el tunnel${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Tunnel creado: $TUNNEL_ID${NC}"

# ================================================================
# PASO 5: Configurar tunnel
# ================================================================
echo ""
echo -e "${BLUE}PASO 5: Configurando tunnel${NC}"

mkdir -p ~/.cloudflared

cat > ~/.cloudflared/config.yml <<EOF
tunnel: $TUNNEL_ID
credentials-file: /home/sator/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: api.ande.network
    service: http://localhost:4000
  - service: http_status:404
EOF

echo -e "${GREEN}✅ Configuración creada${NC}"

# ================================================================
# PASO 6: Configurar DNS
# ================================================================
echo ""
echo -e "${BLUE}PASO 6: Configurando DNS${NC}"

cloudflared tunnel route dns $TUNNEL_ID api.ande.network

echo -e "${GREEN}✅ DNS configurado: api.ande.network → BlockScout${NC}"

# ================================================================
# PASO 7: Crear servicio systemd
# ================================================================
echo ""
echo -e "${BLUE}PASO 7: Creando servicio systemd${NC}"

sudo tee /etc/systemd/system/cloudflared-ande.service > /dev/null <<EOF
[Unit]
Description=Cloudflare Tunnel for ANDE BlockScout
After=network.target

[Service]
Type=simple
User=sator
ExecStart=/usr/local/bin/cloudflared tunnel run $TUNNEL_ID
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable cloudflared-ande.service
sudo systemctl start cloudflared-ande.service

echo -e "${GREEN}✅ Servicio creado y iniciado${NC}"

# ================================================================
# PASO 8: Verificar
# ================================================================
echo ""
echo -e "${BLUE}PASO 8: Verificando conexión${NC}"

sleep 5

if curl -s https://api.ande.network/api/v2/stats > /dev/null 2>&1; then
    echo -e "${GREEN}✅ BlockScout accesible en: https://api.ande.network${NC}"
else
    echo -e "${YELLOW}⚠️  Esperando propagación DNS (puede tomar 1-2 minutos)${NC}"
fi

# ================================================================
# RESUMEN
# ================================================================
echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}🎉 Cloudflare Tunnel Configurado Exitosamente!${NC}"
echo -e "${GREEN}================================================================${NC}"
echo ""
echo -e "${YELLOW}📊 Información:${NC}"
echo -e "  Tunnel ID: $TUNNEL_ID"
echo -e "  Tunnel Name: $TUNNEL_NAME"
echo -e "  URL Pública: https://api.ande.network"
echo ""
echo -e "${YELLOW}🔧 Comandos útiles:${NC}"
echo -e "  Ver logs: sudo journalctl -u cloudflared-ande -f"
echo -e "  Reiniciar: sudo systemctl restart cloudflared-ande"
echo -e "  Estado: sudo systemctl status cloudflared-ande"
echo -e "  Detener: sudo systemctl stop cloudflared-ande"
echo ""
echo -e "${YELLOW}🌐 Verificar:${NC}"
echo -e "  curl https://api.ande.network/api/v2/stats"
echo ""
echo -e "${YELLOW}📝 Próximo paso:${NC}"
echo -e "  Actualizar NEXT_PUBLIC_API_URL en Vercel a:"
echo -e "  ${GREEN}https://api.ande.network/api${NC}"
echo ""
echo -e "${GREEN}================================================================${NC}"
