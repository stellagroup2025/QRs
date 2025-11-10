# 🗺️ ROADMAP - Tareas Pendientes

> Fecha: 11 de Noviembre, 2025
> Proyecto: Qronnect - Sistema de Fidelización

---

## 🎯 PRIORIDAD 1: IA (Google Gemini)

### Problema Actual
- El código está **correcto** ✅
- SDK moderno instalado: `@google/generative-ai` v0.24.1 ✅
- Configuración correcta: modelo `gemini-pro` sin prefijos ✅
- **PROBLEMA**: API key sin acceso a modelos Gemini en endpoint v1beta

### Tareas
- [ ] **Verificar API key en Google AI Studio**
  - URL: https://aistudio.google.com/app/apikey
  - Verificar que tenga acceso a Gemini API
  - Revisar restricciones y cuotas

- [ ] **Opción alternativa: Crear nueva API key**
  - Crear en Google AI Studio
  - Seleccionar proyecto correcto
  - Actualizar `.env` con nueva key:
    ```
    GEMINI_API_KEY=nueva_key_aqui
    ```
  - Reiniciar backend

- [ ] **Probar endpoints de IA**
  ```bash
  POST /api/admin/ai/kpi-summary
  POST /api/admin/ai/promo-ideas
  POST /api/admin/ai/email-campaigns
  ```

### Archivos Involucrados
- `backend/src/ai/gemini.service.ts` (línea 28) - Configuración modelo
- `backend/.env` - API key
- `QRs/components/admin/ia/PanelIA.tsx` - UI componente IA

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
│  1️⃣  IA - Resolver API key (30 min)                │
│  2️⃣  Canjear cupones en venta (2-3 horas)          │
│  3️⃣  CRUD Clientes - Editar (1-2 horas)            │
│  4️⃣  CRUD Clientes - Eliminar (1 hora)             │
│  5️⃣  CRUD Compras - Editar (2 horas)               │
│  6️⃣  CRUD Compras - Eliminar (2 horas)             │
└─────────────────────────────────────────────────────┘

Tiempo estimado total: 8-11 horas
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

**Última actualización**: 11 de Noviembre, 2025 - 00:25 AM
**Creado por**: Claude Code
