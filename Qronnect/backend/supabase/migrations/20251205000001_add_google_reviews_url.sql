-- Migración: Añadir campo google_reviews_url a la tabla tiendas
-- Fecha: 2025-12-05
-- Descripción: Añade un campo opcional para almacenar la URL de reseñas de Google
--              que se usará en los emails de agradecimiento post-compra

-- Añadir la columna google_reviews_url
ALTER TABLE tiendas
ADD COLUMN IF NOT EXISTS google_reviews_url TEXT;

-- Añadir comentario para documentación
COMMENT ON COLUMN tiendas.google_reviews_url IS 'URL de Google Reviews para solicitar reseñas a clientes (ejemplo: https://g.page/r/XXX/review)';

-- Ejemplo de actualización para una tienda de prueba (comentado)
-- UPDATE tiendas
-- SET google_reviews_url = 'https://g.page/r/CXXXXxxxxXXXX/review'
-- WHERE slug = 'mi-tienda';
