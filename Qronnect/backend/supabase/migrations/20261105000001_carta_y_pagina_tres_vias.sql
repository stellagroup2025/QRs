-- ============================================
-- Restaurantes: página QR de 3 vías + carta online
-- ============================================
-- El QR del local lleva a una página tipo "linktree" con tres botones:
--   1. Reseñar en Google   (tiendas.google_reviews_url, ya existía)
--   2. Fidelización        (tarjeta de sellos, ya existía)
--   3. Carta online        (tablas nuevas carta_categorias y carta_platos)
-- Solo el backend (service role) lee y escribe estas tablas.

-- --------------------------------------------
-- Qué muestra la portada de la tienda
-- --------------------------------------------
-- 'landing'   → la página completa de antes
-- 'tres_vias' → la página de 3 botones
-- Las tiendas que ya existen se quedan como estaban; las nuevas arrancan en 'tres_vias'.
ALTER TABLE public.tiendas
  ADD COLUMN IF NOT EXISTS pagina_inicio TEXT NOT NULL DEFAULT 'landing'
    CHECK (pagina_inicio IN ('landing', 'tres_vias'));

ALTER TABLE public.tiendas ALTER COLUMN pagina_inicio SET DEFAULT 'tres_vias';

COMMENT ON COLUMN public.tiendas.pagina_inicio IS 'Portada pública de la tienda: landing completa o página de 3 vías (reseña, fidelización, carta)';

-- --------------------------------------------
-- Categorías de la carta (Entrantes, Principales, Postres...)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS public.carta_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carta_categorias_tienda ON public.carta_categorias (id_tienda, orden);

-- --------------------------------------------
-- Platos
-- --------------------------------------------
-- alergenos: códigos de los 14 alérgenos de declaración obligatoria (Reglamento UE 1169/2011)
CREATE TABLE IF NOT EXISTS public.carta_platos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tienda UUID NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  id_categoria UUID NOT NULL REFERENCES public.carta_categorias(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(10, 2),
  imagen_url TEXT,
  alergenos TEXT[] NOT NULL DEFAULT '{}',
  etiquetas TEXT[] NOT NULL DEFAULT '{}',
  destacado BOOLEAN NOT NULL DEFAULT FALSE,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carta_platos_categoria ON public.carta_platos (id_categoria, orden);
CREATE INDEX IF NOT EXISTS idx_carta_platos_tienda ON public.carta_platos (id_tienda);

-- Sin políticas: nadie accede con la clave pública; el backend usa la service role
ALTER TABLE public.carta_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carta_platos ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.carta_categorias IS 'Secciones de la carta online de cada restaurante';
COMMENT ON TABLE public.carta_platos IS 'Platos de la carta online, con precio, foto y alérgenos';
