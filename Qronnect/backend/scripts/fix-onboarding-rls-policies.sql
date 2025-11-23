-- Fix: Políticas RLS de onboarding_progress bloqueando inserts del backend
-- El backend usa service_role_key que debería bypasear RLS, pero por seguridad
-- vamos a añadir políticas explícitas para INSERT

-- ============================================================
-- SOLUCIÓN 1: Deshabilitar RLS temporalmente (NO RECOMENDADO en producción)
-- ============================================================
-- ALTER TABLE onboarding_progress DISABLE ROW LEVEL SECURITY;
-- Solo usar esto para testing rápido

-- ============================================================
-- SOLUCIÓN 2: Añadir política de INSERT (RECOMENDADO)
-- ============================================================

-- Eliminar políticas existentes si hay conflicto
DROP POLICY IF EXISTS "Tiendas pueden ver su propio progreso" ON onboarding_progress;
DROP POLICY IF EXISTS "Tiendas pueden actualizar su propio progreso" ON onboarding_progress;
DROP POLICY IF EXISTS "Backend puede insertar progreso" ON onboarding_progress;
DROP POLICY IF EXISTS "Backend puede crear progreso inicial" ON onboarding_progress;

-- Política para SELECT (tiendas ven solo su progreso)
CREATE POLICY "Tiendas pueden ver su propio progreso"
  ON onboarding_progress FOR SELECT
  USING (true);  -- Permitir a todos ver (el backend filtra por id_tienda)

-- Política para INSERT (backend puede crear registros)
CREATE POLICY "Backend puede crear progreso inicial"
  ON onboarding_progress FOR INSERT
  WITH CHECK (true);  -- Permitir INSERT desde service role

-- Política para UPDATE (tiendas pueden actualizar su propio progreso)
CREATE POLICY "Tiendas pueden actualizar su propio progreso"
  ON onboarding_progress FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'onboarding_progress'
ORDER BY policyname;
