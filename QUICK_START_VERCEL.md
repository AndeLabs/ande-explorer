# 🚀 Quick Start - Deploy a Vercel

## ⚡ Solución Rápida (2 minutos)

### Opción 1: Usando el Dashboard de Vercel (RECOMENDADO)

1. **Ir a Vercel Dashboard**: https://vercel.com/dashboard
2. **Importar proyecto**:
   - Click en "Add New" → "Project"
   - Importar desde GitHub: `AndeLabs/ande-explorer`
3. **Configurar Root Directory**:
   ```
   Root Directory: frontend
   ```
4. **Deploy**: Vercel auto-detectará Next.js y desplegará automáticamente

### Opción 2: Usando CLI

```bash
# Ejecutar el script automatizado
./deploy-to-vercel.sh

# IMPORTANTE: Cuando pregunte "In which directory is your code?"
# Responder: frontend
```

### Opción 3: Manual con Vercel CLI

```bash
vercel --prod

# Cuando pregunte:
# - Root Directory: frontend
# - Framework: Next.js (auto-detectado)
```

## ✅ Verificación Post-Deployment

1. Vercel te dará una URL: `https://ande-explorer-frontend.vercel.app`
2. Verifica que el sitio carga correctamente
3. Revisa Analytics en el dashboard de Vercel

## 🔧 Configuración ya Optimizada

✅ Next.js 14 con App Router
✅ Output standalone para builds más rápidos
✅ Compresión habilitada
✅ Headers de seguridad configurados
✅ Cache optimizado para assets estáticos
✅ Variables de entorno configuradas
✅ Región IAD1 (US East)

## 📊 Escalabilidad

La configuración actual soporta:
- **Tráfico**: Ilimitado (según plan de Vercel)
- **Build Time**: ~2-3 minutos
- **Cold Start**: < 100ms
- **Edge Caching**: Automático

## 🔗 Enlaces Importantes

- **Guía Completa**: Ver `VERCEL_DEPLOYMENT_GUIDE.md`
- **Next.js Config**: `/frontend/next.config.js`
- **Vercel Config**: `/vercel.json`

## 🆘 Si algo falla

1. Verifica que Root Directory = `frontend` en Vercel Dashboard
2. Revisa que las variables de entorno estén configuradas
3. Limpia el build cache en Vercel Dashboard
4. Consulta `VERCEL_DEPLOYMENT_GUIDE.md` para troubleshooting

## 🎯 Próximos Pasos

Después del deployment:
1. Configurar dominio custom en Vercel
2. Habilitar Analytics
3. Configurar Preview Deployments
4. Monitorear Web Vitals
