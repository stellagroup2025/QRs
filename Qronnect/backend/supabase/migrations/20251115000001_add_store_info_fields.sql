-- ============================================
-- MIGRACIÓN: Añadir campos de información de tienda
-- Fecha: 2025-11-15
-- Descripción: Agrega campos para horarios, sitio web, WhatsApp y redes sociales
-- ============================================

-- Agregar nuevos campos a la tabla tiendas
ALTER TABLE tiendas
  ADD COLUMN IF NOT EXISTS sitio_web TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS horarios JSONB DEFAULT '{
    "lunes": {"abierto": true, "apertura": "09:00", "cierre": "20:00"},
    "martes": {"abierto": true, "apertura": "09:00", "cierre": "20:00"},
    "miercoles": {"abierto": true, "apertura": "09:00", "cierre": "20:00"},
    "jueves": {"abierto": true, "apertura": "09:00", "cierre": "20:00"},
    "viernes": {"abierto": true, "apertura": "09:00", "cierre": "20:00"},
    "sabado": {"abierto": true, "apertura": "10:00", "cierre": "14:00"},
    "domingo": {"abierto": false, "apertura": null, "cierre": null}
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS redes_sociales JSONB DEFAULT '{
    "facebook": null,
    "instagram": null,
    "twitter": null,
    "linkedin": null,
    "tiktok": null
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS ubicacion_maps TEXT,
  ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Crear índice para búsqueda de sitio web
CREATE INDEX IF NOT EXISTS idx_tiendas_sitio_web ON tiendas(sitio_web) WHERE sitio_web IS NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN tiendas.sitio_web IS 'URL del sitio web de la tienda';
COMMENT ON COLUMN tiendas.whatsapp IS 'Número de WhatsApp de la tienda (formato: +34XXXXXXXXX)';
COMMENT ON COLUMN tiendas.horarios IS 'Horarios de apertura y cierre por día de la semana';
COMMENT ON COLUMN tiendas.redes_sociales IS 'URLs de perfiles en redes sociales';
COMMENT ON COLUMN tiendas.ubicacion_maps IS 'URL de Google Maps o coordenadas';
COMMENT ON COLUMN tiendas.descripcion IS 'Descripción breve de la tienda';

-- ============================================
-- FUNCIÓN: Verificar si la tienda está abierta
-- ============================================
CREATE OR REPLACE FUNCTION esta_tienda_abierta(tienda_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  horarios_tienda JSONB;
  dia_semana TEXT;
  hora_actual TIME;
  config_dia JSONB;
  esta_abierto BOOLEAN;
  hora_apertura TIME;
  hora_cierre TIME;
BEGIN
  -- Obtener horarios de la tienda
  SELECT horarios INTO horarios_tienda
  FROM tiendas
  WHERE id = tienda_id;

  IF horarios_tienda IS NULL THEN
    RETURN NULL; -- No hay información de horarios
  END IF;

  -- Obtener día de la semana en español (lowercase)
  dia_semana := CASE EXTRACT(DOW FROM NOW())
    WHEN 0 THEN 'domingo'
    WHEN 1 THEN 'lunes'
    WHEN 2 THEN 'martes'
    WHEN 3 THEN 'miercoles'
    WHEN 4 THEN 'jueves'
    WHEN 5 THEN 'viernes'
    WHEN 6 THEN 'sabado'
  END;

  -- Obtener hora actual
  hora_actual := NOW()::TIME;

  -- Obtener configuración del día actual
  config_dia := horarios_tienda->dia_semana;

  IF config_dia IS NULL THEN
    RETURN NULL; -- No hay configuración para este día
  END IF;

  -- Verificar si está marcado como abierto
  esta_abierto := (config_dia->>'abierto')::BOOLEAN;

  IF NOT esta_abierto THEN
    RETURN FALSE;
  END IF;

  -- Verificar horario
  hora_apertura := (config_dia->>'apertura')::TIME;
  hora_cierre := (config_dia->>'cierre')::TIME;

  IF hora_apertura IS NULL OR hora_cierre IS NULL THEN
    RETURN NULL;
  END IF;

  -- Comparar hora actual con horarios
  RETURN hora_actual >= hora_apertura AND hora_actual <= hora_cierre;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION esta_tienda_abierta IS 'Devuelve TRUE si la tienda está abierta en el momento actual, FALSE si está cerrada, NULL si no hay información';

-- ============================================
-- Actualizar tiendas de ejemplo con información completa
-- ============================================
UPDATE tiendas
SET
  sitio_web = 'https://www.lokeyokiera.com',
  whatsapp = '+34600000000',
  ubicacion_maps = 'https://maps.google.com/?q=40.416775,-3.703790',
  descripcion = 'Tu tienda de confianza'
WHERE dominio = 'lokeyokiera'
  AND sitio_web IS NULL;

-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
