-- Migración: Añadir campos de personalización de marca a tabla tiendas
-- Fecha: 2025-11-10
-- Descripción: Añade campos para colores personalizados y nombre comercial

-- Añadir campos de personalización
ALTER TABLE tiendas
  ADD COLUMN IF NOT EXISTS color_primario TEXT DEFAULT '#000000',
  ADD COLUMN IF NOT EXISTS color_secundario TEXT DEFAULT '#666666',
  ADD COLUMN IF NOT EXISTS color_acento TEXT DEFAULT '#0066cc',
  ADD COLUMN IF NOT EXISTS nombre_comercial TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN tiendas.color_primario IS 'Color principal de la marca en formato hex (#RRGGBB)';
COMMENT ON COLUMN tiendas.color_secundario IS 'Color secundario de la marca en formato hex (#RRGGBB)';
COMMENT ON COLUMN tiendas.color_acento IS 'Color de acento de la marca en formato hex (#RRGGBB)';
COMMENT ON COLUMN tiendas.nombre_comercial IS 'Nombre comercial visible del negocio (puede diferir del nombre legal)';

-- Inicializar nombre_comercial con el valor de nombre para tiendas existentes
UPDATE tiendas
SET nombre_comercial = nombre
WHERE nombre_comercial IS NULL;
