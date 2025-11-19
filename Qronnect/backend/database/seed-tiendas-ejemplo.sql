-- =====================================================
-- SEED: Tiendas de Ejemplo por Sectores
-- Fecha: 2025-11-15
-- Descripción: Inserta datos de ejemplo de tiendas de diferentes sectores
--              para demostración del sistema de fidelización
-- =====================================================
--
-- IMPORTANTE: Este script es IDEMPOTENTE
-- Usa INSERT ... ON CONFLICT para que puedas ejecutarlo múltiples veces
-- sin duplicar datos. Se basa en el campo UNIQUE 'dominio'
--
-- Ejecución:
--   - Opción 1: Copiar y pegar en Supabase SQL Editor
--   - Opción 2: psql -h <host> -U postgres -d postgres -f seed-tiendas-ejemplo.sql
-- =====================================================

-- =====================================================
-- SECTOR: BELLEZA & BIENESTAR
-- =====================================================

-- Peluquería Style&Cut
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Peluquería Style&Cut',
  'stylecut',
  'Style&Cut',
  'Calle Moda 15, Madrid 28001',
  '+34 912 345 001',
  'info@stylecut.com',
  '#E91E63',  -- Rosa
  '#C2185B',  -- Rosa oscuro
  '#F48FB1',  -- Rosa claro
  'profesional',
  true,
  jsonb_build_object(
    'puntos_por_euro', 2,
    'sector', 'belleza',
    'es_demo', true,
    'horario', 'L-V 10:00-20:00, S 10:00-14:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Barbería UrbanCut
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Barbería UrbanCut',
  'urbancut',
  'UrbanCut Barbershop',
  'Avenida Hipster 42, Barcelona 08001',
  '+34 933 456 002',
  'hola@urbancut.com',
  '#263238',  -- Gris oscuro
  '#37474F',  -- Gris medio
  '#B71C1C',  -- Rojo
  'basico',
  true,
  jsonb_build_object(
    'puntos_por_euro', 1,
    'sector', 'belleza',
    'es_demo', true,
    'horario', 'L-S 9:00-21:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Centro de Estética BellaSkin
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Centro de Estética BellaSkin',
  'bellaskin',
  'BellaSkin Estética',
  'Paseo de la Belleza 8, Valencia 46001',
  '+34 963 567 003',
  'contacto@bellaskin.com',
  '#9C27B0',  -- Púrpura
  '#7B1FA2',  -- Púrpura oscuro
  '#CE93D8',  -- Púrpura claro
  'profesional',
  true,
  jsonb_build_object(
    'puntos_por_euro', 3,
    'sector', 'belleza',
    'es_demo', true,
    'horario', 'L-V 10:00-20:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Uñas Perfect Nails
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Uñas Perfect Nails',
  'perfectnails',
  'Perfect Nails Studio',
  'Calle Glamour 23, Sevilla 41001',
  '+34 954 678 004',
  'info@perfectnails.com',
  '#FF4081',  -- Rosa fucsia
  '#F50057',  -- Rosa fucsia oscuro
  '#FF80AB',  -- Rosa fucsia claro
  'basico',
  true,
  jsonb_build_object(
    'puntos_por_euro', 2,
    'sector', 'belleza',
    'es_demo', true,
    'horario', 'L-S 10:00-20:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Spa AquaRelax
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Spa AquaRelax',
  'aquarelax',
  'AquaRelax Wellness Spa',
  'Calle Tranquilidad 5, Málaga 29001',
  '+34 952 789 005',
  'reservas@aquarelax.com',
  '#00BCD4',  -- Cyan
  '#0097A7',  -- Cyan oscuro
  '#80DEEA',  -- Cyan claro
  'profesional',
  true,
  jsonb_build_object(
    'puntos_por_euro', 5,
    'sector', 'bienestar',
    'es_demo', true,
    'horario', 'L-D 9:00-22:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Óptica VisiónPlus
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Óptica VisiónPlus',
  'visionplus',
  'VisiónPlus Ópticas',
  'Plaza de la Vista 12, Zaragoza 50001',
  '+34 976 890 006',
  'info@visionplus.com',
  '#3F51B5',  -- Índigo
  '#303F9F',  -- Índigo oscuro
  '#7986CB',  -- Índigo claro
  'profesional',
  true,
  jsonb_build_object(
    'puntos_por_euro', 2,
    'sector', 'salud',
    'es_demo', true,
    'horario', 'L-V 9:30-20:30, S 10:00-14:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- =====================================================
-- SECTOR: FOODIE & RESTAURACIÓN
-- =====================================================

-- Cafetería El Rincón
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Cafetería El Rincón',
  'elrincon',
  'El Rincón Café',
  'Calle del Café 7, Madrid 28002',
  '+34 915 901 007',
  'hola@elrincon.com',
  '#795548',  -- Marrón
  '#5D4037',  -- Marrón oscuro
  '#A1887F',  -- Marrón claro
  'basico',
  true,
  jsonb_build_object(
    'puntos_por_euro', 1,
    'sector', 'restauracion',
    'es_demo', true,
    'horario', 'L-D 7:00-22:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Heladería Dolce Frío
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Heladería Dolce Frío',
  'dolcefrio',
  'Dolce Frío Gelato',
  'Paseo Helado 18, Granada 18001',
  '+34 958 012 008',
  'info@dolcefrio.com',
  '#FF5722',  -- Naranja profundo
  '#E64A19',  -- Naranja oscuro
  '#FF8A65',  -- Naranja claro
  'basico',
  true,
  jsonb_build_object(
    'puntos_por_euro', 1,
    'sector', 'restauracion',
    'es_demo', true,
    'horario', 'L-D 11:00-23:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Restaurante La Parrilla
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Restaurante La Parrilla',
  'laparrilla',
  'La Parrilla Grill',
  'Avenida Gourmet 30, Bilbao 48001',
  '+34 944 123 009',
  'reservas@laparrilla.com',
  '#D32F2F',  -- Rojo
  '#C62828',  -- Rojo oscuro
  '#EF5350',  -- Rojo claro
  'profesional',
  true,
  jsonb_build_object(
    'puntos_por_euro', 2,
    'sector', 'restauracion',
    'es_demo', true,
    'horario', 'L-D 13:00-16:00, 20:00-23:30'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Pizzería Don Nápoli
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Pizzería Don Nápoli',
  'donnapoli',
  'Don Nápoli Pizzeria',
  'Calle Italia 25, Valencia 46002',
  '+34 963 234 010',
  'pedidos@donnapoli.com',
  '#4CAF50',  -- Verde
  '#388E3C',  -- Verde oscuro
  '#81C784',  -- Verde claro
  'basico',
  true,
  jsonb_build_object(
    'puntos_por_euro', 1,
    'sector', 'restauracion',
    'es_demo', true,
    'horario', 'L-D 12:00-16:00, 19:00-00:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Hamburguesería Burger&Co
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Hamburguesería Burger&Co',
  'burgerco',
  'Burger&Co',
  'Calle Sabrosa 11, Alicante 03001',
  '+34 965 345 011',
  'info@burgerco.com',
  '#FF9800',  -- Naranja
  '#F57C00',  -- Naranja oscuro
  '#FFB74D',  -- Naranja claro
  'basico',
  true,
  jsonb_build_object(
    'puntos_por_euro', 1,
    'sector', 'restauracion',
    'es_demo', true,
    'horario', 'L-D 12:00-00:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- =====================================================
-- SECTOR: MASCOTAS
-- =====================================================

-- Tienda de Mascotas Huella Feliz
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Tienda de Mascotas Huella Feliz',
  'huellafeliz',
  'Huella Feliz Pet Shop',
  'Calle Animalitos 9, Murcia 30001',
  '+34 968 456 012',
  'contacto@huellafeliz.com',
  '#8BC34A',  -- Verde lima
  '#689F38',  -- Verde lima oscuro
  '#AED581',  -- Verde lima claro
  'profesional',
  true,
  jsonb_build_object(
    'puntos_por_euro', 2,
    'sector', 'mascotas',
    'es_demo', true,
    'horario', 'L-S 10:00-20:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Peluquería Canina DoggyStyle
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Peluquería Canina DoggyStyle',
  'doggystyle',
  'DoggyStyle Grooming',
  'Avenida Peludos 14, Santander 39001',
  '+34 942 567 013',
  'info@doggystyle.com',
  '#03A9F4',  -- Azul claro
  '#0288D1',  -- Azul claro oscuro
  '#4FC3F7',  -- Azul claro claro
  'basico',
  true,
  jsonb_build_object(
    'puntos_por_euro', 1,
    'sector', 'mascotas',
    'es_demo', true,
    'horario', 'L-S 9:00-19:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Clínica Veterinaria VetCare
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Clínica Veterinaria VetCare',
  'vetcare',
  'VetCare Veterinaria',
  'Calle Salud Animal 6, Salamanca 37001',
  '+34 923 678 014',
  'urgencias@vetcare.com',
  '#009688',  -- Verde azulado
  '#00796B',  -- Verde azulado oscuro
  '#4DB6AC',  -- Verde azulado claro
  'profesional',
  true,
  jsonb_build_object(
    'puntos_por_euro', 3,
    'sector', 'mascotas',
    'es_demo', true,
    'horario', 'L-V 9:00-21:00, S 10:00-14:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- =====================================================
-- SECTOR: INFANTIL & FAMILIA
-- =====================================================

-- Juguetería MundoPeques
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Juguetería MundoPeques',
  'mundopeques',
  'MundoPeques Juguetes',
  'Plaza Diversión 3, Vigo 36001',
  '+34 986 789 015',
  'info@mundopeques.com',
  '#FFC107',  -- Ámbar
  '#FFA000',  -- Ámbar oscuro
  '#FFD54F',  -- Ámbar claro
  'basico',
  true,
  jsonb_build_object(
    'puntos_por_euro', 1,
    'sector', 'infantil',
    'es_demo', true,
    'horario', 'L-S 10:00-20:30, D 11:00-14:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Librería Infantil Cuentos&Más
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Librería Infantil Cuentos&Más',
  'cuentosmas',
  'Cuentos&Más Librería',
  'Calle Literatura 20, Oviedo 33001',
  '+34 985 890 016',
  'hola@cuentosmas.com',
  '#673AB7',  -- Púrpura profundo
  '#512DA8',  -- Púrpura profundo oscuro
  '#9575CD',  -- Púrpura profundo claro
  'basico',
  true,
  jsonb_build_object(
    'puntos_por_euro', 2,
    'sector', 'infantil',
    'es_demo', true,
    'horario', 'L-S 10:00-14:00, 17:00-20:30'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Peluquería Infantil PequeLook
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Peluquería Infantil PequeLook',
  'pequelook',
  'PequeLook Kids Salon',
  'Avenida Niños 17, La Coruña 15001',
  '+34 981 901 017',
  'citas@pequelook.com',
  '#EC407A',  -- Rosa
  '#D81B60',  -- Rosa oscuro
  '#F06292',  -- Rosa claro
  'basico',
  true,
  jsonb_build_object(
    'puntos_por_euro', 1,
    'sector', 'infantil',
    'es_demo', true,
    'horario', 'L-S 10:00-20:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- =====================================================
-- SECTOR: SALUD & DEPORTE
-- =====================================================

-- Gimnasio FitZone
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Gimnasio FitZone',
  'fitzone',
  'FitZone Gym',
  'Calle Fitness 28, Palma de Mallorca 07001',
  '+34 971 012 018',
  'info@fitzone.com',
  '#F44336',  -- Rojo
  '#D32F2F',  -- Rojo oscuro
  '#EF5350',  -- Rojo claro
  'profesional',
  true,
  jsonb_build_object(
    'puntos_por_euro', 3,
    'sector', 'deporte',
    'es_demo', true,
    'horario', 'L-V 6:00-23:00, S-D 8:00-21:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Centro de Fisioterapia FisioPlus
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Centro de Fisioterapia FisioPlus',
  'fisioplus',
  'FisioPlus Fisioterapia',
  'Calle Recuperación 10, Pamplona 31001',
  '+34 948 123 019',
  'citas@fisioplus.com',
  '#2196F3',  -- Azul
  '#1976D2',  -- Azul oscuro
  '#64B5F6',  -- Azul claro
  'profesional',
  true,
  jsonb_build_object(
    'puntos_por_euro', 4,
    'sector', 'salud',
    'es_demo', true,
    'horario', 'L-V 8:00-21:00, S 9:00-14:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- Tienda de Nutrición NutriShop
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  direccion,
  telefono,
  email,
  color_primario,
  color_secundario,
  color_acento,
  plan,
  activo,
  metadata
) VALUES (
  'Tienda de Nutrición NutriShop',
  'nutrishop',
  'NutriShop Nutrición',
  'Plaza Salud 4, Toledo 45001',
  '+34 925 234 020',
  'info@nutrishop.com',
  '#4CAF50',  -- Verde
  '#388E3C',  -- Verde oscuro
  '#66BB6A',  -- Verde claro
  'basico',
  true,
  jsonb_build_object(
    'puntos_por_euro', 2,
    'sector', 'nutricion',
    'es_demo', true,
    'horario', 'L-V 9:00-20:00, S 10:00-14:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  nombre_comercial = EXCLUDED.nombre_comercial,
  direccion = EXCLUDED.direccion,
  telefono = EXCLUDED.telefono,
  email = EXCLUDED.email,
  color_primario = EXCLUDED.color_primario,
  color_secundario = EXCLUDED.color_secundario,
  color_acento = EXCLUDED.color_acento,
  plan = EXCLUDED.plan,
  metadata = EXCLUDED.metadata,
  actualizado_en = NOW();

-- =====================================================
-- CREAR CONFIGURACIÓN DE LANDING PARA CADA TIENDA
-- =====================================================
-- Esto crea automáticamente la configuración de landing page
-- para todas las tiendas de ejemplo con valores por defecto

INSERT INTO landing_config (id_tienda)
SELECT id FROM tiendas
WHERE metadata->>'es_demo' = 'true'
AND NOT EXISTS (
    SELECT 1 FROM landing_config WHERE landing_config.id_tienda = tiendas.id
);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Mostrar todas las tiendas de demo creadas
SELECT
  nombre,
  dominio,
  nombre_comercial,
  metadata->>'sector' as sector,
  plan,
  email,
  telefono,
  activo,
  metadata->>'es_demo' as es_demo
FROM tiendas
WHERE metadata->>'es_demo' = 'true'
ORDER BY metadata->>'sector', nombre;

-- Contar tiendas por sector
SELECT
  metadata->>'sector' as sector,
  COUNT(*) as total_tiendas
FROM tiendas
WHERE metadata->>'es_demo' = 'true'
GROUP BY metadata->>'sector'
ORDER BY total_tiendas DESC;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

COMMENT ON TABLE tiendas IS 'Comercios registrados en el sistema. Incluye tiendas de demostración marcadas con es_demo=true en metadata';

-- Mostrar resumen de ejecución
DO $$
BEGIN
  RAISE NOTICE '✅ Seed de tiendas de ejemplo completado';
  RAISE NOTICE '📊 Total de tiendas demo: %', (SELECT COUNT(*) FROM tiendas WHERE metadata->>'es_demo' = 'true');
  RAISE NOTICE '🎨 Sectores disponibles: belleza, bienestar, restauracion, mascotas, infantil, deporte, salud, nutricion';
END $$;
