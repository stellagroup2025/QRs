-- ============================================
-- MIGRACIÓN 002: Sistema de Promociones y Canjes
-- Fecha: 2025-11-10
-- Descripción: Tablas para gestionar promociones y canjes de puntos
-- Versión 2: Con mejor manejo de errores
-- ============================================

-- Primero eliminamos las tablas si existen (en orden inverso por dependencias)
DROP TABLE IF EXISTS canjes CASCADE;
DROP TABLE IF EXISTS promociones CASCADE;
DROP VIEW IF EXISTS vista_promociones_disponibles CASCADE;

-- Eliminar triggers y funciones si existen
DROP TRIGGER IF EXISTS update_promociones_updated_at ON promociones;
DROP TRIGGER IF EXISTS update_canjes_updated_at ON canjes;
DROP TRIGGER IF EXISTS increment_canjes_count ON canjes;
DROP TRIGGER IF EXISTS decrement_canjes_count ON canjes;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS increment_cantidad_canjeada() CASCADE;
DROP FUNCTION IF EXISTS decrement_cantidad_canjeada() CASCADE;
DROP FUNCTION IF EXISTS generate_canje_code() CASCADE;

-- ============================================
-- TABLA: promociones
-- Ofertas y descuentos que los clientes pueden canjear con puntos
-- ============================================
CREATE TABLE promociones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,

  -- Información básica
  titulo TEXT NOT NULL,
  descripcion TEXT,

  -- Tipo y valor del descuento
  tipo TEXT NOT NULL CHECK (tipo IN ('descuento_fijo', 'descuento_porcentaje', 'producto_gratis')),
  valor NUMERIC(10, 2) NOT NULL CHECK (valor >= 0),

  -- Puntos requeridos para canjear
  puntos_requeridos INTEGER NOT NULL CHECK (puntos_requeridos > 0),

  -- Imagen de la promoción
  imagen_url TEXT,

  -- Estado y disponibilidad
  activo BOOLEAN DEFAULT TRUE,
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_fin TIMESTAMP WITH TIME ZONE,

  -- Control de cantidad
  cantidad_disponible INTEGER,
  cantidad_canjeada INTEGER DEFAULT 0 CHECK (cantidad_canjeada >= 0),

  -- Auditoría
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Validación: si hay límite, los canjes no deben superarlo
  CONSTRAINT check_cantidad_canjeada
    CHECK (cantidad_disponible IS NULL OR cantidad_canjeada <= cantidad_disponible)
);

-- Índices para promociones
CREATE INDEX idx_promociones_id_tienda ON promociones(id_tienda);
CREATE INDEX idx_promociones_activo ON promociones(activo);
CREATE INDEX idx_promociones_fecha_inicio ON promociones(fecha_inicio);
CREATE INDEX idx_promociones_fecha_fin ON promociones(fecha_fin);

-- ============================================
-- TABLA: canjes
-- Registro de promociones canjeadas por clientes
-- ============================================
CREATE TABLE canjes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Referencias
  id_cliente UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  id_promocion UUID NOT NULL REFERENCES promociones(id) ON DELETE CASCADE,
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,

  -- Puntos y estado
  puntos_usados INTEGER NOT NULL CHECK (puntos_usados > 0),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'usado', 'expirado', 'cancelado')),

  -- Código único para validar el canje
  codigo_canje TEXT UNIQUE NOT NULL,

  -- Fechas
  fecha_canje TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_uso TIMESTAMP WITH TIME ZONE,
  fecha_expiracion TIMESTAMP WITH TIME ZONE,

  -- Quién validó el canje
  usado_por UUID,

  -- Auditoría
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para canjes
CREATE INDEX idx_canjes_id_cliente ON canjes(id_cliente);
CREATE INDEX idx_canjes_id_promocion ON canjes(id_promocion);
CREATE INDEX idx_canjes_id_tienda ON canjes(id_tienda);
CREATE INDEX idx_canjes_codigo_canje ON canjes(codigo_canje);
CREATE INDEX idx_canjes_estado ON canjes(estado);
CREATE INDEX idx_canjes_fecha_canje ON canjes(fecha_canje);

-- ============================================
-- FUNCIÓN: Generar código de canje único
-- ============================================
CREATE FUNCTION generate_canje_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..12 LOOP
    IF i IN (5, 9) THEN
      result := result || '-';
    ELSE
      result := result || substr(chars, (random() * (length(chars) - 1) + 1)::INTEGER, 1);
    END IF;
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Actualizar fecha de actualización
-- ============================================
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Incrementar cantidad_canjeada
-- ============================================
CREATE FUNCTION increment_cantidad_canjeada()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE promociones
  SET cantidad_canjeada = cantidad_canjeada + 1
  WHERE id = NEW.id_promocion;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Decrementar cantidad_canjeada
-- ============================================
CREATE FUNCTION decrement_cantidad_canjeada()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado != 'cancelado' AND NEW.estado = 'cancelado' THEN
    UPDATE promociones
    SET cantidad_canjeada = GREATEST(0, cantidad_canjeada - 1)
    WHERE id = OLD.id_promocion;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para actualizar updated_at en promociones
CREATE TRIGGER update_promociones_updated_at
  BEFORE UPDATE ON promociones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en canjes
CREATE TRIGGER update_canjes_updated_at
  BEFORE UPDATE ON canjes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para incrementar cantidad_canjeada
CREATE TRIGGER increment_canjes_count
  AFTER INSERT ON canjes
  FOR EACH ROW
  EXECUTE FUNCTION increment_cantidad_canjeada();

-- Trigger para decrementar cantidad_canjeada cuando se cancela
CREATE TRIGGER decrement_canjes_count
  AFTER UPDATE ON canjes
  FOR EACH ROW
  WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
  EXECUTE FUNCTION decrement_cantidad_canjeada();

-- ============================================
-- VISTA: Promociones disponibles para clientes
-- ============================================
CREATE VIEW vista_promociones_disponibles AS
SELECT
  p.id,
  p.id_tienda,
  p.titulo,
  p.descripcion,
  p.tipo,
  p.valor,
  p.puntos_requeridos,
  p.imagen_url,
  p.fecha_inicio,
  p.fecha_fin,
  p.cantidad_disponible,
  p.cantidad_canjeada,
  CASE
    WHEN p.cantidad_disponible IS NULL THEN TRUE
    WHEN p.cantidad_disponible > p.cantidad_canjeada THEN TRUE
    ELSE FALSE
  END AS disponible,
  p.creado_en
FROM promociones p
WHERE
  p.activo = TRUE
  AND p.fecha_inicio <= NOW()
  AND (p.fecha_fin IS NULL OR p.fecha_fin > NOW());

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON TABLE promociones IS 'Ofertas y descuentos que los clientes pueden canjear con puntos';
COMMENT ON TABLE canjes IS 'Registro de promociones canjeadas por clientes';
COMMENT ON COLUMN promociones.tipo IS 'Tipo de promoción: descuento_fijo, descuento_porcentaje, producto_gratis';
COMMENT ON COLUMN promociones.valor IS 'Valor del descuento (euros o porcentaje) o precio del producto';
COMMENT ON COLUMN promociones.cantidad_disponible IS 'Límite de canjes disponibles (NULL = ilimitado)';
COMMENT ON COLUMN canjes.estado IS 'Estado del canje: pendiente, usado, expirado, cancelado';
COMMENT ON COLUMN canjes.codigo_canje IS 'Código único para validar el canje en tienda';
