-- =====================================================
-- FIX: Redirigir QR asignados a /get-qr en lugar de homepage
-- =====================================================

CREATE OR REPLACE FUNCTION obtener_redireccion_qr(
  p_hash VARCHAR
)
RETURNS TABLE(
  url_destino TEXT,
  id_qr UUID,
  id_tienda UUID,
  nombre_tienda VARCHAR
) AS $$
DECLARE
  v_qr RECORD;
  v_tienda RECORD;
BEGIN
  -- Obtener QR
  SELECT * INTO v_qr
  FROM qr_codes_pool
  WHERE hash = p_hash;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'QR no encontrado';
  END IF;

  -- Incrementar contador de escaneos
  UPDATE qr_codes_pool
  SET
    total_escaneos = total_escaneos + 1,
    ultimo_escaneo = NOW()
  WHERE hash = p_hash;

  -- Si está asignado, obtener info de la tienda
  IF v_qr.estado = 'asignado' AND v_qr.id_tienda IS NOT NULL THEN
    SELECT * INTO v_tienda
    FROM tiendas
    WHERE id = v_qr.id_tienda;

    -- Construir URL de destino (subdominio + /get-qr)
    -- IMPORTANTE: Ahora redirige a /get-qr en lugar de homepage
    url_destino := 'https://' || v_tienda.slug || '.qronnect.es/get-qr';
    id_qr := v_qr.id;
    id_tienda := v_tienda.id;
    nombre_tienda := v_tienda.nombre;

    RETURN NEXT;
  ELSE
    -- QR no asignado, redirigir a página de información
    url_destino := 'https://qronnect.es';
    id_qr := v_qr.id;
    id_tienda := NULL;
    nombre_tienda := NULL;

    RETURN NEXT;
  END IF;
END;
$$ LANGUAGE plpgsql;
