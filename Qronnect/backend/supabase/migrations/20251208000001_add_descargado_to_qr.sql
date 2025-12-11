-- Add downloaded status tracking to qr_codes_pool
ALTER TABLE qr_codes_pool 
ADD COLUMN IF NOT EXISTS descargado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fecha_descarga TIMESTAMPTZ;

-- Refresh cached schema if necessary
NOTIFY pgrst, 'reload schema';
