# 💡 EJEMPLOS DE USO - Features Implementadas

## 📊 Analytics

### Ejemplo 1: Trackear Venta Registrada

**Archivo:** `components/admin/RegistrarVentaDialogMejorado.tsx`

```typescript
import { useAnalytics } from '@/hooks/use-analytics'

export function RegistrarVentaDialogMejorado() {
  const { trackSale, trackPoints } = useAnalytics()

  const handleSubmit = async (data: VentaData) => {
    try {
      const result = await registrarVenta(data)

      if (result.success) {
        // Track la venta
        trackSale(result.importe, {
          tienda_id: tienda.id,
          cliente_id: cliente.id,
          puntos: result.puntos_otorgados,
          promocion_id: promocion?.id,
        })

        // Track los puntos ganados
        trackPoints(result.puntos_otorgados, 'ganados', {
          venta_id: result.id,
          cliente_id: cliente.id,
        })

        toast.success('¡Venta registrada!')
        onSuccess()
      }
    } catch (error) {
      toast.error('Error al registrar venta')
    }
  }
}
```

---

### Ejemplo 2: Trackear Promoción Canjeada

**Archivo:** `components/admin/promociones/ValidarCanjeDialog.tsx`

```typescript
import { useAnalytics } from '@/hooks/use-analytics'

export function ValidarCanjeDialog() {
  const { trackPromotion, trackPoints } = useAnalytics()

  const handleCanjear = async (codigo: string) => {
    try {
      const result = await canjearPromocion(codigo)

      if (result.success) {
        // Track la promoción canjeada
        trackPromotion('canjeada', {
          promocion_id: result.promocion.id,
          nombre: result.promocion.nombre,
          puntos_canjeados: result.promocion.puntos,
          cliente_id: result.cliente.id,
        })

        // Track los puntos canjeados
        trackPoints(result.promocion.puntos, 'canjeados', {
          promocion_id: result.promocion.id,
          cliente_id: result.cliente.id,
        })

        toast.success('¡Promoción canjeada!')
      }
    } catch (error) {
      toast.error('Código inválido')
    }
  }
}
```

---

### Ejemplo 3: Trackear Navegación

**Archivo:** `app/admin/dashboard/page.tsx`

```typescript
import { useAnalytics } from '@/hooks/use-analytics'
import { useEffect } from 'react'

export default function AdminDashboard() {
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    trackPageView('/admin/dashboard', {
      tienda_id: tienda?.id,
      timestamp: new Date().toISOString(),
    })
  }, [trackPageView])

  return <div>Dashboard</div>
}
```

---

### Ejemplo 4: Trackear Errores

**Archivo:** Cualquier componente con API calls

```typescript
import { useAnalytics } from '@/hooks/use-analytics'

export function DataFetcher() {
  const { trackError } = useAnalytics()

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      // Track el error
      trackError(error as Error, {
        endpoint: '/api/data',
        context: 'fetchData',
        userId: user?.id,
      })

      toast.error('Error al cargar datos')
    }
  }
}
```

---

### Ejemplo 5: Trackear Interacciones UI

**Archivo:** `components/ui/command-menu.tsx`

```typescript
import { useAnalytics } from '@/hooks/use-analytics'

export function CommandMenu() {
  const { trackInteraction } = useAnalytics()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)

        // Track apertura del command menu
        trackInteraction('Command Menu', 'click', {
          trigger: 'keyboard',
          shortcut: 'Cmd+K',
        })
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [trackInteraction])
}
```

---

## 🧪 Testing E2E

### Ejemplo 1: Test de Login

**Archivo:** `tests/e2e/admin/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Admin Login', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Navegar a login
    await page.goto('/admin/login')

    // Rellenar formulario
    await page.getByLabel(/email/i).fill('admin@test.com')
    await page.getByLabel(/pin/i).fill('1234')

    // Submit
    await page.getByRole('button', { name: /iniciar sesión/i }).click()

    // Verificar redirección
    await expect(page).toHaveURL(/\/admin\/dashboard/)

    // Verificar elemento del dashboard
    await expect(page.getByText(/dashboard|panel/i)).toBeVisible()
  })
})
```

---

### Ejemplo 2: Test de Navegación

**Archivo:** `tests/e2e/navigation.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test('should navigate from landing to registration', async ({ page }) => {
  await page.goto('/')

  // Click en CTA
  const cta = page.getByRole('link', { name: /obtener.*qr/i })
  await cta.click()

  // Verificar redirección
  await expect(page).toHaveURL(/\/get-qr/)

  // Verificar formulario visible
  await expect(page.getByRole('heading', { name: /registro/i })).toBeVisible()
})
```

---

### Ejemplo 3: Test de Accesibilidad

**Archivo:** `tests/e2e/accessibility.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('landing page should be accessible', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // Ejecutar análisis de accesibilidad
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()

  // No debería haber violaciones
  expect(results.violations).toEqual([])
})
```

---

## 🎨 Componentes UI

### Ejemplo 1: ResponsiveDialog

**Uso básico:**

```typescript
import { ResponsiveDialog } from '@/components/ui/responsive-dialog'
import { useState } from 'react'

export function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Abrir Dialog
      </Button>

      <ResponsiveDialog
        open={open}
        onOpenChange={setOpen}
        title="Mi Título"
        description="Descripción del contenido"
      >
        <div className="space-y-4">
          <Input placeholder="Nombre" />
          <Input placeholder="Email" />
        </div>
      </ResponsiveDialog>
    </>
  )
}
```

**Con footer:**

```typescript
<ResponsiveDialog
  open={open}
  onOpenChange={setOpen}
  title="Confirmar Acción"
  description="¿Estás seguro?"
  footer={
    <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleConfirm}>
        Confirmar
      </Button>
    </div>
  }
>
  <p>Esta acción no se puede deshacer.</p>
</ResponsiveDialog>
```

---

### Ejemplo 2: CommandMenu

**Básico (ya está en AdminNav):**

```typescript
import { CommandMenu } from '@/components/ui/command-menu'

export function MyLayout() {
  return (
    <nav>
      {/* Tu navegación */}
      <CommandMenu />
    </nav>
  )
}
```

**Trigger manual:**

```typescript
import { CommandMenu } from '@/components/ui/command-menu'

export function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Abrir búsqueda
      </Button>

      <CommandMenu defaultOpen={open} />
    </>
  )
}
```

---

### Ejemplo 3: ThemeToggle

```typescript
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Header() {
  return (
    <header>
      <nav>
        {/* Otros items */}
        <ThemeToggle />
      </nav>
    </header>
  )
}
```

---

### Ejemplo 4: Skeleton Loaders

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export function DataCard({ loading, data }) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        <CardDescription>{data.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{data.content}</p>
      </CardContent>
    </Card>
  )
}
```

---

### Ejemplo 5: Button con Loading

```typescript
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function SaveButton() {
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await saveData()
      toast.success('Guardado!')
    } catch (error) {
      toast.error('Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSave}
      loading={loading}
      loadingText="Guardando..."
    >
      Guardar
    </Button>
  )
}
```

---

## 📱 Responsive Design

### Ejemplo 1: useMediaQuery Hook

```typescript
import { useMediaQuery } from '@/hooks/use-media-query'

export function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  if (isMobile) {
    return <MobileView />
  }

  if (isTablet) {
    return <TabletView />
  }

  return <DesktopView />
}
```

---

### Ejemplo 2: Responsive Tooltip

```typescript
import { ResponsiveTooltip } from '@/components/ui/responsive-tooltip'

export function IconButton() {
  return (
    <ResponsiveTooltip content="Editar usuario">
      <Button size="icon">
        <Edit className="h-5 w-5" />
      </Button>
    </ResponsiveTooltip>
  )
}
```

---

### Ejemplo 3: Touch Targets Correctos

```typescript
// ❌ MAL - Botón muy pequeño en mobile
<button className="h-8 w-8">
  <Icon />
</button>

// ✅ BIEN - Touch target adecuado
<Button size="icon" className="h-11 md:h-9">
  <Icon className="h-5 w-5" />
</Button>
```

---

## ♿ Accesibilidad

### Ejemplo 1: ARIA Labels

```typescript
// ❌ MAL - Sin contexto
<Button onClick={handleDelete}>
  <Trash className="h-4 w-4" />
</Button>

// ✅ BIEN - Con aria-label
<Button onClick={handleDelete} aria-label="Eliminar cliente">
  <Trash className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">Eliminar</span>
</Button>
```

---

### Ejemplo 2: Skip Links

```typescript
import { SkipLink } from '@/components/ui/skip-link'

export default function Layout({ children }) {
  return (
    <div>
      <SkipLink href="#main-content">
        Saltar al contenido principal
      </SkipLink>

      <nav>{/* Navegación */}</nav>

      <main id="main-content">
        {children}
      </main>
    </div>
  )
}
```

---

### Ejemplo 3: Form Labels

```typescript
// ❌ MAL - Sin label
<input type="email" placeholder="Email" />

// ✅ BIEN - Con Label de Radix
<div>
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="tu@email.com"
    aria-required="true"
  />
</div>
```

---

## 🎯 Patrones Comunes

### Ejemplo 1: Fetch + Loading + Error

```typescript
import { useState, useEffect } from 'react'
import { useAnalytics } from '@/hooks/use-analytics'
import { Skeleton } from '@/components/ui/skeleton'

export function DataFetcher() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { trackError } = useAnalytics()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Error fetching')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err.message)
        trackError(err, { context: 'fetchData' })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [trackError])

  if (loading) {
    return <Skeleton className="h-20 w-full" />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return <div>{JSON.stringify(data)}</div>
}
```

---

### Ejemplo 2: Form Submit + Analytics

```typescript
import { useForm } from 'react-hook-form'
import { useAnalytics } from '@/hooks/use-analytics'
import { Button } from '@/components/ui/button'

export function MyForm() {
  const { register, handleSubmit, formState } = useForm()
  const { trackEvent } = useAnalytics()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)

    try {
      await submitForm(data)

      // Track success
      trackEvent({
        category: 'Forms',
        action: 'Form Submitted',
        label: 'Contact Form',
      })

      toast.success('Formulario enviado!')
    } catch (error) {
      // Track error
      trackError(error, { form: 'contact' })
      toast.error('Error al enviar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name', { required: true })} />
      <Button type="submit" loading={loading}>
        Enviar
      </Button>
    </form>
  )
}
```

---

**¿Más ejemplos?** Revisa los archivos de las fases completadas! 📚
