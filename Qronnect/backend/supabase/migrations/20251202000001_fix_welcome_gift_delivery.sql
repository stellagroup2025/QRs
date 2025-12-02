-- ============================================
-- FIX: Corregir entrega de regalo de bienvenida
-- ============================================
-- Date: 2025-12-02
-- Description: El regalo de bienvenida debe otorgarse SOLO cuando el cliente
--              valida su email, NO cuando se registra. El trigger actual interfiere
--              con este flujo y además lee del campo incorrecto.
--
-- Problemas corregidos:
-- 1. El trigger se dispara al INSERT de clientes (antes de validar email)
-- 2. La función leía de regalo_bienvenida_valor->>'puntos' pero el onboarding
--    guarda en regalo_bienvenida_puntos directamente

-- ============================================
-- 1. Eliminar el trigger que se dispara al registrar cliente
-- ============================================
-- El regalo de bienvenida se otorga desde el código de Node.js cuando
-- el cliente valida su email (en validateEmailLink), NO al registrarse.
DROP TRIGGER IF EXISTS trigger_regalo_bienvenida_nuevo_cliente ON public.clientes;

-- También eliminamos la función del trigger ya que no se usará
DROP FUNCTION IF EXISTS public.trigger_otorgar_regalo_bienvenida();

-- ============================================
-- 2. Actualizar función otorgar_regalo_bienvenida para leer campos correctos
-- ============================================
-- Modificamos la función para que lea de regalo_bienvenida_puntos (campo directo)
-- en lugar de regalo_bienvenida_valor->>'puntos' (JSON que puede no estar poblado)
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

  -- Obtener configuración de la tienda (incluye campo regalo_bienvenida_puntos)
  SELECT
    regalo_bienvenida_activo,
    regalo_bienvenida_tipo,
    regalo_bienvenida_puntos,
    regalo_bienvenida_valor,
    regalo_bienvenida_id_regalo
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
      -- Otorgar puntos - Usar regalo_bienvenida_puntos (campo directo)
      -- con fallback a regalo_bienvenida_valor->>'puntos'
      DECLARE
        v_puntos INTEGER := COALESCE(
          v_config.regalo_bienvenida_puntos,
          (v_config.regalo_bienvenida_valor->>'puntos')::INTEGER,
          0
        );
      BEGIN
        IF v_puntos <= 0 THEN
          RETURN jsonb_build_object(
            'success', false,
            'message', 'No hay puntos configurados para el regalo de bienvenida'
          );
        END IF;

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
          jsonb_build_object('puntos', v_puntos),
          v_puntos,
          false,
          false
        );

        v_resultado := jsonb_build_object(
          'success', true,
          'tipo', 'puntos',
          'puntos', v_puntos,
          'mensaje', COALESCE(v_config.regalo_bienvenida_valor->>'mensaje_personalizado', 'Puntos de bienvenida otorgados')
        );
      END;

    WHEN 'cupon' THEN
      -- Generar código de cupón único
      DECLARE
        v_cupon_codigo VARCHAR(50) := 'WELCOME-' || SUBSTRING(p_cliente_id::TEXT FROM 1 FOR 8);
        v_descuento INTEGER := COALESCE(
          (v_config.regalo_bienvenida_valor->>'descuento_porcentaje')::INTEGER,
          v_config.regalo_bienvenida_puntos, -- Fallback: a veces se guarda el % aquí
          10
        );
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
          jsonb_build_object('descuento_porcentaje', v_descuento),
          v_cupon_codigo,
          false,
          false
        );

        v_resultado := jsonb_build_object(
          'success', true,
          'tipo', 'cupon',
          'cupon_codigo', v_cupon_codigo,
          'descuento', v_descuento,
          'mensaje', COALESCE(v_config.regalo_bienvenida_valor->>'mensaje_personalizado', 'Cupón de bienvenida')
        );
      END;

    WHEN 'regalo_concreto' THEN
      -- Otorgar regalo concreto usando la función existente
      DECLARE
        v_cupon_id UUID;
      BEGIN
        IF v_config.regalo_bienvenida_id_regalo IS NULL THEN
          RETURN jsonb_build_object(
            'success', false,
            'message', 'No hay regalo concreto configurado'
          );
        END IF;

        -- Usar función existente para otorgar regalo concreto
        v_cupon_id := public.otorgar_regalo_concreto(
          p_cliente_id,
          v_config.regalo_bienvenida_id_regalo,
          'bienvenida',
          jsonb_build_object('email_validado', true)
        );

        -- Registrar en tabla de regalos de bienvenida también
        INSERT INTO public.regalos_bienvenida_otorgados (
          id_cliente,
          id_tienda,
          tipo,
          valor,
          email_enviado,
          sms_enviado
        ) VALUES (
          p_cliente_id,
          p_tienda_id,
          'regalo_concreto',
          jsonb_build_object('id_regalo', v_config.regalo_bienvenida_id_regalo, 'cupon_id', v_cupon_id),
          false,
          false
        ) ON CONFLICT (id_cliente, id_tienda) DO NOTHING;

        v_resultado := jsonb_build_object(
          'success', true,
          'tipo', 'regalo_concreto',
          'cupon_id', v_cupon_id,
          'id_regalo', v_config.regalo_bienvenida_id_regalo
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
          false,
          false
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
        'message', 'Tipo de regalo no válido: ' || COALESCE(v_config.regalo_bienvenida_tipo, 'NULL')
      );
  END CASE;

  RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION public.otorgar_regalo_bienvenida IS 'Otorga regalo de bienvenida a un cliente. Debe llamarse DESPUÉS de validar el email.';

-- ============================================
-- 3. Agregar índice para verificación rápida de regalo ya otorgado
-- ============================================
CREATE INDEX IF NOT EXISTS idx_regalos_bienvenida_cliente_tienda
ON public.regalos_bienvenida_otorgados(id_cliente, id_tienda);

COMMIT;
