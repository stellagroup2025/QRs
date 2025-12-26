-- Migración: Añadir campos de activo para servicios de landing
-- Fecha: 2025-12-26
-- Descripción: Añade flags booleanos para activar/desactivar cada servicio individualmente

ALTER TABLE landing_config
  ADD COLUMN IF NOT EXISTS servicio_1_activo BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS servicio_2_activo BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS servicio_3_activo BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS servicio_4_activo BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS servicio_5_activo BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS servicio_6_activo BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN landing_config.servicio_1_activo IS 'Estado activo/inactivo del servicio 1';
COMMENT ON COLUMN landing_config.servicio_2_activo IS 'Estado activo/inactivo del servicio 2';
COMMENT ON COLUMN landing_config.servicio_3_activo IS 'Estado activo/inactivo del servicio 3';
COMMENT ON COLUMN landing_config.servicio_4_activo IS 'Estado activo/inactivo del servicio 4';
COMMENT ON COLUMN landing_config.servicio_5_activo IS 'Estado activo/inactivo del servicio 5';
COMMENT ON COLUMN landing_config.servicio_6_activo IS 'Estado activo/inactivo del servicio 6';
