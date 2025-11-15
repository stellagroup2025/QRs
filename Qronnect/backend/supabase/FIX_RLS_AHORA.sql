-- ============================================================================
-- ARREGLO URGENTE: Deshabilitar RLS en tablas de campañas
-- ============================================================================
-- Copia y pega este SCRIPT COMPLETO en Supabase SQL Editor y ejecútalo
-- URL: https://supabase.com/dashboard/project/ajyiuhujexwrjmjfycxh/sql/new
-- ============================================================================

-- PASO 1: Eliminar TODAS las políticas RLS existentes
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE tablename IN ('campanas_email', 'campanas_destinatarios', 'email_templates')
          AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
        RAISE NOTICE 'Eliminada política: % en tabla %', r.policyname, r.tablename;
    END LOOP;
END $$;

-- PASO 2: Deshabilitar RLS en las tres tablas
ALTER TABLE public.campanas_email DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanas_destinatarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates DISABLE ROW LEVEL SECURITY;

-- PASO 3: Verificar que todo está correcto
DO $$
DECLARE
    rls_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Contar tablas con RLS habilitado
    SELECT COUNT(*) INTO rls_count
    FROM pg_tables
    WHERE tablename IN ('campanas_email', 'campanas_destinatarios', 'email_templates')
        AND schemaname = 'public'
        AND rowsecurity = true;

    -- Contar políticas existentes
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename IN ('campanas_email', 'campanas_destinatarios', 'email_templates')
        AND schemaname = 'public';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '           RESULTADO FINAL';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tablas con RLS habilitado: %', rls_count;
    RAISE NOTICE 'Políticas RLS existentes: %', policy_count;
    RAISE NOTICE '========================================';

    IF rls_count = 0 AND policy_count = 0 THEN
        RAISE NOTICE '✅ ¡ÉXITO! RLS deshabilitado correctamente';
        RAISE NOTICE 'Ahora puedes crear campañas sin problemas';
    ELSE
        RAISE WARNING '❌ AÚN HAY PROBLEMAS - Contacta soporte';
    END IF;
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

-- PASO 4: Mostrar estado final de las tablas
SELECT
    tablename,
    CASE
        WHEN rowsecurity = true THEN '❌ RLS HABILITADO'
        WHEN rowsecurity = false THEN '✅ RLS DESHABILITADO'
    END as estado
FROM pg_tables
WHERE tablename IN ('campanas_email', 'campanas_destinatarios', 'email_templates')
    AND schemaname = 'public'
ORDER BY tablename;
