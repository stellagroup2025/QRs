# Fix: Error UUID "undefined" en Onboarding

**Fecha**: 22 Noviembre 2025
**Problema**: Error al acceder al wizard de onboarding
**Status**: ✅ **RESUELTO** (pendiente de push y deploy)

---

## 🔴 Problema

### Error Original
```
[Nest] 86 - 11/22/2025, 8:23:24 PM ERROR [OnboardingService]
❌ Error al obtener progreso: invalid input syntax for type uuid: "undefined"
```

### Síntomas
- Endpoint `/api/onboarding/progreso` respondía (no 404)
- Pero fallaba con error de validación de UUID
- El servicio recibía el string literal `"undefined"` en lugar de un UUID válido

---

## 🔍 Causa Raíz Identificada

### El Problema

El `OnboardingController` estaba usando el decorador **incorrecto** para extraer el ID del tenant:

```typescript
// ❌ INCORRECTO (onboarding.controller.ts línea 54)
async getProgreso(@Headers('x-tenant-id') tenantId: string) {
  return this.onboardingService.getProgreso(tenantId);
}
```

### Por Qué Fallaba

1. **El middleware `TenantResolverMiddleware`** (línea 32):
   ```typescript
   req.tenant = tenant;  // ✅ Setea req.tenant
   ```

   El middleware NO setea ningún header `x-tenant-id`, solo setea `req.tenant`.

2. **El decorador `@Headers('x-tenant-id')`**:
   - Intenta leer un header HTTP que nunca se está seteando
   - Devuelve `undefined` porque el header no existe

3. **El servicio recibe `"undefined"`**:
   ```typescript
   this.onboardingService.getProgreso("undefined")
   ```

   PostgreSQL intenta convertir el string `"undefined"` a UUID → ❌ Error

---

## ✅ Solución Aplicada

### Cambio Realizado

Reemplazar `@Headers('x-tenant-id')` por el decorador correcto `@Tenant('id')` en **4 endpoints**:

```typescript
// ✅ CORRECTO (onboarding.controller.ts)
import { Tenant } from '../tenant/decorators/tenant.decorator';

async getProgreso(@Tenant('id') tenantId: string) {
  return this.onboardingService.getProgreso(tenantId);
}
```

### Endpoints Corregidos

1. **GET `/onboarding/progreso`** (línea 54)
2. **PUT `/onboarding/progreso`** (línea 87)
3. **POST `/onboarding/progreso/omitir`** (línea 115)
4. **POST `/onboarding/progreso/reiniciar`** (línea 142)

### Cómo Funciona el Decorador `@Tenant`

**Archivo**: `backend/src/tenant/decorators/tenant.decorator.ts`

```typescript
export const Tenant = createParamDecorator(
  (data: keyof TenantContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenant: TenantContext = request.tenant;  // ✅ Lee de req.tenant

    if (data) {
      return tenant[data];  // Si se pasa 'id', devuelve tenant.id
    }

    return tenant;  // Si no, devuelve el objeto completo
  },
);
```

---

## 📊 Comparación: Antes vs Después

### ❌ Flujo Antes (Error)

```
1. Request llega a /api/onboarding/progreso
2. TenantResolverMiddleware ejecuta:
   - Resuelve tenant desde X-Tenant-Domain header
   - Setea req.tenant = { id: 'abc-123', nombre: 'Dolcefrio', ... }
3. OnboardingController ejecuta:
   - @Headers('x-tenant-id') intenta leer header HTTP
   - Header no existe → devuelve undefined
4. OnboardingService.getProgreso(undefined) ejecuta:
   - Supabase query: .eq('id_tienda', undefined)
   - PostgreSQL: ERROR: invalid input syntax for type uuid: "undefined"
```

### ✅ Flujo Después (Correcto)

```
1. Request llega a /api/onboarding/progreso
2. TenantResolverMiddleware ejecuta:
   - Resuelve tenant desde X-Tenant-Domain header
   - Setea req.tenant = { id: 'abc-123', nombre: 'Dolcefrio', ... }
3. OnboardingController ejecuta:
   - @Tenant('id') lee req.tenant.id
   - Devuelve 'abc-123' (UUID válido)
4. OnboardingService.getProgreso('abc-123') ejecuta:
   - Supabase query: .eq('id_tienda', 'abc-123')
   - PostgreSQL: ✅ Busca correctamente por UUID
```

---

## 🚀 Deployment

### Archivo Modificado
- `backend/src/onboarding/onboarding.controller.ts`

### Commit Creado
```bash
git commit -m "fix: Corregir decorador de tenant en OnboardingController"
# Commit hash: 081d210
```

### Pasos Pendientes

**1. Push a GitHub** (necesitas hacerlo tú):
```bash
cd backend
git push origin main
```

**2. Render auto-desplegará** el cambio (tarda ~3-5 min)

**3. Aplicar migración de Onboarding en Supabase**:
```bash
cd backend
npx supabase db push

# O manualmente en Supabase SQL Editor:
# Ejecutar: supabase/migrations/20251122000006_create_onboarding_system.sql
```

Esta migración crea las tablas:
- `onboarding_progress`
- `plantillas_promociones`
- `onboarding_analytics` (vista)

**4. Verificar que funciona**:
```bash
# Después de ambos deploys (Render + Supabase):
curl https://qronnect-backend.onrender.com/api/onboarding/progreso \
  -H "X-Tenant-Domain: dolcefrio" \
  -H "Authorization: Bearer TU_TOKEN_ADMIN"

# Debería devolver:
# {
#   "id": "...",
#   "id_tienda": "...",
#   "paso_actual": 1,
#   "porcentaje_completado": 0,
#   "completado": false,
#   ...
# }
```

---

## 📝 Notas Importantes

1. **El problema NO era de Render**:
   - Render estaba desplegando correctamente el código
   - El endpoint existía y respondía
   - El error era lógico, no de infraestructura

2. **La migración de onboarding todavía falta**:
   - El fix resuelve el error de UUID
   - Pero las tablas `onboarding_progress` y `plantillas_promociones` no existen aún
   - Necesitas aplicar la migración en Supabase

3. **Otros controladores están correctos**:
   - `AdminController` usa `@Tenant('id')` correctamente
   - `ClientesController` usa `@Tenant('id')` correctamente
   - `BrandingController` usa `@Tenant('id')` correctamente
   - Solo `OnboardingController` tenía este error

---

## ✅ Checklist de Testing

Después del push y deploy:

- [ ] Push a GitHub: `git push origin main`
- [ ] Render despliega automáticamente (ver dashboard de Render)
- [ ] Aplicar migración en Supabase: `npx supabase db push`
- [ ] Verificar tablas creadas en Supabase:
  ```sql
  SELECT * FROM onboarding_progress LIMIT 1;
  SELECT * FROM plantillas_promociones LIMIT 5;
  ```
- [ ] Abrir https://dolcefrio.qronnect.es/admin/onboarding
- [ ] Verificar que carga sin errores
- [ ] Verificar que muestra progreso 0%
- [ ] (Opcional) Completar paso 1 del wizard

---

**Estado Final**: Fix aplicado localmente, commit creado. Necesitas:
1. `git push origin main` (backend)
2. Aplicar migración en Supabase
3. Esperar deploy de Render (~3-5 min)
4. Testing

🎉 El wizard de onboarding debería funcionar después de estos pasos.
