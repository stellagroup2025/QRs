-- Migración: Actualizar Onboarding de 5 a 4 pasos
-- Fecha: 2025-12-02
-- Descripción: Eliminar paso de promoción (paso 3), renumerar pasos restantes

-- ============================================================
-- 1. AGREGAR NUEVAS COLUMNAS Y MIGRAR DATOS
-- ============================================================

-- Agregar nuevas columnas con los nombres correctos
ALTER TABLE onboarding_progress
ADD COLUMN IF NOT EXISTS paso_3_regalo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS paso_4_qr BOOLEAN DEFAULT FALSE;

-- Migrar datos existentes
UPDATE onboarding_progress
SET
  paso_3_regalo = paso_4_regalo,
  paso_4_qr = paso_5_qr;

-- Actualizar constraint del paso_actual
ALTER TABLE onboarding_progress
DROP CONSTRAINT IF EXISTS onboarding_progress_paso_actual_check;

ALTER TABLE onboarding_progress
ADD CONSTRAINT onboarding_progress_paso_actual_check
CHECK (paso_actual BETWEEN 1 AND 4);

-- Actualizar paso_actual para tiendas que estaban en paso 4 o 5
UPDATE onboarding_progress
SET paso_actual = CASE
  WHEN paso_actual >= 4 THEN paso_actual - 1
  WHEN paso_actual = 3 THEN 3  -- Los que estaban en promoción pasan a regalo
  ELSE paso_actual
END
WHERE paso_actual >= 3;

-- Recalcular porcentaje completado (ahora son 4 pasos)
UPDATE onboarding_progress
SET porcentaje_completado = (
  (CASE WHEN paso_1_branding THEN 1 ELSE 0 END +
   CASE WHEN paso_2_puntos THEN 1 ELSE 0 END +
   CASE WHEN paso_3_regalo THEN 1 ELSE 0 END +
   CASE WHEN paso_4_qr THEN 1 ELSE 0 END) * 100 / 4
);

-- Actualizar completado
UPDATE onboarding_progress
SET completado = (
  paso_1_branding = TRUE AND
  paso_2_puntos = TRUE AND
  paso_3_regalo = TRUE AND
  paso_4_qr = TRUE
);

-- ============================================================
-- 2. ACTUALIZAR FUNCIÓN: actualizar_progreso_onboarding
-- ============================================================

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
BEGIN
  -- Marcar paso como completado (ahora 4 pasos)
  CASE p_paso
    WHEN 1 THEN
      UPDATE onboarding_progress
      SET paso_1_branding = TRUE,
          wizard_data = wizard_data || p_data,
          updated_at = NOW()
      WHERE id_tienda = p_id_tienda;
    WHEN 2 THEN
      UPDATE onboarding_progress
      SET paso_2_puntos = TRUE,
          wizard_data = wizard_data || p_data,
          updated_at = NOW()
      WHERE id_tienda = p_id_tienda;
    WHEN 3 THEN
      UPDATE onboarding_progress
      SET paso_3_regalo = TRUE,
          wizard_data = wizard_data || p_data,
          updated_at = NOW()
      WHERE id_tienda = p_id_tienda;
    WHEN 4 THEN
      UPDATE onboarding_progress
      SET paso_4_qr = TRUE,
          wizard_data = wizard_data || p_data,
          updated_at = NOW()
      WHERE id_tienda = p_id_tienda;
  END CASE;

  -- Contar pasos completados (4 pasos)
  SELECT
    (CASE WHEN paso_1_branding THEN 1 ELSE 0 END +
     CASE WHEN paso_2_puntos THEN 1 ELSE 0 END +
     CASE WHEN paso_3_regalo THEN 1 ELSE 0 END +
     CASE WHEN paso_4_qr THEN 1 ELSE 0 END)
  INTO v_pasos_completados
  FROM onboarding_progress
  WHERE id_tienda = p_id_tienda;

  -- Calcular porcentaje (4 pasos)
  v_porcentaje := (v_pasos_completados * 100 / 4);
  v_completado := (v_pasos_completados = 4);

  -- Actualizar progreso general
  UPDATE onboarding_progress
  SET
    paso_actual = LEAST(p_paso + 1, 4),
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

-- ============================================================
-- 3. ACTUALIZAR FUNCIÓN: omitir_paso_onboarding
-- ============================================================

CREATE OR REPLACE FUNCTION omitir_paso_onboarding(
  p_id_tienda UUID,
  p_paso INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE onboarding_progress
  SET
    paso_actual = LEAST(p_paso + 1, 4),
    pasos_omitidos = array_append(pasos_omitidos, 'paso_' || p_paso),
    updated_at = NOW()
  WHERE id_tienda = p_id_tienda;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 4. ACTUALIZAR VISTA: onboarding_analytics
-- ============================================================

CREATE OR REPLACE VIEW onboarding_analytics AS
SELECT
  -- Totales
  COUNT(*) as total_onboardings,
  COUNT(*) FILTER (WHERE completado = TRUE) as completados,
  COUNT(*) FILTER (WHERE completado = FALSE) as incompletos,

  -- Porcentajes
  ROUND(
    COUNT(*) FILTER (WHERE completado = TRUE)::DECIMAL / NULLIF(COUNT(*), 0) * 100, 2
  ) as tasa_completacion,

  -- Por paso (4 pasos)
  COUNT(*) FILTER (WHERE paso_1_branding = TRUE) as paso_1_completados,
  COUNT(*) FILTER (WHERE paso_2_puntos = TRUE) as paso_2_completados,
  COUNT(*) FILTER (WHERE paso_3_regalo = TRUE) as paso_3_completados,
  COUNT(*) FILTER (WHERE paso_4_qr = TRUE) as paso_4_completados,

  -- Tiempos
  ROUND(AVG(tiempo_total_segundos) FILTER (WHERE completado = TRUE)) as tiempo_promedio_segundos,
  MIN(tiempo_total_segundos) FILTER (WHERE completado = TRUE) as tiempo_minimo_segundos,
  MAX(tiempo_total_segundos) FILTER (WHERE completado = TRUE) as tiempo_maximo_segundos,

  -- Abandono (4 pasos)
  COUNT(*) FILTER (WHERE paso_actual = 1 AND completado = FALSE) as abandono_paso_1,
  COUNT(*) FILTER (WHERE paso_actual = 2 AND completado = FALSE) as abandono_paso_2,
  COUNT(*) FILTER (WHERE paso_actual = 3 AND completado = FALSE) as abandono_paso_3,
  COUNT(*) FILTER (WHERE paso_actual = 4 AND completado = FALSE) as abandono_paso_4
FROM onboarding_progress;

-- ============================================================
-- 5. LIMPIEZA: Eliminar columnas obsoletas
-- ============================================================
-- NOTA: Dejamos las columnas viejas por ahora para no perder datos históricos
-- Si se quieren eliminar en el futuro, descomentar las siguientes líneas:

-- ALTER TABLE onboarding_progress DROP COLUMN IF EXISTS paso_3_promo;
-- ALTER TABLE onboarding_progress DROP COLUMN IF EXISTS paso_4_regalo;
-- ALTER TABLE onboarding_progress DROP COLUMN IF EXISTS paso_5_qr;

-- ============================================================
-- 6. COMENTARIOS ACTUALIZADOS
-- ============================================================

COMMENT ON TABLE onboarding_progress IS 'Progreso del wizard de onboarding por tienda (4 pasos: branding, puntos, regalo, qr)';
COMMENT ON FUNCTION actualizar_progreso_onboarding IS 'Actualiza progreso del wizard al completar un paso (4 pasos)';
COMMENT ON FUNCTION omitir_paso_onboarding IS 'Marca un paso como omitido y avanza al siguiente (máximo paso 4)';
COMMENT ON VIEW onboarding_analytics IS 'Analytics agregados del onboarding de 4 pasos';
