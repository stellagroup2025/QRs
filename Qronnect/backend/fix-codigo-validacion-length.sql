-- ============================================================================
-- FIX: Aumentar tamaño del campo codigo_validacion
-- ============================================================================
--
-- PROBLEMA: El campo 'codigo_validacion' está definido como VARCHAR(6)
-- pero el token generado tiene 64 caracteres (32 bytes en hex).
--
-- ERROR: value too long for type character varying(6)
--
-- SOLUCIÓN: Cambiar a VARCHAR(64) para almacenar el token completo
--
-- IMPACTO: Sin impacto en datos existentes. Los tokens son temporales.
--
-- ============================================================================

-- Aumentar tamaño del campo codigo_validacion de VARCHAR(6) a VARCHAR(64)
ALTER TABLE clientes
ALTER COLUMN codigo_validacion TYPE VARCHAR(64);

-- Verificar el cambio
SELECT
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name = 'codigo_validacion';

-- Resultado esperado:
-- column_name         | data_type         | character_maximum_length
-- ------------------- | ----------------- | ------------------------
-- codigo_validacion   | character varying | 64
