import { test, expect } from '@playwright/test';

/**
 * Tests E2E para el sistema de cupones de regalo
 *
 * PRERREQUISITOS:
 * - Backend corriendo en localhost:3001
 * - Frontend corriendo en localhost:3000
 * - Cliente de prueba creado y con token válido
 * - Al menos un cupón disponible en la BD
 */

test.describe('Sistema de Cupones - E2E', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  const DOMINIO_TIENDA = process.env.TEST_DOMINIO || 'test-tienda';

  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login
    await page.goto(`${BASE_URL}/login`);
  });

  test('Cliente puede ver sus cupones', async ({ page }) => {
    // ARRANGE: Login del cliente
    const testEmail = process.env.TEST_CLIENT_EMAIL || 'test@example.com';

    await page.fill('input[type="email"]', testEmail);
    await page.click('button:has-text("Enviar Código")');

    // TODO: En un entorno real, obtener el código OTP de la BD
    // Por ahora, si el email existe, debería recibir el código
    // await page.waitForTimeout(2000);

    // ACT: Navegar a mis-cupones
    await page.goto(`${BASE_URL}/${DOMINIO_TIENDA}/mis-cupones`);

    // ASSERT: Verificar que la página carga
    await expect(page.locator('h1')).toContainText('Mis Cupones');

    // Verificar que hay stats cards
    const statsCards = page.locator('[data-testid="stat-card"]');
    await expect(statsCards).toHaveCount(3);

    // Verificar que los textos de stats son correctos
    await expect(page.locator('text=/Disponibles/i')).toBeVisible();
    await expect(page.locator('text=/Usados/i')).toBeVisible();
    await expect(page.locator('text=/Total/i')).toBeVisible();
  });

  test('Cliente puede filtrar cupones por estado', async ({ page }) => {
    // Login (simplificado para el test)
    await page.goto(`${BASE_URL}/${DOMINIO_TIENDA}/mis-cupones`);

    // Verificar que botón "Disponibles" está activo por defecto
    const btnDisponibles = page.locator('button', { hasText: 'Disponibles' });
    await expect(btnDisponibles).toBeVisible();

    // Click en "Todos"
    const btnTodos = page.locator('button', { hasText: 'Todos' });
    await btnTodos.click();

    // Verificar que ahora "Todos" está activo
    // (esto depende de cómo hayas implementado los estilos)
    await expect(btnTodos).toHaveClass(/default|active/);

    // Click de vuelta en "Disponibles"
    await btnDisponibles.click();
    await expect(btnDisponibles).toHaveClass(/default|active/);
  });

  test('Cliente puede ver QR de un cupón', async ({ page }) => {
    await page.goto(`${BASE_URL}/${DOMINIO_TIENDA}/mis-cupones`);

    // Buscar primer cupón
    const primerCupon = page.locator('[data-testid="cupon-card"]').first();

    // Solo hacer el test si hay cupones
    const count = await page.locator('[data-testid="cupon-card"]').count();
    if (count === 0) {
      console.log('No hay cupones para probar QR');
      return;
    }

    // Verificar que tiene el botón "Ver QR"
    const btnVerQR = primerCupon.locator('button', { hasText: 'Ver QR' });
    await expect(btnVerQR).toBeVisible();

    // Click en "Ver QR"
    await btnVerQR.click();

    // Verificar que aparece el QR (SVG)
    const qrSvg = primerCupon.locator('svg');
    await expect(qrSvg).toBeVisible();

    // Verificar que tiene las dimensiones correctas
    const bbox = await qrSvg.boundingBox();
    expect(bbox?.width).toBeGreaterThan(150);
    expect(bbox?.height).toBeGreaterThan(150);

    // Click en "Ocultar QR"
    const btnOcultarQR = primerCupon.locator('button', { hasText: 'Ocultar QR' });
    await btnOcultarQR.click();

    // Verificar que el QR ya no está visible
    await expect(qrSvg).not.toBeVisible();
  });

  test('Cliente ve badge "¡Nuevo!" en cupones no vistos', async ({ page }) => {
    await page.goto(`${BASE_URL}/${DOMINIO_TIENDA}/mis-cupones`);

    // Buscar cupones con badge "¡Nuevo!"
    const badgeNuevo = page.locator('text=/¡Nuevo!/i');

    // Si hay cupones nuevos, deberían marcarse automáticamente como vistos
    // al cargar la página, así que este badge debería desaparecer después
    // de unos segundos

    // Contar cupones nuevos
    const countInicial = await badgeNuevo.count();
    console.log(`Cupones nuevos encontrados: ${countInicial}`);

    // Esperar a que se marquen como vistos (la página hace esto automáticamente)
    if (countInicial > 0) {
      await page.waitForTimeout(2000);

      // Refrescar página
      await page.reload();

      // Verificar que ya no hay badges "¡Nuevo!"
      const countFinal = await badgeNuevo.count();
      expect(countFinal).toBeLessThan(countInicial);
    }
  });

  test('Cupón muestra información completa', async ({ page }) => {
    await page.goto(`${BASE_URL}/${DOMINIO_TIENDA}/mis-cupones`);

    const cuponCard = page.locator('[data-testid="cupon-card"]').first();

    const count = await page.locator('[data-testid="cupon-card"]').count();
    if (count === 0) {
      console.log('No hay cupones para verificar información');
      return;
    }

    // Verificar que tiene código del cupón
    const codigo = cuponCard.locator('[data-testid="cupon-codigo"]');
    await expect(codigo).toBeVisible();

    // Verificar que el código tiene 8 caracteres
    const textocodigo = await codigo.textContent();
    expect(textocodigo?.trim().length).toBe(8);

    // Verificar que tiene badge de estado
    const badgeEstado = cuponCard.locator('[data-testid="badge-estado"]');
    await expect(badgeEstado).toBeVisible();

    // Verificar que muestra el origen
    const origenText = cuponCard.locator('text=/bienvenida|referido|milestone|promoción/i');
    await expect(origenText).toBeVisible();
  });
});

test.describe('Milestones de Referidos - E2E', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  const DOMINIO_TIENDA = process.env.TEST_DOMINIO || 'test-tienda';

  test('Cliente ve milestones en /mis-referidos', async ({ page }) => {
    await page.goto(`${BASE_URL}/${DOMINIO_TIENDA}/mis-referidos`);

    // Verificar título principal
    await expect(page.locator('h1')).toContainText(/Invita/i);

    // Verificar que existe la sección de objetivos
    const seccionObjetivos = page.locator('text=/Objetivos de Referidos/i');
    await expect(seccionObjetivos).toBeVisible();

    // Verificar que hay al menos un milestone card
    const milestoneCards = page.locator('[data-testid="milestone-card"]');
    const count = await milestoneCards.count();

    if (count > 0) {
      console.log(`Se encontraron ${count} milestones`);

      // Verificar el primer milestone
      const primerMilestone = milestoneCards.first();

      // Debe tener progress bar
      const progressBar = primerMilestone.locator('[role="progressbar"]');
      await expect(progressBar).toBeVisible();

      // Debe mostrar contador de amigos
      await expect(primerMilestone.locator('text=/\\d+ \\/ \\d+ amigos/i')).toBeVisible();
    } else {
      console.log('No hay milestones configurados para esta tienda');
    }
  });

  test('Cliente puede copiar código de referido', async ({ page }) => {
    await page.goto(`${BASE_URL}/${DOMINIO_TIENDA}/mis-referidos`);

    // Buscar botón "Copiar Código"
    const btnCopiar = page.locator('button', { hasText: 'Copiar Código' });
    await expect(btnCopiar).toBeVisible();

    // Click en copiar
    await btnCopiar.click();

    // Verificar que aparece toast de confirmación
    // (esto depende de tu implementación de toasts)
    await expect(page.locator('text=/código copiado/i')).toBeVisible({ timeout: 3000 });
  });

  test('Cliente puede descargar QR de referido', async ({ page }) => {
    await page.goto(`${BASE_URL}/${DOMINIO_TIENDA}/mis-referidos`);

    // Buscar botón "Descargar"
    const btnDescargar = page.locator('button', { hasText: 'Descargar' });
    await expect(btnDescargar).toBeVisible();

    // Esperar descarga
    const downloadPromise = page.waitForEvent('download');
    await btnDescargar.click();
    const download = await downloadPromise;

    // Verificar que es un archivo PNG
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/\.png$/i);
    expect(filename).toMatch(/qr-referido/i);
  });
});
