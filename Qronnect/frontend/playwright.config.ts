import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para tests E2E
 *
 * Documentación: https://playwright.dev/docs/test-configuration
 */

export default defineConfig({
  testDir: './tests/e2e',

  // Tiempo máximo por test
  timeout: 30 * 1000,

  // Configuración de paralelismo
  fullyParallel: true,

  // Fallar si hay .only en CI
  forbidOnly: !!process.env.CI,

  // Reintentos en caso de fallo
  retries: process.env.CI ? 2 : 0,

  // Workers (paralelismo)
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // Configuración compartida para todos los tests
  use: {
    // Base URL de tu aplicación
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Capturar trace en primer reintento
    trace: 'on-first-retry',

    // Screenshot solo en fallos
    screenshot: 'only-on-failure',

    // Video solo si falla
    video: 'retain-on-failure',

    // Tiempo de espera para acciones
    actionTimeout: 10 * 1000,

    // Tiempo de espera para navegación
    navigationTimeout: 30 * 1000,
  },

  // Proyectos = navegadores diferentes
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Tests en móvil
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // Servidor web local (levanta frontend automáticamente)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
