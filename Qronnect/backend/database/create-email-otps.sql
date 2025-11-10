-- Crear tabla para códigos OTP de login de clientes
CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  codigo VARCHAR(6) NOT NULL,
  expira_en TIMESTAMPTZ NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON public.email_otps(email);
CREATE INDEX IF NOT EXISTS idx_email_otps_codigo ON public.email_otps(codigo);
CREATE INDEX IF NOT EXISTS idx_email_otps_expira_en ON public.email_otps(expira_en);

-- Política RLS (Row Level Security) - solo el admin puede acceder
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- Política para el servicio (service_role)
CREATE POLICY "Service role can do anything with email_otps"
  ON public.email_otps
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comentarios
COMMENT ON TABLE public.email_otps IS 'Códigos OTP temporales para login de clientes';
COMMENT ON COLUMN public.email_otps.email IS 'Email del cliente';
COMMENT ON COLUMN public.email_otps.codigo IS 'Código OTP de 6 dígitos';
COMMENT ON COLUMN public.email_otps.expira_en IS 'Timestamp de expiración del código';
COMMENT ON COLUMN public.email_otps.usado IS 'Indica si el código ya fue utilizado';
