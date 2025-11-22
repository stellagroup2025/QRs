-- =====================================================
-- Fix: RLS Policies para landing_config
-- Fecha: 2025-11-22
-- Problema: Backend no puede leer/actualizar sin autenticación
-- Solución: Agregar policies permisivas para service role
-- =====================================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "public_select_landing_config" ON landing_config;
DROP POLICY IF EXISTS "admin_update_landing_config" ON landing_config;

-- Policy: Lectura pública (para GET /api/config/landing)
CREATE POLICY "public_select_landing_config"
  ON landing_config FOR SELECT
  USING (true);

-- Policy: Backend puede actualizar (para PUT /api/config/landing con JWT)
CREATE POLICY "backend_update_landing_config"
  ON landing_config FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Backend puede insertar configuraciones iniciales
CREATE POLICY "backend_insert_landing_config"
  ON landing_config FOR INSERT
  WITH CHECK (true);

-- Comentario
COMMENT ON POLICY "public_select_landing_config" ON landing_config IS
  'Permite lectura pública de configuración de landing (endpoint GET /api/config/landing)';

COMMENT ON POLICY "backend_update_landing_config" ON landing_config IS
  'Permite al backend actualizar configuración (endpoint PUT /api/config/landing con AdminAuthGuard)';

COMMENT ON POLICY "backend_insert_landing_config" ON landing_config IS
  'Permite al backend crear configuraciones iniciales para nuevas tiendas';
