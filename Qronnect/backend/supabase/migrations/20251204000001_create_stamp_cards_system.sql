-- ============================================
-- SISTEMA DE TARJETAS DE SELLOS (STAMP CARDS)
-- ============================================
-- Date: 2025-12-04
-- Description: Sistema de fidelización por sellos/visitas
--              Ej: 10 visitas = 1 café gratis
-- ============================================

-- ============================================
-- 1. Tabla: programas_sellos
-- Configuración de programas de sellos por tienda
-- ============================================
CREATE TABLE IF NOT EXISTS public.programas_sellos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,

  -- Información básica
  nombre VARCHAR(100) NOT NULL, -- "Cafetería - 10 cafés"
  descripcion TEXT, -- "Compra 10 cafés y llévate el 11º gratis"
  icono VARCHAR(50) DEFAULT 'stamp', -- Icono para mostrar (lucide-react)
  imagen_url TEXT, -- Imagen opcional del programa
  color VARCHAR(7) DEFAULT '#3B82F6', -- Color hex para la tarjeta

  -- Configuración de sellos
  sellos_requeridos INTEGER NOT NULL CHECK (sellos_requeridos > 0), -- Cuántos sellos para completar

  -- Tipo de premio
  tipo_premio VARCHAR(50) NOT NULL CHECK (tipo_premio IN ('producto', 'descuento_porcentaje', 'descuento_fijo', 'puntos', 'texto')),

  -- Detalles del premio (JSON flexible según tipo)
  premio_detalles JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Ejemplos:
  -- tipo 'producto': { "nombre": "Café gratis", "descripcion": "Un café de cualquier tamaño" }
  -- tipo 'descuento_porcentaje': { "porcentaje": 20, "max_descuento": 10 }
  -- tipo 'descuento_fijo': { "monto": 5.00, "moneda": "EUR" }
  -- tipo 'puntos': { "puntos": 100 }
  -- tipo 'texto': { "texto": "Postre del día gratis", "instrucciones": "Válido de lunes a viernes" }

  -- Instrucciones de canje
  instrucciones_canje TEXT DEFAULT 'Presenta este cupón al personal para canjearlo',

  -- Configuración de validez del cupón generado
  dias_validez_cupon INTEGER DEFAULT 30, -- Días que dura el cupón una vez generado

  -- Restricciones y reglas
  sellos_por_dia_max INTEGER DEFAULT 1, -- Máximo de sellos por día (evitar fraude)
  requiere_compra_minima BOOLEAN DEFAULT false,
  compra_minima DECIMAL(10,2),

  -- Estado
  activo BOOLEAN DEFAULT true,
  visible_cliente BOOLEAN DEFAULT true, -- Si se muestra a los clientes

  -- Vigencia del programa
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  fecha_fin TIMESTAMPTZ, -- NULL = sin fin

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_programas_sellos_tienda ON public.programas_sellos(id_tienda);
CREATE INDEX idx_programas_sellos_activo ON public.programas_sellos(activo);
CREATE INDEX idx_programas_sellos_visible ON public.programas_sellos(visible_cliente);

COMMENT ON TABLE public.programas_sellos IS 'Programas de tarjetas de sellos configurados por tienda';
COMMENT ON COLUMN public.programas_sellos.sellos_requeridos IS 'Número de sellos necesarios para completar la tarjeta';
COMMENT ON COLUMN public.programas_sellos.tipo_premio IS 'Tipo de premio: producto, descuento_porcentaje, descuento_fijo, puntos, texto';
COMMENT ON COLUMN public.programas_sellos.premio_detalles IS 'JSON con detalles específicos del premio según el tipo';

-- ============================================
-- 2. Tabla: tarjetas_sellos_clientes
-- Tarjetas de sellos activas/completadas de cada cliente
-- ============================================
CREATE TABLE IF NOT EXISTS public.tarjetas_sellos_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  id_programa UUID NOT NULL REFERENCES public.programas_sellos(id) ON DELETE CASCADE,
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,

  -- Progreso
  sellos_actuales INTEGER DEFAULT 0 CHECK (sellos_actuales >= 0),
  sellos_objetivo INTEGER NOT NULL, -- Copia de sellos_requeridos al crear (por si cambia el programa)

  -- Estado de la tarjeta
  estado VARCHAR(50) DEFAULT 'activa' CHECK (estado IN ('activa', 'completada', 'canjeada', 'expirada', 'cancelada')),

  -- Fechas importantes
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  fecha_completada TIMESTAMPTZ, -- Cuando se llenó la tarjeta
  fecha_canjeada TIMESTAMPTZ, -- Cuando se canjeó el premio
  fecha_expiracion TIMESTAMPTZ, -- NULL = no expira

  -- Cupón generado al completar
  codigo_cupon VARCHAR(50) UNIQUE, -- Se genera automáticamente al completar
  cupon_canjeado BOOLEAN DEFAULT false,
  cupon_canjeado_por UUID REFERENCES public.usuarios_tienda(id), -- Usuario que validó el canje

  -- Tracking
  notificacion_enviada BOOLEAN DEFAULT false,
  visto_por_cliente BOOLEAN DEFAULT false,
  fecha_visto TIMESTAMPTZ,

  -- Auditoría
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tarjetas_sellos_cliente ON public.tarjetas_sellos_clientes(id_cliente);
CREATE INDEX idx_tarjetas_sellos_programa ON public.tarjetas_sellos_clientes(id_programa);
CREATE INDEX idx_tarjetas_sellos_tienda ON public.tarjetas_sellos_clientes(id_tienda);
CREATE INDEX idx_tarjetas_sellos_estado ON public.tarjetas_sellos_clientes(estado);
CREATE INDEX idx_tarjetas_sellos_codigo ON public.tarjetas_sellos_clientes(codigo_cupon) WHERE codigo_cupon IS NOT NULL;

COMMENT ON TABLE public.tarjetas_sellos_clientes IS 'Tarjetas de sellos de cada cliente (progreso individual)';
COMMENT ON COLUMN public.tarjetas_sellos_clientes.estado IS 'activa, completada, canjeada, expirada, cancelada';
COMMENT ON COLUMN public.tarjetas_sellos_clientes.codigo_cupon IS 'Código único generado al completar la tarjeta';

-- ============================================
-- 3. Tabla: sellos_otorgados
-- Registro de cada sello individual otorgado
-- ============================================
CREATE TABLE IF NOT EXISTS public.sellos_otorgados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tarjeta UUID NOT NULL REFERENCES public.tarjetas_sellos_clientes(id) ON DELETE CASCADE,
  id_cliente UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  id_programa UUID NOT NULL REFERENCES public.programas_sellos(id) ON DELETE CASCADE,

  -- Contexto del sello
  numero_sello INTEGER NOT NULL, -- 1, 2, 3... hasta sellos_objetivo

  -- Origen del sello (opcional)
  id_compra UUID REFERENCES public.compras(id) ON DELETE SET NULL, -- Si viene de una compra
  monto_compra DECIMAL(10,2), -- Monto de la compra asociada (si aplica)

  -- Quién lo otorgó
  otorgado_por UUID REFERENCES public.usuarios_tienda(id) ON DELETE SET NULL,

  -- Metadata
  notas TEXT, -- Notas adicionales
  metadata JSONB DEFAULT '{}'::jsonb, -- Datos adicionales flexibles

  -- Auditoría
  fecha_otorgado TIMESTAMPTZ DEFAULT NOW(),
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sellos_otorgados_tarjeta ON public.sellos_otorgados(id_tarjeta);
CREATE INDEX idx_sellos_otorgados_cliente ON public.sellos_otorgados(id_cliente);
CREATE INDEX idx_sellos_otorgados_tienda ON public.sellos_otorgados(id_tienda);
CREATE INDEX idx_sellos_otorgados_fecha ON public.sellos_otorgados(fecha_otorgado DESC);

COMMENT ON TABLE public.sellos_otorgados IS 'Registro individual de cada sello otorgado';
COMMENT ON COLUMN public.sellos_otorgados.numero_sello IS 'Número secuencial del sello (1, 2, 3...)';

-- ============================================
-- 4. Función: Generar código de cupón único
-- ============================================
CREATE OR REPLACE FUNCTION public.generar_codigo_cupon_sello()
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
  v_codigo VARCHAR(50);
  v_existe BOOLEAN;
BEGIN
  LOOP
    -- Generar código: SELLO-XXXXXXXX (8 caracteres alfanuméricos)
    v_codigo := 'SELLO-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));

    -- Verificar si existe
    SELECT EXISTS (
      SELECT 1 FROM public.tarjetas_sellos_clientes WHERE codigo_cupon = v_codigo
    ) INTO v_existe;

    EXIT WHEN NOT v_existe;
  END LOOP;

  RETURN v_codigo;
END;
$$;

COMMENT ON FUNCTION public.generar_codigo_cupon_sello IS 'Genera un código único para cupones de sellos';

-- ============================================
-- 5. Función: Otorgar sello a cliente
-- ============================================
CREATE OR REPLACE FUNCTION public.otorgar_sello(
  p_cliente_id UUID,
  p_programa_id UUID,
  p_tienda_id UUID,
  p_otorgado_por UUID DEFAULT NULL,
  p_compra_id UUID DEFAULT NULL,
  p_monto_compra DECIMAL DEFAULT NULL,
  p_notas TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tarjeta RECORD;
  v_programa RECORD;
  v_nuevo_sello_num INTEGER;
  v_tarjeta_id UUID;
  v_sello_id UUID;
  v_completada BOOLEAN := false;
  v_codigo_cupon VARCHAR(50);
  v_sellos_hoy INTEGER;
  v_dias_validez INTEGER;
  v_fecha_expiracion TIMESTAMPTZ;
BEGIN
  -- Obtener información del programa
  SELECT * INTO v_programa
  FROM public.programas_sellos
  WHERE id = p_programa_id AND id_tienda = p_tienda_id;

  IF v_programa IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Programa de sellos no encontrado'
    );
  END IF;

  -- Verificar que el programa esté activo
  IF NOT v_programa.activo THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'El programa de sellos no está activo'
    );
  END IF;

  -- Verificar vigencia del programa
  IF v_programa.fecha_fin IS NOT NULL AND v_programa.fecha_fin < NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'El programa de sellos ha expirado'
    );
  END IF;

  -- Buscar o crear tarjeta activa del cliente para este programa
  SELECT * INTO v_tarjeta
  FROM public.tarjetas_sellos_clientes
  WHERE id_cliente = p_cliente_id
    AND id_programa = p_programa_id
    AND estado = 'activa'
  ORDER BY creado_en DESC
  LIMIT 1;

  -- Si no existe tarjeta activa, crear una nueva
  IF v_tarjeta IS NULL THEN
    -- Calcular fecha de expiración si aplica
    IF v_programa.dias_validez_cupon IS NOT NULL THEN
      v_fecha_expiracion := NOW() + (v_programa.dias_validez_cupon || ' days')::INTERVAL;
    END IF;

    INSERT INTO public.tarjetas_sellos_clientes (
      id_cliente,
      id_programa,
      id_tienda,
      sellos_actuales,
      sellos_objetivo,
      fecha_expiracion
    ) VALUES (
      p_cliente_id,
      p_programa_id,
      p_tienda_id,
      0,
      v_programa.sellos_requeridos,
      v_fecha_expiracion
    )
    RETURNING * INTO v_tarjeta;
  END IF;

  v_tarjeta_id := v_tarjeta.id;

  -- Verificar límite de sellos por día si aplica
  IF v_programa.sellos_por_dia_max IS NOT NULL THEN
    SELECT COUNT(*) INTO v_sellos_hoy
    FROM public.sellos_otorgados
    WHERE id_tarjeta = v_tarjeta_id
      AND DATE(fecha_otorgado) = CURRENT_DATE;

    IF v_sellos_hoy >= v_programa.sellos_por_dia_max THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Límite de sellos por día alcanzado',
        'limite_dia', v_programa.sellos_por_dia_max
      );
    END IF;
  END IF;

  -- Calcular número del nuevo sello
  v_nuevo_sello_num := v_tarjeta.sellos_actuales + 1;

  -- Registrar el sello
  INSERT INTO public.sellos_otorgados (
    id_tarjeta,
    id_cliente,
    id_tienda,
    id_programa,
    numero_sello,
    id_compra,
    monto_compra,
    otorgado_por,
    notas
  ) VALUES (
    v_tarjeta_id,
    p_cliente_id,
    p_tienda_id,
    p_programa_id,
    v_nuevo_sello_num,
    p_compra_id,
    p_monto_compra,
    p_otorgado_por,
    p_notas
  )
  RETURNING id INTO v_sello_id;

  -- Actualizar contador de sellos en la tarjeta
  UPDATE public.tarjetas_sellos_clientes
  SET
    sellos_actuales = v_nuevo_sello_num,
    actualizado_en = NOW()
  WHERE id = v_tarjeta_id;

  -- Verificar si se completó la tarjeta
  IF v_nuevo_sello_num >= v_tarjeta.sellos_objetivo THEN
    v_completada := true;
    v_codigo_cupon := public.generar_codigo_cupon_sello();

    -- Marcar como completada y generar cupón
    UPDATE public.tarjetas_sellos_clientes
    SET
      estado = 'completada',
      fecha_completada = NOW(),
      codigo_cupon = v_codigo_cupon,
      actualizado_en = NOW()
    WHERE id = v_tarjeta_id;
  END IF;

  -- Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'tarjeta_id', v_tarjeta_id,
    'sello_id', v_sello_id,
    'sellos_actuales', v_nuevo_sello_num,
    'sellos_objetivo', v_tarjeta.sellos_objetivo,
    'completada', v_completada,
    'codigo_cupon', v_codigo_cupon,
    'premio', v_programa.premio_detalles
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

COMMENT ON FUNCTION public.otorgar_sello IS 'Otorga un sello a un cliente, crea tarjeta si no existe, y genera cupón al completar';

-- ============================================
-- 6. Función: Canjear cupón de sello
-- ============================================
CREATE OR REPLACE FUNCTION public.canjear_cupon_sello(
  p_codigo_cupon VARCHAR,
  p_tienda_id UUID,
  p_canjeado_por UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tarjeta RECORD;
  v_programa RECORD;
BEGIN
  -- Buscar la tarjeta por código de cupón
  SELECT * INTO v_tarjeta
  FROM public.tarjetas_sellos_clientes
  WHERE codigo_cupon = p_codigo_cupon
    AND id_tienda = p_tienda_id;

  IF v_tarjeta IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cupón no encontrado'
    );
  END IF;

  -- Verificar que esté completada
  IF v_tarjeta.estado != 'completada' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cupón no válido',
      'estado', v_tarjeta.estado
    );
  END IF;

  -- Verificar que no esté canjeado
  IF v_tarjeta.cupon_canjeado THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cupón ya fue canjeado',
      'fecha_canje', v_tarjeta.fecha_canjeada
    );
  END IF;

  -- Verificar expiración
  IF v_tarjeta.fecha_expiracion IS NOT NULL AND v_tarjeta.fecha_expiracion < NOW() THEN
    UPDATE public.tarjetas_sellos_clientes
    SET estado = 'expirada', actualizado_en = NOW()
    WHERE id = v_tarjeta.id;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cupón expirado',
      'fecha_expiracion', v_tarjeta.fecha_expiracion
    );
  END IF;

  -- Obtener info del programa
  SELECT * INTO v_programa
  FROM public.programas_sellos
  WHERE id = v_tarjeta.id_programa;

  -- Marcar como canjeado
  UPDATE public.tarjetas_sellos_clientes
  SET
    estado = 'canjeada',
    cupon_canjeado = true,
    fecha_canjeada = NOW(),
    cupon_canjeado_por = p_canjeado_por,
    actualizado_en = NOW()
  WHERE id = v_tarjeta.id;

  -- Retornar éxito con información del premio
  RETURN jsonb_build_object(
    'success', true,
    'mensaje', 'Cupón canjeado exitosamente',
    'tarjeta_id', v_tarjeta.id,
    'cliente_id', v_tarjeta.id_cliente,
    'programa_nombre', v_programa.nombre,
    'tipo_premio', v_programa.tipo_premio,
    'premio_detalles', v_programa.premio_detalles,
    'instrucciones', v_programa.instrucciones_canje
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

COMMENT ON FUNCTION public.canjear_cupon_sello IS 'Canjea un cupón de sello completado';

-- ============================================
-- 7. Vista: Tarjetas activas con progreso
-- ============================================
CREATE OR REPLACE VIEW public.vista_tarjetas_sellos_progreso AS
SELECT
  t.id,
  t.id_cliente,
  t.id_tienda,
  c.nombre as cliente_nombre,
  c.email as cliente_email,
  p.id as programa_id,
  p.nombre as programa_nombre,
  p.descripcion as programa_descripcion,
  p.icono as programa_icono,
  p.imagen_url as programa_imagen,
  p.color as programa_color,
  p.tipo_premio,
  p.premio_detalles,
  p.instrucciones_canje,
  t.sellos_actuales,
  t.sellos_objetivo,
  ROUND((t.sellos_actuales::DECIMAL / t.sellos_objetivo) * 100, 2) as porcentaje_completado,
  t.estado,
  t.codigo_cupon,
  t.cupon_canjeado,
  t.fecha_inicio,
  t.fecha_completada,
  t.fecha_canjeada,
  t.fecha_expiracion,
  CASE
    WHEN t.estado = 'completada' AND NOT t.cupon_canjeado AND (t.fecha_expiracion IS NULL OR t.fecha_expiracion > NOW()) THEN true
    ELSE false
  END as puede_canjear,
  t.creado_en,
  t.actualizado_en
FROM public.tarjetas_sellos_clientes t
INNER JOIN public.clientes c ON t.id_cliente = c.id
INNER JOIN public.programas_sellos p ON t.id_programa = p.id
ORDER BY t.actualizado_en DESC;

COMMENT ON VIEW public.vista_tarjetas_sellos_progreso IS 'Vista completa de tarjetas de sellos con progreso y datos del programa';

-- ============================================
-- 8. Vista: Estadísticas de programas de sellos
-- ============================================
CREATE OR REPLACE VIEW public.vista_estadisticas_programas_sellos AS
SELECT
  p.id as programa_id,
  p.id_tienda,
  p.nombre as programa_nombre,
  p.activo,
  COUNT(DISTINCT t.id_cliente) as total_clientes_participantes,
  COUNT(DISTINCT CASE WHEN t.estado = 'activa' THEN t.id END) as tarjetas_activas,
  COUNT(DISTINCT CASE WHEN t.estado = 'completada' THEN t.id END) as tarjetas_completadas,
  COUNT(DISTINCT CASE WHEN t.estado = 'canjeada' THEN t.id END) as tarjetas_canjeadas,
  COUNT(DISTINCT s.id) as total_sellos_otorgados,
  COALESCE(AVG(t.sellos_actuales), 0) as promedio_sellos_por_tarjeta,
  p.creado_en,
  p.actualizado_en
FROM public.programas_sellos p
LEFT JOIN public.tarjetas_sellos_clientes t ON p.id = t.id_programa
LEFT JOIN public.sellos_otorgados s ON p.id = s.id_programa
GROUP BY p.id, p.id_tienda, p.nombre, p.activo, p.creado_en, p.actualizado_en;

COMMENT ON VIEW public.vista_estadisticas_programas_sellos IS 'Estadísticas de uso de cada programa de sellos';

-- ============================================
-- 9. Función de trigger: Actualizar timestamp
-- ============================================
CREATE TRIGGER trigger_programas_sellos_actualizado
  BEFORE UPDATE ON public.programas_sellos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_tarjetas_sellos_actualizado
  BEFORE UPDATE ON public.tarjetas_sellos_clientes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

-- ============================================
-- 10. RLS Policies
-- ============================================
ALTER TABLE public.programas_sellos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarjetas_sellos_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellos_otorgados ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden ver programas activos y visibles
CREATE POLICY "programas_sellos_select_policy"
  ON public.programas_sellos FOR SELECT
  USING (activo = true AND visible_cliente = true);

-- Policy: Clientes pueden ver sus propias tarjetas
CREATE POLICY "tarjetas_sellos_cliente_select_policy"
  ON public.tarjetas_sellos_clientes FOR SELECT
  USING (true); -- Verificación adicional en backend

-- Policy: Clientes pueden ver sus propios sellos
CREATE POLICY "sellos_otorgados_select_policy"
  ON public.sellos_otorgados FOR SELECT
  USING (true); -- Verificación adicional en backend

COMMIT;

-- ============================================
-- EJEMPLO DE USO
-- ============================================
-- Crear un programa de sellos:
-- INSERT INTO public.programas_sellos (id_tienda, nombre, descripcion, sellos_requeridos, tipo_premio, premio_detalles)
-- VALUES (
--   '<id_tienda>',
--   'Cafetería - 10 cafés',
--   'Compra 10 cafés y llévate el 11º gratis',
--   10,
--   'producto',
--   '{"nombre": "Café gratis", "descripcion": "Un café de cualquier tamaño", "imagen": "coffee.png"}'
-- );

-- Otorgar un sello:
-- SELECT public.otorgar_sello(
--   '<id_cliente>',
--   '<id_programa>',
--   '<id_tienda>',
--   '<id_usuario_staff>',
--   NULL, -- id_compra (opcional)
--   NULL, -- monto_compra (opcional)
--   'Primera visita' -- notas (opcional)
-- );

-- Canjear cupón:
-- SELECT public.canjear_cupon_sello('SELLO-ABC12345', '<id_tienda>', '<id_usuario_staff>');
