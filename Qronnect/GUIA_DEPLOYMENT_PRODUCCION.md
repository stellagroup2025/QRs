# 🚀 Guía de Deployment a Producción - Qronnect
**Dominio:** qronnect.es
**Fecha:** 16 de Noviembre de 2025

---

## 📋 Índice
1. [Arquitectura de Producción](#arquitectura-de-producción)
2. [Paso 1: Backend (Railway/Render)](#paso-1-backend)
3. [Paso 2: Frontend (Vercel)](#paso-2-frontend)
4. [Paso 3: Configuración DNS](#paso-3-configuración-dns)
5. [Paso 4: Base de Datos (Supabase)](#paso-4-base-de-datos)
6. [Paso 5: Servicios Externos](#paso-5-servicios-externos)
7. [Paso 6: Testing en Producción](#paso-6-testing)
8. [Costos Estimados](#costos-estimados)
9. [Checklist Final](#checklist-final)

---

## Arquitectura de Producción

```
┌─────────────────────────────────────────────────────────────┐
│                     DOMINIO: qronnect.es                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                                           ↓
┌──────────────────┐                    ┌──────────────────────┐
│   FRONTEND       │                    │   BACKEND API        │
│   (Vercel)       │                    │   (Railway/Render)   │
│                  │                    │                      │
│ Multi-dominio:   │◄───────────────────┤ api.qronnect.es     │
│ *.qronnect.es    │      API Calls     │ Puerto: 443 (HTTPS) │
│                  │                    │                      │
│ Ejemplos:        │                    └──────────┬───────────┘
│ - app.qronnect.es│                               ↓
│ - lokeyokiera... │                    ┌──────────────────────┐
│ - stylecut...    │                    │   SUPABASE           │
│ - [tenant]...    │                    │   (PostgreSQL)       │
└──────────────────┘                    │   RLS + Auth         │
                                        └──────────────────────┘
                                                   ↓
                              ┌─────────────────────────────────┐
                              │   SERVICIOS EXTERNOS            │
                              │   - Twilio (SMS)                │
                              │   - Resend (Email)              │
                              │   - Google Gemini (IA)          │
                              └─────────────────────────────────┘
```

### Dominios y Subdominios:

```
qronnect.es                    → Landing principal de Qronnect
app.qronnect.es                → Panel SuperAdmin
api.qronnect.es                → Backend API (Railway/Render)

# Multi-tenant (tenants dinámicos):
*.qronnect.es                  → Captura todos los subdominios
lokeyokiera.qronnect.es        → Tienda: Perfumeria Lokeyokiera
stylecut.qronnect.es           → Tienda: StyleCut Barber
burgerco.qronnect.es           → Tienda: BurgerCo
[cualquier-tenant].qronnect.es → Cualquier nueva tienda
```

---

## Paso 1: Backend (Railway o Render)

### Opción A: Railway (Recomendado) 💰 $5/mes

#### ¿Por qué Railway?
- ✅ Deploy automático desde GitHub
- ✅ Variables de entorno fáciles
- ✅ Logs en tiempo real
- ✅ SSL automático
- ✅ Escalado automático
- ✅ $5 gratis de crédito al mes

#### Proceso de Deploy en Railway:

1. **Crear cuenta en Railway:**
   - Visita: https://railway.app
   - Login con GitHub
   - Conecta tu repositorio

2. **Crear nuevo proyecto:**
   ```bash
   # Desde la raíz de tu proyecto
   cd backend

   # Asegúrate de tener estos archivos:
   # - package.json ✅
   # - Dockerfile (opcional, pero recomendado)
   # - railway.json (configuración)
   ```

3. **Crear `railway.json` en `/backend`:**
   ```json
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
   ```

4. **Crear `Dockerfile` en `/backend` (Opcional pero recomendado):**
   ```dockerfile
   # Dockerfile
   FROM node:18-alpine

   WORKDIR /app

   # Copiar package files
   COPY package*.json ./

   # Instalar dependencias
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

5. **Configurar variables de entorno en Railway:**
   ```bash
   # Desde el dashboard de Railway, añade estas variables:

   NODE_ENV=production
   PORT=3001

   # Supabase
   SUPABASE_URL=https://ajyiuhujexwrjmjfycxh.supabase.co
   SUPABASE_ANON_KEY=tu_anon_key_aqui
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

   # JWT
   JWT_SECRET=genera_un_secreto_muy_seguro_y_largo_aqui_minimo_32_caracteres

   # Email (Resend)
   RESEND_API_KEY=re_tu_api_key_aqui

   # SMS (Twilio)
   SMS_ACCOUNT_SID=AC_tu_account_sid_aqui
   SMS_AUTH_TOKEN=tu_auth_token_aqui
   SMS_FROM_NUMBER=+1234567890

   # IA (Google Gemini)
   GEMINI_API_KEY=AIza_tu_api_key_aqui

   # Frontend URL (importante para CORS)
   FRONTEND_URL=https://qronnect.es
   ```

6. **Deploy:**
   - Railway detectará automáticamente tu proyecto Node.js
   - Ejecutará `npm install` y `npm run build`
   - Iniciará con `npm run start:prod`
   - Te dará una URL temporal: `https://tu-proyecto.up.railway.app`

7. **Configurar dominio personalizado:**
   - En Railway Dashboard → Settings → Domains
   - Añadir: `api.qronnect.es`
   - Railway te dará un CNAME para configurar en tu DNS
   - SSL se configura automáticamente

#### Script de build en package.json:
Asegúrate de tener estos scripts en `/backend/package.json`:
```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main",
    "start:dev": "nest start --watch"
  }
}
```

---

### Opción B: Render 💰 $7/mes

Similar a Railway pero con UI diferente. Pasos casi idénticos.

1. Visita: https://render.com
2. New → Web Service
3. Conecta tu repo GitHub
4. Configuración:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Añade variables de entorno
5. Deploy

---

## Paso 2: Frontend (Vercel)

### ¿Por qué Vercel?
- ✅ Optimizado para Next.js
- ✅ Deploy automático desde GitHub
- ✅ SSL automático
- ✅ CDN global
- ✅ **Soporte multi-dominio incluido** ⭐
- ✅ Plan gratuito generoso

### Proceso de Deploy en Vercel:

1. **Preparar el proyecto frontend:**
   ```bash
   cd frontend

   # Asegúrate de tener vercel.json configurado
   ```

2. **Crear `vercel.json` en `/frontend`:**
   ```json
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
   ```

3. **Actualizar `.env.local` → `.env.production`:**
   ```bash
   # frontend/.env.production
   NEXT_PUBLIC_API_URL=https://api.qronnect.es/api
   NEXT_PUBLIC_SUPABASE_URL=https://ajyiuhujexwrjmjfycxh.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
   ```

4. **Deploy en Vercel:**
   - Visita: https://vercel.com
   - New Project
   - Import Git Repository (tu repo de GitHub)
   - Selecciona la carpeta `/frontend` (si es monorepo)
   - Vercel detectará automáticamente Next.js
   - Añade las variables de entorno desde `.env.production`
   - Click Deploy

5. **Configurar dominios en Vercel:**

   En Vercel Dashboard → Project Settings → Domains:

   **a) Dominio principal:**
   ```
   qronnect.es → Agregar
   ```

   **b) Dominio de app SuperAdmin:**
   ```
   app.qronnect.es → Agregar
   ```

   **c) Wildcard para tenants (⭐ LO MÁS IMPORTANTE):**
   ```
   *.qronnect.es → Agregar
   ```

   Esto capturará automáticamente:
   - lokeyokiera.qronnect.es
   - stylecut.qronnect.es
   - cualquier-tenant.qronnect.es
   - etc.

6. **Vercel te indicará qué DNS configurar** (lo veremos en el siguiente paso)

---

## Paso 3: Configuración DNS

Debes configurar los DNS en el panel de tu registrador de dominios (donde compraste `qronnect.es`).

### Registros DNS Necesarios:

```dns
# 1. Dominio raíz (landing principal)
Tipo: A
Nombre: @
Valor: 76.76.21.21 (IP de Vercel)
TTL: 3600

# 2. Subdominios Vercel (frontend)
Tipo: CNAME
Nombre: app
Valor: cname.vercel-dns.com
TTL: 3600

# 3. ⭐ WILDCARD para multi-tenant (frontend)
Tipo: CNAME
Nombre: *
Valor: cname.vercel-dns.com
TTL: 3600

# 4. API Backend (Railway)
Tipo: CNAME
Nombre: api
Valor: tu-proyecto.up.railway.app (o lo que Railway te indique)
TTL: 3600

# 5. Opcional: www redirect
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
TTL: 3600
```

### Ejemplo en Cloudflare DNS:

Si usas Cloudflare (recomendado para mejor performance):

```
┌──────────┬──────────┬────────────────────────────┬───────┐
│ Type     │ Name     │ Content                    │ Proxy │
├──────────┼──────────┼────────────────────────────┼───────┤
│ A        │ @        │ 76.76.21.21                │ ✅    │
│ CNAME    │ app      │ cname.vercel-dns.com       │ ✅    │
│ CNAME    │ *        │ cname.vercel-dns.com       │ ✅    │
│ CNAME    │ api      │ tu-proyecto.up.railway.app │ ❌    │
│ CNAME    │ www      │ cname.vercel-dns.com       │ ✅    │
└──────────┴──────────┴────────────────────────────┴───────┘
```

**⚠️ Importante:**
- Proxy ✅ (naranja) para dominios de Vercel = Mayor velocidad con CDN
- Proxy ❌ (gris) para Railway = DNS directo sin proxy

### Propagación DNS:
- Tiempo estimado: 5 minutos - 48 horas
- Normalmente: 30 minutos
- Comprobar: https://dnschecker.org

---

## Paso 4: Base de Datos (Supabase)

### Upgrade a Plan de Producción:

1. **Plan recomendado:** Pro ($25/mes)
   - 8 GB de DB
   - 50 GB de ancho de banda
   - Sin pausas automáticas
   - Backups diarios

2. **Configuración de producción:**
   - Dashboard de Supabase → Project Settings → Database
   - **Enable Connection Pooling:** ✅
   - **Connection limit:** 100 (ajustar según necesidad)

3. **Aplicar todas las migraciones:**
   ```bash
   # Desde tu local, conectado a Supabase producción
   cd backend

   # Verificar que todas las migraciones estén aplicadas
   # Opción 1: Usar Supabase CLI
   npx supabase db push

   # Opción 2: Ejecutar manualmente cada migración
   psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
     -f supabase/migrations/20251112201419_add_genero_to_clientes.sql

   # Repetir para cada migración
   ```

4. **Insertar datos de producción:**
   ```bash
   # Insertar tiendas de ejemplo (o las reales)
   psql "postgresql://..." -f database/seed-tiendas-ejemplo.sql

   # IMPORTANTE: Cambiar PINs y credenciales de ejemplo por reales
   ```

5. **Configurar RLS (Row Level Security):**
   - ✅ Ya configurado en las migraciones
   - Verificar que todas las políticas estén activas

6. **Configurar Backups automáticos:**
   - Supabase Dashboard → Database → Backups
   - Frecuencia: Diaria
   - Retención: 7 días (mínimo)

---

## Paso 5: Servicios Externos

### 5.1 Twilio (SMS) - UPGRADE OBLIGATORIO

**⚠️ MUY IMPORTANTE:** Tu cuenta actual es TRIAL, debes hacer upgrade para producción.

#### Upgrade a cuenta de pago:
1. Visita: https://console.twilio.com
2. Ir a: Billing → Upgrade Account
3. Añadir tarjeta de crédito
4. Cargar crédito inicial: $20 (recomendado)

#### Configurar Sender ID Alfanumérico (Recomendado):
```bash
# Para España, puedes usar Sender ID alfanumérico
# Ejemplo: "QRONNECT" o "LOKEYOK"

# Pasos:
1. Twilio Console → Messaging → Services
2. Create Messaging Service
3. Sender Type: Alpha Sender
4. Sender ID: QRONNECT (máx 11 caracteres)
5. Completar registro regulatorio (requerido en España)
```

#### Una vez upgradeada la cuenta:
```typescript
// backend/src/sms/sms.service.ts línea 185
// Cambiar:
const usarSenderId = false;
// Por:
const usarSenderId = true;
```

#### Actualizar variables de entorno:
```bash
# Railway/Render
SMS_ACCOUNT_SID=tu_account_sid_de_produccion
SMS_AUTH_TOKEN=tu_auth_token_de_produccion
SMS_FROM_NUMBER=+34XXXXXXXXX  # o usar Sender ID alfanumérico
```

---

### 5.2 Resend (Email)

**Estado actual:** Probablemente cuenta gratuita

#### Plan recomendado:
- **Free:** 100 emails/día (suficiente para empezar)
- **Pro:** $20/mes - 50,000 emails/mes (cuando crezcas)

#### Configuración:
1. Dashboard Resend → API Keys
2. Crear nueva API Key para producción
3. Añadir dominio personalizado (opcional):
   - Domain: qronnect.es
   - Verificar DNS records (SPF, DKIM)

#### Variables de entorno:
```bash
RESEND_API_KEY=re_tu_api_key_de_produccion
```

---

### 5.3 Google Gemini (IA)

#### Crear API Key de producción:
1. Visita: https://makersuite.google.com/app/apikey
2. Create API Key
3. Configurar límites de uso
4. Habilitar facturación si excedes plan gratuito

#### Plan gratuito:
- 60 requests/minuto
- Suficiente para empezar

#### Variables de entorno:
```bash
GEMINI_API_KEY=tu_api_key_de_produccion
```

---

## Paso 6: Testing en Producción

### Checklist de Testing:

#### 1. Backend API
```bash
# Test de health check
curl https://api.qronnect.es/api
# Respuesta esperada: {"status":"ok","message":"Qronnect API is running",...}

# Test de login SuperAdmin
curl -X POST https://api.qronnect.es/api/superadmin/auth/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"tu_email@ejemplo.com"}'

# Test de tenant resolution
curl https://api.qronnect.es/api/config/branding \
  -H "X-Tenant-Domain: lokeyokiera"
```

#### 2. Frontend Multi-dominio
```bash
# Test dominio principal
curl -I https://qronnect.es
# Debe devolver 200 OK

# Test app SuperAdmin
curl -I https://app.qronnect.es
# Debe devolver 200 OK

# Test tenant específico
curl -I https://lokeyokiera.qronnect.es
# Debe devolver 200 OK

# Test wildcard con tenant inexistente
curl -I https://test123456.qronnect.es
# Debe devolver 200 OK (pero mostrará tenant no encontrado en la app)
```

#### 3. Base de Datos
```bash
# Verificar conexión desde backend en Railway
# Los logs de Railway mostrarán: "✅ Supabase clients initialized"
```

#### 4. SMS (Twilio)
```bash
# Desde la app, enviar campaña SMS de prueba
# Verificar que llegue al móvil
# Verificar que el Sender ID sea correcto (no un número)
```

#### 5. Email (Resend)
```bash
# Desde la app, enviar campaña Email de prueba
# Verificar que llegue a la bandeja (no spam)
# Verificar personalización de variables
```

#### 6. IA (Gemini)
```bash
# Desde la app, generar contenido con IA
# Verificar que las respuestas sean coherentes
```

---

## Paso 7: Configuración de Middleware Multi-Tenant

### Actualizar TenantResolver en Backend:

```typescript
// backend/src/tenant/tenant.middleware.ts

// Actualizar dominios permitidos
const allowedDomains = [
  'localhost:3000',      // Desarrollo
  'qronnect.es',         // Producción - landing
  'app.qronnect.es',     // Producción - SuperAdmin
  /\.qronnect\.es$/,     // Producción - Wildcard tenants
];
```

### Actualizar CORS en Backend:

```typescript
// backend/src/main.ts

app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://qronnect.es',
    'https://app.qronnect.es',
    /https:\/\/.*\.qronnect\.es$/,  // ⭐ Wildcard
  ],
  credentials: true,
});
```

### Actualizar Frontend Next.js Config:

```typescript
// frontend/next.config.js

module.exports = {
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
};
```

---

## Costos Estimados Mensuales

### Infraestructura:
```
┌────────────────────────┬──────────────┬────────────┐
│ Servicio               │ Plan         │ Costo/mes  │
├────────────────────────┼──────────────┼────────────┤
│ Vercel (Frontend)      │ Hobby        │ $0         │
│ Railway (Backend)      │ Hobby        │ $5         │
│ Supabase (DB)          │ Pro          │ $25        │
│ Cloudflare (DNS/CDN)   │ Free         │ $0         │
│                        │              │            │
│ TOTAL INFRAESTRUCTURA  │              │ $30/mes    │
└────────────────────────┴──────────────┴────────────┘
```

### Servicios Externos (Variable según uso):
```
┌────────────────────────┬──────────────┬────────────┐
│ Servicio               │ Plan         │ Costo      │
├────────────────────────┼──────────────┼────────────┤
│ Twilio (SMS)           │ Pay as go    │ ~€0.075/SMS│
│ Resend (Email)         │ Free         │ $0         │
│ Google Gemini (IA)     │ Free         │ $0*        │
│                        │              │            │
│ Ejemplo con 100 SMS:   │              │ ~$8/mes    │
│ Ejemplo con 500 SMS:   │              │ ~$40/mes   │
└────────────────────────┴──────────────┴────────────┘
```

**Total estimado inicial:** $30-50/mes

### Escalado (cuando crezcas):
```
┌────────────────────────┬──────────────┬────────────┐
│ Servicio               │ Plan         │ Costo/mes  │
├────────────────────────┼──────────────┼────────────┤
│ Vercel                 │ Pro          │ $20        │
│ Railway                │ Pro          │ $20        │
│ Supabase               │ Pro          │ $25        │
│ Resend                 │ Pro          │ $20        │
│ Twilio                 │ Variable     │ $100+      │
│                        │              │            │
│ TOTAL                  │              │ $185+/mes  │
└────────────────────────┴──────────────┴────────────┘
```

---

## Checklist Final de Deployment

### Pre-deployment:
- [ ] Código commiteado en Git
- [ ] Tests locales pasando
- [ ] Variables de entorno documentadas
- [ ] Migraciones de DB preparadas
- [ ] Credenciales de producción obtenidas

### Backend (Railway/Render):
- [ ] Proyecto creado en Railway
- [ ] Variables de entorno configuradas
- [ ] Build exitoso
- [ ] Health check funcionando (`/api`)
- [ ] Dominio `api.qronnect.es` configurado
- [ ] SSL activo (HTTPS)
- [ ] CORS configurado correctamente

### Frontend (Vercel):
- [ ] Proyecto importado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Build exitoso
- [ ] Dominio `qronnect.es` configurado
- [ ] Dominio `app.qronnect.es` configurado
- [ ] Wildcard `*.qronnect.es` configurado
- [ ] SSL activo en todos los dominios
- [ ] Rewrites a API funcionando

### DNS:
- [ ] Registro A para `@` → Vercel
- [ ] CNAME para `app` → Vercel
- [ ] CNAME para `*` → Vercel (wildcard)
- [ ] CNAME para `api` → Railway
- [ ] DNS propagado (dnschecker.org)

### Base de Datos:
- [ ] Plan Pro activo en Supabase
- [ ] Todas las migraciones aplicadas
- [ ] RLS habilitado y funcionando
- [ ] Datos de prueba insertados
- [ ] Backups automáticos configurados
- [ ] Connection pooling habilitado

### Servicios Externos:
- [ ] Twilio: Cuenta upgraded (no trial)
- [ ] Twilio: Sender ID configurado (si aplica)
- [ ] Twilio: Crédito cargado ($20+)
- [ ] Resend: API Key de producción
- [ ] Gemini: API Key de producción
- [ ] Variables actualizadas en Railway

### Testing:
- [ ] Health check backend: ✅
- [ ] Login SuperAdmin: ✅
- [ ] Login Admin tienda: ✅
- [ ] Registro cliente: ✅
- [ ] Multi-tenant: 3 subdominios testeados
- [ ] Envío SMS real: ✅
- [ ] Envío Email real: ✅
- [ ] Generación IA: ✅
- [ ] Registro de compra: ✅
- [ ] Canje de promoción: ✅

### Seguridad:
- [ ] JWT_SECRET diferente al de desarrollo
- [ ] API Keys en variables de entorno (no en código)
- [ ] HTTPS forzado en todos los dominios
- [ ] CORS configurado restrictivamente
- [ ] Rate limiting configurado
- [ ] Logs monitoreados

### Monitoreo:
- [ ] Logs de Railway configurados
- [ ] Logs de Vercel configurados
- [ ] Alertas de Supabase activas
- [ ] Uptime monitoring (UptimeRobot gratuito)

---

## 🎯 Orden Recomendado de Deployment

### Día 1: Infraestructura Base
1. ✅ Upgrade Supabase a plan Pro
2. ✅ Aplicar todas las migraciones
3. ✅ Deploy backend en Railway
4. ✅ Verificar health check
5. ✅ Configurar DNS para `api.qronnect.es`

### Día 2: Frontend
1. ✅ Deploy frontend en Vercel
2. ✅ Configurar dominios en Vercel
3. ✅ Configurar DNS (A, CNAMEs, wildcard)
4. ✅ Esperar propagación DNS (30 min - 48h)
5. ✅ Verificar SSL automático

### Día 3: Servicios Externos
1. ✅ Upgrade Twilio a cuenta de pago
2. ✅ Configurar Sender ID
3. ✅ Actualizar código (usarSenderId = true)
4. ✅ Redeploy backend
5. ✅ Test completo de SMS

### Día 4: Testing Completo
1. ✅ Test de cada funcionalidad
2. ✅ Test en múltiples subdominios
3. ✅ Test de envíos reales
4. ✅ Verificar logs y errores

### Día 5: Go Live
1. ✅ Anuncio oficial
2. ✅ Monitoreo activo
3. ✅ Soporte para primeros usuarios

---

## 🆘 Troubleshooting Común

### Problema 1: "DNS_PROBE_FINISHED_NXDOMAIN"
**Solución:** DNS no propagado. Esperar 24-48h o verificar configuración DNS.

### Problema 2: "Mixed Content" (HTTP/HTTPS)
**Solución:** Asegurar que todas las URLs usen HTTPS en producción.

### Problema 3: CORS errors
**Solución:** Verificar configuración CORS en backend incluya wildcards.

### Problema 4: 502 Bad Gateway en API
**Solución:** Backend no está respondiendo. Revisar logs de Railway.

### Problema 5: Wildcard no funciona
**Solución:**
- Verificar CNAME `*` en DNS
- Verificar configuración en Vercel
- Limpiar cache de navegador

### Problema 6: SMS no envía en producción
**Solución:**
- Verificar cuenta Twilio no sea trial
- Verificar crédito disponible
- Verificar variables de entorno
- Revisar logs de Railway

---

## 📞 Soporte

### Railway:
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

### Vercel:
- Docs: https://vercel.com/docs
- Support: support@vercel.com

### Supabase:
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

---

## 🎉 ¡Listo!

Una vez completados todos estos pasos, tu aplicación estará **LIVE** en:

```
🌐 Landing:        https://qronnect.es
🔐 SuperAdmin:     https://app.qronnect.es
🏪 Tienda ejemplo: https://lokeyokiera.qronnect.es
⚙️  API:           https://api.qronnect.es
```

**¡Felicidades! 🚀 Tu SaaS multi-tenant está en producción.**

---

**Última actualización:** 16 de Noviembre de 2025
**Tiempo estimado total de deployment:** 2-3 días
**Nivel de dificultad:** Intermedio
