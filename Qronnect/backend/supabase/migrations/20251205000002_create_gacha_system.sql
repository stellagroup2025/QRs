-- =====================================================
-- SISTEMA GACHA (GACHAPON) - Premios Aleatorios
-- =====================================================
-- Fecha: 2025-12-05
-- Descripción: Sistema de recompensas aleatorias tipo gachapon
--              Los clientes gastan puntos para obtener premios al azar

-- =====================================================
-- 1. TABLA: gacha_config
-- =====================================================
-- Configuración del sistema gacha por tienda
CREATE TABLE IF NOT EXISTS gacha_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,

  -- Configuración
  activo BOOLEAN DEFAULT false,
  costo_puntos INTEGER NOT NULL DEFAULT 50,
  nombre VARCHAR(100) DEFAULT 'Máquina de Premios',
  descripcion TEXT DEFAULT 'Gasta puntos y gana premios increíbles al azar',

  -- Límites y restricciones
  max_tiradas_por_dia INTEGER DEFAULT NULL, -- NULL = sin límite
  cooldown_minutos INTEGER DEFAULT NULL, -- Tiempo de espera entre tiradas

  -- Personalización visual
  color_primario VARCHAR(7) DEFAULT '#FF6B9D', -- Rosa vibrante
  icono VARCHAR(50) DEFAULT '🎰',

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Una sola configuración por tienda
  UNIQUE(id_tienda)
);

-- =====================================================
-- 2. TABLA: gacha_premios
-- =====================================================
-- Catálogo de premios disponibles en el gacha
CREATE TABLE IF NOT EXISTS gacha_premios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,

  -- Información del premio
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL, -- 'descuento_porcentaje', 'descuento_fijo', 'producto_gratis', 'puntos_extra', 'sello_extra'
  valor DECIMAL(10,2) NOT NULL, -- El valor depende del tipo

  -- Rareza y probabilidad
  rareza VARCHAR(20) NOT NULL CHECK (rareza IN ('comun', 'raro', 'epico', 'legendario')),
  peso INTEGER NOT NULL DEFAULT 100, -- Peso relativo para calcular probabilidad

  -- Detalles adicionales
  imagen_url TEXT,
  color_rareza VARCHAR(7),
  condiciones TEXT, -- Condiciones para canjear (ej: "Válido solo fines de semana")
  dias_validez INTEGER DEFAULT 30, -- Días que el premio es válido

  -- Estado
  activo BOOLEAN DEFAULT true,
  stock_limitado BOOLEAN DEFAULT false,
  stock_actual INTEGER DEFAULT NULL, -- NULL = ilimitado

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_gacha_premios_tienda_activo ON gacha_premios(id_tienda, activo);
CREATE INDEX idx_gacha_premios_rareza ON gacha_premios(rareza);

-- =====================================================
-- 3. TABLA: gacha_historial
-- =====================================================
-- Registro de todas las tiradas y premios ganados
CREATE TABLE IF NOT EXISTS gacha_historial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  id_cliente UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  id_premio UUID NOT NULL REFERENCES gacha_premios(id) ON DELETE RESTRICT,

  -- Información de la tirada
  puntos_gastados INTEGER NOT NULL,
  fecha_tirada TIMESTAMPTZ DEFAULT NOW(),

  -- Estado del premio
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'canjeado', 'expirado')),
  codigo_canje VARCHAR(20) UNIQUE,
  fecha_expiracion TIMESTAMPTZ,
  fecha_canjeado TIMESTAMPTZ,
  canjeado_por UUID REFERENCES usuarios_tienda(id) ON DELETE SET NULL
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_gacha_historial_cliente ON gacha_historial(id_cliente, estado);
CREATE INDEX idx_gacha_historial_tienda ON gacha_historial(id_tienda, fecha_tirada);
CREATE INDEX idx_gacha_historial_codigo ON gacha_historial(codigo_canje);

-- =====================================================
-- 4. FUNCIÓN: Generar código de canje único
-- =====================================================
CREATE OR REPLACE FUNCTION generar_codigo_gacha()
RETURNS TEXT AS $$
DECLARE
  codigo TEXT;
  existe BOOLEAN;
BEGIN
  LOOP
    -- Generar código de 8 caracteres alfanuméricos
    codigo := UPPER(
      substring(md5(random()::text) from 1 for 8)
    );

    -- Verificar si ya existe
    SELECT EXISTS(
      SELECT 1 FROM gacha_historial WHERE codigo_canje = codigo
    ) INTO existe;

    EXIT WHEN NOT existe;
  END LOOP;

  RETURN codigo;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. FUNCIÓN: Realizar tirada de gacha
-- =====================================================
CREATE OR REPLACE FUNCTION realizar_tirada_gacha(
  p_id_tienda UUID,
  p_id_cliente UUID
)
RETURNS TABLE(
  premio_id UUID,
  premio_nombre VARCHAR,
  premio_descripcion TEXT,
  premio_tipo VARCHAR,
  premio_valor DECIMAL,
  premio_rareza VARCHAR,
  codigo_canje VARCHAR,
  fecha_expiracion TIMESTAMPTZ,
  puntos_restantes INTEGER
) AS $$
DECLARE
  v_config RECORD;
  v_premio RECORD;
  v_cliente RECORD;
  v_codigo TEXT;
  v_total_peso INTEGER;
  v_random_value INTEGER;
  v_acumulado INTEGER;
  v_fecha_expiracion TIMESTAMPTZ;
BEGIN
  -- 1. Obtener configuración del gacha
  SELECT * INTO v_config
  FROM gacha_config
  WHERE id_tienda = p_id_tienda AND activo = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El sistema gacha no está disponible';
  END IF;

  -- 2. Verificar puntos del cliente
  SELECT * INTO v_cliente
  FROM clientes
  WHERE id = p_id_cliente AND id_tienda = p_id_tienda;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cliente no encontrado';
  END IF;

  IF v_cliente.puntos_totales < v_config.costo_puntos THEN
    RAISE EXCEPTION 'Puntos insuficientes. Necesitas % puntos', v_config.costo_puntos;
  END IF;

  -- 3. Verificar límite de tiradas por día (si aplica)
  IF v_config.max_tiradas_por_dia IS NOT NULL THEN
    DECLARE
      v_tiradas_hoy INTEGER;
    BEGIN
      SELECT COUNT(*) INTO v_tiradas_hoy
      FROM gacha_historial
      WHERE id_cliente = p_id_cliente
        AND id_tienda = p_id_tienda
        AND fecha_tirada >= CURRENT_DATE;

      IF v_tiradas_hoy >= v_config.max_tiradas_por_dia THEN
        RAISE EXCEPTION 'Has alcanzado el límite de tiradas por hoy';
      END IF;
    END;
  END IF;

  -- 4. Verificar cooldown (si aplica)
  IF v_config.cooldown_minutos IS NOT NULL THEN
    DECLARE
      v_ultima_tirada TIMESTAMPTZ;
    BEGIN
      SELECT MAX(fecha_tirada) INTO v_ultima_tirada
      FROM gacha_historial
      WHERE id_cliente = p_id_cliente AND id_tienda = p_id_tienda;

      IF v_ultima_tirada IS NOT NULL
         AND v_ultima_tirada + (v_config.cooldown_minutos || ' minutes')::INTERVAL > NOW() THEN
        RAISE EXCEPTION 'Debes esperar antes de jugar de nuevo';
      END IF;
    END;
  END IF;

  -- 5. Calcular peso total de premios activos con stock
  SELECT SUM(peso) INTO v_total_peso
  FROM gacha_premios
  WHERE id_tienda = p_id_tienda
    AND activo = true
    AND (NOT stock_limitado OR (stock_limitado AND stock_actual > 0));

  IF v_total_peso IS NULL OR v_total_peso = 0 THEN
    RAISE EXCEPTION 'No hay premios disponibles en este momento';
  END IF;

  -- 6. Seleccionar premio aleatorio basado en peso
  v_random_value := floor(random() * v_total_peso)::INTEGER;
  v_acumulado := 0;

  FOR v_premio IN
    SELECT *
    FROM gacha_premios
    WHERE id_tienda = p_id_tienda
      AND activo = true
      AND (NOT stock_limitado OR (stock_limitado AND stock_actual > 0))
    ORDER BY peso DESC
  LOOP
    v_acumulado := v_acumulado + v_premio.peso;

    IF v_acumulado > v_random_value THEN
      EXIT;
    END IF;
  END LOOP;

  -- 7. Actualizar stock si es limitado
  IF v_premio.stock_limitado THEN
    UPDATE gacha_premios
    SET stock_actual = stock_actual - 1,
        actualizado_en = NOW()
    WHERE id = v_premio.id;
  END IF;

  -- 8. Descontar puntos del cliente
  UPDATE clientes
  SET puntos_totales = puntos_totales - v_config.costo_puntos
  WHERE id = p_id_cliente;

  -- 9. Generar código de canje
  v_codigo := generar_codigo_gacha();

  -- 10. Calcular fecha de expiración
  v_fecha_expiracion := NOW() + (COALESCE(v_premio.dias_validez, 30) || ' days')::INTERVAL;

  -- 11. Registrar en historial
  INSERT INTO gacha_historial (
    id_tienda,
    id_cliente,
    id_premio,
    puntos_gastados,
    codigo_canje,
    fecha_expiracion,
    estado
  ) VALUES (
    p_id_tienda,
    p_id_cliente,
    v_premio.id,
    v_config.costo_puntos,
    v_codigo,
    v_fecha_expiracion,
    'pendiente'
  );

  -- 12. Retornar información del premio
  RETURN QUERY
  SELECT
    v_premio.id,
    v_premio.nombre,
    v_premio.descripcion,
    v_premio.tipo,
    v_premio.valor,
    v_premio.rareza,
    v_codigo,
    v_fecha_expiracion,
    (v_cliente.puntos_totales - v_config.costo_puntos)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. DATOS INICIALES: Premios por defecto
-- =====================================================
-- Función para insertar premios por defecto cuando se activa gacha
CREATE OR REPLACE FUNCTION insertar_premios_gacha_defecto(p_id_tienda UUID, p_sector VARCHAR DEFAULT 'general')
RETURNS VOID AS $$
BEGIN
  -- Premios COMUNES (70% probabilidad total) - peso 700
  INSERT INTO gacha_premios (id_tienda, nombre, descripcion, tipo, valor, rareza, peso, color_rareza) VALUES
    (p_id_tienda, '5% de descuento', 'Descuento del 5% en tu próxima compra', 'descuento_porcentaje', 5, 'comun', 250, '#95A5A6'),
    (p_id_tienda, '10 puntos extra', 'Recibe 10 puntos adicionales', 'puntos_extra', 10, 'comun', 250, '#95A5A6'),
    (p_id_tienda, '1€ de descuento', 'Descuento de 1€ en compras superiores a 10€', 'descuento_fijo', 1, 'comun', 200, '#95A5A6');

  -- Premios RAROS (20% probabilidad) - peso 200
  INSERT INTO gacha_premios (id_tienda, nombre, descripcion, tipo, valor, rareza, peso, color_rareza) VALUES
    (p_id_tienda, '10% de descuento', 'Descuento del 10% en tu próxima compra', 'descuento_porcentaje', 10, 'raro', 100, '#3498DB'),
    (p_id_tienda, '25 puntos extra', 'Recibe 25 puntos adicionales', 'puntos_extra', 25, 'raro', 100, '#3498DB');

  -- Premios ÉPICOS (8% probabilidad) - peso 80
  INSERT INTO gacha_premios (id_tienda, nombre, descripcion, tipo, valor, rareza, peso, color_rareza) VALUES
    (p_id_tienda, '20% de descuento', 'Descuento del 20% en tu próxima compra', 'descuento_porcentaje', 20, 'epico', 50, '#9B59B6'),
    (p_id_tienda, '5€ de descuento', 'Descuento de 5€ en compras superiores a 20€', 'descuento_fijo', 5, 'epico', 30, '#9B59B6');

  -- Premios LEGENDARIOS (2% probabilidad) - peso 20
  INSERT INTO gacha_premios (id_tienda, nombre, descripcion, tipo, valor, rareza, peso, color_rareza) VALUES
    (p_id_tienda, '50% de descuento', '¡Descuento del 50% en tu próxima compra!', 'descuento_porcentaje', 50, 'legendario', 15, '#F39C12'),
    (p_id_tienda, '100 puntos extra', '¡Recibe 100 puntos adicionales!', 'puntos_extra', 100, 'legendario', 5, '#F39C12');

  -- Premios específicos por sector
  IF p_sector = 'restaurante' OR p_sector = 'cafeteria' THEN
    INSERT INTO gacha_premios (id_tienda, nombre, descripcion, tipo, valor, rareza, peso, color_rareza) VALUES
      (p_id_tienda, 'Café gratis', 'Un café de la casa totalmente gratis', 'producto_gratis', 0, 'raro', 80, '#3498DB'),
      (p_id_tienda, 'Postre gratis', 'Un postre de la casa totalmente gratis', 'producto_gratis', 0, 'epico', 40, '#9B59B6');

  ELSIF p_sector = 'retail' OR p_sector = 'tienda' THEN
    INSERT INTO gacha_premios (id_tienda, nombre, descripcion, tipo, valor, rareza, peso, color_rareza) VALUES
      (p_id_tienda, 'Producto sorpresa', 'Un producto sorpresa gratis (hasta 5€)', 'producto_gratis', 5, 'epico', 40, '#9B59B6');

  ELSIF p_sector = 'belleza' OR p_sector = 'estetica' THEN
    INSERT INTO gacha_premios (id_tienda, nombre, descripcion, tipo, valor, rareza, peso, color_rareza) VALUES
      (p_id_tienda, 'Tratamiento express', 'Tratamiento express gratuito (15 min)', 'producto_gratis', 0, 'epico', 40, '#9B59B6');

  ELSIF p_sector = 'gimnasio' OR p_sector = 'fitness' THEN
    INSERT INTO gacha_premios (id_tienda, nombre, descripcion, tipo, valor, rareza, peso, color_rareza) VALUES
      (p_id_tienda, 'Clase grupal gratis', 'Una clase grupal totalmente gratis', 'producto_gratis', 0, 'raro', 80, '#3498DB');
  END IF;

END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. RLS (Row Level Security)
-- =====================================================
ALTER TABLE gacha_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_premios ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_historial ENABLE ROW LEVEL SECURITY;

-- Políticas para gacha_config
CREATE POLICY "Admins pueden ver config gacha de su tienda"
  ON gacha_config FOR SELECT
  TO authenticated
  USING (id_tienda IN (SELECT id_tienda FROM usuarios_tienda WHERE id = auth.uid()));

CREATE POLICY "Admins pueden actualizar config gacha"
  ON gacha_config FOR UPDATE
  TO authenticated
  USING (id_tienda IN (SELECT id_tienda FROM usuarios_tienda WHERE id = auth.uid()));

-- Políticas para gacha_premios
CREATE POLICY "Todos pueden ver premios activos"
  ON gacha_premios FOR SELECT
  TO authenticated
  USING (activo = true);

CREATE POLICY "Admins pueden gestionar premios de su tienda"
  ON gacha_premios FOR ALL
  TO authenticated
  USING (id_tienda IN (SELECT id_tienda FROM usuarios_tienda WHERE id = auth.uid()));

-- Políticas para gacha_historial
CREATE POLICY "Clientes pueden ver su propio historial"
  ON gacha_historial FOR SELECT
  TO authenticated
  USING (id_cliente = auth.uid());

CREATE POLICY "Admins pueden ver historial de su tienda"
  ON gacha_historial FOR SELECT
  TO authenticated
  USING (id_tienda IN (SELECT id_tienda FROM usuarios_tienda WHERE id = auth.uid()));

-- =====================================================
-- 8. COMENTARIOS
-- =====================================================
COMMENT ON TABLE gacha_config IS 'Configuración del sistema de premios aleatorios (gachapon) por tienda';
COMMENT ON TABLE gacha_premios IS 'Catálogo de premios disponibles con rareza y probabilidades';
COMMENT ON TABLE gacha_historial IS 'Historial de todas las tiradas y premios ganados por clientes';
COMMENT ON FUNCTION realizar_tirada_gacha IS 'Función principal para realizar una tirada del gacha y obtener un premio aleatorio';
