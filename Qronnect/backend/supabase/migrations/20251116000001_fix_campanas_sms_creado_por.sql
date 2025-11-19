-- Hacer que el campo creado_por sea nullable en campanas_sms
-- El admin_users no está en auth.users, así que permitimos NULL temporalmente

ALTER TABLE campanas_sms ALTER COLUMN creado_por DROP NOT NULL;

-- Comentario para futuro: considerar cambiar la FK a admin_users o usuarios_tienda
COMMENT ON COLUMN campanas_sms.creado_por IS 'ID del usuario que creó la campaña (puede ser NULL si no está en auth.users)';
