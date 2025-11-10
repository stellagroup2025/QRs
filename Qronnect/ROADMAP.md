# Roadmap de Desarrollo - Qronnect

## Estado Actual
✅ Sistema de autenticación multitenant (SuperAdmin, Admin, Cliente)
✅ Registro de clientes con OTP
✅ Generación de QR personalizados
✅ Panel SuperAdmin básico
✅ Panel Admin con vista de estadísticas básicas
✅ Sesiones permanentes para clientes

---

## 🎯 Tareas Pendientes

### 1. Personalización de Marca por Tienda desde SuperAdmin
**Objetivo**: Permitir que cada tienda tenga su propia identidad visual (colores, logo, nombre)

#### Backend
- [ ] Crear migración para añadir campos de personalización a tabla `tiendas`:
  - `logo_url` (TEXT) - URL del logo almacenado en Supabase Storage
  - `color_primario` (TEXT) - Color principal en formato hex (#RRGGBB)
  - `color_secundario` (TEXT) - Color secundario en formato hex
  - `color_acento` (TEXT) - Color de acento en formato hex
  - `nombre_comercial` (TEXT) - Nombre visible del comercio

- [ ] Crear endpoint en SuperAdmin para actualizar configuración de marca:
  - `PUT /api/superadmin/tiendas/:id/branding`
  - DTOs para validar colores (formato hex válido)
  - Servicio para subir logo a Supabase Storage

- [ ] Crear endpoint público para obtener configuración de marca:
  - `GET /api/config/branding` (usa X-Tenant-Domain)
  - Retorna: logo_url, colores, nombre_comercial

#### Frontend - SuperAdmin
- [ ] Crear sección "Personalización de Marca" en formulario de tienda
- [ ] Componente para subir logo (drag & drop)
- [ ] Color pickers para seleccionar colores (primario, secundario, acento)
- [ ] Preview en tiempo real de la marca
- [ ] Input para nombre comercial

#### Frontend - Cliente
- [ ] Crear hook `useBranding()` que cargue configuración desde API
- [ ] Actualizar `appBrand.ts` para usar configuración dinámica de la API
- [ ] Aplicar colores dinámicos usando CSS variables:
  ```css
  :root {
    --color-primary: <color_primario>;
    --color-secondary: <color_secundario>;
    --color-accent: <color_acento>;
  }
  ```
- [ ] Reemplazar "Mi comercio" con `nombre_comercial` de la tienda
- [ ] Mostrar logo dinámico en header/navbar

---

### 2. Dashboard Completo para Admin de Comercio
**Objetivo**: Vista detallada de clientes y ventas con tablas interactivas

#### Backend
- [ ] Endpoint para listado paginado de clientes:
  - `GET /api/admin/clientes?page=1&limit=20&search=email`
  - Incluir: nombre, email, puntos_totales, ultima_visita, total_compras
  - Filtros: búsqueda por texto, ordenar por puntos/visitas

- [ ] Endpoint para detalle de cliente:
  - `GET /api/admin/clientes/:id`
  - Incluir: datos personales, historial completo de compras, puntos acumulados/canjeados

- [ ] Endpoint para listado de ventas:
  - `GET /api/admin/compras?page=1&limit=20&fecha_desde=&fecha_hasta=`
  - Incluir: cliente (nombre, email), fecha, total, puntos_otorgados
  - Filtros: rango de fechas, cliente específico

#### Frontend - Admin Dashboard
- [ ] **Tab "Clientes"**:
  - Tabla con DataTable de shadcn/ui
  - Columnas: Nombre, Email, Teléfono, Puntos, Última Visita, Total Compras
  - Búsqueda en tiempo real
  - Paginación
  - Click en fila → modal con detalle del cliente
  - Botón "Exportar a CSV"

- [ ] **Tab "Ventas"**:
  - Tabla con DataTable de shadcn/ui
  - Columnas: Fecha, Cliente, Total €, Puntos Otorgados
  - Filtros: rango de fechas, búsqueda por cliente
  - Paginación
  - Totales: suma de facturación y puntos del periodo
  - Botón "Exportar a CSV"

- [ ] **Modal de Detalle de Cliente**:
  - Información personal (editable)
  - Historial de compras (tabla)
  - Gráfico de puntos acumulados en el tiempo
  - Botón "Ajustar puntos manualmente" (con motivo)

---

### 3. KPIs y Gráficos en Dashboard Admin
**Objetivo**: Visualización de métricas clave con diagramas interactivos

#### Backend
- [ ] Endpoint de analytics:
  - `GET /api/admin/dashboard/analytics?periodo=30d`
  - Retornar:
    - Evolución de clientes nuevos (por día/semana/mes)
    - Evolución de facturación (por día/semana/mes)
    - Distribución de clientes por rango de puntos
    - Top 10 clientes por facturación
    - Tasa de retención (% clientes que vuelven)
    - Ticket promedio
    - Frecuencia de visita promedio

#### Frontend - Admin Dashboard
- [ ] Instalar librería de gráficos (recharts o chart.js)

- [ ] **Sección de KPIs** (cards con iconos):
  - Total Clientes (con % cambio vs mes anterior)
  - Facturación Mensual (con % cambio vs mes anterior)
  - Ticket Promedio (con % cambio)
  - Tasa de Retención (con % cambio)

- [ ] **Gráficos**:
  - Gráfico de línea: Evolución de facturación (últimos 30/90 días)
  - Gráfico de barras: Nuevos clientes por semana
  - Gráfico de pastel: Distribución de clientes por rango de puntos
  - Tabla: Top 10 clientes VIP

- [ ] Selector de periodo: "7 días", "30 días", "90 días", "Este año"

---

### 4. Sistema de Promociones y Canje de Puntos
**Objetivo**: Crear, gestionar y canjear promociones usando puntos

#### Database
- [ ] Crear tabla `promociones`:
  - `id` (UUID, PK)
  - `id_tienda` (UUID, FK a tiendas)
  - `titulo` (TEXT) - "10€ de descuento"
  - `descripcion` (TEXT)
  - `tipo` (ENUM: 'descuento_fijo', 'descuento_porcentaje', 'producto_gratis')
  - `valor` (NUMERIC) - Valor del descuento o precio del producto
  - `puntos_requeridos` (INTEGER) - Puntos necesarios para canjear
  - `imagen_url` (TEXT) - Imagen de la promoción
  - `activo` (BOOLEAN)
  - `fecha_inicio` (TIMESTAMPTZ)
  - `fecha_fin` (TIMESTAMPTZ)
  - `cantidad_disponible` (INTEGER, nullable) - Límite de canjes
  - `cantidad_canjeada` (INTEGER, default 0)
  - `creado_en`, `actualizado_en`

- [ ] Crear tabla `canjes`:
  - `id` (UUID, PK)
  - `id_cliente` (UUID, FK a clientes)
  - `id_promocion` (UUID, FK a promociones)
  - `id_tienda` (UUID, FK a tiendas)
  - `puntos_usados` (INTEGER)
  - `estado` (ENUM: 'pendiente', 'usado', 'expirado')
  - `codigo_canje` (TEXT, unique) - Código QR/barras para validar
  - `fecha_canje` (TIMESTAMPTZ)
  - `fecha_uso` (TIMESTAMPTZ, nullable)
  - `usado_por` (UUID, nullable, FK a administradores)

#### Backend
- [ ] **CRUD de Promociones** (Admin):
  - `GET /api/admin/promociones` - Listar promociones
  - `POST /api/admin/promociones` - Crear promoción
  - `PUT /api/admin/promociones/:id` - Editar promoción
  - `DELETE /api/admin/promociones/:id` - Eliminar promoción
  - `POST /api/admin/promociones/:id/upload-image` - Subir imagen

- [ ] **Endpoints para Clientes**:
  - `GET /api/clientes/promociones` - Ver promociones disponibles
  - `POST /api/clientes/promociones/:id/canjear` - Canjear promoción
    - Validar puntos suficientes
    - Descontar puntos del cliente
    - Generar código de canje único
    - Registrar en tabla `canjes`
  - `GET /api/clientes/mis-canjes` - Ver canjes activos del cliente

- [ ] **Endpoints para validar canjes** (Admin):
  - `POST /api/admin/canjes/:codigo/validar` - Marcar como usado
  - `GET /api/admin/canjes` - Historial de canjes

#### Frontend - Admin Panel
- [ ] **Pantalla "Promociones"** (`/admin/promociones`):
  - Lista de promociones activas/inactivas (cards o tabla)
  - Botón "Crear Promoción"
  - Cada promoción muestra: imagen, título, puntos requeridos, canjes disponibles/usados
  - Botones: Editar, Activar/Desactivar, Eliminar

- [ ] **Formulario de Creación/Edición**:
  - Input: Título, Descripción
  - Select: Tipo de promoción
  - Input numérico: Valor del descuento
  - Input numérico: Puntos requeridos
  - Upload de imagen
  - DatePicker: Fecha inicio/fin
  - Input: Cantidad disponible (opcional, null = ilimitado)
  - Toggle: Activo/Inactivo

- [ ] **Pantalla "Canjes"** (`/admin/canjes`):
  - Lista de canjes pendientes/usados
  - Buscador por código o cliente
  - Botón "Validar Canje" → escanear QR o introducir código

#### Frontend - Cliente
- [ ] **Pantalla "Promociones"** (`/promociones`):
  - Grid de promociones disponibles (cards con imagen)
  - Badge: "X puntos" necesarios
  - Indicador: "Te faltan X puntos" o "¡Puedes canjearlo!"
  - Botón "Canjear" (deshabilitado si no tiene puntos)

- [ ] **Modal de Confirmación de Canje**:
  - Resumen de la promoción
  - Puntos a descontar
  - Puntos restantes tras canje
  - Botón "Confirmar Canje"

- [ ] **Pantalla "Mis Canjes"** (`/mis-canjes`):
  - Lista de cupones canjeados
  - Cada cupón muestra: QR/código de barras, título, fecha canje, estado
  - Badge: "Pendiente de usar" o "Usado"
  - Botón "Mostrar QR" → modal fullscreen con QR grande

---

### 5. Sistema de Email Marketing
**Objetivo**: Enviar campañas segmentadas a clientes usando filtros

#### Database
- [ ] Crear tabla `campanas_email`:
  - `id` (UUID, PK)
  - `id_tienda` (UUID, FK a tiendas)
  - `nombre` (TEXT) - Nombre interno de la campaña
  - `asunto` (TEXT) - Asunto del email
  - `cuerpo_html` (TEXT) - HTML del email
  - `filtros` (JSONB) - Filtros aplicados (edad, visitas, etc.)
  - `total_destinatarios` (INTEGER)
  - `enviados` (INTEGER, default 0)
  - `abiertos` (INTEGER, default 0)
  - `clicks` (INTEGER, default 0)
  - `estado` (ENUM: 'borrador', 'programada', 'enviando', 'enviada')
  - `fecha_programada` (TIMESTAMPTZ, nullable)
  - `fecha_envio` (TIMESTAMPTZ, nullable)
  - `creado_por` (UUID, FK a administradores)
  - `creado_en`, `actualizado_en`

- [ ] Crear tabla `envios_email`:
  - `id` (UUID, PK)
  - `id_campana` (UUID, FK a campanas_email)
  - `id_cliente` (UUID, FK a clientes)
  - `email` (TEXT)
  - `estado` (ENUM: 'pendiente', 'enviado', 'fallido', 'abierto', 'click')
  - `fecha_envio` (TIMESTAMPTZ)
  - `fecha_apertura` (TIMESTAMPTZ, nullable)
  - `error` (TEXT, nullable)

#### Backend
- [ ] Configurar servicio de email (SendGrid, Resend, o AWS SES)
  - Añadir credenciales en `.env`
  - Crear módulo `EmailService`

- [ ] **Endpoints de Campañas** (Admin):
  - `GET /api/admin/campanas` - Listar campañas
  - `POST /api/admin/campanas` - Crear campaña (borrador)
  - `PUT /api/admin/campanas/:id` - Editar campaña
  - `DELETE /api/admin/campanas/:id` - Eliminar campaña
  - `POST /api/admin/campanas/:id/preview` - Vista previa del email
  - `POST /api/admin/campanas/:id/enviar` - Enviar o programar envío

- [ ] **Endpoint de Filtros**:
  - `POST /api/admin/clientes/filtrar` - Retorna conteo de clientes que cumplen filtros
  - Filtros soportados:
    - Edad: rango (ej: 18-35 años)
    - Última visita: rango de fechas (ej: últimos 30 días, más de 90 días)
    - Número de visitas: rango (ej: más de 5 compras)
    - Puntos totales: rango (ej: más de 100 puntos)
    - Código postal: lista de CPs
    - Género (si se añade al schema)

- [ ] **Sistema de envío en background**:
  - Job queue (Bull, BullMQ) para enviar emails de forma asíncrona
  - Procesamiento en lotes (100 emails por lote)
  - Actualizar estado de `envios_email` tras cada envío
  - Tracking de aperturas (pixel tracking)
  - Tracking de clicks (URLs con tracking)

#### Frontend - Admin Panel
- [ ] **Pantalla "Campañas de Email"** (`/admin/campanas`):
  - Lista de campañas (tabla)
  - Columnas: Nombre, Asunto, Destinatarios, Enviados, Tasa Apertura, Estado, Fecha
  - Botón "Nueva Campaña"
  - Filtros: por estado, por fecha

- [ ] **Wizard de Creación de Campaña** (multi-step):

  **Paso 1: Configuración Básica**
  - Input: Nombre de campaña (interno)
  - Input: Asunto del email
  - Input: Remitente (nombre y email)

  **Paso 2: Audiencia (Filtros)**
  - Select: Edad (rango con slider)
  - Select: Última visita
    - Opciones: "Últimos 7 días", "Últimos 30 días", "Más de 90 días sin visitar"
  - Select: Número de compras
    - Opciones: "Primera compra", "2-5 compras", "Más de 5 compras"
  - Select: Puntos acumulados
    - Opciones: "0-50", "50-100", "Más de 100"
  - Input: Códigos postales (multi-select)
  - Preview: "X clientes cumplen estos criterios"

  **Paso 3: Diseño del Email**
  - Editor WYSIWYG (TipTap o Quill)
  - Variables dinámicas: `{nombre}`, `{puntos}`, `{tienda}`
  - Templates predefinidos:
    - Bienvenida
    - Promoción
    - Recordatorio
    - Newsletter
  - Botón "Vista previa" → modal con preview del email

  **Paso 4: Programación**
  - Radio: "Enviar ahora" o "Programar"
  - DateTimePicker: Fecha y hora de envío
  - Botón "Enviar Campaña" o "Programar Campaña"

- [ ] **Pantalla de Detalle de Campaña**:
  - KPIs: Total enviados, Tasa de apertura, Tasa de clicks
  - Gráfico de envíos en el tiempo
  - Tabla de destinatarios con estado de cada email
  - Botón "Reenviar a no abiertos"

#### Frontend - Cliente
- [ ] Endpoint para rastrear aperturas:
  - `GET /api/track/email/:id/open` (pixel transparente 1x1)

- [ ] Endpoint para rastrear clicks:
  - `GET /api/track/email/:id/click?url=...` (redirect con tracking)

---

## 📊 Priorización Sugerida

### Sprint 1 (Semana 1)
1. ✅ Personalización de Marca por Tienda (Backend + SuperAdmin)
2. ✅ Actualización dinámica de `appBrand.ts`

### Sprint 2 (Semana 2)
3. ✅ Dashboard Admin - Tab Clientes (listado y detalle)
4. ✅ Dashboard Admin - Tab Ventas (listado y filtros)

### Sprint 3 (Semana 3)
5. ✅ KPIs y Gráficos en Dashboard
6. ✅ Analytics endpoint

### Sprint 4 (Semana 4)
7. ✅ Sistema de Promociones (Backend + Admin Panel)
8. ✅ Canje de Promociones (Cliente App)

### Sprint 5 (Semana 5)
9. ✅ Email Marketing (Backend + Servicio de envío)
10. ✅ Campañas y Filtros (Admin Panel)

---

## 🛠️ Tecnologías a Integrar

- **Gráficos**: `recharts` o `chart.js`
- **Tablas**: `@tanstack/react-table` (ya incluido en shadcn DataTable)
- **Editor WYSIWYG**: `tiptap` o `quill`
- **Email Service**: `SendGrid`, `Resend`, o `AWS SES`
- **Job Queue**: `BullMQ` (para envíos en background)
- **QR Generator**: Ya instalado (`qrcode`)
- **Upload de imágenes**: Supabase Storage
- **Date Pickers**: `react-day-picker` (ya incluido en shadcn)

---

## 📝 Notas

- Todos los endpoints de Admin requieren `AdminAuthGuard`
- Todos los endpoints de Cliente requieren `ClientAuthGuard`
- Todos los endpoints usan el decorator `@Tenant()` para multitenancy
- Los emails deben cumplir con CAN-SPAM Act (botón de unsuscribe)
- Implementar rate limiting en endpoints de envío de emails
- Considerar GDPR: opción de "exportar mis datos" y "eliminar mi cuenta"
