# 🚀 GUÍA COMPLETA DE IMPLEMENTACIÓN - MEJORAS UX/UI

Esta guía detalla paso a paso cómo implementar TODAS las mejoras identificadas en el análisis de UX/UI.

## 📋 ÍNDICE

1. [Archivos ya creados](#archivos-ya-creados)
2. [Fase 1: Accesibilidad Básica (P0)](#fase-1-accesibilidad-básica)
3. [Fase 2: Performance Móvil (P0)](#fase-2-performance-móvil)
4. [Fase 3: Dark Mode + Búsqueda (P1)](#fase-3-dark-mode--búsqueda)
5. [Fase 4: Responsive Improvements (P1)](#fase-4-responsive-improvements)
6. [Fase 5: Testing y Métricas (P2)](#fase-5-testing-y-métricas)

---

## ✅ ARCHIVOS YA CREADOS

He creado los siguientes archivos de utilidades y componentes base:

```
frontend/
├── lib/
│   └── a11y.ts                    ✅ Utilidades de accesibilidad
├── hooks/
│   └── use-media-query.ts         ✅ Hook para responsive design
├── components/
│   └── ui/
│       ├── button.tsx             ✅ Mejorado con loading states
│       ├── visually-hidden.tsx    ✅ Para contenido solo screen readers
│       ├── confirm-dialog.tsx     ✅ Confirmaciones accesibles
│       ├── command-menu.tsx       ✅ Búsqueda global Cmd+K
│       └── theme-toggle.tsx       ✅ Toggle de dark mode (ya existía)
```

---

## 🎯 FASE 1: ACCESIBILIDAD BÁSICA (P0 - CRÍTICO)

### Tiempo estimado: 2-3 días
### Prioridad: **MÁXIMA** ⚠️

### 1.1 Mejorar Landing Page con ARIA

**Archivo:** `app/page.tsx`

#### Cambios en el Hero (líneas 191-316):

```tsx
// ❌ ANTES:
<motion.img
  src={logoSrc}
  alt={displayBrandName}
  className='h-14 md:h-16 w-auto object-contain'
/>

// ✅ DESPUÉS:
<motion.img
  src={logoSrc}
  alt={`Logo de ${displayBrandName} - Programa de fidelización con QR`}
  className='h-14 md:h-16 w-auto object-contain'
  role="img"
/>
```

#### Cambios en botones de CTA (líneas 234-259):

```tsx
// ❌ ANTES:
<Button asChild size='lg' className='...'>
  <Link href='/get-qr'>
    {config.hero_cta_principal}
    <ArrowRight className='w-5 h-5' />
  </Link>
</Button>

// ✅ DESPUÉS:
<Button asChild size='lg' className='...'>
  <Link href='/get-qr' aria-label="Obtener mi código QR de fidelización">
    {config.hero_cta_principal}
    <ArrowRight className='w-5 h-5' aria-hidden="true" />
  </Link>
</Button>
```

#### Añadir Skip Link al inicio:

```tsx
// AÑADIR al principio del return en HomePage (línea 189)
import { SkipLink } from '@/lib/a11y'

return (
  <div className='min-h-screen bg-white'>
    <SkipLink href="#main-content">
      Saltar al contenido principal
    </SkipLink>

    {/* Hero Section */}
    <section id="main-content" className='relative overflow-hidden ...'>
      {/* ... resto del código */}
    </section>
```

#### Mejorar Cards de Servicios (líneas 347-379):

```tsx
// ✅ DESPUÉS:
<motion.div
  variants={fadeInUp}
  whileHover={{ y: -4 }}
  className='group relative bg-white rounded-2xl p-6 border ...'
  role="article"
  aria-label={`Servicio: ${service.title}`}
>
  <div className='...'>
    <service.icon
      className='w-6 h-6'
      style={{ color: branding.color_primario }}
      aria-hidden="true"
    />
  </div>
  <h3 className='text-lg font-semibold mb-2 text-gray-900'>
    {service.title}
  </h3>
  <p className='text-gray-600 text-sm leading-relaxed'>
    {service.description}
  </p>
</motion.div>
```

#### Mejorar Estrellas de Rating (líneas 513-518):

```tsx
// ❌ ANTES:
{Array.from({ length: testimonial.rating }).map((_, i) => (
  <Star key={i} className='w-4 h-4 fill-current' />
))}

// ✅ DESPUÉS:
<div
  className="flex gap-1"
  role="img"
  aria-label={`Calificación: ${testimonial.rating} de 5 estrellas`}
>
  {Array.from({ length: testimonial.rating }).map((_, i) => (
    <Star
      key={i}
      className='w-5 h-5 fill-current' // Aumentado de w-4 a w-5 para touch
      style={{ color: branding.color_primario }}
      aria-hidden="true"
    />
  ))}
</div>
```

### 1.2 Mejorar Admin Dashboard con ARIA

**Archivo:** `app/admin/dashboard/page.tsx`

#### Stats Cards con ARIA (líneas 536-574):

```tsx
<Card className="p-2 sm:p-0" role="region" aria-label="Estadística de clientes">
  <CardHeader className="...">
    <CardTitle id="stat-clientes" className="text-xs sm:text-sm font-medium">
      Clientes
    </CardTitle>
    <Users
      className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground"
      aria-hidden="true"
    />
  </CardHeader>
  <CardContent className="..." aria-labelledby="stat-clientes">
    <div className="text-lg sm:text-2xl font-bold">{data?.total_clientes || 0}</div>
    <p className="text-xs sm:text-xs text-muted-foreground hidden sm:block">
      Registrados
    </p>
  </CardContent>
</Card>
```

#### Tabs con navegación por teclado (líneas 578-612):

```tsx
<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
  <div className="relative -mx-4 sm:mx-0">
    <div
      className="overflow-x-auto scrollbar-hide px-4 sm:px-0"
      role="navigation"
      aria-label="Navegación principal del panel de administración"
    >
      <TabsList className="inline-flex w-auto min-w-full sm:w-full justify-start">
        <TabsTrigger
          value="qr"
          className="flex-shrink-0"
          aria-label="Ver sección de QR de Registro"
        >
          <QrCode className="h-4 w-4 sm:mr-2" aria-hidden="true" />
          <span className="hidden sm:inline">QR de Registro</span>
          <span className="sr-only sm:hidden">QR</span> {/* Label móvil accesible */}
        </TabsTrigger>
        {/* Repetir para todos los tabs... */}
      </TabsList>
    </div>
  </div>
```

#### Tabla de Clientes con ARIA (líneas 769-823):

```tsx
<Table role="table" aria-label="Lista de clientes registrados">
  <TableHeader>
    <TableRow>
      <TableHead scope="col">Nombre</TableHead>
      <TableHead scope="col">Email</TableHead>
      <TableHead scope="col">Teléfono</TableHead>
      {/* ... */}
    </TableRow>
  </TableHeader>
  <TableBody>
    {clientes?.data?.map((cliente) => (
      <TableRow key={cliente.id}>
        <TableCell scope="row" className="font-medium">
          {cliente.nombre}
        </TableCell>
        {/* ... */}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### Botón FAB con mejor accesibilidad (líneas 1202-1211):

```tsx
<div className="fixed bottom-6 right-6 z-50">
  <Button
    size="lg"
    className="h-14 w-14 rounded-full shadow-lg text-white"
    style={{ backgroundColor: hexToRgb(branding.color_primario) }}
    onClick={() => setRegistrarVentaOpen(true)}
    aria-label="Abrir formulario para registrar nueva venta"
  >
    <Plus className="h-6 w-6" aria-hidden="true" />
    <span className="sr-only">Registrar venta</span>
  </Button>
</div>
```

### 1.3 Reemplazar estados de loading

**Ejemplo en Admin Dashboard (línea 758-760):**

```tsx
// ❌ ANTES:
{clientesLoading ? (
  <div className="text-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"></div>
  </div>
) : (
  // ... contenido
)}

// ✅ DESPUÉS:
import { Skeleton } from '@/components/ui/skeleton'

{clientesLoading ? (
  <div className="space-y-4" aria-busy="true" aria-label="Cargando clientes">
    {Array.from({ length: 5 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
) : (
  // ... contenido
)}
```

### 1.4 Usar el nuevo Button con loading

**Ejemplo en Onboarding Wizard:**

**Archivo:** `components/onboarding/OnboardingWizard.tsx` (líneas 471-486)

```tsx
// ❌ ANTES:
<Button onClick={() => guardarPaso(pasoActual, datosPaso)} disabled={guardando}>
  {guardando ? (
    <>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Guardando...
    </>
  ) : (
    <>
      {pasoActual === 5 ? 'Finalizar' : 'Siguiente'}
      <ChevronRight className="h-4 w-4 ml-2" />
    </>
  )}
</Button>

// ✅ DESPUÉS:
<Button
  onClick={() => guardarPaso(pasoActual, datosPaso)}
  loading={guardando}
  loadingText="Guardando cambios..."
>
  {pasoActual === 5 ? 'Finalizar' : 'Siguiente'}
  <ChevronRight className="h-4 w-4" aria-hidden="true" />
</Button>
```

---

## 🚀 FASE 2: PERFORMANCE MÓVIL (P0 - CRÍTICO)

### Tiempo estimado: 3-4 días
### Prioridad: **MÁXIMA** ⚠️

### 2.1 Optimizar imágenes con Next.js Image

**Archivo:** `app/page.tsx`

#### Imagen del Hero (líneas 300-308):

```tsx
// ❌ ANTES:
<img
  src='/gente-de-negocios-dandose-la-mano.webp'
  alt='Gente de negocios saludándose'
  className='w-full h-full object-cover'
/>

// ✅ DESPUÉS:
import Image from 'next/image'

<Image
  src="/gente-de-negocios-dandose-la-mano.webp"
  alt="Dos profesionales estrechándose la mano en un entorno moderno, simbolizando la confianza y colaboración en programas de fidelización"
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={false} // No es critical para FCP
  quality={85}
/>
```

#### Logo con Image (líneas 204-216):

```tsx
// ✅ DESPUÉS:
<Image
  src={logoSrc}
  alt={`Logo de ${displayBrandName} - Sistema de fidelización`}
  width={180}
  height={64}
  className="h-14 md:h-16 w-auto object-contain"
  priority={true} // Es parte del hero
  onError={(e) => {
    e.currentTarget.src = '/LogoQronnect.png'
  }}
/>
```

### 2.2 Lazy load de Framer Motion

**Archivo:** `app/page.tsx`

```tsx
// ❌ ANTES (línea 8):
import { motion, AnimatePresence } from 'framer-motion'

// ✅ DESPUÉS:
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy load de componentes animados que no son críticos
const AnimatedServices = dynamic(() => import('@/components/landing/AnimatedServices'), {
  loading: () => <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
    {/* Skeleton de cards */}
  </div>,
  ssr: true, // Mantener SSR
})

const AnimatedTestimonials = dynamic(() => import('@/components/landing/AnimatedTestimonials'), {
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-xl" />,
  ssr: false, // No crítico para SEO
})
```

#### Crear componentes separados:

**Nuevo archivo:** `components/landing/AnimatedServices.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

interface Service {
  icon: React.ElementType
  title: string
  description: string
}

export default function AnimatedServices({
  services,
  branding,
  fadeInUp,
  stagger,
}: {
  services: Service[]
  branding: any
  fadeInUp: any
  stagger: any
}) {
  return (
    <motion.div
      variants={stagger}
      className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'
    >
      {services.map((service, index) => (
        <motion.div
          key={index}
          variants={fadeInUp}
          whileHover={{ y: -4 }}
          className='group relative bg-white rounded-2xl p-6 ...'
        >
          {/* ... contenido */}
        </motion.div>
      ))}
    </motion.div>
  )
}
```

### 2.3 Code Splitting del Admin Dashboard

**Archivo:** `app/admin/dashboard/page.tsx`

```tsx
// AÑADIR al inicio:
import dynamic from 'next/dynamic'

// Lazy load de componentes pesados que no son inmediatos
const AnalyticsCharts = dynamic(
  () => import('@/components/admin/AnalyticsCharts'),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false, // Charts no necesitan SSR
  }
)

const PromocionesPanel = dynamic(
  () => import('@/components/admin/promociones/PromocionesPanel'),
  {
    loading: () => <div className="h-64 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" />
    </div>,
    ssr: false,
  }
)

const CampanasPanel = dynamic(
  () => import('@/components/admin/campanas/CampanasPanel'),
  { ssr: false }
)

const PanelIA = dynamic(
  () => import('@/components/admin/ia/PanelIA'),
  { ssr: false }
)
```

### 2.4 Implementar Intersection Observer para lazy render

**Nuevo archivo:** `hooks/use-intersection-observer.ts`

```typescript
import { useEffect, useState, useRef } from 'react'

export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true)
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    })

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [hasIntersected, options])

  return { targetRef, isIntersecting, hasIntersected }
}
```

**Uso en Landing Page:**

```tsx
// En sección de Testimonios (línea 480):
import { useIntersectionObserver } from '@/hooks/use-intersection-observer'

export default function HomePage() {
  const { targetRef: testimonialsRef, hasIntersected } = useIntersectionObserver()

  return (
    <section ref={testimonialsRef} className='py-12 md:py-16 bg-white'>
      {hasIntersected && (
        <motion.div initial='initial' whileInView='animate' ...>
          {/* Contenido animado */}
        </motion.div>
      )}
    </section>
  )
}
```

### 2.5 Agregar loading bar de navegación

**Instalación:**

```bash
npm install nprogress @types/nprogress
```

**Nuevo archivo:** `components/loading-bar.tsx`

```tsx
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 100,
})

export function LoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    NProgress.done()
  }, [pathname, searchParams])

  return null
}
```

**Agregar a layout:** `app/layout.tsx`

```tsx
import { LoadingBar } from '@/components/loading-bar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <LoadingBar />
        {children}
      </body>
    </html>
  )
}
```

**Crear CSS personalizado:** `styles/nprogress.css`

```css
/* Personalizar el color de NProgress con el color primario */
#nprogress .bar {
  background: oklch(0.646 0.222 41.116) !important; /* color-primary */
  height: 3px;
}

#nprogress .peg {
  box-shadow: 0 0 10px oklch(0.646 0.222 41.116), 0 0 5px oklch(0.646 0.222 41.116);
}
```

---

## 🌙 FASE 3: DARK MODE + BÚSQUEDA GLOBAL (P1)

### Tiempo estimado: 3 días
### Prioridad: **ALTA**

### 3.1 Activar Dark Mode en toda la app

**Archivo:** `app/layout.tsx`

```tsx
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 3.2 Agregar Toggle en navegación

**Archivo:** `components/AdminNav.tsx` (o donde tengas la nav)

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function AdminNav() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* ... logo y links ... */}

        <div className="flex items-center gap-2">
          {/* Comando de búsqueda */}
          <CommandMenu />

          {/* Toggle de tema */}
          <ThemeToggle />

          {/* ... otros items ... */}
        </div>
      </div>
    </nav>
  )
}
```

### 3.3 Verificar colores en dark mode

**Revisar variables en:** `styles/globals.css`

Las variables dark ya están definidas (líneas 42-75), pero asegúrate de que se vean bien. Prueba con:

```css
.dark {
  /* Ajustar si necesitas mejor contraste */
  --foreground: oklch(0.985 0 0); /* Casi blanco */
  --background: oklch(0.145 0 0); /* Gris muy oscuro */
  --muted-foreground: oklch(0.708 0 0); /* Gris medio */
}
```

### 3.4 Implementar Command Menu en Admin

**Archivo:** `app/admin/dashboard/page.tsx`

```tsx
import { CommandMenu } from '@/components/ui/command-menu'

export default function AdminDashboardPage() {
  // ... código existente ...

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminNav />

      {/* Header con CommandMenu visible */}
      <header className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BrandLogo width={120} height={40} />
              {/* ... */}
            </div>

            {/* Agregar búsqueda */}
            <CommandMenu />
          </div>
        </div>
      </header>

      {/* ... resto del código ... */}
    </div>
  )
}
```

**Añadir listeners para eventos personalizados:**

```tsx
// En useEffect del component:
useEffect(() => {
  // Listener para abrir modal de venta desde Cmd+K
  const handleOpenSale = () => setRegistrarVentaOpen(true)
  const handleOpenPromo = () => setActiveTab('promociones')
  const handleOpenCampaign = () => setActiveTab('campanas')

  window.addEventListener('open-sale-modal', handleOpenSale)
  window.addEventListener('open-promo-modal', handleOpenPromo)
  window.addEventListener('open-campaign-modal', handleOpenCampaign)

  return () => {
    window.removeEventListener('open-sale-modal', handleOpenSale)
    window.removeEventListener('open-promo-modal', handleOpenPromo)
    window.removeEventListener('open-campaign-modal', handleOpenCampaign)
  }
}, [])
```

---

## 📱 FASE 4: RESPONSIVE IMPROVEMENTS (P1)

### Tiempo estimado: 2 días
### Prioridad: **ALTA**

### 4.1 Usar ResponsiveDialog en modales

**Ejemplo:** Convertir `RegistrarVentaDialogMejorado`

**Archivo:** `components/admin/RegistrarVentaDialogMejorado.tsx`

```tsx
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'

export function RegistrarVentaDialogMejorado({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Registrar Nueva Venta"
      description="Escanea el QR del cliente o búscalo por nombre/email"
      footer={
        <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-initial"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            loadingText="Guardando..."
            className="flex-1 sm:flex-initial"
          >
            Guardar Venta
          </Button>
        </div>
      }
    >
      {/* Formulario aquí */}
      <div className="space-y-4">
        {/* ... campos ... */}
      </div>
    </ResponsiveDialog>
  )
}
```

### 4.2 Aumentar áreas de toque en móvil

**Archivo:** `app/page.tsx` - Estrellas de rating

```tsx
// Línea 513-518
<div
  className="flex gap-1"
  role="img"
  aria-label={`Calificación: ${testimonial.rating} de 5 estrellas`}
>
  {Array.from({ length: testimonial.rating }).map((_, i) => (
    <Star
      key={i}
      className='w-6 h-6 sm:w-5 sm:h-5 fill-current' // Más grande en mobile
      style={{ color: branding.color_primario }}
      aria-hidden="true"
    />
  ))}
</div>
```

### 4.3 Mejorar inputs en mobile

**Actualizar config de Tailwind para inputs más grandes:**

```tsx
// En componentes de formulario, usar:
<Input
  className="h-12 sm:h-10 text-base" // Más alto en mobile
  type="email"
  placeholder="tu@email.com"
/>

<Button
  size="lg" // En mobile siempre lg
  className="h-12 sm:h-10 w-full sm:w-auto"
>
  Enviar
</Button>
```

### 4.4 Tooltips en iconos móviles

**Crear componente de Tooltip táctil:**

```tsx
// hooks/use-long-press.ts
import { useCallback, useRef, useState } from 'react'

export function useLongPress(
  onLongPress: () => void,
  { delay = 500 }: { delay?: number } = {}
) {
  const [isPressed, setIsPressed] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const start = useCallback(() => {
    setIsPressed(true)
    timeoutRef.current = setTimeout(() => {
      onLongPress()
    }, delay)
  }, [onLongPress, delay])

  const cancel = useCallback(() => {
    setIsPressed(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    isPressed,
  }
}
```

---

## 🧪 FASE 5: TESTING Y MÉTRICAS (P2)

### Tiempo estimado: Ongoing
### Prioridad: **MEDIA**

### 5.1 Testing de accesibilidad automatizado

**Instalación:**

```bash
npm install --save-dev @axe-core/react jest-axe
```

**Nuevo archivo:** `tests/accessibility.test.tsx`

```tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import HomePage from '@/app/page'

expect.extend(toHaveNoViolations)

describe('Accessibility tests', () => {
  it('Landing page should not have accessibility violations', async () => {
    const { container } = render(<HomePage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Admin dashboard should not have accessibility violations', async () => {
    const { container } = render(<AdminDashboardPage />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### 5.2 Lighthouse CI

**Archivo:** `.github/workflows/lighthouse.yml`

```yaml
name: Lighthouse CI
on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/admin/dashboard
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### 5.3 Analytics de UX

**Instalación:**

```bash
npm install @vercel/analytics @vercel/speed-insights
```

**Archivo:** `app/layout.tsx`

```tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

---

## 📊 CHECKLIST DE IMPLEMENTACIÓN

### ✅ Fase 1: Accesibilidad (P0)
- [ ] Añadir ARIA labels a todos los iconos
- [ ] Implementar Skip Links
- [ ] Mejorar alt text de imágenes
- [ ] Usar Button con loading states
- [ ] Implementar Skeleton loaders
- [ ] Agregar roles y landmarks ARIA
- [ ] Mejorar navegación por teclado en tabs
- [ ] Añadir aria-busy en estados de carga

### ✅ Fase 2: Performance (P0)
- [ ] Convertir img a next/image
- [ ] Lazy load de Framer Motion
- [ ] Code splitting de componentes admin
- [ ] Implementar Intersection Observer
- [ ] Añadir loading bar (NProgress)
- [ ] Optimizar bundle size
- [ ] Implementar service worker

### ✅ Fase 3: Features (P1)
- [ ] Activar ThemeProvider en layout
- [ ] Añadir ThemeToggle en navegación
- [ ] Verificar colores dark mode
- [ ] Implementar CommandMenu
- [ ] Conectar eventos Cmd+K
- [ ] Testing de dark mode

### ✅ Fase 4: Responsive (P1)
- [ ] Convertir Dialogs a ResponsiveDialog
- [ ] Aumentar áreas de toque (<44x44px)
- [ ] Mejorar inputs en mobile (h-12)
- [ ] Añadir tooltips táctiles
- [ ] Testing en devices reales

### ✅ Fase 5: Testing (P2)
- [ ] Configurar jest-axe
- [ ] Testing automatizado de a11y
- [ ] Lighthouse CI en GitHub Actions
- [ ] Analytics de UX (Vercel/Mixpanel)
- [ ] User testing con 15 usuarios

---

## 🚦 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

**Día 1-2: Accesibilidad Crítica**
1. Añadir ARIA labels en Landing Page
2. Mejorar Admin Dashboard con ARIA
3. Implementar Skip Links
4. Usar Button mejorado

**Día 3-4: Performance**
1. Optimizar imágenes con next/image
2. Lazy load de componentes pesados
3. Code splitting del dashboard
4. Loading bar

**Día 5-6: Dark Mode + Búsqueda**
1. Activar ThemeProvider
2. Añadir ThemeToggle
3. Implementar CommandMenu
4. Testing

**Día 7-8: Responsive**
1. ResponsiveDialog en modales
2. Aumentar touch targets
3. Testing mobile

**Día 9+: Testing y Optimización**
1. Axe testing
2. Lighthouse CI
3. User testing
4. Iteración

---

## 📚 RECURSOS ADICIONALES

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Next.js Performance**: https://nextjs.org/docs/pages/building-your-application/optimizing
- **Radix UI A11y**: https://www.radix-ui.com/primitives/docs/overview/accessibility
- **Chrome Lighthouse**: https://developer.chrome.com/docs/lighthouse
- **Axe DevTools**: https://www.deque.com/axe/devtools/

---

## ❓ FAQ

**P: ¿Debo implementar TODO de una vez?**
R: No, sigue el orden recomendado. P0 primero (accesibilidad + performance), luego P1.

**P: ¿Cuánto tiempo tomará todo?**
R: Con 1 desarrollador full-time: ~2 semanas. Con equipo: ~1 semana.

**P: ¿Puedo omitir dark mode?**
R: Es P1, no crítico, pero mejora mucho la UX y es fácil de implementar.

**P: ¿Necesito testing automatizado?**
R: Sí para accesibilidad (jest-axe). Lighthouse CI es opcional pero recomendado.

---

**¿Necesitas ayuda con alguna implementación específica? ¡Pregúntame!** 🚀
