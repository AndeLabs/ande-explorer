# 🔑 Cómo Obtener Token de Vercel con Permisos Correctos

## 📍 PASO A PASO

### 1. Ir a Vercel Settings
```
https://vercel.com/account/tokens
```

### 2. Click "Create Token"

### 3. Configurar el Token

**Name (Nombre):**
```
ANDE Explorer Automation
```

**Scope (Alcance):**
```
☑ Full Account
```

**Expiration (Expiración):**
```
• No Expiration (Recomendado para producción)
O
• 30 days (Para testing)
```

### 4. Permisos Necesarios

Asegúrate de que el token tenga estos permisos:

```
☑ Read and Write access to Projects
☑ Read and Write access to Environment Variables
☑ Read and Write access to Deployments
```

### 5. Click "Create Token"

### 6. COPIAR EL TOKEN

⚠️ **MUY IMPORTANTE:**
- El token solo se muestra UNA VEZ
- Cópialo INMEDIATAMENTE
- Guárdalo en un lugar seguro
- Formato: `vercel_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 🔍 ALTERNATIVA: Buscar Token Existente

Si ya tienes un token creado:

1. **Ir a:**
   ```
   https://vercel.com/account/tokens
   ```

2. **Ver tokens existentes:**
   - Verás la lista de tokens
   - Busca uno que diga "Full Account" o tenga permisos completos

3. **Si NO tienes ninguno con permisos completos:**
   - Crear nuevo token (pasos arriba)

---

## 🎯 LO QUE NECESITO

Una vez que tengas el token, dame:

```
Token de Vercel: vercel_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Y yo configuraré automáticamente:
✅ REDIS_ENABLED=true
✅ UPSTASH_REDIS_REST_URL=https://leading-goshawk-32655.upstash.io
✅ UPSTASH_REDIS_REST_TOKEN=AX-PAAIncDI4M2YzMzhhODc3Yzg0YTA1OWM3OGNjZGJiYmVkMWQyZnAyMzI2NTU

---

## 🔐 VERIFICAR PERMISOS DEL TOKEN

Para verificar que el token tiene los permisos correctos:

1. **Ir a:** https://vercel.com/account/tokens

2. **Click en el token**

3. **Verificar que diga:**
   ```
   Scope: Full Account
   ```

---

## 🚨 PROBLEMA CON TU TOKEN ACTUAL

El token que me diste:
```
vck_17SOGqTnNpQMdH9kDC76H3bLCJpG8pIvFprIxsomBeEG7JxYCP2W8CSd
```

Tiene permisos limitados:
- ❌ No puede listar proyectos
- ❌ No puede crear variables de entorno
- ✅ Solo puede leer información básica

**Solución:** Crear un nuevo token con "Full Account" scope.

---

## 📸 GUÍA VISUAL (Paso a Paso)

### PASO 1: Account Settings
```
https://vercel.com/account/tokens
```
![Vercel Account](imagen)

### PASO 2: Create Token Button
```
[Create Token]  ← Click aquí
```

### PASO 3: Configuración
```
┌─────────────────────────────────────┐
│ Create Token                        │
├─────────────────────────────────────┤
│ Name:                               │
│ [ANDE Explorer Automation]          │
│                                     │
│ Scope:                              │
│ ( ) This Account Only               │
│ (•) Full Account  ← SELECCIONAR    │
│                                     │
│ Expiration:                         │
│ [No Expiration ▼]                  │
│                                     │
│     [Cancel]  [Create Token]        │
└─────────────────────────────────────┘
```

### PASO 4: Copiar Token
```
┌─────────────────────────────────────┐
│ ✅ Token Created                    │
├─────────────────────────────────────┤
│ vercel_xxxxxxxxxxxxxxxxxxxxx        │
│                                     │
│ [📋 Copy]  ← Click para copiar     │
│                                     │
│ ⚠️ This token will only be shown   │
│    once. Make sure to copy it now. │
└─────────────────────────────────────┘
```

---

## ✅ CHECKLIST

- [ ] Ir a https://vercel.com/account/tokens
- [ ] Click "Create Token"
- [ ] Name: "ANDE Explorer Automation"
- [ ] Scope: "Full Account"
- [ ] Expiration: "No Expiration"
- [ ] Click "Create Token"
- [ ] Copiar el token (empieza con `vercel_`)
- [ ] Enviar el token a Claude

---

## 🎁 BONUS: Verificar que el Token Funciona

Una vez que me des el token, verificaré:

1. ✅ Puede listar proyectos
2. ✅ Puede ver "ande-explorer"
3. ✅ Puede crear variables de entorno
4. ✅ Puede trigger redeploys

Si todo está bien, configuraré TODO automáticamente en < 1 minuto.

---

## 🚀 DESPUÉS DE OBTENER EL TOKEN

Solo necesitas:
1. Copiar el token
2. Enviármelo
3. Yo hago el resto 😎

**¿Listo para obtener el token?** 🔑
