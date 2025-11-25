-- ============================================
-- MIGRACIÓN: Sistema de Informes Mensuales con IA
-- Fecha: 2025-11-25
-- Descripción: Tablas para generación y envío automático de informes mensuales
-- ============================================

-- ============================================
-- TABLA: informes_mensuales
-- Almacena los informes generados para cada tienda
-- ============================================
CREATE TABLE IF NOT EXISTS informes_mensuales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,

  -- Periodo del informe
  periodo_mes INTEGER NOT NULL CHECK (periodo_mes >= 1 AND periodo_mes <= 12),
  periodo_anio INTEGER NOT NULL CHECK (periodo_anio >= 2024),

  -- Datos del informe
  datos_kpis JSONB NOT NULL, -- KPIs calculados del mes
  analisis_ia JSONB NOT NULL, -- Análisis generado por IA
  comparativa_anterior JSONB, -- Comparativa con mes anterior
  promociones_usadas JSONB, -- Resumen de promociones del mes
  campanas_usadas JSONB, -- Resumen de campañas del mes
  plan_siguiente_mes JSONB, -- Recomendaciones para próximo mes

  -- PDF generado
  pdf_url TEXT, -- URL del PDF almacenado (si se guarda en storage)
  pdf_generado BOOLEAN DEFAULT FALSE,

  -- Estado del informe
  estado TEXT NOT NULL DEFAULT 'generado', -- 'generado', 'enviado', 'error'
  fecha_generacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_envio TIMESTAMP WITH TIME ZONE,
  enviado_a TEXT, -- Email al que se envió

  -- Metadata
  error_mensaje TEXT, -- Si hubo error al generar/enviar
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint: Un informe por mes por tienda
  CONSTRAINT unique_informe_mes_tienda UNIQUE(id_tienda, periodo_mes, periodo_anio)
);

-- Índices para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_informes_id_tienda ON informes_mensuales(id_tienda);
CREATE INDEX IF NOT EXISTS idx_informes_periodo ON informes_mensuales(periodo_anio DESC, periodo_mes DESC);
CREATE INDEX IF NOT EXISTS idx_informes_fecha_generacion ON informes_mensuales(fecha_generacion DESC);
CREATE INDEX IF NOT EXISTS idx_informes_estado ON informes_mensuales(estado);

-- ============================================
-- TABLA: configuracion_informes
-- Configuración de envío automático de informes por tienda
-- ============================================
CREATE TABLE IF NOT EXISTS configuracion_informes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_tienda UUID NOT NULL UNIQUE REFERENCES tiendas(id) ON DELETE CASCADE,

  -- Configuración de envío automático
  automatico BOOLEAN DEFAULT FALSE, -- Si está activado el envío automático
  email_destino TEXT, -- Email principal para recibir informes
  emails_cc TEXT[], -- Emails adicionales en copia (array)

  -- Programación
  dia_envio INTEGER DEFAULT 1 CHECK (dia_envio >= 1 AND dia_envio <= 28), -- Día del mes (1-28 para evitar problemas con febrero)
  hora_envio INTEGER DEFAULT 9 CHECK (hora_envio >= 0 AND hora_envio <= 23), -- Hora del día (0-23)
  timezone TEXT DEFAULT 'Europe/Madrid', -- Zona horaria

  -- Opciones del informe
  incluir_pdf BOOLEAN DEFAULT TRUE,
  incluir_analisis_ia BOOLEAN DEFAULT TRUE,
  incluir_comparativa BOOLEAN DEFAULT TRUE,
  incluir_plan_accion BOOLEAN DEFAULT TRUE,

  -- Metadata
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_config_informes_id_tienda ON configuracion_informes(id_tienda);
CREATE INDEX IF NOT EXISTS idx_config_informes_automatico ON configuracion_informes(automatico) WHERE automatico = TRUE;

-- ============================================
-- TABLA: historial_envios_informes
-- Registro de todos los envíos de informes (manual y automático)
-- ============================================
CREATE TABLE IF NOT EXISTS historial_envios_informes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_informe UUID NOT NULL REFERENCES informes_mensuales(id) ON DELETE CASCADE,
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,

  -- Detalles del envío
  tipo_envio TEXT NOT NULL, -- 'manual', 'automatico'
  enviado_por UUID, -- ID del usuario que lo envió (si fue manual desde superadmin)
  email_destino TEXT NOT NULL,
  emails_cc TEXT[],

  -- Estado del envío
  estado TEXT NOT NULL, -- 'enviado', 'error', 'rebotado'
  mensaje_id TEXT, -- ID del mensaje de Resend
  error_mensaje TEXT,

  -- Metadata
  fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_historial_envios_id_informe ON historial_envios_informes(id_informe);
CREATE INDEX IF NOT EXISTS idx_historial_envios_id_tienda ON historial_envios_informes(id_tienda);
CREATE INDEX IF NOT EXISTS idx_historial_envios_fecha ON historial_envios_informes(fecha_envio DESC);
CREATE INDEX IF NOT EXISTS idx_historial_envios_tipo ON historial_envios_informes(tipo_envio);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para actualizar timestamp
CREATE TRIGGER trigger_informes_mensuales_actualizado
  BEFORE UPDATE ON informes_mensuales
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_configuracion_informes_actualizado
  BEFORE UPDATE ON configuracion_informes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

-- ============================================
-- VISTA: Resumen de informes por tienda
-- ============================================
CREATE OR REPLACE VIEW vista_informes_tienda AS
SELECT
  t.id as id_tienda,
  t.nombre as nombre_tienda,
  t.email as email_tienda,
  t.plan,
  COUNT(i.id) as total_informes_generados,
  COUNT(CASE WHEN i.estado = 'enviado' THEN 1 END) as total_informes_enviados,
  MAX(i.fecha_generacion) as ultimo_informe_generado,
  MAX(i.fecha_envio) as ultimo_informe_enviado,
  c.automatico as envio_automatico_activo,
  c.email_destino as email_configurado,
  c.dia_envio,
  c.hora_envio
FROM tiendas t
LEFT JOIN informes_mensuales i ON i.id_tienda = t.id
LEFT JOIN configuracion_informes c ON c.id_tienda = t.id
WHERE t.activo = TRUE
GROUP BY t.id, t.nombre, t.email, t.plan, c.automatico, c.email_destino, c.dia_envio, c.hora_envio;

-- ============================================
-- FUNCIÓN: Obtener configuración para envío automático de hoy
-- ============================================
CREATE OR REPLACE FUNCTION obtener_tiendas_para_envio_hoy()
RETURNS TABLE (
  id_tienda UUID,
  nombre_tienda TEXT,
  email_destino TEXT,
  emails_cc TEXT[],
  incluir_pdf BOOLEAN,
  incluir_analisis_ia BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id_tienda,
    t.nombre,
    c.email_destino,
    c.emails_cc,
    c.incluir_pdf,
    c.incluir_analisis_ia
  FROM configuracion_informes c
  INNER JOIN tiendas t ON t.id = c.id_tienda
  WHERE
    c.automatico = TRUE
    AND c.activo = TRUE
    AND t.activo = TRUE
    AND c.dia_envio = EXTRACT(DAY FROM NOW())
    AND c.email_destino IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON TABLE informes_mensuales IS 'Informes mensuales generados con IA para cada tienda';
COMMENT ON TABLE configuracion_informes IS 'Configuración de envío automático de informes por tienda';
COMMENT ON TABLE historial_envios_informes IS 'Historial completo de envíos de informes';
COMMENT ON FUNCTION obtener_tiendas_para_envio_hoy() IS 'Retorna tiendas que deben recibir informe hoy según configuración';

-- ============================================
-- DATOS DE EJEMPLO PARA DESARROLLO
-- ============================================
-- Configuración automática para la tienda de ejemplo
INSERT INTO configuracion_informes (id_tienda, automatico, email_destino, dia_envio, hora_envio, incluir_pdf)
VALUES
  ('00000000-0000-0000-0000-000000000001', TRUE, 'admin@cafeteriaaroma.com', 1, 9, TRUE),
  ('00000000-0000-0000-0000-000000000002', FALSE, 'admin@fitzonegym.com', 5, 10, TRUE)
ON CONFLICT (id_tienda) DO NOTHING;
