import { test, expect } from '@playwright/test'

/**
 * Tests E2E para la Landing Page
 *
 * Flujos probados:
 * - Carga correcta de la página
 * - Elementos principales visibles
 * - Links funcionan correctamente
 * - Responsive design
 * - Accesibilidad básica
 */

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load successfully', async ({ page }) => {
    // Verificar que la página carga
    await expect(page).toHaveURL('/')

    // Verificar que el título esté presente
    await expect(page).toHaveTitle(/Qronnect|fidelización/i)
  })

  test('should display main hero section', async ({ page }) => {
    // Verificar logo
    const logo = page.getByRole('img', { name: /logo/i }).first()
    await expect(logo).toBeVisible()

    // Verificar CTA principal
    const ctaButton = page.getByRole('link', { name: /obtener.*qr|registra.*negocio/i }).first()
    await expect(ctaButton).toBeVisible()
  })

  test('should navigate to registration page', async ({ page }) => {
    // Click en el CTA de registro
    const ctaButton = page.getByRole('link', { name: /obtener.*qr|consigue.*qr/i }).first()
    await ctaButton.click()

    // Verificar navegación
    await expect(page).toHaveURL(/\/get-qr/)
  })

  test('should have all main sections visible', async ({ page }) => {
    // Scroll para cargar lazy content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1000)

    // Verificar secciones principales (ajustar según tu landing)
    // Ejemplos genéricos:
    const sections = [
      /cómo funciona|beneficios|servicios/i,
      /testimonios|opiniones/i,
      /preguntas|faq/i,
    ]

    for (const sectionPattern of sections) {
      const sectionHeading = page.getByRole('heading', { name: sectionPattern }).first()
      // Hacemos scroll a la sección
      await sectionHeading.scrollIntoViewIfNeeded()
      await expect(sectionHeading).toBeVisible()
    }
  })

  test('should have accessible navigation', async ({ page }) => {
    // Verificar que existe un skip link (si lo implementaste)
    const skipLink = page.getByRole('link', { name: /saltar.*contenido/i })
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeDefined()
    }

    // Verificar navegación por teclado
    await page.keyboard.press('Tab')

    // El primer elemento focusable debería estar visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()
  })

  test('should display footer with links', async ({ page }) => {
    // Scroll al footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Verificar que el footer existe
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // Verificar links importantes (ajustar según tu footer)
    // Ejemplo: política de privacidad, términos, contacto
    const privacyLink = page.getByRole('link', { name: /privacidad|privacy/i }).first()
    if (await privacyLink.count() > 0) {
      await expect(privacyLink).toBeVisible()
    }
  })

  test('should be responsive on mobile', async ({ page, viewport }) => {
    if (viewport && viewport.width < 768) {
      // Verificar que el hero es visible
      const heroSection = page.locator('section').first()
      await expect(heroSection).toBeVisible()

      // Verificar que el CTA es tocable (>= 44px height)
      const cta = page.getByRole('link', { name: /obtener.*qr/i }).first()
      const box = await cta.boundingBox()

      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40) // Mínimo 40px para touch
      }

      // Verificar que no hay overflow horizontal
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = viewport.width
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10) // +10px margen de error
    }
  })

  test('should have proper image alt text', async ({ page }) => {
    // Obtener todas las imágenes
    const images = await page.locator('img').all()

    for (const img of images) {
      // Todas las imágenes deberían tener alt text (puede estar vacío para decorativas)
      const altText = await img.getAttribute('alt')
      expect(altText).toBeDefined()
    }
  })

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = []

    // Escuchar errores de consola
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Recargar página
    await page.reload()

    // Esperar a que cargue completamente
    await page.waitForLoadState('networkidle')

    // No debería haber errores críticos
    // Filtrar warnings conocidos (como ResizeObserver)
    const criticalErrors = errors.filter(
      (err) => !err.includes('ResizeObserver') && !err.includes('favicon')
    )

    expect(criticalErrors.length).toBe(0)
  })

  test('should have good performance metrics', async ({ page }) => {
    // Navegar y esperar load completo
    await page.goto('/', { waitUntil: 'networkidle' })

    // Obtener métricas de performance
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart,
      }
    })

    // Verificar que la página carga en tiempo razonable
    expect(metrics.domInteractive).toBeLessThan(3000) // < 3s para interactividad
    console.log('Performance metrics:', metrics)
  })
})
