-- Migración para arreglar las políticas RLS de campañas
-- Esta migración corrige las políticas para permitir INSERT, UPDATE y DELETE

-- Eliminar políticas existentes (solo lectura)
DROP POLICY IF EXISTS campanas_tenant_isolation ON campanas_email;
DROP POLICY IF EXISTS destinatarios_tenant_isolation ON campanas_destinatarios;
DROP POLICY IF EXISTS templates_access ON email_templates;

-- ============================================================================
-- POLÍTICAS PARA: campanas_email
-- ============================================================================

CREATE POLICY campanas_select ON campanas_email
  FOR SELECT
  USING (id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY campanas_insert ON campanas_email
  FOR INSERT
  WITH CHECK (id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY campanas_update ON campanas_email
  FOR UPDATE
  USING (id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID)
  WITH CHECK (id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY campanas_delete ON campanas_email
  FOR DELETE
  USING (id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ============================================================================
-- POLÍTICAS PARA: campanas_destinatarios
-- ============================================================================

CREATE POLICY destinatarios_select ON campanas_destinatarios
  FOR SELECT
  USING (
    id_campana IN (
      SELECT id FROM campanas_email WHERE id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID
    )
  );

CREATE POLICY destinatarios_insert ON campanas_destinatarios
  FOR INSERT
  WITH CHECK (
    id_campana IN (
      SELECT id FROM campanas_email WHERE id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID
    )
  );

CREATE POLICY destinatarios_update ON campanas_destinatarios
  FOR UPDATE
  USING (
    id_campana IN (
      SELECT id FROM campanas_email WHERE id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID
    )
  )
  WITH CHECK (
    id_campana IN (
      SELECT id FROM campanas_email WHERE id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID
    )
  );

CREATE POLICY destinatarios_delete ON campanas_destinatarios
  FOR DELETE
  USING (
    id_campana IN (
      SELECT id FROM campanas_email WHERE id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID
    )
  );

-- ============================================================================
-- POLÍTICAS PARA: email_templates
-- ============================================================================
-- Los templates del sistema (es_sistema = TRUE) son accesibles para todos
-- Los templates personalizados solo son accesibles por su tienda

CREATE POLICY templates_select ON email_templates
  FOR SELECT
  USING (
    es_sistema = TRUE OR
    id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID
  );

CREATE POLICY templates_insert ON email_templates
  FOR INSERT
  WITH CHECK (id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY templates_update ON email_templates
  FOR UPDATE
  USING (id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID)
  WITH CHECK (id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID);

CREATE POLICY templates_delete ON email_templates
  FOR DELETE
  USING (id_tienda = current_setting('app.current_tenant_id', TRUE)::UUID);
