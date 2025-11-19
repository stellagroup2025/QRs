# 🚀 Guía Completa de Deployment a Vercel - Qronnect

**Fecha:** 19 de Noviembre de 2025

## 📋 Índice

1. [Arquitectura en Producción](#arquitectura-en-producción)
2. [Requisitos Previos](#requisitos-previos)
3. [Paso 1: Preparar Supabase](#paso-1-preparar-supabase)
4. [Paso 2: Deploy Backend (Railway/Render)](#paso-2-deploy-backend)
5. [Paso 3: Deploy Frontend (Vercel)](#paso-3-deploy-frontend-vercel)
6. [Paso 4: Configurar Dominios](#paso-4-configurar-dominios)
7. [Paso 5: Configurar Integraciones](#paso-5-configurar-integraciones)
8. [Paso 6: Testing en Producción](#paso-6-testing-en-producción)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura en Producción

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMINIOS PERSONALIZADOS                   │
│  www.tutienda.com → Frontend (Vercel)                       │
│  api.tutienda.com → Backend (Railway/Render)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (VERCEL)                           │
│  Next.js 15 + App Router                                    │
│  - Múltiples proyectos (uno por tienda) O                   │
│  - Un proyecto multi-tenant con wildcard domain             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (RAILWAY/RENDER)                    │
│  NestJS API + Servicios                                     │
│  - Auto-scaling                                             │
│  - Health checks                                            │
│  - CORS configurado                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE (PRODUCTION)                       │
│  PostgreSQL + RLS + Storage                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Requisitos Previos

### Cuentas Necesarias

- [ ] **Vercel** (https://vercel.com) - Frontend
- [ ] **Railway** (https://railway.app) O **Render** (https://render.com) - Backend
- [ ] **Supabase** (https://supabase.com) - Base de datos (ya tienes)
- [ ] **Dominio propio** (opcional pero recomendado)
- [ ] **Twilio** con cuenta verificada (no trial)
- [ ] **Resend** con dominio verificado
- [ ] **Google Cloud** con API Key de Gemini

### Herramientas Locales

```bash
# Instalar Vercel CLI
npm install -g vercel

# Instalar Railway CLI (opcional)
npm install -g @railway/cli

# Git configurado
git --version
```

---

## 📊 Paso 1: Preparar Supabase

### 1.1 Crear Proyecto de Producción

```bash
# Opción A: Usar el proyecto existente (dev → prod)
# Opción B: Crear nuevo proyecto en Supabase Dashboard
```

1. Ve a https://supabase.com/dashboard
2. Crea un nuevo proyecto (o usa el existente)
3. **Nombre:** qronnect-production
4. **Database Password:** Guárdala en un lugar seguro
5. **Region:** Elige la más cercana a tus usuarios (ej: eu-west-1)

### 1.2 Aplicar Migraciones

```bash
cd backend

# Conectar a Supabase producción
export SUPABASE_URL=https://[tu-proyecto-prod].supabase.co
export SUPABASE_SERVICE_KEY=[tu-service-role-key]

# Aplicar todas las migraciones en orden
psql "postgresql://postgres:[password]@db.[tu-proyecto].supabase.co:5432/postgres" \
  -f supabase/migrations/20241108000000_init.sql \
  -f supabase/migrations/20241109000000_add_promociones.sql \
  -f supabase/migrations/20241111000000_add_campanas.sql \
  -f supabase/migrations/20251113000001_create_sms_system.sql \
  -f supabase/migrations/20251115000001_create_landing_config.sql \
  -f supabase/migrations/20251115000002_create_usuarios_tienda.sql \
  -f supabase/migrations/20251115000003_fix_usuarios_tienda_rls.sql \
  -f supabase/migrations/20251116000001_fix_campanas_sms_creado_por.sql

# O usa los scripts ts-node
npx ts-node apply-seed-tiendas.ts
npx ts-node apply-usuarios-tienda-migration.ts
```

### 1.3 Configurar RLS (Row Level Security)

Verifica que las políticas RLS estén activas:

```sql
-- Conectar a SQL Editor en Supabase Dashboard
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Todas las tablas deben tener rowsecurity = true
```

### 1.4 Seed Data (Opcional)

```bash
# Crear tiendas de ejemplo
npx ts-node apply-seed-tiendas.ts
```

### 1.5 Obtener Credenciales

En Supabase Dashboard → Settings → API:

```
✓ Project URL: https://[tu-proyecto].supabase.co
✓ anon/public key: eyJhbGci...
✓ service_role key: eyJhbGci... (¡NUNCA expongas al frontend!)
```

---

## 🖥️ Paso 2: Deploy Backend

### Opción A: Railway (Recomendado)

#### 2.1 Crear Cuenta en Railway

1. Ve a https://railway.app
2. Conecta tu cuenta de GitHub
3. Plan: $5/mes (incluye 500 horas)

#### 2.2 Crear Proyecto

```bash
# Desde la carpeta backend
cd backend

# Login
railway login

# Iniciar proyecto
railway init

# Vincula con GitHub (recomendado)
railway link
```

#### 2.3 Configurar Variables de Entorno

En Railway Dashboard → Variables:

```bash
# Supabase
SUPABASE_URL=https://[tu-proyecto].supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# API
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.vercel.app

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@tudominio.com
RESEND_WILDCARD_ENABLED=false

# SMS (Twilio) - Cuenta REAL (no trial)
SMS_ACCOUNT_SID=AC...
SMS_AUTH_TOKEN=...
SMS_FROM_NUMBER=+34666123456

# IA (Google Gemini)
GEMINI_API_KEY=AIzaSy...
```

#### 2.4 Deploy

```bash
# Desde backend/
railway up

# O configura deploy automático desde GitHub
# Railway Dashboard → Settings → Connect GitHub Repo
```

#### 2.5 Obtener URL del Backend

```
Tu backend estará en: https://[tu-app].up.railway.app
```

### Opción B: Render

#### 2.1 Crear Cuenta en Render

1. Ve a https://render.com
2. Conecta GitHub

#### 2.2 Crear Web Service

1. New → Web Service
2. Conecta tu repo de GitHub
3. **Root Directory:** `backend`
4. **Environment:** Node
5. **Build Command:** `npm install && npm run build`
6. **Start Command:** `npm run start:prod`
7. **Plan:** Starter ($7/mes) o Free (con sleep)

#### 2.3 Variables de Entorno

Mismas que Railway (ver arriba)

#### 2.4 Health Check

En Render Dashboard → Settings → Health Check Path:

```
/health
```

Crea el endpoint en backend:

```typescript
// src/app.controller.ts
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

---

## 🎨 Paso 3: Deploy Frontend (Vercel)

### 3.1 Preparar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Build local (verificar que funciona)
npm run build
```

### 3.2 Crear Archivo de Configuración

Ya tienes `next.config.mjs`, pero verifica:

```javascript
// frontend/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // CAMBIAR A false para producción
  },
  images: {
    unoptimized: false, // CAMBIAR A false si usas Next Image
    domains: ['[tu-proyecto].supabase.co'], // Para imágenes de Supabase
  },
  // IMPORTANTE: Para multi-tenant
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
}

export default nextConfig
```

### 3.3 Crear Variables de Entorno

Crea `.env.production`:

```bash
# frontend/.env.production
NEXT_PUBLIC_API_URL=https://[tu-backend].up.railway.app
```

### 3.4 Deploy a Vercel

#### Opción 1: Vercel CLI

```bash
cd frontend

# Login
vercel login

# Deploy (primero staging)
vercel

# Deploy a producción
vercel --prod
```

#### Opción 2: Vercel Dashboard (Recomendado)

1. Ve a https://vercel.com/new
2. Import Git Repository
3. Selecciona tu repo
4. **Framework Preset:** Next.js
5. **Root Directory:** `frontend`
6. **Build Command:** `npm run build`
7. **Output Directory:** `.next`
8. **Install Command:** `npm install`

**Environment Variables:**

```
NEXT_PUBLIC_API_URL = https://[tu-backend].up.railway.app
```

9. Click **Deploy**

### 3.5 Configurar Dominios en Vercel

#### A) Un dominio por tienda

Si tienes varias tiendas con dominios distintos:

1. Vercel Dashboard → Settings → Domains
2. Add Domain: `www.tienda1.com`
3. Repite para cada tienda

Configura DNS:

```
# En tu proveedor de dominio (Cloudflare, GoDaddy, etc.)
CNAME www 76.76.21.21.cname.vercel-dns.com
```

#### B) Wildcard subdomain (Multi-tenant)

Para `*.qronnect.com`:

1. Vercel Dashboard → Settings → Domains
2. Add Domain: `*.qronnect.com`
3. Requiere plan Pro ($20/mes)

```
# DNS
CNAME * 76.76.21.21.cname.vercel-dns.com
```

---

## 🌐 Paso 4: Configurar Dominios

### 4.1 Dominio Principal (qronnect.com)

```
# DNS Records
A     @     76.76.21.21
CNAME www   cname.vercel-dns.com
CNAME api   [tu-backend].up.railway.app
```

### 4.2 Dominios de Clientes

Para cada tienda que quiera dominio propio:

```
# Ejemplo: www.perfumerialokeyokiera.com
CNAME www cname.vercel-dns.com
```

Luego en Supabase, actualiza la tienda:

```sql
UPDATE tiendas
SET dominio_personalizado = 'www.perfumerialokeyokiera.com'
WHERE slug = 'lokeyokiera';
```

### 4.3 SSL/TLS

Vercel y Railway configuran SSL automáticamente con Let's Encrypt.

---

## 🔧 Paso 5: Configurar Integraciones

### 5.1 Twilio SMS (Producción)

1. Upgrade de Trial a cuenta de pago
2. Compra un número de teléfono español: +34...
3. O solicita un Sender ID (ej: "LOKEYOKIERA")

```bash
# En Railway/Render
SMS_ACCOUNT_SID=AC...
SMS_AUTH_TOKEN=...
SMS_FROM_NUMBER=+34666123456
# O
SMS_SENDER_ID=LOKEYOKIERA
```

### 5.2 Resend Email

1. Verifica tu dominio en Resend Dashboard
2. Añade registros DNS:

```
TXT @ resend._domainkey=[valor de Resend]
```

3. Configura en Railway:

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@qronnect.com
```

### 5.3 Google Gemini

1. Ve a https://aistudio.google.com/app/apikey
2. Crea API Key
3. Habilita facturación si quieres límites más altos

```bash
GEMINI_API_KEY=AIzaSy...
```

---

## 🧪 Paso 6: Testing en Producción

### 6.1 Checklist Básico

```bash
# Backend health check
curl https://[tu-backend].up.railway.app/health

# Frontend
curl https://[tu-frontend].vercel.app

# API desde frontend
curl https://[tu-backend].up.railway.app/api/tiendas/by-domain/lokeyokiera
```

### 6.2 Test Flujo Completo

1. **Registro cliente:**
   - Ir a `https://lokeyokiera.qronnect.com` (o tu dominio)
   - Registrarse con email
   - Verificar código por email

2. **Escanear QR:**
   - Escanear QR de prueba
   - Verificar que suma puntos

3. **Enviar campaña email:**
   - Login admin
   - Crear campaña
   - Enviar a 1 cliente de prueba
   - Verificar recepción

4. **Enviar SMS:**
   - Crear campaña SMS
   - Enviar a tu número
   - Verificar recepción

5. **IA:**
   - Ir a Dashboard admin
   - Probar generación de promoción con IA
   - Verificar respuesta

### 6.3 Monitoreo

#### Vercel:

- Dashboard → Analytics
- Ver errores en tiempo real

#### Railway:

- Dashboard → Metrics
- Ver logs: `railway logs`

#### Supabase:

- Dashboard → Database → Logs
- Verificar queries lentas

---

## ⚠️ Troubleshooting

### Error: "CORS policy"

**Solución:** Configura CORS en backend:

```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    'https://tu-dominio.vercel.app',
    'https://*.qronnect.com',
    'https://www.perfumerialokeyokiera.com',
  ],
  credentials: true,
});
```

### Error: "Tenant not found"

**Solución:** Verifica que el dominio esté en la tabla `tiendas`:

```sql
SELECT id, nombre, dominio, dominio_personalizado, activo
FROM tiendas;
```

### Error: "RLS policy violation"

**Solución:** Verifica las políticas RLS:

```sql
SELECT * FROM pg_policies WHERE tablename = 'clientes';
```

### SMS no se envían

- Verifica que Twilio esté en modo producción (no trial)
- Verifica el formato del número: +34666123456 (E.164)
- Revisa los logs de Railway

### Emails no llegan

- Verifica que el dominio esté verificado en Resend
- Revisa logs en Resend Dashboard
- Verifica que no estén en spam

### Frontend no conecta con Backend

- Verifica `NEXT_PUBLIC_API_URL` en Vercel
- Verifica CORS en backend
- Revisa Network tab en DevTools

---

## 📊 Costes Estimados

| Servicio | Plan | Coste Mensual |
|----------|------|---------------|
| Vercel | Pro | $20 (wildcard domains) |
| Railway | Hobby | $5 + uso |
| Supabase | Pro | $25 |
| Twilio SMS | Pay-as-you-go | ~0.075€/SMS |
| Resend | Free/Pro | $0 - $20 |
| Google Gemini | Pay-as-you-go | ~$0.10/1000 req |
| **Total** | | **~$50-80/mes** |

Para 1-10 tiendas con tráfico moderado.

---

## 🎯 Próximos Pasos

1. [ ] Configurar monitoring (Sentry, LogRocket)
2. [ ] Configurar backups automáticos (Supabase)
3. [ ] CDN para assets estáticos (Cloudflare)
4. [ ] Implementar CI/CD con GitHub Actions
5. [ ] Configurar alertas (email cuando hay errores)
6. [ ] Documentar API con Swagger
7. [ ] Crear dashboard de métricas (tiendas activas, usuarios, etc.)

---

## 📚 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NestJS Production](https://docs.nestjs.com/deployment)

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs (Railway/Vercel)
2. Verifica variables de entorno
3. Consulta esta guía
4. Revisa las issues de GitHub

---

**Última actualización:** 19 de Noviembre de 2025
