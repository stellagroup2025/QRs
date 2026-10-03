-- ============================================
-- Solicitudes de contacto de la web (formulario "Quiero Qronnect en mi negocio")
-- ============================================
-- Llegan desde la portada y las landings de sector. Solo el backend (service role) las
-- lee y escribe; el superadmin las ve en /superadmin/solicitudes.

CREATE TABLE IF NOT EXISTS public.solicitudes_contacto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_negocio TEXT NOT NULL,
  nombre_contacto TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  sector TEXT,
  plan_interes TEXT,
  mensaje TEXT,
  origen TEXT,
  estado TEXT NOT NULL DEFAULT 'nueva'
    CHECK (estado IN ('nueva', 'contactada', 'convertida', 'descartada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_contacto_created ON public.solicitudes_contacto (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_solicitudes_contacto_estado ON public.solicitudes_contacto (estado);

-- Sin políticas: nadie accede con la clave pública; el backend usa la service role
ALTER TABLE public.solicitudes_contacto ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.solicitudes_contacto IS 'Negocios interesados que rellenan el formulario de contacto de la web';
