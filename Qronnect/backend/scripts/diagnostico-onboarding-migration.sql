-- Script de diagnóstico para verificar el estado de la migración de onboarding
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si existe la tabla onboarding_progress
SELECT
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'onboarding_progress'
  ) AS "tabla_onboarding_progress_existe";

-- 2. Verificar si existe la tabla plantillas_promociones
SELECT
  EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'plantillas_promociones'
  ) AS "tabla_plantillas_promociones_existe";

-- 3. Verificar índices de onboarding_progress
SELECT indexname
FROM pg_indexes
WHERE tablename = 'onboarding_progress'
ORDER BY indexname;

-- 4. Verificar funciones de onboarding
SELECT proname AS nombre_funcion
FROM pg_proc
WHERE proname IN (
  'iniciar_onboarding',
  'actualizar_progreso_onboarding',
  'omitir_paso_onboarding'
)
ORDER BY proname;

-- 5. Verificar triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%onboarding%';

-- 6. Verificar vista de analytics
SELECT
  EXISTS (
    SELECT FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name = 'onboarding_analytics'
  ) AS "vista_onboarding_analytics_existe";

-- 7. Si existe la tabla, contar registros
SELECT COUNT(*) AS total_registros_onboarding
FROM onboarding_progress;
