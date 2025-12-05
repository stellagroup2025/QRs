-- ============================================
-- SCRIPT DE LIMPIEZA DE BASE DE DATOS
-- ============================================
-- ADVERTENCIA: Este script elimina TODOS los datos de la base de datos
-- excepto las tiendas, landing_config y usuarios_tienda.
--
-- Úsalo SOLO en desarrollo o cuando quieras resetear los datos de prueba.
-- ============================================

BEGIN;

-- Deshabilitar temporalmente las restricciones de foreign key
-- para evitar errores de dependencias circulares
SET session_replication_role = 'replica';

-- ============================================
-- ORDEN DE ELIMINACIÓN (de hijos a padres)
-- ============================================

-- 1. Tablas que dependen de milestones_referidos
DELETE FROM public.milestones_alcanzados;

-- 2. Tablas que dependen de cupones_regalos
-- (milestones_alcanzados ya eliminada arriba)

-- 3. Tablas que dependen de regalos_catalogo
DELETE FROM public.cupones_regalos;

-- 4. Tablas que dependen de programas_referidos
DELETE FROM public.historial_referidos;

-- 5. Tablas que dependen de campañas
DELETE FROM campanas_destinatarios;
DELETE FROM public.campanas_sms_destinatarios;
DELETE FROM public.envios_campanas;

-- 6. Tablas que dependen de clientes (nivel 3)
DELETE FROM public.regalos_bienvenida_otorgados;
DELETE FROM public.milestones_referidos;
DELETE FROM public.regalos_catalogo;
DELETE FROM qr_clientes;
DELETE FROM compras;
DELETE FROM canjes;

-- 7. Campañas (después de eliminar sus dependencias)
DELETE FROM campanas_email;
DELETE FROM public.campanas_sms;
DELETE FROM email_templates;

-- 8. Clientes (después de eliminar todas sus dependencias)
DELETE FROM clientes;

-- 9. Tablas que dependen de tiendas (pero NO eliminamos tiendas)
DELETE FROM public.programas_referidos;
DELETE FROM promociones;
DELETE FROM plantillas_promociones;
DELETE FROM public.ia_uso;
DELETE FROM roles_tienda;

-- 10. Tablas de SMS y comunicaciones
DELETE FROM public.envios_sms;
DELETE FROM public.sms_enviados;
DELETE FROM sms_opt_out_log;

-- 11. Tablas de onboarding y códigos 2FA
DELETE FROM onboarding_progress;
DELETE FROM usuarios_tienda_2fa_codes;

-- ============================================
-- TABLAS QUE NO SE ELIMINAN (configuración)
-- ============================================
-- NO se eliminan:
-- - tiendas (configuración principal)
-- - landing_config (configuración de landing)
-- - usuarios_tienda (usuarios del sistema)

-- Restaurar el comportamiento normal de foreign keys
SET session_replication_role = 'origin';

COMMIT;

-- ============================================
-- VERIFICACIÓN POST-LIMPIEZA
-- ============================================
-- Ejecuta esta query para verificar cuántos registros quedan:
--
-- SELECT
--   (SELECT COUNT(*) FROM tiendas) as tiendas,
--   (SELECT COUNT(*) FROM landing_config) as landing_config,
--   (SELECT COUNT(*) FROM usuarios_tienda) as usuarios_tienda,
--   (SELECT COUNT(*) FROM clientes) as clientes,
--   (SELECT COUNT(*) FROM promociones) as promociones,
--   (SELECT COUNT(*) FROM canjes) as canjes,
--   (SELECT COUNT(*) FROM compras) as compras,
--   (SELECT COUNT(*) FROM public.regalos_catalogo) as regalos_catalogo,
--   (SELECT COUNT(*) FROM public.cupones_regalos) as cupones_regalos,
--   (SELECT COUNT(*) FROM public.programas_referidos) as programas_referidos,
--   (SELECT COUNT(*) FROM public.historial_referidos) as historial_referidos,
--   (SELECT COUNT(*) FROM campanas_email) as campanas_email;
