-- ============================================
-- FIX: Actualizar vista de cupones y mejorar entrega de regalo de bienvenida
-- ============================================
-- Date: 2025-12-03
-- Description:
-- 1. Actualizar vista_cupones_cliente para incluir campos faltantes
-- 2. Asegurar que el cupón de descuento de bienvenida se crea correctamente

-- ============================================
-- 1. Actualizar vista_cupones_cliente
-- ============================================
-- Agregar campos que el frontend necesita: visto_por_cliente, fecha_visto, detalles_regalo

DROP VIEW IF EXISTS public.vista_cupones_cliente;

CREATE OR REPLACE VIEW public.vista_cupones_cliente AS
SELECT
  c.id,
  c.id_cliente,
  c.id_tienda,
  c.codigo,
  c.estado,
  c.origen,
  c.origen_detalles,
  c.fecha_otorgado,
  c.fecha_expiracion,
  c.fecha_usado,
  c.visto_por_cliente,
  c.fecha_visto,
  c.notificado_email,
  c.notificado_sms,
  r.nombre as regalo_nombre,
  r.descripcion as regalo_descripcion,
  r.tipo as regalo_tipo,
  r.detalles as detalles_regalo,
  r.instrucciones_canje,
  r.icono as regalo_icono,
  r.imagen_url as regalo_imagen,
  CASE
    WHEN c.estado = 'disponible' AND (c.fecha_expiracion IS NULL OR c.fecha_expiracion > NOW()) THEN true
    ELSE false
  END as es_valido
FROM public.cupones_regalos c
INNER JOIN public.regalos_catalogo r ON c.id_regalo = r.id
ORDER BY c.fecha_otorgado DESC;

COMMENT ON VIEW public.vista_cupones_cliente IS 'Vista de cupones de clientes con información completa del regalo';

-- ============================================
-- 2. Función para otorgar cupón de descuento de bienvenida
-- ============================================
-- Esta función se puede llamar directamente para asegurar que el cupón se crea

CREATE OR REPLACE FUNCTION public.otorgar_cupon_descuento_bienvenida(
  p_cliente_id UUID,
  p_tienda_id UUID,
  p_descuento_porcentaje INTEGER DEFAULT 10
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_regalo_id UUID;
  v_cupon_id UUID;
  v_codigo VARCHAR(50);
  v_fecha_expiracion TIMESTAMPTZ;
BEGIN
  -- Buscar regalo de descuento de bienvenida existente
  SELECT id INTO v_regalo_id
  FROM public.regalos_catalogo
  WHERE id_tienda = p_tienda_id
    AND tipo = 'descuento'
    AND nombre ILIKE '%bienvenida%'
  LIMIT 1;

  -- Si no existe, crearlo
  IF v_regalo_id IS NULL THEN
    INSERT INTO public.regalos_catalogo (
      id_tienda,
      nombre,
      descripcion,
      tipo,
      detalles,
      instrucciones_canje,
      icono,
      dias_validez,
      requiere_validacion_staff,
      activo
    ) VALUES (
      p_tienda_id,
      p_descuento_porcentaje || '% de descuento de bienvenida',
      'Cupón de ' || p_descuento_porcentaje || '% de descuento para tu primera compra. ¡Bienvenido!',
      'descuento',
      jsonb_build_object('porcentaje', p_descuento_porcentaje, 'min_compra', 0),
      'Muestra este cupón al pagar para aplicar el descuento.',
      'percent',
      30,
      true,
      true
    )
    RETURNING id INTO v_regalo_id;
  END IF;

  -- Verificar si el cliente ya tiene un cupón de bienvenida
  SELECT id INTO v_cupon_id
  FROM public.cupones_regalos
  WHERE id_cliente = p_cliente_id
    AND origen = 'bienvenida'
  LIMIT 1;

  IF v_cupon_id IS NOT NULL THEN
    -- Ya tiene cupón, devolver el existente
    RETURN v_cupon_id;
  END IF;

  -- Generar código único
  v_codigo := public.generar_codigo_cupon();

  -- Calcular fecha de expiración (30 días)
  v_fecha_expiracion := NOW() + INTERVAL '30 days';

  -- Crear el cupón
  INSERT INTO public.cupones_regalos (
    id_cliente,
    id_tienda,
    id_regalo,
    codigo,
    origen,
    origen_detalles,
    fecha_expiracion,
    estado
  ) VALUES (
    p_cliente_id,
    p_tienda_id,
    v_regalo_id,
    v_codigo,
    'bienvenida',
    jsonb_build_object('descuento_porcentaje', p_descuento_porcentaje, 'email_validado', true),
    v_fecha_expiracion,
    'disponible'
  )
  RETURNING id INTO v_cupon_id;

  RETURN v_cupon_id;
END;
$$;

COMMENT ON FUNCTION public.otorgar_cupon_descuento_bienvenida IS 'Otorga un cupón de descuento de bienvenida a un cliente, creando el regalo si no existe';

-- ============================================
-- 3. Asegurar que la función generar_codigo_cupon existe
-- ============================================
CREATE OR REPLACE FUNCTION public.generar_codigo_cupon()
RETURNS VARCHAR(50)
LANGUAGE plpgsql
AS $$
DECLARE
  v_codigo VARCHAR(50);
  v_existe BOOLEAN;
BEGIN
  LOOP
    -- Generar código alfanumérico de 8 caracteres
    v_codigo := 'CUP-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));

    -- Verificar que no existe
    SELECT EXISTS (
      SELECT 1 FROM public.cupones_regalos WHERE codigo = v_codigo
    ) INTO v_existe;

    EXIT WHEN NOT v_existe;
  END LOOP;

  RETURN v_codigo;
END;
$$;

COMMIT;
