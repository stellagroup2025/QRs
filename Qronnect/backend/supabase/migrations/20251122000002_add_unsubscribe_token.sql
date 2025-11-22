-- Migración: Añadir token de unsubscribe para emails de marketing
-- Fecha: 2025-11-22
-- Propósito: Permitir que usuarios se den de baja de emails sin login

-- Añadir campo para token único de unsubscribe
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS unsubscribe_token VARCHAR(64) UNIQUE;

-- Generar tokens únicos para clientes existentes
UPDATE clientes
SET unsubscribe_token = encode(gen_random_bytes(32), 'hex')
WHERE unsubscribe_token IS NULL;

-- Función para generar token automáticamente en nuevos clientes
CREATE OR REPLACE FUNCTION generate_unsubscribe_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unsubscribe_token IS NULL THEN
    NEW.unsubscribe_token := encode(gen_random_bytes(32), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar token en insert
DROP TRIGGER IF EXISTS set_unsubscribe_token ON clientes;
CREATE TRIGGER set_unsubscribe_token
  BEFORE INSERT ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION generate_unsubscribe_token();

-- Índice para búsquedas rápidas por token
CREATE INDEX IF NOT EXISTS idx_clientes_unsubscribe_token ON clientes(unsubscribe_token);

-- Comentario
COMMENT ON COLUMN clientes.unsubscribe_token IS 'Token único para permitir darse de baja de emails de marketing sin login';
