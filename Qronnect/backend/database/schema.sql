-- ============================================
-- SCHEMA DE BASE DE DATOS PARA QRONNECT
-- Sistema de Fidelización con Supabase
-- ============================================

-- Habilitar extensión UUID si no está activada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: tiendas
-- Representa los comercios que usan el sistema
-- MULTITENANCY: Cada tienda se identifica por su dominio único
-- ============================================
CREATE TABLE IF NOT EXISTS tiendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  dominio TEXT UNIQUE NOT NULL, -- ej: "cafeteria-ejemplo" (se usará como: cafeteria-ejemplo.qronnect.com)
  dominio_personalizado TEXT UNIQUE, -- ej: "micafeteria.com" (dominio propio del cliente)
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  logo_url TEXT,
  color_primario TEXT DEFAULT '#000000',
  color_secundario TEXT DEFAULT '#666666',
  color_acento TEXT DEFAULT '#0066cc',
  nombre_comercial TEXT,
  database_name TEXT, -- Nombre de la BD dedicada (NULL = BD compartida, Fase 2)
  plan TEXT DEFAULT 'basico', -- 'basico', 'profesional', 'enterprise'
  activo BOOLEAN DEFAULT TRUE,
  configuracion JSONB DEFAULT '{"puntos_por_euro": 1}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb, -- Datos adicionales del tenant
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida por dominio
CREATE INDEX IF NOT EXISTS idx_tiendas_dominio ON tiendas(dominio);
CREATE INDEX IF NOT EXISTS idx_tiendas_dominio_personalizado ON tiendas(dominio_personalizado);
CREATE INDEX IF NOT EXISTS idx_tiendas_activo ON tiendas(activo);

-- ============================================
-- TABLA: clientes
-- Clientes finales del sistema de fidelización
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_user_id UUID, -- Referencia al user de Supabase Auth
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  telefono TEXT,
  email TEXT,
  nombre TEXT,
  puntos_totales INTEGER DEFAULT 0,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultima_visita TIMESTAMP WITH TIME ZONE,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- IMPORTANTE: Un usuario puede ser cliente de múltiples tiendas
  -- Por eso quitamos UNIQUE de supabase_user_id
  -- La unicidad se garantiza con este constraint compuesto:
  CONSTRAINT unique_cliente_por_tienda UNIQUE(supabase_user_id, id_tienda)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_clientes_supabase_user_id ON clientes(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_id_tienda ON clientes(id_tienda);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_tienda_usuario ON clientes(id_tienda, supabase_user_id);

-- ============================================
-- TABLA: qr_clientes
-- Códigos QR únicos para cada cliente
-- ============================================
CREATE TABLE IF NOT EXISTS qr_clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_cliente UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  codigo TEXT UNIQUE NOT NULL, -- String único que representa el QR
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsqueda rápida por código
CREATE INDEX IF NOT EXISTS idx_qr_clientes_codigo ON qr_clientes(codigo);
CREATE INDEX IF NOT EXISTS idx_qr_clientes_id_cliente ON qr_clientes(id_cliente);

-- ============================================
-- TABLA: compras
-- Registro de todas las compras realizadas
-- ============================================
CREATE TABLE IF NOT EXISTS compras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_cliente UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  importe NUMERIC(10, 2) NOT NULL CHECK (importe >= 0),
  puntos_otorgados INTEGER NOT NULL DEFAULT 0,
  notas TEXT, -- Notas adicionales sobre la compra
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para reportes y consultas
CREATE INDEX IF NOT EXISTS idx_compras_id_cliente ON compras(id_cliente);
CREATE INDEX IF NOT EXISTS idx_compras_id_tienda ON compras(id_tienda);
CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(fecha DESC);

-- ============================================
-- TABLA: promociones
-- Promociones y campañas de las tiendas
-- ============================================
CREATE TABLE IF NOT EXISTS promociones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo TEXT NOT NULL, -- 'DESCUENTO_PORCENTAJE', 'PUNTOS_EXTRA', 'CANJE_PUNTOS'
  valor NUMERIC(10, 2) NOT NULL, -- Porcentaje o cantidad según el tipo
  activo BOOLEAN DEFAULT TRUE,
  configuracion JSONB DEFAULT '{}', -- Configuraciones adicionales
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT chk_fecha_promocion CHECK (fecha_fin > fecha_inicio)
);

-- Índice para búsqueda de promociones activas
CREATE INDEX IF NOT EXISTS idx_promociones_id_tienda ON promociones(id_tienda);
CREATE INDEX IF NOT EXISTS idx_promociones_fechas ON promociones(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_promociones_activo ON promociones(activo);

-- ============================================
-- TABLA: canjes
-- Registro de canjes de puntos por premios
-- ============================================
CREATE TABLE IF NOT EXISTS canjes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_cliente UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  puntos_canjeados INTEGER NOT NULL CHECK (puntos_canjeados > 0),
  descripcion TEXT NOT NULL, -- Descripción del premio o beneficio canjeado
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para canjes
CREATE INDEX IF NOT EXISTS idx_canjes_id_cliente ON canjes(id_cliente);
CREATE INDEX IF NOT EXISTS idx_canjes_fecha ON canjes(fecha DESC);

-- ============================================
-- TABLA: roles_tienda
-- Gestión de usuarios con acceso al panel de admin
-- ============================================
CREATE TABLE IF NOT EXISTS roles_tienda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_user_id UUID NOT NULL, -- Usuario de Supabase Auth
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  rol TEXT NOT NULL DEFAULT 'staff', -- 'admin', 'staff', 'comercial'
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(supabase_user_id, id_tienda)
);

-- Índices para roles
CREATE INDEX IF NOT EXISTS idx_roles_tienda_supabase_user_id ON roles_tienda(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_roles_tienda_id_tienda ON roles_tienda(id_tienda);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar el campo actualizado_en automáticamente
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar_timestamp
CREATE TRIGGER trigger_tiendas_actualizado
  BEFORE UPDATE ON tiendas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_clientes_actualizado
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_qr_clientes_actualizado
  BEFORE UPDATE ON qr_clientes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_promociones_actualizado
  BEFORE UPDATE ON promociones
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_roles_tienda_actualizado
  BEFORE UPDATE ON roles_tienda
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

-- ============================================
-- POLÍTICAS DE SEGURIDAD RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en las tablas principales
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE canjes ENABLE ROW LEVEL SECURITY;

-- Política: Los clientes solo pueden ver sus propios datos
CREATE POLICY "Los clientes pueden ver sus propios datos"
  ON clientes
  FOR SELECT
  USING (supabase_user_id = auth.uid());

-- Política: Los clientes pueden actualizar sus propios datos (menos puntos)
CREATE POLICY "Los clientes pueden actualizar sus datos"
  ON clientes
  FOR UPDATE
  USING (supabase_user_id = auth.uid());

-- Política: Los clientes pueden ver sus propios QRs
CREATE POLICY "Los clientes pueden ver sus QRs"
  ON qr_clientes
  FOR SELECT
  USING (id_cliente IN (SELECT id FROM clientes WHERE supabase_user_id = auth.uid()));

-- Política: Los clientes pueden ver sus propias compras
CREATE POLICY "Los clientes pueden ver sus compras"
  ON compras
  FOR SELECT
  USING (id_cliente IN (SELECT id FROM clientes WHERE supabase_user_id = auth.uid()));

-- Política: Los clientes pueden ver sus propios canjes
CREATE POLICY "Los clientes pueden ver sus canjes"
  ON canjes
  FOR SELECT
  USING (id_cliente IN (SELECT id FROM clientes WHERE supabase_user_id = auth.uid()));

-- NOTA: Las políticas para el panel de admin se manejarán con el SERVICE_ROLE_KEY
-- desde el backend de NestJS, que bypasea RLS

-- ============================================
-- DATOS DE PRUEBA (OPCIONAL - Comentar en producción)
-- ============================================

-- Insertar tiendas de ejemplo para desarrollo
-- Cada tienda tiene un dominio único que la identifica

INSERT INTO tiendas (id, nombre, dominio, dominio_personalizado, direccion, telefono, email, plan, configuracion)
VALUES
  -- Tienda 1: Cafetería de ejemplo (dominio qronnect)
  (
    '00000000-0000-0000-0000-000000000001',
    'Cafetería El Aroma',
    'cafeteria-aroma',  -- Acceso: cafeteria-aroma.qronnect.com
    NULL,
    'Calle Mayor 123, Madrid',
    '+34 600 111 111',
    'info@cafeteriaaroma.com',
    'profesional',
    '{"puntos_por_euro": 1, "factor_descuento": 0.05}'::jsonb
  ),

  -- Tienda 2: Gimnasio (dominio personalizado)
  (
    '00000000-0000-0000-0000-000000000002',
    'FitZone Gym',
    'fitzone',  -- Acceso: fitzone.qronnect.com
    'www.fitzonegym.com',  -- También accesible desde dominio propio
    'Avenida del Deporte 45, Barcelona',
    '+34 600 222 222',
    'contacto@fitzonegym.com',
    'enterprise',
    '{"puntos_por_euro": 2, "bonificacion_mensual": 50}'::jsonb
  ),

  -- Tienda 3: Librería (plan básico)
  (
    '00000000-0000-0000-0000-000000000003',
    'Librería Letras',
    'libreria-letras',
    NULL,
    'Plaza del Libro 8, Valencia',
    '+34 600 333 333',
    'hola@libreria-letras.es',
    'basico',
    '{"puntos_por_euro": 0.5}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VISTAS ÚTILES PARA REPORTES
-- ============================================

-- Vista: Resumen de clientes con estadísticas
CREATE OR REPLACE VIEW vista_clientes_resumen AS
SELECT
  c.id,
  c.nombre,
  c.email,
  c.telefono,
  c.puntos_totales,
  c.fecha_registro,
  c.ultima_visita,
  c.id_tienda,
  t.nombre as nombre_tienda,
  COUNT(DISTINCT co.id) as total_compras,
  COALESCE(SUM(co.importe), 0) as total_gastado,
  COALESCE(AVG(co.importe), 0) as ticket_medio
FROM clientes c
LEFT JOIN compras co ON co.id_cliente = c.id
LEFT JOIN tiendas t ON t.id = c.id_tienda
WHERE c.activo = true
GROUP BY c.id, t.nombre;

-- Vista: Dashboard de tienda
CREATE OR REPLACE VIEW vista_dashboard_tienda AS
SELECT
  t.id as id_tienda,
  t.nombre as nombre_tienda,
  COUNT(DISTINCT c.id) as total_clientes,
  COUNT(DISTINCT CASE
    WHEN c.ultima_visita >= NOW() - INTERVAL '30 days'
    THEN c.id
  END) as clientes_activos_30d,
  COUNT(DISTINCT co.id) as total_compras,
  COALESCE(SUM(co.importe), 0) as ventas_totales,
  COALESCE(AVG(co.importe), 0) as ticket_medio,
  COALESCE(SUM(co.puntos_otorgados), 0) as puntos_otorgados_totales
FROM tiendas t
LEFT JOIN clientes c ON c.id_tienda = t.id AND c.activo = true
LEFT JOIN compras co ON co.id_tienda = t.id
GROUP BY t.id, t.nombre;

-- ============================================
-- COMENTARIOS FINALES
-- ============================================

-- Para ejecutar este script en Supabase:
-- 1. Ve al SQL Editor en tu proyecto de Supabase
-- 2. Copia y pega todo este contenido
-- 3. Ejecuta el script
-- 4. Verifica que todas las tablas se crearon correctamente en la sección "Table Editor"

-- IMPORTANTE:
-- - El RLS está activado para seguridad de datos de clientes
-- - El backend usará el SERVICE_ROLE_KEY para operaciones de admin
-- - Los clientes usan su JWT de Supabase Auth para acceder solo a sus datos
-- - La tienda de prueba tiene ID fijo para facilitar desarrollo (cambiar en producción)

COMMENT ON TABLE tiendas IS 'Comercios que usan el sistema de fidelización';
COMMENT ON TABLE clientes IS 'Clientes finales con su programa de puntos';
COMMENT ON TABLE qr_clientes IS 'Códigos QR únicos para identificación de clientes';
COMMENT ON TABLE compras IS 'Registro de compras y puntos otorgados';
COMMENT ON TABLE promociones IS 'Campañas promocionales de las tiendas';
COMMENT ON TABLE canjes IS 'Registro de canjes de puntos por premios';
COMMENT ON TABLE roles_tienda IS 'Usuarios con acceso al panel de administración';
