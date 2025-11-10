-- =====================================================
-- Tabla: admin_users
-- Descripción: Usuarios administradores de las tiendas
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  supabase_user_id UUID, -- Opcional, para futuro uso con Supabase Auth
  email TEXT NOT NULL,
  pin_hash TEXT NOT NULL, -- PIN hasheado (bcrypt)
  nombre TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Un email solo puede ser admin de una tienda
  UNIQUE(email, id_tienda)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_admin_users_tienda ON admin_users(id_tienda);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_activo ON admin_users(activo);

-- RLS Policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Política: Los superadmins pueden ver todos los admin_users
CREATE POLICY "superadmin_select_admin_users" ON admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM superadmin_users
      WHERE supabase_user_id = auth.uid() AND activo = true
    )
  );

-- Política: Los superadmins pueden insertar admin_users
CREATE POLICY "superadmin_insert_admin_users" ON admin_users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM superadmin_users
      WHERE supabase_user_id = auth.uid() AND activo = true
    )
  );

-- Política: Los superadmins pueden actualizar admin_users
CREATE POLICY "superadmin_update_admin_users" ON admin_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM superadmin_users
      WHERE supabase_user_id = auth.uid() AND activo = true
    )
  );

-- Política: Los admin_users pueden ver su propio registro
CREATE POLICY "admin_select_self" ON admin_users
  FOR SELECT
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

COMMENT ON TABLE admin_users IS 'Usuarios administradores de las tiendas (store owners)';
COMMENT ON COLUMN admin_users.pin_hash IS 'PIN de 4 dígitos hasheado con bcrypt';
COMMENT ON COLUMN admin_users.supabase_user_id IS 'ID del usuario en Supabase Auth (opcional, para migración futura)';
