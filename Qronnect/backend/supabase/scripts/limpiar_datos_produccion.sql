-- ============================================
-- SCRIPT DE LIMPIEZA PARA PRODUCCIÓN
-- ============================================
-- ⚠️  ADVERTENCIA: Este script eliminará TODOS los datos
-- Ejecutar solo cuando estés seguro de querer limpiar la base de datos
-- ============================================

BEGIN;

-- Desactivar triggers temporalmente para evitar errores
SET session_replication_role = 'replica';

-- ============================================
-- 1. Eliminar datos relacionados con clientes
-- ============================================
DELETE FROM public.milestones_alcanzados;
DELETE FROM public.cupones_regalos;
DELETE FROM public.regalos_bienvenida_otorgados;
DELETE FROM public.referidos;
DELETE FROM public.transacciones;
DELETE FROM public.canjes;
DELETE FROM public.campanas_envios;
DELETE FROM public.clientes;

-- ============================================
-- 2. Eliminar datos de configuración de tiendas
-- ============================================
DELETE FROM public.campanas;
DELETE FROM public.milestones_referidos;
DELETE FROM public.regalos_catalogo;
DELETE FROM public.promociones;
DELETE FROM public.programas_referidos;
DELETE FROM public.landing_config;
DELETE FROM public.usuarios_tienda;

-- ============================================
-- 3. Eliminar tiendas
-- ============================================
DELETE FROM public.tiendas;

-- ============================================
-- 4. Limpiar storage (opcional - los archivos quedan en el bucket)
-- ============================================
-- Los archivos en storage.objects se pueden limpiar manualmente
-- o con: DELETE FROM storage.objects WHERE bucket_id = 'branding';

-- Reactivar triggers
SET session_replication_role = 'origin';

COMMIT;

-- ============================================
-- Verificar que todo está limpio
-- ============================================
SELECT 'tiendas' as tabla, COUNT(*) as registros FROM public.tiendas
UNION ALL
SELECT 'clientes', COUNT(*) FROM public.clientes
UNION ALL
SELECT 'usuarios_tienda', COUNT(*) FROM public.usuarios_tienda
UNION ALL
SELECT 'cupones_regalos', COUNT(*) FROM public.cupones_regalos
UNION ALL
SELECT 'referidos', COUNT(*) FROM public.referidos;
