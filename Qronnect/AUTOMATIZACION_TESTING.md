# 🤖 AUTOMATIZACIÓN DE TESTING - SISTEMA DE REGALOS

## Estrategia de Automatización

Hay varias formas de automatizar las pruebas reales, desde simples scripts hasta frameworks completos de E2E.

---

## OPCIÓN 1: Scripts de Backend (Tests de Integración)

### ✅ Ventajas
- Rápidos de ejecutar
- No requieren frontend
- Ideales para CI/CD
- Prueban la lógica de negocio directamente

### Implementación con Jest

#### Paso 1: Instalar dependencias

```bash
cd backend
npm install --save-dev @nestjs/testing jest @types/jest ts-jest supertest
```

#### Paso 2: Configurar Jest

**Archivo: `backend/jest.config.js`**

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
};
```

#### Paso 3: Crear tests de integración

**Archivo: `backend/src/referidos/regalos.service.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { RegalosService } from './regalos.service';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';

describe('RegalosService - Tests de Integración', () => {
  let service: RegalosService;
  let supabaseService: SupabaseService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegalosService,
        SupabaseService,
        EmailService,
      ],
    }).compile();

    service = module.get<RegalosService>(RegalosService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('Catálogo de Regalos', () => {
    it('debería obtener el catálogo de regalos de una tienda', async () => {
      const tiendaId = process.env.TEST_TIENDA_ID;
      const regalos = await service.getCatalogo(tiendaId);

      expect(Array.isArray(regalos)).toBe(true);
      expect(regalos.length).toBeGreaterThanOrEqual(0);
    });

    it('debería crear un nuevo regalo', async () => {
      const tiendaId = process.env.TEST_TIENDA_ID;
      const regaloData = {
        nombre: 'Test Café Gratis',
        descripcion: 'Regalo de prueba',
        tipo: 'producto' as const,
        detalles: { producto: 'Café', cantidad: 1 },
        instrucciones_canje: 'Presentar en caja',
        icono: 'coffee',
        dias_validez: 30,
        requiere_validacion_staff: true,
      };

      const regalo = await service.crearRegalo(tiendaId, regaloData);

      expect(regalo).toBeDefined();
      expect(regalo.nombre).toBe('Test Café Gratis');
      expect(regalo.tipo).toBe('producto');

      // Cleanup: eliminar regalo de prueba
      const client = supabaseService.getAdminClient();
      await client.from('regalos_catalogo').delete().eq('id', regalo.id);
    });
  });

  describe('Cupones de Regalo', () => {
    let testRegaloId: string;
    let testClienteId: string;

    beforeAll(async () => {
      // Setup: crear regalo y cliente de prueba
      const tiendaId = process.env.TEST_TIENDA_ID;

      const regalo = await service.crearRegalo(tiendaId, {
        nombre: 'Test Regalo',
        tipo: 'producto',
        detalles: { producto: 'Test' },
        dias_validez: 30,
      });
      testRegaloId = regalo.id;

      // Crear cliente de prueba
      const client = supabaseService.getAdminClient();
      const { data: cliente } = await client
        .from('clientes')
        .insert({
          id_tienda: tiendaId,
          nombre: 'Test Cliente',
          email: 'test@example.com',
          puntos_totales: 0,
        })
        .select()
        .single();
      testClienteId = cliente.id;
    });

    afterAll(async () => {
      // Cleanup
      const client = supabaseService.getAdminClient();
      await client.from('regalos_catalogo').delete().eq('id', testRegaloId);
      await client.from('clientes').delete().eq('id', testClienteId);
    });

    it('debería otorgar un regalo a un cliente', async () => {
      const cupon = await service.otorgarRegalo({
        clienteId: testClienteId,
        regaloId: testRegaloId,
        origen: 'manual',
        origenDetalles: { test: true },
      });

      expect(cupon).toBeDefined();
      expect(cupon.codigo).toHaveLength(8);
      expect(cupon.estado).toBe('disponible');
      expect(cupon.id_cliente).toBe(testClienteId);
    });

    it('debería obtener cupones de un cliente', async () => {
      const cupones = await service.getCuponesCliente(testClienteId);

      expect(Array.isArray(cupones)).toBe(true);
      expect(cupones.length).toBeGreaterThan(0);
      expect(cupones[0].id_cliente).toBe(testClienteId);
    });

    it('debería marcar un cupón como visto', async () => {
      const cupones = await service.getCuponesCliente(testClienteId);
      const cuponId = cupones[0].id;

      await service.marcarCuponVisto(cuponId);

      // Verificar en BD
      const client = supabaseService.getAdminClient();
      const { data } = await client
        .from('cupones_regalos')
        .select('visto_por_cliente, fecha_visto')
        .eq('id', cuponId)
        .single();

      expect(data.visto_por_cliente).toBe(true);
      expect(data.fecha_visto).toBeDefined();
    });
  });

  describe('Milestones de Referidos', () => {
    it('debería obtener milestones de una tienda', async () => {
      const tiendaId = process.env.TEST_TIENDA_ID;
      const milestones = await service.getMilestones(tiendaId);

      expect(Array.isArray(milestones)).toBe(true);
    });

    it('debería verificar milestones de un cliente', async () => {
      const clienteId = process.env.TEST_CLIENTE_ID;
      const resultado = await service.verificarMilestonesCliente(clienteId);

      expect(resultado).toBeDefined();
      expect(resultado).toHaveProperty('total');
      expect(resultado).toHaveProperty('milestones_alcanzados');
    });
  });
});
```

#### Paso 4: Configurar variables de entorno para tests

**Archivo: `backend/.env.test`**

```bash
# Copiar desde .env y ajustar para testing
SUPABASE_URL=https://ajyiuhujexwrjmjfycxh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# IDs de prueba (crear en BD de staging)
TEST_TIENDA_ID=uuid-de-tienda-de-prueba
TEST_CLIENTE_ID=uuid-de-cliente-de-prueba
TEST_ADMIN_ID=uuid-de-admin-de-prueba
```

#### Paso 5: Ejecutar tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar solo tests de regalos
npm test -- regalos.service.spec

# Ejecutar con coverage
npm test -- --coverage

# Watch mode (re-ejecuta al cambiar archivos)
npm test -- --watch
```

---

## OPCIÓN 2: Tests E2E con Playwright

### ✅ Ventajas
- Prueba el flujo completo (frontend + backend + BD)
- Simula interacción real del usuario
- Captura screenshots y videos de fallos
- Soporta múltiples navegadores

### Implementación

#### Paso 1: Instalar Playwright

```bash
cd frontend
npm install --save-dev @playwright/test
npx playwright install
```

#### Paso 2: Configurar Playwright

**Archivo: `frontend/playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

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
    video: 'retain-on-failure',
  },

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
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### Paso 3: Crear tests E2E

**Archivo: `frontend/tests/e2e/regalos-bienvenida.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('Flujo Completo: Regalo de Bienvenida', () => {
  const testEmail = faker.internet.email();
  const testNombre = faker.person.fullName();

  test('Usuario se registra y recibe cupón de bienvenida', async ({ page }) => {
    // 1. Ir a página de registro
    await page.goto('/registro');
    await expect(page.locator('h1')).toContainText('Regístrate');

    // 2. Rellenar formulario
    await page.fill('input[name="nombre"]', testNombre);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="telefono"]', '+34600000000');
    await page.check('input[name="acepta_terminos"]');

    // 3. Enviar formulario
    await page.click('button[type="submit"]');

    // 4. Verificar mensaje de confirmación
    await expect(page.locator('text=/revisa tu email/i')).toBeVisible();

    // 5. Simular validación de email (en testing, podríamos obtener el token de BD)
    // Por ahora, verificamos que se creó el cliente
    // En un test real, necesitarías:
    // - Leer token de BD
    // - Ir a /validar-email?token=XXX
    // - Verificar redirección a perfil
  });
});

test.describe('Flujo Completo: Milestones de Referidos', () => {
  test.beforeEach(async ({ page }) => {
    // Login del cliente de prueba
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Enviar Código")');

    // En un entorno de test, deberías mockear el OTP o usar un código fijo
    // Para testing real, obtener el código de BD
  });

  test('Cliente ve milestones en /mis-referidos', async ({ page }) => {
    await page.goto('/mis-referidos');

    // Verificar que carga la página
    await expect(page.locator('h1')).toContainText('Invita a tus Amigos');

    // Verificar sección de milestones
    const milestonesSection = page.locator('text=/Objetivos de Referidos/i');
    await expect(milestonesSection).toBeVisible();

    // Verificar que hay al menos un milestone
    const milestoneCards = page.locator('[data-testid="milestone-card"]');
    const count = await milestoneCards.count();
    expect(count).toBeGreaterThan(0);

    // Verificar progress bar
    const progressBar = page.locator('[role="progressbar"]').first();
    await expect(progressBar).toBeVisible();
  });

  test('Cliente comparte código de referido', async ({ page }) => {
    await page.goto('/mis-referidos');

    // Click en copiar código
    await page.click('button:has-text("Copiar Código")');

    // Verificar toast de confirmación
    await expect(page.locator('text=/código copiado/i')).toBeVisible();

    // Click en descargar QR
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Descargar")');
    const download = await downloadPromise;

    // Verificar que se descargó un PNG
    expect(download.suggestedFilename()).toMatch(/\.png$/);
  });
});

test.describe('Flujo Completo: Cupones de Regalo', () => {
  test.beforeEach(async ({ page }) => {
    // Login como cliente
    await page.goto('/login');
    // ... login
  });

  test('Cliente ve sus cupones en /mis-cupones', async ({ page }) => {
    await page.goto('/mis-cupones');

    // Verificar título
    await expect(page.locator('h1')).toContainText('Mis Cupones');

    // Verificar stats cards
    const statsCards = page.locator('[data-testid="stat-card"]');
    expect(await statsCards.count()).toBe(3); // Disponibles, Usados, Total

    // Si hay cupones, verificar estructura
    const cuponCards = page.locator('[data-testid="cupon-card"]');
    const count = await cuponCards.count();

    if (count > 0) {
      const primerCupon = cuponCards.first();

      // Verificar que tiene código
      await expect(primerCupon.locator('[data-testid="cupon-codigo"]')).toBeVisible();

      // Click en "Ver QR"
      await primerCupon.locator('button:has-text("Ver QR")').click();

      // Verificar que aparece QR
      await expect(primerCupon.locator('svg')).toBeVisible(); // QRCodeSVG
    }
  });

  test('Cliente filtra cupones por estado', async ({ page }) => {
    await page.goto('/mis-cupones');

    // Click en filtro "Todos"
    await page.click('button:has-text("Todos")');

    // Verificar que el botón está activo
    const botonTodos = page.locator('button:has-text("Todos")');
    await expect(botonTodos).toHaveClass(/variant-default/);

    // Volver a "Disponibles"
    await page.click('button:has-text("Disponibles")');

    const botonDisponibles = page.locator('button:has-text("Disponibles")');
    await expect(botonDisponibles).toHaveClass(/variant-default/);
  });
});
```

#### Paso 4: Añadir data-testid a componentes

Para que Playwright pueda encontrar elementos fácilmente, añade `data-testid` a tus componentes:

**Ejemplo en `frontend/app/[slug]/mis-cupones/page.tsx`:**

```tsx
// Stats cards
<Card data-testid="stat-card">
  <CardContent className="pt-6">
    {/* ... */}
  </CardContent>
</Card>

// Cupón card
<Card data-testid="cupon-card" key={cupon.id}>
  {/* ... */}
  <p data-testid="cupon-codigo" className="text-3xl font-bold">
    {cupon.codigo}
  </p>
</Card>
```

#### Paso 5: Ejecutar tests E2E

```bash
# Ejecutar todos los tests E2E
npx playwright test

# Ejecutar en modo UI (visual)
npx playwright test --ui

# Ejecutar solo un archivo
npx playwright test regalos-bienvenida.spec.ts

# Ejecutar en modo debug
npx playwright test --debug

# Generar reporte HTML
npx playwright show-report
```

---

## OPCIÓN 3: Tests de API con Supertest

### Ventajas
- Rápidos
- No requieren frontend
- Prueban endpoints directamente
- Integración con Jest

**Archivo: `backend/src/referidos/regalos.controller.spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('RegalosController (E2E)', () => {
  let app: INestApplication;
  let adminToken: string;
  let clientToken: string;
  let tiendaId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Obtener tokens de prueba
    adminToken = process.env.TEST_ADMIN_TOKEN;
    clientToken = process.env.TEST_CLIENT_TOKEN;
    tiendaId = process.env.TEST_TIENDA_ID;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/regalos/catalogo/:tiendaId (GET)', () => {
    it('debería retornar catálogo de regalos (público)', () => {
      return request(app.getHttpServer())
        .get(`/api/regalos/catalogo/${tiendaId}`)
        .set('X-Tenant-Domain', 'test-tienda')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/api/regalos/mis-cupones (GET)', () => {
    it('debería retornar cupones del cliente autenticado', () => {
      return request(app.getHttpServer())
        .get('/api/regalos/mis-cupones')
        .set('Authorization', `Bearer ${clientToken}`)
        .set('X-Tenant-Domain', 'test-tienda')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('debería rechazar sin autenticación', () => {
      return request(app.getHttpServer())
        .get('/api/regalos/mis-cupones')
        .set('X-Tenant-Domain', 'test-tienda')
        .expect(401);
    });
  });

  describe('/api/regalos/catalogo (POST)', () => {
    it('debería crear un nuevo regalo (admin)', () => {
      return request(app.getHttpServer())
        .post('/api/regalos/catalogo')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('X-Tenant-Domain', 'test-tienda')
        .send({
          nombre: 'Test E2E Regalo',
          tipo: 'producto',
          detalles: { producto: 'Test' },
          dias_validez: 30,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.nombre).toBe('Test E2E Regalo');
        });
    });

    it('debería rechazar sin autenticación de admin', () => {
      return request(app.getHttpServer())
        .post('/api/regalos/catalogo')
        .set('Authorization', `Bearer ${clientToken}`) // Token de cliente, no admin
        .set('X-Tenant-Domain', 'test-tienda')
        .send({
          nombre: 'Test',
          tipo: 'producto',
        })
        .expect(403); // Forbidden
    });
  });
});
```

---

## OPCIÓN 4: CI/CD con GitHub Actions

### Automatizar tests en cada push/PR

**Archivo: `.github/workflows/test.yml`**

```yaml
name: Tests Automatizados

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: supabase/postgres:15.1.0.117
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run migrations
        working-directory: ./backend
        run: npx supabase db push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

      - name: Run tests
        working-directory: ./backend
        run: npm test
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_KEY }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install backend dependencies
        working-directory: ./backend
        run: npm ci

      - name: Start backend
        working-directory: ./backend
        run: npm run start:dev &
        env:
          NODE_ENV: test

      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Install Playwright
        working-directory: ./frontend
        run: npx playwright install --with-deps

      - name: Run E2E tests
        working-directory: ./frontend
        run: npx playwright test

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 30
```

---

## OPCIÓN 5: Testing de Carga con k6

### Para probar performance

**Archivo: `tests/load/regalos-load-test.js`**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users for 1 minute
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% error rate
  },
};

const BASE_URL = 'http://localhost:3001/api';
const TIENDA_ID = __ENV.TEST_TIENDA_ID;

export default function () {
  // Test 1: Get catálogo
  let res = http.get(`${BASE_URL}/regalos/catalogo/${TIENDA_ID}`, {
    headers: { 'X-Tenant-Domain': 'test-tienda' },
  });
  check(res, {
    'catálogo status is 200': (r) => r.status === 200,
    'catálogo response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);

  // Test 2: Get milestones
  res = http.get(`${BASE_URL}/regalos/milestones/${TIENDA_ID}`, {
    headers: { 'X-Tenant-Domain': 'test-tienda' },
  });
  check(res, {
    'milestones status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
```

**Ejecutar:**
```bash
k6 run tests/load/regalos-load-test.js
```

---

## OPCIÓN 6: Base de Datos de Testing

### Crear entorno aislado para tests

```bash
# Crear una segunda instancia de Supabase para testing
# O usar una base de datos local con Docker

docker run -d \
  --name supabase-test \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=qronnect_test \
  -p 5433:5432 \
  supabase/postgres:15.1.0.117
```

**Configurar en tests:**

```typescript
// backend/src/test/test-config.ts
export const testDatabaseConfig = {
  host: 'localhost',
  port: 5433,
  database: 'qronnect_test',
  user: 'postgres',
  password: 'postgres',
};
```

---

## 📋 RESUMEN: Cuál Elegir

| Método | Velocidad | Cobertura | Complejidad | Recomendado Para |
|--------|-----------|-----------|-------------|------------------|
| **Jest (Integración)** | ⚡⚡⚡ | 🎯🎯 | ⭐⭐ | Lógica de negocio |
| **Playwright (E2E)** | ⚡ | 🎯🎯🎯 | ⭐⭐⭐ | Flujos completos |
| **Supertest (API)** | ⚡⚡ | 🎯🎯 | ⭐ | Endpoints REST |
| **GitHub Actions** | ⚡ | 🎯🎯🎯 | ⭐⭐⭐ | CI/CD automático |
| **k6 (Carga)** | ⚡⚡ | 🎯 | ⭐⭐ | Performance |

### Recomendación: Estrategia Piramidal

```
         /\
        /E2E\         <- Pocos tests (críticos)
       /------\
      / API   \       <- Tests medios (endpoints)
     /----------\
    / UNIT/INT  \     <- Muchos tests (rápidos)
   /--------------\
```

1. **Base (70%):** Tests unitarios y de integración (Jest)
2. **Medio (20%):** Tests de API (Supertest)
3. **Cima (10%):** Tests E2E (Playwright) solo para flujos críticos

---

## 🚀 Plan de Implementación Sugerido

### Fase 1: Corto Plazo (1-2 días)
1. Setup Jest en backend
2. Escribir 5-10 tests de integración para RegalosService
3. Configurar scripts en package.json

### Fase 2: Medio Plazo (1 semana)
1. Setup Playwright
2. Escribir 3-5 tests E2E para flujos críticos
3. Añadir data-testid a componentes clave

### Fase 3: Largo Plazo (2 semanas)
1. Configurar GitHub Actions
2. Añadir coverage reports
3. Tests de carga con k6 (si necesario)

---

🤖 *Generado con Claude Code - 22 de noviembre de 2025*
