-- Migration: Create function to filter clients with campaign history
-- Date: 2025-01-11
-- Description: Función SQL para filtrar clientes considerando su historial de campañas

CREATE OR REPLACE FUNCTION filtrar_clientes_campana(
  p_tienda_id UUID,
  p_excluir_campana_id UUID DEFAULT NULL,
  p_excluir_ultimos_dias INTEGER DEFAULT NULL,
  p_solo_sin_campanas BOOLEAN DEFAULT FALSE,
  p_dias_desde_ultima_min INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id_cliente UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT c.id as id_cliente
  FROM clientes c
  WHERE c.id_tienda = p_tienda_id
    AND c.activo = true
    -- Excluir clientes que recibieron una campaña específica
    AND (
      p_excluir_campana_id IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM envios_campanas ec
        WHERE ec.id_cliente = c.id
          AND ec.id_campana = p_excluir_campana_id
      )
    )
    -- Excluir clientes que recibieron campañas en los últimos N días
    AND (
      p_excluir_ultimos_dias IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM envios_campanas ec
        WHERE ec.id_cliente = c.id
          AND ec.fecha_envio >= NOW() - (p_excluir_ultimos_dias || ' days')::INTERVAL
      )
    )
    -- Solo clientes sin campañas previas
    AND (
      p_solo_sin_campanas = FALSE
      OR NOT EXISTS (
        SELECT 1 FROM envios_campanas ec
        WHERE ec.id_cliente = c.id
      )
    )
    -- Días mínimos desde la última campaña
    AND (
      p_dias_desde_ultima_min IS NULL
      OR NOT EXISTS (
        SELECT 1 FROM envios_campanas ec
        WHERE ec.id_cliente = c.id
          AND ec.fecha_envio >= NOW() - (p_dias_desde_ultima_min || ' days')::INTERVAL
      )
      OR NOT EXISTS (
        SELECT 1 FROM envios_campanas ec
        WHERE ec.id_cliente = c.id
      )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION filtrar_clientes_campana TO authenticated;
GRANT EXECUTE ON FUNCTION filtrar_clientes_campana TO service_role;

-- Comment
COMMENT ON FUNCTION filtrar_clientes_campana IS 'Filtra clientes basándose en su historial de campañas recibidas';
