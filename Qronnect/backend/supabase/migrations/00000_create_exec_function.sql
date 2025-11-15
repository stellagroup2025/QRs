-- Crear función helper para ejecutar SQL dinámico
-- Esto nos permite ejecutar migraciones desde el cliente de Supabase

CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Dar permisos a service_role para ejecutar esta función
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
