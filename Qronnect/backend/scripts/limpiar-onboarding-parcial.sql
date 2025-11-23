-- Script para limpiar restos de migración parcial de onboarding
-- Ejecutar ANTES de volver a aplicar la migración 20251122000006

-- ADVERTENCIA: Este script elimina todo lo relacionado con onboarding
-- Solo ejecutar si estás seguro de que quieres empezar de cero

BEGIN;

-- 1. Eliminar triggers
DROP TRIGGER IF EXISTS trigger_iniciar_onboarding ON tiendas;

-- 2. Eliminar funciones
DROP FUNCTION IF EXISTS iniciar_onboarding() CASCADE;
DROP FUNCTION IF EXISTS actualizar_progreso_onboarding(UUID, INTEGER, JSONB) CASCADE;
DROP FUNCTION IF EXISTS omitir_paso_onboarding(UUID, INTEGER) CASCADE;

-- 3. Eliminar vista de analytics
DROP VIEW IF EXISTS onboarding_analytics CASCADE;

-- 4. Eliminar tablas (CASCADE elimina también los índices)
DROP TABLE IF EXISTS onboarding_progress CASCADE;
DROP TABLE IF EXISTS plantillas_promociones CASCADE;

-- 5. Verificar que todo se eliminó
SELECT
  COUNT(*) FILTER (WHERE table_name = 'onboarding_progress') AS onboarding_progress_exists,
  COUNT(*) FILTER (WHERE table_name = 'plantillas_promociones') AS plantillas_exists
FROM information_schema.tables
WHERE table_schema = 'public';

COMMIT;

-- Si el resultado anterior muestra 0 y 0, todo está limpio
-- Ahora puedes ejecutar la migración 20251122000006_create_onboarding_system.sql completa
