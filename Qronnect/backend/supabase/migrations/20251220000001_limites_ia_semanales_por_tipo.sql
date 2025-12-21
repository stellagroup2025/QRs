-- ============================================
-- LÍMITES SEMANALES DE IA POR TIPO Y PLAN
-- ============================================
-- Date: 2025-12-20
-- Description: Sistema de límites de uso de IA semanales por tipo de función y plan

-- ============================================
-- 1. Tabla: limites_ia_plan (límites por plan)
-- ============================================
CREATE TABLE IF NOT EXISTS public.limites_ia_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_plan TEXT NOT NULL, -- 'basico', 'starter', 'business', 'enterprise', 'demo'

  -- Límites semanales por tipo de función
  limite_promociones_ia INTEGER NOT NULL DEFAULT 1,
  limite_campanas_ia INTEGER NOT NULL DEFAULT 1,
  limite_analisis_kpi INTEGER NOT NULL DEFAULT 1,

  -- Período (semanal por defecto)
  periodo_dias INTEGER NOT NULL DEFAULT 7,

  -- Metadata
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar límites por plan
INSERT INTO public.limites_ia_plan (nombre_plan, limite_promociones_ia, limite_campanas_ia, limite_analisis_kpi, periodo_dias)
VALUES
  ('demo', 1, 1, 1, 7),        -- Plan Demo: 1 de cada por semana
  ('basico', 1, 1, 1, 7),      -- Plan Básico: 1 de cada por semana
  ('starter', 3, 3, 5, 7),     -- Plan Starter: 3 promos, 3 campañas, 5 análisis por semana
  ('business', 10, 10, 20, 7), -- Plan Business: 10, 10, 20 por semana
  ('enterprise', -1, -1, -1, 7) -- Enterprise: ilimitado (-1 = sin límite)
ON CONFLICT DO NOTHING;

-- Índice único por plan
CREATE UNIQUE INDEX IF NOT EXISTS idx_limites_ia_plan_nombre ON public.limites_ia_plan(nombre_plan);

COMMENT ON TABLE public.limites_ia_plan IS 'Límites de uso de IA por tipo de función según el plan';

-- ============================================
-- 2. Tabla: usos_ia_semanales (tracking de usos por tipo)
-- ============================================
CREATE TABLE IF NOT EXISTS public.usos_ia_semanales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,

  -- Tipo de uso
  tipo_uso TEXT NOT NULL CHECK (tipo_uso IN ('promocion_ia', 'campana_ia', 'analisis_kpi')),

  -- Período de la semana (lunes de la semana)
  semana_inicio DATE NOT NULL,

  -- Contador de usos en la semana
  usos_realizados INTEGER NOT NULL DEFAULT 1,

  -- Timestamps
  ultimo_uso TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Índice único: una entrada por tienda/tipo/semana
  UNIQUE(id_tienda, tipo_uso, semana_inicio)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_usos_ia_semanales_tienda ON public.usos_ia_semanales(id_tienda);
CREATE INDEX IF NOT EXISTS idx_usos_ia_semanales_tipo ON public.usos_ia_semanales(tipo_uso);
CREATE INDEX IF NOT EXISTS idx_usos_ia_semanales_semana ON public.usos_ia_semanales(semana_inicio);

COMMENT ON TABLE public.usos_ia_semanales IS 'Registro de usos de IA por tipo y semana para control de límites';

-- ============================================
-- 3. Función: Obtener inicio de semana (lunes)
-- ============================================
CREATE OR REPLACE FUNCTION public.obtener_inicio_semana(fecha DATE DEFAULT CURRENT_DATE)
RETURNS DATE
LANGUAGE sql
IMMUTABLE
AS $$
  -- Obtener el lunes de la semana actual
  SELECT fecha - EXTRACT(DOW FROM fecha)::INTEGER + 1;
$$;

COMMENT ON FUNCTION public.obtener_inicio_semana IS 'Devuelve el lunes de la semana para la fecha dada';

-- ============================================
-- 4. Función: Verificar límite de IA por tipo
-- ============================================
CREATE OR REPLACE FUNCTION public.verificar_limite_ia_por_tipo(
  p_tienda_id UUID,
  p_tipo_uso TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_plan_tienda TEXT;
  v_limites RECORD;
  v_limite_tipo INTEGER;
  v_usos_actuales INTEGER;
  v_semana_inicio DATE;
  v_disponible BOOLEAN;
  v_restantes INTEGER;
BEGIN
  -- Obtener el inicio de la semana actual
  v_semana_inicio := public.obtener_inicio_semana();

  -- Obtener el plan de la tienda
  SELECT COALESCE(t.plan, 'basico') INTO v_plan_tienda
  FROM public.tiendas t
  WHERE t.id = p_tienda_id;

  IF v_plan_tienda IS NULL THEN
    v_plan_tienda := 'basico';
  END IF;

  -- Obtener límites del plan
  SELECT * INTO v_limites
  FROM public.limites_ia_plan
  WHERE nombre_plan = v_plan_tienda
    AND activo = true;

  -- Si no hay límites configurados, usar valores por defecto (plan básico)
  IF v_limites IS NULL THEN
    SELECT * INTO v_limites
    FROM public.limites_ia_plan
    WHERE nombre_plan = 'basico'
      AND activo = true;
  END IF;

  -- Determinar el límite según el tipo de uso
  CASE p_tipo_uso
    WHEN 'promocion_ia' THEN
      v_limite_tipo := COALESCE(v_limites.limite_promociones_ia, 1);
    WHEN 'campana_ia' THEN
      v_limite_tipo := COALESCE(v_limites.limite_campanas_ia, 1);
    WHEN 'analisis_kpi' THEN
      v_limite_tipo := COALESCE(v_limites.limite_analisis_kpi, 1);
    ELSE
      v_limite_tipo := 1;
  END CASE;

  -- Si el límite es -1, significa ilimitado
  IF v_limite_tipo = -1 THEN
    RETURN jsonb_build_object(
      'disponible', true,
      'ilimitado', true,
      'plan', v_plan_tienda,
      'tipo_uso', p_tipo_uso,
      'limite_semanal', null,
      'usos_realizados', null,
      'restantes', null,
      'semana_inicio', v_semana_inicio,
      'semana_fin', v_semana_inicio + 6
    );
  END IF;

  -- Obtener usos actuales de la semana
  SELECT COALESCE(usos_realizados, 0) INTO v_usos_actuales
  FROM public.usos_ia_semanales
  WHERE id_tienda = p_tienda_id
    AND tipo_uso = p_tipo_uso
    AND semana_inicio = v_semana_inicio;

  IF v_usos_actuales IS NULL THEN
    v_usos_actuales := 0;
  END IF;

  -- Calcular disponibilidad
  v_restantes := v_limite_tipo - v_usos_actuales;
  v_disponible := v_restantes > 0;

  RETURN jsonb_build_object(
    'disponible', v_disponible,
    'ilimitado', false,
    'plan', v_plan_tienda,
    'tipo_uso', p_tipo_uso,
    'limite_semanal', v_limite_tipo,
    'usos_realizados', v_usos_actuales,
    'restantes', GREATEST(v_restantes, 0),
    'semana_inicio', v_semana_inicio,
    'semana_fin', v_semana_inicio + 6
  );
END;
$$;

COMMENT ON FUNCTION public.verificar_limite_ia_por_tipo IS 'Verifica si una tienda puede usar una función de IA específica según su plan y uso semanal';

-- ============================================
-- 5. Función: Registrar uso de IA por tipo
-- ============================================
CREATE OR REPLACE FUNCTION public.registrar_uso_ia_semanal(
  p_tienda_id UUID,
  p_tipo_uso TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_semana_inicio DATE;
  v_verificacion JSONB;
  v_usos_actuales INTEGER;
BEGIN
  -- Verificar primero si tiene disponibilidad
  v_verificacion := public.verificar_limite_ia_por_tipo(p_tienda_id, p_tipo_uso);

  -- Si no está disponible y no es ilimitado, retornar error
  IF NOT (v_verificacion->>'disponible')::BOOLEAN AND NOT (v_verificacion->>'ilimitado')::BOOLEAN THEN
    RETURN jsonb_build_object(
      'exito', false,
      'error', 'Límite semanal alcanzado para ' || p_tipo_uso,
      'limite', v_verificacion
    );
  END IF;

  -- Obtener inicio de semana
  v_semana_inicio := public.obtener_inicio_semana();

  -- Insertar o actualizar el contador
  INSERT INTO public.usos_ia_semanales (id_tienda, tipo_uso, semana_inicio, usos_realizados, ultimo_uso)
  VALUES (p_tienda_id, p_tipo_uso, v_semana_inicio, 1, NOW())
  ON CONFLICT (id_tienda, tipo_uso, semana_inicio)
  DO UPDATE SET
    usos_realizados = public.usos_ia_semanales.usos_realizados + 1,
    ultimo_uso = NOW(),
    updated_at = NOW()
  RETURNING usos_realizados INTO v_usos_actuales;

  -- Retornar éxito con estado actualizado
  RETURN jsonb_build_object(
    'exito', true,
    'tipo_uso', p_tipo_uso,
    'usos_realizados', v_usos_actuales,
    'semana_inicio', v_semana_inicio
  );
END;
$$;

COMMENT ON FUNCTION public.registrar_uso_ia_semanal IS 'Registra un uso de IA y actualiza el contador semanal';

-- ============================================
-- 6. Función: Obtener resumen de límites de IA
-- ============================================
CREATE OR REPLACE FUNCTION public.obtener_resumen_limites_ia(p_tienda_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_promocion JSONB;
  v_campana JSONB;
  v_analisis JSONB;
BEGIN
  v_promocion := public.verificar_limite_ia_por_tipo(p_tienda_id, 'promocion_ia');
  v_campana := public.verificar_limite_ia_por_tipo(p_tienda_id, 'campana_ia');
  v_analisis := public.verificar_limite_ia_por_tipo(p_tienda_id, 'analisis_kpi');

  RETURN jsonb_build_object(
    'promocion_ia', v_promocion,
    'campana_ia', v_campana,
    'analisis_kpi', v_analisis
  );
END;
$$;

COMMENT ON FUNCTION public.obtener_resumen_limites_ia IS 'Obtiene el resumen completo de límites de IA para todos los tipos';

-- ============================================
-- 7. Vista: Dashboard de límites de IA
-- ============================================
CREATE OR REPLACE VIEW public.vista_limites_ia_tienda AS
SELECT
  t.id as tienda_id,
  t.nombre as tienda_nombre,
  COALESCE(t.plan, 'basico') as plan,
  lip.limite_promociones_ia,
  lip.limite_campanas_ia,
  lip.limite_analisis_kpi,
  lip.periodo_dias,
  public.obtener_inicio_semana() as semana_actual,
  (
    SELECT COALESCE(usos_realizados, 0)
    FROM public.usos_ia_semanales
    WHERE id_tienda = t.id
      AND tipo_uso = 'promocion_ia'
      AND semana_inicio = public.obtener_inicio_semana()
  ) as usos_promociones_semana,
  (
    SELECT COALESCE(usos_realizados, 0)
    FROM public.usos_ia_semanales
    WHERE id_tienda = t.id
      AND tipo_uso = 'campana_ia'
      AND semana_inicio = public.obtener_inicio_semana()
  ) as usos_campanas_semana,
  (
    SELECT COALESCE(usos_realizados, 0)
    FROM public.usos_ia_semanales
    WHERE id_tienda = t.id
      AND tipo_uso = 'analisis_kpi'
      AND semana_inicio = public.obtener_inicio_semana()
  ) as usos_analisis_semana
FROM public.tiendas t
LEFT JOIN public.limites_ia_plan lip ON lip.nombre_plan = COALESCE(t.plan, 'basico') AND lip.activo = true;

COMMENT ON VIEW public.vista_limites_ia_tienda IS 'Vista de límites y uso de IA por tienda';

-- ============================================
-- 8. RLS - Deshabilitar para usar service role
-- ============================================
ALTER TABLE public.limites_ia_plan DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usos_ia_semanales DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. Políticas de lectura pública para límites
-- ============================================
ALTER TABLE public.limites_ia_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read limites_ia_plan"
ON public.limites_ia_plan
FOR SELECT
USING (true);

CREATE POLICY "Service role full access limites_ia_plan"
ON public.limites_ia_plan
FOR ALL
USING (auth.role() = 'service_role');

-- RLS para usos_ia_semanales
ALTER TABLE public.usos_ia_semanales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tienda puede ver sus propios usos"
ON public.usos_ia_semanales
FOR SELECT
USING (
  id_tienda IN (
    SELECT id FROM public.tiendas WHERE id = id_tienda
  )
);

CREATE POLICY "Service role full access usos_ia_semanales"
ON public.usos_ia_semanales
FOR ALL
USING (auth.role() = 'service_role');

COMMIT;
