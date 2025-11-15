-- Migration: Create envios_campanas table to track campaign sends
-- Date: 2025-01-11
-- Description: Tabla para rastrear a qué clientes se les ha enviado cada campaña

-- Create envios_campanas table
CREATE TABLE IF NOT EXISTS public.envios_campanas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_campana UUID NOT NULL REFERENCES public.campanas(id) ON DELETE CASCADE,
  id_cliente UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estado VARCHAR(50) DEFAULT 'enviado' CHECK (estado IN ('enviado', 'entregado', 'abierto', 'clickeado', 'error')),
  email_destinatario VARCHAR(255),

  -- Metadata para tracking
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Índices compuestos para búsquedas eficientes
  UNIQUE (id_campana, id_cliente)
);

-- Create indexes
CREATE INDEX idx_envios_campanas_tienda ON public.envios_campanas(id_tienda);
CREATE INDEX idx_envios_campanas_cliente ON public.envios_campanas(id_cliente);
CREATE INDEX idx_envios_campanas_campana ON public.envios_campanas(id_campana);
CREATE INDEX idx_envios_campanas_fecha ON public.envios_campanas(fecha_envio DESC);
CREATE INDEX idx_envios_campanas_estado ON public.envios_campanas(estado);

-- Create updated_at trigger
CREATE TRIGGER update_envios_campanas_updated_at
  BEFORE UPDATE ON public.envios_campanas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.envios_campanas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tiendas can view their own envios"
  ON public.envios_campanas FOR SELECT
  USING (id_tienda = (current_setting('app.current_tienda_id', true))::uuid);

CREATE POLICY "Tiendas can insert their own envios"
  ON public.envios_campanas FOR INSERT
  WITH CHECK (id_tienda = (current_setting('app.current_tienda_id', true))::uuid);

CREATE POLICY "Tiendas can update their own envios"
  ON public.envios_campanas FOR UPDATE
  USING (id_tienda = (current_setting('app.current_tienda_id', true))::uuid);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.envios_campanas TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.envios_campanas TO service_role;

-- Comments
COMMENT ON TABLE public.envios_campanas IS 'Registro de envíos de campañas a clientes';
COMMENT ON COLUMN public.envios_campanas.estado IS 'Estado del envío: enviado, entregado, abierto, clickeado, error';
COMMENT ON COLUMN public.envios_campanas.metadata IS 'Información adicional sobre el envío (proveedor, ID externo, etc.)';
