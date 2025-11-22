-- Script para inicializar onboarding en tiendas existentes
-- Ejecutar en Supabase después de aplicar la migración 20251122000006

-- Insertar registro de onboarding para todas las tiendas que no lo tienen
INSERT INTO onboarding_progress (id_tienda, paso_actual, porcentaje_completado)
SELECT
  t.id,
  1,
  0
FROM tiendas t
WHERE NOT EXISTS (
  SELECT 1
  FROM onboarding_progress op
  WHERE op.id_tienda = t.id
)
ON CONFLICT (id_tienda) DO NOTHING;

-- Verificar cuántas tiendas se inicializaron
SELECT
  COUNT(*) as tiendas_totales,
  COUNT(CASE WHEN op.id IS NOT NULL THEN 1 END) as con_onboarding,
  COUNT(CASE WHEN op.id IS NULL THEN 1 END) as sin_onboarding
FROM tiendas t
LEFT JOIN onboarding_progress op ON t.id = op.id_tienda;
