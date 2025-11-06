# 🚀 Ande Chain Explorer - Despliegue Paso a Paso

## 📋 Requisitos Previos

- Cuenta en Vercel (gratuita)
- Acceso al DNS de `ande.chain`
- Servidores para backend (o tu servidor actual)
- Git configurado localmente
- CLI de Vercel instalada

## Paso 1: Configurar DNS de ande.chain

En tu panel de control de DNS (GoDaddy, Namecheap, Cloudflare, etc.):

### 🌐 Registros CNAME Agregar:

```
Tipo: CNAME
Nombre: explorer
Valor: cname.vercel-dns.com
TTL: 60 (o el más bajo disponible)
Prioridad: (no aplica para CNAME)
```

```
Tipo: CNAME
Nombre: explorer-advanced
Valor: cname.vercel-dns.com
TTL: 60 (o el más bajo disponible)
Prioridad: (no aplica para CNAME)
```

### ⏱️ Esperar propagación:
```bash
# Verificar si propagó (puede tardar 5-60 minutos)
dig CNAME explorer.ande.chain
dig CNAME explorer-advanced.ande.chain
```

**Resultado esperado:**
```
explorer.ande.chain. canonical name = cname.vercel-dns.com.
```

## Paso 2: Subir Código a GitHub

```bash
# Asegurarse que estamos en el directorio correcto
cd ande-labs/ande-explorer

# Verificar archivos clave
ls -la
# Debe ver: vercel.json, .vercelignore, public/, docker/, etc.

# Agregar y subir todo
git add .
git commit -m "Deploy Ande Chain Explorer - Vercel + Docker architecture"
git push origin main

# Verificar que está en GitHub
echo "✅ Código subido a: https://github.com/AndeLabs/ande-explorer"
```

## Paso 3: Desplegar Frontend a Vercel

### 🌐 Instalar y configurar Vercel CLI

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Verificar instalación
vercel --version
```

### 🚀 Conectar repositorio y desplegar

```bash
# Navegar al directorio del proyecto
cd ande-labs/ande-explorer

# Iniciar sesión en Vercel (primera vez)
vercel login
# Seguir instrucciones en browser

# Conectar el proyecto
vercel link
# Seleccionar el proyecto o crear nuevo
# Elegir settings: Framework: Other, Root Directory: ., Build Command: (vacio)

# Despliegue de producción
vercel --prod
```

### ⚙️ Configurar dominios personalizados

```bash
# Agregar dominios al proyecto
vercel domains add explorer.ande.chain
vercel domains add explorer-advanced.ande.chain

# Verificar dominios configurados
vercel domains ls
```

## Paso 4: Verificar Frontend en Vercel

### 🌐 Probar URLs

```bash
# Health check del frontend
curl https://explorer.ande.chain/_health
curl https://explorer-advanced.ande.chain/_health

# Verificar SSL
openssl s_client -connect explorer.ande.chain:443 -servername explorer.ande.chain
openssl s_client -connect explorer-advanced.ande.chain:443 -servername explorer-advanced.ande.chain
```

### 🎯 URLs esperadas:

- **Main Explorer**: https://explorer.ande.chain
- **Advanced Explorer**: https://explorer-advanced.ande.chain
- **API Backend**: https://explorer-advanced.ande.chain/api/v2/

## Paso 5: Configurar Backend en Servidores

### 🐳 Clonar y configurar backend

```bash
# En tus servidores dedicados
# (Pueden ser los mismos servidores donde corre ev-reth-sequencer)

# Clonar el repositorio completo
cd /opt
git clone https://github.com/AndeLabs/ande-explorer.git
cd ande-explorer

# Configurar variables de entorno
cp .env.example .env
nano .env  # Editar con tus credenciales

# Variables clave a configurar:
# DB_PASSWORD=tu_password_seguro
# SECRET_KEY_BASE_MAIN=tu_secret_key
# SECRET_KEY_BASE_ADV=tu_secret_key_adv
# RPC_URL=http://ev-reth-sequencer:8545  # Ajustar si es necesario
```

### 🔧 Configurar archivo .env:

```bash
# Ejemplo de .env editado:
DB_USER=blockscout
DB_PASSWORD=ande_chain_secure_password_2024
DB_NAME=blockscout
DB_PORT=5432

REDIS_PASSWORD=ande_redis_secure_password_2024
REDIS_PORT=6379

RPC_URL=http://ev-reth-sequencer:8545
RPC_WS_URL=ws://ev-reth-sequencer:8546
CHAIN_ID=42170

BLOCKSCOUT_HOST_MAIN=explorer.ande.chain
BLOCKSCOUT_HOST_ADVANCED=explorer-advanced.ande.chain
BLOCKSCOUT_PROTOCOL=https

SECRET_KEY_BASE_MAIN=super_secret_key_main_24_chars_min
SECRET_KEY_BASE_ADV=super_secret_key_adv_24_chars_min
```

### 🚀 Iniciar servicios backend

```bash
# Iniciar servicios de producción
bash infra/scripts/start.sh prod

# Verificar que todo está funcionando
bash infra/scripts/health-check.sh
```

## Paso 6: Verificar Integración Completa

### 🔍 Probar API endpoints

```bash
# Test API connectivity (desde cualquier lugar)
curl https://explorer-advanced.ande.chain/api/v2/health
curl https://explorer-advanced.ande.chain/api/v2/stats

# Debe devolver JSON con datos del blockchain
```

### 🌐 Verificar frontend funcionando

1. Abrir navegador: https://explorer.ande.chain
2. Verificar carga correcta
3. Probar búsqueda de transacciones
4. Verificar API calls funcionan

### 📊 Verificar logs si hay problemas

```bash
# En servidores backend
docker logs -f blockscout-main-backend
docker logs -f blockscout-advanced-backend
docker logs -f blockscout-nginx

# En Vercel
vercel logs --follow
```

## Paso 7: Monitoreo y Mantenimiento

### 📋 Comandos útiles

```bash
# Health check completo
bash infra/scripts/health-check.sh --verbose

# Ver logs de servicios específicos
docker logs -f blockscout-main-backend --tail 100
docker logs -f blockscout-postgres --tail 50

# Reiniciar servicios
bash infra/scripts/stop.sh
bash infra/scripts/start.sh prod

# Backup de database
bash infra/scripts/backup.sh
```

### 🔄 Actualizaciones futuras

```bash
# Para actualizar frontend (Vercel)
git push origin main
vercel --prod  # Automático con GitHub si está configurado

# Para actualizar backend
cd /opt/ande-explorer
git pull origin main
bash infra/scripts/stop.sh
bash infra/scripts/start.sh prod
```

## 🎯 Checklist Final

### ✅ DNS Verification
- [ ] CNAME records configurados correctamente
- [ ] Propagación DNS completada
- [ ] Certificados SSL generados

### ✅ Vercel Deployment
- [ ] Repositorio conectado a Vercel
- [ ] Dominios agregados y verificados
- [ ] Frontend accesible en HTTPS

### ✅ Backend Services
- [ ] Servidores backend corriendo
- [ ] PostgreSQL y Redis funcionando
- [ ] BlockScout services saludables

### ✅ Integration Testing
- [ ] Frontend carga correctamente
- [ ] API endpoints responden
- [ ] Búsquedas y navegación funcionan
- [ ] Real-time updates funcionando

## 🆘 Troubleshooting Rápido

### DNS Issues:
```bash
# Verificar configuración DNS
dig explorer.ande.chain
nslookup explorer.ande.chain
```

### SSL Issues:
```bash
# Verificar certificado SSL
curl -I https://explorer.ande.chain
openssl s_client -connect explorer.ande.chain:443
```

### Backend Issues:
```bash
# Verificar servicios Docker
docker-compose -f docker/docker-compose.yml ps
docker-compose -f docker/docker-compose.yml logs
```

### API Connectivity:
```bash
# Test API desde navegador o curl
curl -v https://explorer-advanced.ande.chain/api/v2/health
```

## 🎉 ¡Listo!

Si seguiste todos los pasos, tu explorer debería estar visible en:

- 🔗 **Main Explorer**: https://explorer.ande.chain
- 🔗 **Advanced Analytics**: https://explorer-advanced.ande.chain

¡Felicidades! 🚀
```

## 📖 Resumen de Qué Hicimos:

1. **DNS**: Configuramos `explorer.ande.chain` → `cname.vercel-dns.com`
2. **GitHub**: Subimos todo el código al repositorio
3. **Vercel**: Desplegamos frontend con dominios personalizados
4. **Backend**: Iniciamos servicios Docker en servidores
5. **Integración**: Verificamos que frontend se conecte con backend

## 🔥 Ventajes de esta Configuración:

- ✅ **Performance Global**: Vercel CDN en todo el mundo
- ✅ **SSL Automático**: Certificados gestionados por Vercel
- ✅ **Backend Potente**: Control total con Docker
- ✅ **Seguridad**: Protección DDoS + red privada
- ✅ **Escalabilidad**: Frontend escala automáticamente, backend escalable

¿Listo para empezar con el Paso 1? 🚀