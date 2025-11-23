# Diagnóstico Completo - Sesión 22 Nov 2025

## 🔴 PROBLEMAS ENCONTRADOS

### 1. Wizard de Onboarding da 404 en Producción
**URL afectada**: `https://dolcefrio.qronnect.es/admin/onboarding`
**Error**: `GET /api/onboarding/progreso → 404 Not Found`

**Causa raíz identificada**:
- El módulo OnboardingModule existe en el código
- Está registrado correctamente en app.module.ts
- Compila exitosamente en local
- **Pero Render NO lo está desplegando**

### 2. Branding Dinámico No Funcionaba
**Síntomas**:
- Dashboard siempre mostraba logo de Qronnect
- Título de pestaña siempre "Qronnect"
- Favicon no cambiaba por tienda

**Causa raíz**:
- Faltaba aplicar migración de base de datos
- Columnas `logo_url`, `favicon_url`, `og_image_url` no existían en tabla `tiendas`

**Solución aplicada**: ✅
- Migración `20251122000005_add_favicon_logo_to_tiendas.sql` aplicada en Supabase
- Ahora los títulos y favicons se ven correctamente

### 3. Configuración de Landing Page No Funciona
**URL afectada**: `/admin/configuracion/landing`
**Error**: `GET /api/config/landing → 404`

**Causa raíz**: Mismo problema que #1 - Render no despliega el módulo BrandingModule

---

## ✅ SOLUCIONES APLICADAS

### 1. Migración de Branding - COMPLETADO
```sql
-- Archivo: supabase/migrations/20251122000005_add_favicon_logo_to_tiendas.sql
ALTER TABLE tiendas
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS favicon_url TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT;

UPDATE tiendas
SET
  logo_url = COALESCE(logo_url, '/brand/qronnect/logo.svg'),
  favicon_url = COALESCE(favicon_url, '/brand/qronnect/favicon.ico'),
  og_image_url = COALESCE(og_image_url, '/brand/qronnect/og-qronnect.jpg')
WHERE logo_url IS NULL OR favicon_url IS NULL OR og_image_url IS NULL;
```

**Estado**: ✅ Aplicada en producción
**Resultado**: Títulos y favicons ahora funcionan correctamente

### 2. Actualización de render.yaml - COMPLETADO
```yaml
buildCommand: rm -rf dist node_modules/.cache && npm install && npm run build
```

**Estado**: ✅ Commiteado y pusheado (commit 9449a2c)
**Objetivo**: Limpiar cache de TypeScript en cada build

---

## ⏳ SOLUCIONES PENDIENTES

### 1. Migración de Onboarding - PENDIENTE
```bash
# Aplicar migración en Supabase
cd backend
npx supabase db push

# O manualmente en SQL Editor:
# Ejecutar: supabase/migrations/20251122000006_create_onboarding_system.sql
```

**Tablas que crea**:
- `onboarding_progress` - Progreso del wizard por tienda
- `plantillas_promociones` - Plantillas pre-hechas de promos
- `onboarding_analytics` - Vista de métricas

**Funciones PostgreSQL**:
- `iniciar_onboarding()` - Trigger al crear tienda
- `actualizar_progreso_onboarding()` - Actualiza paso completado
- `omitir_paso_onboarding()` - Marca paso omitido

### 2. Investigar Por Qué Render No Despliega los Módulos

**Evidencia del problema**:
- ✅ Código existe en GitHub (commit 9449a2c)
- ✅ Módulos registrados en app.module.ts
- ✅ Build compila sin errores en local
- ✅ Render marca deploy como "exitoso"
- ❌ Endpoints /api/config/* devuelven 404
- ❌ Endpoints /api/onboarding/* devuelven 404

**Hipótesis**:
1. Build de Render falla silenciosamente por errores de TypeScript
2. Render usa una versión vieja de Node.js incompatible
3. Variables de entorno faltantes causan que el build no incluya ciertos módulos
4. Caché corrupto de Render persiste a pesar de "Clear build cache"

**Acciones tomadas**:
- ✅ Clear build cache & deploy (3 veces)
- ✅ Limpieza de dist/ y node_modules/.cache en buildCommand
- ✅ Force push commits
- ❌ RESULTADO: Sigue dando 404

**Próximo paso crítico**:
**NECESITAMOS VER LOS BUILD LOGS DE RENDER** para identificar por qué el build no incluye los módulos.

---

## 📊 ESTADO ACTUAL

### Funcionando ✅
- `/api/health` → 200 OK
- Branding dinámico (títulos, favicons)
- Backend compila correctamente en local
- Todos los módulos cargan en local (`npm run start:prod`)

### No Funcionando ❌
- `/api/config/branding` → 404 en producción
- `/api/config/landing` → 404 en producción
- `/api/onboarding/*` → 404 en producción

### Commits Relevantes
- `9449a2c` - fix: Limpiar cache de TypeScript antes del build en Render
- `75eee7c` - fix: Auto-crear progreso de onboarding para tiendas existentes
- `450d6bf` - feat: Implementar favicon, logo y OG image dinámicos por tenant
- `aa94ebb` - feat: Implementar backend completo del sistema de onboarding

---

## 🎯 PLAN DE ACCIÓN INMEDIATO

### Paso 1: Obtener Build Logs de Render
**Objetivo**: Identificar por qué el build no incluye los módulos

**Cómo hacerlo**:
1. Dashboard de Render → qronnect-backend
2. Click en el deploy "Live" actual
3. Tab "Logs" → "Build Logs"
4. Copiar las últimas 100-150 líneas
5. Buscar errores de TypeScript, npm, o NestJS

### Paso 2: Aplicar Migración de Onboarding
**Objetivo**: Crear tablas necesarias para el wizard

```bash
cd backend
npx supabase db push
```

**Verificación**:
```sql
-- En Supabase SQL Editor
SELECT * FROM onboarding_progress LIMIT 1;
SELECT * FROM plantillas_promociones LIMIT 5;
```

### Paso 3: Resolver Problema de Render
**Dependiendo de lo que muestren los logs**:

**Opción A**: Si hay errores de TypeScript
→ Corregir errores y redeploy

**Opción B**: Si el build es exitoso pero los módulos no se incluyen
→ Verificar configuración de Render (Node version, environment vars)

**Opción C**: Si Render usa una versión de código vieja
→ Verificar que el branch desplegado es `main`
→ Verificar que el commit SHA es `9449a2c` o más reciente

### Paso 4: Verificación Final
```bash
# Después de resolver Render:
curl https://qronnect-backend.onrender.com/api/config/branding \
  -H "X-Tenant-Domain: dolcefrio"
# Debería devolver JSON con logo_url, favicon_url, etc.

curl https://qronnect-backend.onrender.com/api/onboarding/analytics
# Debería devolver métricas de onboarding
```

---

## 🔍 INFORMACIÓN TÉCNICA

### Estructura de Módulos
```
backend/src/
├── onboarding/
│   ├── dto/ (4 archivos)
│   ├── onboarding.controller.ts
│   ├── onboarding.service.ts
│   └── onboarding.module.ts
├── config/
│   ├── branding.controller.ts
│   ├── branding.service.ts
│   ├── landing.service.ts
│   └── branding.module.ts
└── app.module.ts (registra BrandingModule, OnboardingModule)
```

### Endpoints Afectados

**BrandingModule** (`/api/config`):
- `GET /api/config/branding` - Obtiene logo, favicon, colores
- `GET /api/config/landing` - Obtiene textos de landing
- `PUT /api/config/landing` - Actualiza textos (requiere auth)

**OnboardingModule** (`/api/onboarding`):
- `GET /api/onboarding/progreso` - Estado del wizard
- `PUT /api/onboarding/progreso` - Actualiza paso
- `POST /api/onboarding/progreso/omitir` - Omite paso
- `GET /api/onboarding/plantillas` - Lista plantillas
- `GET /api/onboarding/analytics` - Métricas (superadmin)

### Configuración de Render

**Archivo**: `backend/render.yaml`
```yaml
services:
  - type: web
    name: qronnect-backend
    env: node
    plan: starter
    buildCommand: rm -rf dist node_modules/.cache && npm install && npm run build
    startCommand: npm run start:prod
    healthCheckPath: /health
```

**Importante**: El buildCommand limpia cache antes de cada build.

---

## 📝 NOTAS

- La sesión de hoy identificó que Render está desplegando pero omitiendo módulos específicos
- El problema NO es el código (funciona perfecto en local)
- El problema NO es la configuración del código (todo está bien registrado)
- El problema ES algo en el proceso de build/deploy de Render
- **BLOQUEADOR CRÍTICO**: Sin los Build Logs de Render no podemos avanzar

---

**Fecha**: 22 Noviembre 2025
**Duración de sesión**: ~3 horas
**Problemas resueltos**: 1 de 3 (branding)
**Problemas pendientes**: 2 de 3 (onboarding, landing config)
**Bloqueador**: Build Logs de Render necesarios para diagnóstico
