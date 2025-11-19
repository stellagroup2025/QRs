# 🚀 Qronnect - Deployment a Producción

**Sistema de Fidelización Multi-Tenant con QR**
**Ready for Production** ✅

---

## 📋 Índice Rápido

- [Guías Disponibles](#-guías-disponibles)
- [Quick Start (15 min)](#-quick-start)
- [Arquitectura](#-arquitectura)
- [Costes](#-costes)
- [FAQs](#-faqs)

---

## 📚 Guías Disponibles

He preparado 3 guías según tu nivel de experiencia:

### 1. **QUICK_DEPLOY.md** - Para los impacientes ⚡
**Tiempo:** 15 minutos
**Nivel:** Básico
**Contenido:** Los comandos esenciales para deployar rápido

```bash
cat QUICK_DEPLOY.md
```

### 2. **GUIA_DEPLOYMENT_VERCEL.md** - Guía completa 📖
**Tiempo:** 30-45 minutos
**Nivel:** Intermedio
**Contenido:** Paso a paso detallado, troubleshooting, configuraciones avanzadas

```bash
cat GUIA_DEPLOYMENT_VERCEL.md
```

### 3. **CHECKLIST_DEPLOYMENT.md** - Checklist interactivo ✅
**Tiempo:** Variable
**Nivel:** Todos
**Contenido:** Lista de tareas para marcar durante el deployment

```bash
cat CHECKLIST_DEPLOYMENT.md
```

---

## ⚡ Quick Start

### Requisitos Previos

1. **Cuentas necesarias:**
   - [x] Vercel (https://vercel.com)
   - [x] Railway (https://railway.app) o Render
   - [x] Supabase (ya tienes)
   - [x] Twilio (cuenta verificada, no trial)
   - [x] Resend (dominio verificado)
   - [x] Google Cloud (API Key Gemini)

2. **CLIs instalados (opcional):**
   ```bash
   npm install -g vercel
   npm install -g @railway/cli
   ```

### Deployment en 3 Pasos

#### 1️⃣ Backend a Railway (10 min)

```bash
cd backend
railway login
railway init
# Configurar variables en Dashboard (ver lista abajo)
railway up
```

**Variables de entorno críticas:**
```bash
SUPABASE_URL=https://[tu-proyecto].supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SMS_ACCOUNT_SID=AC...
SMS_AUTH_TOKEN=...
SMS_FROM_NUMBER=+34666123456
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@tudominio.com
GEMINI_API_KEY=AIzaSy...
FRONTEND_URL=https://[tu-dominio].vercel.app
NODE_ENV=production
PORT=3001
```

#### 2️⃣ Frontend a Vercel (10 min)

```bash
cd frontend
vercel login
# Configurar variable en Vercel Dashboard:
# NEXT_PUBLIC_API_URL = https://[tu-backend].up.railway.app
vercel --prod
```

#### 3️⃣ Test (5 min)

```bash
# Health check backend
curl https://[tu-backend].up.railway.app/health

# Abrir frontend
open https://[tu-frontend].vercel.app

# Test completo
# - Registrar cliente
# - Enviar email
# - Enviar SMS
```

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────┐
│         USUARIOS (Navegadores)                   │
│  lokeyokiera.qronnect.com                       │
│  stylecut.qronnect.com                          │
│  cualquier-tenant.qronnect.com                  │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│         FRONTEND (Vercel)                        │
│  Next.js 15 + App Router                       │
│  - Multi-tenant por subdominio                  │
│  - SSL automático                               │
│  - CDN global                                   │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTPS/REST API
                 ↓
┌─────────────────────────────────────────────────┐
│         BACKEND (Railway)                        │
│  NestJS + TypeScript                            │
│  - API REST                                     │
│  - JWT Auth                                     │
│  - Tenant isolation                             │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│         DATABASE (Supabase)                      │
│  PostgreSQL + RLS                               │
│  - 17 tablas                                    │
│  - Row Level Security                           │
│  - Backups automáticos                          │
└─────────────────────────────────────────────────┘
```

---

## 💰 Costes

### Infraestructura Base

| Servicio | Plan | Coste Mensual |
|----------|------|---------------|
| **Vercel** | Hobby | $0 |
| **Vercel** | Pro (wildcard domains) | $20 |
| **Railway** | Hobby | $5 |
| **Supabase** | Pro | $25 |
| **Dominio** | .com/.es | ~$1/mes |

**Total:** $30-50/mes

### Pay-as-you-go

| Servicio | Coste Unitario | 100 ops | 1000 ops |
|----------|----------------|---------|----------|
| **Twilio SMS** | €0.075/SMS | €7.50 | €75 |
| **Resend Email** | Free hasta 3k/mes | €0 | €0 |
| **Google Gemini** | ~€0.10/1k requests | €0.01 | €0.10 |

**Ejemplo real:**
- 1-5 tiendas, 500 clientes, 200 SMS/mes, 1000 emails/mes
- **Coste estimado:** €50-80/mes

---

## 🛠️ Archivos de Configuración Creados

Todos listos para usar:

### Backend
- ✅ `backend/Procfile` - Railway/Heroku config
- ✅ `backend/railway.json` - Railway specific
- ✅ `backend/render.yaml` - Render specific
- ✅ `backend/.env.production` - Template de variables
- ✅ `backend/src/main.ts` - CORS mejorado
- ✅ `backend/src/app.controller.ts` - Health check

### Frontend
- ✅ `frontend/vercel.json` - Vercel config
- ✅ `frontend/.env.production` - Template de variables
- ✅ `frontend/next.config.mjs` - Optimizado para producción

### Scripts
- ✅ `scripts/deploy.sh` - Deployment automatizado
- ✅ `.gitignore` - Actualizado

---

## ❓ FAQs

### ¿Cómo funciona el multi-dominio?

Vercel soporta wildcard domains (`*.qronnect.com`):
- Configuras una vez
- TODOS los subdominios funcionan automáticamente
- SSL automático para cada uno
- Tu app detecta el subdominio y carga el tenant correcto

### ¿Necesito un servidor propio?

No. Todo es serverless/cloud:
- Frontend: Vercel (edge network global)
- Backend: Railway (auto-scaling)
- Database: Supabase (managed PostgreSQL)

### ¿Qué pasa con los puertos?

En producción no hay "puertos locales":
- Frontend: HTTPS (443) automático
- Backend: HTTPS (443) automático
- Se comunican por HTTP normal como cualquier API

### ¿Puedo usar dominios personalizados para clientes?

Sí. Ejemplo:
- `www.perfumerialokeyokiera.com` → apunta a tu Vercel
- Tu app detecta el dominio y carga ese tenant
- Requiere configuración DNS del cliente

### ¿Cuánto tarda un deployment?

- **Primera vez:** 30-45 min (configuración manual)
- **Deployments posteriores:** 2-5 min (automático con git push)

### ¿Qué pasa si algo falla?

Rollback rápido:
```bash
# Vercel
vercel rollback [deployment-url]

# Railway
railway rollback
```

Además, ambas plataformas mantienen historial de deployments.

---

## 🎯 Próximos Pasos

### Ahora mismo:

1. **Lee la guía apropiada:**
   ```bash
   # Rápido
   cat QUICK_DEPLOY.md

   # Detallado
   cat GUIA_DEPLOYMENT_VERCEL.md
   ```

2. **Verifica el checklist:**
   ```bash
   cat CHECKLIST_DEPLOYMENT.md
   ```

3. **Ejecuta el script de verificación:**
   ```bash
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

### Después del deployment:

1. ✅ Configurar monitoreo (Sentry)
2. ✅ Configurar alertas de errores
3. ✅ Optimizar performance (Lighthouse)
4. ✅ Configurar backups automáticos
5. ✅ Preparar documentación para clientes

---

## 📊 Estado del Proyecto

### Completitud: 100% ✅

- ✅ Backend: Funcional y testeado
- ✅ Frontend: Funcional y testeado
- ✅ Database: Migraciones completas
- ✅ Multi-tenant: Implementado y verificado
- ✅ Integraciones: Email, SMS, IA funcionando
- ✅ Documentación: Completa
- ✅ Archivos de config: Listos

### Tests Realizados:

- ✅ Registro y login de clientes
- ✅ Escaneo de QR y suma de puntos
- ✅ Envío de emails (Resend) ✉️
- ✅ Envío de SMS (Twilio) 📱
- ✅ Generación con IA (Gemini) 🤖
- ✅ Multi-tenant isolation
- ✅ Campañas email/SMS
- ✅ Sistema de referidos

---

## 🆘 Soporte

### Documentos de referencia:

1. `RESUMEN_TECNICO.md` - Stack y métricas
2. `ESTADO_PROYECTO_2025-11-16.md` - Funcionalidades completas
3. `RESUMEN_DEPLOYMENT.md` - Resumen ejecutivo
4. `ARQUITECTURA_PRODUCCION.md` - Diagramas detallados
5. `GUIA_DEPLOYMENT_PRODUCCION.md` - Guía original completa

### Recursos externos:

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Si encuentras problemas:

1. Revisa logs (Railway/Vercel dashboards)
2. Consulta sección Troubleshooting en `GUIA_DEPLOYMENT_VERCEL.md`
3. Verifica variables de entorno
4. Test con curl/Postman

---

## 🎉 Conclusión

Tu aplicación Qronnect está **100% lista para producción**.

**Tiempo estimado hasta estar live:** 30-45 minutos

**Lo que tienes:**
- ✅ Código production-ready
- ✅ Integraciones funcionando
- ✅ Documentación completa
- ✅ Scripts de deployment
- ✅ Archivos de configuración
- ✅ Troubleshooting guides

**Siguiente paso:** Ejecutar `./scripts/deploy.sh` o seguir `QUICK_DEPLOY.md`

---

**¡Buena suerte con el deployment! 🚀**

**Preparado por:** Claude Code
**Fecha:** 19 de Noviembre de 2025
**Versión:** 1.0.0
