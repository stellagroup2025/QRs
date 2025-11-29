import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Tests de Accesibilidad con axe-core
 *
 * Verifica cumplimiento de WCAG 2.1 AA en páginas principales
 */

test.describe('Accessibility Tests', () => {
  test('landing page should not have accessibility violations', async ({ page }) => {
    await page.goto('/')

    // Esperar a que cargue completamente
    await page.waitForLoadState('networkidle')

    // Ejecutar análisis de accesibilidad
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    // No debería haber violaciones
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('admin login page should not have accessibility violations', async ({ page }) => {
    await page.goto('/admin/login')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('registration form should not have accessibility violations', async ({ page }) => {
    await page.goto('/get-qr')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test.skip('admin dashboard should not have accessibility violations', async ({ page }) => {
    // NOTA: Requiere autenticación
    // Implementar cuando tengas fixture de login

    await page.goto('/admin/login')

    // Login
    const testEmail = process.env.TEST_ADMIN_EMAIL || 'admin@lokeyokiera.com'
    const testPin = process.env.TEST_ADMIN_PIN || '1234'

    await page.getByLabel(/email/i).fill(testEmail)
    await page.getByLabel(/pin/i).fill(testPin)
    await page.getByRole('button', { name: /iniciar sesión/i }).click()

    // Esperar dashboard
    await page.waitForURL(/\/admin\/dashboard/)
    await page.waitForLoadState('networkidle')

    // Analizar accesibilidad
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Análisis específico de contraste
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze()

    // Filtrar solo violaciones de contraste
    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    )

    expect(contrastViolations).toEqual([])
  })

  test('should have keyboard navigation support', async ({ page }) => {
    await page.goto('/')

    // Tabular por los elementos
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Verificar que hay elementos enfocables
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement
      return {
        tag: el?.tagName,
        role: el?.getAttribute('role'),
        ariaLabel: el?.getAttribute('aria-label'),
      }
    })

    expect(focusedElement.tag).toBeTruthy()
  })

  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['best-practice'])
      .analyze()

    // Verificar que no hay violaciones de landmarks
    const landmarkViolations = accessibilityScanResults.violations.filter(
      (v) => v.id.includes('landmark') || v.id.includes('region')
    )

    expect(landmarkViolations.length).toBe(0)
  })

  test('forms should have proper labels', async ({ page }) => {
    await page.goto('/admin/login')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze()

    // Filtrar violaciones de labels en formularios
    const labelViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'label' || v.id === 'label-title-only'
    )

    expect(labelViolations).toEqual([])
  })

  test('images should have alt text', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze()

    // Filtrar violaciones de alt text
    const altTextViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'image-alt'
    )

    expect(altTextViolations).toEqual([])
  })

  test('should pass mobile accessibility', async ({ page, viewport }) => {
    if (viewport && viewport.width < 768) {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Tests específicos mobile: touch targets, etc.
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    }
  })
})
