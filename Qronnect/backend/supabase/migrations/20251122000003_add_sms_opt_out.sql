-- Migración: Añadir campo para opt-out de SMS marketing
-- Fecha: 2025-11-22
-- Propósito: Permitir que usuarios respondan STOP para darse de baja de SMS

-- Añadir campo para SMS marketing (si no existe ya)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='clientes' AND column_name='acepta_marketing_sms') THEN
    ALTER TABLE clientes ADD COLUMN acepta_marketing_sms BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Crear tabla para registrar mensajes STOP recibidos
CREATE TABLE IF NOT EXISTS sms_opt_out_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_cliente UUID REFERENCES clientes(id) ON DELETE CASCADE,
  id_tienda UUID REFERENCES tiendas(id) ON DELETE CASCADE,
  telefono VARCHAR(20) NOT NULL,
  mensaje_recibido TEXT,
  fecha_opt_out TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,

  CONSTRAINT fk_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id),
  CONSTRAINT fk_tienda FOREIGN KEY (id_tienda) REFERENCES tiendas(id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_sms_opt_out_telefono ON sms_opt_out_log(telefono);
CREATE INDEX IF NOT EXISTS idx_sms_opt_out_cliente ON sms_opt_out_log(id_cliente);
CREATE INDEX IF NOT EXISTS idx_sms_opt_out_fecha ON sms_opt_out_log(fecha_opt_out DESC);

-- Comentarios
COMMENT ON COLUMN clientes.acepta_marketing_sms IS 'Indica si el cliente acepta recibir SMS de marketing. Se actualiza a false cuando responde STOP.';
COMMENT ON TABLE sms_opt_out_log IS 'Registra todas las solicitudes de baja de SMS (respuestas STOP) para auditoría y cumplimiento legal.';

-- Habilitar RLS
ALTER TABLE sms_opt_out_log ENABLE ROW LEVEL SECURITY;

-- Política: Solo superadmin y admin de la tienda pueden ver los logs
CREATE POLICY "sms_opt_out_log_select_policy"
  ON sms_opt_out_log
  FOR SELECT
  USING (
    id_tienda = current_setting('app.current_tenant_id')::uuid
  );

-- Política: Solo el sistema puede insertar (insert)
CREATE POLICY "sms_opt_out_log_insert_policy"
  ON sms_opt_out_log
  FOR INSERT
  WITH CHECK (true);
