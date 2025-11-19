# 🌱 Seed de Tiendas de Ejemplo

Este documento explica cómo usar el sistema de seed para crear **18 tiendas de ejemplo** distribuidas en diferentes sectores para demostración del sistema de fidelización Qronnect.

## 📋 Tiendas Incluidas

### 🎨 Sector: Belleza & Bienestar (6 tiendas)
- **Peluquería Style&Cut** (`stylecut`) - Peluquería moderna
- **Barbería UrbanCut** (`urbancut`) - Barbería hipster
- **Centro de Estética BellaSkin** (`bellaskin`) - Tratamientos estéticos
- **Uñas Perfect Nails** (`perfectnails`) - Manicura y pedicura
- **Spa AquaRelax** (`aquarelax`) - Wellness y relajación
- **Óptica VisiónPlus** (`visionplus`) - Óptica profesional

### 🍔 Sector: Foodie & Restauración (5 tiendas)
- **Cafetería El Rincón** (`elrincon`) - Café acogedor
- **Heladería Dolce Frío** (`dolcefrio`) - Helados artesanales
- **Restaurante La Parrilla** (`laparrilla`) - Grill y parrilla
- **Pizzería Don Nápoli** (`donnapoli`) - Pizza italiana
- **Hamburguesería Burger&Co** (`burgerco`) - Burgers gourmet

### 🐾 Sector: Mascotas (3 tiendas)
- **Tienda de Mascotas Huella Feliz** (`huellafeliz`) - Pet shop completo
- **Peluquería Canina DoggyStyle** (`doggystyle`) - Grooming profesional
- **Clínica Veterinaria VetCare** (`vetcare`) - Atención veterinaria

### 👶 Sector: Infantil & Familia (3 tiendas)
- **Juguetería MundoPeques** (`mundopeques`) - Juguetes y juegos
- **Librería Infantil Cuentos&Más** (`cuentosmas`) - Libros para niños
- **Peluquería Infantil PequeLook** (`pequelook`) - Cortes para niños

### 💪 Sector: Salud & Deporte (3 tiendas)
- **Gimnasio FitZone** (`fitzone`) - Centro fitness
- **Centro de Fisioterapia FisioPlus** (`fisioplus`) - Rehabilitación
- **Tienda de Nutrición NutriShop** (`nutrishop`) - Suplementos y nutrición

## 🎯 Características del Seed

### ✅ Datos Completos
Cada tienda incluye:
- ✓ Nombre comercial y dominio único
- ✓ Dirección, teléfono y email
- ✓ Colores personalizados (primario, secundario, acento)
- ✓ Plan asignado (básico/profesional)
- ✓ Puntos por euro configurados
- ✓ Horario de atención
- ✓ Marcado como dato de demo (`es_demo: true`)

### 🔄 Idempotencia
El script usa `INSERT ... ON CONFLICT DO UPDATE`, lo que significa:
- ✓ Puedes ejecutarlo múltiples veces sin duplicar datos
- ✓ Actualiza las tiendas existentes si ya fueron creadas
- ✓ Seguro para desarrollo y testing

### 🎨 Branding Personalizado
Cada tienda tiene:
- Paleta de colores temática según su sector
- Logo placeholder listo para personalizar
- Branding coherente con su identidad

## 🚀 Métodos de Ejecución

### Método 1: Script TypeScript (Recomendado para desarrollo)

```bash
# Desde la carpeta backend/
npx ts-node apply-seed-tiendas.ts
```

**Ventajas:**
- ✅ Ejecuta directamente desde tu entorno de desarrollo
- ✅ Verifica automáticamente las tiendas creadas
- ✅ Muestra resumen por sectores
- ✅ Manejo de errores detallado

**Requisitos:**
- Supabase corriendo localmente o variables de entorno configuradas
- `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` disponibles

---

### Método 2: SQL Directo en Supabase (Más confiable)

1. Abre el **Supabase SQL Editor** (Dashboard → SQL Editor)
2. Abre el archivo `database/seed-tiendas-ejemplo.sql`
3. Copia todo el contenido
4. Pégalo en el SQL Editor
5. Click en **"Run"** o presiona `Ctrl+Enter`

**Ventajas:**
- ✅ Siempre funciona, incluso si la función `exec_sql` no existe
- ✅ Puedes ver los resultados en tiempo real
- ✅ Ideal para producción o staging

---

### Método 3: CLI de PostgreSQL

```bash
# Con psql instalado localmente
psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f database/seed-tiendas-ejemplo.sql

# Para Supabase Cloud (reemplaza con tus credenciales)
psql -h db.yourproject.supabase.co -U postgres -d postgres -f database/seed-tiendas-ejemplo.sql
```

**Ventajas:**
- ✅ Ejecución directa sin intermediarios
- ✅ Útil para automatización y CI/CD
- ✅ Salida detallada en terminal

---

## 📊 Verificación Post-Ejecución

Después de ejecutar el seed, verifica que todo se creó correctamente:

### Query 1: Ver todas las tiendas demo
```sql
SELECT
  nombre,
  dominio,
  nombre_comercial,
  metadata->>'sector' as sector,
  plan,
  email
FROM tiendas
WHERE metadata->>'es_demo' = 'true'
ORDER BY metadata->>'sector', nombre;
```

### Query 2: Contar tiendas por sector
```sql
SELECT
  metadata->>'sector' as sector,
  COUNT(*) as total_tiendas
FROM tiendas
WHERE metadata->>'es_demo' = 'true'
GROUP BY metadata->>'sector'
ORDER BY total_tiendas DESC;
```

### Query 3: Verificar landing configs
```sql
SELECT
  t.nombre,
  t.dominio,
  lc.hero_titulo_principal,
  lc.activo
FROM tiendas t
LEFT JOIN landing_config lc ON t.id = lc.id_tienda
WHERE t.metadata->>'es_demo' = 'true'
ORDER BY t.nombre;
```

## 🛠️ Personalización

### Modificar una tienda existente
Edita el archivo `database/seed-tiendas-ejemplo.sql` y busca la tienda que quieres modificar. Por ejemplo, para cambiar los colores de "Style&Cut":

```sql
-- Busca esta sección:
INSERT INTO tiendas (
  nombre,
  dominio,
  nombre_comercial,
  -- ...
  color_primario,
  color_secundario,
  color_acento,
  -- ...
) VALUES (
  'Peluquería Style&Cut',
  'stylecut',
  'Style&Cut',
  -- ...
  '#E91E63',  -- ← Cambia este color
  '#C2185B',  -- ← Y estos también
  '#F48FB1',
  -- ...
)
```

### Agregar una nueva tienda
Copia el bloque completo de una tienda similar y modifica:

```sql
-- Nueva Tienda: Spa ZenRelax
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
  'Spa ZenRelax',           -- ← Tu nombre
  'zenrelax',               -- ← Slug único
  'ZenRelax Spa',
  'Calle Paz 99, Madrid',
  '+34 911 222 333',
  'info@zenrelax.com',
  '#00BCD4',                -- ← Tus colores
  '#0097A7',
  '#80DEEA',
  'profesional',
  true,
  jsonb_build_object(
    'puntos_por_euro', 5,
    'sector', 'bienestar',  -- ← Tu sector
    'es_demo', true,
    'horario', 'L-D 9:00-22:00'
  )
) ON CONFLICT (dominio) DO UPDATE SET
  -- ... (igual que los demás)
```

## 🔐 Crear Usuarios Admin para las Tiendas

Una vez creadas las tiendas, puedes crear usuarios admin para cada una:

```sql
-- Ejemplo: Admin para Style&Cut
INSERT INTO admin_users (id_tienda, email, pin_hash, nombre, activo)
SELECT
  id,
  'admin@stylecut.com',
  '$2b$10$iGSxVYTFkaAo23cN7QwbXupnOrEr0JjvKOkpm/f1iLUYIg24TnZfm', -- PIN: 1234
  'Admin Style&Cut',
  true
FROM tiendas
WHERE dominio = 'stylecut'
ON CONFLICT (email, id_tienda) DO UPDATE
SET pin_hash = EXCLUDED.pin_hash, actualizado_en = NOW();
```

## 🧹 Limpieza: Eliminar Tiendas Demo

Si quieres eliminar todas las tiendas de ejemplo:

```sql
-- ⚠️ CUIDADO: Esto eliminará todas las tiendas demo y sus datos relacionados
DELETE FROM tiendas WHERE metadata->>'es_demo' = 'true';
```

Para eliminar solo una tienda específica:

```sql
DELETE FROM tiendas WHERE dominio = 'stylecut';
```

## 📝 Notas Importantes

1. **Metadata `es_demo: true`**
   - Todas las tiendas de ejemplo tienen este flag
   - Útil para filtrar datos de prueba vs producción
   - Puedes usar esto en tu lógica de negocio

2. **Dominios únicos**
   - Cada tienda tiene un `dominio` único (ej: `stylecut`)
   - Se usará como: `stylecut.tudominio.com`
   - El constraint `UNIQUE(dominio)` previene duplicados

3. **ON CONFLICT**
   - El script actualiza tiendas existentes si el dominio ya existe
   - Seguro para re-ejecutar en desarrollo
   - Los IDs no cambian en actualizaciones

4. **Landing Config automático**
   - El script crea automáticamente la configuración de landing
   - Cada tienda tendrá textos por defecto listos para personalizar

## 🎨 Paleta de Colores por Sector

El seed incluye paletas de colores cuidadosamente seleccionadas:

- **Belleza**: Rosas, púrpuras (#E91E63, #9C27B0)
- **Bienestar**: Cyans, azules (#00BCD4)
- **Restauración**: Marrones, naranjas (#795548, #FF9800)
- **Mascotas**: Verdes, azules (#8BC34A, #03A9F4)
- **Infantil**: Amarillos, púrpuras (#FFC107, #673AB7)
- **Deporte/Salud**: Rojos, azules (#F44336, #2196F3)

## 🚦 Próximos Pasos

Después de aplicar el seed:

1. ✅ Verifica que las 18 tiendas se crearon correctamente
2. ✅ Crea usuarios admin para las tiendas que necesites
3. ✅ Personaliza logos y colores según necesites
4. ✅ Crea clientes de ejemplo para cada tienda
5. ✅ Prueba el sistema de fidelización con estas tiendas demo

## 📚 Recursos Adicionales

- **Schema completo**: `database/schema.sql`
- **Migraciones**: `supabase/migrations/`
- **Crear admin users**: `database/setup-admin-perfumeria.sql` (ejemplo)

---

**¿Preguntas o problemas?**

Si encuentras algún error o necesitas ayuda, revisa:
- Los logs del script TypeScript
- El output del SQL Editor en Supabase
- Los constraints de la tabla `tiendas` en el schema
