-- ============================================
-- Solicitudes de contacto: pasarlas a un comercial
-- ============================================
-- Al asignar una solicitud se crea un prospecto en el CRM del comercial y se guarda aquí
-- a quién se pasó, para no duplicarla.

ALTER TABLE public.solicitudes_contacto
  ADD COLUMN IF NOT EXISTS comercial_id UUID REFERENCES public.comerciales(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS prospecto_id UUID REFERENCES public.prospectos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS asignada_en TIMESTAMPTZ;

COMMENT ON COLUMN public.solicitudes_contacto.comercial_id IS 'Comercial al que se pasó la solicitud';
COMMENT ON COLUMN public.solicitudes_contacto.prospecto_id IS 'Prospecto creado en el CRM del comercial';
