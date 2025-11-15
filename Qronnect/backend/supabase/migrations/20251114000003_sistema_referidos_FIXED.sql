-- ============================================
-- SISTEMA DE REFERIDOS - VERSION CORREGIDA
-- ============================================
-- Date: 2025-11-15
-- Description: Sistema completo de referidos con códigos personales, QR y recompensas

-- ============================================
-- 1. Tabla: programas_referidos
-- ============================================
CREATE TABLE IF NOT EXISTS public.programas_referidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,

  -- Configuración del programa
  activo BOOLEAN DEFAULT true,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,

  -- Recompensas
  puntos_por_referido INTEGER DEFAULT 0,
  recompensas JSONB DEFAULT '[]'::jsonb, -- [{ objetivo: 5, tipo: 'puntos', valor: 500 }]

  -- Vigencia
  vigencia_desde TIMESTAMPTZ DEFAULT NOW(),
  vigencia_hasta TIMESTAMPTZ,

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_programas_referidos_tienda ON public.programas_referidos(id_tienda);
CREATE INDEX IF NOT EXISTS idx_programas_referidos_activo ON public.programas_referidos(activo);

-- Índice único parcial: Solo un programa activo por tienda
CREATE UNIQUE INDEX IF NOT EXISTS unique_programa_activo_tienda
  ON public.programas_referidos(id_tienda)
  WHERE activo = true;

COMMENT ON TABLE public.programas_referidos IS 'Programas de referidos configurados por tienda';
COMMENT ON COLUMN public.programas_referidos.recompensas IS 'Array JSON de recompensas por objetivos alcanzados';

-- ============================================
-- 2. Extender tabla clientes con datos de referidos
-- ============================================
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS codigo_referido_personal VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS total_referidos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referido_por UUID REFERENCES public.clientes(id) ON DELETE SET NULL;

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_clientes_codigo_referido ON public.clientes(codigo_referido_personal) WHERE codigo_referido_personal IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clientes_referido_por ON public.clientes(referido_por) WHERE referido_por IS NOT NULL;

COMMENT ON COLUMN public.clientes.codigo_referido_personal IS 'Código único para que otros clientes lo usen como referido (ej: JUAN-A3F2)';
COMMENT ON COLUMN public.clientes.total_referidos IS 'Contador de cuántos amigos ha referido este cliente';
COMMENT ON COLUMN public.clientes.referido_por IS 'Cliente que refirió a este cliente';

-- ============================================
-- 3. Tabla: historial_referidos
-- ============================================
CREATE TABLE IF NOT EXISTS public.historial_referidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,

  -- Relaciones
  referidor_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  referido_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  programa_id UUID REFERENCES public.programas_referidos(id) ON DELETE SET NULL,

  -- Código usado
  codigo_usado VARCHAR(20) NOT NULL,

  -- Estado del referido
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'rechazado')),
  puntos_otorgados_referidor INTEGER DEFAULT 0,
  puntos_otorgados_referido INTEGER DEFAULT 0,

  -- Auditoría
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  fecha_completado TIMESTAMPTZ,
  notas TEXT,

  -- Constraint: Un cliente solo puede ser referido una vez por tienda
  CONSTRAINT unique_referido_tienda UNIQUE (id_tienda, referido_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_historial_referidos_tienda ON public.historial_referidos(id_tienda);
CREATE INDEX IF NOT EXISTS idx_historial_referidos_referidor ON public.historial_referidos(referidor_id);
CREATE INDEX IF NOT EXISTS idx_historial_referidos_referido ON public.historial_referidos(referido_id);
CREATE INDEX IF NOT EXISTS idx_historial_referidos_estado ON public.historial_referidos(estado);

COMMENT ON TABLE public.historial_referidos IS 'Registro de todos los referidos realizados';

-- ============================================
-- 4. Vista: vista_referidos_dashboard
-- ============================================
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
  pr.nombre AS programa_nombre
FROM public.historial_referidos hr
  LEFT JOIN public.clientes c_referidor ON hr.referidor_id = c_referidor.id
  LEFT JOIN public.clientes c_referido ON hr.referido_id = c_referido.id
  LEFT JOIN public.programas_referidos pr ON hr.programa_id = pr.id;

COMMENT ON VIEW public.vista_referidos_dashboard IS 'Vista optimizada para dashboard de referidos con información completa';

-- ============================================
-- 5. Función: registrar_referido
-- ============================================
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
  SELECT id, puntos_por_referido INTO v_programa_id, v_puntos_referidor
  FROM public.programas_referidos
  WHERE id_tienda = p_tienda_id
    AND activo = true
    AND (vigencia_desde IS NULL OR vigencia_desde <= NOW())
    AND (vigencia_hasta IS NULL OR vigencia_hasta >= NOW())
  LIMIT 1;

  -- Si no hay programa, usar 0 puntos pero registrar igual
  v_puntos_referidor := COALESCE(v_puntos_referidor, 0);
  v_puntos_referido := v_puntos_referidor; -- Mismo bonus para referido

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

COMMENT ON FUNCTION public.registrar_referido IS 'Registra un nuevo referido y otorga puntos';

-- ============================================
-- 6. Función: progreso_referidos_cliente
-- ============================================
CREATE OR REPLACE FUNCTION public.progreso_referidos_cliente(
  p_cliente_id UUID,
  p_tienda_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_codigo VARCHAR(20);
  v_total_referidos INTEGER;
  v_programa JSONB;
  v_proxima_recompensa JSONB;
BEGIN
  -- Obtener datos del cliente
  SELECT codigo_referido_personal, total_referidos
  INTO v_codigo, v_total_referidos
  FROM public.clientes
  WHERE id = p_cliente_id AND id_tienda = p_tienda_id;

  -- Obtener programa activo
  SELECT jsonb_build_object(
    'id', id,
    'nombre', nombre,
    'descripcion', descripcion,
    'puntos_por_referido', puntos_por_referido,
    'recompensas', recompensas
  ) INTO v_programa
  FROM public.programas_referidos
  WHERE id_tienda = p_tienda_id
    AND activo = true
  LIMIT 1;

  -- TODO: Calcular próxima recompensa basado en v_total_referidos y v_programa.recompensas

  RETURN jsonb_build_object(
    'codigo_personal', v_codigo,
    'total_referidos', v_total_referidos,
    'programa', v_programa,
    'proxima_recompensa', v_proxima_recompensa
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.progreso_referidos_cliente IS 'Obtiene el progreso de referidos de un cliente';

-- ============================================
-- 7. Función: estadisticas_referidos
-- ============================================
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
  SELECT COALESCE(SUM(puntos_otorgados_referidor + puntos_otorgados_referido), 0)
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

COMMENT ON FUNCTION public.estadisticas_referidos IS 'Obtiene estadísticas generales de referidos para una tienda';

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================
