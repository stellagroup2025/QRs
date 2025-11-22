-- Verificar si las tablas del sistema de regalos existen
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'regalos_catalogo',
    'cupones_regalos', 
    'milestones_referidos',
    'milestones_alcanzados'
  )
ORDER BY table_name;
