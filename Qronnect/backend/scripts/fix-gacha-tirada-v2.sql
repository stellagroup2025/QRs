-- =====================================================
-- FIX V2: realizar_tirada_gacha - Versión alternativa
-- =====================================================
-- Si la V1 no funciona, usar esta versión
-- Construye el resultado directamente sin RETURN QUERY

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
  v_puntos_actualizados INTEGER;
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

  -- 8. Descontar puntos del cliente y obtener puntos actualizados
  UPDATE clientes
  SET puntos_totales = puntos_totales - v_config.costo_puntos
  WHERE id = p_id_cliente
  RETURNING puntos_totales INTO v_puntos_actualizados;

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

  -- 12. Retornar información del premio - Asignación directa
  premio_id := v_premio.id;
  premio_nombre := v_premio.nombre;
  premio_descripcion := v_premio.descripcion;
  premio_tipo := v_premio.tipo;
  premio_valor := v_premio.valor;
  premio_rareza := v_premio.rareza;
  codigo_canje := v_codigo;
  fecha_expiracion := v_fecha_expiracion;
  puntos_restantes := v_puntos_actualizados;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;
