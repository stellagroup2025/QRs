# 🚨 FIX URGENTE: Frontend apuntando a localhost

## Problema Detectado
El frontend en Vercel está usando `localhost:3001` porque la variable de entorno `NEXT_PUBLIC_API_URL` no está configurada.

**Error en consola:**
```
❌ [BRANDING] Error fetching branding: TypeError: Failed to fetch
```

---

## SOLUCIÓN INMEDIATA

### Opción A: Desde el Dashboard de Vercel (MÁS RÁPIDO)

1. **Ve a tu proyecto en Vercel:**
   https://vercel.com/dashboard

2. **Entra a tu proyecto** → Click en el proyecto `qronnect` (o como lo hayas llamado)

3. **Settings → Environment Variables**

4. **Añade esta variable:**
   ```
   Key:   NEXT_PUBLIC_API_URL
   Value: https://qronnect-backend.onrender.com/api

   Environment: ✅ Production ✅ Preview ✅ Development
   ```

5. **Haz click en "Save"**

6. **Re-despliega el frontend:**
   - Ve a "Deployments" (en el menú superior)
   - Click en los 3 puntos del último deployment
   - Click en "Redeploy"
   - Selecciona "Use existing Build Cache" → NO (desmarcado)
   - Click "Redeploy"

**Tiempo estimado:** 2-3 minutos

---

### Opción B: Desde CLI de Vercel

```bash
# 1. Asegúrate de estar en la carpeta del frontend
cd frontend

# 2. Añade la variable de entorno para producción
vercel env add NEXT_PUBLIC_API_URL production
# Cuando te pregunte el valor, pega: https://qronnect-backend.onrender.com/api

# 3. Añade para preview
vercel env add NEXT_PUBLIC_API_URL preview
# Pega el mismo valor

# 4. Re-despliega a producción
vercel --prod
```

---

## VERIFICACIÓN

Después del re-deploy (espera 2-3 min):

1. **Abre tu sitio:** https://qronnect.es

2. **Abre DevTools** (F12) → Console

3. **Busca los logs de branding:**
   ```
   🔄 [BRANDING] Fetching from: https://qronnect-backend.onrender.com/api/config/branding
   ```

4. **Verifica que NO diga `localhost`**

---

## Variables de Entorno que DEBES tener en Vercel

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://qronnect-backend.onrender.com/api` | **CRÍTICO** - URL del backend |
| `NEXT_PUBLIC_APP_URL` | `https://qronnect.es` | Opcional - URL de la app |

**IMPORTANTE:**
- Las variables con prefijo `NEXT_PUBLIC_` son accesibles en el browser
- Deben configurarse ANTES del build
- Si cambias una variable, DEBES re-desplegar

---

## ¿Por qué pasó esto?

El archivo `frontend/.env.local` tiene:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Este archivo es solo para desarrollo local y **NO se sube a Vercel**.
Vercel necesita sus propias variables de entorno configuradas en su dashboard.

---

## Arquitectura Correcta

```
┌─────────────────────────────────────┐
│   Frontend (Vercel)                 │
│   https://qronnect.es               │
│   https://app.qronnect.es           │
│   https://*.qronnect.es             │
│                                     │
│   NEXT_PUBLIC_API_URL=              │
│   https://qronnect-backend          │
│          .onrender.com/api          │
└───────────────┬─────────────────────┘
                │
                │ fetch requests
                ▼
┌─────────────────────────────────────┐
│   Backend (Render)                  │
│   https://qronnect-backend          │
│         .onrender.com               │
│                                     │
│   Endpoints:                        │
│   - /api/health                     │
│   - /api/config/branding            │
│   - /api/admin/...                  │
│   - /api/clientes/...               │
└─────────────────────────────────────┘
```

---

## Checklist Post-Fix

Después de configurar y re-desplegar, verifica:

- [ ] Frontend carga sin errores de CORS
- [ ] Console NO muestra errores "Failed to fetch"
- [ ] Los logs muestran `https://qronnect-backend.onrender.com` (NO localhost)
- [ ] Puedes hacer login como admin
- [ ] Los subdominios funcionan (ej: `lokeyokiera.qronnect.es`)

---

## Siguientes pasos después del fix

Una vez que el frontend funcione correctamente:

1. **Configura Resend** para emails (opcional pero recomendado)
2. **Prueba el flujo completo** de clientes y admin
3. **Configura monitoring** (Sentry, LogRocket)
4. **Upgrade de Render** si el backend se duerme (plan $7/mes)

---

**Tiempo total estimado:** 5 minutos

¡Una vez hecho esto, tu app estará 100% funcional en producción! 🚀
