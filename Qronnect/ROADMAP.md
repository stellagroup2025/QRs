# 🗺️ ROADMAP - Tareas Pendientes

> Fecha: 11 de Noviembre, 2025
> Proyecto: Qronnect - Sistema de Fidelización

---

## 🎯 PRIORIDAD 1: IA (Google Gemini) - DEBUG KPIs en 0

### Estado Actual
- ✅ **Gemini AI funcionando**: modelo `gemini-2.0-flash` responde correctamente
- ✅ **Fix de fechas aplicado**: `setUTCHours(23, 59, 59, 999)` en `ai.service.ts:45`
- ✅ **Rango de fechas correcto**: `2025-11-10T00:00:00.000Z` a `2025-11-10T23:59:59.999Z`
- ❌ **PROBLEMA**: KPIs devuelven 0 a pesar de que existen 2 compras (37€) en la fecha consultada

### Problema a Investigar
Los KPIs del endpoint `/api/admin/ai/kpi-summary` devuelven todo en 0:
```json
{
  "ventasTotales": 0,
  "numeroTickets": 0,
  "ticketMedio": 0,
  "clientesNuevos": 0,
  "clientesRecurrentes": 0,
  "clientesActivos": 0
}
```

**Pero las compras SÍ existen**:
- Endpoint `/api/admin/compras` devuelve 2 compras el 2025-11-10
- Total: 12€ + 25€ = 37€
- Cliente: Omar (omarsomoza93@gmail.com)

### Tareas Pendientes
- [ ] **Investigar query de Supabase en `ai.service.ts:70-75`**
  - Verificar si la query está llegando a Supabase
  - Revisar logs de Supabase
  - Probar query directamente con service role key

- [ ] **Revisar RLS (Row Level Security)**
  - Archivo: `backend/supabase/migrations/*compras*`
  - Verificar políticas de lectura para tabla `compras`
  - Asegurar que admin puede leer compras de su tienda

- [ ] **Debug con logs adicionales**
  - Añadir `console.log` del resultado de la query
  - Ver qué datos devuelve Supabase exactamente
  - Verificar `tienda_id` que se está usando

- [ ] **Probar con superadmin token** (elimina RLS)
  - Crear endpoint de prueba sin RLS
  - Verificar si es problema de permisos

### Posibles Causas
1. **RLS bloqueando la consulta**: Políticas de Supabase impidiendo lectura
2. **Timezone mismatch**: Aunque el rango parece correcto, puede haber inconsistencia
3. **Supabase client mal configurado**: Service role key no aplicándose
4. **Cache de Supabase**: Datos no sincronizados

### Archivos Involucrados
- `backend/src/ai/ai.service.ts` (líneas 70-75) - Query de compras
- `backend/src/supabase/supabase.service.ts` - Cliente Supabase
- `backend/supabase/migrations/*compras*.sql` - RLS policies
- `backend/.env` - SUPABASE_SERVICE_ROLE_KEY

---

## 🎫 PRIORIDAD 2: Canjear Cupones en Nueva Venta

### Descripción
Permitir al staff/admin canjear cupones/promociones del cliente al momento de registrar una nueva compra.

### Tareas Backend
- [ ] **Modificar endpoint `POST /api/admin/compras`**
  - Archivo: `backend/src/admin/admin.service.ts`
  - Añadir parámetro opcional: `cupon_id?: string`
  - Validar que el cupón pertenezca al cliente
  - Validar que el cupón esté disponible (no canjeado)
  - Marcar cupón como canjeado al registrar compra
  - Aplicar descuento/beneficio del cupón al importe

- [ ] **Endpoint de consulta de cupones disponibles**
  - Crear: `GET /api/admin/clientes/:id/cupones-disponibles`
  - Devolver solo cupones no canjeados y activos
  - Incluir información de la promoción asociada

### Tareas Frontend
- [ ] **Modificar formulario de nueva venta**
  - Archivo: `QRs/app/[slug]/admin/page.tsx` (o componente de ventas)
  - Añadir selector de cupones disponibles del cliente
  - Mostrar descuento/beneficio al seleccionar cupón
  - Actualizar vista previa del importe final
  - Enviar `cupon_id` en el POST

- [ ] **UI para mostrar cupones**
  - Componente dropdown o modal con cupones disponibles
  - Mostrar: nombre promoción, descuento, fecha expiración
  - Indicador visual de cupón seleccionado

### Archivos Involucrados
- `backend/src/admin/admin.service.ts` - Lógica canje
- `backend/src/admin/admin.controller.ts` - Endpoints
- `QRs/app/[slug]/admin/page.tsx` - Formulario ventas
- Base de datos: tabla `canjes_promociones`

---

## 👥 PRIORIDAD 3: CRUD Completo de Clientes (Admin)

### Estado Actual
- ✅ Listar clientes: `GET /api/admin/clientes`
- ✅ Ver detalle cliente: `GET /api/admin/clientes/:id`
- ❌ Editar cliente
- ❌ Eliminar cliente

### Tareas Backend

#### 3.1 Editar Cliente
- [ ] **Crear endpoint `PUT /api/admin/clientes/:id`**
  - Archivo: `backend/src/admin/admin.controller.ts`
  - Permitir editar: nombre, email, telefono, fecha_nacimiento, genero
  - Validar email único (si se cambia)
  - Validar teléfono único (si se cambia)
  - Solo admin de la tienda puede editar sus clientes (multi-tenant)

- [ ] **DTO para actualización**
  - Archivo: `backend/src/admin/dto/update-cliente.dto.ts`
  - Campos opcionales
  - Validaciones con class-validator

#### 3.2 Eliminar Cliente
- [ ] **Crear endpoint `DELETE /api/admin/clientes/:id`**
  - Archivo: `backend/src/admin/admin.controller.ts`
  - **IMPORTANTE**: Evaluar si debe ser eliminación lógica (soft delete) o física
  - Si tiene compras/cupones, considerar soft delete
  - Añadir campo `eliminado_en` a tabla clientes si es soft delete

- [ ] **RLS en Supabase**
  - Actualizar políticas de seguridad
  - Solo admin de la tienda puede eliminar sus clientes

### Tareas Frontend

#### 3.3 UI de Edición
- [ ] **Modal/Formulario de edición**
  - Archivo: `QRs/components/admin/clientes/EditarClienteDialog.tsx` (nuevo)
  - Cargar datos actuales del cliente
  - Formulario con campos editables
  - Validación frontend
  - Botón "Guardar cambios"

- [ ] **Integrar en tabla de clientes**
  - Archivo: `QRs/components/staff/clientes-tabla.tsx`
  - Añadir botón "Editar" en cada fila
  - Abrir modal de edición
  - Refrescar tabla después de editar

#### 3.4 UI de Eliminación
- [ ] **Confirmar eliminación**
  - AlertDialog de confirmación
  - Advertencia si tiene compras/cupones activos
  - Botón "Eliminar" en tabla de clientes
  - Refrescar tabla después de eliminar

### Archivos Involucrados
- `backend/src/admin/admin.controller.ts`
- `backend/src/admin/admin.service.ts`
- `backend/src/admin/dto/update-cliente.dto.ts` (nuevo)
- `QRs/components/admin/clientes/EditarClienteDialog.tsx` (nuevo)
- `QRs/components/staff/clientes-tabla.tsx`
- Base de datos: tabla `clientes`

---

## 🛒 PRIORIDAD 4: CRUD Completo de Ventas/Compras (Admin)

### Estado Actual
- ✅ Listar compras: `GET /api/admin/compras`
- ✅ Crear compra: `POST /api/admin/compras`
- ❌ Editar compra
- ❌ Eliminar compra

### Tareas Backend

#### 4.1 Editar Compra
- [ ] **Crear endpoint `PUT /api/admin/compras/:id`**
  - Archivo: `backend/src/admin/admin.controller.ts`
  - Permitir editar: importe, fecha, notas
  - **IMPORTANTE**: Recalcular puntos si cambia importe
  - Actualizar historial de puntos
  - Validar que la compra pertenezca a la tienda (multi-tenant)

- [ ] **DTO para actualización**
  - Archivo: `backend/src/admin/dto/update-compra.dto.ts`
  - Validaciones

#### 4.2 Eliminar Compra
- [ ] **Crear endpoint `DELETE /api/admin/compras/:id`**
  - Archivo: `backend/src/admin/admin.controller.ts`
  - **IMPORTANTE**: Restar puntos otorgados al cliente
  - Actualizar historial de puntos
  - Verificar si hay cupones generados por esa compra
  - Si hay cupones no canjeados, invalidarlos
  - Considerar soft delete vs hard delete

- [ ] **Lógica de puntos**
  - Calcular puntos a restar
  - Actualizar saldo de puntos del cliente
  - Registrar movimiento en historial_puntos

### Tareas Frontend

#### 4.3 UI de Edición de Compra
- [ ] **Modal/Formulario de edición**
  - Archivo: `QRs/components/admin/compras/EditarCompraDialog.tsx` (nuevo)
  - Campos: importe, fecha, notas
  - Advertencia sobre recálculo de puntos
  - Guardar cambios

- [ ] **Integrar en lista de compras**
  - Añadir botón "Editar"
  - Abrir modal
  - Refrescar lista después de editar

#### 4.4 UI de Eliminación de Compra
- [ ] **Confirmar eliminación**
  - AlertDialog con advertencia
  - Mostrar puntos que se restarán
  - Advertir si hay cupones asociados
  - Botón "Eliminar"
  - Refrescar lista después de eliminar

### Archivos Involucrados
- `backend/src/admin/admin.controller.ts`
- `backend/src/admin/admin.service.ts`
- `backend/src/admin/dto/update-compra.dto.ts` (nuevo)
- `QRs/components/admin/compras/EditarCompraDialog.tsx` (nuevo)
- Base de datos: tablas `compras`, `historial_puntos`, `canjes_promociones`

---

## 📋 Resumen de Prioridades

```
┌─────────────────────────────────────────────────────┐
│  MAÑANA - Orden de Ejecución Recomendado           │
├─────────────────────────────────────────────────────┤
│  1️⃣  IA - Debug KPIs en 0 (1-2 horas) 🔴 CRÍTICO  │
│  2️⃣  Canjear cupones en venta (2-3 horas)          │
│  3️⃣  CRUD Clientes - Editar (1-2 horas)            │
│  4️⃣  CRUD Clientes - Eliminar (1 hora)             │
│  5️⃣  CRUD Compras - Editar (2 horas)               │
│  6️⃣  CRUD Compras - Eliminar (2 horas)             │
└─────────────────────────────────────────────────────┘

Tiempo estimado total: 9-13 horas
```

---

## 🔧 Consideraciones Técnicas

### Multi-tenant
- **TODOS** los endpoints deben validar `tienda_id`
- RLS debe estar activo en todas las tablas
- Usar el `TenantGuard` en los controllers

### Puntos y Cupones
- Cualquier cambio en compras debe actualizar puntos
- Eliminar compra debe invalidar cupones no canjeados
- Considerar transacciones para operaciones críticas

### Soft Delete vs Hard Delete
**Recomendación**: Usar soft delete para:
- ✅ Clientes (para mantener historial)
- ✅ Compras (para auditoría)

Añadir columnas:
```sql
eliminado BOOLEAN DEFAULT FALSE
eliminado_en TIMESTAMP
eliminado_por UUID (referencia a admin)
```

### Testing
- Probar cada endpoint con curl/Postman
- Verificar permisos multi-tenant
- Probar casos edge (eliminar cliente con compras, etc.)

---

## 📝 Notas Finales

### Estado Actual del Proyecto
- ✅ Sistema de autenticación funcionando
- ✅ Registro de compras y puntos
- ✅ Sistema de promociones y cupones
- ✅ Sistema de campañas de email
- ✅ Dashboard con KPIs
- ⚠️  IA pendiente de API key
- ❌ CRUDs incompletos

### Próximos Pasos (Después de esto)
1. Sistema de notificaciones push
2. Integración con WhatsApp Business
3. Reportes avanzados y exportación
4. App móvil nativa (React Native)
5. Sistema de referidos

---

**Última actualización**: 11 de Noviembre, 2025 - 00:46 AM
**Creado por**: Claude Code

---

## 📊 Resumen de Trabajo de Hoy (11 Nov 2025)

### ✅ Completado
1. **Google Gemini AI funcionando**
   - Configurado modelo `gemini-2.0-flash`
   - API key verificada y funcionando
   - Endpoints de IA respondiendo correctamente
   - Generación de análisis, promociones y campañas OK

2. **Fix de fechas en KPIs**
   - Corrección en `ai.service.ts:45`: `setUTCHours(23, 59, 59, 999)`
   - Rango de fechas ahora incluye todo el día correctamente

### ⚠️ Pendiente / Bloqueado
1. **KPIs devolviendo 0** (CRÍTICO)
   - Query de Supabase no devuelve datos
   - Posible problema con RLS o configuración del cliente
   - Requiere investigación mañana como PRIORIDAD 1
