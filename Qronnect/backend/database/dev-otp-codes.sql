-- Tabla temporal para códigos OTP en desarrollo
-- Esto es solo para DESARROLLO, en producción se usaría un servicio de email real

CREATE TABLE IF NOT EXISTS dev_otp_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  codigo TEXT NOT NULL,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expira_en TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '10 minutes',
  usado BOOLEAN DEFAULT FALSE
);

-- Índice para búsqueda rápida por email
CREATE INDEX IF NOT EXISTS idx_dev_otp_email ON dev_otp_codes(email);

-- Limpiar códigos expirados automáticamente (ejecutar manualmente o con un cron)
-- DELETE FROM dev_otp_codes WHERE expira_en < NOW();
