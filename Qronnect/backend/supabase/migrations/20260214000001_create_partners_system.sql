-- ========================================================
-- Migration: Create Partners System
-- Description: Creates partners and suscripciones tables,
--              adds partner_id FK to tiendas and comerciales
-- ========================================================

-- 1. Partners table
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    cif VARCHAR(20),
    email_contacto VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    tier VARCHAR(20) NOT NULL DEFAULT 'bronze'
        CHECK (tier IN ('bronze', 'silver', 'gold')),
    max_licencias INTEGER NOT NULL DEFAULT 5,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo'
        CHECK (estado IN ('activo', 'suspendido', 'inactivo')),
    notas TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Suscripciones table
CREATE TABLE IF NOT EXISTS suscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tienda_id UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL DEFAULT 'basico'
        CHECK (plan IN ('basico', 'profesional', 'enterprise')),
    precio_mensual DECIMAL(10, 2) NOT NULL DEFAULT 29.00,
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'activa'
        CHECK (estado IN ('activa', 'suspendida', 'cancelada', 'expirada')),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Add partner_id to tiendas (nullable FK)
ALTER TABLE tiendas
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;

-- 4. Add partner_id to comerciales (nullable FK — links sales agents to partner orgs)
ALTER TABLE comerciales
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES partners(id) ON DELETE SET NULL;

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_partners_estado ON partners(estado);
CREATE INDEX IF NOT EXISTS idx_partners_tier ON partners(tier);
CREATE INDEX IF NOT EXISTS idx_suscripciones_partner_id ON suscripciones(partner_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_tienda_id ON suscripciones(tienda_id);
CREATE INDEX IF NOT EXISTS idx_suscripciones_estado ON suscripciones(estado);
CREATE INDEX IF NOT EXISTS idx_tiendas_partner_id ON tiendas(partner_id);
CREATE INDEX IF NOT EXISTS idx_comerciales_partner_id ON comerciales(partner_id);

-- 6. RLS Policies (disabled for now — all access through service role)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access to partners"
    ON partners FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access to suscripciones"
    ON suscripciones FOR ALL
    USING (true)
    WITH CHECK (true);

-- 7. Updated_at trigger for partners
CREATE OR REPLACE FUNCTION update_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_partners_updated_at();

-- 8. Updated_at trigger for suscripciones
CREATE OR REPLACE FUNCTION update_suscripciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_suscripciones_updated_at
    BEFORE UPDATE ON suscripciones
    FOR EACH ROW
    EXECUTE FUNCTION update_suscripciones_updated_at();
