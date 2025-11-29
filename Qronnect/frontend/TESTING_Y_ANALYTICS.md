# 🧪 Testing & Analytics - Guía Rápida

## 🚀 Comandos Rápidos

### Testing E2E

```bash
# Ejecutar todos los tests
npm run test:e2e

# Modo UI interactivo (RECOMENDADO)
npm run test:e2e:ui

# Ver navegador durante tests
npm run test:e2e:headed

# Debug un test específico
npm run test:e2e:debug tests/e2e/admin/auth.spec.ts

# Ver último reporte
npm run test:e2e:report
```

---

## 📊 Analytics - Uso en Componentes

### Importar el hook

```typescript
import { useAnalytics } from '@/hooks/use-analytics'

function MyComponent() {
  const { trackEvent, trackSale, trackPoints } = useAnalytics()
}
```

### Ejemplos de uso

#### 1. Evento básico
```typescript
trackEvent({
  category: 'UI',
  action: 'Button Clicked',
  label: 'CTA Principal',
})
```

#### 2. Trackear venta
```typescript
trackSale(25.50, {
  tienda_id: 123,
  cliente_id: 456,
  puntos: 25,
  promocion_id: 10,
})
```

#### 3. Trackear puntos
```typescript
trackPoints(50, 'ganados', {
  venta_id: 789,
  cliente_id: 456,
})

trackPoints(100, 'canjeados', {
  promocion_id: 10,
})
```

#### 4. Trackear promoción
```typescript
trackPromotion('canjeada', {
  promocion_id: 10,
  puntos: 100,
  cliente_id: 456,
})
```

#### 5. Trackear error
```typescript
try {
  await fetchData()
} catch (error) {
  trackError(error, {
    context: 'fetchData',
    userId: user.id,
  })
}
```

#### 6. Trackear interacción UI
```typescript
trackInteraction('Command Menu', 'click', {
  trigger: 'keyboard',
  shortcut: 'Cmd+K',
})
```

---

## 📈 Ver Analytics

### En Vercel Dashboard

1. Ve a https://vercel.com
2. Selecciona tu proyecto
3. Click en "Analytics" (sidebar)
4. Verás:
   - Eventos custom
   - Page views
   - Web Vitals
   - Top paths

### En Desarrollo (Console)

```bash
npm run dev
# Abre DevTools > Console
# Verás logs:
# [Analytics] 📊 { action: 'Venta Registrada', ... }
# [Web Vitals] 📊 { name: 'LCP', value: 1200, ... }
```

---

## 🎯 Categorías de Eventos

| Categoría | Uso | Ejemplo |
|-----------|-----|---------|
| `Admin` | Acciones de admin | Logout, cambio de config |
| `Ventas` | Registro de ventas | Venta registrada |
| `Puntos` | Puntos ganados/canjeados | Puntos otorgados |
| `Promociones` | CRUD promociones | Promoción creada, canjeada |
| `Campañas` | Envío de campañas | Campaña enviada |
| `Cliente` | Acciones de cliente | Registro, perfil |
| `Navegación` | Page views | Navegación a /admin/dashboard |
| `UI` | Interacciones | Click, hover, scroll |
| `Error` | Errores | Error de API, validación |
| `Performance` | Web Vitals | LCP, FID, CLS |

---

## ⚡ Web Vitals

Se monitorizan automáticamente (ya está en el layout):

- **LCP**: Largest Contentful Paint (≤ 2.5s good)
- **FID**: First Input Delay (≤ 100ms good)
- **CLS**: Cumulative Layout Shift (≤ 0.1 good)
- **FCP**: First Contentful Paint (≤ 1.8s good)
- **TTFB**: Time to First Byte (≤ 600ms good)
- **INP**: Interaction to Next Paint (≤ 200ms good)

Ver en:
- Consola (desarrollo)
- Vercel Speed Insights (producción)

---

## 🧪 Tests Disponibles

### Admin Authentication (8 tests)
- Display login form
- Validation
- Error handling
- Accessibility
- Loading states
- Responsive

### Landing Page (10 tests)
- Load & rendering
- Navigation
- SEO (alt text)
- Performance
- Responsive
- Console errors

### Accessibility (10 tests)
- WCAG 2.1 AA compliance
- Color contrast
- Keyboard navigation
- ARIA landmarks
- Form labels
- Mobile accessibility

**Total: 28 tests**

---

## 🔧 Configuración Avanzada

### Variables de entorno para tests

Crea `.env.test.local`:

```env
TEST_ADMIN_EMAIL=admin@test.com
TEST_ADMIN_PIN=1234
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

### Habilitar tests skip

Edita `tests/e2e/admin/auth.spec.ts`:

```typescript
// Cambiar de:
test.skip('should login successfully', ...)

// A:
test('should login successfully', ...)
```

---

## 📚 Recursos

- [Playwright Docs](https://playwright.dev)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Web Vitals](https://web.dev/vitals)
- [axe-core](https://www.deque.com/axe/)

---

## 🐛 Troubleshooting

### Los tests fallan con "element not found"

```bash
# Aumenta timeout en playwright.config.ts
timeout: 60 * 1000, // 60 segundos
```

### No veo eventos en Vercel Analytics

1. Asegúrate de estar en producción (Vercel)
2. Espera 5-10 minutos (hay delay)
3. Verifica que `<Analytics />` esté en layout.tsx

### Web Vitals no aparecen

1. Solo funcionan en producción
2. Usa Vercel Speed Insights
3. O revisa console en desarrollo

---

**¿Preguntas?** Revisa `FASE_5_COMPLETADA.md` para más detalles.
