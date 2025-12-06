-- =====================================================
-- FIX: Corregir referencia ambigua en generar_qr_codes_batch
-- =====================================================
-- Error: column reference "hash" is ambiguous
-- Solución: Calificar variables de salida con nombre de función

CREATE OR REPLACE FUNCTION generar_qr_codes_batch(
  p_cantidad INTEGER,
  p_lote VARCHAR DEFAULT NULL,
  p_admin_id UUID DEFAULT NULL
)
RETURNS TABLE(
  hash VARCHAR,
  qr_url TEXT
) AS $$
DECLARE
  v_hash TEXT;
  v_url TEXT;
  i INTEGER;
BEGIN
  FOR i IN 1..p_cantidad LOOP
    -- Generar hash único
    LOOP
      v_hash := generar_hash_qr();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM qr_codes_pool WHERE qr_codes_pool.hash = v_hash);
    END LOOP;

    -- Construir URL
    v_url := 'https://qronnect.es/q/' || v_hash;

    -- Insertar en la base de datos
    INSERT INTO qr_codes_pool (hash, qr_url, lote, creado_por)
    VALUES (v_hash, v_url, p_lote, p_admin_id);

    -- Retornar para el script de generación
    -- IMPORTANTE: Calificar con nombre de función para evitar ambigüedad
    generar_qr_codes_batch.hash := v_hash;
    generar_qr_codes_batch.qr_url := v_url;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
