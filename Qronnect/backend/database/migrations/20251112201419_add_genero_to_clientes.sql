-- Migration: Añadir campo género a la tabla clientes
-- Fecha: 2025-11-12
-- Descripción: Agrega columna 'genero' para análisis demográfico

-- Añadir columna genero a la tabla clientes
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS genero VARCHAR(20);

-- Añadir comentario a la columna
COMMENT ON COLUMN clientes.genero IS 'Género del cliente: masculino, femenino, otro, prefiero_no_decir';

-- Crear índice para mejorar queries de análisis por género
CREATE INDEX IF NOT EXISTS idx_clientes_genero ON clientes(genero);

-- Actualizar tabla para permitir NULL (opcional, ya que es el default)
-- Los clientes existentes tendrán NULL hasta que actualicen su perfil
