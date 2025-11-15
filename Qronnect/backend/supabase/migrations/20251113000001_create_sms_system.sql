-- ============================================
-- SISTEMA DE CAMPAÑAS SMS
-- ============================================
-- Date: 2025-11-13
-- Description: Sistema híbrido de SMS con soporte para modo global y por tenant

-- ============================================
-- 1. TABLA: campanas_sms
-- ============================================
CREATE TABLE IF NOT EXISTS public.campanas_sms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,

  -- Información básica
  nombre VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL CHECK (LENGTH(mensaje) <= 1600), -- Máximo 10 SMS concatenados

  -- Tipo y estado
  tipo VARCHAR(50) DEFAULT 'promocional' CHECK (tipo IN (
    'promocional', 'bienvenida', 'cumpleanos', 'reactivacion',
    'abandono', 'fidelizacion', 'informativa', 'transaccional'
  )),
  estado VARCHAR(50) DEFAULT 'borrador' CHECK (estado IN (
    'borrador', 'programada', 'enviando', 'enviada', 'cancelada'
  )),

  -- Segmentación
  filtros_segmentacion JSONB DEFAULT '{}',
  destinatarios_ids UUID[] DEFAULT ARRAY[]::UUID[],

  -- Programación
  fecha_programada TIMESTAMPTZ,
  fecha_enviada TIMESTAMPTZ,

  -- Estadísticas
  total_destinatarios INTEGER DEFAULT 0,
  enviados INTEGER DEFAULT 0,
  fallidos INTEGER DEFAULT 0,
  coste_total DECIMAL(10,3) DEFAULT 0,

  -- Configuración
  envio_unico BOOLEAN DEFAULT false,

  -- Auditoría
  creado_por UUID REFERENCES auth.users(id),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),

  -- Índices para búsquedas comunes
  CONSTRAINT campanas_sms_fecha_check CHECK (
    fecha_programada IS NULL OR fecha_programada > creado_en
  )
);

-- Índices
CREATE INDEX idx_campanas_sms_tienda ON public.campanas_sms(id_tienda);
CREATE INDEX idx_campanas_sms_estado ON public.campanas_sms(estado);
CREATE INDEX idx_campanas_sms_tipo ON public.campanas_sms(tipo);
CREATE INDEX idx_campanas_sms_fecha_programada ON public.campanas_sms(fecha_programada)
  WHERE estado = 'programada';

-- ============================================
-- 2. TABLA: campanas_sms_destinatarios
-- ============================================
CREATE TABLE IF NOT EXISTS public.campanas_sms_destinatarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana UUID NOT NULL REFERENCES public.campanas_sms(id) ON DELETE CASCADE,
  id_cliente UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,

  -- Estado del envío
  estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN (
    'pendiente', 'enviado', 'fallido', 'cancelado'
  )),

  -- Detalles del envío
  telefono_destinatario VARCHAR(20),
  fecha_enviado TIMESTAMPTZ,
  message_sid VARCHAR(100), -- ID de Twilio
  coste DECIMAL(10,3),

  -- Error si falló
  error_mensaje TEXT,

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Un cliente solo puede aparecer una vez por campaña
  CONSTRAINT unique_cliente_campana_sms UNIQUE (id_campana, id_cliente)
);

-- Índices
CREATE INDEX idx_campanas_sms_dest_campana ON public.campanas_sms_destinatarios(id_campana);
CREATE INDEX idx_campanas_sms_dest_cliente ON public.campanas_sms_destinatarios(id_cliente);
CREATE INDEX idx_campanas_sms_dest_estado ON public.campanas_sms_destinatarios(estado);

-- ============================================
-- 3. TABLA: envios_sms (historial global por cliente)
-- ============================================
CREATE TABLE IF NOT EXISTS public.envios_sms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_campana UUID REFERENCES public.campanas_sms(id) ON DELETE SET NULL,
  id_cliente UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,

  -- Detalles del envío
  fecha_envio TIMESTAMPTZ DEFAULT NOW(),
  estado VARCHAR(50) DEFAULT 'enviado' CHECK (estado IN ('enviado', 'error', 'cancelado')),
  telefono_destinatario VARCHAR(20) NOT NULL,
  mensaje TEXT NOT NULL,

  -- Costes
  coste DECIMAL(10,3),
  modo VARCHAR(20) CHECK (modo IN ('global', 'propio')),

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Índices para búsquedas
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_envios_sms_tienda ON public.envios_sms(id_tienda);
CREATE INDEX idx_envios_sms_cliente ON public.envios_sms(id_cliente);
CREATE INDEX idx_envios_sms_campana ON public.envios_sms(id_campana);
CREATE INDEX idx_envios_sms_fecha ON public.envios_sms(fecha_envio);

-- ============================================
-- 4. TABLA: sms_enviados (tracking de uso para límites y facturación)
-- ============================================
CREATE TABLE IF NOT EXISTS public.sms_enviados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,

  -- Uso
  cantidad INTEGER DEFAULT 1,
  coste DECIMAL(10,3) DEFAULT 0,
  modo VARCHAR(20) CHECK (modo IN ('global', 'propio')),

  -- Timestamp
  enviado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas de límites y estadísticas
CREATE INDEX idx_sms_enviados_tienda_fecha ON public.sms_enviados(id_tienda, enviado_en);
CREATE INDEX idx_sms_enviados_fecha ON public.sms_enviados(enviado_en);

-- ============================================
-- 5. FUNCIÓN: Filtrar clientes para campañas SMS (reutiliza la de email)
-- ============================================
-- La función filtrar_clientes_campana ya existe y funciona para SMS también

-- ============================================
-- 6. FUNCIÓN: Descontar crédito SMS (para modo global prepago)
-- ============================================
CREATE OR REPLACE FUNCTION public.descontar_credito_sms(p_tienda_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Decrementar créditos de forma atómica
  UPDATE public.tiendas
  SET configuracion = jsonb_set(
    configuracion,
    '{sms,creditos_disponibles}',
    to_jsonb(GREATEST(
      0,
      COALESCE((configuracion->'sms'->>'creditos_disponibles')::int, 0) - 1
    ))
  )
  WHERE id = p_tienda_id;
END;
$$;

-- ============================================
-- 7. FUNCIÓN: Obtener siguiente campaña programada
-- ============================================
CREATE OR REPLACE FUNCTION public.get_proximas_campanas_sms()
RETURNS TABLE (
  id UUID,
  id_tienda UUID,
  nombre VARCHAR,
  fecha_programada TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, id_tienda, nombre, fecha_programada
  FROM public.campanas_sms
  WHERE estado = 'programada'
    AND fecha_programada <= NOW() + INTERVAL '5 minutes'
  ORDER BY fecha_programada ASC
  LIMIT 10;
$$;

-- ============================================
-- 8. ACTUALIZAR CAMPO telefono en clientes (si no existe)
-- ============================================
-- Verificar si el campo telefono existe, si no, agregarlo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'clientes'
    AND column_name = 'telefono'
  ) THEN
    ALTER TABLE public.clientes
    ADD COLUMN telefono VARCHAR(20);

    CREATE INDEX idx_clientes_telefono ON public.clientes(telefono);
  END IF;
END $$;

-- ============================================
-- 9. RLS (Row Level Security) - Deshabilitar para usar service role
-- ============================================
ALTER TABLE public.campanas_sms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanas_sms_destinatarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.envios_sms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_enviados DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 10. COMENTARIOS
-- ============================================
COMMENT ON TABLE public.campanas_sms IS 'Campañas de SMS marketing con segmentación';
COMMENT ON TABLE public.campanas_sms_destinatarios IS 'Destinatarios específicos de cada campaña SMS';
COMMENT ON TABLE public.envios_sms IS 'Historial global de SMS enviados por cliente';
COMMENT ON TABLE public.sms_enviados IS 'Tracking de uso de SMS para límites y facturación';

COMMENT ON COLUMN public.campanas_sms.mensaje IS 'Mensaje SMS (máximo 1600 caracteres = 10 SMS)';
COMMENT ON COLUMN public.campanas_sms.envio_unico IS 'Si true, cada cliente solo recibe esta campaña una vez';
COMMENT ON COLUMN public.sms_enviados.modo IS 'global=cuenta Qronnect, propio=cuenta del tenant';

-- ============================================
-- 11. DATOS DE EJEMPLO (OPCIONAL - comentado)
-- ============================================
-- INSERT INTO public.campanas_sms (id_tienda, nombre, mensaje, tipo, estado)
-- VALUES (
--   (SELECT id FROM public.tiendas LIMIT 1),
--   'Campaña de prueba SMS',
--   'Hola {{nombre}}! Tenemos una oferta especial para ti.',
--   'promocional',
--   'borrador'
-- );

COMMIT;
