-- Migration: Add tipo field to campanas_email table
-- Date: 2025-01-11
-- Description: Agregar campo tipo para identificar campañas especiales (bienvenida, cumpleaños, etc.)

-- Add tipo column
ALTER TABLE public.campanas_email
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'promocional'
CHECK (tipo IN ('promocional', 'bienvenida', 'cumpleanos', 'reactivacion', 'abandono', 'fidelizacion', 'informativa'));

-- Add envio_unico column (para campañas que solo se envían una vez por cliente)
ALTER TABLE public.campanas_email
ADD COLUMN IF NOT EXISTS envio_unico BOOLEAN DEFAULT false;

-- Create index on tipo
CREATE INDEX IF NOT EXISTS idx_campanas_tipo ON public.campanas_email(tipo);

-- Comments
COMMENT ON COLUMN public.campanas_email.tipo IS 'Tipo de campaña: promocional, bienvenida, cumpleanos, reactivacion, abandono, fidelizacion, informativa';
COMMENT ON COLUMN public.campanas_email.envio_unico IS 'Si es true, cada cliente solo puede recibir esta campaña una vez';
