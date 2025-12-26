-- Migración: Añadir campos de activo para beneficios de landing
-- Fecha: 2025-12-26
-- Descripción: Añade flags booleanos para activar/desactivar cada beneficio individualmente

ALTER TABLE landing_config
  ADD COLUMN IF NOT EXISTS beneficio_1_activo BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS beneficio_2_activo BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS beneficio_3_activo BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS beneficio_4_activo BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS beneficio_5_activo BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS beneficio_6_activo BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN landing_config.beneficio_1_activo IS 'Estado activo/inactivo del beneficio 1';
COMMENT ON COLUMN landing_config.beneficio_2_activo IS 'Estado activo/inactivo del beneficio 2';
COMMENT ON COLUMN landing_config.beneficio_3_activo IS 'Estado activo/inactivo del beneficio 3';
COMMENT ON COLUMN landing_config.beneficio_4_activo IS 'Estado activo/inactivo del beneficio 4';
COMMENT ON COLUMN landing_config.beneficio_5_activo IS 'Estado activo/inactivo del beneficio 5';
COMMENT ON COLUMN landing_config.beneficio_6_activo IS 'Estado activo/inactivo del beneficio 6';
