-- ============================================
-- SCHEMA PARA PANEL SUPERADMIN
-- Sistema de administración global del sistema
-- ============================================

-- ============================================
-- TABLA: superadmin_users
-- Usuarios con acceso de superadministrador
-- ============================================
CREATE TABLE IF NOT EXISTS superadmin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_user_id UUID UNIQUE NOT NULL, -- Usuario de Supabase Auth
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL, -- Email para autenticación (códigos OTP gratis)
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_superadmin_supabase_user ON superadmin_users(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_superadmin_email ON superadmin_users(email);
CREATE INDEX IF NOT EXISTS idx_superadmin_activo ON superadmin_users(activo);

-- ============================================
-- DATOS INICIALES: Tu usuario superadmin
-- ============================================
-- NOTA: Primero debes crear el usuario en Supabase Auth con tu email
-- Luego ejecutar este INSERT con el supabase_user_id correcto
--
-- Ejemplo (REEMPLAZAR con tu UUID real después de crear usuario):
-- INSERT INTO superadmin_users (supabase_user_id, nombre, email, activo)
-- VALUES (
--   'TU-SUPABASE-USER-ID-AQUI',
--   'Omar',
--   'tu-email@ejemplo.com',
--   TRUE
-- );

-- ============================================
-- TABLA: audit_log_superadmin
-- Registro de acciones del superadmin (auditoría)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log_superadmin (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  superadmin_id UUID NOT NULL REFERENCES superadmin_users(id) ON DELETE CASCADE,
  accion TEXT NOT NULL, -- 'crear_tienda', 'editar_tienda', 'eliminar_tienda', 'ver_datos_tienda', etc.
  entidad TEXT NOT NULL, -- 'tienda', 'cliente', 'compra', etc.
  entidad_id UUID, -- ID de la entidad afectada
  detalles JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_audit_superadmin ON audit_log_superadmin(superadmin_id);
CREATE INDEX IF NOT EXISTS idx_audit_fecha ON audit_log_superadmin(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entidad ON audit_log_superadmin(entidad, entidad_id);

-- ============================================
-- VISTAS PARA SUPERADMIN
-- ============================================

-- Vista: Resumen de todas las tiendas
CREATE OR REPLACE VIEW vista_superadmin_tiendas AS
SELECT
  t.id,
  t.nombre,
  t.dominio,
  t.dominio_personalizado,
  t.plan,
  t.activo,
  t.creado_en,
  COUNT(DISTINCT c.id) AS total_clientes,
  COUNT(DISTINCT comp.id) AS total_compras,
  COALESCE(SUM(comp.importe), 0) AS total_facturado,
  MAX(comp.fecha) AS ultima_compra
FROM tiendas t
LEFT JOIN clientes c ON c.id_tienda = t.id
LEFT JOIN compras comp ON comp.id_tienda = t.id
GROUP BY t.id, t.nombre, t.dominio, t.dominio_personalizado, t.plan, t.activo, t.creado_en;

-- Vista: Dashboard general del sistema
CREATE OR REPLACE VIEW vista_superadmin_dashboard AS
SELECT
  (SELECT COUNT(*) FROM tiendas WHERE activo = TRUE) AS tiendas_activas,
  (SELECT COUNT(*) FROM tiendas) AS total_tiendas,
  (SELECT COUNT(*) FROM clientes) AS total_clientes,
  (SELECT COUNT(*) FROM compras) AS total_compras,
  (SELECT COALESCE(SUM(importe), 0) FROM compras) AS facturacion_total,
  (SELECT COUNT(*) FROM compras WHERE fecha >= NOW() - INTERVAL '30 days') AS compras_ultimo_mes,
  (SELECT COALESCE(SUM(importe), 0) FROM compras WHERE fecha >= NOW() - INTERVAL '30 days') AS facturacion_ultimo_mes;

-- ============================================
-- FUNCIONES PARA SUPERADMIN
-- ============================================

-- Función: Crear nueva tienda (con validación)
CREATE OR REPLACE FUNCTION superadmin_crear_tienda(
  p_nombre TEXT,
  p_dominio TEXT,
  p_plan TEXT DEFAULT 'basico',
  p_configuracion JSONB DEFAULT '{"puntos_por_euro": 1}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_tienda_id UUID;
BEGIN
  -- Validar que el dominio no exista
  IF EXISTS (SELECT 1 FROM tiendas WHERE dominio = p_dominio) THEN
    RAISE EXCEPTION 'El dominio % ya existe', p_dominio;
  END IF;

  -- Crear tienda
  INSERT INTO tiendas (nombre, dominio, plan, configuracion, activo)
  VALUES (p_nombre, p_dominio, p_plan, p_configuracion, TRUE)
  RETURNING id INTO v_tienda_id;

  RETURN v_tienda_id;
END;
$$ LANGUAGE plpgsql;

-- Función: Obtener datos completos de una tienda
CREATE OR REPLACE FUNCTION superadmin_get_tienda_completa(p_tienda_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'tienda', (SELECT row_to_json(t) FROM tiendas t WHERE t.id = p_tienda_id),
    'clientes', (SELECT COALESCE(json_agg(c), '[]'::json) FROM clientes c WHERE c.id_tienda = p_tienda_id),
    'compras_recientes', (
      SELECT COALESCE(json_agg(comp), '[]'::json)
      FROM (
        SELECT * FROM compras
        WHERE id_tienda = p_tienda_id
        ORDER BY fecha DESC
        LIMIT 50
      ) comp
    ),
    'estadisticas', (
      SELECT json_build_object(
        'total_clientes', COUNT(DISTINCT c.id),
        'total_compras', COUNT(DISTINCT comp.id),
        'facturacion_total', COALESCE(SUM(comp.importe), 0),
        'promedio_compra', COALESCE(AVG(comp.importe), 0)
      )
      FROM tiendas t
      LEFT JOIN clientes c ON c.id_tienda = t.id
      LEFT JOIN compras comp ON comp.id_tienda = t.id
      WHERE t.id = p_tienda_id
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en tabla superadmin_users
ALTER TABLE superadmin_users ENABLE ROW LEVEL SECURITY;

-- Política: Solo superadmins pueden ver otros superadmins
CREATE POLICY "Superadmins can view all superadmins"
  ON superadmin_users FOR SELECT
  USING (
    auth.uid() IN (SELECT supabase_user_id FROM superadmin_users WHERE activo = TRUE)
  );

-- Política: Solo superadmins pueden insertar
CREATE POLICY "Superadmins can insert superadmins"
  ON superadmin_users FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT supabase_user_id FROM superadmin_users WHERE activo = TRUE)
  );

-- Habilitar RLS en audit_log_superadmin
ALTER TABLE audit_log_superadmin ENABLE ROW LEVEL SECURITY;

-- Política: Solo superadmins pueden ver logs
CREATE POLICY "Superadmins can view audit logs"
  ON audit_log_superadmin FOR SELECT
  USING (
    auth.uid() IN (SELECT supabase_user_id FROM superadmin_users WHERE activo = TRUE)
  );

-- Política: Sistema puede insertar logs
CREATE POLICY "System can insert audit logs"
  ON audit_log_superadmin FOR INSERT
  WITH CHECK (TRUE);

-- ============================================
-- INSTRUCCIONES POST-INSTALACIÓN
-- ============================================

-- 1. AUTENTICACIÓN POR EMAIL (100% GRATIS)
--    - Supabase Email Auth está habilitado por defecto
--    - No requiere configuración externa
--    - Envía códigos OTP gratis por email

-- 2. CREAR TU USUARIO SUPERADMIN
--    a) Crea un usuario en Supabase Dashboard → Authentication → Users
--       - Clic en "Add user" → selecciona "Email"
--       - Ingresa tu email (ej: tu@email.com)
--       - Supabase enviará un email de confirmación
--
--    b) Confirma tu email haciendo clic en el link del correo
--
--    c) Obtén el UUID del usuario desde Supabase Dashboard → Authentication → Users
--
--    d) Ejecuta este SQL (REEMPLAZAR con tu UUID real y email):
--       INSERT INTO superadmin_users (supabase_user_id, nombre, email, activo)
--       VALUES (
--         'TU-SUPABASE-USER-ID-AQUI',
--         'Omar',
--         'tu@email.com',
--         TRUE
--       );

-- 3. VERIFICAR QUE FUNCIONA
--    SELECT * FROM superadmin_users;

COMMENT ON TABLE superadmin_users IS 'Usuarios con acceso total al sistema (superadministradores)';
COMMENT ON TABLE audit_log_superadmin IS 'Registro de auditoría de acciones del superadmin';
COMMENT ON VIEW vista_superadmin_tiendas IS 'Vista con resumen de todas las tiendas para el panel superadmin';
COMMENT ON VIEW vista_superadmin_dashboard IS 'Vista con métricas globales del sistema';
