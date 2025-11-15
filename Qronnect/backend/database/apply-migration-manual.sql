-- ============================================
-- MIGRACIÓN 002: Sistema de Promociones y Canjes
-- Versión para ejecutar paso a paso
-- ============================================

-- PASO 1: Limpiar todo lo existente
DROP TABLE IF EXISTS canjes CASCADE;
DROP TABLE IF EXISTS promociones CASCADE;
DROP VIEW IF EXISTS vista_promociones_disponibles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS increment_cantidad_canjeada() CASCADE;
DROP FUNCTION IF EXISTS decrement_cantidad_canjeada() CASCADE;
DROP FUNCTION IF EXISTS generate_canje_code() CASCADE;

-- PASO 2: Crear tabla promociones
CREATE TABLE promociones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('descuento_fijo', 'descuento_porcentaje', 'producto_gratis')),
  valor NUMERIC(10, 2) NOT NULL CHECK (valor >= 0),
  puntos_requeridos INTEGER NOT NULL CHECK (puntos_requeridos > 0),
  imagen_url TEXT,
  activo BOOLEAN DEFAULT TRUE,
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_fin TIMESTAMP WITH TIME ZONE,
  cantidad_disponible INTEGER,
  cantidad_canjeada INTEGER DEFAULT 0 CHECK (cantidad_canjeada >= 0),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_cantidad_canjeada CHECK (cantidad_disponible IS NULL OR cantidad_canjeada <= cantidad_disponible)
);

-- PASO 3: Crear índices para promociones
CREATE INDEX idx_promociones_id_tienda ON promociones(id_tienda);
CREATE INDEX idx_promociones_activo ON promociones(activo);
CREATE INDEX idx_promociones_fecha_inicio ON promociones(fecha_inicio);
CREATE INDEX idx_promociones_fecha_fin ON promociones(fecha_fin);

-- PASO 4: Crear tabla canjes
CREATE TABLE canjes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_cliente UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  id_promocion UUID NOT NULL REFERENCES promociones(id) ON DELETE CASCADE,
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  puntos_usados INTEGER NOT NULL CHECK (puntos_usados > 0),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'usado', 'expirado', 'cancelado')),
  codigo_canje TEXT UNIQUE NOT NULL,
  fecha_canje TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_uso TIMESTAMP WITH TIME ZONE,
  fecha_expiracion TIMESTAMP WITH TIME ZONE,
  usado_por UUID,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 5: Crear índices para canjes
CREATE INDEX idx_canjes_id_cliente ON canjes(id_cliente);
CREATE INDEX idx_canjes_id_promocion ON canjes(id_promocion);
CREATE INDEX idx_canjes_id_tienda ON canjes(id_tienda);
CREATE INDEX idx_canjes_codigo_canje ON canjes(codigo_canje);
CREATE INDEX idx_canjes_estado ON canjes(estado);
CREATE INDEX idx_canjes_fecha_canje ON canjes(fecha_canje);

-- PASO 6: Crear funciones
CREATE FUNCTION generate_canje_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
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
$$;

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$;

CREATE FUNCTION increment_cantidad_canjeada()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE promociones
  SET cantidad_canjeada = cantidad_canjeada + 1
  WHERE id = NEW.id_promocion;
  RETURN NEW;
END;
$$;

CREATE FUNCTION decrement_cantidad_canjeada()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.estado != 'cancelado' AND NEW.estado = 'cancelado' THEN
    UPDATE promociones
    SET cantidad_canjeada = GREATEST(0, cantidad_canjeada - 1)
    WHERE id = OLD.id_promocion;
  END IF;
  RETURN NEW;
END;
$$;

-- PASO 7: Crear triggers
CREATE TRIGGER update_promociones_updated_at
  BEFORE UPDATE ON promociones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canjes_updated_at
  BEFORE UPDATE ON canjes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER increment_canjes_count
  AFTER INSERT ON canjes
  FOR EACH ROW
  EXECUTE FUNCTION increment_cantidad_canjeada();

CREATE TRIGGER decrement_canjes_count
  AFTER UPDATE ON canjes
  FOR EACH ROW
  WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
  EXECUTE FUNCTION decrement_cantidad_canjeada();

-- PASO 8: Crear vista
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

-- PASO 9: Agregar comentarios
COMMENT ON TABLE promociones IS 'Ofertas y descuentos que los clientes pueden canjear con puntos';
COMMENT ON TABLE canjes IS 'Registro de promociones canjeadas por clientes';
