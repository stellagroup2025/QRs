-- Primero eliminamos la tabla si existe (para empezar limpio)
DROP TABLE IF EXISTS public.email_otps CASCADE;

-- Crear la tabla email_otps en el schema public
CREATE TABLE public.email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  codigo TEXT NOT NULL,
  expira_en TIMESTAMPTZ NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_email_otps_email ON public.email_otps(email);
CREATE INDEX idx_email_otps_expira_en ON public.email_otps(expira_en);

-- Habilitar RLS
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- Política para service_role (acceso total)
CREATE POLICY "Service role can do anything with email_otps"
  ON public.email_otps
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Política para anon (solo insertar)
CREATE POLICY "Anonymous users can insert email_otps"
  ON public.email_otps
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Recargar el schema de PostgREST
NOTIFY pgrst, 'reload schema';

-- Verificación: mostrar info de la tabla
SELECT
  schemaname,
  tablename,
  tableowner,
  rowsecurity
FROM pg_tables
WHERE tablename = 'email_otps';

-- Verificación: mostrar políticas
SELECT
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'email_otps';
