-- ============================================
-- MEJORA: REGALOS CONCRETOS Y MILESTONES DE REFERIDOS
-- ============================================
-- Date: 2025-11-22
-- Description: Añade soporte para regalos concretos (café gratis, muestra de perfume, etc.)
--              y sistema de milestones para referidos (invita X amigos = regalo Y)

-- ============================================
-- 1. Tabla de catálogo de regalos concretos
-- ============================================
CREATE TABLE IF NOT EXISTS public.regalos_catalogo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,

  -- Información del regalo
  nombre VARCHAR(100) NOT NULL, -- Ej: "Café gratis", "Muestra de perfume", "Descuento 20%"
  descripcion TEXT, -- Descripción detallada
  icono VARCHAR(50) DEFAULT 'gift', -- Nombre del icono (lucide-react)
  imagen_url TEXT, -- URL de imagen opcional

  -- Tipo de regalo
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('producto', 'descuento', 'servicio', 'puntos')),

  -- Detalles según tipo (JSON flexible)
  detalles JSONB DEFAULT '{}'::jsonb,
  -- Ejemplos:
  -- tipo 'producto': { "producto": "Café Americano", "cantidad": 1, "valor_aprox": "2.50€" }
  -- tipo 'descuento': { "porcentaje": 20, "monto_fijo": null, "min_compra": 10 }
  -- tipo 'servicio': { "servicio": "Masaje 15min", "duracion_min": 15 }
  -- tipo 'puntos': { "puntos": 100 }

  -- Instrucciones de canje
  instrucciones_canje TEXT, -- "Presenta este cupón en caja", "Muestra el QR al personal", etc.
  codigo_generado BOOLEAN DEFAULT false, -- Si genera código único al canjear
  requiere_validacion_staff BOOLEAN DEFAULT true, -- Si necesita que el staff lo marque como usado

  -- Validez
  dias_validez INTEGER, -- Días que dura el cupón (null = sin límite)
  activo BOOLEAN DEFAULT true,

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_regalos_catalogo_tienda ON public.regalos_catalogo(id_tienda);
CREATE INDEX idx_regalos_catalogo_tipo ON public.regalos_catalogo(tipo);
CREATE INDEX idx_regalos_catalogo_activo ON public.regalos_catalogo(activo);

COMMENT ON TABLE public.regalos_catalogo IS 'Catálogo de regalos concretos que las tiendas pueden ofrecer';
COMMENT ON COLUMN public.regalos_catalogo.tipo IS 'Tipo: producto (café, muestra), descuento (%), servicio (masaje), puntos';
COMMENT ON COLUMN public.regalos_catalogo.detalles IS 'JSON con información específica según el tipo de regalo';

-- ============================================
-- 2. Tabla de cupones de regalos otorgados a clientes
-- ============================================
CREATE TABLE IF NOT EXISTS public.cupones_regalos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  id_regalo UUID NOT NULL REFERENCES public.regalos_catalogo(id) ON DELETE CASCADE,

  -- Código único del cupón
  codigo VARCHAR(50) UNIQUE NOT NULL,

  -- Origen del cupón
  origen VARCHAR(50) NOT NULL CHECK (origen IN ('bienvenida', 'referido', 'milestone', 'promocion', 'manual')),
  origen_detalles JSONB, -- { "milestone": "invitar_6_amigos", "referidos_count": 6 }

  -- Estado
  estado VARCHAR(50) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'usado', 'expirado', 'cancelado')),
  fecha_otorgado TIMESTAMPTZ DEFAULT NOW(),
  fecha_expiracion TIMESTAMPTZ,
  fecha_usado TIMESTAMPTZ,
  usado_por_usuario_id UUID REFERENCES public.usuarios_tienda(id),

  -- Tracking
  notificado_email BOOLEAN DEFAULT false,
  notificado_sms BOOLEAN DEFAULT false,
  visto_por_cliente BOOLEAN DEFAULT false,
  fecha_visto TIMESTAMPTZ,

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_cupones_regalos_cliente ON public.cupones_regalos(id_cliente);
CREATE INDEX idx_cupones_regalos_tienda ON public.cupones_regalos(id_tienda);
CREATE INDEX idx_cupones_regalos_codigo ON public.cupones_regalos(codigo);
CREATE INDEX idx_cupones_regalos_estado ON public.cupones_regalos(estado);
CREATE INDEX idx_cupones_regalos_origen ON public.cupones_regalos(origen);

COMMENT ON TABLE public.cupones_regalos IS 'Cupones de regalos otorgados a clientes';
COMMENT ON COLUMN public.cupones_regalos.origen IS 'De dónde viene: bienvenida, referido, milestone, promocion, manual';

-- ============================================
-- 3. Tabla de milestones de referidos
-- ============================================
CREATE TABLE IF NOT EXISTS public.milestones_referidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,

  -- Configuración del milestone
  nombre VARCHAR(100) NOT NULL, -- Ej: "Invita 6 amigos"
  descripcion TEXT, -- "Invita a 6 amigos y llévate un café gratis"
  cantidad_referidos INTEGER NOT NULL, -- 6
  orden INTEGER DEFAULT 0, -- Para ordenar visualmente (1, 2, 3...)

  -- Recompensa
  tipo_recompensa VARCHAR(50) NOT NULL CHECK (tipo_recompensa IN ('regalo_concreto', 'puntos', 'ambos')),
  id_regalo UUID REFERENCES public.regalos_catalogo(id) ON DELETE SET NULL,
  puntos INTEGER DEFAULT 0,

  -- Estado
  activo BOOLEAN DEFAULT true,

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_milestones_tienda ON public.milestones_referidos(id_tienda);
CREATE INDEX idx_milestones_activo ON public.milestones_referidos(activo);
CREATE INDEX idx_milestones_cantidad ON public.milestones_referidos(cantidad_referidos);

COMMENT ON TABLE public.milestones_referidos IS 'Milestones (objetivos) del programa de referidos con recompensas';
COMMENT ON COLUMN public.milestones_referidos.cantidad_referidos IS 'Número de referidos necesarios para desbloquear';
COMMENT ON COLUMN public.milestones_referidos.tipo_recompensa IS 'regalo_concreto, puntos o ambos';

-- ============================================
-- 4. Tabla de milestones alcanzados por clientes
-- ============================================
CREATE TABLE IF NOT EXISTS public.milestones_alcanzados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  id_milestone UUID NOT NULL REFERENCES public.milestones_referidos(id) ON DELETE CASCADE,
  id_cupon UUID REFERENCES public.cupones_regalos(id) ON DELETE SET NULL,

  -- Tracking
  fecha_alcanzado TIMESTAMPTZ DEFAULT NOW(),
  referidos_count INTEGER NOT NULL, -- Cuántos referidos tenía cuando lo alcanzó
  recompensa_entregada BOOLEAN DEFAULT false,
  puntos_otorgados INTEGER DEFAULT 0,

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW(),

  -- Un cliente solo puede alcanzar un milestone una vez
  CONSTRAINT unique_cliente_milestone UNIQUE (id_cliente, id_milestone)
);

-- Índices
CREATE INDEX idx_milestones_alcanzados_cliente ON public.milestones_alcanzados(id_cliente);
CREATE INDEX idx_milestones_alcanzados_milestone ON public.milestones_alcanzados(id_milestone);
CREATE INDEX idx_milestones_alcanzados_fecha ON public.milestones_alcanzados(fecha_alcanzado);

COMMENT ON TABLE public.milestones_alcanzados IS 'Registro de milestones de referidos alcanzados por clientes';

-- ============================================
-- 5. Actualizar tabla tiendas - nuevo tipo de regalo
-- ============================================
-- Añadir opción de regalo concreto para regalo de bienvenida
ALTER TABLE public.tiendas
  ADD COLUMN IF NOT EXISTS regalo_bienvenida_id_regalo UUID REFERENCES public.regalos_catalogo(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.tiendas.regalo_bienvenida_id_regalo IS 'ID del regalo concreto a otorgar como bienvenida (alternativa a puntos/cupón)';

-- ============================================
-- 6. Función: Generar código único de cupón
-- ============================================
CREATE OR REPLACE FUNCTION public.generar_codigo_cupon()
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
  v_codigo VARCHAR(50);
  v_existe BOOLEAN;
BEGIN
  LOOP
    -- Generar código: CUPON-XXXXXXXX (8 caracteres alfanuméricos)
    v_codigo := 'CUPON-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));

    -- Verificar si existe
    SELECT EXISTS (
      SELECT 1 FROM public.cupones_regalos WHERE codigo = v_codigo
    ) INTO v_existe;

    EXIT WHEN NOT v_existe;
  END LOOP;

  RETURN v_codigo;
END;
$$;

-- ============================================
-- 7. Función: Otorgar regalo concreto
-- ============================================
CREATE OR REPLACE FUNCTION public.otorgar_regalo_concreto(
  p_cliente_id UUID,
  p_regalo_id UUID,
  p_origen VARCHAR DEFAULT 'manual',
  p_origen_detalles JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cupon_id UUID;
  v_codigo VARCHAR(50);
  v_tienda_id UUID;
  v_dias_validez INTEGER;
  v_fecha_expiracion TIMESTAMPTZ;
BEGIN
  -- Obtener tienda y configuración del regalo
  SELECT r.id_tienda, r.dias_validez
  INTO v_tienda_id, v_dias_validez
  FROM public.regalos_catalogo r
  WHERE r.id = p_regalo_id;

  IF v_tienda_id IS NULL THEN
    RAISE EXCEPTION 'Regalo no encontrado';
  END IF;

  -- Generar código único
  v_codigo := public.generar_codigo_cupon();

  -- Calcular fecha de expiración
  IF v_dias_validez IS NOT NULL THEN
    v_fecha_expiracion := NOW() + (v_dias_validez || ' days')::INTERVAL;
  END IF;

  -- Crear cupón
  INSERT INTO public.cupones_regalos (
    id_cliente,
    id_tienda,
    id_regalo,
    codigo,
    origen,
    origen_detalles,
    fecha_expiracion
  ) VALUES (
    p_cliente_id,
    v_tienda_id,
    p_regalo_id,
    v_codigo,
    p_origen,
    p_origen_detalles,
    v_fecha_expiracion
  )
  RETURNING id INTO v_cupon_id;

  RETURN v_cupon_id;
END;
$$;

COMMENT ON FUNCTION public.otorgar_regalo_concreto IS 'Otorga un regalo concreto a un cliente, genera cupón con código único';

-- ============================================
-- 8. Función: Verificar y otorgar milestones alcanzados
-- ============================================
CREATE OR REPLACE FUNCTION public.verificar_milestones_referidos(
  p_cliente_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_referidos INTEGER;
  v_tienda_id UUID;
  v_milestone RECORD;
  v_cupon_id UUID;
  v_milestones_nuevos JSONB := '[]'::jsonb;
  v_milestone_info JSONB;
BEGIN
  -- Obtener tienda del cliente y total de referidos
  SELECT id_tienda, total_referidos
  INTO v_tienda_id, v_total_referidos
  FROM public.clientes
  WHERE id = p_cliente_id;

  -- Buscar milestones alcanzados pero no registrados
  FOR v_milestone IN
    SELECT m.*
    FROM public.milestones_referidos m
    WHERE m.id_tienda = v_tienda_id
      AND m.activo = true
      AND m.cantidad_referidos <= v_total_referidos
      AND NOT EXISTS (
        SELECT 1
        FROM public.milestones_alcanzados ma
        WHERE ma.id_cliente = p_cliente_id
          AND ma.id_milestone = m.id
      )
    ORDER BY m.cantidad_referidos ASC
  LOOP
    -- Otorgar recompensa según tipo
    v_cupon_id := NULL;

    IF v_milestone.tipo_recompensa = 'regalo_concreto' OR v_milestone.tipo_recompensa = 'ambos' THEN
      IF v_milestone.id_regalo IS NOT NULL THEN
        -- Otorgar regalo concreto
        v_cupon_id := public.otorgar_regalo_concreto(
          p_cliente_id,
          v_milestone.id_regalo,
          'milestone',
          jsonb_build_object(
            'milestone_id', v_milestone.id,
            'milestone_nombre', v_milestone.nombre,
            'referidos_count', v_total_referidos
          )
        );
      END IF;
    END IF;

    IF v_milestone.tipo_recompensa = 'puntos' OR v_milestone.tipo_recompensa = 'ambos' THEN
      IF v_milestone.puntos > 0 THEN
        -- Otorgar puntos
        UPDATE public.clientes
        SET puntos_totales = COALESCE(puntos_totales, 0) + v_milestone.puntos
        WHERE id = p_cliente_id;
      END IF;
    END IF;

    -- Registrar milestone alcanzado
    INSERT INTO public.milestones_alcanzados (
      id_cliente,
      id_milestone,
      id_cupon,
      referidos_count,
      recompensa_entregada,
      puntos_otorgados
    ) VALUES (
      p_cliente_id,
      v_milestone.id,
      v_cupon_id,
      v_total_referidos,
      true,
      COALESCE(v_milestone.puntos, 0)
    );

    -- Añadir a array de milestones nuevos
    v_milestone_info := jsonb_build_object(
      'milestone_id', v_milestone.id,
      'nombre', v_milestone.nombre,
      'descripcion', v_milestone.descripcion,
      'cupon_id', v_cupon_id,
      'puntos', v_milestone.puntos
    );

    v_milestones_nuevos := v_milestones_nuevos || v_milestone_info;
  END LOOP;

  RETURN jsonb_build_object(
    'milestones_alcanzados', v_milestones_nuevos,
    'total', jsonb_array_length(v_milestones_nuevos)
  );
END;
$$;

COMMENT ON FUNCTION public.verificar_milestones_referidos IS 'Verifica si el cliente alcanzó nuevos milestones y otorga recompensas';

-- ============================================
-- 9. Trigger: Verificar milestones cuando cambia total_referidos
-- ============================================
CREATE OR REPLACE FUNCTION public.trigger_verificar_milestones()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Solo verificar si total_referidos aumentó
  IF NEW.total_referidos > OLD.total_referidos THEN
    PERFORM public.verificar_milestones_referidos(NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

-- Crear trigger (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_verificar_milestones_referidos'
  ) THEN
    CREATE TRIGGER trigger_verificar_milestones_referidos
      AFTER UPDATE OF total_referidos ON public.clientes
      FOR EACH ROW
      EXECUTE FUNCTION public.trigger_verificar_milestones();
  END IF;
END $$;

-- ============================================
-- 10. Función: Marcar cupón como usado
-- ============================================
CREATE OR REPLACE FUNCTION public.marcar_cupon_usado(
  p_cupon_id UUID,
  p_usuario_staff_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cupon RECORD;
BEGIN
  -- Obtener cupón
  SELECT * INTO v_cupon
  FROM public.cupones_regalos
  WHERE id = p_cupon_id;

  IF v_cupon IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cupón no encontrado');
  END IF;

  IF v_cupon.estado != 'disponible' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cupón ya fue usado o está expirado');
  END IF;

  -- Verificar expiración
  IF v_cupon.fecha_expiracion IS NOT NULL AND v_cupon.fecha_expiracion < NOW() THEN
    UPDATE public.cupones_regalos
    SET estado = 'expirado', actualizado_en = NOW()
    WHERE id = p_cupon_id;

    RETURN jsonb_build_object('success', false, 'error', 'Cupón expirado');
  END IF;

  -- Marcar como usado
  UPDATE public.cupones_regalos
  SET
    estado = 'usado',
    fecha_usado = NOW(),
    usado_por_usuario_id = p_usuario_staff_id,
    actualizado_en = NOW()
  WHERE id = p_cupon_id;

  RETURN jsonb_build_object(
    'success', true,
    'mensaje', 'Cupón marcado como usado exitosamente'
  );
END;
$$;

COMMENT ON FUNCTION public.marcar_cupon_usado IS 'Marca un cupón como usado por el staff';

-- ============================================
-- 11. Vista: Cupones activos por cliente
-- ============================================
CREATE OR REPLACE VIEW public.vista_cupones_cliente AS
SELECT
  c.id,
  c.id_cliente,
  c.id_tienda,
  c.codigo,
  c.estado,
  c.origen,
  c.fecha_otorgado,
  c.fecha_expiracion,
  c.fecha_usado,
  r.nombre as regalo_nombre,
  r.descripcion as regalo_descripcion,
  r.tipo as regalo_tipo,
  r.detalles as regalo_detalles,
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
-- 12. RLS Policies
-- ============================================
ALTER TABLE public.regalos_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupones_regalos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones_referidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones_alcanzados ENABLE ROW LEVEL SECURITY;

-- Policy: Admin puede ver todos los regalos de su tienda
CREATE POLICY "regalos_catalogo_select_policy"
  ON public.regalos_catalogo FOR SELECT
  USING (id_tienda = current_setting('app.current_tenant_id')::uuid);

-- Policy: Clientes pueden ver sus propios cupones
CREATE POLICY "cupones_regalos_cliente_select_policy"
  ON public.cupones_regalos FOR SELECT
  USING (true); -- Verificación adicional en backend

-- Policy: Admin puede ver milestones de su tienda
CREATE POLICY "milestones_select_policy"
  ON public.milestones_referidos FOR SELECT
  USING (id_tienda = current_setting('app.current_tenant_id')::uuid);

COMMIT;
