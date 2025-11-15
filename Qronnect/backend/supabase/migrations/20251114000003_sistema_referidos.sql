-- ============================================
-- SISTEMA DE REFERIDOS
-- ============================================
-- Date: 2025-11-14
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
  actualizado_en TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Solo un programa activo por tienda
  CONSTRAINT unique_programa_activo_tienda UNIQUE (id_tienda, activo)
    WHERE activo = true
);

-- Índices
CREATE INDEX idx_programas_referidos_tienda ON public.programas_referidos(id_tienda);
CREATE INDEX idx_programas_referidos_activo ON public.programas_referidos(activo);

COMMENT ON TABLE public.programas_referidos IS 'Programas de referidos configurados por tienda';
COMMENT ON COLUMN public.programas_referidos.recompensas IS 'Array JSON de recompensas por objetivos alcanzados';

-- ============================================
-- 2. Extender tabla clientes con datos de referidos
-- ============================================
ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS codigo_referido_personal VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS total_referidos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referido_por UUID REFERENCES public.clientes(id) ON DELETE SET NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_clientes_codigo_referido ON public.clientes(codigo_referido_personal);
CREATE INDEX IF NOT EXISTS idx_clientes_referido_por ON public.clientes(referido_por);

COMMENT ON COLUMN public.clientes.codigo_referido_personal IS 'Código único de referido del cliente';
COMMENT ON COLUMN public.clientes.total_referidos IS 'Contador de clientes referidos exitosamente';
COMMENT ON COLUMN public.clientes.referido_por IS 'ID del cliente que lo refirió (si aplica)';

-- ============================================
-- 3. Tabla: referidos
-- ============================================
CREATE TABLE IF NOT EXISTS public.referidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,

  -- Relaciones
  cliente_referidor_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  cliente_referido_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,

  -- Tracking
  codigo_referido VARCHAR(50) NOT NULL,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),

  -- Recompensas
  recompensa_otorgada BOOLEAN DEFAULT false,
  puntos_otorgados INTEGER DEFAULT 0,
  fecha_recompensa TIMESTAMPTZ,
  tipo_recompensa VARCHAR(50), -- 'puntos', 'cupon', 'promocion'
  recompensa_detalles JSONB,

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Un cliente solo puede ser referido una vez
  CONSTRAINT unique_cliente_referido UNIQUE (cliente_referido_id)
);

-- Índices
CREATE INDEX idx_referidos_tienda ON public.referidos(id_tienda);
CREATE INDEX idx_referidos_referidor ON public.referidos(cliente_referidor_id);
CREATE INDEX idx_referidos_referido ON public.referidos(cliente_referido_id);
CREATE INDEX idx_referidos_codigo ON public.referidos(codigo_referido);
CREATE INDEX idx_referidos_fecha ON public.referidos(fecha_registro);

COMMENT ON TABLE public.referidos IS 'Registro de todos los referidos entre clientes';

-- ============================================
-- 4. Función: Generar código de referido único
-- ============================================
CREATE OR REPLACE FUNCTION public.generar_codigo_referido(
  p_cliente_id UUID,
  p_nombre VARCHAR
)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
  v_codigo VARCHAR(20);
  v_nombre_limpio VARCHAR(10);
  v_random VARCHAR(6);
  v_existe BOOLEAN;
BEGIN
  -- Limpiar nombre (solo letras, máximo 6 caracteres)
  v_nombre_limpio := UPPER(REGEXP_REPLACE(p_nombre, '[^a-zA-Z]', '', 'g'));
  v_nombre_limpio := SUBSTRING(v_nombre_limpio FROM 1 FOR 6);

  -- Si el nombre está vacío, usar un placeholder
  IF v_nombre_limpio = '' THEN
    v_nombre_limpio := 'USER';
  END IF;

  -- Generar código hasta encontrar uno único
  LOOP
    -- Generar parte aleatoria (4 caracteres alfanuméricos)
    v_random := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || p_cliente_id::TEXT) FROM 1 FOR 4));

    -- Combinar: NOMBRE-XXXX
    v_codigo := v_nombre_limpio || '-' || v_random;

    -- Verificar si existe
    SELECT EXISTS (
      SELECT 1 FROM public.clientes WHERE codigo_referido_personal = v_codigo
    ) INTO v_existe;

    -- Si no existe, salir del loop
    EXIT WHEN NOT v_existe;
  END LOOP;

  RETURN v_codigo;
END;
$$;

COMMENT ON FUNCTION public.generar_codigo_referido IS 'Genera un código de referido único basado en el nombre del cliente';

-- ============================================
-- 5. Trigger: Asignar código de referido automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.trigger_asignar_codigo_referido()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_codigo VARCHAR(20);
BEGIN
  -- Solo si no tiene código asignado
  IF NEW.codigo_referido_personal IS NULL THEN
    v_codigo := public.generar_codigo_referido(NEW.id, NEW.nombre);
    NEW.codigo_referido_personal := v_codigo;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_asignar_codigo_referido ON public.clientes;

CREATE TRIGGER trigger_asignar_codigo_referido
  BEFORE INSERT ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_asignar_codigo_referido();

-- ============================================
-- 6. Función: Registrar referido y otorgar recompensas
-- ============================================
CREATE OR REPLACE FUNCTION public.registrar_referido(
  p_codigo_referido VARCHAR,
  p_nuevo_cliente_id UUID,
  p_tienda_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_referidor RECORD;
  v_programa RECORD;
  v_puntos_otorgar INTEGER;
  v_resultado JSONB;
BEGIN
  -- Buscar al cliente referidor por código
  SELECT id, nombre, total_referidos
  INTO v_referidor
  FROM public.clientes
  WHERE codigo_referido_personal = p_codigo_referido
    AND id_tienda = p_tienda_id;

  -- Validar que existe el referidor
  IF v_referidor.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Código de referido no válido'
    );
  END IF;

  -- Validar que no se está auto-refiriendo
  IF v_referidor.id = p_nuevo_cliente_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'No puedes usar tu propio código de referido'
    );
  END IF;

  -- Validar que el nuevo cliente no fue referido antes
  IF EXISTS (
    SELECT 1 FROM public.referidos WHERE cliente_referido_id = p_nuevo_cliente_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Este cliente ya fue referido por alguien'
    );
  END IF;

  -- Obtener programa de referidos activo
  SELECT id, puntos_por_referido, recompensas
  INTO v_programa
  FROM public.programas_referidos
  WHERE id_tienda = p_tienda_id
    AND activo = true
    AND (vigencia_hasta IS NULL OR vigencia_hasta > NOW())
  LIMIT 1;

  -- Si no hay programa activo, continuar sin otorgar puntos
  IF v_programa.id IS NULL THEN
    v_puntos_otorgar := 0;
  ELSE
    v_puntos_otorgar := v_programa.puntos_por_referido;
  END IF;

  -- Actualizar cliente referido con la relación
  UPDATE public.clientes
  SET referido_por = v_referidor.id
  WHERE id = p_nuevo_cliente_id;

  -- Incrementar contador del referidor
  UPDATE public.clientes
  SET total_referidos = total_referidos + 1
  WHERE id = v_referidor.id;

  -- Registrar en tabla de referidos
  INSERT INTO public.referidos (
    id_tienda,
    cliente_referidor_id,
    cliente_referido_id,
    codigo_referido,
    recompensa_otorgada,
    puntos_otorgados,
    fecha_recompensa,
    tipo_recompensa
  ) VALUES (
    p_tienda_id,
    v_referidor.id,
    p_nuevo_cliente_id,
    p_codigo_referido,
    v_puntos_otorgar > 0,
    v_puntos_otorgar,
    CASE WHEN v_puntos_otorgar > 0 THEN NOW() ELSE NULL END,
    CASE WHEN v_puntos_otorgar > 0 THEN 'puntos' ELSE NULL END
  );

  -- Otorgar puntos al referidor si aplica
  IF v_puntos_otorgar > 0 THEN
    UPDATE public.clientes
    SET puntos_totales = COALESCE(puntos_totales, 0) + v_puntos_otorgar
    WHERE id = v_referidor.id;
  END IF;

  -- Verificar si alcanzó un objetivo de recompensa
  PERFORM public.verificar_objetivos_referidos(v_referidor.id, p_tienda_id);

  v_resultado := jsonb_build_object(
    'success', true,
    'referidor_id', v_referidor.id,
    'referidor_nombre', v_referidor.nombre,
    'puntos_otorgados', v_puntos_otorgar,
    'total_referidos', v_referidor.total_referidos + 1
  );

  RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION public.registrar_referido IS 'Registra un nuevo referido y otorga puntos al referidor';

-- ============================================
-- 7. Función: Verificar objetivos de referidos alcanzados
-- ============================================
CREATE OR REPLACE FUNCTION public.verificar_objetivos_referidos(
  p_cliente_id UUID,
  p_tienda_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_referidos INTEGER;
  v_programa RECORD;
  v_recompensa JSONB;
  v_objetivo INTEGER;
  v_tipo VARCHAR;
  v_valor INTEGER;
BEGIN
  -- Obtener total de referidos del cliente
  SELECT total_referidos INTO v_total_referidos
  FROM public.clientes
  WHERE id = p_cliente_id;

  -- Obtener programa activo
  SELECT id, recompensas INTO v_programa
  FROM public.programas_referidos
  WHERE id_tienda = p_tienda_id
    AND activo = true
  LIMIT 1;

  -- Si no hay programa, salir
  IF v_programa.id IS NULL OR v_programa.recompensas IS NULL THEN
    RETURN;
  END IF;

  -- Recorrer recompensas y verificar objetivos
  FOR v_recompensa IN SELECT * FROM jsonb_array_elements(v_programa.recompensas)
  LOOP
    v_objetivo := (v_recompensa->>'objetivo')::INTEGER;

    -- Si alcanzó el objetivo exacto
    IF v_total_referidos = v_objetivo THEN
      v_tipo := v_recompensa->>'tipo';
      v_valor := (v_recompensa->>'valor')::INTEGER;

      -- Otorgar recompensa según tipo
      IF v_tipo = 'puntos' THEN
        UPDATE public.clientes
        SET puntos_totales = COALESCE(puntos_totales, 0) + v_valor
        WHERE id = p_cliente_id;

        -- Registrar en historial
        -- (Aquí se podría crear una tabla de recompensas_objetivos_referidos)
      END IF;
    END IF;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.verificar_objetivos_referidos IS 'Verifica si un cliente alcanzó objetivos de referidos y otorga recompensas';

-- ============================================
-- 8. Vista: Dashboard de referidos
-- ============================================
CREATE OR REPLACE VIEW public.vista_referidos_dashboard AS
SELECT
  r.id,
  r.id_tienda,
  r.codigo_referido,
  r.fecha_registro,

  -- Datos del referidor
  cr.id as referidor_id,
  cr.nombre as referidor_nombre,
  cr.email as referidor_email,
  cr.total_referidos as referidor_total_referidos,

  -- Datos del referido
  cd.id as referido_id,
  cd.nombre as referido_nombre,
  cd.email as referido_email,

  -- Recompensa
  r.recompensa_otorgada,
  r.puntos_otorgados,
  r.fecha_recompensa,
  r.tipo_recompensa,

  r.creado_en
FROM public.referidos r
INNER JOIN public.clientes cr ON r.cliente_referidor_id = cr.id
INNER JOIN public.clientes cd ON r.cliente_referido_id = cd.id
ORDER BY r.creado_en DESC;

COMMENT ON VIEW public.vista_referidos_dashboard IS 'Vista completa de referidos para dashboard';

-- ============================================
-- 9. Función: Obtener estadísticas de referidos
-- ============================================
CREATE OR REPLACE FUNCTION public.estadisticas_referidos(p_tienda_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_referidos INTEGER;
  v_este_mes INTEGER;
  v_top_referidores JSONB;
  v_resultado JSONB;
BEGIN
  -- Total de referidos histórico
  SELECT COUNT(*) INTO v_total_referidos
  FROM public.referidos
  WHERE id_tienda = p_tienda_id;

  -- Referidos este mes
  SELECT COUNT(*) INTO v_este_mes
  FROM public.referidos
  WHERE id_tienda = p_tienda_id
    AND fecha_registro >= DATE_TRUNC('month', NOW());

  -- Top 5 referidores
  SELECT jsonb_agg(
    jsonb_build_object(
      'cliente_id', id,
      'nombre', nombre,
      'total_referidos', total_referidos
    )
  )
  INTO v_top_referidores
  FROM (
    SELECT id, nombre, total_referidos
    FROM public.clientes
    WHERE id_tienda = p_tienda_id
      AND total_referidos > 0
    ORDER BY total_referidos DESC
    LIMIT 5
  ) sub;

  v_resultado := jsonb_build_object(
    'total_referidos', v_total_referidos,
    'referidos_este_mes', v_este_mes,
    'top_referidores', COALESCE(v_top_referidores, '[]'::jsonb)
  );

  RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION public.estadisticas_referidos IS 'Obtiene estadísticas del programa de referidos';

-- ============================================
-- 10. Función: Obtener progreso de referidos de un cliente
-- ============================================
CREATE OR REPLACE FUNCTION public.progreso_referidos_cliente(
  p_cliente_id UUID,
  p_tienda_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_referidos INTEGER;
  v_codigo_personal VARCHAR(20);
  v_programa RECORD;
  v_proxima_recompensa JSONB;
  v_resultado JSONB;
BEGIN
  -- Obtener datos del cliente
  SELECT total_referidos, codigo_referido_personal
  INTO v_total_referidos, v_codigo_personal
  FROM public.clientes
  WHERE id = p_cliente_id;

  -- Obtener programa activo
  SELECT id, nombre, recompensas
  INTO v_programa
  FROM public.programas_referidos
  WHERE id_tienda = p_tienda_id
    AND activo = true
  LIMIT 1;

  -- Buscar próxima recompensa
  IF v_programa.recompensas IS NOT NULL THEN
    SELECT obj
    INTO v_proxima_recompensa
    FROM jsonb_array_elements(v_programa.recompensas) obj
    WHERE (obj->>'objetivo')::INTEGER > v_total_referidos
    ORDER BY (obj->>'objetivo')::INTEGER ASC
    LIMIT 1;
  END IF;

  v_resultado := jsonb_build_object(
    'codigo_personal', v_codigo_personal,
    'total_referidos', v_total_referidos,
    'programa_nombre', v_programa.nombre,
    'proxima_recompensa', v_proxima_recompensa
  );

  RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION public.progreso_referidos_cliente IS 'Obtiene el progreso de referidos de un cliente específico';

-- ============================================
-- 11. RLS - Deshabilitar para usar service role
-- ============================================
ALTER TABLE public.programas_referidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.referidos DISABLE ROW LEVEL SECURITY;

COMMIT;
