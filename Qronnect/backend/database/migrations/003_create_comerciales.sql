-- =====================================================
-- MIGRACIÓN: Sistema de Comerciales (Agentes de Ventas)
-- Fecha: 2024-05-23
-- Descripción:
-- 1. Crea tabla 'comerciales' para gestionar agentes de ventas
-- 2. Añade columna 'comercial_id' a 'tiendas' para tracking
-- =====================================================

-- 1. Crear tabla de comerciales
CREATE TABLE IF NOT EXISTS comerciales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- Contraseña hasheada (bcrypt)
  telefono TEXT,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultimo_acceso TIMESTAMP WITH TIME ZONE
);

-- Índices para comerciales
CREATE INDEX IF NOT EXISTS idx_comerciales_email ON comerciales(email);
CREATE INDEX IF NOT EXISTS idx_comerciales_activo ON comerciales(activo);

-- Trigger para actualizar timestamp
CREATE TRIGGER trigger_comerciales_actualizado
  BEFORE UPDATE ON comerciales
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

-- RLS Policies para comerciales
ALTER TABLE comerciales ENABLE ROW LEVEL SECURITY;

-- Política: Superadmins pueden ver/gestionar todo
CREATE POLICY "Superadmins can manage comerciales"
  ON comerciales
  USING (
    EXISTS (
      SELECT 1 FROM superadmin_users
      WHERE supabase_user_id = auth.uid() AND activo = true
    )
  );

-- Política: Comerciales pueden ver su propio perfil
CREATE POLICY "Comerciales can view self"
  ON comerciales
  FOR SELECT
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');


-- 2. Añadir referencia en tabla tiendas
-- Si ya existe la columna, no hace nada (idempotente)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tiendas' AND column_name='comercial_id') THEN
        ALTER TABLE tiendas ADD COLUMN comercial_id UUID REFERENCES comerciales(id) ON DELETE SET NULL;
        CREATE INDEX idx_tiendas_comercial_id ON tiendas(comercial_id);
    END IF;
END $$;

COMMENT ON TABLE comerciales IS 'Agentes de ventas internos que captan nuevas tiendas';
COMMENT ON COLUMN tiendas.comercial_id IS 'Referencia al agente comercial que dio de alta la tienda';
