# 🚀 Tu Deployment Personalizado - Paso a Paso

**Fecha de inicio:** 19 de Noviembre de 2025

---

## 📋 Información que Necesito

Por favor, completa esta información antes de continuar:

### Cuentas y Servicios

- [ ] **Vercel:** ¿Tienes cuenta? (sí/no): _______
  - Email usado: _______________________

- [ ] **Railway:** ¿Tienes cuenta? (sí/no): _______
  - O prefieres **Render**: _______

- [ ] **Supabase:**
  - URL actual: https://ajyiuhujexwrjmjfycxh.supabase.co
  - ¿Usar este para producción o crear uno nuevo? _______

- [ ] **Twilio SMS:**
  - ¿Cuenta verificada (NO trial)? (sí/no): _______
  - Account SID: AC... _______
  - Auth Token: _______ (guardar en lugar seguro)
  - Número comprado: +34... _______ o Sender ID: _______

- [ ] **Resend Email:**
  - ¿Tienes API key? (sí/no): _______
  - API Key: re_... _______
  - ¿Dominio verificado? _______
  - Email from: noreply@_______.com

- [ ] **Google Gemini:**
  - ¿Tienes API key? (sí/no): _______
  - API Key: AIzaSy... _______

### Dominio

- [ ] **¿Tienes dominio propio?** (sí/no): _______
  - Si SÍ: _______.com/es
  - Si NO: Usaremos [tu-app].vercel.app

---

## ✅ Checklist de Preparación

### ANTES de empezar

- [ ] Node.js instalado (v18 o superior)
- [ ] npm instalado
- [ ] Git configurado
- [ ] Cuenta GitHub (para conectar con Vercel/Railway)

### Verificar proyecto local

```bash
# Desde la raíz del proyecto
cd /mnt/c/Users/Omar/Documents/Qrs/Qronnect

# Backend
cd backend
npm install  # Si no está instalado
npm run build  # Debe pasar sin errores

# Frontend
cd ../frontend
npm install  # Si no está instalado
npm run build  # Puede tener warnings (OK)
```

---

## 🎯 PASO 1: Preparar Credenciales

### 1.1 Crear archivo de credenciales

Crea un archivo LOCAL (NO commitear) con todas tus credenciales:

```bash
# Crear archivo
touch ~/qronnect-credentials.txt
chmod 600 ~/qronnect-credentials.txt
```

Copiar dentro:

```
QRONNECT - CREDENCIALES DE PRODUCCIÓN
======================================

SUPABASE:
---------
SUPABASE_URL=https://_____.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

TWILIO SMS:
-----------
SMS_ACCOUNT_SID=AC...
SMS_AUTH_TOKEN=...
SMS_FROM_NUMBER=+34...

RESEND EMAIL:
-------------
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@_____.com

GOOGLE GEMINI:
--------------
GEMINI_API_KEY=AIzaSy...

APP CONFIG:
-----------
FRONTEND_URL=https://_____.vercel.app (completar después)
NODE_ENV=production
PORT=3001
```

---

## 🎯 PASO 2: Deploy Backend a Railway

### 2.1 Instalar Railway CLI (opcional)

```bash
npm install -g @railway/cli
railway --version
```

### 2.2 Opción A: Via Dashboard (MÁS FÁCIL)

1. Ve a https://railway.app
2. Sign in with GitHub
3. Click "New Project"
4. Selecciona "Deploy from GitHub repo"
5. **SI NO ESTÁ EN GITHUB:**
   - Primero sube tu proyecto a GitHub:
   ```bash
   cd /mnt/c/Users/Omar/Documents/Qrs/Qronnect
   git init
   git add .
   git commit -m "Preparar para deployment"
   # Crear repo en GitHub
   git remote add origin https://github.com/TU_USUARIO/qronnect.git
   git push -u origin main
   ```

6. En Railway:
   - Selecciona tu repo
   - Root directory: **backend**
   - Railway detectará NestJS automáticamente

7. **Variables de Entorno:**
   - Click "Variables" tab
   - Add las 13 variables de tu archivo credentials:
     ```
     SUPABASE_URL
     SUPABASE_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY
     SMS_ACCOUNT_SID
     SMS_AUTH_TOKEN
     SMS_FROM_NUMBER
     RESEND_API_KEY
     RESEND_FROM_EMAIL
     RESEND_WILDCARD_ENABLED=false
     GEMINI_API_KEY
     NODE_ENV=production
     PORT=3001
     FRONTEND_URL=https://tu-frontend.vercel.app (dejar vacío por ahora)
     ```

8. Deploy automático comenzará

9. **Obtener URL del backend:**
   - Settings → Domains
   - Copiar la URL: https://[tu-app].up.railway.app

10. **Actualizar FRONTEND_URL:**
    - Vuelve a Variables
    - Edita FRONTEND_URL (después de deployar frontend)

### 2.3 Opción B: Via CLI

```bash
cd backend
railway login
railway init
railway up
```

### 2.4 Verificar Backend

```bash
# Health check
curl https://[tu-app].up.railway.app/health

# Debe retornar:
# {"status":"ok","timestamp":"...","uptime":...}
```

✅ Backend deployed!

---

## 🎯 PASO 3: Deploy Frontend a Vercel

### 3.1 Instalar Vercel CLI (opcional)

```bash
npm install -g vercel
vercel --version
```

### 3.2 Opción A: Via Dashboard (MÁS FÁCIL)

1. Ve a https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import Git Repository (tu repo de GitHub)
5. Configure Project:
   - Framework Preset: **Next.js**
   - Root Directory: **frontend**
   - Build Command: `npm run build` (auto-detectado)
   - Output Directory: `.next` (auto-detectado)

6. **Environment Variables:**
   - Add ONE variable:
   ```
   NEXT_PUBLIC_API_URL = https://[tu-backend-railway].up.railway.app
   ```
   (Usa la URL que obtuviste del paso 2.9)

7. Click "Deploy"

8. Espera 2-3 minutos...

9. **Obtener URL del frontend:**
   - Vercel te dará: https://[tu-proyecto].vercel.app

10. **IMPORTANTE: Volver a Railway**
    - Ir a Railway → Variables
    - Actualizar `FRONTEND_URL` con la URL de Vercel
    - Railway re-deploará automáticamente

### 3.3 Opción B: Via CLI

```bash
cd frontend
vercel login
vercel  # Deploy preview
vercel --prod  # Deploy producción
```

✅ Frontend deployed!

---

## 🎯 PASO 4: Primera Verificación

### 4.1 Test Backend

```bash
# Health check
curl https://[tu-backend].up.railway.app/health

# API test
curl https://[tu-backend].up.railway.app/api/tiendas
```

### 4.2 Test Frontend

```bash
# Abrir en navegador
open https://[tu-frontend].vercel.app
```

Deberías ver tu aplicación cargando.

### 4.3 Test CORS

Si ves errores de CORS en la consola del navegador:
- Verifica que FRONTEND_URL en Railway esté correcto
- Railway debería re-deployar automáticamente al cambiar variables

---

## 🎯 PASO 5: Configurar Dominios (OPCIONAL)

### Si NO tienes dominio propio:

**SKIP este paso.** Tu app funciona en:
- Frontend: https://[tu-app].vercel.app
- Backend: https://[tu-app].up.railway.app

### Si TIENES dominio propio:

#### 5.1 Configurar Frontend

1. Vercel Dashboard → Settings → Domains
2. Add domain: **qronnect.com** (o tu dominio)
3. Add domain: **app.qronnect.com**
4. Add domain: **\*.qronnect.com** (wildcard - requiere plan Pro $20/mes)

5. Configurar DNS en tu registrador:
```
Type    Name    Value
A       @       76.76.21.21
CNAME   app     cname.vercel-dns.com
CNAME   *       cname.vercel-dns.com  (wildcard)
```

#### 5.2 Configurar Backend

1. Railway Dashboard → Settings → Custom Domain
2. Add: **api.qronnect.com**
3. Configurar DNS:
```
CNAME   api     [tu-app].up.railway.app
```

4. Esperar propagación DNS (15-60 min)

5. SSL automático (Railway y Vercel)

---

## 🎯 PASO 6: Testing Completo

### 6.1 Test Registro Cliente

1. Ir a tu frontend
2. Registrar nuevo cliente
3. Verificar email recibido
4. Login con código

✅ Auth funciona

### 6.2 Test Admin

1. Ir a /admin/login
2. Login como admin
3. Ver dashboard

✅ Admin funciona

### 6.3 Test Campaña Email

1. Admin → Campañas
2. Crear campaña nueva
3. Seleccionar 1 destinatario (tú)
4. Enviar
5. Verificar email recibido

✅ Email funciona

### 6.4 Test Campaña SMS

1. Admin → Campañas SMS
2. Crear campaña
3. Enviar a tu número
4. Verificar SMS recibido

✅ SMS funciona

### 6.5 Test IA

1. Admin → Configuración → IA
2. Generar promoción
3. Verificar respuesta

✅ IA funciona

---

## 🎯 PASO 7: Monitoreo

### 7.1 Railway Logs

```bash
railway logs
```

O en Dashboard → Deployments → View Logs

### 7.2 Vercel Logs

Dashboard → Deployments → [tu-deployment] → Logs

### 7.3 Configurar Alertas

Railway:
- Settings → Notifications → Add email

Vercel:
- Automático si hay errores

---

## 🎉 ¡COMPLETADO!

Tu aplicación está en producción:

- ✅ Backend: https://[tu-backend].up.railway.app
- ✅ Frontend: https://[tu-frontend].vercel.app
- ✅ Database: Supabase Production
- ✅ Integraciones: Email, SMS, IA

### Próximos pasos:

1. [ ] Configurar backup automático en Supabase
2. [ ] Configurar monitoreo (Sentry)
3. [ ] Optimizar imágenes
4. [ ] Preparar onboarding para clientes
5. [ ] Marketing!

---

## 🆘 Si algo falla:

### Error: "Tenant not found"
→ Verificar que existe tienda en Supabase

### Error: CORS
→ Verificar FRONTEND_URL en Railway

### SMS no llega
→ Verificar que Twilio NO esté en trial

### Email no llega
→ Verificar dominio en Resend Dashboard

### Más ayuda:
→ Ver GUIA_DEPLOYMENT_VERCEL.md sección Troubleshooting

---

**¡Éxito! 🚀**
