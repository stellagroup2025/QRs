# 🚀 Guía Completa de Deployment - Qronnect a Producción

**Dominio:** qronnect.es
**Fecha:** 16 de Noviembre de 2025
**Versión:** 1.0.0

---

## 📑 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura de Producción](#arquitectura-de-producción)
3. [Requisitos Previos](#requisitos-previos)
4. [Paso 1: Backend en Railway](#paso-1-backend-en-railway)
5. [Paso 2: Frontend en Vercel](#paso-2-frontend-en-vercel)
6. [Paso 3: Configuración DNS](#paso-3-configuración-dns)
7. [Paso 4: Base de Datos](#paso-4-base-de-datos-supabase)
8. [Paso 5: Servicios Externos](#paso-5-servicios-externos)
9. [Paso 6: Testing](#paso-6-testing-en-producción)
10. [Costos Mensuales](#costos-mensuales)
11. [Troubleshooting](#troubleshooting)
12. [FAQ](#preguntas-frecuentes)

---

## Resumen Ejecutivo

### TL;DR (5 minutos de lectura)

```
Backend  → Railway ($5/mes)      → api.qronnect.es
Frontend → Vercel (GRATIS)       → *.qronnect.es
DNS      → Cloudflare (GRATIS)   → CNAME wildcards
Database → Supabase Pro ($25/mes)
Total    → ~$30/mes + uso de SMS
```

### ¿Por qué esta arquitectura?

- **Vercel:** Optimizado para Next.js, soporte multi-dominio nativo con wildcards
- **Railway:** Fácil deploy de NestJS, variables de entorno simples, SSL automático
- **Supabase:** PostgreSQL con RLS, auth incluido, backups automáticos
- **Separación:** Frontend y backend en servidores diferentes = mejor escalabilidad

### Multi-dominio: La Clave

**Tu pregunta:** "¿Cómo funciona con dos puertos y multi-dominio?"

**Respuesta:** En producción no hay "puertos" visibles. Todo es HTTPS (443):

```
Desarrollo:
  Frontend: localhost:3000  ← Dos puertos diferentes
  Backend:  localhost:3001

Producción:
  Frontend: Vercel (*.qronnect.es)     ← Servidor 1
  Backend:  Railway (api.qronnect.es)  ← Servidor 2

  Se comunican por HTTPS normal, como cualquier API externa.
```

**Wildcard en Vercel:** Configuras `*.qronnect.es` una vez, funciona para infinitos subdominios:
- lokeyokiera.qronnect.es ✅
- stylecut.qronnect.es ✅
- nuevo-tenant-123.qronnect.es ✅
- cualquier-cosa.qronnect.es ✅

---

## Arquitectura de Producción

### Diagrama General

```
┌─────────────────────────────────────────────────────────────┐
│                     INTERNET / USUARIOS                      │
│                  (Navegadores, Móviles, Apps)                │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTPS
                             ↓
                  ┌──────────────────────┐
                  │   CLOUDFLARE (DNS)   │
                  │   - SSL/TLS          │
                  │   - CDN              │
                  │   - DDoS Protection  │
                  └──────┬───────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
        ↓                                 ↓
┌───────────────────┐         ┌───────────────────────┐
│ FRONTEND (Vercel) │         │  BACKEND (Railway)    │
│                   │         │                       │
│ qronnect.es       │         │  api.qronnect.es     │
│ app.qronnect.es   │◄────────┤  NestJS API          │
│ *.qronnect.es     │  API    │  Puerto 443 (HTTPS)  │
│                   │  Calls  │                       │
│ Next.js 14        │         │  Módulos:             │
│ React + TypeScript│         │  - Auth               │
│ TailwindCSS       │         │  - Clientes           │
│                   │         │  - Campañas           │
│ Features:         │         │  - SMS                │
│ - Multi-tenant    │         │  - IA                 │
│ - Wildcard DNS    │         └───────┬───────────────┘
│ - Edge Functions  │                 │
└───────────────────┘                 │
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                    ↓                                   ↓
        ┌───────────────────────┐         ┌────────────────────────┐
        │ SUPABASE (PostgreSQL) │         │  SERVICIOS EXTERNOS    │
        │                       │         │                        │
        │ - 17 Tablas           │         │  - Twilio (SMS)        │
        │ - RLS Habilitado      │         │  - Resend (Email)      │
        │ - Backups Diarios     │         │  - Google Gemini (IA)  │
        │ - Connection Pooling  │         │                        │
        └───────────────────────┘         └────────────────────────┘
```

### Flujo Multi-Tenant

```
Usuario → lokeyokiera.qronnect.es
    ↓
DNS resuelve a Vercel (wildcard *.qronnect.es)
    ↓
Vercel detecta subdominio "lokeyokiera"
    ↓
Next.js lee hostname y extrae tenant
    ↓
Frontend hace fetch a Backend:
  URL: https://api.qronnect.es/api/clientes
  Header: X-Tenant-Domain: lokeyokiera
    ↓
Backend (Railway) recibe request
    ↓
TenantMiddleware extrae tenant del header
    ↓
Query a Supabase con tenant_id
    ↓
RLS filtra datos solo de ese tenant
    ↓
Response con datos de "lokeyokiera"
```

---

## Requisitos Previos

### Cuentas Necesarias (Todas GRATIS para empezar)

- [ ] **GitHub** - Para almacenar código
- [ ] **Railway** - Para backend (incluye $5 gratis/mes)
- [ ] **Vercel** - Para frontend (plan hobby gratis)
- [ ] **Supabase** - Necesitas upgrade a Pro ($25/mes)
- [ ] **Cloudflare** (opcional) - DNS gratis
- [ ] **Twilio** - Necesitas upgrade de trial a pago
- [ ] **Resend** - Plan gratis (100 emails/día)
- [ ] **Google Gemini** - API key (gratis con límites)

### Herramientas Locales

```bash
# Verificar instalaciones
node --version    # v18+ requerido
npm --version     # v9+ requerido
git --version     # Cualquier versión reciente

# Opcional pero útil
vercel --version  # CLI de Vercel
railway --version # CLI de Railway
```

### Acceso a DNS

- Acceso al panel de gestión de tu dominio `qronnect.es`
- Si usas Cloudflare, tener cuenta creada y dominio añadido

---

## Paso 1: Backend en Railway

### ¿Por qué Railway?

- ✅ Deploy automático desde GitHub
- ✅ Variables de entorno simples
- ✅ Logs en tiempo real
- ✅ SSL automático
- ✅ $5 gratis/mes
- ✅ Escalado automático

### 1.1. Preparar el Proyecto

```bash
cd backend

# Crear railway.json
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# Verificar package.json tiene estos scripts
cat package.json | grep -A 5 "scripts"
# Debe incluir:
# "build": "nest build"
# "start:prod": "node dist/main"
```

### 1.2. Crear Dockerfile (Opcional pero Recomendado)

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Build TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["npm", "run", "start:prod"]
```

### 1.3. Deploy en Railway

1. **Crear cuenta:**
   - Ir a https://railway.app
   - Login con GitHub

2. **Nuevo proyecto:**
   - Click "New Project"
   - Seleccionar "Deploy from GitHub repo"
   - Autorizar acceso a tu repositorio
   - Seleccionar el repositorio de Qronnect

3. **Configurar root directory:**
   - Si tu backend está en `/backend`, configurarlo
   - Railway Settings → Root Directory: `backend`

4. **Configurar variables de entorno:**

```bash
# En Railway Dashboard → Variables

NODE_ENV=production
PORT=3001

# Supabase
SUPABASE_URL=https://ajyiuhujexwrjmjfycxh.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# JWT
JWT_SECRET=genera_un_secreto_muy_seguro_minimo_32_caracteres

# Email (Resend)
RESEND_API_KEY=re_tu_api_key_produccion

# SMS (Twilio) - Importante: cuenta de PAGO, no trial
SMS_ACCOUNT_SID=AC_tu_account_sid
SMS_AUTH_TOKEN=tu_auth_token
SMS_FROM_NUMBER=+34XXXXXXXXX

# IA (Google Gemini)
GEMINI_API_KEY=AIza_tu_api_key

# Frontend URL (CORS)
FRONTEND_URL=https://qronnect.es
```

5. **Deploy:**
   - Railway iniciará build automático
   - Espera 3-5 minutos
   - Verifica logs en tiempo real
   - Railway te dará URL temporal: `https://tu-proyecto.up.railway.app`

6. **Test inicial:**
```bash
# Verificar que el backend responde
curl https://tu-proyecto.up.railway.app/api

# Respuesta esperada:
# {"status":"ok","message":"Qronnect API is running",...}
```

### 1.4. Configurar Dominio Personalizado

1. **En Railway Dashboard:**
   - Settings → Domains
   - Click "Add Custom Domain"
   - Ingresar: `api.qronnect.es`

2. **Railway te dará un CNAME:**
   - Ejemplo: `tu-proyecto.up.railway.app`
   - Lo necesitarás para el DNS (Paso 3)

3. **SSL:**
   - Railway configura SSL automáticamente
   - En 5-10 minutos tendrás HTTPS activo

---

## Paso 2: Frontend en Vercel

### ¿Por qué Vercel?

- ✅ Creado por el equipo de Next.js
- ✅ Soporte multi-dominio NATIVO
- ✅ Wildcards incluidos
- ✅ SSL automático para TODOS los dominios
- ✅ CDN global
- ✅ Deploy en cada push a GitHub
- ✅ Plan gratuito muy generoso

### 2.1. Preparar el Proyecto

```bash
cd frontend

# Crear vercel.json
cat > vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.qronnect.es/:path*"
    }
  ]
}
EOF

# Crear .env.production
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://api.qronnect.es/api
NEXT_PUBLIC_SUPABASE_URL=https://ajyiuhujexwrjmjfycxh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
EOF
```

### 2.2. Actualizar next.config.js

```typescript
// frontend/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.qronnect.es/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  // Optimizaciones de producción
  swcMinify: true,
  reactStrictMode: true,
  images: {
    domains: ['ajyiuhujexwrjmjfycxh.supabase.co'],
  },
};

module.exports = nextConfig;
```

### 2.3. Deploy en Vercel

1. **Crear cuenta:**
   - Ir a https://vercel.com
   - Login con GitHub

2. **Nuevo proyecto:**
   - Click "Add New..." → Project
   - Import Git Repository
   - Seleccionar tu repositorio

3. **Configurar proyecto:**
   - Framework Preset: Next.js (auto-detectado)
   - Root Directory: `frontend` (si aplica)
   - Build Command: `npm run build` (auto)
   - Output Directory: `.next` (auto)

4. **Variables de entorno:**
   - Click "Environment Variables"
   - Añadir las de `.env.production`:
     ```
     NEXT_PUBLIC_API_URL=https://api.qronnect.es/api
     NEXT_PUBLIC_SUPABASE_URL=...
     NEXT_PUBLIC_SUPABASE_ANON_KEY=...
     ```

5. **Deploy:**
   - Click "Deploy"
   - Espera 2-3 minutos
   - Vercel te da URL temporal: `https://tu-proyecto.vercel.app`

6. **Test inicial:**
   - Visita `https://tu-proyecto.vercel.app`
   - Debe cargar tu aplicación

### 2.4. Configurar Dominios Personalizados (⭐ LO MÁS IMPORTANTE)

1. **Ir a Project Settings → Domains**

2. **Añadir dominios uno por uno:**

   **a) Dominio principal:**
   ```
   qronnect.es
   ```
   - Click "Add"
   - Vercel verificará propiedad

   **b) Subdominio de app:**
   ```
   app.qronnect.es
   ```
   - Click "Add"

   **c) ⭐ WILDCARD (LA MAGIA):**
   ```
   *.qronnect.es
   ```
   - Click "Add"
   - Este captura TODOS los subdominios automáticamente
   - lokeyokiera.qronnect.es → ✅
   - stylecut.qronnect.es → ✅
   - cualquier-cosa.qronnect.es → ✅

3. **Vercel te mostrará qué configurar en DNS:**
   - Para cada dominio, te dará instrucciones
   - Normalmente: CNAME a `cname.vercel-dns.com`
   - Para dominio raíz: A record a `76.76.21.21`

---

## Paso 3: Configuración DNS

### Opción A: Cloudflare (Recomendado)

**Ventajas:**
- CDN global gratis
- DDoS protection
- Analytics
- Cache inteligente
- Dashboard excelente

#### 3.1. Configurar Nameservers

1. **Añadir sitio a Cloudflare:**
   - Ir a https://dash.cloudflare.com
   - "Add a Site"
   - Ingresar `qronnect.es`
   - Seleccionar plan Free

2. **Cambiar nameservers en tu registrador:**
   - Cloudflare te dará 2 nameservers
   - Ejemplo: `noah.ns.cloudflare.com`, `sara.ns.cloudflare.com`
   - Ve al panel de tu registrador
   - Cambia los nameservers a los de Cloudflare
   - Espera 24-48h (normalmente 30 min)

#### 3.2. Configurar Registros DNS

En Cloudflare Dashboard → DNS → Records:

```
┌──────────┬──────────┬────────────────────────────┬────────┐
│ Type     │ Name     │ Content                    │ Proxy  │
├──────────┼──────────┼────────────────────────────┼────────┤
│ A        │ @        │ 76.76.21.21                │ ✅ ON  │
│ CNAME    │ www      │ cname.vercel-dns.com       │ ✅ ON  │
│ CNAME    │ app      │ cname.vercel-dns.com       │ ✅ ON  │
│ CNAME    │ *        │ cname.vercel-dns.com       │ ✅ ON  │
│ CNAME    │ api      │ tu-proyecto.up.railway.app │ ❌ OFF │
└──────────┴──────────┴────────────────────────────┴────────┘
```

**⚠️ MUY IMPORTANTE:**
- Proxy ✅ (naranja/ON) para Vercel = CDN + cache
- Proxy ❌ (gris/OFF) para Railway = DNS directo

#### 3.3. Configuración SSL

En Cloudflare Dashboard → SSL/TLS:

```
SSL/TLS encryption mode: Full (strict)
Edge Certificates:
  ✅ Always Use HTTPS
  ✅ Automatic HTTPS Rewrites
  ✅ Opportunistic Encryption
```

### Opción B: Registrador Directo (Sin Cloudflare)

Si prefieres configurar DNS directamente en tu registrador:

```
Tipo   Nombre   Valor                       TTL
A      @        76.76.21.21                 3600
CNAME  www      cname.vercel-dns.com        3600
CNAME  app      cname.vercel-dns.com        3600
CNAME  *        cname.vercel-dns.com        3600
CNAME  api      tu-proyecto.up.railway.app  3600
```

### 3.4. Verificar Propagación

```bash
# Verificar dominio principal
dig qronnect.es +short
# Debe mostrar: 76.76.21.21

# Verificar app
dig app.qronnect.es +short
# Debe mostrar: cname.vercel-dns.com → IP

# Verificar wildcard
dig lokeyokiera.qronnect.es +short
dig stylecut.qronnect.es +short
# Deben mostrar: cname.vercel-dns.com → IP

# Verificar API
dig api.qronnect.es +short
# Debe mostrar: tu-proyecto.up.railway.app → IP

# Online checker
# Ir a: https://dnschecker.org
# Ingresar: qronnect.es
# Debe estar verde en múltiples ubicaciones
```

### 3.5. Tiempo de Propagación

- **Mínimo:** 5 minutos
- **Normal:** 30 minutos - 2 horas
- **Máximo:** 24-48 horas
- **Con Cloudflare:** Usualmente muy rápido (5-15 min)

---

## Paso 4: Base de Datos (Supabase)

### 4.1. Upgrade a Plan Pro

**⚠️ CRÍTICO:** El plan gratuito pausa el proyecto después de inactividad.

1. **Ir a Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Seleccionar tu proyecto

2. **Upgrade:**
   - Settings → Billing
   - Upgrade to Pro
   - $25/mes
   - Ventajas:
     - 8 GB de DB
     - 50 GB de bandwidth
     - Sin pausas automáticas
     - Backups diarios
     - Support prioritario

### 4.2. Aplicar Migraciones

Tienes dos opciones:

#### Opción A: Supabase CLI (Recomendado)

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Link tu proyecto
supabase link --project-ref tu-project-ref

# Aplicar migraciones
supabase db push
```

#### Opción B: Manual con psql

```bash
cd backend

# Conectar a Supabase
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Aplicar cada migración
\i supabase/migrations/20251112201419_add_genero_to_clientes.sql
\i supabase/migrations/20251113000001_create_sms_system.sql
\i supabase/migrations/20251113000002_extend_campanas_sms.sql
\i supabase/migrations/20251114000001_sistema_regalos_bienvenida.sql
\i supabase/migrations/20251114000002_config_ia_extensa.sql
\i supabase/migrations/20251114000003_sistema_referidos.sql
\i supabase/migrations/20251114000004_limites_api_keys_ia.sql
\i supabase/migrations/20251114000005_add_store_info_fields.sql
\i supabase/migrations/20251115000001_create_landing_config.sql
\i supabase/migrations/20251115000002_create_usuarios_tienda.sql
\i supabase/migrations/20251115000003_fix_usuarios_tienda_rls.sql
\i supabase/migrations/20251116000001_fix_campanas_sms_creado_por.sql

# Verificar
\dt
# Debe mostrar las 17 tablas
```

### 4.3. Insertar Datos de Producción

```bash
# Insertar tiendas de ejemplo (o reales)
psql "postgresql://..." -f database/seed-tiendas-ejemplo.sql

# ⚠️ IMPORTANTE: Cambiar PINs y credenciales de prueba
```

### 4.4. Configuración de Producción

#### Connection Pooling:

1. **Ir a Settings → Database**
2. **Connection Pooling:**
   - Mode: Transaction
   - Max connections: 100

#### Backups:

1. **Ir a Database → Backups**
2. **Configurar:**
   - Frecuencia: Daily
   - Retención: 7 days (mínimo)
   - Probar: "Restore to new project" para verificar

#### RLS (Row Level Security):

```sql
-- Verificar que RLS esté habilitado en todas las tablas multi-tenant
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('clientes', 'compras', 'campanas', 'campanas_sms');

-- Todas deben tener rowsecurity = true
```

---

## Paso 5: Servicios Externos

### 5.1. Twilio SMS (⚠️ UPGRADE OBLIGATORIO)

**Estado actual:** Cuenta TRIAL (no funciona en producción)

#### Upgrade a Cuenta de Pago:

1. **Ir a Twilio Console:**
   - https://console.twilio.com

2. **Upgrade Account:**
   - Billing → Upgrade Account
   - Añadir tarjeta de crédito
   - No hay cargo mensual fijo
   - Solo pagas por uso

3. **Cargar Crédito Inicial:**
   - Billing → Add Funds
   - Recomendado: $20 iniciales
   - ~200-250 SMS

#### Configurar Sender ID (Producción):

**Para España, puedes usar Sender ID alfanumérico:**

```bash
# Ejemplos válidos:
QRONNECT    ← 8 caracteres
LOKEYOK     ← 7 caracteres (max 11)
STYLECUT    ← 8 caracteres

# Configuración:
1. Twilio Console → Messaging → Services
2. Create Messaging Service
3. Sender Type: Alpha Sender
4. Sender ID: QRONNECT
5. Completar registro regulatorio (requerido en España)
```

#### Actualizar Código:

Una vez la cuenta sea de producción (no trial):

```typescript
// backend/src/sms/sms.service.ts línea 185

// CAMBIAR DE:
const usarSenderId = false;

// A:
const usarSenderId = true;
```

#### Variables de Entorno en Railway:

```bash
SMS_ACCOUNT_SID=AC_tu_sid_de_produccion
SMS_AUTH_TOKEN=tu_token_de_produccion
SMS_FROM_NUMBER=+34XXXXXXXXX  # o usar Sender ID
```

#### Redeploy Backend:

```bash
# Railway detecta el cambio en variables de entorno
# Y redeploys automáticamente
# O manualmente: Railway Dashboard → Redeploy
```

### 5.2. Resend Email

**Estado actual:** Probablemente plan Free

#### API Key de Producción:

1. **Ir a Resend Dashboard:**
   - https://resend.com/dashboard

2. **Crear API Key:**
   - API Keys → Create API Key
   - Name: "Producción Qronnect"
   - Permission: Sending access
   - Copiar la key (solo se muestra una vez)

3. **Configurar Dominio (Opcional pero Recomendado):**
   ```
   Domains → Add Domain
   Domain: qronnect.es

   Configurar DNS records (Resend te los muestra):
   TXT  _resend   [verification-code]
   TXT  @         "v=spf1 include:_spf.resend.com ~all"
   TXT  default._domainkey   [DKIM key]
   ```

#### Variable de Entorno:

```bash
# En Railway
RESEND_API_KEY=re_tu_nueva_api_key_de_produccion
```

#### Plan Gratis vs Pro:

```
┌─────────────────┬──────────┬────────────┐
│ Plan            │ Gratis   │ Pro        │
├─────────────────┼──────────┼────────────┤
│ Emails/día      │ 100      │ 50,000     │
│ Precio          │ $0       │ $20/mes    │
├─────────────────┼──────────┼────────────┤
│ Recomendación   │ Empezar  │ Al crecer  │
└─────────────────┴──────────┴────────────┘
```

### 5.3. Google Gemini AI

#### API Key de Producción:

1. **Ir a Google AI Studio:**
   - https://makersuite.google.com/app/apikey

2. **Create API Key:**
   - Seleccionar proyecto
   - Create API Key in new project
   - Copiar la key

3. **Configurar Límites (Opcional):**
   - Ir a Google Cloud Console
   - APIs & Services → Gemini API
   - Quotas
   - Ajustar límites según necesidad

#### Variable de Entorno:

```bash
# En Railway
GEMINI_API_KEY=AIza_tu_api_key_de_produccion
```

#### Límites Plan Gratuito:

```
- 60 requests/minuto
- Suficiente para empezar
- Monitorear uso en Google Cloud Console
```

---

## Paso 6: Testing en Producción

### 6.1. Checklist de Funcionalidades

#### Backend API:

```bash
# Health check
curl https://api.qronnect.es/api
# ✅ Debe devolver: {"status":"ok",...}

# Login SuperAdmin
curl -X POST https://api.qronnect.es/api/superadmin/auth/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"tu_email@ejemplo.com"}'
# ✅ Debe devolver: {"message":"Código enviado",...}

# Tenant resolution
curl https://api.qronnect.es/api/config/branding \
  -H "X-Tenant-Domain: lokeyokiera"
# ✅ Debe devolver configuración de lokeyokiera
```

#### Frontend Multi-dominio:

```bash
# Landing principal
curl -I https://qronnect.es
# ✅ HTTP 200 OK

# App SuperAdmin
curl -I https://app.qronnect.es
# ✅ HTTP 200 OK

# Tenant específico
curl -I https://lokeyokiera.qronnect.es
# ✅ HTTP 200 OK

# Wildcard - tenant inexistente
curl -I https://test-nuevo-123.qronnect.es
# ✅ HTTP 200 OK (mostrará "tenant no encontrado" en la app)
```

#### SSL/HTTPS:

```bash
# Verificar certificado SSL
openssl s_client -connect qronnect.es:443 -servername qronnect.es < /dev/null

# Online checker
# https://www.ssllabs.com/ssltest/analyze.html?d=qronnect.es
# Debe dar calificación A o A+
```

### 6.2. Tests Funcionales

#### 1. Registro de Cliente:

```
1. Ir a: https://lokeyokiera.qronnect.es
2. Click "Registrarse"
3. Ingresar: nombre, email, teléfono
4. ✅ Debe enviar código por email
5. Ingresar código
6. ✅ Debe iniciar sesión y mostrar dashboard
```

#### 2. Login Admin:

```
1. Ir a: https://lokeyokiera.qronnect.es/admin
2. Email: admin@lokeyokiera.com
3. PIN: 1234 (o el que hayas configurado)
4. ✅ Debe mostrar panel admin
```

#### 3. Crear Campaña Email:

```
1. Panel Admin → Campañas → Nueva
2. Llenar formulario
3. Añadir destinatarios
4. Cambiar estado a "enviada"
5. ✅ Verificar que el email llegue
6. ✅ Verificar variables reemplazadas correctamente
```

#### 4. Crear Campaña SMS:

```
1. Panel Admin → SMS → Nueva campaña
2. Escribir mensaje con {{nombre}}
3. Seleccionar destinatarios
4. Enviar
5. ✅ Verificar que SMS llegue al móvil
6. ✅ Verificar formato correcto
7. ✅ Si cuenta trial: "Perfumeria Lokeyokiera: mensaje"
8. ✅ Si cuenta producción con Sender ID: "QRONNECT" como remitente
```

#### 5. Generar con IA:

```
1. Panel Admin → IA → Generar promoción
2. Ingresar contexto del negocio
3. ✅ Debe generar 3-5 ideas
4. Probar: Generar email
5. ✅ Debe crear HTML completo
```

#### 6. Sistema de Puntos:

```
1. Admin → Compras → Registrar nueva
2. Cliente: Seleccionar uno
3. Importe: 50€
4. ✅ Debe acumular puntos automáticamente
5. Verificar historial de puntos
```

#### 7. Canje de Promoción:

```
1. Como cliente, ver promociones disponibles
2. Canjear una (si tienes puntos suficientes)
3. ✅ Debe generar cupón con código único
4. Admin → Validar cupón
5. ✅ Debe marcar como usado
```

### 6.3. Tests de Rendimiento

```bash
# Test de carga simple (Apache Bench)
ab -n 100 -c 10 https://qronnect.es/
# 100 requests, 10 concurrentes

# Test de API
ab -n 100 -c 10 https://api.qronnect.es/api

# Resultados esperados:
# - Requests per second: >100
# - Time per request: <100ms
# - Failed requests: 0
```

### 6.4. Monitoreo Continuo

#### Railway (Backend):

```
1. Railway Dashboard → Tu proyecto
2. Deployments → Ver logs en tiempo real
3. Metrics → CPU, Memory, Network
4. ✅ CPU: <50% en idle
5. ✅ Memory: <512MB en idle
```

#### Vercel (Frontend):

```
1. Vercel Dashboard → Tu proyecto
2. Analytics → Ver métricas
3. ✅ Performance score: >90
4. ✅ Error rate: <1%
```

#### Supabase (Database):

```
1. Supabase Dashboard → Database
2. ✅ Connection pooling active
3. ✅ Backup automático configurado
4. Reports → Ver uso de DB
```

---

## Costos Mensuales

### Infraestructura Base

```
┌────────────────────────────┬─────────────┬───────────┐
│ Servicio                   │ Plan        │ Costo     │
├────────────────────────────┼─────────────┼───────────┤
│ Vercel (Frontend)          │ Hobby       │ $0        │
│  - Next.js hosting         │             │           │
│  - CDN global              │             │           │
│  - SSL automático          │             │           │
│  - 100GB bandwidth         │             │           │
│  - Multi-dominio ilimitado │             │           │
├────────────────────────────┼─────────────┼───────────┤
│ Railway (Backend)          │ Hobby       │ $5        │
│  - Incluye $5 gratis/mes   │             │           │
│  - 512MB RAM               │             │           │
│  - CPU compartido          │             │           │
│  - SSL automático          │             │           │
├────────────────────────────┼─────────────┼───────────┤
│ Supabase (Database)        │ Pro         │ $25       │
│  - 8GB Database            │             │           │
│  - 50GB Bandwidth          │             │           │
│  - Sin pausas automáticas  │             │           │
│  - Backups diarios         │             │           │
│  - Connection pooling      │             │           │
├────────────────────────────┼─────────────┼───────────┤
│ Cloudflare (DNS/CDN)       │ Free        │ $0        │
│  - DNS management          │             │           │
│  - CDN básico              │             │           │
│  - DDoS protection         │             │           │
│  - SSL básico              │             │           │
├────────────────────────────┼─────────────┼───────────┤
│ SUBTOTAL INFRAESTRUCTURA   │             │ $30/mes   │
└────────────────────────────┴─────────────┴───────────┘
```

### Servicios Variables (Según Uso)

```
┌────────────────────────────┬──────────────┬─────────────────┐
│ Servicio                   │ Plan         │ Costo           │
├────────────────────────────┼──────────────┼─────────────────┤
│ Twilio SMS                 │ Pay-as-go    │ ~€0.075 por SMS │
│  - 100 SMS/mes             │              │ = €7.50         │
│  - 500 SMS/mes             │              │ = €37.50        │
│  - 1000 SMS/mes            │              │ = €75.00        │
├────────────────────────────┼──────────────┼─────────────────┤
│ Resend Email               │ Free         │ $0              │
│  - 100 emails/día          │              │ (3000/mes)      │
│  - 500 emails/día          │ Pro - $20    │ (15k/mes)       │
├────────────────────────────┼──────────────┼─────────────────┤
│ Google Gemini IA           │ Free         │ $0              │
│  - 60 requests/min         │              │ (suficiente)    │
│  - Uso moderado            │              │ $0              │
└────────────────────────────┴──────────────┴─────────────────┘
```

### Ejemplos Reales

#### Negocio Pequeño (Empezando):
```
Infraestructura:     $30
SMS (100/mes):       $8
Email (gratis):      $0
IA (gratis):         $0
────────────────────────
TOTAL:              ~$38/mes
```

#### Negocio Mediano (Creciendo):
```
Infraestructura:     $30
SMS (500/mes):       $40
Email (Resend Pro):  $20
IA (gratis):         $0
────────────────────────
TOTAL:              ~$90/mes
```

#### Negocio Grande (Escalado):
```
Vercel Pro:          $20
Railway Pro:         $20
Supabase Pro:        $25
SMS (2000/mes):      $150
Email (Resend Pro):  $20
IA (dentro límite):  $0
────────────────────────
TOTAL:              ~$235/mes
```

---

## Troubleshooting

### Problema 1: "DNS_PROBE_FINISHED_NXDOMAIN"

**Causa:** DNS no propagado o mal configurado

**Solución:**
```bash
# 1. Verificar configuración DNS
dig qronnect.es +short

# 2. Si está vacío, revisar registros DNS
# 3. Esperar propagación (24-48h máx)

# 4. Verificar en dnschecker.org
# https://dnschecker.org

# 5. Limpiar caché DNS local
# Windows:
ipconfig /flushdns

# Mac/Linux:
sudo dscacheutil -flushcache
```

### Problema 2: "Mixed Content" (HTTP en HTTPS)

**Causa:** Referencias HTTP en página HTTPS

**Solución:**
```typescript
// Verificar que TODAS las URLs sean HTTPS
// frontend/next.config.js

// ❌ MALO:
NEXT_PUBLIC_API_URL=http://api.qronnect.es

// ✅ BUENO:
NEXT_PUBLIC_API_URL=https://api.qronnect.es
```

### Problema 3: CORS Errors

**Causa:** Backend rechaza requests del frontend

**Solución:**
```typescript
// backend/src/main.ts

app.enableCors({
  origin: [
    'https://qronnect.es',
    'https://app.qronnect.es',
    /https:\/\/.*\.qronnect\.es$/,  // ⭐ Regex para wildcard
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Domain'],
});
```

### Problema 4: 502 Bad Gateway en API

**Causa:** Backend no responde

**Solución:**
```bash
# 1. Verificar logs de Railway
Railway Dashboard → Logs

# 2. Verificar que backend esté corriendo
curl https://api.qronnect.es/api

# 3. Verificar variables de entorno
Railway Dashboard → Variables

# 4. Redeploy manual
Railway Dashboard → Redeploy

# 5. Verificar health del servicio
Railway Dashboard → Metrics
```

### Problema 5: Wildcard No Funciona

**Causa:** DNS wildcard mal configurado

**Solución:**
```bash
# 1. Verificar registro wildcard
dig *.qronnect.es +short

# 2. Debe resolver a Vercel
# Si no:
#   - Revisar registro CNAME para "*"
#   - Debe apuntar a cname.vercel-dns.com

# 3. Verificar en Vercel
Vercel Dashboard → Domains
# Debe aparecer: *.qronnect.es

# 4. Test con subdominio aleatorio
curl -I https://test-random-123.qronnect.es
# Debe dar 200 OK
```

### Problema 6: SMS No Envía

**Causa:** Cuenta Twilio trial o sin crédito

**Solución:**
```bash
# 1. Verificar cuenta Twilio
# https://console.twilio.com
# Status: NO debe ser "Trial"

# 2. Verificar crédito
# Balance: Debe tener > $0

# 3. Verificar variables en Railway
SMS_ACCOUNT_SID=AC... (no ACtest...)
SMS_AUTH_TOKEN=...
SMS_FROM_NUMBER=+34...

# 4. Verificar logs de Railway
# Buscar errores de Twilio

# 5. Si sigue fallando, cambiar usarSenderId
# backend/src/sms/sms.service.ts:185
const usarSenderId = false; // Usar número de teléfono
```

### Problema 7: Emails en Spam

**Causa:** Dominio no verificado o sin SPF/DKIM

**Solución:**
```bash
# 1. Verificar dominio en Resend
Resend Dashboard → Domains
# Status: Debe estar verificado ✅

# 2. Configurar SPF record
Tipo: TXT
Nombre: @
Valor: v=spf1 include:_spf.resend.com ~all

# 3. Configurar DKIM
# Resend te da el record exacto
# Copiarlo en tu DNS

# 4. Esperar 24-48h para propagación

# 5. Test SPF/DKIM
# https://mxtoolbox.com/spf.aspx
```

### Problema 8: IA No Responde

**Causa:** API key inválida o límite excedido

**Solución:**
```bash
# 1. Verificar API key
# Google AI Studio → API Keys
# Debe estar activa

# 2. Verificar límites
# Google Cloud Console → Quotas
# Gemini API: 60 req/min

# 3. Verificar variable en Railway
GEMINI_API_KEY=AIza...

# 4. Test directo
curl https://generativelanguage.googleapis.com/v1/models \
  -H 'x-goog-api-key: TU_API_KEY'

# 5. Revisar logs de Railway para errores
```

---

## Preguntas Frecuentes

### ❓ Deployment

**P: ¿Cuánto tarda el primer deployment?**
R: 2-3 horas configurando todo por primera vez. Después, updates automáticos en 5 minutos.

**P: ¿Puedo usar Railway gratis?**
R: Sí, incluye $5 gratis/mes. Suficiente para empezar.

**P: ¿Necesito tarjeta de crédito?**
R: Railway no. Vercel no. Supabase Pro sí ($25/mes). Twilio sí (pay-as-go).

### ❓ Multi-Dominio

**P: ¿Funciona con infinitos subdominios?**
R: Sí. El wildcard `*.qronnect.es` soporta cualquier cantidad.

**P: ¿Tengo que configurar cada tenant manualmente?**
R: No. El wildcard los captura automáticamente.

**P: ¿Qué pasa si visitan tenant-inexistente.qronnect.es?**
R: Tu app muestra "Tenant no encontrado" o landing genérica (configurable).

**P: ¿Puedo usar dominio propio por tenant? (ej: cliente-maria.com)**
R: Sí (avanzado). El cliente configura CNAME en su DNS a tu Vercel. Requieres añadir el dominio en Vercel.

### ❓ Costos

**P: ¿$30/mes es suficiente para empezar?**
R: Sí. Infraestructura completa. Solo sumas costos de SMS según uso.

**P: ¿Qué pasa si se me acaba el crédito de Twilio?**
R: Los SMS fallan. Twilio te avisa por email antes. Recargar es instantáneo.

**P: ¿Resend es realmente gratis?**
R: Sí, 100 emails/día (3000/mes). Suficiente para empezar. Upgrade cuando crezcas.

**P: ¿Hay costos ocultos?**
R: No. Los servicios muestran costos transparentes. Twilio cobra por SMS enviado. Los demás son fijos o gratis.

### ❓ Escalabilidad

**P: ¿Soporta muchos usuarios simultáneos?**
R: Sí. Vercel y Railway escalan automáticamente. Supabase Pro soporta miles de conexiones.

**P: ¿Cuándo necesito upgrade?**
R: Cuando Vercel/Railway hobby se queden cortos. Verás en las métricas. Normalmente después de 1000+ usuarios activos.

**P: ¿Es fácil escalar después?**
R: Muy fácil. Un click en cada plataforma. Sin downtime.

### ❓ Seguridad

**P: ¿Es seguro?**
R: Sí. HTTPS forzado en todos los dominios. JWT para auth. RLS en DB. DDoS protection con Cloudflare.

**P: ¿Necesito configurar firewall?**
R: No. Railway y Vercel lo manejan.

**P: ¿Debo preocuparme por backups?**
R: Supabase hace backups diarios automáticos. Puedes hacer backups manuales adicionales.

**P: ¿Qué pasa si hackean la cuenta?**
R: Habilita 2FA en todas las plataformas (Railway, Vercel, Supabase, GitHub).

### ❓ Mantenimiento

**P: ¿Necesito actualizar manualmente?**
R: No. Railway y Vercel detectan pushes a GitHub y redeploy automáticamente.

**P: ¿Cómo aplico updates de código?**
R: `git push origin main` → Auto-deploy en Vercel y Railway.

**P: ¿Puedo hacer rollback si algo falla?**
R: Sí. Vercel y Railway mantienen historial de deployments. Rollback en 1 click.

**P: ¿Cuánto tiempo de downtime hay en updates?**
R: 0. Vercel y Railway hacen "zero-downtime deployments".

### ❓ Errores Comunes

**P: "Error: Module not found" en producción**
R: Verificar `dependencies` vs `devDependencies` en package.json. Build debe incluir todos los módulos necesarios.

**P: Variables de entorno no funcionan**
R: Verificar que estén en el servicio correcto (Railway vs Vercel). Redeploy después de cambiarlas.

**P: "Database connection failed"**
R: Verificar `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Verificar que Supabase esté online.

---

## Checklist Final

Antes de considerar el deployment completo, verifica:

### Pre-Deployment
- [ ] Código commiteado en Git
- [ ] Tests locales pasando
- [ ] Variables de entorno documentadas
- [ ] Migraciones de DB preparadas
- [ ] Credenciales de producción obtenidas (Twilio, Resend, Gemini)

### Backend (Railway)
- [ ] Proyecto creado en Railway
- [ ] Repositorio GitHub conectado
- [ ] Variables de entorno configuradas (15 variables mínimo)
- [ ] Build exitoso (logs sin errores)
- [ ] Health check funcionando: `GET /api` → 200 OK
- [ ] Dominio `api.qronnect.es` configurado
- [ ] SSL activo (candado verde en navegador)
- [ ] CORS configurado con regex para wildcard

### Frontend (Vercel)
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas (3 variables mínimo)
- [ ] Build exitoso (0 errores)
- [ ] Dominio `qronnect.es` añadido y verificado
- [ ] Dominio `app.qronnect.es` añadido y verificado
- [ ] Wildcard `*.qronnect.es` añadido y verificado
- [ ] SSL activo en todos los dominios
- [ ] Rewrites a API funcionando (`/api/*` → Railway)

### DNS
- [ ] Registro A para `@` → 76.76.21.21 (Vercel)
- [ ] CNAME para `app` → cname.vercel-dns.com
- [ ] CNAME para `*` → cname.vercel-dns.com (wildcard)
- [ ] CNAME para `api` → tu-proyecto.up.railway.app
- [ ] DNS propagado (verificado en dnschecker.org)
- [ ] Todos los dominios resuelven correctamente

### Base de Datos (Supabase)
- [ ] Plan Pro activo ($25/mes)
- [ ] Todas las 12 migraciones aplicadas
- [ ] RLS habilitado en todas las tablas
- [ ] Datos de prueba/producción insertados
- [ ] Backups automáticos configurados (diarios)
- [ ] Connection pooling habilitado (100 max)
- [ ] Verificado acceso desde Railway (logs)

### Servicios Externos
- [ ] **Twilio:** Cuenta upgraded (NO trial)
- [ ] **Twilio:** Sender ID configurado (si cuenta de producción)
- [ ] **Twilio:** Crédito cargado ($20+ recomendado)
- [ ] **Resend:** API Key de producción configurada
- [ ] **Resend:** Dominio verificado (opcional pero recomendado)
- [ ] **Gemini:** API Key de producción configurada
- [ ] **Gemini:** Límites verificados (60 req/min)
- [ ] Todas las variables actualizadas en Railway

### Testing Completo
- [ ] Health check backend: `curl https://api.qronnect.es/api` → 200 OK
- [ ] Login SuperAdmin funcional
- [ ] Login Admin tienda funcional
- [ ] Registro de cliente funcional
- [ ] Multi-tenant: 3+ subdominios testeados y funcionando
- [ ] Envío SMS real exitoso (verificar llegada a móvil)
- [ ] Envío Email real exitoso (verificar inbox, no spam)
- [ ] Generación IA funcionando (crear promoción, email, etc.)
- [ ] Registro de compra y acumulación de puntos
- [ ] Canje de promoción y validación de cupón
- [ ] QR code generación y lectura
- [ ] Sistema de referidos funcional

### Seguridad
- [ ] `JWT_SECRET` diferente al de desarrollo (32+ caracteres)
- [ ] API Keys NUNCA en código, solo en variables de entorno
- [ ] HTTPS forzado en todos los dominios
- [ ] CORS configurado restrictivamente (no `*`)
- [ ] Rate limiting configurado (si aplica)
- [ ] 2FA habilitado en todas las cuentas (GitHub, Railway, Vercel, Supabase)
- [ ] Passwords fuertes en todos los servicios

### Monitoreo
- [ ] Logs de Railway configurados y accesibles
- [ ] Logs de Vercel configurados y accesibles
- [ ] Alertas de Supabase activas (email)
- [ ] Uptime monitoring configurado (UptimeRobot o similar)
- [ ] Error tracking configurado (Sentry opcional)

### Documentación
- [ ] Variables de entorno documentadas
- [ ] Procedimiento de deployment documentado
- [ ] Credenciales guardadas en password manager seguro
- [ ] Contactos de soporte anotados
- [ ] Runbook de troubleshooting preparado

### Go Live
- [ ] Anuncio oficial preparado (si aplica)
- [ ] Soporte disponible para primeros usuarios
- [ ] Plan de rollback en caso de problema crítico
- [ ] Backup manual de DB antes de go-live
- [ ] Monitoreo activo las primeras 24-48h

---

## Próximos Pasos

### Inmediatamente Después de Deploy

1. **Monitorear logs intensivamente (primeras 48h):**
   ```bash
   # Railway logs en tiempo real
   # Vercel logs en tiempo real
   # Buscar errores, warnings, problemas de performance
   ```

2. **Verificar métricas:**
   ```bash
   # Railway: CPU, Memory, Network
   # Vercel: Performance, Error rate
   # Supabase: DB connections, queries/sec
   ```

3. **Probar todas las funcionalidades una vez más:**
   ```bash
   # Como si fueras un usuario nuevo
   # Registrarse, comprar, canjear, etc.
   ```

### Primera Semana

1. **Optimizar basándote en métricas reales:**
   ```typescript
   // Identificar queries lentas en Supabase
   // Optimizar componentes pesados en frontend
   // Añadir índices si faltan en DB
   ```

2. **Configurar monitoreo avanzado:**
   ```bash
   # UptimeRobot: https://uptimerobot.com (gratis)
   # Alertas por email si sitio cae
   # Checks cada 5 minutos
   ```

3. **Establecer proceso de updates:**
   ```bash
   # 1. Develop en branch feature/*
   # 2. PR a main
   # 3. Review código
   # 4. Merge → Auto-deploy
   # 5. Verificar logs
   ```

### Primer Mes

1. **Revisar costos reales:**
   ```bash
   # Railway: Ver factura real
   # Twilio: SMS enviados y costo
   # Comparar con estimaciones
   # Ajustar presupuesto si necesario
   ```

2. **Optimizaciones de performance:**
   ```bash
   # Análisis de Vercel Analytics
   # Identificar páginas lentas
   # Optimizar imágenes (Next.js Image)
   # Implementar caché donde tenga sentido
   ```

3. **Implementar mejoras basadas en feedback:**
   ```bash
   # Escuchar a primeros usuarios
   # Fix bugs reportados
   # Implementar features más solicitadas
   ```

### Largo Plazo

1. **Planear escalado:**
   ```bash
   # Monitorear crecimiento de usuarios
   # Planear upgrade a planes Pro cuando necesario
   # Considerar CDN adicional si tráfico internacional
   ```

2. **Mejoras continuas:**
   ```bash
   # Implementar features del roadmap
   # Mantener dependencias actualizadas
   # Seguir best practices de seguridad
   ```

3. **Backups y disaster recovery:**
   ```bash
   # Backup manual semanal de Supabase
   # Documentar procedimiento de restore
   # Probar restore en ambiente de staging
   ```

---

## Recursos Adicionales

### Documentación Oficial

- **Railway:** https://docs.railway.app
- **Vercel:** https://vercel.com/docs
- **Supabase:** https://supabase.com/docs
- **Next.js:** https://nextjs.org/docs
- **NestJS:** https://docs.nestjs.com
- **Twilio:** https://www.twilio.com/docs
- **Resend:** https://resend.com/docs
- **Google Gemini:** https://ai.google.dev/docs

### Comunidades y Soporte

- **Railway Discord:** https://discord.gg/railway
- **Vercel Discord:** https://discord.gg/vercel
- **Supabase Discord:** https://discord.supabase.com
- **Next.js Discussions:** https://github.com/vercel/next.js/discussions

### Tools Útiles

- **DNS Checker:** https://dnschecker.org
- **SSL Test:** https://www.ssllabs.com/ssltest
- **Uptime Monitor:** https://uptimerobot.com
- **API Testing:** https://www.postman.com
- **Performance:** https://pagespeed.web.dev

---

## Conclusión

Has llegado al final de esta guía completa de deployment. Si has seguido todos los pasos, ahora tienes:

✅ **Backend en Railway** funcionando en `api.qronnect.es`
✅ **Frontend en Vercel** con soporte multi-dominio `*.qronnect.es`
✅ **DNS configurado** con wildcard para infinitos tenants
✅ **Base de datos** en Supabase Pro con backups automáticos
✅ **Servicios externos** configurados (SMS, Email, IA)
✅ **SSL automático** en todos los dominios
✅ **Monitoreo activo** de logs y métricas

**Tu SaaS multi-tenant está LIVE en producción.** 🚀

### URLs de tu proyecto:

```
🌐 Landing:        https://qronnect.es
🔐 SuperAdmin:     https://app.qronnect.es
🏪 Ejemplo Tenant: https://lokeyokiera.qronnect.es
⚙️  API:           https://api.qronnect.es
📊 Monitoreo:      Dashboards de Railway/Vercel/Supabase
```

**¡Felicidades por llevar Qronnect a producción!** 🎉

---

**Última actualización:** 16 de Noviembre de 2025
**Versión:** 1.0.0
**Autor:** Claude Code
**Proyecto:** Qronnect - Sistema de Fidelización Multi-Tenant SaaS
