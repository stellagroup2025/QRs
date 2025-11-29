# Estructura y Arquitectura de Qronnect

## 1. Descripción General de la Aplicación

### ¿Qué es Qronnect?
**Qronnect** es un **Sistema SaaS de Fidelización Multitenancy** que permite a tiendas físicas implementar programas de fidelización mediante códigos QR. Es una solución completa que incluye:

- **Aplicación para Clientes**: Registro, obtención de QR personal único, acumulación de puntos, historial de compras, canjes de recompensas
- **Panel de Administración para Tiendas**: Gestión de clientes, escaneo de QR, registro de compras, gestión de promociones, reportes y estadísticas
- **Panel de SuperAdmin**: Gestión de múltiples tiendas en la plataforma

### Arquitectura General
```
Qronnect (Proyecto Monorepo)
├── backend/          # NestJS + Supabase (API REST)
├── frontend/         # Next.js 15 + React 18 (Este directorio)
└── scripts/          # Scripts de utilidad
```

---

## 2. Stack Tecnológico (Frontend)

### Core Framework
- **Next.js 15** - Framework React con App Router
- **React 18.3** - UI Library
- **TypeScript 5** - Type safety

### UI & Styling
- **Tailwind CSS v4.1** - Utility-first CSS framework
- **Tailwind CSS Animate** - Animaciones
- **shadcn/ui** - Componentes accesibles basados en Radix UI
- **Lucide React** - Iconografía
- **Framer Motion 12** - Animaciones complejas
- **CVA (Class Variance Authority)** - Gestión de variantes CSS

### Estado y Formularios
- **Zustand** - State management ligero
- **React Hook Form** - Gestión eficiente de formularios
- **Zod** - Validación de esquemas TypeScript
- **Immer** - Actualizaciones inmutables de estado

### QR & Escaneo
- **qrcode.react** - Generación de códigos QR
- **qrcode** - Librería de QR
- **react-qr-code** - Componente QR alternativo
- **html5-qrcode** - Escaneo de QR desde cámara
- **react-qr-reader** - Lector QR React

### Gráficas & Visualización
- **Recharts 3.4** - Gráficas basadas en React
- **@vercel/analytics** - Analytics

### Notificaciones
- **Sonner 2** - Toast notifications hermosas

### Configuración
- **PostCSS 8** - Procesamiento de CSS
- **Autoprefixer** - Prefijos CSS automáticos

---

## 3. Estructura de Carpetas

```
frontend/
├── app/                       # 📄 Next.js App Router
│   ├── layout.tsx             # Layout raíz con providers
│   ├── page.tsx               # Página de inicio (landing)
│   ├── globals.css            # Estilos globales
│   │
│   ├── (auth)/               # 🔐 Autenticación cliente
│   │   ├── login/page.tsx
│   │   ├── registro/page.tsx
│   │   └── recuperar/page.tsx
│   │
│   ├── [slug]/                # 🛒 Rutas de cliente (dinámicas por tienda)
│   │   ├── c/page.tsx         # Cliente dashboard
│   │   ├── mi-qr/page.tsx     # QR personal del cliente
│   │   ├── mi-perfil/page.tsx # Perfil del cliente
│   │   ├── mis-cupones/page.tsx
│   │   ├── mis-canjes/page.tsx
│   │   └── mis-referidos/page.tsx
│   │
│   ├── admin/                 # 👔 Panel de administración de tienda
│   │   ├── login/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── configuracion/
│   │       ├── tienda/page.tsx
│   │       ├── landing/page.tsx
│   │       ├── regalos/page.tsx
│   │       └── ia/page.tsx
│   │
│   ├── staff/                 # 📱 Panel de escaneo QR en tienda
│   │   └── page.tsx          # Scanner + registro de compras
│   │
│   ├── superadmin/            # 🏢 Panel de superadministrador
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── tiendas/page.tsx
│   │   ├── tiendas/nueva/page.tsx
│   │   ├── tiendas/[id]/page.tsx
│   │   └── informes/page.tsx
│   │
│   ├── api/                   # 🔗 Route handlers Next.js
│   │   ├── account/route.ts
│   │   └── qr/register/route.ts
│   │
│   └── (legal)/              # 📋 Páginas legales
│       ├── terminos/page.tsx
│       ├── privacidad/page.tsx
│       ├── aviso-legal/page.tsx
│       └── politica-cookies/page.tsx
│
├── components/                # 🧩 Componentes React
│   ├── ui/                    # Componentes base (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── breadcrumbs.tsx
│   │   ├── chart.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── empty.tsx
│   │   ├── error-retry.tsx
│   │   ├── field.tsx
│   │   ├── input-otp.tsx
│   │   ├── pagination.tsx
│   │   ├── popover.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── toggle.tsx
│   │   ├── tooltip.tsx
│   │   ├── toaster.tsx
│   │   └── ... (más componentes base)
│   │
│   ├── admin/                 # Componentes específicos del admin
│   │   ├── AnalyticsCharts.tsx
│   │   ├── RegistrarVentaDialog.tsx
│   │   ├── RegistrarVentaDialogMejorado.tsx
│   │   ├── AdminNav.tsx
│   │   ├── campanas/          # Gestión de campañas
│   │   │   ├── CampanasPanel.tsx
│   │   │   ├── CampanasSMSPanel.tsx
│   │   │   ├── CrearCampanaDialog.tsx
│   │   │   └── SegmentacionClientes.tsx
│   │   ├── promociones/       # Gestión de promociones
│   │   │   ├── PromocionesPanel.tsx
│   │   │   ├── PromocionFormDialog.tsx
│   │   │   └── ValidarCanjeDialog.tsx
│   │   └── ia/                # Herramientas de IA
│   │       ├── PanelIA.tsx
│   │       ├── AnalistaKPIs.tsx
│   │       ├── GeneradorPromos.tsx
│   │       └── GeneradorEmailsCampana.tsx
│   │
│   ├── superadmin/            # Componentes del superadmin
│   │   ├── ReportesPanel.tsx
│   │   └── ... (componentes específicos)
│   │
│   ├── staff/                 # Componentes del panel de tienda
│   │   ├── cliente-ficha.tsx
│   │   ├── clientes-tabla.tsx
│   │   ├── compras-tabla.tsx
│   │   └── editar-cliente-dialog.tsx
│   │
│   ├── onboarding/            # Wizard de setup inicial
│   │   ├── OnboardingWizard.tsx
│   │   └── steps/
│   │       ├── Paso1Branding.tsx
│   │       ├── Paso2Puntos.tsx
│   │       ├── Paso3Promocion.tsx
│   │       ├── Paso4Regalo.tsx
│   │       └── Paso5QR.tsx
│   │
│   ├── promos/                # Componentes de promociones
│   │   ├── PromoBanner.tsx
│   │   ├── PromoCard.tsx
│   │   ├── PromoHero.tsx
│   │   └── PromoRail.tsx
│   │
│   ├── BrandingProvider.tsx   # Provider de branding dinámico
│   ├── BrandProvider.tsx      # Provider de configuración de marca
│   ├── BrandLogo.tsx          # Logo dinámico
│   ├── ClientNav.tsx          # Navegación cliente
│   ├── AdminNav.tsx           # Navegación admin
│   ├── CookieBanner.tsx       # Banner de cookies
│   ├── CookieConsentProvider.tsx
│   ├── LandingPreview.tsx     # Preview de landing personalizada
│   ├── RegistroForm.tsx       # Formulario de registro
│   ├── registro-form-v2.tsx   # Versión mejorada
│   ├── get-qr-form.tsx        # Formulario para recuperar QR
│   ├── recuperar-form.tsx
│   ├── mi-qr-card.tsx         # Card del QR personal
│   ├── historial-lista.tsx    # Listado de compras
│   ├── oferta-card.tsx        # Card de oferta
│   ├── progreso-sellos.tsx    # Visualización de progreso
│   ├── TiendaInfoCard.tsx
│   ├── app-shell.tsx          # Shell de la app
│   └── theme-provider.tsx
│
├── hooks/                     # 🪝 Custom React Hooks
│   ├── use-branding.ts        # Hook para acceder a branding
│   ├── use-landing-config.ts  # Hook para configuración landing
│   ├── use-landing.ts         # Hook para landing data
│   ├── use-tenant.ts          # Hook para identificar tenant
│   ├── use-mobile.ts          # Hook para detectar mobile
│   ├── use-toast.ts           # Hook para notificaciones
│   ├── use-form-persistence.ts# Persistencia de formularios
│   ├── use-debounce.ts
│   ├── use-unsaved-changes.ts # Detectar cambios no guardados
│   ├── use-confirm-dialog.tsx # Diálogos de confirmación
│   └── useSenderID.ts
│
├── stores/                    # 📦 Zustand State Stores
│   ├── useClientes.ts         # Store de clientes
│   ├── useFidelizacion.ts     # Store de fidelización
│   ├── usePromos.ts           # Store de promociones
│   └── useStaffAuth.ts        # Store de autenticación staff
│
├── lib/                       # 🛠️ Utilidades y helpers
│   ├── brand-colors.ts        # Paleta de colores por marca
│   ├── brand-styles.ts        # Estilos por marca
│   ├── dataAdapter.ts         # Adaptadores de datos API
│   ├── promoAdapter.ts        # Adaptadores para promociones
│   ├── qr.ts                  # Utilidades QR
│   ├── tenant.ts              # Helpers multitenancy
│   ├── theme.ts               # Utilidades de tema
│   ├── urls.ts                # URLs centralizadas de la API
│   ├── permissions.ts         # Control de permisos
│   ├── pin.ts                 # Validación de PIN
│   └── utils.ts               # Utilidades generales
│
├── config/                    # ⚙️ Configuración
│   ├── appBrand.ts            # 🔥 Configuración principal de marca
│   │   ├── palette              # Colores (primary, secondary, accent)
│   │   ├── copy                 # Textos (nombre, tagline, etc.)
│   │   └── assets               # Logo, favicon, OG image
│   └── commerce.ts            # Configuración de comercio
│
├── styles/                    # 🎨 Estilos globales
│   └── globals.css            # Estilos Tailwind + CSS variables
│
├── public/                    # 📦 Assets estáticos
│   ├── LogoQronnect.png
│   ├── icon.svg
│   ├── apple-icon.svg
│   ├── favicon.ico
│   ├── manifest.json
│   ├── brand/                 # Logos por tenant
│   │   └── qronnect/
│   ├── opengraph-image.png
│   └── ... (imágenes, iconos)
│
├── types/                     # 📝 Tipos TypeScript
│   └── ... (tipos globales)
│
├── middleware.ts              # 🔀 Middleware de Next.js
├── next.config.mjs            # ⚙️ Configuración Next.js
├── tailwind.config.js         # 🎨 Configuración Tailwind
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencias
├── vercel.json                # Configuración Vercel
└── README.md                  # Documentación
```

---

## 4. Páginas Principales de la Aplicación

### Página de Inicio (Landing)
- **URL**: `/`
- **Componente**: `app/page.tsx`
- **Propósito**: Landing page con call-to-action, métricas, features
- **Elementos**: Branding dinámico, configuración landing personalizada, botones CTA

### Autenticación de Cliente
- **Registro**: `/registro`
- **Login**: `/login`
- **Recuperar**: `/recuperar`
- **Validar Email**: `/validar-email`
- **Validación Pendiente**: `/validacion-pendiente`

### Cliente - Rutas Dinámicas por Tienda (Slug)
- **Dashboard**: `/:slug/c` - Panel principal del cliente
- **Mi QR**: `/:slug/mi-qr` - Visualizar QR personal
- **Mi Perfil**: `/:slug/mi-perfil` - Datos del cliente
- **Mis Cupones**: `/:slug/mis-cupones` - Cupones disponibles
- **Mis Canjes**: `/:slug/mis-canjes` - Historial de canjes
- **Mis Referidos**: `/:slug/mis-referidos` - Programa de referidos

### Panel de Administración (Tienda)
- **Login Admin**: `/admin/login` - Autenticación con PIN
- **Dashboard**: `/admin/dashboard` - Panel principal
- **Onboarding**: `/admin/onboarding` - Setup inicial
- **Configuración**:
  - `/admin/configuracion/tienda` - Datos de la tienda
  - `/admin/configuracion/landing` - Personalizar landing
  - `/admin/configuracion/regalos` - Gestión de recompensas
  - `/admin/configuracion/ia` - Herramientas IA

### Panel de Escaneo (Staff)
- **URL**: `/staff`
- **Propósito**: Escanear QR de clientes, registrar compras en tiempo real
- **Funcionalidades**: Scanner, lista de clientes, registro de ventas

### Panel de SuperAdmin
- **Login**: `/superadmin/login`
- **Dashboard**: `/superadmin/dashboard`
- **Gestión de Tiendas**: `/superadmin/tiendas`
- **Nueva Tienda**: `/superadmin/tiendas/nueva`
- **Editar Tienda**: `/superadmin/tiendas/[id]`
- **Informes**: `/superadmin/informes`

### Páginas Legales
- `/terminos` - Términos de servicio
- `/privacidad` - Política de privacidad
- `/aviso-legal` - Aviso legal
- `/politica-cookies` - Política de cookies

---

## 5. Componentes UI Reutilizables (shadcn/ui)

### Categorías de Componentes

#### Formularios
- `<Button>` - Botones
- `<Form>` - Wrapper de formularios
- `<Input>` - Campos de texto
- `<Label>` - Etiquetas
- `<Select>` - Selecciones
- `<Checkbox>` - Checkboxes
- `<Switch>` - Switches/toggles
- `<RadioGroup>` - Radio buttons
- `<Textarea>` - Áreas de texto
- `<InputOTP>` - Entrada OTP
- `<Field>` - Campo personalizado

#### Dialogs & Modales
- `<Dialog>` - Modal dialog
- `<AlertDialog>` - Dialog de confirmación
- `<Drawer>` - Drawer lateral
- `<Sheet>` - Sheet lateral

#### Navegación
- `<Breadcrumb>` - Breadcrumbs
- `<Pagination>` - Paginación
- `<Tabs>` - Tabs/pestañas
- `<NavigationMenu>` - Menú de navegación
- `<Menubar>` - Barra de menú
- `<DropdownMenu>` - Menú desplegable

#### Datos
- `<Table>` - Tabla de datos
- `<Chart>` - Gráficas (Recharts)
- `<Card>` - Card contenedor
- `<Empty>` - Estado vacío
- `<ErrorRetry>` - Componente de error

#### Feedback
- `<Alert>` - Alertas
- `<Toaster>` - Toast notifications (Sonner)
- `<Badge>` - Badges
- `<Progress>` - Barra de progreso

#### Otros
- `<Accordion>` - Acordeón
- `<Avatar>` - Avatar de usuario
- `<Tooltip>` - Tooltips
- `<Popover>` - Popover
- `<Toggle>` - Botones toggle
- `<Skeleton>` - Skeleton loading
- `<Separator>` - Separadores
- `<Sidebar>` - Sidebar
- `<Carousel>` - Carrusel
- `<Calendar>` - Calendario

### Sistema de Diseño

#### Paleta de Colores (Tailwind CSS)
Definida en `styles/globals.css` usando **variables CSS OKLch**:

```css
:root {
  --background: oklch(1 0 0);        /* Fondo principal */
  --foreground: oklch(0.145 0 0);    /* Texto principal */
  --primary: oklch(0.205 0 0);       /* Color primario */
  --secondary: oklch(0.97 0 0);      /* Color secundario */
  --accent: oklch(0.97 0 0);         /* Color de acento */
  --muted: oklch(0.97 0 0);          /* Color suave */
  --border: oklch(0.922 0 0);        /* Bordes */
  --destructive: oklch(0.577 0.245 27.325); /* Rojo peligro */
}
```

#### Branding Dinámico por Tenant
Configurado en `config/appBrand.ts`:

```typescript
export const BRAND: AppBrand = {
  palette: {
    primary: "#0ea5e9",        // Azul cielo
    primaryFg: "#ffffff",
    secondary: "#6366f1",      // Índigo
    accent: "#22c55e",         // Verde
    background: "#ffffff",
    foreground: "#0f172a",
    muted: "#f1f5f9",
    border: "#e5e7eb"
  },
  copy: {
    companyName: "Tu Comercio",
    tagline: "Tarjeta digital de fidelización con QR",
    city: "Madrid",
    ctaGetQR: "Obtener mi QR"
  },
  assets: {
    logo: "/LogoQronnect.png",
    favicon: "/icon.svg",
    ogImage: "/opengraph-image.png"
  }
}
```

#### Tipografía
- **Font Family**: Geist (sans-serif), Geist Mono (monospace) - Google Fonts
- **Escala de tamaños**: Definida por Tailwind CSS

#### Espaciado & Border Radius
- **Radius**: `0.625rem` (base)
- **Espaciado**: Sistema estándar de Tailwind

---

## 6. Sistema de Navegación

### App Router (Next.js 13+)
La aplicación usa **Next.js App Router** con estructura basada en carpetas:

```
app/
├── [slug]/              // Dinámico para tenants/tiendas
├── admin/               // Rutas de admin (no dinámicas)
├── superadmin/          // Rutas de superadmin
├── staff/               // Rutas de escaneo
└── ...                  // Otras rutas
```

### Middleware
Archivo: `middleware.ts`
- Redirige rutas de cliente (`/mi-qr`, `/mi-perfil`, etc.) a `/{slug}/mi-qr`
- Extrae subdomain/slug del hostname
- Solo aplica en producción (no en localhost)

### Rutas Protegidas
- **Admin**: Requiere PIN (autenticación simple)
- **Staff**: Requiere acceso a la tienda
- **SuperAdmin**: Requiere credenciales específicas
- **Cliente**: Requiere login con email

---

## 7. State Management

### Zustand Stores
Ubicados en `stores/`:

#### `useClientes.ts`
```typescript
- clientesData: Cliente[]
- loading: boolean
- getClientes(): Promise<void>
- crearCliente(): Promise<void>
```

#### `useFidelizacion.ts`
```typescript
- puntos: number
- nivel: string
- actualizarPuntos(): Promise<void>
```

#### `usePromos.ts`
```typescript
- promociones: Promocion[]
- cargarPromos(): Promise<void>
```

#### `useStaffAuth.ts`
```typescript
- isAuthenticated: boolean
- tiendaId: string
- login(pin): Promise<void>
- logout(): void
```

### Context Providers
En `app/layout.tsx`:

1. **BrandingProvider** - Branding dinámico del tenant
2. **BrandProvider** - Configuración de marca
3. **CookieConsentProvider** - Gestión de cookies
4. **ConfirmDialogProvider** - Diálogos de confirmación
5. **CookieBanner** - Banner de cookies

---

## 8. Características Clave por Sección

### Para Clientes
- Registro y login con email
- Generación de QR único personal
- Dashboard con puntos acumulados
- Historial de compras
- Visualización de promociones
- Canjes de recompensas
- Programa de referidos
- Validación de email opcional

### Para Personal de Tienda (Admin)
- Autenticación con PIN
- Dashboard con gráficas
- Escáner QR en tiempo real
- Registro de compras instantáneo
- Gestión de clientes
- Creación de promociones
- Campañas de email
- Herramientas de IA (análisis, generación de promos)
- Onboarding guiado

### Para SuperAdmin
- Gestión de múltiples tiendas
- Creación de nuevas tiendas
- Dashboard consolidado
- Reportes y estadísticas globales
- Configuración de tiendas

---

## 9. APIs Utilizadas

### Endpoints Principales
Definidos en `lib/urls.ts`:

```typescript
/api/config/branding          // Branding del tenant
/api/auth/login               // Login cliente
/api/auth/register            // Registro cliente
/api/clientes/                // CRUD clientes
/api/compras/                 // Registro de compras
/api/promociones/             // Gestión de promociones
/api/qr/generate              // Generar QR
/api/qr/register              // Registrar código QR
/api/admin/dashboard          // Dashboard admin
/api/superadmin/tiendas       // Gestión de tiendas
```

### URL Base
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL 
  || 'http://localhost:3001'
```

---

## 10. Configuración y Personalización

### Personalizar Marca (`config/appBrand.ts`)
```typescript
// Cambiar nombre, colores, logo, textos
export const BRAND: AppBrand = {
  palette: { /* colores */ },
  copy: { /* textos */ },
  assets: { /* logo, favicon */ }
}
```

### Personalizar Landing (`admin/configuracion/landing`)
- Textos, imágenes, colores
- Estadísticas mostradas
- Promoción destacada

### Personalizar Comercio (`admin/configuracion/tienda`)
- Nombre y datos de la tienda
- Reglas de puntuación
- Configuración de recompensas

---

## 11. Desarrollo & Build

### Scripts Disponibles
```bash
npm run dev     # Iniciar desarrollo (Next.js)
npm run build   # Build para producción
npm run start   # Iniciar en producción
npm run lint    # Linting (ESLint)
```

### Variables de Entorno
```env
NEXT_PUBLIC_API_URL=http://localhost:3001  # URL del backend
```

### TypeScript
- Configuración estricta (`strict: true`)
- Path alias: `@/*` → raíz del proyecto
- Build sin errores: `ignoreBuildErrors: true` (temporal)

---

## 12. Optimizaciones y Performance

### Image Optimization
- Imágenes de Supabase permitidas (`*.supabase.co`)
- Remotas HTTPS permitidas
- `unoptimized: true` solo en desarrollo

### Analytics
- Integración de Vercel Analytics
- Tracking de eventos

### Caching
- Metadata estática con fallback dinámico
- Cache de branding por tenant

---

## 13. Modelo de Datos Multitenancy

### Identificación del Tenant
- **Subdomain**: `tienda.qronnect.com` → `tienda` es el slug
- **Parámetro URL**: `/:slug/...` → slug identifica la tienda
- **Header**: `X-Tenant-Domain` para APIs

### Datos Aislados por Tenant
```
tiendas table:
  ├── id (UUID)
  ├── nombre, slug (único)
  ├── configuracion (JSONB)
  ├── branding (logo, colores)
  └── ...

clientes:
  ├── id_tienda (FK)
  ├── email
  ├── puntos_totales
  └── ...

compras:
  ├── id_tienda (FK)
  ├── id_cliente (FK)
  ├── importe, puntos_otorgados
  └── ...
```

---

## 14. Seguridad

### Autenticación
- JWT (Supabase Auth) para clientes
- PIN simple para staff
- Cookies de sesión para admin

### Validación
- Zod para schemas
- React Hook Form para formularios
- Validación en servidor y cliente

### Headers de Seguridad
- X-DNS-Prefetch-Control
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

---

## 15. Testing

### Archivos de Test
- `tests/` - Suite de tests (Playwright)
- `playwright.config.ts` - Configuración Playwright

---

## Resumen Arquitectura

**Qronnect Frontend** es una aplicación **Next.js moderna y escalable** con:
- Sistema de **multi-tenancy** mediante subdomains y slugs
- **Componentes reutilizables** de shadcn/ui
- **State management** con Zustand
- **Branding dinámico** por tenant
- Soporta **tres roles principales**: Cliente, Admin (tienda), SuperAdmin
- Usa **Tailwind CSS** con variables dinámicas
- Integración con **backend NestJS** via REST API
- Optimizado para **Vercel** (Next.js)

