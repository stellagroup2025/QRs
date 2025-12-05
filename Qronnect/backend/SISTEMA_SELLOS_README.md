# Sistema de Tarjetas de Sellos (Stamp Cards)

## 📋 Descripción General

El **Sistema de Tarjetas de Sellos** es una funcionalidad de fidelización que permite a las tiendas crear programas donde los clientes acumulan sellos por cada visita o compra, y al completar la tarjeta reciben un premio automático mediante un cupón canjeable único.

### Ejemplo de uso:
- **Cafetería**: "Compra 10 cafés y llévate el 11º gratis"
- **Peluquería**: "6 visitas = 1 corte gratis"
- **Restaurante**: "5 comidas = 20% de descuento en tu próxima visita"

---

## 🏗️ Arquitectura del Sistema

### Componentes principales:

1. **Programas de Sellos** - Configuración de cuántos sellos se necesitan y qué premio se otorga
2. **Tarjetas de Cliente** - Progreso individual de cada cliente en cada programa
3. **Sellos Otorgados** - Registro histórico de cada sello individual
4. **Cupones Generados** - Código único que se genera automáticamente al completar

---

## 📊 Modelo de Datos

### Tabla: `programas_sellos`

Configuración de cada programa de sellos por tienda.

```sql
CREATE TABLE public.programas_sellos (
  id UUID PRIMARY KEY,
  id_tienda UUID NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50) DEFAULT 'stamp',
  imagen_url TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  sellos_requeridos INTEGER NOT NULL,
  tipo_premio VARCHAR(50) NOT NULL,
  premio_detalles JSONB NOT NULL,
  instrucciones_canje TEXT,
  dias_validez_cupon INTEGER DEFAULT 30,
  sellos_por_dia_max INTEGER DEFAULT 1,
  requiere_compra_minima BOOLEAN DEFAULT false,
  compra_minima DECIMAL(10,2),
  activo BOOLEAN DEFAULT true,
  visible_cliente BOOLEAN DEFAULT true,
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  fecha_fin TIMESTAMPTZ,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tipos de Premio:

| Tipo | Descripción | Ejemplo JSON |
|------|-------------|--------------|
| `producto` | Producto o servicio gratis | `{"nombre": "Café gratis", "descripcion": "Un café de cualquier tamaño"}` |
| `descuento_porcentaje` | Descuento en % | `{"porcentaje": 20, "max_descuento": 10}` |
| `descuento_fijo` | Descuento en € | `{"monto": 5.00, "moneda": "EUR"}` |
| `puntos` | Puntos de fidelización | `{"puntos": 100}` |
| `texto` | Premio descrito en texto | `{"texto": "Postre del día gratis", "instrucciones": "Válido L-V"}` |

### Tabla: `tarjetas_sellos_clientes`

Tarjetas individuales de cada cliente.

```sql
CREATE TABLE public.tarjetas_sellos_clientes (
  id UUID PRIMARY KEY,
  id_cliente UUID NOT NULL,
  id_programa UUID NOT NULL,
  id_tienda UUID NOT NULL,
  sellos_actuales INTEGER DEFAULT 0,
  sellos_objetivo INTEGER NOT NULL,
  estado VARCHAR(50) DEFAULT 'activa',
  fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
  fecha_completada TIMESTAMPTZ,
  fecha_canjeada TIMESTAMPTZ,
  fecha_expiracion TIMESTAMPTZ,
  codigo_cupon VARCHAR(50) UNIQUE,
  cupon_canjeado BOOLEAN DEFAULT false,
  cupon_canjeado_por UUID,
  -- ... más campos
);
```

#### Estados de Tarjeta:

- **`activa`** - Cliente acumulando sellos
- **`completada`** - Todos los sellos completados, cupón generado
- **`canjeada`** - Cupón ya fue canjeado por el cliente
- **`expirada`** - Cupón expirado sin canjear
- **`cancelada`** - Tarjeta cancelada manualmente

### Tabla: `sellos_otorgados`

Historial de cada sello individual.

```sql
CREATE TABLE public.sellos_otorgados (
  id UUID PRIMARY KEY,
  id_tarjeta UUID NOT NULL,
  id_cliente UUID NOT NULL,
  id_tienda UUID NOT NULL,
  id_programa UUID NOT NULL,
  numero_sello INTEGER NOT NULL,
  id_compra UUID,
  monto_compra DECIMAL(10,2),
  otorgado_por UUID,
  notas TEXT,
  metadata JSONB DEFAULT '{}',
  fecha_otorgado TIMESTAMPTZ DEFAULT NOW(),
  creado_en TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 Funciones SQL Principales

### 1. `otorgar_sello()`

Otorga un sello a un cliente. Si no tiene tarjeta activa, la crea automáticamente.

```sql
SELECT public.otorgar_sello(
  p_cliente_id := 'uuid-cliente',
  p_programa_id := 'uuid-programa',
  p_tienda_id := 'uuid-tienda',
  p_otorgado_por := 'uuid-usuario-staff',
  p_compra_id := NULL,
  p_monto_compra := NULL,
  p_notas := 'Primera visita'
);
```

**Retorna:**
```json
{
  "success": true,
  "tarjeta_id": "uuid-tarjeta",
  "sello_id": "uuid-sello",
  "sellos_actuales": 5,
  "sellos_objetivo": 10,
  "completada": false
}
```

Cuando se completa:
```json
{
  "success": true,
  "tarjeta_id": "uuid-tarjeta",
  "sello_id": "uuid-sello",
  "sellos_actuales": 10,
  "sellos_objetivo": 10,
  "completada": true,
  "codigo_cupon": "SELLO-A3F2B1C9",
  "premio": { "nombre": "Café gratis", "descripcion": "..." }
}
```

#### Validaciones:

- ✅ Programa debe estar activo
- ✅ Programa no debe estar expirado
- ✅ Respeta límite de sellos por día (configurable)
- ✅ Crea tarjeta automáticamente si no existe
- ✅ Genera cupón único al completar

### 2. `canjear_cupon_sello()`

Canjea un cupón completado.

```sql
SELECT public.canjear_cupon_sello(
  p_codigo_cupon := 'SELLO-A3F2B1C9',
  p_tienda_id := 'uuid-tienda',
  p_canjeado_por := 'uuid-usuario-staff'
);
```

**Retorna:**
```json
{
  "success": true,
  "mensaje": "Cupón canjeado exitosamente",
  "tarjeta_id": "uuid-tarjeta",
  "cliente_id": "uuid-cliente",
  "programa_nombre": "Cafetería - 10 cafés",
  "tipo_premio": "producto",
  "premio_detalles": { "nombre": "Café gratis" },
  "instrucciones": "Presenta este cupón al personal..."
}
```

#### Validaciones:

- ✅ Cupón debe existir
- ✅ Tarjeta debe estar en estado `completada`
- ✅ Cupón no debe estar canjeado previamente
- ✅ Cupón no debe estar expirado
- ✅ Marca cupón como canjeado y registra quién lo canjeó

---

## 🎯 API Endpoints (NestJS)

### Programas de Sellos (Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/sellos/programas` | Crear nuevo programa |
| `GET` | `/sellos/programas` | Listar programas |
| `GET` | `/sellos/programas/:id` | Obtener programa |
| `PUT` | `/sellos/programas/:id` | Actualizar programa |
| `DELETE` | `/sellos/programas/:id` | Desactivar programa |
| `GET` | `/sellos/programas/:id/estadisticas` | Estadísticas del programa |

### Otorgar y Canjear (Staff)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/sellos/otorgar` | Otorgar sello a cliente |
| `POST` | `/sellos/canjear` | Canjear cupón |
| `GET` | `/sellos/verificar-cupon/:codigo` | Verificar cupón sin canjear |

### Tarjetas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/sellos/clientes/:id/tarjetas` | Tarjetas de un cliente |
| `GET` | `/sellos/tarjetas` | Todas las tarjetas (admin) |
| `GET` | `/sellos/tarjetas/:id` | Detalle de tarjeta |
| `GET` | `/sellos/tarjetas/:id/sellos` | Sellos de una tarjeta |
| `DELETE` | `/sellos/tarjetas/:id` | Cancelar tarjeta |

### Estadísticas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/sellos/estadisticas` | Estadísticas generales |

---

## 📝 Ejemplos de Uso

### Crear un Programa de Sellos

```typescript
// POST /sellos/programas
{
  "nombre": "Cafetería - 10 cafés",
  "descripcion": "Compra 10 cafés y llévate el 11º gratis",
  "sellos_requeridos": 10,
  "tipo_premio": "producto",
  "premio_detalles": {
    "nombre": "Café gratis",
    "descripcion": "Un café de cualquier tamaño"
  },
  "icono": "coffee",
  "color": "#8B4513",
  "dias_validez_cupon": 30,
  "sellos_por_dia_max": 1,
  "activo": true,
  "visible_cliente": true
}
```

### Otorgar un Sello

```typescript
// POST /sellos/otorgar
{
  "id_cliente": "uuid-cliente",
  "id_programa": "uuid-programa",
  "monto_compra": 4.50,
  "notas": "Café americano - cliente frecuente"
}
```

### Canjear Cupón

```typescript
// POST /sellos/canjear
{
  "codigo_cupon": "SELLO-A3F2B1C9"
}
```

---

## 🎨 Componentes de Frontend (Próximos)

### Para Admin:
- `ProgramaSellosForm.tsx` - Crear/editar programas
- `ProgramaSellosLista.tsx` - Lista de programas
- `TarjetasSellosPanel.tsx` - Dashboard de tarjetas
- `OtorgarSelloModal.tsx` - Modal para otorgar sellos
- `CanjearCuponModal.tsx` - Modal para canjear cupones

### Para Cliente:
- `MisTarjetasSellos.tsx` - Vista de tarjetas del cliente
- `TarjetaSelloCard.tsx` - Tarjeta individual con progreso
- `SelloVisualization.tsx` - Visualización de sellos (círculos/iconos)

---

## 🔒 Seguridad

### Row Level Security (RLS)

```sql
-- Programas visibles
ALTER TABLE public.programas_sellos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "programas_sellos_select_policy"
  ON public.programas_sellos FOR SELECT
  USING (activo = true AND visible_cliente = true);

-- Tarjetas de clientes
ALTER TABLE public.tarjetas_sellos_clientes ENABLE ROW LEVEL SECURITY;

-- Sellos otorgados
ALTER TABLE public.sellos_otorgados ENABLE ROW LEVEL SECURITY;
```

### Validaciones:

- ✅ Usuarios solo ven programas de su tienda
- ✅ Clientes solo ven sus propias tarjetas
- ✅ Staff no puede canjear cupones de otras tiendas
- ✅ Límite de sellos por día previene fraude

---

## 📈 Vistas SQL para Reportes

### `vista_tarjetas_sellos_progreso`

Vista completa con progreso y datos del programa.

```sql
SELECT
  t.id,
  t.sellos_actuales,
  t.sellos_objetivo,
  ROUND((t.sellos_actuales::DECIMAL / t.sellos_objetivo) * 100, 2) as porcentaje_completado,
  t.estado,
  p.nombre as programa_nombre,
  p.premio_detalles,
  c.nombre as cliente_nombre,
  CASE
    WHEN t.estado = 'completada'
      AND NOT t.cupon_canjeado
      AND (t.fecha_expiracion IS NULL OR t.fecha_expiracion > NOW())
    THEN true
    ELSE false
  END as puede_canjear
FROM tarjetas_sellos_clientes t
INNER JOIN clientes c ON t.id_cliente = c.id
INNER JOIN programas_sellos p ON t.id_programa = p.id;
```

### `vista_estadisticas_programas_sellos`

Estadísticas de uso por programa.

```sql
SELECT
  p.id as programa_id,
  p.nombre as programa_nombre,
  COUNT(DISTINCT t.id_cliente) as total_clientes_participantes,
  COUNT(CASE WHEN t.estado = 'activa' THEN 1 END) as tarjetas_activas,
  COUNT(CASE WHEN t.estado = 'completada' THEN 1 END) as tarjetas_completadas,
  COUNT(CASE WHEN t.estado = 'canjeada' THEN 1 END) as tarjetas_canjeadas,
  COUNT(DISTINCT s.id) as total_sellos_otorgados,
  COALESCE(AVG(t.sellos_actuales), 0) as promedio_sellos_por_tarjeta
FROM programas_sellos p
LEFT JOIN tarjetas_sellos_clientes t ON p.id = t.id_programa
LEFT JOIN sellos_otorgados s ON p.id = s.id_programa
GROUP BY p.id;
```

---

## 🚀 Instalación y Migración

### 1. Aplicar la migración SQL

```bash
# Desde Supabase SQL Editor o CLI
psql -h <host> -d <database> -f backend/supabase/migrations/20251204000001_create_stamp_cards_system.sql
```

### 2. Registrar el módulo en NestJS

```typescript
// app.module.ts
import { SellosModule } from './sellos/sellos.module';

@Module({
  imports: [
    // ... otros módulos
    SellosModule,
  ],
})
export class AppModule {}
```

### 3. Verificar instalación

```bash
# Verificar que las tablas existen
SELECT COUNT(*) FROM public.programas_sellos;
SELECT COUNT(*) FROM public.tarjetas_sellos_clientes;
SELECT COUNT(*) FROM public.sellos_otorgados;

# Verificar las funciones
SELECT proname FROM pg_proc WHERE proname LIKE '%sello%';
```

---

## 🧪 Testing

### Crear programa de prueba:

```sql
INSERT INTO public.programas_sellos (
  id_tienda,
  nombre,
  descripcion,
  sellos_requeridos,
  tipo_premio,
  premio_detalles
) VALUES (
  'uuid-tienda',
  'Test - 5 visitas',
  'Programa de prueba',
  5,
  'producto',
  '{"nombre": "Regalo de prueba"}'::jsonb
);
```

### Otorgar sellos de prueba:

```sql
-- Sello 1
SELECT public.otorgar_sello(
  'uuid-cliente',
  'uuid-programa',
  'uuid-tienda'
);

-- Repetir 5 veces para completar
```

---

## 📚 Próximos Pasos

- [ ] Crear componentes de frontend React
- [ ] Implementar notificaciones push al completar tarjeta
- [ ] Sistema de gamificación (badges, niveles)
- [ ] Integración con sistema de email/SMS
- [ ] Dashboard de analytics avanzado
- [ ] Exportar cupones a PDF/imagen para compartir
- [ ] Tarjetas de sellos compartidas (ej: familia)

---

## 💡 Ideas de Mejora

1. **Sellos Dobles** - Días especiales con sellos dobles
2. **Bonificaciones** - "Próximos 3 sellos = +1 extra"
3. **Referidos** - "Refiere un amigo = +2 sellos"
4. **Colecciones** - Múltiples tarjetas temáticas
5. **QR Scanning** - Escanear QR para auto-otorgar sello
6. **Geolocalización** - Verificar ubicación al otorgar

---

## 📞 Soporte

Para dudas o problemas con el sistema de sellos:
- Backend: `/backend/src/sellos/`
- Frontend: `/frontend/types/sellos.ts`
- SQL: `/backend/supabase/migrations/20251204000001_create_stamp_cards_system.sql`
