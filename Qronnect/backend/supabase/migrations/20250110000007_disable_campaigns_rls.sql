-- Migración: Deshabilitar RLS en tablas de campañas
--
-- RAZÓN: El backend ya maneja el aislamiento multi-tenant mediante:
-- - El decorador @CurrentTienda() que filtra por id_tienda
-- - Guards de autenticación (AdminAuthGuard)
-- - Validación en cada endpoint
--
-- Las políticas RLS con current_setting requieren configurar la variable de sesión
-- en cada request, lo cual añade complejidad innecesaria cuando el backend
-- ya garantiza el aislamiento.

-- Eliminar todas las políticas RLS existentes
DROP POLICY IF EXISTS campanas_select ON campanas_email;
DROP POLICY IF EXISTS campanas_insert ON campanas_email;
DROP POLICY IF EXISTS campanas_update ON campanas_email;
DROP POLICY IF EXISTS campanas_delete ON campanas_email;

DROP POLICY IF EXISTS destinatarios_select ON campanas_destinatarios;
DROP POLICY IF EXISTS destinatarios_insert ON campanas_destinatarios;
DROP POLICY IF EXISTS destinatarios_update ON campanas_destinatarios;
DROP POLICY IF EXISTS destinatarios_delete ON campanas_destinatarios;

DROP POLICY IF EXISTS templates_select ON email_templates;
DROP POLICY IF EXISTS templates_insert ON email_templates;
DROP POLICY IF EXISTS templates_update ON email_templates;
DROP POLICY IF EXISTS templates_delete ON email_templates;

-- Deshabilitar RLS en las tablas
ALTER TABLE campanas_email DISABLE ROW LEVEL SECURITY;
ALTER TABLE campanas_destinatarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates DISABLE ROW LEVEL SECURITY;

-- NOTA: El aislamiento multi-tenant se mantiene mediante:
-- 1. Filtros en queries: .eq('id_tienda', tiendaId)
-- 2. Guards de autenticación
-- 3. Decorador @CurrentTienda() que extrae el tenant del JWT
