-- =====================================================
-- Script: Inicializar landing_config para todas las tiendas
-- Fecha: 2025-11-22
-- Uso: Ejecutar en Supabase SQL Editor
-- =====================================================

-- Insertar configuración por defecto para todas las tiendas sin configuración
INSERT INTO landing_config (id_tienda)
SELECT id FROM tiendas
WHERE NOT EXISTS (
    SELECT 1 FROM landing_config WHERE landing_config.id_tienda = tiendas.id
)
AND activo = true;

-- Verificar cuántas configuraciones se crearon
SELECT
  (SELECT COUNT(*) FROM landing_config) as total_configs,
  (SELECT COUNT(*) FROM tiendas WHERE activo = true) as total_tiendas,
  (SELECT COUNT(*) FROM tiendas WHERE activo = true AND NOT EXISTS (
    SELECT 1 FROM landing_config WHERE landing_config.id_tienda = tiendas.id
  )) as tiendas_sin_config;
