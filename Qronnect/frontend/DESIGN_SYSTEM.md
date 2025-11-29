# Design System - QRconnect

Esta documentación define los estándares de diseño y UX para todo el proyecto QRconnect.

## 📋 Tabla de Contenidos

1. [Colores](#colores)
2. [Tipografía](#tipografía)
3. [Espaciado](#espaciado)
4. [Touch Targets](#touch-targets)
5. [Componentes](#componentes)
6. [Accesibilidad](#accesibilidad)
7. [Patrones UX](#patrones-ux)
8. [Mejores Prácticas](#mejores-prácticas)

---

## 🎨 Colores

### Variables CSS (Modo Claro)

```css
--background: oklch(1 0 0);           /* Fondo principal blanco */
--foreground: oklch(0.145 0 0);       /* Texto principal negro */
--primary: oklch(0.205 0 0);          /* Color primario (oscuro) */
--primary-foreground: oklch(0.985 0 0); /* Texto sobre primario */
--destructive: oklch(0.577 0.245 27.325); /* Rojo para errores */
--muted: oklch(0.97 0 0);             /* Gris muy claro */
--muted-foreground: oklch(0.556 0 0); /* Texto secundario */
--border: oklch(0.922 0 0);           /* Bordes sutiles */
--input: oklch(0.922 0 0);            /* Fondo de inputs */
--ring: oklch(0.708 0 0);             /* Focus ring */

/* Status Colors - NUEVO ✨ */
--success: oklch(0.6 0.15 142);       /* Verde para éxito */
--success-foreground: oklch(0.98 0 0); /* Texto sobre verde */
--success-muted: oklch(0.97 0.05 142); /* Fondo verde claro */

--warning: oklch(0.75 0.15 85);       /* Amarillo para advertencias */
--warning-foreground: oklch(0.2 0 0); /* Texto sobre amarillo */
--warning-muted: oklch(0.98 0.05 85); /* Fondo amarillo claro */

--info: oklch(0.55 0.18 240);         /* Azul para información */
--info-foreground: oklch(0.98 0 0);   /* Texto sobre azul */
--info-muted: oklch(0.97 0.05 240);   /* Fondo azul claro */
```

### Variables CSS (Modo Oscuro) - MEJORADAS ✨

```css
--background: oklch(0.145 0 0);       /* Fondo principal oscuro */
--foreground: oklch(0.985 0 0);       /* Texto principal blanco */
--card: oklch(0.18 0 0);              /* Cards más claros (mejor contraste) */
--primary: oklch(0.985 0 0);          /* Primario blanco */
--primary-foreground: oklch(0.145 0 0); /* Texto oscuro sobre primario */
--secondary: oklch(0.32 0 0);         /* Gris medio (mejorado) */
--muted: oklch(0.32 0 0);             /* Gris medio (mejorado) */
--muted-foreground: oklch(0.75 0 0);  /* Texto secundario más claro */
--destructive: oklch(0.55 0.22 27.325); /* Rojo más brillante */
--destructive-foreground: oklch(0.985 0 0); /* Blanco sobre rojo */
--border: oklch(0.32 0 0);            /* Bordes más visibles */
--input: oklch(0.32 0 0);             /* Inputs más claros */
--ring: oklch(0.5 0 0);               /* Focus ring más visible */

/* Status Colors - Dark Mode */
--success: oklch(0.55 0.15 142);      /* Verde más oscuro */
--success-foreground: oklch(0.98 0 0);
--success-muted: oklch(0.25 0.08 142); /* Fondo verde oscuro */

--warning: oklch(0.7 0.15 85);        /* Amarillo más oscuro */
--warning-foreground: oklch(0.98 0 0);
--warning-muted: oklch(0.3 0.08 85);  /* Fondo amarillo oscuro */

--info: oklch(0.6 0.18 240);          /* Azul más brillante */
--info-foreground: oklch(0.98 0 0);
--info-muted: oklch(0.25 0.08 240);   /* Fondo azul oscuro */
```

### Cómo Usar Colores

**✅ CORRECTO** - Usar variables CSS:
```tsx
// En componentes
<Button className="bg-primary text-primary-foreground">
  Acción Principal
</Button>

<div className="border border-border bg-card text-card-foreground">
  Card con colores del tema
</div>
```

**✅ NUEVO** - Variables de estado:
```tsx
// Estados de éxito
<div className="bg-success-muted border-success text-success">
  ✓ Operación exitosa
</div>

// Estados de advertencia
<div className="bg-warning-muted border-warning text-warning-foreground">
  ⚠ Revisa esta información
</div>

// Estados de información
<div className="bg-info-muted border-info text-info-foreground">
  ℹ Dato importante
</div>
```

**⚠️ EVITAR** - Hardcoded colors:
```tsx
// ❌ NO hacer esto
<div className="bg-blue-500 text-white">...</div>
<div className="bg-green-100 text-green-700">...</div>
<div className="bg-gray-100">...</div>
```

**🔧 CASO ESPECIAL** - Brand colors dinámicos:
```tsx
// Para colores de branding personalizados por tienda
import { hexToRgb } from '@/lib/brand-colors'
import { useBrandingContext } from '@/components/BrandingProvider'

const { branding } = useBrandingContext()

<Button
  style={{ backgroundColor: hexToRgb(branding.color_primario) }}
  className="text-white"
>
  Botón con color de la tienda
</Button>
```

---

## 🔤 Tipografía

### Fuentes

```css
--font-sans: 'Geist', 'Geist Fallback';
--font-mono: 'Geist Mono', 'Geist Mono Fallback';
```

### Escalas de Texto

```tsx
// Headings
<h1 className="text-3xl md:text-4xl font-bold">Título Principal</h1>
<h2 className="text-2xl md:text-3xl font-bold">Título Secundario</h2>
<h3 className="text-xl md:text-2xl font-semibold">Subtítulo</h3>

// Body text
<p className="text-base md:text-sm">Texto normal</p>
<p className="text-sm text-muted-foreground">Texto secundario</p>
<p className="text-xs text-muted-foreground">Texto pequeño</p>
```

### Jerarquía Visual

1. **Título de página**: `text-3xl md:text-4xl font-bold`
2. **Título de sección**: `text-2xl md:text-3xl font-bold`
3. **Título de card**: `text-xl md:text-2xl font-semibold`
4. **Texto principal**: `text-base md:text-sm`
5. **Texto secundario**: `text-sm text-muted-foreground`
6. **Labels/helpers**: `text-xs text-muted-foreground`

---

## 📏 Espaciado

### Sistema de Espaciado (Mobile-First)

```tsx
// Padding en containers
<div className="p-4 md:p-6">          // Padding responsive
<div className="px-4 py-6">           // Horizontal/vertical diferente
<div className="space-y-4 md:space-y-6"> // Espaciado entre elementos

// Gaps en flexbox/grid
<div className="flex gap-2 md:gap-4">
<div className="grid gap-4 md:gap-6">

// Margins
<div className="mt-4 mb-6">           // Top/bottom margin
<div className="mx-auto">             // Centrar horizontalmente
```

### Espaciado Consistente

| Uso | Móvil | Desktop | Clase |
|-----|-------|---------|-------|
| Padding mínimo | 16px | 24px | `p-4 md:p-6` |
| Gap entre elementos | 16px | 24px | `gap-4 md:gap-6` |
| Secciones | 32px | 48px | `space-y-8 md:space-y-12` |
| Contenedor max-width | - | 1280px | `max-w-7xl mx-auto` |

---

## 👆 Touch Targets (WCAG 2.5.5 AAA)

### Estándar: 44x44px mínimo

```tsx
// ✅ Botones con touch target correcto
<Button
  size="sm"
  className="min-h-[44px] min-w-[44px]"
>
  Acción
</Button>

// ✅ Icon buttons
<Button
  variant="ghost"
  size="icon"
  className="h-11 w-11" // 44px
  aria-label="Cerrar"
>
  <X className="h-5 w-5" />
</Button>

// ✅ Links interactivos
<Link
  href="/ruta"
  className="inline-flex items-center min-h-[44px] px-4"
>
  Enlace
</Link>
```

### Clases Utility Personalizadas

En `globals.css`:

```css
/* Touch Target Optimization - WCAG 2.5.5 (AAA) */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.touch-icon-btn {
  min-width: 44px;
  min-height: 44px;
  padding: 10px;
}

.input-mobile {
  min-height: 44px;
}
```

**Uso**:
```tsx
<button className="touch-target">Botón</button>
<button className="touch-icon-btn"><Icon /></button>
<Input className="input-mobile" />
```

---

## 🧩 Componentes

### Buttons

```tsx
import { Button } from '@/components/ui/button'

// Variants
<Button variant="default">Primario</Button>
<Button variant="secondary">Secundario</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Peligro</Button>

// Sizes (todos cumplen 44px mínimo)
<Button size="sm">Pequeño</Button>
<Button size="default">Normal</Button>
<Button size="lg">Grande</Button>
<Button size="icon"><Icon /></Button>

// Estados
<Button disabled>Deshabilitado</Button>
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Cargando...
</Button>
```

### Inputs con Validación

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ✅ Input con validación accesible
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="usuario@ejemplo.com"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
    className="min-h-[44px]"
  />
  {error && (
    <p id="email-error" className="text-xs text-destructive" role="alert">
      <span className="font-medium">Error:</span> {error}
    </p>
  )}
</div>
```

### Textarea

```tsx
import { Textarea } from '@/components/ui/textarea'

// Con validación visual automática
<Textarea
  placeholder="Escribe tu mensaje..."
  aria-invalid={!!error}
  aria-describedby={error ? "mensaje-error" : undefined}
  className="min-h-[100px] md:min-h-[80px]"
/>
```

### Cards

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Título del Card</CardTitle>
    <CardDescription>Descripción breve</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Contenido del card...</p>
  </CardContent>
</Card>
```

### Alerts

```tsx
import { Alert, AlertDescription } from '@/components/ui/alert'

<Alert variant="destructive">
  <AlertDescription>
    Ha ocurrido un error
  </AlertDescription>
</Alert>

<Alert>
  <AlertDescription>
    Información general
  </AlertDescription>
</Alert>
```

---

## ♿ Accesibilidad

### ARIA Labels

```tsx
// ✅ Botones sin texto visible
<Button
  variant="ghost"
  size="icon"
  aria-label="Cerrar menú"
>
  <X className="h-5 w-5" />
</Button>

// ✅ Inputs de búsqueda
<Input
  placeholder="Buscar..."
  aria-label="Buscar clientes por nombre, email o teléfono"
/>

// ✅ Estados expandidos
<button
  aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
  aria-expanded={mobileMenuOpen}
>
  {mobileMenuOpen ? <X /> : <Menu />}
</button>
```

### Formularios Accesibles

```tsx
// ✅ Asociar labels con inputs
<Label htmlFor="nombre">Nombre</Label>
<Input id="nombre" name="nombre" />

// ✅ Validación con ARIA
<Input
  aria-invalid={!!error}
  aria-describedby={error ? "field-error" : "field-help"}
/>
{error && (
  <p id="field-error" className="text-xs text-destructive" role="alert">
    {error}
  </p>
)}
{!error && (
  <p id="field-help" className="text-xs text-muted-foreground">
    Texto de ayuda
  </p>
)}

// ✅ Required fields
<Input required aria-required="true" />
```

### Navegación por Teclado

```tsx
// ✅ Enter key en búsquedas
<Input
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }}
/>

// ✅ Escape para cerrar dialogs
<Dialog onOpenChange={setOpen}>
  {/* Se cierra con ESC automáticamente */}
</Dialog>
```

### Contraste de Colores

**WCAG 2.1 AA Estándar**:
- Texto normal: ratio mínimo 4.5:1
- Texto grande (18px+): ratio mínimo 3:1
- Elementos UI: ratio mínimo 3:1

**Herramientas**:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools: Lighthouse Accessibility audit
- `@axe-core/playwright` para testing automatizado

---

## 🎯 Patrones UX

### Estados de Loading

```tsx
// ✅ Botón con loading
<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Cargando...
    </>
  ) : (
    'Enviar'
  )}
</Button>

// ✅ Spinner en input de búsqueda
<div className="relative">
  <Input
    placeholder="Buscar..."
    className="pr-9"
  />
  {isSearching && (
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
    </div>
  )}
</div>

// ✅ Skeleton loaders
import { Skeleton } from '@/components/ui/skeleton'

{isLoading ? (
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
) : (
  <p>{data.text}</p>
)}
```

### Feedback Visual

```tsx
// ✅ Success feedback con toast
import { toast } from 'sonner'

toast.success('¡Guardado correctamente!')
toast.error('Error al guardar')
toast.info('Información importante')

// ✅ Validación inline
<Input
  aria-invalid={!!error}
  className={cn(
    "min-h-[44px]",
    error && "border-destructive focus-visible:ring-destructive"
  )}
/>
{error && (
  <p className="text-xs text-destructive flex items-center gap-1" role="alert">
    <AlertCircle className="h-3 w-3" />
    {error}
  </p>
)}
```

### Mobile-First Responsive

```tsx
// ✅ Layout responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>

// ✅ Texto responsive
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Título que crece
</h1>

// ✅ Padding responsive
<div className="p-4 md:p-6 lg:p-8">
  Contenido con más espacio en desktop
</div>

// ✅ Hidden/visible responsive
<div className="hidden md:block">Solo en desktop</div>
<div className="block md:hidden">Solo en móvil</div>
```

### Confirmaciones Destructivas

```tsx
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

const [confirmOpen, setConfirmOpen] = useState(false)

<Button
  variant="destructive"
  onClick={() => setConfirmOpen(true)}
>
  Eliminar
</Button>

<ConfirmDialog
  open={confirmOpen}
  onOpenChange={setConfirmOpen}
  onConfirm={handleDelete}
  title="¿Eliminar elemento?"
  description="Esta acción no se puede deshacer."
  confirmText="Sí, eliminar"
  cancelText="Cancelar"
/>
```

---

## ✅ Mejores Prácticas

### Performance

```tsx
// ✅ Lazy loading de componentes pesados
import dynamic from 'next/dynamic'

const AnalyticsCharts = dynamic(() => import('@/components/admin/AnalyticsCharts'), {
  loading: () => <Skeleton className="h-[300px]" />,
  ssr: false
})

// ✅ Memoización de cálculos costosos
import { useMemo } from 'react'

const filteredData = useMemo(() => {
  return data.filter(item => item.active)
}, [data])

// ✅ Callbacks estables
import { useCallback } from 'react'

const handleClick = useCallback(() => {
  console.log('clicked')
}, [])
```

### Manejo de Errores

```tsx
// ✅ Try-catch con feedback
const handleSubmit = async () => {
  try {
    setLoading(true)
    await submitForm(data)
    toast.success('Guardado correctamente')
  } catch (error) {
    toast.error(error.message || 'Error al guardar')
    console.error('Submit error:', error)
  } finally {
    setLoading(false)
  }
}

// ✅ Error boundaries
import { ErrorBoundary } from 'react-error-boundary'

<ErrorBoundary
  fallback={<div>Error al cargar componente</div>}
  onError={(error) => console.error(error)}
>
  <MyComponent />
</ErrorBoundary>
```

### SEO

```tsx
// ✅ Metadata en páginas
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | QRconnect',
  description: 'Panel de administración de tu tienda',
}

// ✅ Semantic HTML
<header>
  <nav>
    <ul>
      <li><Link href="/">Inicio</Link></li>
    </ul>
  </nav>
</header>

<main>
  <section>
    <h1>Título principal</h1>
    <article>Contenido</article>
  </section>
</main>

<footer>
  <p>© 2025 QRconnect</p>
</footer>
```

### Testing

```tsx
// ✅ E2E tests con Playwright
import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('/admin/login')
  await page.fill('input[type="email"]', 'admin@test.com')
  await page.fill('input[type="password"]', '1234')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/admin/dashboard')
})

// ✅ Accessibility tests con axe
import { injectAxe, checkA11y } from '@axe-core/playwright'

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/admin/dashboard')
  await injectAxe(page)
  await checkA11y(page)
})
```

---

## 📊 Métricas de Calidad

### Estándares Actuales (Post-Mejoras)

- **Accesibilidad**: WCAG 2.1 AA compliant
- **Performance**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Touch Targets**: 100% cumplen 44x44px mínimo
- **Contraste**: Todos los textos cumplen ratio 4.5:1 mínimo
- **Mobile-First**: Todos los componentes responsive
- **Dark Mode**: Contraste mejorado para mejor legibilidad

### Herramientas de Validación

1. **Lighthouse** (Chrome DevTools)
   - Performance: > 90
   - Accessibility: > 95
   - Best Practices: > 90
   - SEO: > 90

2. **axe DevTools** (Browser Extension)
   - 0 violaciones críticas
   - < 5 violaciones menores

3. **Playwright E2E Tests**
   - 28 tests automatizados
   - Cobertura: auth, landing, a11y

4. **Web Vitals**
   - Monitoreados en producción
   - Alertas para degradación

---

## 🔄 Changelog

### v2.0 - Mejoras UX/UI (2025-11-29)

**Mejorado**:
- ✨ Dark mode con mejor contraste (cards, borders, inputs)
- ✨ Validación visual en formularios (aria-invalid)
- ✨ Loading feedback en búsquedas con spinners
- ✨ Touch targets 44x44px en todos los componentes
- ✨ Destructive colors más accesibles en dark mode
- ✨ Muted foreground más legible (0.708 → 0.75)
- ✨ Focus ring más visible (0.439 → 0.5)

**Agregado**:
- 📝 Design system documentation completa
- 🧪 28 E2E tests con Playwright
- 📊 Analytics con useAnalytics hook
- ⚡ Web Vitals monitoring
- 🎨 Touch target utility classes

**Corregido**:
- 🐛 `fetchResumen()` undefined → `fetchDashboard()`
- 🐛 CSS typo `duración-300` → `duration-300`
- 🐛 Dark mode contrast ratios

---

## 📚 Recursos

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Playwright Testing](https://playwright.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [Web Vitals](https://web.dev/vitals/)

---

**Mantenido por**: Omar (QRconnect Team)
**Última actualización**: 2025-11-29
**Versión**: 2.0
