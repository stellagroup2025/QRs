-- ============================================
-- MIGRACIONES DE CAMPAÑAS - EJECUTAR EN SUPABASE DASHBOARD
-- ============================================
-- 1. Ve a: https://supabase.com/dashboard/project/ajyiuhujexwrjmjfycxh/sql/new
-- 2. Copia y pega todo este archivo
-- 3. Haz clic en "Run" para ejecutar todas las migraciones
-- ============================================

-- ============================================
-- MIGRACIÓN 1: Crear tabla envios_campanas
-- Fecha: 2025-01-11
-- Descripción: Tabla para registrar los envíos de campañas a clientes
-- ============================================

CREATE TABLE IF NOT EXISTS public.envios_campanas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_campana UUID NOT NULL REFERENCES public.campanas_email(id) ON DELETE CASCADE,
  id_cliente UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estado VARCHAR(50) DEFAULT 'enviado' CHECK (estado IN ('enviado', 'entregado', 'abierto', 'clickeado', 'error')),
  email_destinatario VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (id_campana, id_cliente)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_envios_campanas_cliente ON public.envios_campanas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_envios_campanas_campana ON public.envios_campanas(id_campana);
CREATE INDEX IF NOT EXISTS idx_envios_campanas_tienda ON public.envios_campanas(id_tienda);
CREATE INDEX IF NOT EXISTS idx_envios_campanas_fecha ON public.envios_campanas(fecha_envio DESC);
CREATE INDEX IF NOT EXISTS idx_envios_campanas_estado ON public.envios_campanas(estado);

-- Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_envios_campanas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_envios_campanas_updated_at ON public.envios_campanas;
CREATE TRIGGER trigger_update_envios_campanas_updated_at
  BEFORE UPDATE ON public.envios_campanas
  FOR EACH ROW
  EXECUTE FUNCTION update_envios_campanas_updated_at();

-- RLS
ALTER TABLE public.envios_campanas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios autenticados pueden ver envíos de su tienda" ON public.envios_campanas;
CREATE POLICY "Usuarios autenticados pueden ver envíos de su tienda"
  ON public.envios_campanas FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Service role tiene acceso total" ON public.envios_campanas;
CREATE POLICY "Service role tiene acceso total"
  ON public.envios_campanas FOR ALL
  USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE public.envios_campanas IS 'Registro de envíos de campañas de email a clientes';
COMMENT ON COLUMN public.envios_campanas.estado IS 'Estado del envío: enviado, entregado, abierto, clickeado, error';
COMMENT ON COLUMN public.envios_campanas.metadata IS 'Metadatos adicionales del envío (ej: errores, estadísticas, etc)';

-- ============================================
-- MIGRACIÓN 2: Agregar campo tipo a campanas_email
-- Fecha: 2025-01-11
-- Descripción: Agregar campo tipo para identificar campañas especiales
-- ============================================

ALTER TABLE public.campanas_email
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'promocional'
CHECK (tipo IN ('promocional', 'bienvenida', 'cumpleanos', 'reactivacion', 'abandono', 'fidelizacion', 'informativa'));

ALTER TABLE public.campanas_email
ADD COLUMN IF NOT EXISTS envio_unico BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_campanas_tipo ON public.campanas_email(tipo);

COMMENT ON COLUMN public.campanas_email.tipo IS 'Tipo de campaña: promocional, bienvenida, cumpleanos, reactivacion, abandono, fidelizacion, informativa';
COMMENT ON COLUMN public.campanas_email.envio_unico IS 'Si es true, cada cliente solo puede recibir esta campaña una vez';

-- ============================================
-- MIGRACIÓN 3: Crear función filtrar_clientes_campana
-- Fecha: 2025-01-11
-- Descripción: Función SQL para filtrar clientes considerando historial de campañas
-- ============================================

CREATE OR REPLACE FUNCTION filtrar_clientes_campana(
  p_tienda_id UUID,
  p_excluir_campana_id UUID DEFAULT NULL,
  p_excluir_ultimos_dias INTEGER DEFAULT NULL,
  p_solo_sin_campanas BOOLEAN DEFAULT FALSE,
  p_dias_desde_ultima_min INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id_cliente UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.id as id_cliente
  FROM clientes c
  WHERE c.id_tienda = p_tienda_id
    AND c.activo = true
    -- Excluir clientes que recibieron una campaña específica
    AND (
      p_excluir_campana_id IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM envios_campanas ec
        WHERE ec.id_cliente = c.id
          AND ec.id_campana = p_excluir_campana_id
      )
    )
    -- Excluir clientes que recibieron campañas en los últimos N días
    AND (
      p_excluir_ultimos_dias IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM envios_campanas ec
        WHERE ec.id_cliente = c.id
          AND ec.fecha_envio >= NOW() - (p_excluir_ultimos_dias || ' days')::INTERVAL
      )
    )
    -- Solo clientes sin campañas previas
    AND (
      p_solo_sin_campanas = FALSE
      OR NOT EXISTS (
        SELECT 1 FROM envios_campanas ec
        WHERE ec.id_cliente = c.id
      )
    )
    -- Días mínimos desde la última campaña
    AND (
      p_dias_desde_ultima_min IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM envios_campanas ec
        WHERE ec.id_cliente = c.id
          AND ec.fecha_envio >= NOW() - (p_dias_desde_ultima_min || ' days')::INTERVAL
      )
      OR NOT EXISTS (
        SELECT 1 FROM envios_campanas ec
        WHERE ec.id_cliente = c.id
      )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION filtrar_clientes_campana TO authenticated;
GRANT EXECUTE ON FUNCTION filtrar_clientes_campana TO service_role;

COMMENT ON FUNCTION filtrar_clientes_campana IS 'Filtra clientes basándose en su historial de campañas recibidas';

-- ============================================
-- FIN DE MIGRACIONES
-- ============================================
-- Si todo se ejecutó correctamente, deberías ver:
-- - Tabla: envios_campanas (con índices y políticas RLS)
-- - Columnas nuevas en campanas_email: tipo, envio_unico
-- - Función: filtrar_clientes_campana
-- ============================================
