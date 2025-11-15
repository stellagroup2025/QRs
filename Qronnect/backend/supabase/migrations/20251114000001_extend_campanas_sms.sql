-- ============================================
-- EXTENDER CAMPAÑAS SMS CON NUEVAS FUNCIONALIDADES
-- ============================================
-- Date: 2025-11-14
-- Description: Añadir campos para asunto, remitente, programación avanzada, costos y estadísticas

-- ============================================
-- 1. Extender tabla campanas_sms
-- ============================================
ALTER TABLE public.campanas_sms
  ADD COLUMN IF NOT EXISTS asunto VARCHAR(100), -- Para tracking interno
  ADD COLUMN IF NOT EXISTS remitente_nombre VARCHAR(50), -- Nombre legible, ej: "GymFit"
  ADD COLUMN IF NOT EXISTS hora_programada TIME, -- Hora separada de fecha
  ADD COLUMN IF NOT EXISTS zona_horaria VARCHAR(50) DEFAULT 'Europe/Madrid', -- Para envíos programados
  ADD COLUMN IF NOT EXISTS costo_estimado DECIMAL(10,3) DEFAULT 0, -- Basado en destinatarios
  ADD COLUMN IF NOT EXISTS costo_real DECIMAL(10,3) DEFAULT 0, -- Después de enviar
  ADD COLUMN IF NOT EXISTS estadisticas JSONB DEFAULT '{}'; -- Estadísticas detalladas

-- Comentarios
COMMENT ON COLUMN public.campanas_sms.asunto IS 'Asunto interno para organización (no se envía)';
COMMENT ON COLUMN public.campanas_sms.remitente_nombre IS 'Nombre del remitente visible en SMS';
COMMENT ON COLUMN public.campanas_sms.hora_programada IS 'Hora específica para envío programado';
COMMENT ON COLUMN public.campanas_sms.zona_horaria IS 'Zona horaria para envío programado';
COMMENT ON COLUMN public.campanas_sms.costo_estimado IS 'Costo estimado antes de enviar';
COMMENT ON COLUMN public.campanas_sms.costo_real IS 'Costo real después del envío';
COMMENT ON COLUMN public.campanas_sms.estadisticas IS 'JSON con tasa entrega, tasa fallo, tiempo promedio, etc.';

-- ============================================
-- 2. Extender tabla campanas_sms_destinatarios para estadísticas
-- ============================================
ALTER TABLE public.campanas_sms_destinatarios
  ADD COLUMN IF NOT EXISTS operador VARCHAR(50), -- Movistar, Vodafone, etc.
  ADD COLUMN IF NOT EXISTS tiempo_entrega INTEGER, -- Segundos hasta entrega
  ADD COLUMN IF NOT EXISTS fecha_entregado TIMESTAMPTZ, -- Timestamp de entrega confirmada
  ADD COLUMN IF NOT EXISTS intentos_envio INTEGER DEFAULT 1; -- Número de intentos

-- Comentarios
COMMENT ON COLUMN public.campanas_sms_destinatarios.operador IS 'Operador telefónico detectado';
COMMENT ON COLUMN public.campanas_sms_destinatarios.tiempo_entrega IS 'Tiempo en segundos desde envío hasta entrega';
COMMENT ON COLUMN public.campanas_sms_destinatarios.fecha_entregado IS 'Fecha de entrega confirmada';

-- ============================================
-- 3. Función para calcular estadísticas de campaña
-- ============================================
CREATE OR REPLACE FUNCTION public.calcular_estadisticas_campana_sms(p_campana_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_total INTEGER;
  v_enviados INTEGER;
  v_fallidos INTEGER;
  v_tasa_entrega DECIMAL(5,2);
  v_tasa_fallo DECIMAL(5,2);
  v_tiempo_promedio INTEGER;
  v_operadores JSONB;
  v_resultado JSONB;
BEGIN
  -- Contar totales
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE estado = 'enviado'),
    COUNT(*) FILTER (WHERE estado = 'fallido')
  INTO v_total, v_enviados, v_fallidos
  FROM public.campanas_sms_destinatarios
  WHERE id_campana = p_campana_id;

  -- Calcular tasas
  IF v_total > 0 THEN
    v_tasa_entrega := (v_enviados::DECIMAL / v_total::DECIMAL) * 100;
    v_tasa_fallo := (v_fallidos::DECIMAL / v_total::DECIMAL) * 100;
  ELSE
    v_tasa_entrega := 0;
    v_tasa_fallo := 0;
  END IF;

  -- Calcular tiempo promedio de entrega
  SELECT AVG(tiempo_entrega)::INTEGER
  INTO v_tiempo_promedio
  FROM public.campanas_sms_destinatarios
  WHERE id_campana = p_campana_id
    AND tiempo_entrega IS NOT NULL;

  -- Desglose por operador
  SELECT jsonb_object_agg(
    COALESCE(operador, 'desconocido'),
    count
  )
  INTO v_operadores
  FROM (
    SELECT
      operador,
      COUNT(*) as count
    FROM public.campanas_sms_destinatarios
    WHERE id_campana = p_campana_id
    GROUP BY operador
  ) sub;

  -- Construir resultado
  v_resultado := jsonb_build_object(
    'total_destinatarios', v_total,
    'enviados', v_enviados,
    'fallidos', v_fallidos,
    'tasa_entrega_pct', v_tasa_entrega,
    'tasa_fallo_pct', v_tasa_fallo,
    'tiempo_promedio_entrega_seg', COALESCE(v_tiempo_promedio, 0),
    'desglose_operadores', COALESCE(v_operadores, '{}'::jsonb)
  );

  -- Actualizar tabla campanas_sms
  UPDATE public.campanas_sms
  SET estadisticas = v_resultado
  WHERE id = p_campana_id;

  RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION public.calcular_estadisticas_campana_sms IS 'Calcula y actualiza las estadísticas de una campaña SMS';

-- ============================================
-- 4. Función para detectar operador por prefijo
-- ============================================
CREATE OR REPLACE FUNCTION public.detectar_operador_espana(p_telefono VARCHAR)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
  v_prefijo VARCHAR(5);
BEGIN
  -- Limpiar teléfono (remover espacios, guiones, etc.)
  p_telefono := REGEXP_REPLACE(p_telefono, '[^0-9]', '', 'g');

  -- Obtener primeros 3 dígitos después del código de país
  IF p_telefono LIKE '34%' THEN
    v_prefijo := SUBSTRING(p_telefono FROM 3 FOR 3);
  ELSIF LENGTH(p_telefono) = 9 THEN
    v_prefijo := SUBSTRING(p_telefono FROM 1 FOR 3);
  ELSE
    RETURN 'desconocido';
  END IF;

  -- Mapeo de prefijos a operadores (España)
  CASE
    -- Movistar
    WHEN v_prefijo IN ('600', '601', '602', '603', '604', '605', '606', '607', '608', '609') THEN
      RETURN 'Movistar';
    -- Vodafone
    WHEN v_prefijo IN ('610', '611', '612', '613', '614', '615', '616', '617', '618', '619') THEN
      RETURN 'Vodafone';
    -- Orange
    WHEN v_prefijo IN ('620', '621', '622', '623', '624', '625', '626', '627', '628', '629') THEN
      RETURN 'Orange';
    -- Yoigo/MásMóvil
    WHEN v_prefijo IN ('630', '631', '632', '633', '634', '635', '636', '637', '638', '639') THEN
      RETURN 'Yoigo/MásMóvil';
    -- Otros
    ELSE
      RETURN 'Otro';
  END CASE;
END;
$$;

COMMENT ON FUNCTION public.detectar_operador_espana IS 'Detecta el operador telefónico por prefijo (España)';

-- ============================================
-- 5. Trigger para actualizar estadísticas automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.trigger_actualizar_stats_campana_sms()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Actualizar estadísticas cuando cambia el estado de un destinatario
  PERFORM public.calcular_estadisticas_campana_sms(NEW.id_campana);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_stats_campana_sms ON public.campanas_sms_destinatarios;

CREATE TRIGGER trigger_stats_campana_sms
  AFTER INSERT OR UPDATE OF estado
  ON public.campanas_sms_destinatarios
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_actualizar_stats_campana_sms();

-- ============================================
-- 6. Función para calcular costo estimado
-- ============================================
CREATE OR REPLACE FUNCTION public.calcular_costo_estimado_sms(
  p_mensaje TEXT,
  p_num_destinatarios INTEGER
)
RETURNS DECIMAL(10,3)
LANGUAGE plpgsql
AS $$
DECLARE
  v_num_sms INTEGER;
  v_costo_por_sms DECIMAL(10,3) := 0.055; -- 5.5 céntimos por SMS
  v_costo_total DECIMAL(10,3);
BEGIN
  -- Calcular número de SMS necesarios
  -- 160 caracteres = 1 SMS
  -- 306 caracteres = 2 SMS (se pierde espacio por concatenación)
  IF LENGTH(p_mensaje) <= 160 THEN
    v_num_sms := 1;
  ELSIF LENGTH(p_mensaje) <= 306 THEN
    v_num_sms := 2;
  ELSIF LENGTH(p_mensaje) <= 459 THEN
    v_num_sms := 3;
  ELSE
    v_num_sms := CEIL(LENGTH(p_mensaje)::DECIMAL / 153::DECIMAL);
  END IF;

  v_costo_total := v_num_sms * v_costo_por_sms * p_num_destinatarios;

  RETURN v_costo_total;
END;
$$;

COMMENT ON FUNCTION public.calcular_costo_estimado_sms IS 'Calcula el costo estimado de una campaña SMS';

-- ============================================
-- 7. Vista para dashboard de campañas SMS
-- ============================================
CREATE OR REPLACE VIEW public.vista_campanas_sms_dashboard AS
SELECT
  c.id,
  c.id_tienda,
  c.nombre,
  c.asunto,
  c.remitente_nombre,
  c.tipo,
  c.estado,
  c.fecha_programada,
  c.hora_programada,
  c.fecha_enviada,
  c.total_destinatarios,
  c.enviados,
  c.fallidos,
  c.costo_estimado,
  c.costo_real,
  c.estadisticas,
  c.creado_en,
  t.nombre as tienda_nombre
FROM public.campanas_sms c
INNER JOIN public.tiendas t ON c.id_tienda = t.id
ORDER BY c.creado_en DESC;

COMMENT ON VIEW public.vista_campanas_sms_dashboard IS 'Vista completa de campañas SMS para dashboard';

-- ============================================
-- 8. Índices adicionales para optimización
-- ============================================
CREATE INDEX IF NOT EXISTS idx_campanas_sms_remitente
  ON public.campanas_sms(remitente_nombre);

CREATE INDEX IF NOT EXISTS idx_campanas_sms_destinatarios_operador
  ON public.campanas_sms_destinatarios(operador);

CREATE INDEX IF NOT EXISTS idx_campanas_sms_destinatarios_fecha_entregado
  ON public.campanas_sms_destinatarios(fecha_entregado);

COMMIT;
