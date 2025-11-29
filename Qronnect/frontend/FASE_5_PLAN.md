# 📋 FASE 5: TESTING & ANALYTICS - PLAN DE IMPLEMENTACIÓN

## 🎯 Objetivo

Implementar testing automatizado, analytics de eventos, error tracking y performance monitoring para garantizar la calidad y poder medir el uso real de la aplicación.

**Prioridad:** P2 (Media - Opcional pero Recomendada)
**Tiempo estimado:** 2-3 horas
**Complejidad:** Media

---

## 🗂️ ÍNDICE

1. [Testing E2E con Playwright](#1-testing-e2e-con-playwright)
2. [Analytics de Eventos](#2-analytics-de-eventos)
3. [Error Tracking con Sentry](#3-error-tracking-con-sentry)
4. [Performance Monitoring](#4-performance-monitoring)
5. [Checklist de Implementación](#checklist-de-implementación)

---

## 1. Testing E2E con Playwright

### 🎯 Objetivo
Automatizar los flujos críticos del usuario para prevenir regresiones.

### 📦 Instalación

```bash
npm install -D @playwright/test
npx playwright install
```

### 📁 Estructura de Archivos

```
frontend/
├── playwright.config.ts          # Configuración de Playwright
├── tests/
│   ├── e2e/
│   │   ├── admin/
│   │   │   ├── auth.spec.ts      # Login/Logout
│   │   │   ├── clientes.spec.ts  # Gestión de clientes
│   │   │   ├── ventas.spec.ts    # Registrar ventas
│   │   │   └── promociones.spec.ts
│   │   └── cliente/
│   │       ├── registro.spec.ts  # Formulario QR
│   │       └── perfil.spec.ts
│   └── fixtures/
│       └── test-data.ts          # Datos de prueba
```

### 🔧 Configuración

**`playwright.config.ts`:**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### ✅ Tests Críticos a Implementar

#### 1. **Admin - Login Flow**
**`tests/e2e/admin/auth.spec.ts`:**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Admin Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/admin/login')

    // Fill login form
    await page.fill('input[name="username"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'password123')

    // Submit
    await page.click('button[type="submit"]')

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/.*admin\/dashboard/)

    // Verify welcome message or dashboard content
    await expect(page.locator('text=Admin Panel')).toBeVisible()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/admin/login')

    await page.fill('input[name="username"]', 'wrong@test.com')
    await page.fill('input[type="password"]', 'wrongpass')
    await page.click('button[type="submit"]')

    // Verify error message
    await expect(page.locator('text=/credenciales.*incorrectas/i')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/admin/login')
    await page.fill('input[name="username"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Wait for dashboard
    await page.waitForURL(/.*admin\/dashboard/)

    // Click logout
    await page.click('button:has-text("Salir")')

    // Verify redirect to login
    await expect(page).toHaveURL(/.*admin\/login/)
  })
})
```

#### 2. **Admin - Registrar Venta**
**`tests/e2e/admin/ventas.spec.ts`:**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Registrar Venta', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/admin/login')
    await page.fill('input[name="username"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*admin\/dashboard/)
  })

  test('should open sale registration dialog', async ({ page }) => {
    // Click FAB or Cmd+K
    await page.click('[aria-label*="Registrar"]')

    // Verify dialog is open
    await expect(page.locator('text=Paso 1: Buscar Cliente')).toBeVisible()
  })

  test('should search for client by name', async ({ page }) => {
    await page.click('[aria-label*="Registrar"]')

    // Search client
    const searchInput = page.locator('input[placeholder*="Nombre, email"]')
    await searchInput.fill('Juan')

    // Wait for suggestions
    await page.waitForTimeout(500) // debounce

    // Verify suggestions appear
    const suggestions = page.locator('[role="listitem"]')
    await expect(suggestions.first()).toBeVisible()
  })

  test('should complete full sale flow', async ({ page }) => {
    await page.click('[aria-label*="Registrar"]')

    // Step 1: Select client
    await page.fill('input[placeholder*="Nombre"]', 'Juan')
    await page.waitForTimeout(500)
    await page.click('button:has-text("Juan Pérez")')

    // Verify Step 2
    await expect(page.locator('text=Paso 2: Promociones')).toBeVisible()

    // Skip promotions
    await page.click('button:has-text("Continuar")')

    // Step 3: Enter amount
    await expect(page.locator('text=Paso 3: Confirmar')).toBeVisible()
    await page.fill('input[type="number"]', '25.50')

    // Submit
    await page.click('button:has-text("Confirmar Venta")')

    // Verify success
    await expect(page.locator('text=¡Venta Registrada!')).toBeVisible()
  })
})
```

#### 3. **Cliente - Registro**
**`tests/e2e/cliente/registro.spec.ts`:**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Cliente Registration', () => {
  test('should complete registration form', async ({ page }) => {
    await page.goto('/get-qr')

    // Fill form
    await page.fill('input[name="nombre"]', 'Test User')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="tel"]', '612345678')

    // Accept privacy
    await page.check('input[type="checkbox"]')

    // Submit
    await page.click('button[type="submit"]')

    // Verify success (QR page or success message)
    await expect(page.locator('text=/QR.*código/i')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/get-qr')

    // Try to submit without filling
    await page.click('button[type="submit"]')

    // Verify validation messages
    await expect(page.locator('text=/nombre.*requerido/i')).toBeVisible()
  })
})
```

#### 4. **Accessibility Tests**
**`tests/e2e/accessibility.spec.ts`:**
```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility', () => {
  test('landing page should not have accessibility violations', async ({ page }) => {
    await page.goto('/')

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('admin dashboard should not have accessibility violations', async ({ page }) => {
    // Login first
    await page.goto('/admin/login')
    await page.fill('input[name="username"]', 'admin@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*admin\/dashboard/)

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')

    // Tab through focusable elements
    await page.keyboard.press('Tab')
    await expect(page.locator('a[href="#main-content"]')).toBeFocused()

    await page.keyboard.press('Tab')
    // Next focusable element should be focused
  })
})
```

### 📝 Scripts package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

### 🚀 Comandos

```bash
# Ejecutar todos los tests
npm run test:e2e

# Modo UI (recomendado para desarrollo)
npm run test:e2e:ui

# Ver modo headed (con navegador visible)
npm run test:e2e:headed

# Debug un test específico
npm run test:e2e:debug tests/e2e/admin/auth.spec.ts

# Ver reporte HTML
npm run test:e2e:report
```

---

## 2. Analytics de Eventos

### 🎯 Objetivo
Medir interacciones del usuario para entender cómo usan la app.

### 📦 Instalación

**Ya instalado:** `@vercel/analytics` (en layout.tsx)

**Para eventos custom:**
```bash
npm install @vercel/analytics
```

### 🔧 Implementación

#### 1. **Hook Personalizado para Analytics**

**`hooks/use-analytics.ts`:**
```typescript
'use client'

import { useCallback } from 'react'
import { track } from '@vercel/analytics'

interface AnalyticsEvent {
  category: string
  action: string
  label?: string
  value?: number
}

export function useAnalytics() {
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    // Vercel Analytics
    track(event.action, {
      category: event.category,
      label: event.label,
      value: event.value,
    })

    // Console en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event)
    }
  }, [])

  return { trackEvent }
}
```

#### 2. **Eventos a Trackear**

**Admin Dashboard:**
```typescript
'use client'

import { useAnalytics } from '@/hooks/use-analytics'

export default function AdminDashboard() {
  const { trackEvent } = useAnalytics()

  const handleRegistrarVenta = () => {
    trackEvent({
      category: 'Admin',
      action: 'Abrir Modal Venta',
      label: 'Dashboard FAB',
    })
    setRegistrarVentaOpen(true)
  }

  const handleVentaSuccess = (importe: number, puntos: number) => {
    trackEvent({
      category: 'Ventas',
      action: 'Venta Registrada',
      value: importe,
    })
    trackEvent({
      category: 'Puntos',
      action: 'Puntos Otorgados',
      value: puntos,
    })
  }

  return (
    // ...
  )
}
```

**Registro de Cliente:**
```typescript
import { useAnalytics } from '@/hooks/use-analytics'

export function RegistroFormV2() {
  const { trackEvent } = useAnalytics()

  const handleSubmit = async (data: FormData) => {
    // Track inicio de registro
    trackEvent({
      category: 'Cliente',
      action: 'Inicio Registro',
      label: window.location.hostname,
    })

    const result = await submitRegistro(data)

    if (result.success) {
      trackEvent({
        category: 'Cliente',
        action: 'Registro Completado',
        label: window.location.hostname,
      })
    } else {
      trackEvent({
        category: 'Cliente',
        action: 'Registro Fallido',
        label: result.error,
      })
    }
  }
}
```

**Command Menu (Cmd+K):**
```typescript
import { useAnalytics } from '@/hooks/use-analytics'

export function CommandMenu() {
  const { trackEvent } = useAnalytics()

  const handleCommandSelect = (command: string) => {
    trackEvent({
      category: 'CommandMenu',
      action: 'Comando Ejecutado',
      label: command,
    })
  }

  return (
    // ...
  )
}
```

#### 3. **Eventos Importantes**

```typescript
// Admin
- Abrir Modal Venta
- Venta Registrada (con importe)
- Promoción Creada
- Campaña Enviada
- Cliente Editado
- Cupón Canjeado

// Cliente
- Inicio Registro
- Registro Completado
- QR Descargado
- Perfil Actualizado

// Navegación
- Comando Ejecutado (Cmd+K)
- Tema Cambiado (Dark/Light)
- Tab Navegado

// Errores
- Error API (con endpoint)
- Validación Fallida
- Timeout
```

---

## 3. Error Tracking con Sentry

### 🎯 Objetivo
Capturar y analizar errores en producción para resolverlos rápidamente.

### 📦 Instalación

```bash
npx @sentry/wizard@latest -i nextjs
```

Esto creará automáticamente:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Actualizará `next.config.js`

### 🔧 Configuración Básica

**`.env.local`:**
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=tu-org
SENTRY_PROJECT=qronnect-frontend
SENTRY_AUTH_TOKEN=tu-token
```

**`sentry.client.config.ts`:**
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% de requests

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% de sesiones
  replaysOnErrorSampleRate: 1.0, // 100% cuando hay error

  environment: process.env.NODE_ENV,

  // Ignorar errores conocidos
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],

  beforeSend(event, hint) {
    // Filtrar información sensible
    if (event.request?.headers?.['authorization']) {
      delete event.request.headers['authorization']
    }
    return event
  },
})
```

### 🐛 Usar Sentry en Componentes

**Error Boundary:**
```typescript
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2>Algo salió mal</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Reintentar</button>
    </div>
  )
}
```

**Capturar errores manualmente:**
```typescript
import * as Sentry from '@sentry/nextjs'

async function registrarVenta(data: VentaData) {
  try {
    const response = await fetch('/api/ventas', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    // Capturar en Sentry con contexto
    Sentry.captureException(error, {
      tags: {
        section: 'ventas',
        action: 'registrar',
      },
      extra: {
        data,
        endpoint: '/api/ventas',
      },
    })

    throw error
  }
}
```

---

## 4. Performance Monitoring

### 🎯 Objetivo
Medir y mejorar la velocidad de carga y rendimiento de la app.

### 📦 Herramientas

1. **Vercel Analytics** (ya instalado)
2. **Web Vitals** (nativo)
3. **Sentry Performance** (si usas Sentry)

### 🔧 Web Vitals Tracking

**`app/layout.tsx`:**
```typescript
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
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

**Custom Web Vitals Reporter:**
```typescript
// app/web-vitals.ts
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log en consola (desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log(metric)
    }

    // Enviar a analytics
    const body = JSON.stringify(metric)
    const url = '/api/vitals'

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body)
    } else {
      fetch(url, { body, method: 'POST', keepalive: true })
    }
  })

  return null
}
```

**API Route para recibir vitals:**
```typescript
// app/api/vitals/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  console.log('[Web Vitals]', body)

  // Aquí podrías enviar a un servicio externo
  // await sendToAnalytics(body)

  return NextResponse.json({ ok: true })
}
```

### 📊 Métricas a Monitorear

```typescript
// Core Web Vitals (Google)
- LCP: Largest Contentful Paint (< 2.5s)
- FID: First Input Delay (< 100ms)
- CLS: Cumulative Layout Shift (< 0.1)

// Next.js específicas
- TTFB: Time to First Byte (< 600ms)
- FCP: First Contentful Paint (< 1.8s)
- Next.js Hydration (< 1s)
- Route Change to Render (< 300ms)
```

### 🎯 Lighthouse CI (Opcional)

**Instalar:**
```bash
npm install -D @lhci/cli
```

**`.lighthouserc.js`:**
```javascript
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run build && npm run start',
      url: ['http://localhost:3000', 'http://localhost:3000/admin/login'],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

**Script:**
```json
{
  "scripts": {
    "lighthouse": "lhci autorun"
  }
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Testing E2E
- [ ] Instalar Playwright: `npm install -D @playwright/test`
- [ ] Crear `playwright.config.ts`
- [ ] Crear carpeta `tests/e2e/`
- [ ] Implementar test de login admin
- [ ] Implementar test de registro venta
- [ ] Implementar test de registro cliente
- [ ] Implementar test de accessibility
- [ ] Añadir scripts a `package.json`
- [ ] Ejecutar tests: `npm run test:e2e`

### Analytics
- [ ] Crear `hooks/use-analytics.ts`
- [ ] Trackear evento "Venta Registrada"
- [ ] Trackear evento "Registro Cliente"
- [ ] Trackear eventos de Command Menu
- [ ] Trackear cambio de tema
- [ ] Trackear navegación entre tabs

### Error Tracking (Opcional)
- [ ] Instalar Sentry: `npx @sentry/wizard@latest -i nextjs`
- [ ] Configurar DSN en `.env.local`
- [ ] Crear Error Boundary custom
- [ ] Añadir captura de errores en fetch
- [ ] Configurar ignore patterns
- [ ] Filtrar datos sensibles

### Performance
- [ ] Verificar `<Analytics />` en layout
- [ ] Instalar Speed Insights: `npm i @vercel/speed-insights`
- [ ] Añadir `<SpeedInsights />` a layout
- [ ] Crear custom web vitals reporter (opcional)
- [ ] Configurar Lighthouse CI (opcional)

---

## 🎯 PRIORIDADES

### Must Have (Crítico)
1. ✅ Tests E2E de login
2. ✅ Tests E2E de registro venta
3. ✅ Analytics básico (Vercel)

### Should Have (Recomendado)
4. ✅ Tests de accesibilidad
5. ✅ Error tracking (Sentry)
6. ✅ Custom analytics events

### Nice to Have (Opcional)
7. ⚪ Tests de registro cliente
8. ⚪ Web Vitals custom reporter
9. ⚪ Lighthouse CI

---

## 📈 RESULTADOS ESPERADOS

### Después de Fase 5:

**Testing:**
- ✅ 10+ tests E2E automatizados
- ✅ Cobertura de flujos críticos
- ✅ CI/CD con tests automáticos
- ✅ Prevención de regresiones

**Analytics:**
- ✅ Trackeo de eventos clave
- ✅ Dashboards en Vercel
- ✅ Datos de uso real
- ✅ Decisiones basadas en datos

**Error Tracking:**
- ✅ Errores capturados en producción
- ✅ Stack traces completos
- ✅ Alertas de errores críticos
- ✅ Resolución más rápida

**Performance:**
- ✅ Web Vitals monitoreados
- ✅ Core Web Vitals > 90%
- ✅ Lighthouse Score > 90
- ✅ Optimizaciones data-driven

---

## 🚀 COMANDOS RÁPIDOS

```bash
# Testing E2E
npm run test:e2e              # Ejecutar todos los tests
npm run test:e2e:ui           # Modo UI (recomendado)
npm run test:e2e:headed       # Ver navegador
npm run test:e2e:debug        # Debug mode

# Build & Deploy
npm run build                 # Build con Sentry source maps
npm run start                 # Start en producción
vercel --prod                 # Deploy a Vercel

# Performance
npm run lighthouse            # Lighthouse CI
```

---

## 📚 RECURSOS

### Playwright
- [Docs oficiales](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging](https://playwright.dev/docs/debug)

### Sentry
- [Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Boundaries](https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/)
- [Performance](https://docs.sentry.io/platforms/javascript/guides/nextjs/performance/)

### Vercel Analytics
- [Analytics Docs](https://vercel.com/docs/analytics)
- [Speed Insights](https://vercel.com/docs/speed-insights)

### Web Vitals
- [Web.dev Guide](https://web.dev/vitals/)
- [Next.js Measuring](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)

---

**🎉 Con la Fase 5 completada, tendrás un proyecto de producción completo con testing, analytics y monitoring profesional.**

¿Alguna pregunta sobre la implementación? ¡Mañana lo implementamos! 💪
