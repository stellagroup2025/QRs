import { test, expect } from '@playwright/test'

/**
 * Tests E2E para autenticación de administradores
 *
 * Flujos probados:
 * - Login exitoso
 * - Login con credenciales incorrectas
 * - Validación de campos vacíos
 * - Logout
 */

test.describe('Admin Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login antes de cada test
    await page.goto('/admin/login')
  })

  test('should display login form correctly', async ({ page }) => {
    // Verificar que los elementos principales estén presentes
    await expect(page.getByRole('heading', { name: /panel de administración/i })).toBeVisible()
    await expect(page.getByText(/acceso para dueños de tienda/i)).toBeVisible()

    // Verificar campos del formulario
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/pin/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible()
  })

  test('should show validation for empty fields', async ({ page }) => {
    // Intentar enviar formulario vacío
    await page.getByRole('button', { name: /iniciar sesión/i }).click()

    // El navegador debería mostrar validación HTML5 o el formulario no debería enviarse
    // Verificar que seguimos en la página de login
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Rellenar con credenciales incorrectas
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/pin/i).fill('0000')

    // Enviar formulario
    await page.getByRole('button', { name: /iniciar sesión/i }).click()

    // Esperar a que aparezca el mensaje de error
    // Nota: Ajusta el selector según el mensaje de error real de tu app
    await expect(page.getByText(/email o pin incorrecto/i)).toBeVisible({ timeout: 10000 })
  })

  test.skip('should login successfully with valid credentials', async ({ page }) => {
    // NOTA: Este test requiere credenciales reales o un mock del backend
    // Descomentarlo cuando tengas un usuario de test configurado

    const testEmail = process.env.TEST_ADMIN_EMAIL || 'admin@lokeyokiera.com'
    const testPin = process.env.TEST_ADMIN_PIN || '1234'

    // Rellenar formulario
    await page.getByLabel(/email/i).fill(testEmail)
    await page.getByLabel(/pin/i).fill(testPin)

    // Enviar
    await page.getByRole('button', { name: /iniciar sesión/i }).click()

    // Verificar redirección al dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 })

    // Verificar que estamos en el dashboard (buscar algún elemento característico)
    await expect(page.getByRole('heading', { name: /dashboard|panel|inicio/i })).toBeVisible()
  })

  test.skip('should logout successfully', async ({ page }) => {
    // NOTA: Este test requiere estar autenticado primero
    // Primero hacer login
    const testEmail = process.env.TEST_ADMIN_EMAIL || 'admin@lokeyokiera.com'
    const testPin = process.env.TEST_ADMIN_PIN || '1234'

    await page.getByLabel(/email/i).fill(testEmail)
    await page.getByLabel(/pin/i).fill(testPin)
    await page.getByRole('button', { name: /iniciar sesión/i }).click()

    // Esperar a estar en dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/)

    // Buscar y hacer click en logout
    // Ajustar selector según tu UI (puede ser un menú desplegable, botón, etc.)
    await page.getByRole('button', { name: /cerrar sesión|salir|logout/i }).click()

    // Verificar redirección a login
    await expect(page).toHaveURL(/\/admin\/login/)

    // Verificar que no hay token en localStorage
    const token = await page.evaluate(() => localStorage.getItem('admin_token'))
    expect(token).toBeNull()
  })

  test('should have proper accessibility labels', async ({ page }) => {
    // Verificar que los campos tengan labels accesibles
    const emailInput = page.getByLabel(/email/i)
    const pinInput = page.getByLabel(/pin/i)

    await expect(emailInput).toHaveAttribute('type', 'email')
    await expect(pinInput).toHaveAttribute('type', 'password')

    // Verificar que el botón no esté deshabilitado inicialmente
    const submitButton = page.getByRole('button', { name: /iniciar sesión/i })
    await expect(submitButton).toBeEnabled()
  })

  test('should show loading state during login', async ({ page }) => {
    // Rellenar formulario
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/pin/i).fill('1234')

    // Click en submit
    const submitButton = page.getByRole('button', { name: /iniciar sesión/i })
    await submitButton.click()

    // Verificar estado de carga (spinner o texto "Iniciando...")
    // Nota: Ajusta según tu implementación
    await expect(submitButton).toBeDisabled()
  })

  test('should be responsive on mobile', async ({ page, viewport }) => {
    // Solo ejecutar en viewports mobile
    if (viewport && viewport.width < 768) {
      // Verificar que el card sea responsive
      const card = page.locator('form').first()
      await expect(card).toBeVisible()

      // Verificar que los inputs sean táctiles (height >= 44px)
      const emailInput = page.getByLabel(/email/i)
      const box = await emailInput.boundingBox()

      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    }
  })
})
