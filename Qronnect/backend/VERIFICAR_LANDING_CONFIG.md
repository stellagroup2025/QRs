# 🔍 Verificación: ¿Por qué sigue el 404 en /api/config/landing?

**Error actual**: `Failed to load resource: the server responded with a status of 404 ()`

---

## 🎯 Checklist de Verificación

### ✅ 1. Commits Locales (COMPLETADO)
```bash
git log --oneline -3
1c4043f fix: Corregir error 404 en /api/config/landing con auto-creación
cfe46d7 feat: Agregar Wizard Inicial y Landing Page al navbar de admin
43644cf feat: Implementar los 5 pasos del wizard de onboarding
```

**Status**: ✅ Commits creados localmente

---

### ❌ 2. Push a GitHub (PENDIENTE)
El commit `1c4043f` está solo en tu máquina local.
**Render no puede deployarlo** hasta que hagas push.

**Acción requerida**:
```bash
cd /mnt/c/Users/Omar/Documents/Qrs/Qronnect/backend
git push origin main
```

---

### ✅ 3. Migración de Supabase (COMPLETADO)
Usuario reportó: "ya hice la migracion"

**Status**: ✅ RLS policies aplicadas

---

### ❓ 4. Tabla landing_config Existe en Supabase

**Verificar en Supabase SQL Editor**:

```sql
-- Verificar que la tabla existe
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'landing_config';

-- Si existe, verificar RLS policies
SELECT *
FROM pg_policies
WHERE tablename = 'landing_config';

-- Verificar si hay configuraciones creadas
SELECT id_tienda, activo, created_at
FROM landing_config
LIMIT 5;
```

**Resultado esperado**:
- La tabla `landing_config` debe existir
- Debe haber 3 policies: `public_select_landing_config`, `backend_update_landing_config`, `backend_insert_landing_config`
- Puede haber 0 o más filas (se auto-crearán al acceder)

---

### ❓ 5. Migración Original Aplicada

La migración `20251115000001_create_landing_config.sql` **DEBE** haberse aplicado **antes** que la `20251122000007_fix_landing_config_rls.sql`.

**Verificar en Supabase → Dashboard → Migrations**:
- [ ] `20251115000001_create_landing_config.sql` (crea tabla)
- [ ] `20251122000007_fix_landing_config_rls.sql` (arregla RLS)

**Si la primera NO está aplicada**, ejecutar en SQL Editor:

```sql
-- Copiar TODO el contenido de:
-- backend/supabase/migrations/20251115000001_create_landing_config.sql
-- Y ejecutarlo en Supabase SQL Editor
```

---

## 🔴 Diagnóstico del 404

El error 404 puede deberse a **3 posibles causas**:

### Causa 1: Push Pendiente (MÁS PROBABLE ⚠️)
- **Síntoma**: Código con auto-creación no está en producción
- **Solución**: `git push origin main` → Esperar deploy de Render (3-5 min)
- **Cómo verificar**: Ver commit hash en Render dashboard

### Causa 2: Tabla No Existe
- **Síntoma**: Migración `20251115000001_create_landing_config.sql` nunca se aplicó
- **Solución**: Ejecutar migración completa en Supabase SQL Editor
- **Cómo verificar**: Query `SELECT * FROM landing_config LIMIT 1;`

### Causa 3: RLS Bloqueando
- **Síntoma**: Tabla existe pero RLS rechaza queries
- **Solución**: Ya aplicaste `20251122000007_fix_landing_config_rls.sql`
- **Cómo verificar**: Ver policies con query de arriba

---

## 🚀 Pasos para Resolver

### Paso 1: Verificar que la Tabla Existe

**En Supabase SQL Editor**, ejecutar:

```sql
-- Test rápido
SELECT COUNT(*) as tabla_existe
FROM information_schema.tables
WHERE table_name = 'landing_config';
```

**Resultado esperado**: `tabla_existe = 1`

**Si es 0** (tabla NO existe):
1. Ir a `backend/supabase/migrations/20251115000001_create_landing_config.sql`
2. Copiar TODO el contenido
3. Ejecutar en Supabase SQL Editor
4. Volver a ejecutar `20251122000007_fix_landing_config_rls.sql`

---

### Paso 2: Push a GitHub

```bash
cd /mnt/c/Users/Omar/Documents/Qrs/Qronnect/backend
git push origin main
```

**Resultado**: Render auto-desplegará en 3-5 minutos.

---

### Paso 3: Verificar Deploy en Render

1. Ir a Render Dashboard
2. Ver último deploy
3. Verificar commit hash sea `1c4043f`
4. Esperar a que estado sea "Live" (verde)

---

### Paso 4: Testing

**Después del deploy**, probar:

```bash
# Test 1: GET /api/config/landing
curl "https://qronnect-backend.onrender.com/api/config/landing" \
  -H "X-Tenant-Domain: dolcefrio"

# Resultado esperado: HTTP 200 con configuración
```

Si da 200 → ✅ Funciona
Si da 404 → ⚠️ Ver logs de Render

---

## 📊 Resumen

| Check | Estado | Acción |
|-------|--------|--------|
| Commits locales | ✅ Listo | - |
| Migración RLS | ✅ Aplicada | - |
| Tabla existe | ❓ Verificar | Query SQL arriba |
| Push a GitHub | ❌ Pendiente | `git push origin main` |
| Deploy Render | ❌ Esperando push | Esperar 3-5 min |

---

## 🎯 Próximo Paso Inmediato

**Verificar primero** si la tabla existe:

```sql
SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'landing_config';
```

- **Si es 1**: Hacer push → Esperar deploy → Debería funcionar
- **Si es 0**: Aplicar migración `20251115000001_create_landing_config.sql` → Hacer push → Debería funcionar

---

**Siguiente acción recomendada**: Ejecutar query de verificación en Supabase.
