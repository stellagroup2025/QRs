-- =====================================================
-- MIGRACIÓN: Sistema de validación de email para clientes
-- =====================================================
-- Fecha: 2025-11-20
-- Descripción: Añade campos para validar emails de clientes y controlar acceso

-- 1. Añadir campos de validación de email a la tabla clientes
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS email_validado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS codigo_validacion VARCHAR(6),
ADD COLUMN IF NOT EXISTS codigo_validacion_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS validacion_enviada_at TIMESTAMPTZ;

-- 2. Crear índice para búsqueda rápida de códigos de validación
CREATE INDEX IF NOT EXISTS idx_clientes_codigo_validacion
ON clientes(codigo_validacion)
WHERE codigo_validacion IS NOT NULL;

-- 3. Crear índice para filtrar clientes validados
CREATE INDEX IF NOT EXISTS idx_clientes_email_validado
ON clientes(email_validado);

-- 4. Función para limpiar códigos de validación expirados (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION limpiar_codigos_validacion_expirados()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE clientes
  SET
    codigo_validacion = NULL,
    codigo_validacion_expires_at = NULL
  WHERE
    codigo_validacion IS NOT NULL
    AND codigo_validacion_expires_at < NOW();
END;
$$;

-- 5. Comentarios para documentación
COMMENT ON COLUMN clientes.email_validado IS 'Indica si el email del cliente ha sido verificado';
COMMENT ON COLUMN clientes.codigo_validacion IS 'Código de 6 dígitos para validar el email';
COMMENT ON COLUMN clientes.codigo_validacion_expires_at IS 'Fecha de expiración del código de validación (10 minutos)';
COMMENT ON COLUMN clientes.validacion_enviada_at IS 'Fecha del último envío de código de validación';

-- 6. Política de seguridad: Los clientes solo pueden ver su propio estado de validación
-- (Las políticas existentes de RLS se mantienen, esto es solo documentación)

COMMENT ON FUNCTION limpiar_codigos_validacion_expirados() IS
'Limpia códigos de validación expirados. Ejecutar periódicamente (ej: cada hora)';

-- =====================================================
-- NOTAS DE MIGRACIÓN:
-- =====================================================
-- 1. Los clientes existentes tendrán email_validado = FALSE por defecto
-- 2. Se pueden marcar como validados manualmente si es necesario:
--    UPDATE clientes SET email_validado = TRUE WHERE ...
-- 3. El código de validación expira en 10 minutos
-- 4. Se puede configurar un cronjob para ejecutar limpiar_codigos_validacion_expirados()
-- =====================================================
