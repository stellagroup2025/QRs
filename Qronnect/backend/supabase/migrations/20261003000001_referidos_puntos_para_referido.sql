-- ============================================
-- Referidos: premio propio para el amigo que se registra
-- ============================================
-- Hasta ahora el amigo recibía siempre los mismos puntos que quien le invita
-- (puntos_por_referido). Con esta columna cada tienda puede darle una cantidad distinta.
-- NULL = comportamiento anterior (los mismos puntos que el referidor).

ALTER TABLE public.programas_referidos
  ADD COLUMN IF NOT EXISTS puntos_para_referido INTEGER CHECK (puntos_para_referido IS NULL OR puntos_para_referido >= 0);

COMMENT ON COLUMN public.programas_referidos.puntos_para_referido IS
  'Puntos para el amigo que se registra con un código. NULL = los mismos que puntos_por_referido';

CREATE OR REPLACE FUNCTION public.registrar_referido(
  p_codigo_referido VARCHAR,
  p_nuevo_cliente_id UUID,
  p_tienda_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_referidor_id UUID;
  v_programa_id UUID;
  v_puntos_referidor INTEGER := 0;
  v_puntos_referido INTEGER := 0;
  v_puntos_para_referido INTEGER;
  v_historial_id UUID;
BEGIN
  -- 1. Buscar quién es el referidor por su código
  SELECT id INTO v_referidor_id
  FROM public.clientes
  WHERE codigo_referido_personal = p_codigo_referido
    AND id_tienda = p_tienda_id
    AND activo = true;

  IF v_referidor_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Código de referido no válido o inactivo'
    );
  END IF;

  -- 2. Verificar que no se esté auto-refiriendo
  IF v_referidor_id = p_nuevo_cliente_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No puedes usar tu propio código de referido'
    );
  END IF;

  -- 3. Verificar que el cliente no haya sido referido antes
  IF EXISTS (
    SELECT 1 FROM public.historial_referidos
    WHERE referido_id = p_nuevo_cliente_id
      AND id_tienda = p_tienda_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Este cliente ya fue registrado con un código de referido'
    );
  END IF;

  -- 4. Obtener programa activo de referidos
  SELECT id, puntos_por_referido, puntos_para_referido
  INTO v_programa_id, v_puntos_referidor, v_puntos_para_referido
  FROM public.programas_referidos
  WHERE id_tienda = p_tienda_id
    AND activo = true
    AND (vigencia_desde IS NULL OR vigencia_desde <= NOW())
    AND (vigencia_hasta IS NULL OR vigencia_hasta >= NOW())
  LIMIT 1;

  -- Si no hay programa, usar 0 puntos pero registrar igual
  v_puntos_referidor := COALESCE(v_puntos_referidor, 0);
  -- El amigo recibe lo configurado para él; si no hay nada configurado, lo mismo que quien invita
  -- (así funcionaba antes de existir la columna)
  v_puntos_referido := COALESCE(v_puntos_para_referido, v_puntos_referidor);

  -- 5. Registrar en historial
  INSERT INTO public.historial_referidos (
    id_tienda,
    referidor_id,
    referido_id,
    programa_id,
    codigo_usado,
    estado,
    puntos_otorgados_referidor,
    puntos_otorgados_referido,
    fecha_completado
  ) VALUES (
    p_tienda_id,
    v_referidor_id,
    p_nuevo_cliente_id,
    v_programa_id,
    p_codigo_referido,
    'completado',
    v_puntos_referidor,
    v_puntos_referido,
    NOW()
  ) RETURNING id INTO v_historial_id;

  -- 6. Actualizar contador de referidos del referidor
  UPDATE public.clientes
  SET total_referidos = total_referidos + 1
  WHERE id = v_referidor_id;

  -- 7. Marcar al nuevo cliente como referido
  UPDATE public.clientes
  SET referido_por = v_referidor_id
  WHERE id = p_nuevo_cliente_id;

  -- 8. Otorgar puntos al referidor
  IF v_puntos_referidor > 0 THEN
    UPDATE public.clientes
    SET puntos_totales = puntos_totales + v_puntos_referidor
    WHERE id = v_referidor_id;
  END IF;

  -- 9. Otorgar puntos al referido
  IF v_puntos_referido > 0 THEN
    UPDATE public.clientes
    SET puntos_totales = puntos_totales + v_puntos_referido
    WHERE id = p_nuevo_cliente_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Referido registrado exitosamente',
    'historial_id', v_historial_id,
    'puntos_otorgados_referidor', v_puntos_referidor,
    'puntos_otorgados_referido', v_puntos_referido
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.registrar_referido IS 'Registra un nuevo referido y otorga puntos a quien invita y al amigo';
