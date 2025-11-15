-- ============================================
-- LÍMITES Y GESTIÓN DE API KEYS IA
-- ============================================
-- Date: 2025-11-14
-- Description: Sistema de límites de uso de IA y gestión de API keys propias

-- ============================================
-- 1. Extender tabla tiendas con configuración de IA
-- ============================================
ALTER TABLE public.tiendas
  ADD COLUMN IF NOT EXISTS ia_modo VARCHAR(20) DEFAULT 'global', -- 'global' | 'propio'
  ADD COLUMN IF NOT EXISTS ia_api_key_propia TEXT, -- Encriptada
  ADD COLUMN IF NOT EXISTS ia_limite_mensual INTEGER, -- Según plan
  ADD COLUMN IF NOT EXISTS ia_consumo_actual INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ia_ultimo_reset DATE DEFAULT CURRENT_DATE;

-- Comentarios
COMMENT ON COLUMN public.tiendas.ia_modo IS 'Modo de uso de IA: global (cuenta Qronnect) o propio (API key propia)';
COMMENT ON COLUMN public.tiendas.ia_api_key_propia IS 'API key propia de Gemini (encriptada)';
COMMENT ON COLUMN public.tiendas.ia_limite_mensual IS 'Límite mensual de generaciones con IA según plan';
COMMENT ON COLUMN public.tiendas.ia_consumo_actual IS 'Consumo actual del mes';
COMMENT ON COLUMN public.tiendas.ia_ultimo_reset IS 'Fecha del último reseteo mensual';

-- ============================================
-- 2. Tabla: ia_uso (auditoría de uso de IA)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ia_uso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,

  -- Tipo de generación
  tipo VARCHAR(50) NOT NULL, -- 'email_campana', 'sms_campana', 'promo', 'kpi_analisis'

  -- Métricas
  tokens_usados INTEGER DEFAULT 0,
  costo_estimado DECIMAL(10, 4) DEFAULT 0,

  -- Estado
  exito BOOLEAN DEFAULT true,
  error_msg TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamp
  fecha TIMESTAMPTZ DEFAULT NOW(),
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ia_uso_tienda ON public.ia_uso(id_tienda);
CREATE INDEX idx_ia_uso_fecha ON public.ia_uso(fecha);
CREATE INDEX idx_ia_uso_tipo ON public.ia_uso(tipo);
CREATE INDEX idx_ia_uso_tienda_fecha ON public.ia_uso(id_tienda, fecha);

COMMENT ON TABLE public.ia_uso IS 'Auditoría de uso de IA por tienda';

-- ============================================
-- 3. Función: Verificar límite de IA
-- ============================================
CREATE OR REPLACE FUNCTION public.verificar_limite_ia(p_tienda_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_tienda RECORD;
  v_disponible BOOLEAN;
  v_restantes INTEGER;
  v_resultado JSONB;
BEGIN
  -- Obtener configuración de la tienda
  SELECT
    ia_modo,
    ia_limite_mensual,
    ia_consumo_actual,
    ia_ultimo_reset
  INTO v_tienda
  FROM public.tiendas
  WHERE id = p_tienda_id;

  -- Si usa API key propia, no hay límites
  IF v_tienda.ia_modo = 'propio' THEN
    RETURN jsonb_build_object(
      'disponible', true,
      'modo', 'propio',
      'limite_mensual', NULL,
      'consumo_actual', NULL,
      'restantes', NULL
    );
  END IF;

  -- Verificar si necesita resetear consumo (nuevo mes)
  IF v_tienda.ia_ultimo_reset < DATE_TRUNC('month', NOW())::DATE THEN
    UPDATE public.tiendas
    SET
      ia_consumo_actual = 0,
      ia_ultimo_reset = CURRENT_DATE
    WHERE id = p_tienda_id;

    v_tienda.ia_consumo_actual := 0;
  END IF;

  -- Calcular disponibilidad
  v_restantes := COALESCE(v_tienda.ia_limite_mensual, 50) - COALESCE(v_tienda.ia_consumo_actual, 0);
  v_disponible := v_restantes > 0;

  v_resultado := jsonb_build_object(
    'disponible', v_disponible,
    'modo', 'global',
    'limite_mensual', COALESCE(v_tienda.ia_limite_mensual, 50),
    'consumo_actual', COALESCE(v_tienda.ia_consumo_actual, 0),
    'restantes', GREATEST(v_restantes, 0)
  );

  RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION public.verificar_limite_ia IS 'Verifica si una tienda puede usar IA según su límite mensual';

-- ============================================
-- 4. Función: Incrementar consumo de IA
-- ============================================
CREATE OR REPLACE FUNCTION public.incrementar_consumo_ia(
  p_tienda_id UUID,
  p_cantidad INTEGER DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Solo incrementar si está en modo global
  UPDATE public.tiendas
  SET ia_consumo_actual = ia_consumo_actual + p_cantidad
  WHERE id = p_tienda_id
    AND ia_modo = 'global';
END;
$$;

COMMENT ON FUNCTION public.incrementar_consumo_ia IS 'Incrementa el contador de uso de IA para una tienda';

-- ============================================
-- 5. Función: Registrar uso de IA
-- ============================================
CREATE OR REPLACE FUNCTION public.registrar_uso_ia(
  p_tienda_id UUID,
  p_tipo VARCHAR,
  p_tokens INTEGER DEFAULT 0,
  p_exito BOOLEAN DEFAULT true,
  p_error_msg TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_costo DECIMAL(10, 4);
BEGIN
  -- Calcular costo estimado (basado en tokens)
  -- Gemini Flash: ~$0.075 por 1M tokens de input
  v_costo := (p_tokens::DECIMAL / 1000000) * 0.075;

  -- Insertar registro
  INSERT INTO public.ia_uso (
    id_tienda,
    tipo,
    tokens_usados,
    costo_estimado,
    exito,
    error_msg,
    metadata
  ) VALUES (
    p_tienda_id,
    p_tipo,
    p_tokens,
    v_costo,
    p_exito,
    p_error_msg,
    p_metadata
  );

  -- Incrementar consumo si fue exitoso
  IF p_exito THEN
    PERFORM public.incrementar_consumo_ia(p_tienda_id, 1);
  END IF;
END;
$$;

COMMENT ON FUNCTION public.registrar_uso_ia IS 'Registra un uso de IA y actualiza contadores';

-- ============================================
-- 6. Función: Obtener estadísticas de uso de IA
-- ============================================
CREATE OR REPLACE FUNCTION public.estadisticas_uso_ia(p_tienda_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_mes INTEGER;
  v_total_historico INTEGER;
  v_por_tipo JSONB;
  v_tokens_mes INTEGER;
  v_costo_mes DECIMAL(10, 4);
  v_resultado JSONB;
BEGIN
  -- Total este mes
  SELECT COUNT(*) INTO v_total_mes
  FROM public.ia_uso
  WHERE id_tienda = p_tienda_id
    AND fecha >= DATE_TRUNC('month', NOW());

  -- Total histórico
  SELECT COUNT(*) INTO v_total_historico
  FROM public.ia_uso
  WHERE id_tienda = p_tienda_id;

  -- Desglose por tipo este mes
  SELECT jsonb_object_agg(tipo, count)
  INTO v_por_tipo
  FROM (
    SELECT tipo, COUNT(*) as count
    FROM public.ia_uso
    WHERE id_tienda = p_tienda_id
      AND fecha >= DATE_TRUNC('month', NOW())
    GROUP BY tipo
  ) sub;

  -- Tokens y costo este mes
  SELECT
    COALESCE(SUM(tokens_usados), 0),
    COALESCE(SUM(costo_estimado), 0)
  INTO v_tokens_mes, v_costo_mes
  FROM public.ia_uso
  WHERE id_tienda = p_tienda_id
    AND fecha >= DATE_TRUNC('month', NOW());

  v_resultado := jsonb_build_object(
    'total_este_mes', v_total_mes,
    'total_historico', v_total_historico,
    'por_tipo', COALESCE(v_por_tipo, '{}'::jsonb),
    'tokens_este_mes', v_tokens_mes,
    'costo_estimado_mes', v_costo_mes
  );

  RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION public.estadisticas_uso_ia IS 'Obtiene estadísticas de uso de IA para una tienda';

-- ============================================
-- 7. Vista: Dashboard de uso de IA
-- ============================================
CREATE OR REPLACE VIEW public.vista_ia_uso_dashboard AS
SELECT
  u.id,
  u.id_tienda,
  t.nombre as tienda_nombre,
  u.tipo,
  u.tokens_usados,
  u.costo_estimado,
  u.exito,
  u.error_msg,
  u.fecha,
  u.creado_en
FROM public.ia_uso u
INNER JOIN public.tiendas t ON u.id_tienda = t.id
ORDER BY u.creado_en DESC;

COMMENT ON VIEW public.vista_ia_uso_dashboard IS 'Vista de uso de IA para dashboard';

-- ============================================
-- 8. RLS - Deshabilitar para usar service role
-- ============================================
ALTER TABLE public.ia_uso DISABLE ROW LEVEL SECURITY;

COMMIT;
