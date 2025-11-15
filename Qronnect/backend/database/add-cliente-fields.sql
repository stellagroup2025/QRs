-- =====================================================
-- Agregar campos código postal y cumpleaños a la tabla clientes
-- =====================================================

-- Agregar columna codigo_postal
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(10);

-- Agregar columna fecha_nacimiento
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;

-- Crear índice para búsquedas por código postal (útil para segmentación)
CREATE INDEX IF NOT EXISTS idx_clientes_codigo_postal ON clientes(codigo_postal);

-- Crear índice para búsquedas por mes de cumpleaños (útil para campañas de cumpleaños)
CREATE INDEX IF NOT EXISTS idx_clientes_mes_nacimiento ON clientes(EXTRACT(MONTH FROM fecha_nacimiento));

COMMENT ON COLUMN clientes.codigo_postal IS 'Código postal del cliente para segmentación geográfica';
COMMENT ON COLUMN clientes.fecha_nacimiento IS 'Fecha de nacimiento del cliente para campañas de cumpleaños';

-- Verificar que se agregaron correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes'
AND column_name IN ('codigo_postal', 'fecha_nacimiento');
