# 🏗️ Arquitectura de Producción - Qronnect
**Dominio:** qronnect.es
**Fecha:** 16 de Noviembre de 2025

---

## 📐 Diagrama de Arquitectura Completa

```
                           ┌──────────────────────────────────────┐
                           │         INTERNET / USUARIOS          │
                           │                                      │
                           │  Browser, Móviles, Apps              │
                           └──────────────┬───────────────────────┘
                                          │
                                          │ HTTPS
                                          ↓
                    ┌─────────────────────────────────────────────┐
                    │         CLOUDFLARE (CDN + DNS)              │
                    │  - DNS Management                           │
                    │  - SSL/TLS Certificates                     │
                    │  - DDoS Protection                          │
                    │  - Global CDN                               │
                    └───────────┬──────────────────┬──────────────┘
                                │                  │
                ┌───────────────┘                  └──────────────┐
                │                                                  │
                ↓                                                  ↓
    ┌───────────────────────────┐                  ┌──────────────────────────┐
    │   FRONTEND (VERCEL)       │                  │   BACKEND (RAILWAY)      │
    │                           │                  │                          │
    │  Multi-Dominio:           │                  │  api.qronnect.es        │
    │  ┌─────────────────────┐  │                  │                          │
    │  │ qronnect.es         │  │◄─────────────────┤  NestJS + TypeScript     │
    │  │ (Landing)           │  │   API Calls      │                          │
    │  └─────────────────────┘  │   (HTTPS/REST)   │  Puerto: 443 (HTTPS)     │
    │  ┌─────────────────────┐  │                  │                          │
    │  │ app.qronnect.es     │  │                  │  Módulos:                │
    │  │ (SuperAdmin)        │  │                  │  - Auth                  │
    │  └─────────────────────┘  │                  │  - Clientes              │
    │  ┌─────────────────────┐  │                  │  - Campañas              │
    │  │ *.qronnect.es       │  │                  │  - SMS                   │
    │  │ (Tenants)           │  │                  │  - Promociones           │
    │  │                     │  │                  │  - IA                    │
    │  │ lokeyokiera...      │  │                  │  - Referidos             │
    │  │ stylecut...         │  │                  └──────────┬───────────────┘
    │  │ burgerco...         │  │                             │
    │  │ [cualquier].es      │  │                             │
    │  └─────────────────────┘  │                             │
    │                           │                             │
    │  Next.js 14 (App Router)  │                             │
    │  React + TypeScript       │                             │
    │  TailwindCSS + Radix UI   │                             │
    │                           │                             │
    │  Features:                │                             │
    │  - Server Components      │                             │
    │  - Edge Functions         │                             │
    │  - ISR (Revalidación)     │                             │
    │  - Optimización imgs      │                             │
    └───────────────────────────┘                             │
                                                              │
                                          ┌───────────────────┴────────────────┐
                                          │                                    │
                                          ↓                                    ↓
                            ┌──────────────────────────┐        ┌─────────────────────────┐
                            │  SUPABASE (PostgreSQL)   │        │  SERVICIOS EXTERNOS     │
                            │                          │        │                         │
                            │  Database (8GB SSD)      │        │  ┌──────────────────┐   │
                            │  - 17 Tablas             │        │  │ TWILIO (SMS)     │   │
                            │  - RLS Habilitado        │        │  │ - Envío SMS      │   │
                            │  - Row Level Security    │        │  │ - Sender ID      │   │
                            │  - Triggers & Functions  │        │  │ - Verificación   │   │
                            │  - Índices optimizados   │        │  └──────────────────┘   │
                            │                          │        │                         │
                            │  Auth (JWT)              │        │  ┌──────────────────┐   │
                            │  - Gestión de tokens     │        │  │ RESEND (EMAIL)   │   │
                            │  - Refresh tokens        │        │  │ - Campañas email │   │
                            │                          │        │  │ - Transaccional  │   │
                            │  Storage (Opcional)      │        │  │ - Templates      │   │
                            │  - Imágenes/Logos        │        │  └──────────────────┘   │
                            │  - QR codes              │        │                         │
                            │                          │        │  ┌──────────────────┐   │
                            │  Backups Automáticos     │        │  │ GOOGLE GEMINI    │   │
                            │  - Diarios               │        │  │ - IA Generativa  │   │
                            │  - Retención: 7 días     │        │  │ - Análisis datos │   │
                            │                          │        │  │ - Contenido      │   │
                            │  Connection Pooling      │        │  └──────────────────┘   │
                            │  - Max 100 conexiones    │        │                         │
                            └──────────────────────────┘        └─────────────────────────┘
```

---

## 🌐 Flujo de Resolución Multi-Tenant

```
Usuario visita: lokeyokiera.qronnect.es
         │
         ↓
    ┌────────────────────────────────────────┐
    │  1. DNS (Cloudflare)                   │
    │     *.qronnect.es → CNAME Vercel       │
    └────────────┬───────────────────────────┘
                 ↓
    ┌────────────────────────────────────────┐
    │  2. Vercel (Frontend)                  │
    │     - Captura subdominio               │
    │     - Extrae "lokeyokiera"             │
    │     - Renderiza app Next.js            │
    └────────────┬───────────────────────────┘
                 ↓
    ┌────────────────────────────────────────┐
    │  3. Cliente hace API call              │
    │     fetch('/api/clientes')             │
    │     → https://api.qronnect.es/api...   │
    │     + Header: X-Tenant-Domain          │
    └────────────┬───────────────────────────┘
                 ↓
    ┌────────────────────────────────────────┐
    │  4. Backend (Railway)                  │
    │     - TenantMiddleware intercepta      │
    │     - Lee X-Tenant-Domain header       │
    │     - Busca tenant en DB               │
    │     - Inyecta tenantId en request      │
    └────────────┬───────────────────────────┘
                 ↓
    ┌────────────────────────────────────────┐
    │  5. Supabase (PostgreSQL)              │
    │     - RLS verifica tenant_id           │
    │     - Retorna solo datos del tenant    │
    │     - Aislamiento completo             │
    └────────────┬───────────────────────────┘
                 ↓
    ┌────────────────────────────────────────┐
    │  6. Response al cliente                │
    │     - Datos de "lokeyokiera"           │
    │     - Branding personalizado           │
    │     - Configuración específica         │
    └────────────────────────────────────────┘
```

---

## 🔐 Flujo de Autenticación

```
                    ┌──────────────────────────────────┐
                    │  USUARIO (Cliente/Admin)         │
                    └────────────┬─────────────────────┘
                                 │
                                 │ 1. Solicita login
                                 ↓
                    ┌────────────────────────────────────┐
                    │  FRONTEND (Vercel)                 │
                    │  - Form de login                   │
                    │  - Email + PIN (Admin)             │
                    │  - Email + Code (Cliente)          │
                    └────────────┬───────────────────────┘
                                 │
                                 │ 2. POST /api/auth/login
                                 │    + X-Tenant-Domain
                                 ↓
                    ┌────────────────────────────────────┐
                    │  BACKEND (Railway)                 │
                    │                                    │
                    │  AuthController:                   │
                    │  - Verifica tenant                 │
                    │  - Valida credenciales             │
                    │  - Genera JWT token                │
                    └────────────┬───────────────────────┘
                                 │
                                 │ 3. Query usuario
                                 ↓
                    ┌────────────────────────────────────┐
                    │  SUPABASE                          │
                    │  - Busca usuario en tenant         │
                    │  - Verifica hash de PIN            │
                    │  - Retorna datos del usuario       │
                    └────────────┬───────────────────────┘
                                 │
                                 │ 4. Usuario encontrado
                                 ↓
                    ┌────────────────────────────────────┐
                    │  BACKEND (Railway)                 │
                    │  - Crea JWT con payload:           │
                    │    {                               │
                    │      sub: userId,                  │
                    │      tienda_id: tenantId,          │
                    │      email: user.email,            │
                    │      role: user.role,              │
                    │      exp: timestamp + 24h          │
                    │    }                               │
                    └────────────┬───────────────────────┘
                                 │
                                 │ 5. Response con token
                                 ↓
                    ┌────────────────────────────────────┐
                    │  FRONTEND (Vercel)                 │
                    │  - Guarda token en localStorage    │
                    │  - Redirige a dashboard            │
                    └────────────┬───────────────────────┘
                                 │
                                 │ 6. Requests siguientes
                                 │    Authorization: Bearer <token>
                                 ↓
                    ┌────────────────────────────────────┐
                    │  BACKEND (Railway)                 │
                    │  - AuthGuard verifica JWT          │
                    │  - Extrae tenantId del token       │
                    │  - Valida expiración               │
                    │  - Permite acceso a recursos       │
                    └────────────────────────────────────┘
```

---

## 📨 Flujo de Envío de Campaña SMS

```
    ┌──────────────────────────────────────┐
    │  ADMIN crea campaña SMS              │
    │  - Mensaje                           │
    │  - Destinatarios                     │
    │  - Estado: "borrador"                │
    └────────────┬─────────────────────────┘
                 │
                 │ 1. POST /api/campanas-sms
                 ↓
    ┌────────────────────────────────────────┐
    │  BACKEND - CampanasSmsController       │
    │  - Crea registro en DB                 │
    │  - Crea destinatarios                  │
    │  - Calcula coste estimado              │
    └────────────┬───────────────────────────┘
                 │
                 │ 2. Campaña guardada
                 ↓
    ┌────────────────────────────────────────┐
    │  ADMIN cambia estado a "enviada"       │
    │  PATCH /api/campanas-sms/:id           │
    │  { estado: "enviada" }                 │
    └────────────┬───────────────────────────┘
                 │
                 │ 3. PATCH detectado
                 ↓
    ┌────────────────────────────────────────┐
    │  BACKEND - CampanasSmsService          │
    │  - Detecta cambio a "enviada"          │
    │  - Llama enviarCampana()               │
    │  - Carga destinatarios                 │
    └────────────┬───────────────────────────┘
                 │
                 │ 4. Para cada destinatario
                 ↓
    ┌────────────────────────────────────────┐
    │  BACKEND - Loop destinatarios          │
    │  ┌──────────────────────────────────┐  │
    │  │ Destinatario 1:                  │  │
    │  │ - Cliente: "Omar"                │  │
    │  │ - Teléfono: +34630000356         │  │
    │  │ - Mensaje: "Hola {{nombre}}..."  │  │
    │  └────────────┬─────────────────────┘  │
    │               │                         │
    │               │ Reemplazar variables    │
    │               ↓                         │
    │  ┌──────────────────────────────────┐  │
    │  │ Mensaje final:                   │  │
    │  │ "Perfumeria Lokeyokiera:         │  │
    │  │  Hola Omar! Tenemos oferta..."   │  │
    │  └────────────┬─────────────────────┘  │
    └───────────────┼─────────────────────────┘
                    │
                    │ 5. Llamada a SmsService
                    ↓
    ┌────────────────────────────────────────┐
    │  BACKEND - SmsService                  │
    │  - Obtiene config de tienda            │
    │  - Determina modo (global/propio)      │
    │  - Usa número de teléfono (trial)      │
    │  - Añade prefijo con nombre tienda     │
    └────────────┬───────────────────────────┘
                 │
                 │ 6. API Call a Twilio
                 ↓
    ┌────────────────────────────────────────┐
    │  TWILIO API                            │
    │  - Recibe solicitud                    │
    │  - Valida crédito disponible           │
    │  - Envía SMS                           │
    │  - Retorna SID y status                │
    └────────────┬───────────────────────────┘
                 │
                 │ 7. SMS enviado
                 ↓
    ┌────────────────────────────────────────┐
    │  BACKEND - SmsService                  │
    │  - Registra envío en sms_enviados      │
    │  - Actualiza contador en campaña       │
    │  - Calcula coste real                  │
    └────────────┬───────────────────────────┘
                 │
                 │ 8. Update campaña
                 ↓
    ┌────────────────────────────────────────┐
    │  SUPABASE - campanas_sms               │
    │  UPDATE SET                            │
    │    enviados = enviados + 1,            │
    │    costo_real = costo_real + 0.075,    │
    │    fecha_enviada = NOW()               │
    └────────────┬───────────────────────────┘
                 │
                 │ 9. Response final
                 ↓
    ┌────────────────────────────────────────┐
    │  ADMIN ve resultado                    │
    │  ✅ Enviados: 1                        │
    │  ❌ Fallidos: 0                        │
    │  💰 Coste: 0.075€                      │
    └────────────────────────────────────────┘
```

---

## 💾 Estructura de Base de Datos

```
SUPABASE (PostgreSQL)
│
├── 🏢 TENANTS
│   └── tiendas
│       ├── id (PK)
│       ├── slug (unique)
│       ├── nombre
│       ├── configuracion (JSONB)
│       │   ├── branding
│       │   ├── sms
│       │   └── ia
│       └── timestamps
│
├── 👥 USUARIOS
│   ├── clientes
│   │   ├── id (PK)
│   │   ├── id_tienda (FK → tiendas) 🔒 RLS
│   │   ├── nombre
│   │   ├── email
│   │   ├── telefono
│   │   ├── puntos_totales
│   │   ├── codigo_referido_personal
│   │   └── timestamps
│   │
│   └── usuarios_tienda (Staff)
│       ├── id (PK)
│       ├── id_tienda (FK → tiendas) 🔒 RLS
│       ├── email
│       ├── pin_hash
│       ├── rol (admin/manager/staff)
│       └── timestamps
│
├── 💳 TRANSACCIONES
│   ├── compras
│   │   ├── id (PK)
│   │   ├── id_tienda (FK) 🔒 RLS
│   │   ├── id_cliente (FK)
│   │   ├── importe_total
│   │   ├── puntos_otorgados
│   │   └── timestamps
│   │
│   └── productos_comprados
│       ├── id (PK)
│       ├── id_compra (FK)
│       ├── nombre_producto
│       ├── cantidad
│       └── precio_unitario
│
├── 🎁 FIDELIZACIÓN
│   ├── promociones
│   │   ├── id (PK)
│   │   ├── id_tienda (FK) 🔒 RLS
│   │   ├── titulo
│   │   ├── tipo
│   │   ├── puntos_requeridos
│   │   ├── valor_descuento
│   │   └── timestamps
│   │
│   ├── canjes
│   │   ├── id (PK)
│   │   ├── id_tienda (FK) 🔒 RLS
│   │   ├── id_cliente (FK)
│   │   ├── id_promocion (FK)
│   │   ├── codigo_unico
│   │   └── estado
│   │
│   └── puntos_historial
│       ├── id (PK)
│       ├── id_tienda (FK) 🔒 RLS
│       ├── id_cliente (FK)
│       ├── puntos
│       ├── tipo (ganados/canjeados)
│       └── timestamp
│
├── 📧 MARKETING - EMAIL
│   ├── campanas
│   │   ├── id (PK)
│   │   ├── id_tienda (FK) 🔒 RLS
│   │   ├── nombre
│   │   ├── asunto
│   │   ├── contenido_html
│   │   ├── estado
│   │   ├── total_destinatarios
│   │   ├── enviados
│   │   └── timestamps
│   │
│   └── campanas_destinatarios
│       ├── id (PK)
│       ├── id_campana (FK)
│       ├── id_cliente (FK)
│       ├── estado
│       └── fecha_enviado
│
├── 📱 MARKETING - SMS
│   ├── campanas_sms
│   │   ├── id (PK)
│   │   ├── id_tienda (FK) 🔒 RLS
│   │   ├── nombre
│   │   ├── mensaje
│   │   ├── estado
│   │   ├── enviados
│   │   ├── fallidos
│   │   ├── costo_real
│   │   └── timestamps
│   │
│   ├── campanas_sms_destinatarios
│   │   ├── id (PK)
│   │   ├── id_campana (FK)
│   │   ├── id_cliente (FK)
│   │   ├── estado
│   │   └── fecha_enviado
│   │
│   └── sms_enviados
│       ├── id (PK)
│       ├── id_tienda (FK) 🔒 RLS
│       ├── cantidad
│       ├── coste
│       ├── modo (global/propio)
│       └── timestamp
│
├── 🔗 REFERIDOS
│   ├── referidos
│   │   ├── id (PK)
│   │   ├── id_tienda (FK) 🔒 RLS
│   │   ├── id_referidor (FK → clientes)
│   │   ├── id_referido (FK → clientes)
│   │   └── timestamp
│   │
│   └── programas_referidos
│       ├── id (PK)
│       ├── id_tienda (FK) 🔒 RLS
│       ├── puntos_referidor
│       ├── puntos_referido
│       └── activo
│
└── ⚙️ CONFIGURACIÓN
    ├── landing_config
    │   ├── id (PK)
    │   ├── id_tienda (FK) 🔒 RLS
    │   ├── hero_titulo_principal
    │   ├── hero_subtitulo
    │   ├── caracteristicas (JSONB[])
    │   └── timestamps
    │
    └── regalos_bienvenida
        ├── id (PK)
        ├── id_tienda (FK) 🔒 RLS
        ├── id_cliente (FK)
        ├── id_promocion (FK)
        └── timestamp

🔒 RLS = Row Level Security habilitado
   Cada query automáticamente filtra por tenant
```

---

## 📊 Costos Mensuales Estimados

### Infraestructura Base ($30/mes):
```
┌──────────────────────────┬─────────────┬──────────┐
│ Servicio                 │ Plan        │ Costo    │
├──────────────────────────┼─────────────┼──────────┤
│ Vercel (Frontend)        │ Hobby       │ $0       │
│ Railway (Backend)        │ Hobby       │ $5       │
│ Supabase (Database)      │ Pro         │ $25      │
│ Cloudflare (DNS)         │ Free        │ $0       │
├──────────────────────────┼─────────────┼──────────┤
│ SUBTOTAL                 │             │ $30/mes  │
└──────────────────────────┴─────────────┴──────────┘
```

### Servicios Variables (según uso):
```
┌──────────────────────────┬──────────────────────────┐
│ Twilio SMS               │ ~€0.075 por SMS          │
│ 100 SMS/mes              │ = €7.50                  │
│ 500 SMS/mes              │ = €37.50                 │
│ 1000 SMS/mes             │ = €75.00                 │
├──────────────────────────┼──────────────────────────┤
│ Resend Email             │ GRATIS                   │
│ 100 emails/día           │ (3,000/mes incluidos)    │
├──────────────────────────┼──────────────────────────┤
│ Google Gemini IA         │ GRATIS                   │
│ 60 req/min               │ (Plan gratuito)          │
└──────────────────────────┴──────────────────────────┘
```

### Ejemplo Real (Negocio pequeño):
```
$30 (infraestructura)
+$8 (100 SMS/mes)
+$0 (emails)
+$0 (IA)
= $38/mes total
```

### Ejemplo Real (Negocio mediano):
```
$30 (infraestructura)
+$40 (500 SMS/mes)
+$20 (Resend Pro - 50k emails)
+$0 (IA dentro del límite gratuito)
= $90/mes total
```

---

## 🎯 Próximos Pasos

1. **Leer la guía completa:** `GUIA_DEPLOYMENT_PRODUCCION.md`
2. **Ejecutar checklist:** `bash deploy-checklist.sh`
3. **Deploy backend:** Railway o Render
4. **Deploy frontend:** Vercel
5. **Configurar DNS:** En tu registrador de qronnect.es
6. **Testing completo:** Verificar todas las funcionalidades

---

**Fecha:** 16 de Noviembre de 2025
**Estado:** Listo para deployment
