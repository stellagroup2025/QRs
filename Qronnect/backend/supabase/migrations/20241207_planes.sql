-- Create planes table
CREATE TABLE IF NOT EXISTS public.planes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre TEXT NOT NULL,
    precio NUMERIC(10, 2) NOT NULL DEFAULT 0,
    divisa TEXT NOT NULL DEFAULT 'EUR',
    duracion_meses INTEGER NOT NULL DEFAULT 1,
    caracteristicas JSONB DEFAULT '{}'::jsonb,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default planes
INSERT INTO public.planes (nombre, precio, duracion_meses, caracteristicas) VALUES
('Plan Demo', 0, 2, '{"limite_tiendas": 1, "limite_clientes": 50, "analytics": false}'),
('Plan Starter', 29, 1, '{"limite_tiendas": 1, "limite_clientes": 500, "analytics": true}'),
('Plan Business', 79, 1, '{"limite_tiendas": 3, "limite_clientes": 2000, "analytics": true}'),
('Plan Enterprise', 150, 1, '{"limite_tiendas": 10, "limite_clientes": 10000, "analytics": true}');

-- Update tiendas table
ALTER TABLE public.tiendas 
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES public.planes(id),
ADD COLUMN IF NOT EXISTS estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'vencido', 'gratis'));

-- Enable RLS
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;

-- Policies for planes
CREATE POLICY "Public read planes" ON public.planes FOR SELECT USING (true);
CREATE POLICY "Superadmin manage planes" ON public.planes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.super_admins WHERE id = auth.uid())
);
