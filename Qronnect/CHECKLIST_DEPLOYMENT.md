# ✅ Checklist de Deployment - Qronnect

## Pre-Deployment

### Base de Datos (Supabase)

- [ ] Crear proyecto de producción en Supabase
- [ ] Aplicar todas las migraciones SQL (en orden)
- [ ] Verificar que RLS esté activo en todas las tablas
- [ ] Crear al menos una tienda de prueba
- [ ] Obtener credenciales (URL, anon_key, service_role_key)
- [ ] Configurar backup automático (Settings → Database → Backup)

### Backend

- [ ] Revisar y corregir errores de TypeScript
- [ ] Verificar que `npm run build` funciona sin errores
- [ ] Crear cuenta en Railway o Render
- [ ] Configurar variables de entorno en la plataforma
- [ ] Verificar credenciales de Twilio (cuenta real, no trial)
- [ ] Verificar dominio en Resend
- [ ] Obtener API Key de Google Gemini

### Frontend

- [ ] Revisar y corregir errores de TypeScript
- [ ] Verificar que `npm run build` funciona sin errores
- [ ] Crear cuenta en Vercel (si no tienes)
- [ ] Preparar dominios (si usarás personalizados)
- [ ] Actualizar `NEXT_PUBLIC_API_URL` con la URL del backend

---

## Deployment Backend

### Railway

- [ ] `railway login`
- [ ] `railway init` (crear proyecto)
- [ ] Configurar todas las variables de entorno
- [ ] `railway up` (deploy)
- [ ] Verificar logs: `railway logs`
- [ ] Test health check: `curl https://[tu-app].up.railway.app/health`

### Render (alternativa)

- [ ] New → Web Service
- [ ] Conectar repo de GitHub
- [ ] Configurar root directory: `backend`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm run start:prod`
- [ ] Configurar variables de entorno
- [ ] Deploy

---

## Deployment Frontend

### Vercel

- [ ] `vercel login`
- [ ] `cd frontend`
- [ ] Configurar `NEXT_PUBLIC_API_URL` en Vercel Dashboard
- [ ] `vercel` (deploy preview)
- [ ] Verificar que funciona correctamente
- [ ] `vercel --prod` (deploy producción)

### Vercel Dashboard (alternativa)

- [ ] Import Git Repository
- [ ] Seleccionar repo
- [ ] Framework: Next.js
- [ ] Root directory: `frontend`
- [ ] Configurar variable: `NEXT_PUBLIC_API_URL`
- [ ] Deploy

---

## Configuración de Dominios

### DNS

- [ ] Configurar registros A/CNAME para frontend
- [ ] Configurar registro CNAME para backend (api.tudominio.com)
- [ ] Configurar registros TXT para Resend (email)
- [ ] Esperar propagación DNS (15-60 min)

### Vercel

- [ ] Settings → Domains
- [ ] Add domain: `www.tudominio.com`
- [ ] Verificar SSL (automático)

### Railway/Render

- [ ] Settings → Custom Domain
- [ ] Add domain: `api.tudominio.com`
- [ ] Verificar SSL

---

## Testing Post-Deployment

### Backend

- [ ] Health check: `curl https://api.tudominio.com/health`
- [ ] Swagger docs: `https://api.tudominio.com/api/docs`
- [ ] Test endpoint: `GET /api/tiendas/by-domain/[slug]`
- [ ] Test autenticación admin

### Frontend

- [ ] Cargar página principal
- [ ] Registrar nuevo cliente
- [ ] Verificar email de código
- [ ] Login cliente
- [ ] Escanear QR (si es posible)
- [ ] Login admin
- [ ] Crear promoción
- [ ] Enviar campaña email
- [ ] Enviar campaña SMS

### Integraciones

- [ ] Test envío de email real (Resend)
- [ ] Test envío de SMS real (Twilio)
- [ ] Test generación con IA (Gemini)
- [ ] Verificar logs en cada plataforma

---

## Monitoreo y Seguridad

### Configuración

- [ ] Configurar alertas en Railway/Render (email cuando hay errores)
- [ ] Habilitar Vercel Analytics
- [ ] Configurar Sentry (opcional pero recomendado)
- [ ] Configurar backups automáticos en Supabase

### Verificación

- [ ] Revisar logs de backend
- [ ] Revisar logs de frontend (Vercel)
- [ ] Verificar métricas de base de datos
- [ ] Verificar costes estimados

---

## Post-Deployment

### Documentación

- [ ] Documentar URLs de producción
- [ ] Documentar credenciales (en lugar seguro)
- [ ] Actualizar README con instrucciones
- [ ] Crear guía de usuario para clientes

### Optimizaciones

- [ ] Configurar CDN (Cloudflare)
- [ ] Optimizar imágenes
- [ ] Revisar performance con Lighthouse
- [ ] Configurar rate limiting adicional

### Marketing

- [ ] Preparar landing page
- [ ] Configurar Google Analytics
- [ ] Configurar Meta Pixel (opcional)
- [ ] Preparar material promocional

---

## Troubleshooting Common Issues

### Error: CORS

**Solución:** Verificar que el dominio del frontend esté en la lista de CORS del backend

### Error: Tenant not found

**Solución:** Verificar que la tienda exista en la tabla `tiendas` con el dominio correcto

### SMS no se envían

**Solución:**
- Verificar que Twilio no esté en modo trial
- Verificar formato de número (+34...)
- Revisar logs de backend

### Emails no llegan

**Solución:**
- Verificar dominio en Resend
- Revisar carpeta spam
- Verificar logs de Resend Dashboard

---

## Rollback Plan

Si algo falla:

### Backend
```bash
# Railway
railway rollback

# Render
# Dashboard → Manual Deploy → Select previous deployment
```

### Frontend
```bash
# Vercel
vercel rollback [deployment-url]

# O en Vercel Dashboard
# Deployments → Previous deployment → Promote to Production
```

### Base de Datos
```bash
# Restore desde backup de Supabase
# Dashboard → Database → Backups → Restore
```

---

## Contactos de Emergencia

- **Supabase Support:** support@supabase.io
- **Vercel Support:** https://vercel.com/help
- **Railway Support:** https://railway.app/help
- **Twilio Support:** https://www.twilio.com/help
- **Resend Support:** support@resend.com

---

**Fecha:** 19 de Noviembre de 2025
**Versión:** 1.0
