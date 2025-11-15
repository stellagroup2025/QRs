-- ============================================
-- INSERT DE 20 CLIENTES DE DEMOSTRACIÓN
-- Variedad de edades, géneros y comportamientos
-- ============================================

-- Primero obtener el ID de la tienda 'lokeyokiera'
DO $$
DECLARE
  tienda_id UUID;
BEGIN
  -- Obtener el ID de la tienda
  SELECT id INTO tienda_id FROM tiendas WHERE dominio = 'lokeyokiera' LIMIT 1;
  
  IF tienda_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró la tienda lokeyokiera';
  END IF;

  -- Insertar 20 clientes con características variadas
  INSERT INTO clientes (id_tienda, nombre, email, telefono, fecha_nacimiento, genero, puntos_totales, fecha_registro, ultima_visita, activo) VALUES
    -- Clientes jóvenes (menores de 30)
    (tienda_id, 'María González', 'maria.gonzalez@email.com', '612345001', '1998-03-15', 'femenino', 450, NOW() - INTERVAL '6 months', NOW() - INTERVAL '5 days', TRUE),
    (tienda_id, 'Carlos Ruiz', 'carlos.ruiz@email.com', '612345002', '1997-07-22', 'masculino', 320, NOW() - INTERVAL '8 months', NOW() - INTERVAL '12 days', TRUE),
    (tienda_id, 'Laura Martínez', 'laura.martinez@email.com', '612345003', '2000-11-08', 'femenino', 890, NOW() - INTERVAL '1 year', NOW() - INTERVAL '2 days', TRUE),
    (tienda_id, 'Javier López', 'javier.lopez@email.com', '612345004', '1999-05-30', 'masculino', 150, NOW() - INTERVAL '3 months', NOW() - INTERVAL '45 days', TRUE),
    (tienda_id, 'Ana Sánchez', 'ana.sanchez@email.com', '612345005', '2001-01-12', 'femenino', 1200, NOW() - INTERVAL '2 years', NOW() - INTERVAL '1 day', TRUE),
    
    -- Clientes de mediana edad (30-45 años)
    (tienda_id, 'Roberto Fernández', 'roberto.fernandez@email.com', '612345006', '1985-09-18', 'masculino', 680, NOW() - INTERVAL '1 year', NOW() - INTERVAL '8 days', TRUE),
    (tienda_id, 'Carmen Díaz', 'carmen.diaz@email.com', '612345007', '1988-04-25', 'femenino', 540, NOW() - INTERVAL '9 months', NOW() - INTERVAL '3 days', TRUE),
    (tienda_id, 'Miguel Ángel Torres', 'miguel.torres@email.com', '612345008', '1990-12-03', 'masculino', 920, NOW() - INTERVAL '1.5 years', NOW() - INTERVAL '7 days', TRUE),
    (tienda_id, 'Patricia Ramírez', 'patricia.ramirez@email.com', '612345009', '1987-06-14', 'femenino', 1450, NOW() - INTERVAL '2.5 years', NOW() - INTERVAL '4 days', TRUE),
    (tienda_id, 'Francisco Moreno', 'francisco.moreno@email.com', '612345010', '1992-02-28', 'masculino', 380, NOW() - INTERVAL '5 months', NOW() - INTERVAL '65 days', TRUE),
    (tienda_id, 'Isabel García', 'isabel.garcia@email.com', '612345011', '1989-08-07', 'femenino', 760, NOW() - INTERVAL '1 year', NOW() - INTERVAL '10 days', TRUE),
    
    -- Clientes mayores (más de 45 años)
    (tienda_id, 'Antonio Jiménez', 'antonio.jimenez@email.com', '612345012', '1975-05-20', 'masculino', 2100, NOW() - INTERVAL '3 years', NOW() - INTERVAL '6 days', TRUE),
    (tienda_id, 'Mercedes Álvarez', 'mercedes.alvarez@email.com', '612345013', '1970-10-15', 'femenino', 1850, NOW() - INTERVAL '2.8 years', NOW() - INTERVAL '2 days', TRUE),
    (tienda_id, 'José Luis Romero', 'joseluis.romero@email.com', '612345014', '1968-03-22', 'masculino', 980, NOW() - INTERVAL '1.2 years', NOW() - INTERVAL '15 days', TRUE),
    (tienda_id, 'Dolores Navarro', 'dolores.navarro@email.com', '612345015', '1972-07-09', 'femenino', 1320, NOW() - INTERVAL '2 years', NOW() - INTERVAL '5 days', TRUE),
    (tienda_id, 'Rafael Serrano', 'rafael.serrano@email.com', '612345016', '1978-11-30', 'masculino', 640, NOW() - INTERVAL '10 months', NOW() - INTERVAL '20 days', TRUE),
    
    -- Clientes diversos (género otro o sin especificar)
    (tienda_id, 'Alex Rivera', 'alex.rivera@email.com', '612345017', '1995-04-18', 'otro', 420, NOW() - INTERVAL '7 months', NOW() - INTERVAL '9 days', TRUE),
    (tienda_id, 'Jordán Castillo', 'jordan.castillo@email.com', '612345018', '1993-09-05', 'prefiero_no_decir', 580, NOW() - INTERVAL '1 year', NOW() - INTERVAL '11 days', TRUE),
    
    -- Clientes nuevos (recién registrados)
    (tienda_id, 'Lucía Herrera', 'lucia.herrera@email.com', '612345019', '1996-12-20', 'femenino', 45, NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '3 days', TRUE),
    (tienda_id, 'David Molina', 'david.molina@email.com', '612345020', '1991-06-11', 'masculino', 30, NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 day', TRUE);

  RAISE NOTICE '✅ 20 clientes insertados correctamente para la tienda lokeyokiera';

END $$;

-- ============================================
-- INSERT DE COMPRAS PARA LOS CLIENTES DEMO
-- Variedad de tickets y frecuencias
-- ============================================

DO $$
DECLARE
  tienda_id UUID;
  cliente_maria UUID;
  cliente_carlos UUID;
  cliente_laura UUID;
  cliente_ana UUID;
  cliente_roberto UUID;
  cliente_carmen UUID;
  cliente_miguel UUID;
  cliente_patricia UUID;
  cliente_antonio UUID;
  cliente_mercedes UUID;
BEGIN
  -- Obtener IDs
  SELECT id INTO tienda_id FROM tiendas WHERE dominio = 'lokeyokiera' LIMIT 1;
  SELECT id INTO cliente_maria FROM clientes WHERE email = 'maria.gonzalez@email.com' AND id_tienda = tienda_id;
  SELECT id INTO cliente_carlos FROM clientes WHERE email = 'carlos.ruiz@email.com' AND id_tienda = tienda_id;
  SELECT id INTO cliente_laura FROM clientes WHERE email = 'laura.martinez@email.com' AND id_tienda = tienda_id;
  SELECT id INTO cliente_ana FROM clientes WHERE email = 'ana.sanchez@email.com' AND id_tienda = tienda_id;
  SELECT id INTO cliente_roberto FROM clientes WHERE email = 'roberto.fernandez@email.com' AND id_tienda = tienda_id;
  SELECT id INTO cliente_carmen FROM clientes WHERE email = 'carmen.diaz@email.com' AND id_tienda = tienda_id;
  SELECT id INTO cliente_miguel FROM clientes WHERE email = 'miguel.torres@email.com' AND id_tienda = tienda_id;
  SELECT id INTO cliente_patricia FROM clientes WHERE email = 'patricia.ramirez@email.com' AND id_tienda = tienda_id;
  SELECT id INTO cliente_antonio FROM clientes WHERE email = 'antonio.jimenez@email.com' AND id_tienda = tienda_id;
  SELECT id INTO cliente_mercedes FROM clientes WHERE email = 'mercedes.alvarez@email.com' AND id_tienda = tienda_id;

  -- Compras de María (cliente frecuente, ticket medio)
  INSERT INTO compras (id_cliente, id_tienda, fecha, importe, puntos_otorgados, notas) VALUES
    (cliente_maria, tienda_id, NOW() - INTERVAL '5 days', 45.00, 45, 'Perfume Chanel'),
    (cliente_maria, tienda_id, NOW() - INTERVAL '20 days', 38.50, 38, 'Crema facial'),
    (cliente_maria, tienda_id, NOW() - INTERVAL '35 days', 52.00, 52, 'Set de maquillaje'),
    (cliente_maria, tienda_id, NOW() - INTERVAL '50 days', 28.00, 28, 'Labial y sombras'),
    (cliente_maria, tienda_id, NOW() - INTERVAL '80 days', 65.00, 65, 'Perfume Carolina Herrera'),
    (cliente_maria, tienda_id, NOW() - INTERVAL '120 days', 42.00, 42, 'Tratamiento capilar');

  -- Compras de Carlos (cliente regular, ticket bajo)
  INSERT INTO compras (id_cliente, id_tienda, fecha, importe, puntos_otorgados, notas) VALUES
    (cliente_carlos, tienda_id, NOW() - INTERVAL '12 days', 22.00, 22, 'Colonia deportiva'),
    (cliente_carlos, tienda_id, NOW() - INTERVAL '45 days', 18.50, 18, 'Gel de ducha'),
    (cliente_carlos, tienda_id, NOW() - INTERVAL '90 days', 35.00, 35, 'Aftershave');

  -- Compras de Laura (cliente VIP, ticket alto)
  INSERT INTO compras (id_cliente, id_tienda, fecha, importe, puntos_otorgados, notas) VALUES
    (cliente_laura, tienda_id, NOW() - INTERVAL '2 days', 120.00, 120, 'Perfume Dior'),
    (cliente_laura, tienda_id, NOW() - INTERVAL '15 days', 85.00, 85, 'Set de cuidado facial'),
    (cliente_laura, tienda_id, NOW() - INTERVAL '28 days', 95.00, 95, 'Maquillaje profesional'),
    (cliente_laura, tienda_id, NOW() - INTERVAL '50 days', 110.00, 110, 'Perfume Guerlain'),
    (cliente_laura, tienda_id, NOW() - INTERVAL '75 days', 78.00, 78, 'Cremas y serums'),
    (cliente_laura, tienda_id, NOW() - INTERVAL '100 days', 92.00, 92, 'Tratamiento anti-edad'),
    (cliente_laura, tienda_id, NOW() - INTERVAL '150 days', 105.00, 105, 'Set de fragancias');

  -- Compras de Ana (cliente muy frecuente)
  INSERT INTO compras (id_cliente, id_tienda, fecha, importe, puntos_otorgados, notas) VALUES
    (cliente_ana, tienda_id, NOW() - INTERVAL '1 day', 55.00, 55, 'Perfume floral'),
    (cliente_ana, tienda_id, NOW() - INTERVAL '8 days', 48.00, 48, 'Crema hidratante'),
    (cliente_ana, tienda_id, NOW() - INTERVAL '18 days', 62.00, 62, 'Maquillaje'),
    (cliente_ana, tienda_id, NOW() - INTERVAL '30 days', 51.00, 51, 'Labiales premium'),
    (cliente_ana, tienda_id, NOW() - INTERVAL '45 days', 70.00, 70, 'Perfume importado'),
    (cliente_ana, tienda_id, NOW() - INTERVAL '60 days', 44.00, 44, 'Productos capilares'),
    (cliente_ana, tienda_id, NOW() - INTERVAL '90 days', 58.00, 58, 'Set facial'),
    (cliente_ana, tienda_id, NOW() - INTERVAL '120 days', 65.00, 65, 'Perfume día'),
    (cliente_ana, tienda_id, NOW() - INTERVAL '150 days', 72.00, 72, 'Crema nocturna'),
    (cliente_ana, tienda_id, NOW() - INTERVAL '200 days', 49.00, 49, 'Mascarillas');

  -- Compras de Roberto (cliente regular, ticket medio-alto)
  INSERT INTO compras (id_cliente, id_tienda, fecha, importe, puntos_otorgados, notas) VALUES
    (cliente_roberto, tienda_id, NOW() - INTERVAL '8 days', 68.00, 68, 'Perfume Hugo Boss'),
    (cliente_roberto, tienda_id, NOW() - INTERVAL '40 days', 55.00, 55, 'Set de afeitado'),
    (cliente_roberto, tienda_id, NOW() - INTERVAL '80 days', 72.00, 72, 'Colonia importada'),
    (cliente_roberto, tienda_id, NOW() - INTERVAL '150 days', 48.00, 48, 'Productos cuidado facial');

  -- Compras de Carmen (cliente frecuente)
  INSERT INTO compras (id_cliente, id_tienda, fecha, importe, puntos_otorgados, notas) VALUES
    (cliente_carmen, tienda_id, NOW() - INTERVAL '3 days', 42.00, 42, 'Perfume dulce'),
    (cliente_carmen, tienda_id, NOW() - INTERVAL '25 days', 38.00, 38, 'Maquillaje diario'),
    (cliente_carmen, tienda_id, NOW() - INTERVAL '55 days', 51.00, 51, 'Crema antiarrugas'),
    (cliente_carmen, tienda_id, NOW() - INTERVAL '90 days', 45.00, 45, 'Sérum facial'),
    (cliente_carmen, tienda_id, NOW() - INTERVAL '140 days', 58.00, 58, 'Set de noche');

  -- Compras de Miguel (cliente muy leal)
  INSERT INTO compras (id_cliente, id_tienda, fecha, importe, puntos_otorgados, notas) VALUES
    (cliente_miguel, tienda_id, NOW() - INTERVAL '7 days', 88.00, 88, 'Perfume Calvin Klein'),
    (cliente_miguel, tienda_id, NOW() - INTERVAL '35 days', 65.00, 65, 'Aftershave premium'),
    (cliente_miguel, tienda_id, NOW() - INTERVAL '70 days', 92.00, 92, 'Set cuidado masculino'),
    (cliente_miguel, tienda_id, NOW() - INTERVAL '110 days', 78.00, 78, 'Colonia verano'),
    (cliente_miguel, tienda_id, NOW() - INTERVAL '180 days', 85.00, 85, 'Perfume importado');

  -- Compras de Patricia (cliente VIP)
  INSERT INTO compras (id_cliente, id_tienda, fecha, importe, puntos_otorgados, notas) VALUES
    (cliente_patricia, tienda_id, NOW() - INTERVAL '4 days', 135.00, 135, 'Perfume Chanel N°5'),
    (cliente_patricia, tienda_id, NOW() - INTERVAL '22 days', 98.00, 98, 'Set anti-edad premium'),
    (cliente_patricia, tienda_id, NOW() - INTERVAL '45 days', 115.00, 115, 'Maquillaje profesional'),
    (cliente_patricia, tienda_id, NOW() - INTERVAL '75 days', 125.00, 125, 'Tratamiento facial completo'),
    (cliente_patricia, tienda_id, NOW() - INTERVAL '110 days', 88.00, 88, 'Perfume día y noche'),
    (cliente_patricia, tienda_id, NOW() - INTERVAL '160 days', 105.00, 105, 'Set de lujo');

  -- Compras de Antonio (cliente muy leal, ticket alto)
  INSERT INTO compras (id_cliente, id_tienda, fecha, importe, puntos_otorgados, notas) VALUES
    (cliente_antonio, tienda_id, NOW() - INTERVAL '6 days', 145.00, 145, 'Perfume Armani'),
    (cliente_antonio, tienda_id, NOW() - INTERVAL '30 days', 95.00, 95, 'Set cuidado premium'),
    (cliente_antonio, tienda_id, NOW() - INTERVAL '60 days', 120.00, 120, 'Colonia exclusiva'),
    (cliente_antonio, tienda_id, NOW() - INTERVAL '95 days', 110.00, 110, 'Aftershave de lujo'),
    (cliente_antonio, tienda_id, NOW() - INTERVAL '140 days', 125.00, 125, 'Perfume importado'),
    (cliente_antonio, tienda_id, NOW() - INTERVAL '200 days', 98.00, 98, 'Set completo');

  -- Compras de Mercedes (cliente VIP muy leal)
  INSERT INTO compras (id_cliente, id_tienda, fecha, importe, puntos_otorgados, notas) VALUES
    (cliente_mercedes, tienda_id, NOW() - INTERVAL '2 days', 128.00, 128, 'Perfume Dior J''adore'),
    (cliente_mercedes, tienda_id, NOW() - INTERVAL '18 days', 105.00, 105, 'Tratamiento rejuvenecedor'),
    (cliente_mercedes, tienda_id, NOW() - INTERVAL '40 days', 118.00, 118, 'Set maquillaje premium'),
    (cliente_mercedes, tienda_id, NOW() - INTERVAL '70 days', 95.00, 95, 'Cremas de lujo'),
    (cliente_mercedes, tienda_id, NOW() - INTERVAL '110 days', 135.00, 135, 'Perfume exclusivo'),
    (cliente_mercedes, tienda_id, NOW() - INTERVAL '160 days', 88.00, 88, 'Sérum anti-edad');

  RAISE NOTICE '✅ Compras insertadas correctamente para los clientes demo';

END $$;
