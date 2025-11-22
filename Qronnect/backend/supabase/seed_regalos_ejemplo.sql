-- ============================================
-- DATOS DE EJEMPLO - REGALOS CONCRETOS Y MILESTONES
-- ============================================
-- Ejecutar DESPUÉS de aplicar la migración 20251122000004

-- Nota: Reemplaza {ID_TIENDA} con el UUID real de tu tienda
-- Puedes obtenerlo con: SELECT id, nombre FROM tiendas;

-- ============================================
-- 1. Catálogo de Regalos Concretos
-- ============================================

-- Ejemplo para una CAFETERÍA
INSERT INTO regalos_catalogo (id_tienda, nombre, descripcion, tipo, detalles, instrucciones_canje, icono, dias_validez)
VALUES
  -- Café gratis
  (
    '{ID_TIENDA}',
    'Café Gratis',
    'Un café de cualquier tamaño, gratis',
    'producto',
    '{"producto": "Café (cualquier tamaño)", "cantidad": 1, "valor_aprox": "2.50€"}'::jsonb,
    'Presenta este cupón en caja antes de ordenar. Válido para cualquier café de la carta.',
    'coffee',
    30
  ),
  -- Pastry gratis
  (
    '{ID_TIENDA}',
    'Pastry Gratis',
    'Un croissant, muffin o cookie gratis',
    'producto',
    '{"producto": "Pastry a elección", "cantidad": 1, "valor_aprox": "3.00€"}'::jsonb,
    'Elige tu pastry favorito y muestra este cupón.',
    'croissant',
    30
  ),
  -- Descuento 20%
  (
    '{ID_TIENDA}',
    'Descuento 20%',
    '20% de descuento en tu próxima compra',
    'descuento',
    '{"porcentaje": 20, "monto_fijo": null, "min_compra": 5}'::jsonb,
    'Muestra este cupón antes de pagar. Compra mínima: 5€',
    'percent',
    60
  );

-- Ejemplo para una PERFUMERÍA
INSERT INTO regalos_catalogo (id_tienda, nombre, descripcion, tipo, detalles, instrucciones_canje, icono, dias_validez)
VALUES
  -- Muestra gratis
  (
    '{ID_TIENDA}',
    'Muestra de Perfume Gratis',
    'Una muestra de la fragancia que elijas',
    'producto',
    '{"producto": "Muestra de perfume", "cantidad": 1, "valor_aprox": "0€", "ml": "2ml"}'::jsonb,
    'Elige tu fragancia favorita y recibe una muestra de 2ml gratis.',
    'sparkles',
    90
  ),
  -- Mini facial
  (
    '{ID_TIENDA}',
    'Mini Facial Gratis',
    'Limpieza facial express de 15 minutos',
    'servicio',
    '{"servicio": "Mini Facial", "duracion_min": 15, "valor_aprox": "15€"}'::jsonb,
    'Agenda tu cita con anticipación. Sujeto a disponibilidad.',
    'smile',
    60
  ),
  -- Descuento en compra
  (
    '{ID_TIENDA}',
    'Descuento 15%',
    '15% de descuento en productos de skincare',
    'descuento',
    '{"porcentaje": 15, "categoria": "skincare", "min_compra": 20}'::jsonb,
    'Válido solo en productos de skincare. Compra mínima: 20€',
    'gift',
    30
  );

-- Ejemplo para un RESTAURANTE
INSERT INTO regalos_catalogo (id_tienda, nombre, descripcion, tipo, detalles, instrucciones_canje, icono, dias_validez)
VALUES
  -- Postre gratis
  (
    '{ID_TIENDA}',
    'Postre Gratis',
    'Un postre del menú gratis',
    'producto',
    '{"producto": "Postre del menú", "cantidad": 1, "valor_aprox": "5€"}'::jsonb,
    'Válido al consumir un plato principal. Elige tu postre favorito.',
    'cake',
    45
  ),
  -- Bebida gratis
  (
    '{ID_TIENDA}',
    'Bebida Gratis',
    'Una bebida (refresco o jugo) gratis',
    'producto',
    '{"producto": "Bebida", "cantidad": 1, "excluye": "alcohol", "valor_aprox": "3€"}'::jsonb,
    'Elige refresco o jugo natural. No incluye bebidas alcohólicas.',
    'glass-water',
    30
  ),
  -- Descuento en cuenta
  (
    '{ID_TIENDA}',
    'Descuento 10%',
    '10% de descuento en tu cuenta total',
    'descuento',
    '{"porcentaje": 10, "monto_fijo": null, "min_compra": 15}'::jsonb,
    'Aplica en toda la cuenta. Compra mínima: 15€. No acumulable.',
    'ticket-percent',
    30
  );

-- Ejemplo para un GIMNASIO
INSERT INTO regalos_catalogo (id_tienda, nombre, descripcion, tipo, detalles, instrucciones_canje, icono, dias_validez)
VALUES
  -- Clase gratis
  (
    '{ID_TIENDA}',
    'Clase Gratis',
    'Una clase grupal gratis de la que elijas',
    'servicio',
    '{"servicio": "Clase grupal", "cantidad": 1, "valor_aprox": "10€"}'::jsonb,
    'Reserva tu clase con anticipación. Sujeto a disponibilidad.',
    'dumbbell',
    60
  ),
  -- Smoothie proteico
  (
    '{ID_TIENDA}',
    'Smoothie Proteico Gratis',
    'Un smoothie post-entrenamiento gratis',
    'producto',
    '{"producto": "Smoothie proteico", "cantidad": 1, "valor_aprox": "5€"}'::jsonb,
    'Disponible en el bar del gym después de tu entrenamiento.',
    'milk',
    30
  ),
  -- Sesión con entrenador
  (
    '{ID_TIENDA}',
    'Sesión con Entrenador',
    '30 minutos con entrenador personal gratis',
    'servicio',
    '{"servicio": "Sesión PT", "duracion_min": 30, "valor_aprox": "25€"}'::jsonb,
    'Agenda tu sesión. Incluye plan de entrenamiento personalizado.',
    'user-check',
    90
  );

-- ============================================
-- 2. Milestones de Referidos (Ejemplos)
-- ============================================

-- Para CAFETERÍA
INSERT INTO milestones_referidos (id_tienda, nombre, descripcion, cantidad_referidos, tipo_recompensa, id_regalo, puntos, orden)
VALUES
  -- Milestone 1: 3 amigos
  (
    '{ID_TIENDA}',
    'Invita 3 amigos',
    'Invita a 3 amigos y llévate un café gratis',
    3,
    'regalo_concreto',
    (SELECT id FROM regalos_catalogo WHERE nombre = 'Café Gratis' AND id_tienda = '{ID_TIENDA}' LIMIT 1),
    NULL,
    1
  ),
  -- Milestone 2: 6 amigos
  (
    '{ID_TIENDA}',
    'Invita 6 amigos',
    'Invita a 6 amigos y llévate un pastry gratis + 50 puntos',
    6,
    'ambos',
    (SELECT id FROM regalos_catalogo WHERE nombre = 'Pastry Gratis' AND id_tienda = '{ID_TIENDA}' LIMIT 1),
    50,
    2
  ),
  -- Milestone 3: 10 amigos
  (
    '{ID_TIENDA}',
    'Invita 10 amigos',
    'Invita a 10 amigos y llévate 20% de descuento',
    10,
    'regalo_concreto',
    (SELECT id FROM regalos_catalogo WHERE nombre = 'Descuento 20%' AND id_tienda = '{ID_TIENDA}' LIMIT 1),
    NULL,
    3
  );

-- Para PERFUMERÍA
INSERT INTO milestones_referidos (id_tienda, nombre, descripcion, cantidad_referidos, tipo_recompensa, id_regalo, puntos, orden)
VALUES
  -- Milestone 1: 2 amigos
  (
    '{ID_TIENDA}',
    'Invita 2 amigas',
    'Invita a 2 amigas y llévate una muestra de perfume gratis',
    2,
    'regalo_concreto',
    (SELECT id FROM regalos_catalogo WHERE nombre = 'Muestra de Perfume Gratis' AND id_tienda = '{ID_TIENDA}' LIMIT 1),
    NULL,
    1
  ),
  -- Milestone 2: 5 amigos
  (
    '{ID_TIENDA}',
    'Invita 5 amigas',
    'Invita a 5 amigas y llévate un mini facial gratis',
    5,
    'regalo_concreto',
    (SELECT id FROM regalos_catalogo WHERE nombre = 'Mini Facial Gratis' AND id_tienda = '{ID_TIENDA}' LIMIT 1),
    NULL,
    2
  ),
  -- Milestone 3: 10 amigos
  (
    '{ID_TIENDA}',
    'Invita 10 amigas',
    'Invita a 10 amigas y llévate 15% de descuento + 100 puntos',
    10,
    'ambos',
    (SELECT id FROM regalos_catalogo WHERE nombre = 'Descuento 15%' AND id_tienda = '{ID_TIENDA}' LIMIT 1),
    100,
    3
  );

-- Para RESTAURANTE
INSERT INTO milestones_referidos (id_tienda, nombre, descripcion, cantidad_referidos, tipo_recompensa, id_regalo, puntos, orden)
VALUES
  -- Milestone 1: 3 amigos
  (
    '{ID_TIENDA}',
    'Invita 3 amigos',
    'Invita a 3 amigos y llévate una bebida gratis',
    3,
    'regalo_concreto',
    (SELECT id FROM regalos_catalogo WHERE nombre = 'Bebida Gratis' AND id_tienda = '{ID_TIENDA}' LIMIT 1),
    NULL,
    1
  ),
  -- Milestone 2: 5 amigos
  (
    '{ID_TIENDA}',
    'Invita 5 amigos',
    'Invita a 5 amigos y llévate un postre gratis',
    5,
    'regalo_concreto',
    (SELECT id FROM regalos_catalogo WHERE nombre = 'Postre Gratis' AND id_tienda = '{ID_TIENDA}' LIMIT 1),
    NULL,
    2
  ),
  -- Milestone 3: 10 amigos
  (
    '{ID_TIENDA}',
    'Invita 10 amigos',
    'Invita a 10 amigos y llévate 10% de descuento',
    10,
    'regalo_concreto',
    (SELECT id FROM regalos_catalogo WHERE nombre = 'Descuento 10%' AND id_tienda = '{ID_TIENDA}' LIMIT 1),
    NULL,
    3
  );

-- Para GIMNASIO
INSERT INTO milestones_referidos (id_tienda, nombre, descripcion, cantidad_referidos, tipo_recompensa, id_regalo, puntos, orden)
VALUES
  -- Milestone 1: 2 amigos
  (
    '{ID_TIENDA}',
    'Invita 2 amigos',
    'Invita a 2 amigos y llévate un smoothie proteico gratis',
    2,
    'regalo_concreto',
    (SELECT id FROM regalos_catalogo WHERE nombre = 'Smoothie Proteico Gratis' AND id_tienda = '{ID_TIENDA}' LIMIT 1),
    NULL,
    1
  ),
  -- Milestone 2: 5 amigos
  (
    '{ID_TIENDA}',
    'Invita 5 amigos',
    'Invita a 5 amigos y llévate una clase gratis',
    5,
    'regalo_concreto',
    (SELECT id FROM regalos_catalogo WHERE nombre = 'Clase Gratis' AND id_tienda = '{ID_TIENDA}' LIMIT 1),
    NULL,
    2
  ),
  -- Milestone 3: 10 amigos
  (
    '{ID_TIENDA}',
    'Invita 10 amigos',
    'Invita a 10 amigos y llévate una sesión con entrenador personal',
    10,
    'regalo_concreto',
    (SELECT id FROM regalos_catalogo WHERE nombre = 'Sesión con Entrenador' AND id_tienda = '{ID_TIENDA}' LIMIT 1),
    NULL,
    3
  );

-- ============================================
-- 3. Configurar Regalo de Bienvenida Concreto (Opcional)
-- ============================================

-- Ejemplo: Otorgar un café gratis como regalo de bienvenida
UPDATE tiendas
SET
  regalo_bienvenida_activo = true,
  regalo_bienvenida_tipo = 'regalo_concreto', -- Nuevo tipo
  regalo_bienvenida_id_regalo = (
    SELECT id FROM regalos_catalogo
    WHERE nombre = 'Café Gratis'
    AND id_tienda = '{ID_TIENDA}'
    LIMIT 1
  )
WHERE id = '{ID_TIENDA}';

-- O mantener el sistema de puntos actual y solo añadir milestones
-- UPDATE tiendas SET regalo_bienvenida_tipo = 'puntos' WHERE id = '{ID_TIENDA}';

COMMIT;
