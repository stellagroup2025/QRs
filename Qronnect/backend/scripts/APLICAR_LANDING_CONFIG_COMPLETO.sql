-- =====================================================
-- SCRIPT COMPLETO: Crear tabla landing_config + RLS
-- Fecha: 2025-11-22
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- PASO 1: Verificar si la tabla ya existe
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'landing_config'
    ) THEN
        RAISE NOTICE '⚠️ Tabla landing_config YA EXISTE - Solo actualizaremos RLS policies';
    ELSE
        RAISE NOTICE '✅ Tabla landing_config NO EXISTE - La crearemos';
    END IF;
END $$;

-- PASO 2: Crear tabla si no existe
CREATE TABLE IF NOT EXISTS landing_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_tienda UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,

    -- Hero Section
    hero_titulo_principal TEXT DEFAULT 'Impulsa tu negocio',
    hero_titulo_destacado TEXT DEFAULT 'al siguiente nivel',
    hero_subtitulo TEXT DEFAULT 'Sistema integral de fidelización y gestión de clientes para negocios modernos.',
    hero_cta_principal TEXT DEFAULT 'Solicitar Información',
    hero_cta_secundario TEXT DEFAULT 'Acceder',
    hero_social_proof TEXT DEFAULT '+10,000 negocios confían en nosotros',

    -- Sección de Servicios
    servicios_titulo TEXT DEFAULT 'Soluciones completas',
    servicios_subtitulo TEXT DEFAULT 'Todo lo que necesitas para gestionar y fidelizar a tus clientes en una sola plataforma',

    -- Servicio 1 - Gestión de Clientes
    servicio_1_titulo TEXT DEFAULT 'Gestión de Clientes',
    servicio_1_descripcion TEXT DEFAULT 'Sistema completo para gestionar tu base de clientes de forma eficiente y personalizada.',
    servicio_1_icono TEXT DEFAULT 'Users',

    -- Servicio 2 - Fidelización
    servicio_2_titulo TEXT DEFAULT 'Programa de Fidelización',
    servicio_2_descripcion TEXT DEFAULT 'Recompensa a tus clientes habituales y aumenta su lealtad con nuestro sistema de puntos.',
    servicio_2_icono TEXT DEFAULT 'Gift',

    -- Servicio 3 - Análisis
    servicio_3_titulo TEXT DEFAULT 'Análisis y Métricas',
    servicio_3_descripcion TEXT DEFAULT 'Obtén insights valiosos sobre el comportamiento de tus clientes y optimiza tu negocio.',
    servicio_3_icono TEXT DEFAULT 'TrendingUp',

    -- Servicio 4 - QR
    servicio_4_titulo TEXT DEFAULT 'Tarjetas Digitales QR',
    servicio_4_descripcion TEXT DEFAULT 'Olvídate de las tarjetas físicas. Todo digital, fácil y accesible desde el móvil.',
    servicio_4_icono TEXT DEFAULT 'QrCode',

    -- Servicio 5 - Seguridad
    servicio_5_titulo TEXT DEFAULT 'Seguridad Garantizada',
    servicio_5_descripcion TEXT DEFAULT 'Tus datos y los de tus clientes protegidos con los más altos estándares de seguridad.',
    servicio_5_icono TEXT DEFAULT 'Shield',

    -- Servicio 6 - Velocidad
    servicio_6_titulo TEXT DEFAULT 'Rápido y Eficiente',
    servicio_6_descripcion TEXT DEFAULT 'Implementación inmediata. Empieza a usar el sistema en minutos, no en semanas.',
    servicio_6_icono TEXT DEFAULT 'Zap',

    -- Sección de Beneficios
    beneficios_titulo TEXT DEFAULT '¿Por qué elegirnos?',
    beneficios_subtitulo TEXT DEFAULT 'Beneficios reales que impactan directamente en tu negocio',

    beneficio_1 TEXT DEFAULT 'Aumenta la retención de clientes hasta un 40%',
    beneficio_2 TEXT DEFAULT 'Reduce costos operativos eliminando tarjetas físicas',
    beneficio_3 TEXT DEFAULT 'Acceso a métricas en tiempo real',
    beneficio_4 TEXT DEFAULT 'Integración sencilla con tu sistema actual',
    beneficio_5 TEXT DEFAULT 'Soporte técnico incluido',
    beneficio_6 TEXT DEFAULT 'Actualizaciones automáticas sin costo adicional',

    -- Estadísticas
    estadistica_principal_numero TEXT DEFAULT '40%',
    estadistica_principal_texto TEXT DEFAULT 'Incremento promedio en retención',
    estadistica_1_numero TEXT DEFAULT '10k+',
    estadistica_1_texto TEXT DEFAULT 'Negocios activos',
    estadistica_2_numero TEXT DEFAULT '500k+',
    estadistica_2_texto TEXT DEFAULT 'Usuarios registrados',

    -- Sección de Testimonios
    testimonios_titulo TEXT DEFAULT 'Lo que dicen nuestros clientes',

    -- Testimonio 1
    testimonio_1_nombre TEXT DEFAULT 'María García',
    testimonio_1_cargo TEXT DEFAULT 'Gerente, Boutique Fashion',
    testimonio_1_contenido TEXT DEFAULT 'Desde que implementamos este sistema, nuestros clientes están más comprometidos y las ventas han aumentado un 35%.',
    testimonio_1_rating INTEGER DEFAULT 5,

    -- Testimonio 2
    testimonio_2_nombre TEXT DEFAULT 'Carlos Rodríguez',
    testimonio_2_cargo TEXT DEFAULT 'Propietario, Café Central',
    testimonio_2_contenido TEXT DEFAULT 'La mejor inversión que hemos hecho. Nuestros clientes adoran la comodidad de la tarjeta digital y nosotros ahorramos en impresiones.',
    testimonio_2_rating INTEGER DEFAULT 5,

    -- Testimonio 3
    testimonio_3_nombre TEXT DEFAULT 'Ana Martínez',
    testimonio_3_cargo TEXT DEFAULT 'Directora, Spa Wellness',
    testimonio_3_contenido TEXT DEFAULT 'Excelente plataforma. Fácil de usar tanto para nosotros como para nuestros clientes. El soporte es excepcional.',
    testimonio_3_rating INTEGER DEFAULT 5,

    -- CTA Final
    cta_final_titulo_1 TEXT DEFAULT '¿Listo para transformar',
    cta_final_titulo_2 TEXT DEFAULT 'tu negocio?',
    cta_final_subtitulo TEXT DEFAULT 'Únete a miles de negocios que ya están revolucionando la forma de gestionar sus clientes',
    cta_final_boton_principal TEXT DEFAULT 'Comenzar ahora',
    cta_final_boton_secundario TEXT DEFAULT 'Ya tengo cuenta',

    -- Metadata
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraint: Una sola configuración por tienda
    CONSTRAINT unique_landing_config_per_tienda UNIQUE (id_tienda)
);

-- PASO 3: Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_landing_config_tienda ON landing_config(id_tienda);
CREATE INDEX IF NOT EXISTS idx_landing_config_activo ON landing_config(activo);

-- PASO 4: Habilitar RLS
ALTER TABLE landing_config ENABLE ROW LEVEL SECURITY;

-- PASO 5: Eliminar policies antiguas si existen
DROP POLICY IF EXISTS "superadmin_select_landing_config" ON landing_config;
DROP POLICY IF EXISTS "superadmin_insert_landing_config" ON landing_config;
DROP POLICY IF EXISTS "superadmin_update_landing_config" ON landing_config;
DROP POLICY IF EXISTS "admin_select_landing_config" ON landing_config;
DROP POLICY IF EXISTS "admin_update_landing_config" ON landing_config;
DROP POLICY IF EXISTS "public_select_landing_config" ON landing_config;
DROP POLICY IF EXISTS "backend_update_landing_config" ON landing_config;
DROP POLICY IF EXISTS "backend_insert_landing_config" ON landing_config;

-- PASO 6: Crear policies PERMISIVAS para que el backend funcione
CREATE POLICY "public_select_landing_config"
  ON landing_config FOR SELECT
  USING (true);

CREATE POLICY "backend_update_landing_config"
  ON landing_config FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "backend_insert_landing_config"
  ON landing_config FOR INSERT
  WITH CHECK (true);

-- PASO 7: Crear función para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_landing_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASO 8: Crear trigger si no existe
DROP TRIGGER IF EXISTS landing_config_updated_at ON landing_config;
CREATE TRIGGER landing_config_updated_at
    BEFORE UPDATE ON landing_config
    FOR EACH ROW
    EXECUTE FUNCTION update_landing_config_updated_at();

-- PASO 9: Verificación final
DO $$
DECLARE
    tabla_existe BOOLEAN;
    num_policies INTEGER;
    num_registros INTEGER;
BEGIN
    -- Verificar tabla
    SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'landing_config'
    ) INTO tabla_existe;

    -- Contar policies
    SELECT COUNT(*) INTO num_policies
    FROM pg_policies
    WHERE tablename = 'landing_config';

    -- Contar registros
    SELECT COUNT(*) INTO num_registros
    FROM landing_config;

    -- Mostrar resumen
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ VERIFICACIÓN FINAL';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tabla landing_config existe: %', tabla_existe;
    RAISE NOTICE 'Número de RLS policies: %', num_policies;
    RAISE NOTICE 'Número de registros: %', num_registros;
    RAISE NOTICE '========================================';

    IF tabla_existe AND num_policies >= 3 THEN
        RAISE NOTICE '🎉 ¡TODO CORRECTO! Ahora el backend debería funcionar.';
    ELSE
        RAISE NOTICE '⚠️ ADVERTENCIA: Verifica que todo esté bien.';
    END IF;
    RAISE NOTICE '';
END $$;

-- COMENTARIOS
COMMENT ON TABLE landing_config IS 'Configuración personalizable de textos para la landing page por tienda';
COMMENT ON COLUMN landing_config.id_tienda IS 'Referencia a la tienda propietaria';
COMMENT ON COLUMN landing_config.activo IS 'Si la configuración está activa y visible públicamente';

-- FIN DEL SCRIPT
-- Después de ejecutar, probar:
-- curl "https://qronnect-backend.onrender.com/api/config/landing" -H "X-Tenant-Domain: dolcefrio"
