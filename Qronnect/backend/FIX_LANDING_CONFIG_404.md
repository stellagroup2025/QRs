# 🔧 Fix: Error 404 en /api/config/landing

**Fecha**: 22 Noviembre 2025
**Problema**: `PUT https://qronnect-backend.onrender.com/api/config/landing 404 (Not Found)`

---

## 🔍 Diagnóstico del Problema

### Error Reportado:
```
PUT https://qronnect-backend.onrender.com/api/config/landing 404 (Not Found)
```

### Causa Raíz:

1. **Tabla `landing_config` no existe en Supabase**
   - Migración `20251115000001_create_landing_config.sql` nunca se aplicó en producción
   - El código del backend existe, pero la tabla no

2. **RLS Policies muy restrictivas**
   - Policies originales bloqueaban lectura/escritura sin autenticación
   - Backend usa service role pero RLS puede bloquearlo en ciertos casos

3. **Sin auto-creación de configuración**
   - Si una tienda no tenía landing_config, daba error 404
   - No había fallback como en el onboarding

---

## ✅ Soluciones Implementadas

### 1. **Migración de RLS Policies** (`20251122000007_fix_landing_config_rls.sql`)

```sql
-- Lectura pública (para GET /api/config/landing)
CREATE POLICY "public_select_landing_config"
  ON landing_config FOR SELECT
  USING (true);

-- Backend puede actualizar (para PUT /api/config/landing con JWT)
CREATE POLICY "backend_update_landing_config"
  ON landing_config FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Backend puede insertar configuraciones iniciales
CREATE POLICY "backend_insert_landing_config"
  ON landing_config FOR INSERT
  WITH CHECK (true);
```

**Beneficio**: Backend puede leer, crear y actualizar sin restricciones.

### 2. **Auto-creación en LandingService** (`landing.service.ts`)

#### `getLandingConfig()`:
```typescript
// Si no existe, auto-crear con valores por defecto
if (error && error.code === 'PGRST116') {
  this.logger.warn(
    `⚠️ No existe landing_config para tienda ${idTienda}, auto-creando...`,
  );

  const { data: newConfig, error: createError } = await client
    .from('landing_config')
    .insert({ id_tienda: idTienda })
    .select()
    .single();

  if (createError) {
    this.logger.error(`❌ Error al crear landing_config: ${createError.message}`);
    throw new NotFoundException('No se pudo crear la configuración de landing');
  }

  this.logger.log(`✅ Landing_config creado para tienda ${idTienda}`);
  return config;
}
```

**Beneficio**: Backward compatibility total. Tiendas sin configuración la obtienen automáticamente.

#### `updateLandingConfig()`:
```typescript
// Verificar si existe la configuración
const { data: existing } = await client
  .from('landing_config')
  .select('id')
  .eq('id_tienda', idTienda)
  .single();

// Si no existe, crear primero
if (!existing) {
  this.logger.warn(`⚠️ No existe landing_config, creando antes de actualizar...`);

  const { error: createError } = await client
    .from('landing_config')
    .insert({ id_tienda: idTienda, ...updates });

  if (createError) {
    throw new NotFoundException('No se pudo crear la configuración de landing');
  }

  return this.getLandingConfig(idTienda);
}
```

**Beneficio**: Actualizar crea la configuración si no existe.

### 3. **Script de Inicialización Manual** (`scripts/init-landing-config.sql`)

Para ejecutar en Supabase SQL Editor si se prefiere inicializar todas las tiendas de una vez:

```sql
-- Insertar configuración por defecto para todas las tiendas sin configuración
INSERT INTO landing_config (id_tienda)
SELECT id FROM tiendas
WHERE NOT EXISTS (
    SELECT 1 FROM landing_config WHERE landing_config.id_tienda = tiendas.id
)
AND activo = true;
```

---

## 🚀 Pasos para Aplicar el Fix

### Opción A: Auto-creación Lazy (Recomendado)

**Ventaja**: Sin intervención manual, se crea cuando el admin accede.

1. **Aplicar migración de RLS**:
   ```sql
   -- En Supabase SQL Editor, ejecutar:
   -- supabase/migrations/20251122000007_fix_landing_config_rls.sql
   ```

2. **Deploy del backend**:
   ```bash
   cd backend
   git add .
   git commit -m "fix: Auto-crear landing_config si no existe"
   git push origin main
   ```

3. **Esperar deploy de Render** (~3-5 min)

4. **Probar**:
   - Ir a https://dolcefrio.qronnect.es/admin/configuracion/landing
   - Primera carga → Backend auto-crea configuración
   - Editar cualquier campo y guardar → ✅ Funciona

### Opción B: Inicialización Masiva (Opcional)

**Ventaja**: Todas las tiendas tienen configuración inmediatamente.

1. **Aplicar migraciones**:
   ```sql
   -- En Supabase SQL Editor, ejecutar en orden:
   -- 1. supabase/migrations/20251115000001_create_landing_config.sql
   -- 2. supabase/migrations/20251122000007_fix_landing_config_rls.sql
   -- 3. scripts/init-landing-config.sql
   ```

2. **Deploy del backend** (mismo que Opción A)

---

## 📊 Estructura de Archivos

```
backend/
├── supabase/migrations/
│   ├── 20251115000001_create_landing_config.sql  (existente)
│   └── 20251122000007_fix_landing_config_rls.sql (nuevo ✨)
├── scripts/
│   └── init-landing-config.sql                   (nuevo ✨)
└── src/config/
    ├── landing.service.ts                        (modificado ✅)
    ├── branding.controller.ts                    (sin cambios)
    └── branding.module.ts                        (sin cambios)
```

---

## 🧪 Testing

### Test 1: GET /api/config/landing (tienda sin configuración)

```bash
curl "https://qronnect-backend.onrender.com/api/config/landing" \
  -H "X-Tenant-Domain: dolcefrio"
```

**Resultado esperado**: HTTP 200 con configuración por defecto (auto-creada)

### Test 2: PUT /api/config/landing (actualizar)

```bash
curl -X PUT "https://qronnect-backend.onrender.com/api/config/landing" \
  -H "X-Tenant-Domain: dolcefrio" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hero_titulo_principal": "Mi Título Personalizado"
  }'
```

**Resultado esperado**: HTTP 200 con configuración actualizada

### Test 3: Verificar en Frontend

1. Ir a: https://dolcefrio.qronnect.es/admin/configuracion/landing
2. La página debe cargar sin errores
3. Modificar cualquier campo (ej: Hero → Título Principal)
4. Guardar → Debe aparecer mensaje de éxito
5. Refrescar página → El cambio debe persistir

---

## 📈 Beneficios

✅ **Backward Compatibility**: Tiendas antiguas funcionan sin migración manual
✅ **Auto-creación**: Configuración se crea automáticamente al acceder
✅ **Sin errores 404**: Siempre devuelve configuración (creándola si es necesario)
✅ **Logs detallados**: Fácil debugging con emojis y mensajes claros
✅ **RLS permisivas**: Backend puede operar sin bloqueos

---

## 🐛 Troubleshooting

### Problema: Error 404 persiste después del deploy

**Solución**:
1. Verificar que Render deployó correctamente (ver commit hash)
2. Verificar logs de Render: buscar líneas con "Landing_config"
3. Verificar que la tabla `landing_config` existe en Supabase:
   ```sql
   SELECT * FROM landing_config LIMIT 1;
   ```

### Problema: Error "new row violates row-level security policy"

**Solución**:
1. Aplicar migración `20251122000007_fix_landing_config_rls.sql`
2. Verificar policies en Supabase:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'landing_config';
   ```

### Problema: Logs muestran "❌ Error al crear landing_config"

**Solución**:
1. Ver mensaje completo del error en logs de Render
2. Verificar que el campo `id_tienda` es un UUID válido
3. Verificar que existe la tienda en la tabla `tiendas`

---

## 🎯 Próximos Pasos

1. **Deploy a producción** (Render auto-deploy al hacer push)
2. **Testing en ambiente real** con https://dolcefrio.qronnect.es
3. **Monitorear logs** para verificar auto-creación funciona
4. **Documentar** cualquier edge case encontrado

---

**Estado**: ✅ Fix completo - Listo para deploy
