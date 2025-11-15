-- Desactivar RLS en la tabla usuarios_tienda
-- El superadmin debe poder gestionar usuarios sin restricciones
ALTER TABLE usuarios_tienda DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_tienda_2fa_codes DISABLE ROW LEVEL SECURITY;
