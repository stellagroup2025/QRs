-- ============================================
-- Referidos: premio por la primera compra del amigo
-- ============================================
-- Cada programa puede dar puntos extra a quien invita y al amigo cuando el amigo
-- hace su primera compra. Se reparten una sola vez por referido (fecha_primera_compra).

ALTER TABLE public.programas_referidos
  ADD COLUMN IF NOT EXISTS puntos_primera_compra_referidor INTEGER NOT NULL DEFAULT 0
    CHECK (puntos_primera_compra_referidor >= 0),
  ADD COLUMN IF NOT EXISTS puntos_primera_compra_referido INTEGER NOT NULL DEFAULT 0
    CHECK (puntos_primera_compra_referido >= 0);

COMMENT ON COLUMN public.programas_referidos.puntos_primera_compra_referidor IS
  'Puntos para quien invita cuando su amigo hace la primera compra';
COMMENT ON COLUMN public.programas_referidos.puntos_primera_compra_referido IS
  'Puntos para el amigo en su primera compra';

ALTER TABLE public.historial_referidos
  ADD COLUMN IF NOT EXISTS fecha_primera_compra TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS puntos_primera_compra_referidor INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS puntos_primera_compra_referido INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.historial_referidos.fecha_primera_compra IS
  'Cuándo hizo el amigo su primera compra (y se repartió el premio, si había)';

-- --------------------------------------------
-- Reparte el premio de primera compra. Se llama al registrar cada compra:
-- solo actúa la primera vez para un cliente que llegó con un código.
-- --------------------------------------------
CREATE OR REPLACE FUNCTION public.premiar_primera_compra_referido(
  p_cliente_id UUID,
  p_tienda_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_historial RECORD;
  v_puntos_referidor INTEGER := 0;
  v_puntos_referido INTEGER := 0;
BEGIN
  -- Marcar la primera compra de forma atómica: si dos compras llegan a la vez, solo una gana
  UPDATE public.historial_referidos hr
  SET fecha_primera_compra = NOW()
  WHERE hr.referido_id = p_cliente_id
    AND hr.id_tienda = p_tienda_id
    AND hr.estado = 'completado'
    AND hr.fecha_primera_compra IS NULL
  RETURNING hr.id, hr.referidor_id, hr.programa_id INTO v_historial;

  -- No vino con un código, o ya se le dio el premio de primera compra
  IF NOT FOUND THEN
    RETURN jsonb_build_object('premiado', false);
  END IF;

  -- Premio del programa con el que se registró (o del activo, si ese ya no existe)
  SELECT COALESCE(pr.puntos_primera_compra_referidor, 0), COALESCE(pr.puntos_primera_compra_referido, 0)
  INTO v_puntos_referidor, v_puntos_referido
  FROM public.programas_referidos pr
  WHERE pr.id = v_historial.programa_id
     OR (v_historial.programa_id IS NULL AND pr.id_tienda = p_tienda_id AND pr.activo = true)
  ORDER BY (pr.id = v_historial.programa_id) DESC
  LIMIT 1;

  v_puntos_referidor := COALESCE(v_puntos_referidor, 0);
  v_puntos_referido := COALESCE(v_puntos_referido, 0);

  UPDATE public.historial_referidos
  SET puntos_primera_compra_referidor = v_puntos_referidor,
      puntos_primera_compra_referido = v_puntos_referido
  WHERE id = v_historial.id;

  IF v_puntos_referidor > 0 THEN
    UPDATE public.clientes
    SET puntos_totales = puntos_totales + v_puntos_referidor
    WHERE id = v_historial.referidor_id;
  END IF;

  IF v_puntos_referido > 0 THEN
    UPDATE public.clientes
    SET puntos_totales = puntos_totales + v_puntos_referido
    WHERE id = p_cliente_id;
  END IF;

  RETURN jsonb_build_object(
    'premiado', true,
    'referidor_id', v_historial.referidor_id,
    'puntos_referidor', v_puntos_referidor,
    'puntos_referido', v_puntos_referido
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.premiar_primera_compra_referido IS
  'Reparte una sola vez el premio de primera compra de un cliente referido';

-- Las estadísticas también cuentan los puntos de primera compra
CREATE OR REPLACE FUNCTION public.estadisticas_referidos(
  p_tienda_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_total_referidos INTEGER;
  v_referidos_mes INTEGER;
  v_puntos_otorgados INTEGER;
  v_top_referidores JSONB;
BEGIN
  -- Total de referidos
  SELECT COUNT(*)
  INTO v_total_referidos
  FROM public.historial_referidos
  WHERE id_tienda = p_tienda_id
    AND estado = 'completado';

  -- Referidos este mes
  SELECT COUNT(*)
  INTO v_referidos_mes
  FROM public.historial_referidos
  WHERE id_tienda = p_tienda_id
    AND estado = 'completado'
    AND fecha_completado >= DATE_TRUNC('month', NOW());

  -- Puntos otorgados totales
  SELECT COALESCE(SUM(
    puntos_otorgados_referidor + puntos_otorgados_referido
    + COALESCE(puntos_primera_compra_referidor, 0) + COALESCE(puntos_primera_compra_referido, 0)
  ), 0)
  INTO v_puntos_otorgados
  FROM public.historial_referidos
  WHERE id_tienda = p_tienda_id
    AND estado = 'completado';

  -- Top 5 referidores
  SELECT jsonb_agg(
    jsonb_build_object(
      'cliente_id', c.id,
      'nombre', c.nombre,
      'total_referidos', c.total_referidos,
      'codigo', c.codigo_referido_personal
    )
  ) INTO v_top_referidores
  FROM (
    SELECT id, nombre, total_referidos, codigo_referido_personal
    FROM public.clientes
    WHERE id_tienda = p_tienda_id
      AND total_referidos > 0
    ORDER BY total_referidos DESC
    LIMIT 5
  ) c;

  RETURN jsonb_build_object(
    'total_referidos', v_total_referidos,
    'referidos_este_mes', v_referidos_mes,
    'puntos_otorgados', v_puntos_otorgados,
    'top_referidores', COALESCE(v_top_referidores, '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql;

-- La vista del panel y de "Mis amigos" incluye los datos de primera compra
CREATE OR REPLACE VIEW public.vista_referidos_dashboard AS
SELECT
  hr.id,
  hr.id_tienda,
  hr.referidor_id,
  c_referidor.nombre AS referidor_nombre,
  c_referidor.codigo_referido_personal AS referidor_codigo,
  hr.referido_id,
  c_referido.nombre AS referido_nombre,
  c_referido.email AS referido_email,
  c_referido.telefono AS referido_telefono,
  hr.codigo_usado,
  hr.estado,
  hr.puntos_otorgados_referidor,
  hr.puntos_otorgados_referido,
  hr.fecha_registro AS creado_en,
  hr.fecha_completado,
  pr.nombre AS programa_nombre,
  hr.fecha_primera_compra,
  hr.puntos_primera_compra_referidor,
  hr.puntos_primera_compra_referido
FROM public.historial_referidos hr
  LEFT JOIN public.clientes c_referidor ON hr.referidor_id = c_referidor.id
  LEFT JOIN public.clientes c_referido ON hr.referido_id = c_referido.id
  LEFT JOIN public.programas_referidos pr ON hr.programa_id = pr.id;
