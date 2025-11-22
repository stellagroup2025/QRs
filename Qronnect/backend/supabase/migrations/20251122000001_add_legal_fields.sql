-- Migración: Añadir campos legales a tabla tiendas
-- Fecha: 2025-11-22
-- Propósito: Cumplimiento LSSI Art. 10 (Aviso Legal)

-- Añadir campos para información legal del comercio
ALTER TABLE tiendas
ADD COLUMN IF NOT EXISTS nif VARCHAR(20),
ADD COLUMN IF NOT EXISTS razon_social VARCHAR(255),
ADD COLUMN IF NOT EXISTS datos_registrales TEXT;

-- Comentarios para documentar los campos
COMMENT ON COLUMN tiendas.nif IS 'NIF/CIF del comercio (obligatorio para Aviso Legal según LSSI)';
COMMENT ON COLUMN tiendas.razon_social IS 'Razón social completa (para sociedades mercantiles)';
COMMENT ON COLUMN tiendas.datos_registrales IS 'Datos de inscripción registral (ej: Registro Mercantil de Madrid, Tomo X, Folio Y, Hoja Z)';

-- Índice para búsquedas por NIF (útil para admin)
CREATE INDEX IF NOT EXISTS idx_tiendas_nif ON tiendas(nif);
