-- =====================================================
-- SCRIPT: Generar QR Codes (Ejecutar en Supabase SQL Editor)
-- =====================================================
-- Uso: Modificar los parámetros y ejecutar

-- PASO 1: Generar 1000 QR codes
-- Modifica la cantidad y el lote según necesites
SELECT * FROM generar_qr_codes_batch(
  1000,                    -- Cantidad de QR codes
  'LOTE-2024-001',         -- Nombre del lote
  NULL                     -- ID del admin (opcional)
);

-- El resultado mostrará todos los QR codes generados con sus URLs

-- =====================================================
-- PASO 2: Exportar a CSV (copiar resultados)
-- =====================================================
-- Ejecuta esta query y copia los resultados a Excel/CSV

SELECT
  hash AS "Hash",
  qr_url AS "URL",
  lote AS "Lote",
  estado AS "Estado",
  creado_en AS "Fecha Creación"
FROM qr_codes_pool
WHERE lote = 'LOTE-2024-001'  -- Cambiar por tu lote
ORDER BY creado_en ASC;

-- =====================================================
-- PASO 3: Ver estadísticas del lote
-- =====================================================
SELECT
  lote,
  COUNT(*) AS total_qrs,
  COUNT(*) FILTER (WHERE estado = 'disponible') AS disponibles,
  COUNT(*) FILTER (WHERE estado = 'asignado') AS asignados,
  MIN(creado_en) AS primera_generacion,
  MAX(creado_en) AS ultima_generacion
FROM qr_codes_pool
WHERE lote = 'LOTE-2024-001'  -- Cambiar por tu lote
GROUP BY lote;

-- =====================================================
-- UTILIDADES
-- =====================================================

-- Ver todos los lotes creados
SELECT DISTINCT lote, COUNT(*) AS cantidad
FROM qr_codes_pool
WHERE lote IS NOT NULL
GROUP BY lote
ORDER BY MAX(creado_en) DESC;

-- Buscar un QR específico por hash
SELECT *
FROM qr_codes_pool
WHERE hash = 'abc123XYZ9';  -- Cambiar por el hash a buscar

-- Ver QR codes disponibles de un lote
SELECT hash, qr_url
FROM qr_codes_pool
WHERE lote = 'LOTE-2024-001' AND estado = 'disponible'
LIMIT 10;

-- Asignar manualmente un QR a una tienda
SELECT asignar_qr_a_tienda(
  'abc123XYZ9',  -- Hash del QR
  '123e4567-e89b-12d3-a456-426614174000'  -- ID de la tienda
);
