-- =====================================================
-- SISTEMA DE QR CODES GENÉRICOS PRE-IMPRESOS
-- =====================================================
-- Fecha: 2025-12-06
-- Descripción: Pool de QR codes genéricos que se asignan
--              dinámicamente a tiendas según necesidad
--
-- Flujo:
-- 1. Se generan N QR codes con hash único
-- 2. Se imprimen pegatinas con URL: qronnect.es/q/{hash}
-- 3. Al crear tienda, se escanea una pegatina disponible
-- 4. El hash se asigna a la tienda
-- 5. La URL del QR redirige al subdominio de la tienda

-- =====================================================
-- 1. TABLA: qr_codes_pool
-- =====================================================
-- Pool de QR codes genéricos disponibles
CREATE TABLE IF NOT EXISTS qr_codes_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Hash único del QR (8-12 caracteres)
  hash VARCHAR(12) UNIQUE NOT NULL,

  -- URL completa del QR (para referencia)
  qr_url TEXT NOT NULL,

  -- Estado del QR
  estado VARCHAR(20) NOT NULL DEFAULT 'disponible'
    CHECK (estado IN ('disponible', 'asignado', 'desactivado')),

  -- Asignación a tienda (NULL si disponible)
  id_tienda UUID REFERENCES tiendas(id) ON DELETE SET NULL,
  fecha_asignacion TIMESTAMPTZ,

  -- Metadata adicional
  lote VARCHAR(50), -- Número de lote de impresión (ej: "LOTE-2024-001")
  notas TEXT,

  -- Estadísticas de uso
  total_escaneos INTEGER DEFAULT 0,
  ultimo_escaneo TIMESTAMPTZ,

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),
  creado_por UUID -- ID del superadmin que lo creó (opcional)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_qr_codes_hash ON qr_codes_pool(hash);
CREATE INDEX idx_qr_codes_estado ON qr_codes_pool(estado);
CREATE INDEX idx_qr_codes_tienda ON qr_codes_pool(id_tienda);
CREATE INDEX idx_qr_codes_lote ON qr_codes_pool(lote);

-- =====================================================
-- 2. TABLA: qr_redirects_log
-- =====================================================
-- Log de todas las redirecciones de QR (analytics)
CREATE TABLE IF NOT EXISTS qr_redirects_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_qr UUID NOT NULL REFERENCES qr_codes_pool(id) ON DELETE CASCADE,
  id_tienda UUID REFERENCES tiendas(id) ON DELETE SET NULL,

  -- Información del escaneo
  fecha_escaneo TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET,
  pais VARCHAR(2), -- Código ISO del país
  ciudad VARCHAR(100),

  -- URL de destino
  url_destino TEXT NOT NULL,

  -- Metadata
  referer TEXT,
  dispositivo VARCHAR(20) -- 'mobile', 'desktop', 'tablet'
);

-- Índice para analytics
CREATE INDEX idx_qr_redirects_qr ON qr_redirects_log(id_qr);
CREATE INDEX idx_qr_redirects_fecha ON qr_redirects_log(fecha_escaneo);
CREATE INDEX idx_qr_redirects_tienda ON qr_redirects_log(id_tienda);

-- =====================================================
-- 3. FUNCIONES AUXILIARES
-- =====================================================

-- Generar hash aleatorio único para QR
CREATE OR REPLACE FUNCTION generar_hash_qr()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Función para generar múltiples QR codes
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
      EXIT WHEN NOT EXISTS (SELECT 1 FROM qr_codes_pool WHERE hash = v_hash);
    END LOOP;

    -- Construir URL
    v_url := 'https://qronnect.es/q/' || v_hash;

    -- Insertar en la base de datos
    INSERT INTO qr_codes_pool (hash, qr_url, lote, creado_por)
    VALUES (v_hash, v_url, p_lote, p_admin_id);

    -- Retornar para el script de generación
    generar_qr_codes_batch.hash := v_hash;
    generar_qr_codes_batch.qr_url := v_url;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función para asignar QR a tienda
CREATE OR REPLACE FUNCTION asignar_qr_a_tienda(
  p_hash VARCHAR,
  p_id_tienda UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_qr_id UUID;
BEGIN
  -- Verificar que el QR existe y está disponible
  SELECT id INTO v_qr_id
  FROM qr_codes_pool
  WHERE hash = p_hash AND estado = 'disponible';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'QR no encontrado o ya está asignado';
  END IF;

  -- Verificar que la tienda no tiene ya un QR asignado
  IF EXISTS (SELECT 1 FROM qr_codes_pool WHERE id_tienda = p_id_tienda AND estado = 'asignado') THEN
    RAISE EXCEPTION 'Esta tienda ya tiene un QR asignado';
  END IF;

  -- Asignar QR a la tienda
  UPDATE qr_codes_pool
  SET
    estado = 'asignado',
    id_tienda = p_id_tienda,
    fecha_asignacion = NOW(),
    actualizado_en = NOW()
  WHERE hash = p_hash;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener URL de redirección desde hash
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

    -- Construir URL de destino (subdominio)
    url_destino := 'https://' || v_tienda.slug || '.qronnect.es';
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

-- =====================================================
-- 4. RLS (Row Level Security)
-- =====================================================
ALTER TABLE qr_codes_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_redirects_log ENABLE ROW LEVEL SECURITY;

-- Políticas para qr_codes_pool
-- Admins pueden ver todos los QR codes
CREATE POLICY "Admins pueden ver todos los QR codes"
  ON qr_codes_pool FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'superadmin'
  );

-- Admins solo ven QR codes de su tienda
CREATE POLICY "Admins ven QR de su tienda"
  ON qr_codes_pool FOR SELECT
  TO authenticated
  USING (
    id_tienda = (auth.jwt() ->> 'tienda_id')::UUID
  );

-- Superadmins pueden gestionar todos los QR codes
CREATE POLICY "Superadmins gestionan QR codes"
  ON qr_codes_pool FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'superadmin')
  WITH CHECK (auth.jwt() ->> 'role' = 'superadmin');

-- Políticas para qr_redirects_log (solo lectura para analytics)
CREATE POLICY "Admins ven logs de su tienda"
  ON qr_redirects_log FOR SELECT
  TO authenticated
  USING (
    id_tienda = (auth.jwt() ->> 'tienda_id')::UUID OR
    auth.jwt() ->> 'role' = 'superadmin'
  );

-- =====================================================
-- 5. COMENTARIOS
-- =====================================================
COMMENT ON TABLE qr_codes_pool IS 'Pool de QR codes genéricos pre-impresos que se asignan dinámicamente a tiendas';
COMMENT ON TABLE qr_redirects_log IS 'Log de todas las redirecciones de QR codes para analytics';
COMMENT ON FUNCTION generar_qr_codes_batch IS 'Genera un lote de N QR codes únicos para imprimir';
COMMENT ON FUNCTION asignar_qr_a_tienda IS 'Asigna un QR code disponible a una tienda específica';
COMMENT ON FUNCTION obtener_redireccion_qr IS 'Obtiene la URL de destino para un hash de QR code';
