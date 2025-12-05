# Verificación y Corrección - Sistema de Sellos

## Problema Actual
Error 500 al intentar crear programas de sellos en producción.

## Causa Raíz
El sistema requiere que las tablas del sistema de sellos existan en la base de datos de producción (Supabase).

## Solución

### 1. Verificar si las tablas existen

Ejecuta esta query en Supabase SQL Editor (Dashboard > SQL Editor):

```sql
-- Verificar si existen las tablas del sistema de sellos
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'programas_sellos',
    'tarjetas_sellos_clientes',
    'sellos_otorgados',
    'cupones_sellos_generados'
  )
ORDER BY table_name;
```

**Resultado esperado**: Deberían aparecer las 4 tablas.

Si NO aparecen las tablas, continúa con el paso 2.

### 2. Ejecutar la migración manualmente

Si las tablas no existen, ejecuta la migración completa en Supabase SQL Editor:

📁 **Archivo**: `backend/supabase/migrations/20251204000001_create_stamp_cards_system.sql`

**Pasos**:
1. Ve a tu proyecto en Supabase Dashboard
2. Abre **SQL Editor**
3. Copia el contenido completo del archivo `20251204000001_create_stamp_cards_system.sql`
4. Pega en el editor SQL
5. Haz clic en **Run** (▶️)

### 3. Verificar que la migración se ejecutó correctamente

Después de ejecutar la migración, verifica que todo esté creado:

```sql
-- 1. Verificar tablas creadas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%sellos%'
ORDER BY table_name;

-- 2. Verificar estructura de programas_sellos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'programas_sellos'
ORDER BY ordinal_position;

-- 3. Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename LIKE '%sellos%'
ORDER BY tablename, indexname;

-- 4. Verificar políticas RLS
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename LIKE '%sellos%'
ORDER BY tablename, policyname;
```

### 4. Probar la funcionalidad

Después de verificar que las tablas existen:

1. Espera a que Render termine de desplegar la última versión del backend
2. Refresca la aplicación web
3. Intenta crear un nuevo programa de sellos desde el dashboard admin

## Cambios Desplegados

✅ **Frontend**:
- Header `X-Tenant-Domain` añadido a todas las llamadas API de sellos
- Modal de plantillas mejorado (responsive)
- DialogDescription añadido para accesibilidad

✅ **Backend**:
- `AdminAuthGuard` añadido al `SellosController`
- Esto permite que `req.user.id_tienda` esté disponible

## Logs útiles para debugging

Si el error persiste, revisa los logs de Render:

```bash
# En Render Dashboard > tu-servicio > Logs

# Busca líneas como:
[SellosService] Creando programa de sellos para tienda <UUID>
ERROR al crear programa de sellos: <detalle del error>
```

## Contacto

Si después de seguir estos pasos el error persiste, proporciona:
1. Screenshot de los logs de Render
2. Resultado de las queries de verificación de Supabase
3. Payload exacto que se está enviando al crear el programa
