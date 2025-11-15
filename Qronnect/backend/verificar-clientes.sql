-- Script para verificar clientes en la base de datos

-- 1. Ver todas las tiendas
SELECT
  id,
  nombre,
  slug,
  activo
FROM tiendas
ORDER BY created_at DESC
LIMIT 5;

-- 2. Ver todos los clientes de lokeyokiera
SELECT
  c.id,
  c.nombre,
  c.email,
  c.telefono,
  c.codigo_referido_personal,
  c.puntos_totales,
  c.activo,
  c.id_tienda,
  t.nombre as tienda_nombre,
  t.slug as tienda_slug
FROM clientes c
LEFT JOIN tiendas t ON c.id_tienda = t.id
WHERE t.slug = 'lokeyokiera'
ORDER BY c.created_at DESC;

-- 3. Contar clientes por tienda
SELECT
  t.nombre as tienda,
  t.slug,
  COUNT(c.id) as total_clientes,
  COUNT(CASE WHEN c.activo = true THEN 1 END) as clientes_activos
FROM tiendas t
LEFT JOIN clientes c ON c.id_tienda = t.id
GROUP BY t.id, t.nombre, t.slug
ORDER BY total_clientes DESC;
