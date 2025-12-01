-- ============================================
-- FIX: Onboarding actualiza regalo de bienvenida en tiendas
-- ============================================
-- Date: 2025-12-01
-- Description: Modifica la función actualizar_progreso_onboarding para que
--              cuando se complete el paso 4, actualice la configuración de
--              regalo de bienvenida en la tabla tiendas.
--              También añade campo regalo_bienvenida_puntos para simplificar lecturas.

-- ============================================
-- 1. Añadir campo regalo_bienvenida_puntos para simplificar lectura
-- ============================================
ALTER TABLE public.tiendas
  ADD COLUMN IF NOT EXISTS regalo_bienvenida_puntos INTEGER DEFAULT 0;

COMMENT ON COLUMN public.tiendas.regalo_bienvenida_puntos IS 'Cantidad de puntos de bienvenida (para tipo puntos)';

-- ============================================
-- 2. Actualizar función actualizar_progreso_onboarding
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_progreso_onboarding(
  p_id_tienda UUID,
  p_paso INTEGER,
  p_data JSONB DEFAULT '{}'
)
RETURNS TABLE(
  paso_actual INTEGER,
  porcentaje_completado INTEGER,
  completado BOOLEAN
) AS $$
DECLARE
  v_pasos_completados INTEGER;
  v_porcentaje INTEGER;
  v_completado BOOLEAN;
  v_tipo_regalo TEXT;
  v_cantidad_puntos INTEGER;
  v_descuento_porcentaje INTEGER;
BEGIN
  -- Marcar paso como completado y guardar datos
  CASE p_paso
    WHEN 1 THEN
      -- Paso 1: Branding
      UPDATE onboarding_progress
      SET paso_1_branding = TRUE,
          wizard_data = wizard_data || p_data,
          updated_at = NOW()
      WHERE id_tienda = p_id_tienda;

      -- Actualizar branding en tabla tiendas
      UPDATE public.tiendas
      SET
        nombre_comercial = COALESCE((p_data->>'nombre_comercial'), nombre_comercial),
        color_primario = COALESCE((p_data->>'color_primario'), color_primario),
        color_secundario = COALESCE((p_data->>'color_secundario'), color_secundario),
        color_acento = COALESCE((p_data->>'color_acento'), color_acento),
        logo_url = COALESCE((p_data->>'logo_url'), logo_url)
      WHERE id = p_id_tienda;

    WHEN 2 THEN
      -- Paso 2: Sistema de puntos
      UPDATE onboarding_progress
      SET paso_2_puntos = TRUE,
          wizard_data = wizard_data || p_data,
          updated_at = NOW()
      WHERE id_tienda = p_id_tienda;

      -- Actualizar sistema de puntos en tabla tiendas
      UPDATE public.tiendas
      SET
        puntos_por_euro = COALESCE((p_data->>'puntos_por_euro')::INTEGER, puntos_por_euro),
        euros_por_punto = COALESCE((p_data->>'euros_por_punto')::DECIMAL, euros_por_punto)
      WHERE id = p_id_tienda;

    WHEN 3 THEN
      UPDATE onboarding_progress
      SET paso_3_promo = TRUE,
          wizard_data = wizard_data || p_data,
          updated_at = NOW()
      WHERE id_tienda = p_id_tienda;

    WHEN 4 THEN
      -- Paso 4: Regalo de bienvenida
      UPDATE onboarding_progress
      SET paso_4_regalo = TRUE,
          wizard_data = wizard_data || p_data,
          updated_at = NOW()
      WHERE id_tienda = p_id_tienda;

      -- Obtener valores del regalo
      v_tipo_regalo := p_data->>'tipo_regalo';
      v_cantidad_puntos := COALESCE((p_data->>'cantidad_puntos')::INTEGER, 0);
      v_descuento_porcentaje := COALESCE((p_data->>'descuento_porcentaje')::INTEGER, 0);

      -- Actualizar configuración de regalo de bienvenida en tabla tiendas
      IF v_tipo_regalo = 'ninguno' THEN
        -- Desactivar regalo de bienvenida
        UPDATE public.tiendas
        SET
          regalo_bienvenida_activo = FALSE,
          regalo_bienvenida_tipo = NULL,
          regalo_bienvenida_puntos = 0,
          regalo_bienvenida_valor = '{}'::jsonb
        WHERE id = p_id_tienda;
      ELSIF v_tipo_regalo = 'puntos' THEN
        -- Configurar regalo de puntos
        UPDATE public.tiendas
        SET
          regalo_bienvenida_activo = TRUE,
          regalo_bienvenida_tipo = 'puntos',
          regalo_bienvenida_puntos = v_cantidad_puntos,
          regalo_bienvenida_valor = jsonb_build_object('puntos', v_cantidad_puntos)
        WHERE id = p_id_tienda;
      ELSIF v_tipo_regalo = 'descuento' THEN
        -- Configurar regalo de descuento (cupón)
        UPDATE public.tiendas
        SET
          regalo_bienvenida_activo = TRUE,
          regalo_bienvenida_tipo = 'cupon',
          regalo_bienvenida_puntos = 0,
          regalo_bienvenida_valor = jsonb_build_object('descuento_porcentaje', v_descuento_porcentaje)
        WHERE id = p_id_tienda;
      ELSIF v_tipo_regalo = 'regalo' THEN
        -- Configurar regalo concreto
        UPDATE public.tiendas
        SET
          regalo_bienvenida_activo = TRUE,
          regalo_bienvenida_tipo = 'regalo_concreto',
          regalo_bienvenida_puntos = 0,
          regalo_bienvenida_id_regalo = COALESCE((p_data->>'id_regalo')::UUID, regalo_bienvenida_id_regalo)
        WHERE id = p_id_tienda;
      END IF;

    WHEN 5 THEN
      UPDATE onboarding_progress
      SET paso_5_qr = TRUE,
          wizard_data = wizard_data || p_data,
          updated_at = NOW()
      WHERE id_tienda = p_id_tienda;
  END CASE;

  -- Contar pasos completados
  SELECT
    (CASE WHEN paso_1_branding THEN 1 ELSE 0 END +
     CASE WHEN paso_2_puntos THEN 1 ELSE 0 END +
     CASE WHEN paso_3_promo THEN 1 ELSE 0 END +
     CASE WHEN paso_4_regalo THEN 1 ELSE 0 END +
     CASE WHEN paso_5_qr THEN 1 ELSE 0 END)
  INTO v_pasos_completados
  FROM onboarding_progress
  WHERE id_tienda = p_id_tienda;

  -- Calcular porcentaje
  v_porcentaje := (v_pasos_completados * 100 / 5);
  v_completado := (v_pasos_completados = 5);

  -- Actualizar progreso general
  UPDATE onboarding_progress
  SET
    paso_actual = LEAST(p_paso + 1, 5),
    porcentaje_completado = v_porcentaje,
    completado = v_completado,
    fecha_completado = CASE
      WHEN v_completado AND fecha_completado IS NULL THEN NOW()
      ELSE fecha_completado
    END,
    tiempo_total_segundos = CASE
      WHEN v_completado AND tiempo_total_segundos IS NULL
      THEN EXTRACT(EPOCH FROM (NOW() - fecha_inicio))::INTEGER
      ELSE tiempo_total_segundos
    END,
    updated_at = NOW()
  WHERE id_tienda = p_id_tienda;

  -- Retornar estado actualizado
  RETURN QUERY
  SELECT
    op.paso_actual,
    op.porcentaje_completado,
    op.completado
  FROM onboarding_progress op
  WHERE op.id_tienda = p_id_tienda;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION actualizar_progreso_onboarding IS 'Actualiza progreso del wizard y aplica configuraciones a la tienda';
