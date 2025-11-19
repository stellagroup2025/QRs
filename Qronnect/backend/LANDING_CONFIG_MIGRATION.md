# 📝 Configuración de Textos de Landing Page

## 🎯 Objetivo

Crear una tabla `landing_config` para permitir que cada tienda personalice todos los textos de su landing page desde el panel de administración.

## 📊 Estructura de la Tabla

La tabla `landing_config` contiene **más de 50 campos configurables**:

### **Hero Section** (6 campos)
- hero_titulo_principal
- hero_titulo_destacado
- hero_subtitulo
- hero_cta_principal
- hero_cta_secundario
- hero_social_proof

### **Servicios** (18 campos)
- servicios_titulo / servicios_subtitulo
- 6 servicios x 3 campos cada uno (título, descripción, icono)

### **Beneficios** (8 campos)
- beneficios_titulo / beneficios_subtitulo
- 6 beneficios

### **Estadísticas** (6 campos)
- estadistica_principal_numero / estadistica_principal_texto
- estadistica_1_numero / estadistica_1_texto
- estadistica_2_numero / estadistica_2_texto

### **Testimonios** (13 campos)
- testimonios_titulo
- 3 testimonios x 4 campos cada uno (nombre, cargo, contenido, rating)

### **CTA Final** (5 campos)
- cta_final_titulo_1 / cta_final_titulo_2
- cta_final_subtitulo
- cta_final_boton_principal / cta_final_boton_secundario

## 🚀 Aplicar Migración

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Copia y pega el contenido del archivo:
   ```
   backend/supabase/migrations/20251115000001_create_landing_config.sql
   ```
5. Click en **Run**

### Opción 2: Desde psql (Si tienes acceso)

```bash
psql -h [HOST] -p [PORT] -U postgres -d postgres -f supabase/migrations/20251115000001_create_landing_config.sql
```

## ✅ Verificar que se aplicó correctamente

```sql
-- Verificar que la tabla existe
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'landing_config';

-- Ver las configuraciones creadas
SELECT id_tienda, hero_titulo_principal, created_at FROM landing_config;

-- Debería haber una configuración por cada tienda existente
```

## 🔐 Permisos (RLS)

La tabla tiene Row Level Security (RLS) habilitado con las siguientes políticas:

- ✅ **SuperAdmin**: Puede ver, insertar y actualizar todas las configuraciones
- ✅ **Admin**: Puede ver y actualizar solo la configuración de su tienda
- ✅ **Público (anon)**: Puede ver configuraciones activas (para mostrar en la landing)

## 📡 Endpoints a Crear

### 1. Endpoint Público (Ya en uso)
```
GET /api/config/landing
Header: X-Tenant-Domain: lokeyokiera
Response: { hero_titulo_principal: "...", ... }
```

### 2. Endpoint para Admin
```
GET /api/admin/landing-config
PUT /api/admin/landing-config
Body: { hero_titulo_principal: "Nuevo título", ... }
```

### 3. Endpoint para SuperAdmin
```
GET /api/superadmin/tiendas/:id/landing-config
PUT /api/superadmin/tiendas/:id/landing-config
Body: { hero_titulo_principal: "Nuevo título", ... }
```

## 🎨 Valores por Defecto

Todos los campos tienen valores por defecto profesionales y neutros que funcionan para cualquier tipo de negocio. Los admins pueden personalizarlos según su industria.

## 📝 Ejemplo de Uso

```typescript
// Obtener configuración de landing
const { data } = await supabase
  .from('landing_config')
  .select('*')
  .eq('id_tienda', tiendaId)
  .single()

// Actualizar configuración
const { error } = await supabase
  .from('landing_config')
  .update({
    hero_titulo_principal: 'Bienvenido a mi tienda',
    hero_titulo_destacado: 'La mejor experiencia'
  })
  .eq('id_tienda', tiendaId)
```

## 🔄 Auto-población

La migración incluye un `INSERT` automático que crea una configuración por defecto para todas las tiendas existentes, así que inmediatamente después de aplicarla, todas las tiendas tendrán su configuración lista para personalizar.

## 📊 Campos Disponibles por Sección

| Sección | Campos Configurables |
|---------|---------------------|
| Hero | 6 |
| Servicios | 18 (3 por servicio x 6 servicios) |
| Beneficios | 8 |
| Estadísticas | 6 |
| Testimonios | 13 (4 por testimonio x 3 testimonios + título) |
| CTA Final | 5 |
| **TOTAL** | **56 campos** |

Cada tienda puede personalizar completamente su landing page sin tocar código.
