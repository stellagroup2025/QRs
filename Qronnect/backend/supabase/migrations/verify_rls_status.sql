-- Script de verificación: Comprobar estado de RLS en tablas de campañas
--
-- Ejecuta este script en Supabase SQL Editor para verificar si la migración
-- 20250110000007_disable_campaigns_rls.sql se aplicó correctamente

-- 1. Verificar si RLS está habilitado o deshabilitado
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE
        WHEN rowsecurity = true THEN '❌ RLS HABILITADO (problema)'
        WHEN rowsecurity = false THEN '✅ RLS DESHABILITADO (correcto)'
    END as estado
FROM pg_tables
WHERE tablename IN ('campanas_email', 'campanas_destinatarios', 'email_templates')
    AND schemaname = 'public'
ORDER BY tablename;

-- 2. Verificar si existen políticas residuales
SELECT
    schemaname,
    tablename,
    policyname,
    cmd as operacion,
    '❌ Esta política no debería existir' as estado
FROM pg_policies
WHERE tablename IN ('campanas_email', 'campanas_destinatarios', 'email_templates')
    AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Si no hay resultados en la query #2, significa que NO hay políticas (correcto)
-- Mostrar mensaje de éxito si todo está bien
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

    RAISE NOTICE '========================================';
    RAISE NOTICE 'RESUMEN DE VERIFICACIÓN';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tablas con RLS habilitado: %', rls_count;
    RAISE NOTICE 'Políticas RLS existentes: %', policy_count;
    RAISE NOTICE '========================================';

    IF rls_count = 0 AND policy_count = 0 THEN
        RAISE NOTICE '✅ TODO CORRECTO - RLS deshabilitado y sin políticas';
        RAISE NOTICE 'Si aún ves el error, prueba:';
        RAISE NOTICE '1. Reiniciar el backend: pkill -f "nest start" && npm start';
        RAISE NOTICE '2. Limpiar caché del navegador';
        RAISE NOTICE '3. Esperar 1-2 minutos (caché de Supabase)';
    ELSE
        RAISE NOTICE '❌ PROBLEMA DETECTADO';
        IF rls_count > 0 THEN
            RAISE NOTICE 'Ejecuta: ALTER TABLE <tabla> DISABLE ROW LEVEL SECURITY;';
        END IF;
        IF policy_count > 0 THEN
            RAISE NOTICE 'Ejecuta: DROP POLICY <nombre_politica> ON <tabla>;';
        END IF;
    END IF;
    RAISE NOTICE '========================================';
END $$;
