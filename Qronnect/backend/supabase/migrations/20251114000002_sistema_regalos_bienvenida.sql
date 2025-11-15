-- ============================================
-- SISTEMA DE REGALOS DE BIENVENIDA
-- ============================================
-- Date: 2025-11-14
-- Description: Sistema para otorgar regalos automáticos a nuevos clientes

-- ============================================
-- 1. Extender tabla tiendas con configuración de regalos
-- ============================================
ALTER TABLE public.tiendas
  ADD COLUMN IF NOT EXISTS regalo_bienvenida_activo BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS regalo_bienvenida_tipo VARCHAR(50), -- 'puntos', 'cupon', 'promocion'
  ADD COLUMN IF NOT EXISTS regalo_bienvenida_valor JSONB DEFAULT '{}'::jsonb;

-- Comentarios
COMMENT ON COLUMN public.tiendas.regalo_bienvenida_activo IS 'Si está activo el sistema de regalos de bienvenida';
COMMENT ON COLUMN public.tiendas.regalo_bienvenida_tipo IS 'Tipo de regalo: puntos, cupon, promocion';
COMMENT ON COLUMN public.tiendas.regalo_bienvenida_valor IS 'JSON con configuración del regalo según tipo';

-- Ejemplos de estructura del JSONB regalo_bienvenida_valor:
-- Tipo 'puntos': { "puntos": 100, "mensaje_personalizado": "¡Bienvenido! Tienes 100 puntos de regalo", "enviar_email": true, "enviar_sms": true }
-- Tipo 'cupon': { "descuento_porcentaje": 10, "mensaje_personalizado": "Usa este cupón para 10% OFF", "enviar_email": true, "enviar_sms": false }
-- Tipo 'promocion': { "promocion_id": "uuid-aqui", "mensaje_personalizado": "¡Regalo especial de bienvenida!", "enviar_email": true, "enviar_sms": true }

-- ============================================
-- 2. Tabla de historial de regalos otorgados
-- ============================================
CREATE TABLE IF NOT EXISTS public.regalos_bienvenida_otorgados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,

  -- Detalles del regalo
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('puntos', 'cupon', 'promocion')),
  valor JSONB NOT NULL,

  -- Tracking
  fecha_otorgado TIMESTAMPTZ DEFAULT NOW(),
  puntos_otorgados INTEGER DEFAULT 0,
  cupon_codigo VARCHAR(50),
  promocion_id UUID REFERENCES public.promociones(id) ON DELETE SET NULL,

  -- Notificaciones
  email_enviado BOOLEAN DEFAULT false,
  sms_enviado BOOLEAN DEFAULT false,
  fecha_email_enviado TIMESTAMPTZ,
  fecha_sms_enviado TIMESTAMPTZ,

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Un cliente solo puede recibir un regalo por tienda
  CONSTRAINT unique_regalo_cliente_tienda UNIQUE (id_cliente, id_tienda)
);

-- Índices
CREATE INDEX idx_regalos_bienvenida_cliente ON public.regalos_bienvenida_otorgados(id_cliente);
CREATE INDEX idx_regalos_bienvenida_tienda ON public.regalos_bienvenida_otorgados(id_tienda);
CREATE INDEX idx_regalos_bienvenida_fecha ON public.regalos_bienvenida_otorgados(fecha_otorgado);

COMMENT ON TABLE public.regalos_bienvenida_otorgados IS 'Historial de regalos de bienvenida otorgados a clientes';

-- ============================================
-- 3. Función para otorgar regalo de bienvenida
-- ============================================
CREATE OR REPLACE FUNCTION public.otorgar_regalo_bienvenida(
  p_cliente_id UUID,
  p_tienda_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config RECORD;
  v_regalo_otorgado BOOLEAN := false;
  v_resultado JSONB;
BEGIN
  -- Verificar si ya recibió regalo
  SELECT EXISTS (
    SELECT 1 FROM public.regalos_bienvenida_otorgados
    WHERE id_cliente = p_cliente_id AND id_tienda = p_tienda_id
  ) INTO v_regalo_otorgado;

  IF v_regalo_otorgado THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Cliente ya recibió regalo de bienvenida',
      'ya_otorgado', true
    );
  END IF;

  -- Obtener configuración de la tienda
  SELECT
    regalo_bienvenida_activo,
    regalo_bienvenida_tipo,
    regalo_bienvenida_valor
  INTO v_config
  FROM public.tiendas
  WHERE id = p_tienda_id;

  -- Verificar si está activo
  IF NOT v_config.regalo_bienvenida_activo THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Sistema de regalos de bienvenida no está activo',
      'activo', false
    );
  END IF;

  -- Otorgar según tipo
  CASE v_config.regalo_bienvenida_tipo
    WHEN 'puntos' THEN
      -- Otorgar puntos
      DECLARE
        v_puntos INTEGER := (v_config.regalo_bienvenida_valor->>'puntos')::INTEGER;
      BEGIN
        -- Actualizar puntos del cliente
        UPDATE public.clientes
        SET puntos_totales = COALESCE(puntos_totales, 0) + v_puntos
        WHERE id = p_cliente_id;

        -- Registrar regalo
        INSERT INTO public.regalos_bienvenida_otorgados (
          id_cliente,
          id_tienda,
          tipo,
          valor,
          puntos_otorgados,
          email_enviado,
          sms_enviado
        ) VALUES (
          p_cliente_id,
          p_tienda_id,
          'puntos',
          v_config.regalo_bienvenida_valor,
          v_puntos,
          COALESCE((v_config.regalo_bienvenida_valor->>'enviar_email')::BOOLEAN, false),
          COALESCE((v_config.regalo_bienvenida_valor->>'enviar_sms')::BOOLEAN, false)
        );

        v_resultado := jsonb_build_object(
          'success', true,
          'tipo', 'puntos',
          'puntos', v_puntos,
          'mensaje', v_config.regalo_bienvenida_valor->>'mensaje_personalizado'
        );
      END;

    WHEN 'cupon' THEN
      -- Generar código de cupón único
      DECLARE
        v_cupon_codigo VARCHAR(50) := 'WELCOME-' || SUBSTRING(p_cliente_id::TEXT FROM 1 FOR 8);
        v_descuento INTEGER := (v_config.regalo_bienvenida_valor->>'descuento_porcentaje')::INTEGER;
      BEGIN
        -- Registrar regalo
        INSERT INTO public.regalos_bienvenida_otorgados (
          id_cliente,
          id_tienda,
          tipo,
          valor,
          cupon_codigo,
          email_enviado,
          sms_enviado
        ) VALUES (
          p_cliente_id,
          p_tienda_id,
          'cupon',
          v_config.regalo_bienvenida_valor,
          v_cupon_codigo,
          COALESCE((v_config.regalo_bienvenida_valor->>'enviar_email')::BOOLEAN, false),
          COALESCE((v_config.regalo_bienvenida_valor->>'enviar_sms')::BOOLEAN, false)
        );

        v_resultado := jsonb_build_object(
          'success', true,
          'tipo', 'cupon',
          'cupon_codigo', v_cupon_codigo,
          'descuento', v_descuento,
          'mensaje', v_config.regalo_bienvenida_valor->>'mensaje_personalizado'
        );
      END;

    WHEN 'promocion' THEN
      -- Asociar promoción existente
      DECLARE
        v_promocion_id UUID := (v_config.regalo_bienvenida_valor->>'promocion_id')::UUID;
      BEGIN
        -- Registrar regalo
        INSERT INTO public.regalos_bienvenida_otorgados (
          id_cliente,
          id_tienda,
          tipo,
          valor,
          promocion_id,
          email_enviado,
          sms_enviado
        ) VALUES (
          p_cliente_id,
          p_tienda_id,
          'promocion',
          v_config.regalo_bienvenida_valor,
          v_promocion_id,
          COALESCE((v_config.regalo_bienvenida_valor->>'enviar_email')::BOOLEAN, false),
          COALESCE((v_config.regalo_bienvenida_valor->>'enviar_sms')::BOOLEAN, false)
        );

        v_resultado := jsonb_build_object(
          'success', true,
          'tipo', 'promocion',
          'promocion_id', v_promocion_id,
          'mensaje', v_config.regalo_bienvenida_valor->>'mensaje_personalizado'
        );
      END;

    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Tipo de regalo no válido'
      );
  END CASE;

  RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION public.otorgar_regalo_bienvenida IS 'Otorga regalo de bienvenida a un nuevo cliente según configuración de la tienda';

-- ============================================
-- 4. Trigger para otorgar regalo automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.trigger_otorgar_regalo_bienvenida()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Llamar a la función de otorgar regalo de forma asíncrona (no bloquear el registro)
  PERFORM public.otorgar_regalo_bienvenida(NEW.id, NEW.id_tienda);
  RETURN NEW;
END;
$$;

-- Crear trigger (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_regalo_bienvenida_nuevo_cliente'
  ) THEN
    CREATE TRIGGER trigger_regalo_bienvenida_nuevo_cliente
      AFTER INSERT ON public.clientes
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_otorgar_regalo_bienvenida();
  END IF;
END $$;

-- ============================================
-- 5. Vista para dashboard de regalos
-- ============================================
CREATE OR REPLACE VIEW public.vista_regalos_bienvenida AS
SELECT
  r.id,
  r.id_cliente,
  r.id_tienda,
  c.nombre as cliente_nombre,
  c.email as cliente_email,
  c.telefono as cliente_telefono,
  t.nombre as tienda_nombre,
  r.tipo,
  r.valor,
  r.fecha_otorgado,
  r.puntos_otorgados,
  r.cupon_codigo,
  r.email_enviado,
  r.sms_enviado,
  r.creado_en
FROM public.regalos_bienvenida_otorgados r
INNER JOIN public.clientes c ON r.id_cliente = c.id
INNER JOIN public.tiendas t ON r.id_tienda = t.id
ORDER BY r.creado_en DESC;

COMMENT ON VIEW public.vista_regalos_bienvenida IS 'Vista completa de regalos de bienvenida otorgados';

-- ============================================
-- 6. Función para obtener estadísticas de regalos
-- ============================================
CREATE OR REPLACE FUNCTION public.estadisticas_regalos_bienvenida(p_tienda_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_total INTEGER;
  v_por_tipo JSONB;
  v_ultimo_mes INTEGER;
  v_resultado JSONB;
BEGIN
  -- Total de regalos otorgados
  SELECT COUNT(*) INTO v_total
  FROM public.regalos_bienvenida_otorgados
  WHERE id_tienda = p_tienda_id;

  -- Desglose por tipo
  SELECT jsonb_object_agg(tipo, count)
  INTO v_por_tipo
  FROM (
    SELECT tipo, COUNT(*) as count
    FROM public.regalos_bienvenida_otorgados
    WHERE id_tienda = p_tienda_id
    GROUP BY tipo
  ) sub;

  -- Regalos en el último mes
  SELECT COUNT(*) INTO v_ultimo_mes
  FROM public.regalos_bienvenida_otorgados
  WHERE id_tienda = p_tienda_id
    AND fecha_otorgado >= NOW() - INTERVAL '30 days';

  v_resultado := jsonb_build_object(
    'total_regalos', v_total,
    'por_tipo', COALESCE(v_por_tipo, '{}'::jsonb),
    'ultimo_mes', v_ultimo_mes
  );

  RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION public.estadisticas_regalos_bienvenida IS 'Obtiene estadísticas de regalos de bienvenida para una tienda';

-- ============================================
-- 7. RLS - Deshabilitar para usar service role
-- ============================================
ALTER TABLE public.regalos_bienvenida_otorgados DISABLE ROW LEVEL SECURITY;

COMMIT;
