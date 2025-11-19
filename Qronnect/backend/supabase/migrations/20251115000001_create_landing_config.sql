-- =====================================================
-- Migración: Configuración de Textos de Landing Page
-- Fecha: 2025-11-15
-- Descripción: Tabla para configurar todos los textos
--              de la landing page por tienda
-- =====================================================

-- Crear tabla de configuración de landing
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

-- Índices
CREATE INDEX idx_landing_config_tienda ON landing_config(id_tienda);
CREATE INDEX idx_landing_config_activo ON landing_config(activo);

-- RLS Policies
ALTER TABLE landing_config ENABLE ROW LEVEL SECURITY;

-- Policy: SuperAdmin puede ver todo
CREATE POLICY "superadmin_select_landing_config"
    ON landing_config
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM superadmin_users
            WHERE superadmin_users.supabase_user_id = auth.uid()
            AND superadmin_users.activo = true
        )
    );

-- Policy: SuperAdmin puede insertar
CREATE POLICY "superadmin_insert_landing_config"
    ON landing_config
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM superadmin_users
            WHERE superadmin_users.supabase_user_id = auth.uid()
            AND superadmin_users.activo = true
        )
    );

-- Policy: SuperAdmin puede actualizar
CREATE POLICY "superadmin_update_landing_config"
    ON landing_config
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM superadmin_users
            WHERE superadmin_users.supabase_user_id = auth.uid()
            AND superadmin_users.activo = true
        )
    );

-- Policy: Admin puede ver solo su tienda
CREATE POLICY "admin_select_landing_config"
    ON landing_config
    FOR SELECT
    USING (
        id_tienda IN (
            SELECT id_tienda FROM admin_users
            WHERE admin_users.supabase_user_id = auth.uid()
            AND admin_users.activo = true
        )
    );

-- Policy: Admin puede actualizar solo su tienda
CREATE POLICY "admin_update_landing_config"
    ON landing_config
    FOR UPDATE
    USING (
        id_tienda IN (
            SELECT id_tienda FROM admin_users
            WHERE admin_users.supabase_user_id = auth.uid()
            AND admin_users.activo = true
        )
    );

-- Policy: Acceso público para lectura (sin autenticación)
CREATE POLICY "public_select_landing_config"
    ON landing_config
    FOR SELECT
    TO anon
    USING (activo = true);

-- Función para auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_landing_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER landing_config_updated_at
    BEFORE UPDATE ON landing_config
    FOR EACH ROW
    EXECUTE FUNCTION update_landing_config_updated_at();

-- Insertar configuración por defecto para todas las tiendas existentes
INSERT INTO landing_config (id_tienda)
SELECT id FROM tiendas
WHERE NOT EXISTS (
    SELECT 1 FROM landing_config WHERE landing_config.id_tienda = tiendas.id
);

-- Comentarios
COMMENT ON TABLE landing_config IS 'Configuración personalizable de textos para la landing page por tienda';
COMMENT ON COLUMN landing_config.id_tienda IS 'Referencia a la tienda propietaria';
COMMENT ON COLUMN landing_config.activo IS 'Si la configuración está activa y visible públicamente';
