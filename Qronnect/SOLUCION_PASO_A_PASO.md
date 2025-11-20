# 🔧 SOLUCIÓN PASO A PASO - Frontend apuntando a localhost

## Estado Actual
❌ El frontend sigue apuntando a `http://localhost:3001`
❌ Error: `POST http://localhost:3001/api/superadmin/auth/send-email net::ERR_CONNECTION_REFUSED`

---

## CAUSA DEL PROBLEMA

Next.js incluye las variables de entorno **durante el BUILD**, no en runtime.
Si añadiste la variable DESPUÉS del build, Vercel usó el valor por defecto (`localhost:3001`).

---

## SOLUCIÓN COMPLETA (10 minutos)

### ✅ PASO 1: Verificar que la variable existe en Vercel

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. **Settings** → **Environment Variables**
4. **Busca:** `NEXT_PUBLIC_API_URL`

**¿Existe?**
- ✅ **SÍ** → Pasa al PASO 2
- ❌ **NO** → Añádela:
  ```
  Name:  NEXT_PUBLIC_API_URL
  Value: https://qronnect-backend.onrender.com/api

  Environments:
  ✅ Production
  ✅ Preview
  ✅ Development
  ```
  Click **Save** y continúa al PASO 2

---

### ✅ PASO 2: Forzar un Re-deploy COMPLETO (SIN caché)

**Opción A - Desde Dashboard (Recomendado):**

1. **Deployments** (menú superior)
2. Busca el **último deployment exitoso**
3. Click en los **3 puntos** (⋯) a la derecha
4. Click **"Redeploy"**
5. **IMPORTANTE:**
   - **DESMARCA** la opción "Use existing Build Cache"
   - Esto fuerza un rebuild completo
6. Click **"Redeploy"**
7. **Espera 2-4 minutos** (puedes ver el progreso en tiempo real)

**Opción B - Desde CLI:**

```bash
cd frontend

# Re-desplegar sin caché
vercel --prod --force
```

---

### ✅ PASO 3: Limpiar caché del navegador

Después de que termine el deployment:

1. **Abre tu sitio:** https://qronnect.es (o www.qronnect.es)
2. **Limpia caché:**
   - **Chrome/Edge:** Ctrl + Shift + Delete → Borrar caché
   - **O más rápido:** Ctrl + Shift + R (hard reload)
3. **Abre DevTools:** F12 → Console
4. **Refresca la página:** F5

---

### ✅ PASO 4: Verificar que funcionó

Abre **DevTools → Console** y busca este log:

```javascript
🔄 [BRANDING] Fetching from: https://qronnect-backend.onrender.com/api/config/branding
```

**¿Qué deberías ver?**

✅ **CORRECTO:**
```
🔄 [BRANDING] Fetching from: https://qronnect-backend.onrender.com/api/...
✅ [BRANDING] Data received: {...}
```

❌ **INCORRECTO (todavía roto):**
```
🔄 [BRANDING] Fetching from: http://localhost:3001/api/...
❌ Failed to fetch
```

Si todavía ves `localhost`, ve al **PASO 5 - Troubleshooting**.

---

## PASO 5: Troubleshooting

### Problema A: La variable NO aparece en Vercel

**Solución:**
```bash
# Desde CLI
cd frontend
vercel env add NEXT_PUBLIC_API_URL production

# Cuando te pregunte el valor, pega:
https://qronnect-backend.onrender.com/api

# Re-despliega
vercel --prod --force
```

---

### Problema B: El re-deploy usó caché antigua

**Solución:**

1. Ve a **Vercel Dashboard → Settings → General**
2. Busca **"Reset Build Cache"**
3. Click **"Clear Build Cache"**
4. Haz otro re-deploy (PASO 2)

---

### Problema C: Estás accediendo desde un dominio incorrecto

**Verifica que estás usando:**
- ✅ `https://qronnect.es`
- ✅ `https://www.qronnect.es`
- ✅ `https://app.qronnect.es`

**NO uses:**
- ❌ `https://qronnect-frontend.vercel.app` (puede tener config vieja)
- ❌ `http://qronnect.es` (debe ser HTTPS)

---

### Problema D: La variable tiene un valor incorrecto

**Verifica el valor EXACTO:**
```
https://qronnect-backend.onrender.com/api
```

**Errores comunes:**
- ❌ `https://qronnect-backend.onrender.com/api/` (barra extra al final)
- ❌ `https://qronnect-backend.onrender.com` (falta `/api`)
- ❌ `http://...` (debe ser HTTPS)
- ❌ Espacios en blanco antes/después

**Cómo corregir:**
1. Vercel Dashboard → Settings → Environment Variables
2. Click en **Edit** (icono de lápiz) en `NEXT_PUBLIC_API_URL`
3. Corrige el valor
4. Save
5. Re-deploy (PASO 2)

---

## VERIFICACIÓN COMPLETA

Una vez que funcione, prueba estos endpoints:

### 1. Superadmin Login
https://qronnect.es/superadmin/login
- Ingresa tu email de superadmin
- Verifica en **DevTools → Network**:
  - Request: `POST https://qronnect-backend.onrender.com/api/superadmin/auth/send-email`
  - Status: `200 OK` o `201 Created`

### 2. Admin Login
https://qronnect.es/admin/login (o app.qronnect.es/admin/login)
- Verifica que los endpoints apunten al backend de Render

### 3. Cliente View (Multi-tenant)
https://lokeyokiera.qronnect.es (o tu tienda de prueba)
- Verifica branding
- No debe haber errores de CORS

---

## Comandos útiles para debug

### Ver variables de entorno configuradas:
```bash
cd frontend
vercel env ls
```

### Ver el último build log:
```bash
vercel logs [deployment-url]
```

### Ver preview del build actual:
```bash
vercel inspect [deployment-url]
```

---

## Alternativa: Hacer un git push para forzar rebuild

Si nada funciona, puedes hacer un cambio mínimo al código para forzar un rebuild:

```bash
cd /mnt/c/Users/Omar/Documents/Qrs/Qronnect

# Añadir un comentario trivial para forzar cambio
echo "// Rebuild for env vars" >> frontend/app/layout.tsx

git add frontend/app/layout.tsx
git commit -m "Force rebuild with env vars"
git push origin main
```

Vercel detectará el push y hará un rebuild automático con las variables configuradas.

---

## Resumen de la Configuración Correcta

```javascript
// frontend/hooks/use-branding.ts:3
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
```

**En Desarrollo (local):**
- `process.env.NEXT_PUBLIC_API_URL` = undefined
- Usa fallback: `http://localhost:3001` ✅

**En Producción (Vercel):**
- `process.env.NEXT_PUBLIC_API_URL` = `https://qronnect-backend.onrender.com/api` ✅
- NO usa fallback

---

## Checklist Final

Después de aplicar la solución:

- [ ] Variable `NEXT_PUBLIC_API_URL` existe en Vercel
- [ ] Re-deploy hecho SIN usar caché
- [ ] Caché del navegador limpiado
- [ ] DevTools muestra URL de Render (no localhost)
- [ ] Login funciona sin errores
- [ ] No hay errores de CORS
- [ ] Subdominios funcionan (multi-tenant)

---

**Tiempo estimado total:** 5-10 minutos

Si después de seguir TODOS estos pasos el problema persiste, házmelo saber y revisaremos la configuración de Vercel más a fondo.
