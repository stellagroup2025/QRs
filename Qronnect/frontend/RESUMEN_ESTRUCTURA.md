# RESUMEN EJECUTIVO - Estructura de Qronnect

## Visión General

**Qronnect** es una plataforma SaaS completa para **programas de fidelización con QR** en tiendas físicas. 
El frontend es una aplicación **Next.js 15 moderna, escalable y multitenancy** que soporta tres flujos principales:

1. **Cliente Final**: Obtener QR, acumular puntos, canjear recompensas
2. **Personal de Tienda**: Panel admin, escaneo QR, registro de compras, promociones
3. **SuperAdmin**: Gestionar múltiples tiendas, reportes globales

---

## Stack Tecnológico Clave

```
Frontend: Next.js 15 + React 18 + TypeScript 5
Styling: Tailwind CSS v4 + shadcn/ui (Radix UI)
State: Zustand + React Context
Forms: React Hook Form + Zod
QR: html5-qrcode + qrcode.react
Animaciones: Framer Motion
Backend: NestJS + Supabase (PostgreSQL)
Hosting: Vercel (Frontend), Railway/Render (Backend)
```

---

## Estructura de Carpetas (Resumen)

```
frontend/
├── app/              → Páginas (Next.js App Router)
│   ├── [slug]/       → Rutas cliente dinámicas
│   ├── admin/        → Panel de administración
│   ├── staff/        → Scanner QR en tienda
│   ├── superadmin/   → Gestión de tiendas
│   ├── api/          → Route handlers
│   └── (legal)/      → Páginas legales
│
├── components/       → Componentes React reutilizables
│   ├── ui/           → shadcn/ui components (botones, diálogos, etc.)
│   ├── admin/        → Componentes específicos admin
│   ├── onboarding/   → Wizard de setup
│   └── promos/       → Componentes de promociones
│
├── hooks/            → Custom React hooks (branding, landing, auth, etc.)
├── stores/           → Zustand state management
├── lib/              → Helpers y utilidades
├── config/           → Configuración centralizada (branding, commerce)
├── styles/           → Estilos globales (Tailwind + CSS variables)
├── public/           → Assets estáticos (logos, favicon, imágenes)
│
└── Archivos de config:
    ├── next.config.mjs     → Configuración Next.js
    ├── tailwind.config.js  → Configuración Tailwind
    ├── tsconfig.json       → TypeScript config
    ├── middleware.ts       → Middleware multitenancy
    └── package.json        → Dependencias
```

---

## Páginas Principales (Rutas)

### Landing & Autenticación
- `/` → Landing page (call-to-action)
- `/registro` → Registro de cliente
- `/login` → Login cliente
- `/recuperar` → Recuperar QR

### Cliente (Dinámicas: `/:slug/`)
- `/:slug/c` → Dashboard cliente
- `/:slug/mi-qr` → QR personal
- `/:slug/mi-perfil` → Perfil
- `/:slug/mis-cupones` → Cupones
- `/:slug/mis-canjes` → Canjes
- `/:slug/mis-referidos` → Referidos

### Admin (Personal de Tienda)
- `/admin/login` → Login con PIN
- `/admin/dashboard` → Dashboard principal
- `/admin/onboarding` → Setup guiado (5 pasos)
- `/admin/configuracion/*` → Tienda, Landing, Regalos, IA

### Staff (Escaneo en Tienda)
- `/staff` → Scanner QR + registro de compras

### SuperAdmin (Gestión de Plataforma)
- `/superadmin/login` → Login
- `/superadmin/dashboard` → Dashboard
- `/superadmin/tiendas` → Listar tiendas
- `/superadmin/tiendas/nueva` → Crear tienda
- `/superadmin/tiendas/[id]` → Editar tienda
- `/superadmin/informes` → Reportes globales

---

## Componentes UI Reutilizables

Utiliza **shadcn/ui** (componentes Radix UI personalizados) con Tailwind CSS:

### Categorías
- **Formularios**: Button, Input, Label, Select, Checkbox, Switch, Form
- **Diálogos**: Dialog, AlertDialog, Drawer, Sheet
- **Navegación**: Breadcrumb, Pagination, Tabs, DropdownMenu
- **Datos**: Table, Chart (Recharts), Card, Empty, Pagination
- **Feedback**: Alert, Toaster (Sonner), Badge, Progress
- **Otros**: Accordion, Avatar, Tooltip, Popover, Skeleton, Sidebar

### Sistema de Diseño
- **Variables CSS OKLch** para colores (light/dark mode)
- **Branding dinámico** por tenant (colores, logo, textos)
- **Tipografía**: Google Fonts Geist
- **Border Radius**: 0.625rem
- **Tokens**: Tailwind CSS estándar

---

## Configuración de Marca (Personalización)

### Archivo Clave: `config/appBrand.ts`

```typescript
export const BRAND = {
  palette: {
    primary: "#0ea5e9",        // Color principal
    secondary: "#6366f1",      // Color secundario
    accent: "#22c55e",         // Color de acento
    background: "#ffffff",
    foreground: "#0f172a",
    muted: "#f1f5f9",
    border: "#e5e7eb"
  },
  copy: {
    companyName: "Tu Comercio",
    tagline: "Tarjeta digital de fidelización con QR",
    ctaGetQR: "Obtener mi QR"
  },
  assets: {
    logo: "/LogoQronnect.png",
    favicon: "/icon.svg",
    ogImage: "/opengraph-image.png"
  }
}
```

Este archivo se propaga automáticamente a:
- Layout y metadata
- Botones y componentes
- Meta tags (OG, Twitter)
- Landing page

---

## State Management

### Zustand Stores (`stores/`)
- **useClientes.ts** → Gestión de clientes
- **useFidelizacion.ts** → Datos de puntos/nivel
- **usePromos.ts** → Promociones disponibles
- **useStaffAuth.ts** → Autenticación staff

### Context Providers (`app/layout.tsx`)
1. **BrandingProvider** → Branding dinámico del tenant
2. **BrandProvider** → Configuración de marca
3. **CookieConsentProvider** → Gestión de cookies
4. **ConfirmDialogProvider** → Diálogos de confirmación
5. **CookieBanner** → Banner visible

---

## Arquitectura Multitenancy

### Identificación del Tenant
```
Subdomain:  tienda.qronnect.com  →  slug = "tienda"
URL Path:   /tienda/mi-qr         →  [slug] captures "tienda"
API Header: X-Tenant-Domain: tienda
```

### Datos Aislados
- Cada tienda tiene su propia configuración
- Clientes asociados a tienda específica
- Compras y promociones por tienda
- Branding personalizado por tienda

### Middleware (`middleware.ts`)
- Redirige `/mi-qr` → `/{slug}/mi-qr` en producción
- Extrae slug del subdomain
- Solo aplica a rutas cliente

---

## Características por Rol

### Cliente Final
✓ Registro con email
✓ QR personal único y personalizado
✓ Dashboard con puntos acumulados
✓ Historial de compras
✓ Visualización de promociones activas
✓ Canjes de recompensas
✓ Programa de referidos (invitar amigos)
✓ Validación de email opcional

### Personal de Tienda (Admin)
✓ Login con PIN (seguridad simple)
✓ Dashboard con gráficas (Recharts)
✓ Escáner QR en tiempo real
✓ Registro de compras instantáneo
✓ Gestión de clientes (editar, ver detalles)
✓ Crear y gestionar promociones
✓ Campañas de email a clientes
✓ Herramientas de IA:
  - Análisis de KPIs
  - Generador de promociones
  - Generador de emails para campañas
✓ Onboarding guiado (5 pasos)
✓ Reportes y estadísticas

### SuperAdmin
✓ Gestión de múltiples tiendas
✓ Crear nuevas tiendas
✓ Editar configuración de tiendas
✓ Dashboard consolidado
✓ Reportes globales
✓ Informes por tienda

---

## Flujo de Desarrollo

### Instalación
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### Build
```bash
npm run build
npm run start  # Producción
npm run lint   # ESLint
```

### Variables de Entorno
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## APIs Utilizadas (Backend)

### Endpoints Principales
```
GET    /api/config/branding              → Branding del tenant
POST   /api/auth/login                   → Login cliente
POST   /api/auth/register                → Registro cliente
GET    /api/clientes/                    → Listar clientes
POST   /api/clientes/                    → Crear cliente
GET    /api/compras/                     → Historial de compras
POST   /api/compras/                     → Registrar compra
GET    /api/promociones/                 → Listar promociones
POST   /api/promociones/                 → Crear promoción
GET    /api/qr/generate                  → Generar código QR
POST   /api/qr/register                  → Registrar QR
GET    /api/admin/dashboard              → Dashboard admin
GET    /api/superadmin/tiendas           → Listar tiendas
```

### URL Base
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
```

---

## Seguridad

### Autenticación
- **Clientes**: JWT (Supabase Auth)
- **Staff/Admin**: PIN simple + sesión
- **SuperAdmin**: Credenciales específicas

### Validación
- Zod para esquemas TypeScript
- React Hook Form para formularios
- Validación en cliente y servidor

### Headers de Seguridad
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: origin-when-cross-origin
```

### Row Level Security (RLS)
- Postgres enforces en Supabase
- Datos aislados por tenant

---

## Performance & Optimizaciones

### Image Optimization
- Imágenes de Supabase permitidas
- Remote patterns para CDNs
- `unoptimized: true` solo en desarrollo

### Caching
- Metadata dinámica con fallback
- Cache de branding por tenant
- Form persistence con localStorage

### Analytics
- Vercel Analytics integrado
- Tracking de eventos

---

## Documentación

### Archivos de Referencia en el Proyecto

1. **README.md** → Documentación general
2. **START.md** → Guía de inicio rápido
3. **PERSONALIZACION.md** → Cómo personalizar la aplicación
4. **BRAND_GUIDE.md** → Guía de branding
5. **ARQUITECTURA_PROYECTO.md** → Este documento detallado (nuevo)

### En el Backend
- `backend/README.md` → Documentación general
- `backend/MULTITENANCY.md` → Arquitectura multitenancy
- `backend/API_REFERENCE.md` → Referencia de APIs
- `backend/START.md` → Inicio rápido

---

## Próximos Pasos para Desarrolladores

### Para Entender el Proyecto
1. Lee `README.md` en la raíz
2. Revisa `frontend/ARQUITECTURA_PROYECTO.md` (este archivo)
3. Explora `config/appBrand.ts` para ver cómo funciona el branding
4. Abre `app/page.tsx` para ver un ejemplo de page completa

### Para Hacer Cambios
1. Personaliza branding en `config/appBrand.ts`
2. Añade nuevas páginas en `app/`
3. Crea componentes en `components/`
4. Usa hooks en `hooks/` para lógica compartida
5. Añade estado en `stores/` si lo necesitas

### Para Deployar
1. Backend: Railway o Render
2. Frontend: Vercel (automático)
3. Base de datos: Supabase PostgreSQL
4. Dominio: Configurar subdomains (ej: tienda.qronnect.com)

---

## Resumen Técnico

```
TIPO DE APLICACIÓN:      SaaS Multitenancy
FRAMEWORK:               Next.js 15 (App Router)
LENGUAJE:                TypeScript 5
UI LIBRARY:              React 18 + shadcn/ui
STYLING:                 Tailwind CSS v4
STATE MANAGEMENT:        Zustand + React Context
FORMS:                   React Hook Form + Zod
AUTENTICACIÓN:           Supabase Auth + PIN
BASE DE DATOS:           PostgreSQL (Supabase)
API:                     REST (NestJS backend)
HOSTING:                 Vercel (frontend)
ANIMACIONES:             Framer Motion
QR:                      html5-qrcode + qrcode.react
GRÁFICAS:                Recharts
NOTIFICACIONES:          Sonner (toast)
```

---

## Convenciones del Proyecto

- **Archivos de página**: `page.tsx` (App Router)
- **Componentes**: PascalCase, ubicados en `components/`
- **Hooks**: camelCase con prefijo `use-`
- **Stores**: `use<NombreStore>.ts`
- **Estilos**: Tailwind CSS (no CSS modules)
- **TypeScript**: Strict mode habilitado
- **Imports**: Alias `@/` para imports absolutos
- **Path alias**: `@/*` → raíz del proyecto

---

## Estructura del Proyecto en Contexto

```
Qronnect (Monorepo)
├── backend/          NestJS + Supabase (3000)
├── frontend/         Next.js 15 (3000/Vercel) ← TÚ ESTÁS AQUÍ
└── scripts/          Utilidades
```

El frontend consume APIs del backend en `http://localhost:3001` (desarrollo) 
o en la URL producción del backend.

---

PARA EXPLORAR MAS:
- Abre `frontend/ARQUITECTURA_PROYECTO.md` para detalles completos
- Revisa `app/page.tsx` para ver estructura de una página real
- Mira `config/appBrand.ts` para entender branding dinámico
- Explora `components/ui/` para ver todos los componentes disponibles

