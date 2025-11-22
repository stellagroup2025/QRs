-- Migración: Sistema de Onboarding para Nuevas Tiendas
-- Fecha: 2025-11-22
-- Descripción: Wizard de 5 pasos para reducir abandono del 50% al 10%

-- ============================================================
-- 1. TABLA: onboarding_progress
-- ============================================================
-- Tracking del progreso del wizard por tienda

CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,

  -- Estado general
  completado BOOLEAN DEFAULT FALSE,
  paso_actual INTEGER DEFAULT 1 CHECK (paso_actual BETWEEN 1 AND 5),
  porcentaje_completado INTEGER DEFAULT 0 CHECK (porcentaje_completado BETWEEN 0 AND 100),

  -- Pasos completados (bitflags para eficiencia)
  paso_1_branding BOOLEAN DEFAULT FALSE,
  paso_2_puntos BOOLEAN DEFAULT FALSE,
  paso_3_promo BOOLEAN DEFAULT FALSE,
  paso_4_regalo BOOLEAN DEFAULT FALSE,
  paso_5_qr BOOLEAN DEFAULT FALSE,

  -- Datos del wizard
  wizard_data JSONB DEFAULT '{}',

  -- Tracking temporal
  fecha_inicio TIMESTAMP DEFAULT NOW(),
  fecha_completado TIMESTAMP,
  tiempo_total_segundos INTEGER, -- Para analytics

  -- Skips (si el usuario omitió pasos)
  pasos_omitidos TEXT[], -- ['paso_2', 'paso_4']

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(id_tienda)
);

-- Índices para performance
CREATE INDEX idx_onboarding_progress_tienda ON onboarding_progress(id_tienda);
CREATE INDEX idx_onboarding_progress_completado ON onboarding_progress(completado);
CREATE INDEX idx_onboarding_progress_paso_actual ON onboarding_progress(paso_actual);

COMMENT ON TABLE onboarding_progress IS 'Progreso del wizard de onboarding por tienda';
COMMENT ON COLUMN onboarding_progress.wizard_data IS 'Datos temporales del wizard (branding elegido, config puntos, etc)';
COMMENT ON COLUMN onboarding_progress.tiempo_total_segundos IS 'Tiempo total que tardó en completar el wizard';

-- ============================================================
-- 2. TABLA: plantillas_promociones
-- ============================================================
-- Plantillas pre-hechas para el paso 3 del wizard

CREATE TABLE IF NOT EXISTS plantillas_promociones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Metadata
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(50) NOT NULL, -- 'bienvenida', 'cumpleanos', 'recuperacion', 'vip', 'flash'
  tipo_negocio VARCHAR(50), -- 'cafeteria', 'restaurante', 'spa', 'retail', null = todos

  -- Configuración de la promoción
  tipo_promocion VARCHAR(50) NOT NULL, -- 'descuento', 'regalo', 'puntos', '2x1'
  configuracion JSONB NOT NULL, -- Detalles específicos del tipo

  -- Copy sugerido
  copy_sugerido JSONB NOT NULL, -- {asunto, mensaje, cta}

  -- Canales recomendados
  canales TEXT[] DEFAULT ARRAY['email'], -- ['email', 'sms', 'push']

  -- Popularidad y éxito
  veces_usada INTEGER DEFAULT 0,
  rating_promedio DECIMAL(3,2) DEFAULT 0.00,
  es_recomendada BOOLEAN DEFAULT FALSE,

  -- Orden de visualización
  orden INTEGER DEFAULT 0,
  activa BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_plantillas_categoria ON plantillas_promociones(categoria);
CREATE INDEX idx_plantillas_tipo_negocio ON plantillas_promociones(tipo_negocio);
CREATE INDEX idx_plantillas_recomendada ON plantillas_promociones(es_recomendada);
CREATE INDEX idx_plantillas_activa ON plantillas_promociones(activa);

COMMENT ON TABLE plantillas_promociones IS 'Plantillas pre-configuradas de promociones para wizard y panel admin';
COMMENT ON COLUMN plantillas_promociones.configuracion IS 'JSON con config específica: {descuento_porcentaje: 20, valido_para: "nuevo_cliente"}';
COMMENT ON COLUMN plantillas_promociones.copy_sugerido IS 'JSON con textos: {asunto: "...", mensaje: "...", cta: "..."}';

-- ============================================================
-- 3. FUNCIÓN: iniciar_onboarding
-- ============================================================
-- Crea el registro de onboarding cuando se crea una tienda

CREATE OR REPLACE FUNCTION iniciar_onboarding()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO onboarding_progress (id_tienda, paso_actual, porcentaje_completado)
  VALUES (NEW.id, 1, 0)
  ON CONFLICT (id_tienda) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Crear onboarding al crear tienda
DROP TRIGGER IF EXISTS trigger_iniciar_onboarding ON tiendas;
CREATE TRIGGER trigger_iniciar_onboarding
  AFTER INSERT ON tiendas
  FOR EACH ROW
  EXECUTE FUNCTION iniciar_onboarding();

-- ============================================================
-- 4. FUNCIÓN: actualizar_progreso_onboarding
-- ============================================================
-- Actualiza el progreso cuando se completa un paso

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
  -- Marcar paso como completado
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
      SET paso_3_promo = TRUE,
          wizard_data = wizard_data || p_data,
          updated_at = NOW()
      WHERE id_tienda = p_id_tienda;
    WHEN 4 THEN
      UPDATE onboarding_progress
      SET paso_4_regalo = TRUE,
          wizard_data = wizard_data || p_data,
          updated_at = NOW()
      WHERE id_tienda = p_id_tienda;
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

COMMENT ON FUNCTION actualizar_progreso_onboarding IS 'Actualiza progreso del wizard al completar un paso';

-- ============================================================
-- 5. FUNCIÓN: omitir_paso_onboarding
-- ============================================================
-- Permite omitir pasos (track para analytics)

CREATE OR REPLACE FUNCTION omitir_paso_onboarding(
  p_id_tienda UUID,
  p_paso INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE onboarding_progress
  SET
    paso_actual = LEAST(p_paso + 1, 5),
    pasos_omitidos = array_append(pasos_omitidos, 'paso_' || p_paso),
    updated_at = NOW()
  WHERE id_tienda = p_id_tienda;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION omitir_paso_onboarding IS 'Marca un paso como omitido y avanza al siguiente';

-- ============================================================
-- 6. VISTA: onboarding_analytics
-- ============================================================
-- Vista para analytics del onboarding

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

  -- Por paso
  COUNT(*) FILTER (WHERE paso_1_branding = TRUE) as paso_1_completados,
  COUNT(*) FILTER (WHERE paso_2_puntos = TRUE) as paso_2_completados,
  COUNT(*) FILTER (WHERE paso_3_promo = TRUE) as paso_3_completados,
  COUNT(*) FILTER (WHERE paso_4_regalo = TRUE) as paso_4_completados,
  COUNT(*) FILTER (WHERE paso_5_qr = TRUE) as paso_5_completados,

  -- Tiempos
  ROUND(AVG(tiempo_total_segundos) FILTER (WHERE completado = TRUE)) as tiempo_promedio_segundos,
  MIN(tiempo_total_segundos) FILTER (WHERE completado = TRUE) as tiempo_minimo_segundos,
  MAX(tiempo_total_segundos) FILTER (WHERE completado = TRUE) as tiempo_maximo_segundos,

  -- Abandono
  COUNT(*) FILTER (WHERE paso_actual = 1 AND completado = FALSE) as abandono_paso_1,
  COUNT(*) FILTER (WHERE paso_actual = 2 AND completado = FALSE) as abandono_paso_2,
  COUNT(*) FILTER (WHERE paso_actual = 3 AND completado = FALSE) as abandono_paso_3,
  COUNT(*) FILTER (WHERE paso_actual = 4 AND completado = FALSE) as abandono_paso_4,
  COUNT(*) FILTER (WHERE paso_actual = 5 AND completado = FALSE) as abandono_paso_5
FROM onboarding_progress;

COMMENT ON VIEW onboarding_analytics IS 'Analytics agregados del onboarding para dashboard admin';

-- ============================================================
-- 7. SEED DATA: Plantillas de Promociones
-- ============================================================

INSERT INTO plantillas_promociones (nombre, descripcion, categoria, tipo_negocio, tipo_promocion, configuracion, copy_sugerido, canales, es_recomendada, orden) VALUES

-- BIENVENIDA
('Bienvenida - 20% Descuento', 'Atrae nuevos clientes con un descuento irresistible en su primera compra', 'bienvenida', NULL, 'descuento',
  '{"descuento_porcentaje": 20, "valido_para": "nuevo_cliente", "dias_validez": 30, "uso_unico": true}'::jsonb,
  '{"asunto": "¡Bienvenido! 20% de descuento en tu primera compra", "mensaje": "Hola {nombre}, como agradecimiento por unirte, disfruta de 20% de descuento usando el código: BIENVENIDO20", "cta": "Usar mi descuento"}'::jsonb,
  ARRAY['email', 'push'], TRUE, 1),

-- CUMPLEAÑOS
('Cumpleaños - Regalo Gratis', 'Felicita a tus clientes con un regalo automático en su cumpleaños', 'cumpleanos', NULL, 'regalo',
  '{"trigger": "cumpleaños", "dias_antes": 3, "regalo_tipo": "producto_gratis", "automatico": true}'::jsonb,
  '{"asunto": "🎂 ¡Feliz cumpleaños {nombre}!", "mensaje": "Celebra tu día con nosotros. Te regalamos un producto gratis. ¡Ven a recogerlo!", "cta": "Ver mi regalo"}'::jsonb,
  ARRAY['email', 'push', 'sms'], TRUE, 2),

-- RECUPERACIÓN
('Te Extrañamos - 15% OFF', 'Reactiva clientes inactivos hace más de 30 días', 'recuperacion', NULL, 'descuento',
  '{"trigger": "inactividad", "dias_inactivo": 30, "descuento_porcentaje": 15, "urgencia_dias": 7}'::jsonb,
  '{"asunto": "Te extrañamos {nombre} - 15% de descuento te espera", "mensaje": "Hace tiempo que no te vemos. Vuelve y disfruta de 15% de descuento. ¡Solo por 7 días!", "cta": "Volver ahora"}'::jsonb,
  ARRAY['email', 'sms'], TRUE, 3),

-- VIP
('Cliente VIP - Doble Puntos', 'Recompensa a tus clientes más fieles con puntos extra', 'vip', NULL, 'puntos',
  '{"trigger": "visitas", "visitas_minimas": 10, "puntos_multiplicador": 2, "duracion_dias": 30}'::jsonb,
  '{"asunto": "🌟 ¡Eres VIP! Doble puntos por 30 días", "mensaje": "Gracias por tu fidelidad {nombre}. Durante 30 días, ganas el doble de puntos en cada visita.", "cta": "Ver mis beneficios"}'::jsonb,
  ARRAY['email', 'push'], TRUE, 4),

-- FLASH
('Flash Sale - 24 Horas', 'Genera urgencia con una oferta de tiempo limitado', 'flash', NULL, 'descuento',
  '{"duracion_horas": 24, "descuento_porcentaje": 25, "stock_limitado": true, "contador_regresivo": true}'::jsonb,
  '{"asunto": "⏰ SOLO 24H - 25% de descuento", "mensaje": "¡Oferta relámpago! 25% de descuento en todo. Termina en 24 horas. ¡No te lo pierdas!", "cta": "Aprovechar ahora"}'::jsonb,
  ARRAY['email', 'sms', 'push'], TRUE, 5)

ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. POLÍTICAS RLS (Row Level Security)
-- ============================================================

ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_promociones ENABLE ROW LEVEL SECURITY;

-- Políticas para onboarding_progress
CREATE POLICY "Tiendas pueden ver su propio progreso"
  ON onboarding_progress FOR SELECT
  USING (id_tienda IN (
    SELECT id FROM tiendas WHERE id = id_tienda
  ));

CREATE POLICY "Tiendas pueden actualizar su propio progreso"
  ON onboarding_progress FOR UPDATE
  USING (id_tienda IN (
    SELECT id FROM tiendas WHERE id = id_tienda
  ));

-- Políticas para plantillas_promociones
CREATE POLICY "Plantillas son públicas (solo lectura)"
  ON plantillas_promociones FOR SELECT
  USING (activa = TRUE);

-- Solo superadmin puede crear/editar plantillas
CREATE POLICY "Solo superadmin puede modificar plantillas"
  ON plantillas_promociones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM superadmins
      WHERE id = auth.uid()
    )
  );
