# ⚡ GUÍA RÁPIDA - Qronnect Frontend

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura del Proyecto

```
frontend/
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Layout principal (Analytics, Vitals)
│   ├── page.tsx         # Landing page
│   ├── admin/           # Panel admin
│   └── get-qr/          # Registro clientes
│
├── components/
│   ├── ui/              # Componentes UI base
│   │   ├── button.tsx   # ✅ Loading states
│   │   ├── skeleton.tsx # ✅ Loaders accesibles
│   │   ├── command-menu.tsx  # ⌘K búsqueda
│   │   ├── responsive-dialog.tsx  # Drawer mobile
│   │   └── theme-toggle.tsx  # Dark mode
│   └── AdminNav.tsx     # Navegación admin
│
├── hooks/
│   ├── use-analytics.ts # 📊 Analytics
│   └── use-media-query.ts  # Responsive
│
├── tests/
│   └── e2e/             # Tests E2E Playwright
│
└── FASE_*_COMPLETADA.md # Documentación
```

---

## 🎯 Comandos Esenciales

### Desarrollo
```bash
npm run dev              # Servidor desarrollo
npm run build           # Build producción
npm run start           # Servidor producción
```

### Testing
```bash
npm run test:e2e        # Ejecutar tests E2E
npm run test:e2e:ui     # Modo UI (RECOMENDADO)
npm run test:e2e:report # Ver reporte
```

---

## 📊 Analytics - Uso Rápido

```typescript
import { useAnalytics } from '@/hooks/use-analytics'

function MyComponent() {
  const { trackEvent, trackSale } = useAnalytics()

  // Evento básico
  trackEvent({
    category: 'UI',
    action: 'Button Clicked',
    label: 'CTA',
  })

  // Venta
  trackSale(25.50, {
    tienda_id: 123,
    puntos: 25,
  })
}
```

---

## 🧪 Testing - Crear un Test

```typescript
// tests/e2e/mi-test.spec.ts
import { test, expect } from '@playwright/test'

test('should load page', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Qronnect/)
})
```

Ejecutar:
```bash
npm run test:e2e:ui
```

---

## 🎨 Componentes Clave

### 1. ResponsiveDialog
```typescript
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'

<ResponsiveDialog
  open={open}
  onOpenChange={setOpen}
  title="Mi Título"
  description="Descripción"
>
  <div>Contenido</div>
</ResponsiveDialog>
```
- Desktop: Modal centrado
- Mobile: Drawer desde abajo

### 2. CommandMenu (Cmd+K)
```typescript
import { CommandMenu } from '@/components/ui/command-menu'

<CommandMenu />
```
- Búsqueda global de acciones
- Atajos de teclado

### 3. ThemeToggle
```typescript
import { ThemeToggle } from '@/components/ui/theme-toggle'

<ThemeToggle />
```
- Toggle light/dark/system

---

## ♿ Accesibilidad

### ARIA Labels
```typescript
<Button aria-label="Cerrar menú">
  <X className="h-4 w-4" aria-hidden="true" />
</Button>
```

### Skip Links
```typescript
import { SkipLink } from '@/components/ui/skip-link'

<SkipLink href="#main-content">
  Saltar al contenido
</SkipLink>
```

### Skeleton Loaders
```typescript
import { Skeleton } from '@/components/ui/skeleton'

{loading ? (
  <Skeleton className="h-4 w-full" />
) : (
  <p>{data}</p>
)}
```

---

## 📱 Responsive

### useMediaQuery Hook
```typescript
import { useMediaQuery } from '@/hooks/use-media-query'

const isMobile = useMediaQuery('(max-width: 768px)')

return isMobile ? <MobileView /> : <DesktopView />
```

### Touch Targets
```css
/* Todos los botones e inputs ya tienen ≥44px en mobile */
<Button size="icon">  {/* 44x44px en mobile */}
  <Icon />
</Button>
```

---

## 📈 Web Vitals

Ya configurado automáticamente en `layout.tsx`:
- LCP, FID, CLS, FCP, TTFB, INP
- Ver en console (dev) o Vercel dashboard (prod)

---

## 🔗 Links Útiles

### Documentación
- `FASE_1_COMPLETADA.md` - Accesibilidad
- `FASE_2_COMPLETADA.md` - Performance
- `FASE_3_COMPLETADA.md` - Dark Mode
- `FASE_4_COMPLETADA.md` - Responsive
- `FASE_5_COMPLETADA.md` - Testing & Analytics
- `TESTING_Y_ANALYTICS.md` - Guía de uso

### Externos
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com)
- [Playwright](https://playwright.dev)

---

## 🎯 Checklist de Features

- ✅ Dark mode funcional
- ✅ Command palette (Cmd+K)
- ✅ Responsive mobile-first
- ✅ Touch targets 44px
- ✅ WCAG 2.1 AA compliant
- ✅ 28 tests E2E
- ✅ Analytics integrado
- ✅ Web Vitals monitoring
- ✅ Loading states accesibles
- ✅ Skip links
- ✅ ARIA labels

---

## 🚨 Troubleshooting

### Tests fallan
```bash
# Aumentar timeout
# En playwright.config.ts: timeout: 60 * 1000
```

### No veo analytics
- Solo funciona en producción (Vercel)
- En dev: ver console logs

### Dark mode no funciona
- Verificar ThemeProvider en layout.tsx
- Verificar variables CSS en globals.css

---

**¿Dudas?** Revisa los archivos `FASE_*_COMPLETADA.md` 📚
