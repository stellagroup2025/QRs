-- Migración: Añadir campos para imagenes de landing page
-- Fecha: 2025-12-26
-- Descripción: Añade columnas para almacenar URLs de imágenes (Hero y Backgrounds)

ALTER TABLE landing_config
  ADD COLUMN IF NOT EXISTS hero_imagen_url TEXT,
  ADD COLUMN IF NOT EXISTS hero_bg_url TEXT,
  ADD COLUMN IF NOT EXISTS servicios_bg_url TEXT,
  ADD COLUMN IF NOT EXISTS beneficios_bg_url TEXT,
  ADD COLUMN IF NOT EXISTS testimonios_bg_url TEXT,
  ADD COLUMN IF NOT EXISTS cta_final_bg_url TEXT;

COMMENT ON COLUMN landing_config.hero_imagen_url IS 'URL de la imagen principal del Hero';
COMMENT ON COLUMN landing_config.hero_bg_url IS 'URL de la imagen de fondo de la sección Hero';
COMMENT ON COLUMN landing_config.servicios_bg_url IS 'URL de la imagen de fondo de la sección Servicios';
COMMENT ON COLUMN landing_config.beneficios_bg_url IS 'URL de la imagen de fondo de la sección Beneficios';
COMMENT ON COLUMN landing_config.testimonios_bg_url IS 'URL de la imagen de fondo de la sección Testimonios';
COMMENT ON COLUMN landing_config.cta_final_bg_url IS 'URL de la imagen de fondo de la sección CTA Final';
