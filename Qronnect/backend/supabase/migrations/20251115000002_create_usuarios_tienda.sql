-- =====================================================
-- Migración: Sistema de Usuarios de Tienda
-- Fecha: 2025-11-15
-- Descripción: Tabla para usuarios (admin/comercial) por tienda
--              con autenticación por PIN y 2FA opcional por SMS
-- =====================================================

-- Crear tabla de usuarios de tienda
CREATE TABLE IF NOT EXISTS usuarios_tienda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,

  -- Información básica
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,

  -- Autenticación
  pin_hash TEXT NOT NULL, -- Hash del PIN de 4-6 dígitos

  -- Rol y permisos
  rol TEXT NOT NULL CHECK (rol IN ('owner', 'comercial')),

  -- 2FA por SMS (opcional)
  sms_2fa_activo BOOLEAN DEFAULT FALSE,
  sms_2fa_telefono TEXT, -- Teléfono para 2FA (puede ser diferente al principal)

  -- Estado
  activo BOOLEAN DEFAULT TRUE,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,

  -- Metadatos
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT usuarios_tienda_email_unique UNIQUE (id_tienda, email),
  CONSTRAINT usuarios_tienda_telefono_check CHECK (
    telefono IS NULL OR
    LENGTH(telefono) >= 9
  ),
  CONSTRAINT usuarios_tienda_sms_2fa_check CHECK (
    (sms_2fa_activo = FALSE) OR
    (sms_2fa_activo = TRUE AND sms_2fa_telefono IS NOT NULL)
  )
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_usuarios_tienda_tienda ON usuarios_tienda(id_tienda);
CREATE INDEX idx_usuarios_tienda_email ON usuarios_tienda(id_tienda, email);
CREATE INDEX idx_usuarios_tienda_rol ON usuarios_tienda(id_tienda, rol);
CREATE INDEX idx_usuarios_tienda_activo ON usuarios_tienda(activo);

-- Tabla para códigos OTP de 2FA
CREATE TABLE IF NOT EXISTS usuarios_tienda_2fa_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID NOT NULL REFERENCES usuarios_tienda(id) ON DELETE CASCADE,

  codigo TEXT NOT NULL,
  telefono TEXT NOT NULL,

  usado BOOLEAN DEFAULT FALSE,
  expira_en TIMESTAMP WITH TIME ZONE NOT NULL,

  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT usuarios_tienda_2fa_codes_codigo_check CHECK (LENGTH(codigo) = 6)
);

-- Índice para búsqueda rápida de códigos
CREATE INDEX idx_usuarios_tienda_2fa_usuario ON usuarios_tienda_2fa_codes(id_usuario);
CREATE INDEX idx_usuarios_tienda_2fa_codigo ON usuarios_tienda_2fa_codes(codigo, usado, expira_en);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_usuarios_tienda_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER trigger_update_usuarios_tienda_updated_at
  BEFORE UPDATE ON usuarios_tienda
  FOR EACH ROW
  EXECUTE FUNCTION update_usuarios_tienda_updated_at();

-- Función para limpiar códigos 2FA expirados (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION limpiar_codigos_2fa_expirados()
RETURNS void AS $$
BEGIN
  DELETE FROM usuarios_tienda_2fa_codes
  WHERE expira_en < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (Row Level Security)
ALTER TABLE usuarios_tienda ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_tienda_2fa_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Los superadmins pueden ver todos los usuarios
CREATE POLICY usuarios_tienda_superadmin_all
  ON usuarios_tienda
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Los usuarios pueden ver sus propios datos
CREATE POLICY usuarios_tienda_self_select
  ON usuarios_tienda
  FOR SELECT
  TO authenticated
  USING (id = current_setting('app.current_user_id', true)::uuid);

-- Policy: Solo superadmin puede gestionar códigos 2FA
CREATE POLICY usuarios_tienda_2fa_codes_superadmin
  ON usuarios_tienda_2fa_codes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comentarios en las tablas
COMMENT ON TABLE usuarios_tienda IS 'Usuarios con acceso al panel de administración de cada tienda';
COMMENT ON COLUMN usuarios_tienda.rol IS 'owner: admin completo, comercial: trabajador con permisos limitados';
COMMENT ON COLUMN usuarios_tienda.pin_hash IS 'Hash bcrypt del PIN de 4-6 dígitos';
COMMENT ON COLUMN usuarios_tienda.sms_2fa_activo IS 'Si está activado, requiere código SMS en cada login';
COMMENT ON COLUMN usuarios_tienda.sms_2fa_telefono IS 'Número de teléfono para recibir códigos 2FA';

COMMENT ON TABLE usuarios_tienda_2fa_codes IS 'Códigos OTP temporales para autenticación en dos pasos';
COMMENT ON COLUMN usuarios_tienda_2fa_codes.expira_en IS 'Los códigos expiran después de 5 minutos';

-- =====================================================
-- Datos de ejemplo (opcional, para testing)
-- =====================================================

-- Crear un usuario owner de ejemplo para la tienda lokeyokiera
-- PIN: 1234 (hash bcrypt)
DO $$
DECLARE
  v_tienda_id UUID;
BEGIN
  -- Buscar ID de lokeyokiera
  SELECT id INTO v_tienda_id FROM tiendas WHERE dominio = 'lokeyokiera' LIMIT 1;

  IF v_tienda_id IS NOT NULL THEN
    INSERT INTO usuarios_tienda (
      id_tienda,
      nombre,
      email,
      telefono,
      pin_hash,
      rol,
      sms_2fa_activo,
      activo
    ) VALUES (
      v_tienda_id,
      'Admin Lokeyokiera',
      'admin@lokeyokiera.com',
      '+34612345678',
      '$2b$10$rKwGVHU3eCLQcZGqQxWOyO5fH5aQqT0qTQ0qTQ0qTQ0qTQ0qTQ0qT', -- PIN: 1234
      'owner',
      FALSE,
      TRUE
    ) ON CONFLICT (id_tienda, email) DO NOTHING;

    RAISE NOTICE 'Usuario owner creado para lokeyokiera (email: admin@lokeyokiera.com, PIN: 1234)';
  ELSE
    RAISE NOTICE 'Tienda lokeyokiera no encontrada, saltando creación de usuario de ejemplo';
  END IF;
END $$;
