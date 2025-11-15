-- ============================================
-- CONFIGURACIÓN EXTENSA PARA IA
-- ============================================
-- Date: 2025-11-14
-- Description: Añadir configuración detallada para mejorar generación de contenido con IA

-- ============================================
-- 1. Agregar campo config_ia a tiendas
-- ============================================
ALTER TABLE public.tiendas
  ADD COLUMN IF NOT EXISTS config_ia JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.tiendas.config_ia IS 'Configuración extensa para generación de contenido con IA';

-- Estructura esperada del JSONB config_ia:
-- {
--   "tipo_negocio": "gimnasio",
--   "publico_objetivo": {
--     "edad_min": 18,
--     "edad_max": 45,
--     "generos": ["masculino", "femenino"],
--     "intereses": ["fitness", "crossfit", "salud"]
--   },
--   "valores_marca": ["motivacion", "comunidad", "resultados"],
--   "tono_comunicacion": "motivador",
--   "productos_principales": [
--     "Clases de CrossFit",
--     "Entrenamiento personal",
--     "Nutrición deportiva"
--   ],
--   "rango_precios": "medio",
--   "ubicacion": {
--     "barrio": "Salamanca",
--     "ciudad": "Madrid",
--     "referencias_locales": true
--   },
--   "promociones_recurrentes": [
--     "Black Friday - Noviembre",
--     "Operación bikini - Mayo"
--   ],
--   "slogan": "Tu mejor versión comienza aquí",
--   "hashtags": ["#GymFitMadrid", "#CrossFitSalamanca"]
-- }

COMMIT;
