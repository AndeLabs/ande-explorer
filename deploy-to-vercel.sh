#!/bin/bash

# Ande Explorer - Vercel Deployment Script
# Este script automatiza el deployment a Vercel

set -e  # Exit on error

echo "🚀 Iniciando deployment a Vercel..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI no está instalado${NC}"
    echo "Instalando Vercel CLI..."
    npm install -g vercel
fi

echo -e "${GREEN}✓${NC} Vercel CLI encontrado"
echo ""

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo -e "${RED}❌ Error: vercel.json no encontrado${NC}"
    echo "Asegúrate de estar en la raíz del proyecto"
    exit 1
fi

echo -e "${GREEN}✓${NC} Configuración de Vercel encontrada"
echo ""

# Verify frontend directory exists
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Directorio 'frontend' no encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Directorio frontend encontrado"
echo ""

# Test build locally first (optional but recommended)
echo -e "${YELLOW}¿Deseas probar el build localmente antes de desplegar? (y/n)${NC}"
read -r test_build

if [ "$test_build" = "y" ] || [ "$test_build" = "Y" ]; then
    echo "Probando build local..."
    cd frontend

    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "Instalando dependencias..."
        npm install
    fi

    # Run build
    echo "Ejecutando build..."
    npm run build

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Build local exitoso"
    else
        echo -e "${RED}❌ Build local falló${NC}"
        exit 1
    fi

    cd ..
fi

echo ""
echo -e "${YELLOW}════════════════════════════════════════${NC}"
echo -e "${YELLOW}   INSTRUCCIONES IMPORTANTES${NC}"
echo -e "${YELLOW}════════════════════════════════════════${NC}"
echo ""
echo "Cuando Vercel te pregunte por la configuración:"
echo ""
echo "1. Setup and deploy? ${GREEN}Y${NC}"
echo "2. Which scope? ${GREEN}[Tu scope/team]${NC}"
echo "3. Link to existing project? ${GREEN}Y${NC} (si existe) o ${GREEN}N${NC} (para nuevo)"
echo "4. Project name? ${GREEN}ande-explorer-frontend${NC}"
echo "5. In which directory is your code? ${GREEN}frontend${NC} ${RED}(IMPORTANTE!)${NC}"
echo "6. Want to override settings? ${GREEN}N${NC}"
echo ""
echo -e "${YELLOW}════════════════════════════════════════${NC}"
echo ""

# Ask for confirmation
echo -e "${YELLOW}¿Continuar con el deployment? (y/n)${NC}"
read -r confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Deployment cancelado"
    exit 0
fi

echo ""
echo "Iniciando deployment a Vercel..."
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ DEPLOYMENT COMPLETADO${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Para ver tu sitio y métricas:"
echo "1. Ve a https://vercel.com/dashboard"
echo "2. Busca el proyecto 'ande-explorer-frontend'"
echo "3. Revisa Analytics y Speed Insights"
echo ""
echo -e "${GREEN}¡Deployment exitoso!${NC} 🎉"
echo ""
