# PASO 6: VERIFICACIÓN FINAL Y CONFIGURACIÓN

## Estado Actual
✅ Backend desplegado en Render
✅ Frontend desplegado en Vercel
✅ Dominios configurados: `qronnect.es` y `*.qronnect.es`
✅ CORS actualizado para `qronnect.es`

---

## 1. VARIABLES DE ENTORNO A CONFIGURAR

### 🔧 RENDER (Backend)
Ve a: https://dashboard.render.com → Tu servicio → Environment

```bash
# Base de datos
SUPABASE_URL=https://[tu-proyecto].supabase.co
SUPABASE_ANON_KEY=[tu-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[tu-service-role-key]

# Aplicación
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://qronnect.es

# Email (Resend)
RESEND_API_KEY=re_[tu-api-key]
RESEND_FROM_EMAIL=noreply@qronnect.es

# SMS (Twilio)
SMS_ACCOUNT_SID=AC[tu-sid]
SMS_AUTH_TOKEN=[tu-token]
SMS_FROM_NUMBER=+34666123456

# IA (Gemini)
GEMINI_API_KEY=AIzaSy[tu-key]

# Seguridad
JWT_SECRET=[genera-uno-nuevo-con: openssl rand -base64 32]

# CORS (opcional, ya incluido en código)
ALLOWED_ORIGINS=https://qronnect.es,https://app.qronnect.es
```

### 🔧 VERCEL (Frontend)
Ve a: https://vercel.com → Tu proyecto → Settings → Environment Variables

```bash
# URL del backend en Render
NEXT_PUBLIC_API_URL=https://qronnect-backend.onrender.com/api

# URL de la app (para redirects)
NEXT_PUBLIC_APP_URL=https://qronnect.es
```

**IMPORTANTE:** Después de añadir/modificar variables en Vercel, re-despliega:
```bash
vercel --prod
```

---

## 2. CHECKLIST DE VERIFICACIÓN

### ✅ A. Verificar Backend (Render)

1. **Health Check**
   ```bash
   curl https://qronnect-backend.onrender.com/api/health
   ```
   Debe devolver: `{"status":"ok","timestamp":"...","uptime":...}`

2. **Swagger Docs**
   Abre: https://qronnect-backend.onrender.com/api/docs

3. **CORS funcionando**
   - Ve a tu frontend y abre DevTools → Console
   - Si hay errores de CORS, verás mensajes en rojo
   - No debe haber errores "blocked by CORS policy"

### ✅ B. Verificar Frontend (Vercel)

1. **Dominio principal**
   - https://qronnect.es
   - Debe cargar la landing page

2. **App principal**
   - https://app.qronnect.es (o la ruta que uses para admin)
   - Debe cargar sin errores

3. **Subdominios de tiendas (multi-tenant)**
   - https://lokeyokiera.qronnect.es
   - Debe cargar la vista del cliente de esa tienda

### ✅ C. Verificar Comunicación Frontend ↔ Backend

1. **Intenta hacer login**
   - Ve a tu app de admin
   - Intenta iniciar sesión
   - Abre DevTools → Network
   - Verifica que las requests a `/api/...` se envíen a Render
   - Deben tener Status 200 o 201 (no 404 o 500)

2. **Verifica Console Errors**
   - No debe haber errores de CORS
   - No debe haber errores de "Failed to fetch"

### ✅ D. Verificar DNS

```bash
# Verificar que apunten a Vercel
nslookup qronnect.es
nslookup app.qronnect.es
nslookup lokeyokiera.qronnect.es
```

Todos deben resolver a IPs de Vercel (76.76.21.x)

---

## 3. PUSH DEL FIX DE CORS

El commit ya está hecho localmente. Debes hacer push:

```bash
git push origin main
```

Render detectará el cambio automáticamente y re-desplegará (tarda 2-5 min).

---

## 4. CONFIGURACIÓN DE RESEND PARA EMAILS

Si aún no has configurado Resend:

1. Ve a: https://resend.com/domains
2. Añade tu dominio: `qronnect.es`
3. Configura los registros DNS en Vercel:
   - Ve a Vercel → Domains → qronnect.es → DNS Records
   - Añade los registros TXT, CNAME que te dé Resend
4. Verifica el dominio en Resend
5. Actualiza la variable `RESEND_FROM_EMAIL` en Render a `noreply@qronnect.es`

---

## 5. PRUEBAS END-TO-END

### Flujo Admin:
1. ✅ Login admin → https://app.qronnect.es/admin/login
2. ✅ Dashboard carga correctamente
3. ✅ Crear cliente nuevo
4. ✅ Generar QR
5. ✅ Crear campaña de email
6. ✅ Crear campaña de SMS
7. ✅ Ver estadísticas

### Flujo Cliente:
1. ✅ Acceder a https://[tienda].qronnect.es
2. ✅ Escanear QR (o pegar código)
3. ✅ Recibir código de verificación
4. ✅ Ver puntos acumulados
5. ✅ Canjear recompensa

---

## 6. MONITOREO

### Render (Backend)
- Dashboard: https://dashboard.render.com
- Logs en tiempo real
- Métricas de CPU/RAM
- Auto-sleep después de 15min inactividad (plan gratuito)

### Vercel (Frontend)
- Dashboard: https://vercel.com/dashboard
- Analytics (si está habilitado)
- Logs de deployment
- Siempre activo (no sleep)

---

## 7. PRÓXIMOS PASOS (OPCIONAL)

### A. Upgrade de Render (Recomendado para producción)
- Plan Starter: $7/mes
- No auto-sleep
- Mejor performance
- Más horas de build

### B. Configurar SSL Personalizado
Ya incluido automáticamente en Vercel y Render.

### C. Configurar Monitoring
- Sentry para error tracking
- LogRocket para session replay
- Google Analytics

### D. Backup de Base de Datos
- Supabase hace backups automáticos
- Exportar manualmente: Supabase Dashboard → Database → Backup

---

## 8. SOLUCIÓN DE PROBLEMAS COMUNES

### ❌ Error: CORS blocked
**Solución:**
1. Verifica que hiciste push del commit de CORS
2. Espera a que Render re-despliegue (2-5 min)
3. Refresca el frontend (Ctrl+F5)

### ❌ Error: 404 Not Found en /api/...
**Solución:**
1. Verifica `NEXT_PUBLIC_API_URL` en Vercel
2. Debe ser: `https://qronnect-backend.onrender.com/api`
3. Re-despliega: `vercel --prod`

### ❌ Subdominio no funciona
**Solución:**
1. Verifica que añadiste `*.qronnect.es` en Vercel Domains
2. Espera propagación DNS (puede tardar hasta 48h, usualmente 10-30 min)
3. Verifica con: `nslookup [subdominio].qronnect.es`

### ❌ Backend en "sleep" (plan gratuito Render)
**Solución:**
- Primera request tarda 30-60 segundos en "despertar"
- Considera upgrade a plan Starter ($7/mes)
- O implementa un "pinger" que haga requests cada 10 min

---

## 9. CONTACTOS Y RECURSOS

- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com
- **DNS (GoDaddy):** https://dcc.godaddy.com/domains

---

## RESUMEN DE URLs FINALES

| Servicio | URL | Plataforma |
|----------|-----|------------|
| Backend API | https://qronnect-backend.onrender.com/api | Render |
| API Docs | https://qronnect-backend.onrender.com/api/docs | Render |
| Health Check | https://qronnect-backend.onrender.com/api/health | Render |
| Frontend Principal | https://qronnect.es | Vercel |
| App Admin | https://app.qronnect.es | Vercel |
| Tienda (ejemplo) | https://lokeyokiera.qronnect.es | Vercel |
| Wildcard Tenants | https://*.qronnect.es | Vercel |

---

**¡Ya estás listo para producción!** 🎉

Haz push del commit de CORS y verifica que todo funcione siguiendo el checklist.
