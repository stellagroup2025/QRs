-- Migración: Añadir favicon y logo personalizados por tienda
-- Fecha: 2025-11-22
-- Descripción: Permite que cada tenant tenga su propio favicon, logo y OG image

-- Añadir campos de assets personalizados
ALTER TABLE tiendas
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS favicon_url TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN tiendas.logo_url IS 'URL del logo de la tienda (puede ser ruta relativa /brand/{dominio}/logo.svg o URL absoluta https://...)';
COMMENT ON COLUMN tiendas.favicon_url IS 'URL del favicon de la tienda (puede ser ruta relativa /brand/{dominio}/favicon.ico o URL absoluta https://...)';
COMMENT ON COLUMN tiendas.og_image_url IS 'URL de la imagen Open Graph para compartir en redes sociales (1200x630px recomendado)';

-- Valores por defecto para tiendas existentes (usar logo de Qronnect)
UPDATE tiendas
SET
  logo_url = COALESCE(logo_url, '/brand/qronnect/logo.svg'),
  favicon_url = COALESCE(favicon_url, '/brand/qronnect/favicon.ico'),
  og_image_url = COALESCE(og_image_url, '/brand/qronnect/og-qronnect.jpg')
WHERE logo_url IS NULL OR favicon_url IS NULL OR og_image_url IS NULL;

-- Comentario: Las tiendas sin configuración personalizada usarán el branding de Qronnect
-- Esto da una apariencia profesional por defecto hasta que configuren sus propios assets
