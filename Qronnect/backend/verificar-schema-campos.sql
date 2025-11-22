-- ============================================================================
-- VERIFICACIÓN DE SCHEMA: Campos de Clientes
-- ============================================================================
--
-- Este script verifica que todos los campos de la tabla 'clientes'
-- tengan el tamaño correcto para almacenar los datos que genera el código.
--
-- ============================================================================

-- Ver todos los campos VARCHAR de la tabla clientes
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND data_type LIKE '%char%'
ORDER BY ordinal_position;

-- Campos específicos a verificar:

-- 1. codigo_validacion
--    Almacena: crypto.randomBytes(32).toString('hex') = 64 caracteres
--    Debe ser: VARCHAR(64) o mayor
SELECT
  column_name,
  character_maximum_length,
  CASE
    WHEN character_maximum_length >= 64 THEN '✅ OK'
    ELSE '❌ DEMASIADO CORTO - Debe ser VARCHAR(64)'
  END as estado
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name = 'codigo_validacion';

-- 2. email
--    Almacena: Emails de usuarios (ej: usuario@ejemplo.com)
--    Recomendado: VARCHAR(255)
SELECT
  column_name,
  character_maximum_length,
  CASE
    WHEN character_maximum_length >= 255 THEN '✅ OK'
    WHEN character_maximum_length >= 100 THEN '⚠️ ACEPTABLE (pero recomendado 255)'
    ELSE '❌ DEMASIADO CORTO - Debe ser VARCHAR(255)'
  END as estado
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name = 'email';

-- 3. nombre
--    Almacena: Nombres de clientes
--    Recomendado: VARCHAR(100) o mayor
SELECT
  column_name,
  character_maximum_length,
  CASE
    WHEN character_maximum_length >= 100 THEN '✅ OK'
    WHEN character_maximum_length >= 50 THEN '⚠️ ACEPTABLE'
    ELSE '❌ DEMASIADO CORTO'
  END as estado
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name = 'nombre';

-- 4. telefono
--    Almacena: Números de teléfono
--    Recomendado: VARCHAR(20)
SELECT
  column_name,
  character_maximum_length,
  CASE
    WHEN character_maximum_length >= 20 THEN '✅ OK'
    WHEN character_maximum_length >= 15 THEN '⚠️ ACEPTABLE'
    ELSE '❌ DEMASIADO CORTO'
  END as estado
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name = 'telefono';

-- Resumen de todos los campos críticos
SELECT
  'codigo_validacion' as campo,
  'VARCHAR(64)' as requerido,
  character_maximum_length as actual,
  CASE
    WHEN character_maximum_length >= 64 THEN '✅'
    ELSE '❌'
  END as estado
FROM information_schema.columns
WHERE table_name = 'clientes' AND column_name = 'codigo_validacion'

UNION ALL

SELECT
  'email' as campo,
  'VARCHAR(255)' as requerido,
  character_maximum_length as actual,
  CASE
    WHEN character_maximum_length >= 255 THEN '✅'
    ELSE '⚠️'
  END as estado
FROM information_schema.columns
WHERE table_name = 'clientes' AND column_name = 'email'

UNION ALL

SELECT
  'nombre' as campo,
  'VARCHAR(100)' as requerido,
  character_maximum_length as actual,
  CASE
    WHEN character_maximum_length >= 100 THEN '✅'
    ELSE '⚠️'
  END as estado
FROM information_schema.columns
WHERE table_name = 'clientes' AND column_name = 'nombre'

UNION ALL

SELECT
  'telefono' as campo,
  'VARCHAR(20)' as requerido,
  character_maximum_length as actual,
  CASE
    WHEN character_maximum_length >= 20 THEN '✅'
    ELSE '⚠️'
  END as estado
FROM information_schema.columns
WHERE table_name = 'clientes' AND column_name = 'telefono';
