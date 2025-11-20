# 📍 PASO 2: Deploy Backend a Render

**Tiempo estimado:** 10 minutos

---

## 🎯 Objetivo

Deployar el backend NestJS en Render.com

---

## ✅ Pre-requisitos

- [x] Código pusheado a GitHub
- [x] Cuenta en Render (o créala ahora)
- [x] Credenciales listas (abajo)

---

## 🔐 Credenciales que Necesitarás

Tenlas a mano en un archivo de texto:

```bash
# SUPABASE
SUPABASE_URL=https://ajyiuhujexwrjmjfycxh.supabase.co
SUPABASE_ANON_KEY=[tu-anon-key-aqui]
SUPABASE_SERVICE_ROLE_KEY=[tu-service-role-key-aqui]

# TWILIO SMS
SMS_ACCOUNT_SID=AC[tu-account-sid-de-32-caracteres]
SMS_AUTH_TOKEN=[tu-auth-token-de-32-caracteres]
SMS_FROM_NUMBER=+1234567890

# RESEND EMAIL
RESEND_API_KEY=re_[tu-api-key-aqui]
RESEND_FROM_EMAIL=noreply@qronnect.es
RESEND_WILDCARD_ENABLED=false

# GOOGLE GEMINI
GEMINI_API_KEY=AIzaSyDVMHkj_Eazcd59MHdpO8yCCKm2zk1Z3SQ

# APP CONFIG
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://qronnect.vercel.app
```

**NOTA:** FRONTEND_URL lo actualizaremos después del paso 3.

---

## 📋 Pasos Detallados

### 1. Ir a Render

🔗 https://render.com

- Click "Get Started" o "Sign In"
- **Sign in with GitHub**
- Autorizar Render a acceder a tu cuenta

### 2. Crear Web Service

- Click **"New +"** (arriba derecha)
- Selecciona **"Web Service"**

### 3. Conectar Repositorio

- En la lista, busca: **stellagroup2025/QRs**
- Click **"Connect"**

### 4. Configurar el Service

Completa el formulario:

#### Basic Settings:
```
Name: qronnect-backend
Region: Frankfurt (EU) o Oregon (US) - el más cercano
Branch: main
Root Directory: backend
```

#### Build & Deploy:
```
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm run start:prod
```

#### Instance Type:
```
Plan: Free (para empezar) o Starter ($7/mes)
```

**IMPORTANTE:** El plan Free duerme después de 15 min inactivo.
Para producción real, usa Starter.

### 5. Advanced Settings

Click **"Advanced"**

#### Health Check Path:
```
/health
```

### 6. Environment Variables

Click **"Add Environment Variable"**

Añade TODAS estas variables (13 en total):

```
Key                          Value
─────────────────────────────────────────────────────────
SUPABASE_URL                 https://[tu-proyecto].supabase.co
SUPABASE_ANON_KEY            [tu-anon-key]
SUPABASE_SERVICE_ROLE_KEY    [tu-service-role-key]
SMS_ACCOUNT_SID              AC[tu-account-sid]
SMS_AUTH_TOKEN               [tu-auth-token]
SMS_FROM_NUMBER              +1234567890
RESEND_API_KEY               re_[tu-api-key]
RESEND_FROM_EMAIL            noreply@qronnect.es
RESEND_WILDCARD_ENABLED      false
GEMINI_API_KEY               AIzaSy[tu-api-key]
NODE_ENV                     production
PORT                         3001
FRONTEND_URL                 https://qronnect.vercel.app
```

**Tip:** Copia-pega desde el bloque de credenciales arriba.

### 7. Deploy!

- Click **"Create Web Service"** (abajo)
- Render comenzará a deployar
- Verás los logs en tiempo real
- Espera 5-10 minutos

### 8. Verificar Deployment

Cuando termine:

```
✓ Build successful
✓ Deploy successful
✓ Your service is live at https://qronnect-backend-xxxx.onrender.com
```

#### Test Health Check:

Copia la URL y añade `/health`:

```bash
curl https://qronnect-backend-xxxx.onrender.com/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2025-11-19T...",
  "uptime": 123.45,
  "environment": "production"
}
```

✅ **Backend deployed!**

### 9. Guardar URL del Backend

**IMPORTANTE:** Copia la URL completa:

```
https://qronnect-backend-xxxx.onrender.com
```

La necesitarás para el Paso 3 (Vercel).

### 10. (Opcional) Configurar Custom Domain

Si quieres usar `api.qronnect.es`:

- En Render Dashboard → tu service
- Settings → Custom Domain
- Add: `api.qronnect.es`
- Render te dará un CNAME para configurar en DNS

**Por ahora SKIP esto**, lo haremos en el Paso 4.

---

## 🔍 Troubleshooting

### Error: "Build failed"

- Revisa logs en Render Dashboard
- Verifica que Root Directory sea `backend`
- Verifica Build Command: `npm install && npm run build`

### Error: "Service unhealthy"

- Revisa logs
- Verifica que PORT=3001 esté en variables
- Verifica Health Check Path: `/health`

### Error: Variables no se cargan

- Revisa que todas las 13 variables estén añadidas
- Sin espacios extra en los valores
- Verifica nombres exactos (case sensitive)

---

## ✅ Checklist

- [ ] Render account creada
- [ ] Web Service creado
- [ ] Repo conectado: stellagroup2025/QRs
- [ ] Root Directory: backend
- [ ] Build Command: npm install && npm run build
- [ ] Start Command: npm run start:prod
- [ ] Health Check: /health
- [ ] 13 variables de entorno añadidas
- [ ] Deploy exitoso
- [ ] Health check funciona
- [ ] URL guardada

---

## 🎯 Siguiente Paso

Cuando el deploy esté OK, continúa con:

**PASO 3: Deploy Frontend a Vercel**

---

**¿Todo OK?** Avísame cuando el backend esté deployed y continuamos.

---

**Fecha:** 19 de Noviembre de 2025
