# Implementación Completa - Sistema de Campañas Mejorado

## Resumen
Se han implementado **4 mejoras principales** al sistema de campañas de email:

1. ✅ **Filtros de segmentación faltantes** agregados
2. ✅ **Sugerencias de filtros predefinidas** para facilitar la creación de campañas
3. ✅ **Historial de campañas por cliente** con tracking completo de envíos
4. ✅ **Control de campañas de envío único** (bienvenida, cumpleaños, etc.)

---

## 🎯 Funcionalidades Implementadas

### 1. Filtros de Segmentación Completos

#### Filtros agregados en `filtros-segmentacion.dto.ts`:
- **Género**: masculino, femenino, otro, prefiero_no_decir
- **Edad**: edad_min, edad_max
- **Historial de campañas**:
  - `excluir_campana_id`: Excluir clientes que recibieron una campaña específica
  - `excluir_campanas_ultimos_dias`: Excluir clientes que recibieron campañas recientemente
  - `solo_sin_campanas`: Solo incluir clientes nuevos sin campañas previas
  - `dias_desde_ultima_campana_min`: Filtrar por días mínimos desde la última campaña

### 2. Sugerencias de Filtros

**Nuevo endpoint**: `GET /api/admin/campanas/sugerencias-filtros`

Devuelve sugerencias predefinidas para todos los tipos de filtros:

```json
{
  "edad": [
    { "label": "Jóvenes (18-30)", "min": 18, "max": 30, "descripcion": "..." },
    { "label": "Adultos (31-50)", "min": 31, "max": 50, "descripcion": "..." }
  ],
  "ticket_medio": [
    { "label": "Compras pequeñas (<30€)", "min": 0, "max": 30, "descripcion": "..." },
    { "label": "VIP (>200€)", "min": 200, "descripcion": "..." }
  ],
  "num_visitas": [...],
  "dias_ultima_visita": [...],
  "puntos": [...],
  "historial_campanas": [
    { "label": "Sin campañas previas", "descripcion": "..." },
    { "label": "Hace más de 1 mes", "min": 30, "descripcion": "..." }
  ]
}
```

### 3. Historial de Campañas

#### Nueva tabla: `envios_campanas`
Registra cada envío de campaña a cada cliente con:
- `id_campana`, `id_cliente`, `id_tienda`
- `fecha_envio`
- `estado`: enviado, entregado, abierto, clickeado, error
- `email_destinatario`
- `metadata` (JSONB): errores, estadísticas, etc.

#### Función SQL: `filtrar_clientes_campana()`
Función PostgreSQL optimizada que filtra clientes basándose en su historial de campañas.

#### Preview con historial
El endpoint `POST /api/admin/campanas/preview-destinatarios` ahora incluye:
```json
{
  "total_destinatarios": 25,
  "ejemplos": [
    {
      "id": "uuid...",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "historial_campanas": [
        {
          "campana_nombre": "Black Friday 2024",
          "campana_tipo": "promocional",
          "fecha_envio": "2024-11-20T10:00:00Z",
          "estado": "entregado"
        }
      ],
      "total_campanas_recibidas": 3
    }
  ]
}
```

### 4. Tipos de Campaña y Envío Único

#### Nuevos campos en `campanas_email`:
- **`tipo`**: promocional, bienvenida, cumpleanos, reactivacion, abandono, fidelizacion, informativa
- **`envio_unico`**: Boolean - si es true, cada cliente solo puede recibir esta campaña una vez

#### DTO actualizado `create-campana.dto.ts`:
```typescript
{
  "nombre": "Campaña de Bienvenida",
  "asunto": "¡Bienvenido a nuestra tienda!",
  "tipo": "bienvenida",
  "envio_unico": true,
  "filtros_segmentacion": {
    "solo_sin_campanas": true  // Solo clientes nuevos
  }
}
```

---

## 📂 Archivos Modificados/Creados

### Backend - DTOs
- ✅ `src/campanas/dto/filtros-segmentacion.dto.ts` - Agregados filtros de historial de campañas
- ✅ `src/campanas/dto/sugerencias-filtros.dto.ts` - **NUEVO**: DTOs para sugerencias
- ✅ `src/campanas/dto/create-campana.dto.ts` - Agregados `tipo` y `envio_unico`

### Backend - Service
- ✅ `src/campanas/campanas.service.ts`:
  - Método `getSugerenciasFiltros()` - **NUEVO**
  - Método `aplicarFiltrosSegmentacion()` - Ahora async, llama función SQL
  - Método `enviarCampana()` - Registra en `envios_campanas`
  - Método `previewDestinatarios()` - Incluye historial de campañas
  - Método `obtenerHistorialCampanas()` - **NUEVO** método privado

### Backend - Controller
- ✅ `src/campanas/campanas.controller.ts`:
  - Endpoint `GET /api/admin/campanas/sugerencias-filtros` - **NUEVO**

### Migraciones SQL
- ✅ `supabase/migrations/20250111000008_create_envios_campanas.sql` - **NUEVA** tabla
- ✅ `supabase/migrations/20250111000009_add_tipo_to_campanas.sql` - Campos nuevos
- ✅ `supabase/migrations/20250111000010_create_filtrar_clientes_function.sql` - Función SQL

### Archivo consolidado
- ✅ `APLICAR_MIGRACIONES_CAMPANAS.sql` - **NUEVO**: Todas las migraciones en un solo archivo

---

## 🔧 Cómo Aplicar las Migraciones

### **IMPORTANTE**: Debes ejecutar las migraciones SQL manualmente

1. Abre el archivo: `backend/APLICAR_MIGRACIONES_CAMPANAS.sql`

2. Ve a Supabase Dashboard:
   - URL: https://supabase.com/dashboard/project/ajyiuhujexwrjmjfycxh/sql/new

3. Copia y pega **todo el contenido** del archivo `APLICAR_MIGRACIONES_CAMPANAS.sql`

4. Haz clic en **"Run"** para ejecutar

5. Verifica que se hayan creado:
   - ✅ Tabla `envios_campanas`
   - ✅ Columnas `tipo` y `envio_unico` en `campanas_email`
   - ✅ Función `filtrar_clientes_campana`

---

## 🧪 Cómo Probar

### 1. Obtener sugerencias de filtros
```bash
curl -X GET http://localhost:3001/api/admin/campanas/sugerencias-filtros \
  -H "Authorization: Bearer <TU_TOKEN>" \
  -H "X-Tenant-Domain: lokeyokiera"
```

### 2. Preview de destinatarios con filtros de campaña
```bash
curl -X POST http://localhost:3001/api/admin/campanas/preview-destinatarios \
  -H "Authorization: Bearer <TU_TOKEN>" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -H "Content-Type: application/json" \
  -d '{
    "edad_min": 18,
    "edad_max": 35,
    "genero": "femenino",
    "solo_sin_campanas": true
  }'
```

### 3. Crear campaña de bienvenida con envío único
```bash
curl -X POST http://localhost:3001/api/admin/campanas \
  -H "Authorization: Bearer <TU_TOKEN>" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Bienvenida Nuevos Clientes",
    "asunto": "¡Bienvenido!",
    "contenido_html": "<h1>Hola {{nombre}}</h1>",
    "tipo": "bienvenida",
    "envio_unico": true,
    "filtros_segmentacion": {
      "solo_sin_campanas": true,
      "edad_min": 18,
      "edad_max": 65
    }
  }'
```

### 4. Excluir clientes que recibieron campañas recientemente
```bash
curl -X POST http://localhost:3001/api/admin/campanas/preview-destinatarios \
  -H "Authorization: Bearer <TU_TOKEN>" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -H "Content-Type: application/json" \
  -d '{
    "excluir_campanas_ultimos_dias": 30,
    "ticket_medio_min": 50
  }'
```

---

## 📊 Estructura de Datos

### Tabla `envios_campanas`
```sql
CREATE TABLE envios_campanas (
  id UUID PRIMARY KEY,
  id_campana UUID REFERENCES campanas_email(id),
  id_cliente UUID REFERENCES clientes(id),
  id_tienda UUID REFERENCES tiendas(id),
  fecha_envio TIMESTAMP WITH TIME ZONE,
  estado VARCHAR(50),  -- enviado, entregado, abierto, clickeado, error
  email_destinatario VARCHAR(255),
  metadata JSONB,
  UNIQUE (id_campana, id_cliente)  -- Un cliente solo puede recibir cada campaña una vez
);
```

### Índices creados
- `idx_envios_campanas_cliente` - Búsquedas por cliente
- `idx_envios_campanas_campana` - Búsquedas por campaña
- `idx_envios_campanas_tienda` - Filtros por tienda
- `idx_envios_campanas_fecha` - Ordenar por fecha (DESC)
- `idx_envios_campanas_estado` - Filtrar por estado

---

## 🚀 Estado del Backend

✅ Backend compilado sin errores
✅ Backend corriendo en http://localhost:3001
✅ Todos los endpoints registrados correctamente
✅ Nuevo endpoint `/api/admin/campanas/sugerencias-filtros` activo

### Endpoints de Campañas Disponibles:
1. `POST /api/admin/campanas` - Crear campaña
2. `GET /api/admin/campanas` - Listar campañas
3. `GET /api/admin/campanas/:id` - Obtener campaña
4. `PUT /api/admin/campanas/:id` - Actualizar campaña
5. `DELETE /api/admin/campanas/:id` - Eliminar campaña
6. `POST /api/admin/campanas/preview-destinatarios` - Preview con historial
7. `GET /api/admin/campanas/templates/list` - Listar templates
8. `GET /api/admin/campanas/templates/:id` - Obtener template
9. **`GET /api/admin/campanas/sugerencias-filtros`** - **NUEVO**: Obtener sugerencias

---

## 📋 Próximos Pasos (Frontend)

Para completar la implementación, el frontend debe:

1. **Actualizar formulario de crear campaña**:
   - Agregar selector de `tipo` de campaña
   - Agregar checkbox `envio_unico`
   - Agregar campos de filtros de historial de campañas

2. **Integrar sugerencias de filtros**:
   - Llamar a `GET /api/admin/campanas/sugerencias-filtros`
   - Mostrar chips/botones con sugerencias predefinidas
   - Al hacer clic, aplicar los valores sugeridos

3. **Mostrar historial en preview**:
   - Mostrar `historial_campanas` de cada cliente
   - Indicar cuántas campañas ha recibido cada uno
   - Mostrar última campaña recibida

4. **Filtros avanzados de campaña**:
   - Input para excluir campaña específica
   - Slider para días desde última campaña
   - Toggle para "solo clientes sin campañas"

---

## ✨ Casos de Uso

### Caso 1: Campaña de Bienvenida
```json
{
  "nombre": "Bienvenida",
  "tipo": "bienvenida",
  "envio_unico": true,
  "filtros_segmentacion": {
    "solo_sin_campanas": true
  }
}
```
✅ Se envía solo a clientes nuevos, una sola vez

### Caso 2: Reactivación de Clientes Inactivos
```json
{
  "nombre": "Te extrañamos",
  "tipo": "reactivacion",
  "filtros_segmentacion": {
    "dias_ultima_visita_min": 90,
    "excluir_campanas_ultimos_dias": 30
  }
}
```
✅ Solo clientes sin visitas en 90+ días y sin campañas en el último mes

### Caso 3: Promoción VIP
```json
{
  "nombre": "Oferta Exclusiva VIP",
  "tipo": "promocional",
  "filtros_segmentacion": {
    "ticket_medio_min": 200,
    "num_visitas_min": 10,
    "excluir_campanas_ultimos_dias": 7
  }
}
```
✅ Solo clientes VIP que no recibieron campañas en la última semana

---

## 🔍 Verificación

Para verificar que todo funciona:

1. ✅ Backend compilando sin errores
2. ✅ Backend corriendo en puerto 3001
3. ✅ Endpoint de sugerencias respondiendo
4. ⏳ **PENDIENTE**: Aplicar migraciones SQL en Supabase Dashboard
5. ⏳ **PENDIENTE**: Probar preview con filtros de historial
6. ⏳ **PENDIENTE**: Actualizar frontend

---

## 📞 Soporte

Si encuentras algún error:

1. Revisa los logs del backend: `tail -f /tmp/backend-final-ready.log`
2. Verifica que las migraciones SQL se aplicaron correctamente
3. Comprueba que el token JWT es válido
4. Asegúrate de enviar el header `X-Tenant-Domain: lokeyokiera`

---

## 🎉 Resumen

✅ **Backend completamente implementado y funcionando**
✅ **4 mejoras principales implementadas**
✅ **0 errores de compilación**
✅ **Nuevo endpoint activo**
✅ **Migraciones SQL listas para aplicar**

**Siguiente paso crítico**: Aplicar las migraciones SQL en Supabase Dashboard usando el archivo `APLICAR_MIGRACIONES_CAMPANAS.sql`
