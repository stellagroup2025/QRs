# ⚡ Quick Deploy - Qronnect a Vercel/Railway

**Guía rápida para deployment en 15 minutos**

---

## 🎯 Resumen de la Arquitectura

```
Frontend (Next.js) → Vercel
Backend (NestJS) → Railway/Render
Database → Supabase (ya configurado)
```

---

## 📋 Pre-requisitos (5 min)

1. **Cuentas necesarias:**
   - ✅ Vercel: https://vercel.com (GitHub login)
   - ✅ Railway: https://railway.app (GitHub login) O Render
   - ✅ Supabase: Ya tienes (usar proyecto existente o crear uno nuevo)

2. **CLIs opcionales:**
   ```bash
   npm install -g vercel
   npm install -g @railway/cli
   ```

3. **Variables de entorno preparadas:**
   - Supabase URL + Keys
   - Twilio credentials (cuenta REAL, no trial)
   - Resend API key
   - Google Gemini API key

---

## 🗄️ Paso 1: Supabase (2 min)

### Opción A: Usar proyecto existente
Ya está configurado, solo necesitas las credenciales.

### Opción B: Crear proyecto nuevo
1. Dashboard → New Project
2. Aplicar migraciones:
   ```bash
   cd backend
   # Ejecutar todos los archivos en supabase/migrations/
   ```

### Obtener credenciales:
```
Settings → API:
  - Project URL
  - anon key
  - service_role key (¡NO expongas!)
```

---

## 🖥️ Paso 2: Deploy Backend a Railway (5 min)

### Via CLI (Recomendado):

```bash
cd backend

# Login
railway login

# Crear proyecto
railway init

# Deploy
railway up

# Ver logs
railway logs
```

### Via Dashboard (Alternativa):

1. Railway Dashboard → New Project
2. Deploy from GitHub Repo
3. Seleccionar carpeta `backend`
4. Variables de entorno → Ver sección de variables abajo
5. Deploy

### Health Check:
```bash
curl https://[tu-app].up.railway.app/health
```

---

## 🎨 Paso 3: Deploy Frontend a Vercel (5 min)

### Via CLI:

```bash
cd frontend

# Login
vercel login

# Deploy preview
vercel

# Deploy producción
vercel --prod
```

### Via Dashboard (Recomendado):

1. https://vercel.com/new
2. Import Git Repository
3. Framework: Next.js
4. Root Directory: `frontend`
5. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL = https://[tu-backend].up.railway.app
   ```
6. Deploy

---

## 🔐 Variables de Entorno

### Backend (Railway):

```bash
# Supabase
SUPABASE_URL=https://[tu-proyecto].supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# App
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://[tu-dominio].vercel.app

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@qronnect.com
RESEND_WILDCARD_ENABLED=false

# SMS (⚠️ Cuenta REAL, no trial)
SMS_ACCOUNT_SID=AC...
SMS_AUTH_TOKEN=...
SMS_FROM_NUMBER=+34666123456

# IA
GEMINI_API_KEY=AIzaSy...
```

### Frontend (Vercel):

```bash
NEXT_PUBLIC_API_URL=https://[tu-backend].up.railway.app
```

---

## 🧪 Paso 4: Test (3 min)

### Backend:
```bash
# Health check
curl https://[tu-backend].up.railway.app/health

# API docs
open https://[tu-backend].up.railway.app/api/docs
```

### Frontend:
```bash
# Abrir en browser
open https://[tu-frontend].vercel.app

# Test login
# Test registro
# Test QR scan
```

### Full Flow:
1. ✅ Registrar nuevo cliente
2. ✅ Verificar email recibido
3. ✅ Login cliente
4. ✅ Login admin
5. ✅ Enviar campaña SMS

---

## 🌐 Dominios Personalizados (Opcional)

### Frontend (Vercel):
1. Vercel Dashboard → Settings → Domains
2. Add: `www.tutienda.com`
3. Configurar DNS:
   ```
   CNAME www cname.vercel-dns.com
   ```

### Backend (Railway):
1. Railway Dashboard → Settings → Custom Domain
2. Add: `api.tutienda.com`
3. Configurar DNS:
   ```
   CNAME api [tu-app].up.railway.app
   ```

---

## 🚨 Troubleshooting

### CORS Error
→ Verifica que el frontend URL esté en `ALLOWED_ORIGINS` del backend

### "Tenant not found"
→ Verifica que la tienda exista en Supabase:
```sql
SELECT * FROM tiendas WHERE dominio = 'tudominio' OR dominio_personalizado = 'www.tutienda.com';
```

### SMS no se envía
→ Verifica que Twilio NO esté en modo trial
→ Verifica formato de número: `+34666123456`

### Email no llega
→ Verifica dominio en Resend Dashboard
→ Revisa spam

---

## 📊 Monitoreo

### Railway:
- Dashboard → Metrics
- Ver logs: `railway logs`

### Vercel:
- Dashboard → Analytics
- Ver logs: Dashboard → Deployments → [deployment] → Logs

### Supabase:
- Dashboard → Database → Logs

---

## 💰 Costes Aproximados

| Servicio | Plan | Precio |
|----------|------|--------|
| Vercel | Hobby/Pro | $0-20/mes |
| Railway | Hobby | $5/mes + uso |
| Supabase | Free/Pro | $0-25/mes |
| Twilio SMS | Pay-as-you-go | ~0.075€/SMS |
| Resend | Free | $0 (hasta 3k emails/mes) |
| Gemini | Free tier | $0 (límites generosos) |

**Total:** ~$5-50/mes dependiendo del uso

---

## 🎉 ¡Listo!

Tu aplicación ya está en producción. Próximos pasos:

- [ ] Configurar monitoreo (Sentry)
- [ ] Configurar backups automáticos
- [ ] Optimizar imágenes y assets
- [ ] Configurar CDN (Cloudflare)
- [ ] Preparar material de marketing

---

## 📚 Más Información

- **Guía Completa:** Ver `GUIA_DEPLOYMENT_VERCEL.md`
- **Checklist:** Ver `CHECKLIST_DEPLOYMENT.md`
- **Script Automatizado:** `./scripts/deploy.sh`

---

**¿Problemas?** Revisa los logs y la guía completa de deployment.
