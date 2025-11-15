# 🔐 Panel SuperAdmin - Qronnect

## 📖 Descripción

El panel de **SuperAdmin** es un módulo de administración global que permite gestionar todas las tiendas del sistema Qronnect.

**Características principales:**
- ✅ Autenticación de doble factor por SMS (tu número: `+34630000356`)
- ✅ Crear, editar y eliminar tiendas (comercios)
- ✅ Ver datos completos de cualquier tienda (ventas, clientes, estadísticas)
- ✅ Obtener QR de cualquier cliente de cualquier tienda
- ✅ Dashboard global con métricas del sistema
- ✅ Registro de auditoría de todas las acciones
- ✅ Acceso global (bypasea el sistema de multitenancy)

---

## 🚀 Configuración Inicial

### 1. Ejecutar el Schema SQL

Desde Supabase SQL Editor, ejecuta:

```bash
backend/database/superadmin-schema.sql
```

Este script creará:
- Tabla `superadmin_users`
- Tabla `audit_log_superadmin`
- Vistas para dashboard y listado de tiendas
- Funciones auxiliares
- Políticas RLS

### 2. Configurar Supabase Phone Auth (SMS)

**Paso 1: Habilitar Phone Provider**
1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Authentication** → **Providers**
4. Habilita **Phone**

**Paso 2: Configurar proveedor de SMS**

Supabase soporta varios proveedores:

#### Opción A: Twilio (Recomendado)
1. Crea cuenta en https://www.twilio.com
2. Obtén:
   - Account SID
   - Auth Token
   - Número de teléfono de Twilio
3. En Supabase Dashboard → Settings → Auth → Phone Auth:
   - Selecciona "Twilio"
   - Pega tus credenciales
   - Guarda

#### Opción B: MessageBird
1. Crea cuenta en https://messagebird.com
2. Obtén API Key
3. Configura en Supabase

#### Opción C: Vonage (antes Nexmo)
1. Crea cuenta en https://vonage.com
2. Obtén API credentials
3. Configura en Supabase

**Documentación oficial:**
https://supabase.com/docs/guides/auth/phone-login

### 3. Crear tu Usuario SuperAdmin

**Opción A: Usando Supabase Dashboard**
1. Ve a Authentication → Users
2. Clic en "Add user" → "Phone"
3. Ingresa: `+34630000356`
4. Supabase enviará un código SMS
5. Verifica el código
6. Copia el UUID del usuario creado

**Opción B: Usando la API (desde Postman/curl)**

```bash
curl --request POST \
  --url 'https://ajyiuhujexwrjmjfycxh.supabase.co/auth/v1/signup' \
  --header 'apikey: TU-ANON-KEY' \
  --header 'content-type: application/json' \
  --data '{
    "phone": "+34630000356"
  }'
```

**Paso 2: Obtener el UUID del usuario**

Desde Supabase Dashboard → Authentication → Users, copia el UUID del usuario que acabas de crear.

**Paso 3: Insertar en tabla superadmin_users**

Ejecuta este SQL en Supabase (REEMPLAZA `TU-UUID` con el UUID real):

```sql
INSERT INTO superadmin_users (supabase_user_id, nombre, telefono, activo)
VALUES (
  'TU-UUID-AQUI',  -- REEMPLAZAR con el UUID de Supabase Auth
  'Omar',
  '+34630000356',
  TRUE
);
```

**Verificar:**
```sql
SELECT * FROM superadmin_users;
```

Deberías ver tu usuario.

---

## 🔑 Autenticación

El sistema usa autenticación de doble factor por SMS:

### Flujo de Login

1. **Solicitar código SMS**
   ```http
   POST /api/superadmin/auth/send-sms
   Content-Type: application/json

   {
     "telefono": "+34630000356"
   }
   ```

   **Respuesta:**
   ```json
   {
     "message": "Código de verificación enviado a +34630000356"
   }
   ```

   Recibirás un código de 6 dígitos por SMS.

2. **Verificar código y obtener token**
   ```http
   POST /api/superadmin/auth/verify-sms
   Content-Type: application/json

   {
     "telefono": "+34630000356",
     "codigo": "123456"
   }
   ```

   **Respuesta:**
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "superadmin": {
       "id": "uuid-del-superadmin",
       "nombre": "Omar",
       "telefono": "+34630000356",
       "email": null
     }
   }
   ```

3. **Usar el token en requests posteriores**

   Todas las demás peticiones requieren el header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 📊 Endpoints Disponibles

### Dashboard Global

**GET /api/superadmin/dashboard**

Obtiene métricas generales del sistema.

```bash
curl -X GET http://localhost:3001/api/superadmin/dashboard \
  -H "Authorization: Bearer TU-TOKEN"
```

**Respuesta:**
```json
{
  "tiendas_activas": 5,
  "total_tiendas": 8,
  "total_clientes": 1250,
  "total_compras": 8934,
  "facturacion_total": 156789.50,
  "compras_ultimo_mes": 234,
  "facturacion_ultimo_mes": 12345.67
}
```

---

### Gestión de Tiendas

#### Listar Todas las Tiendas

**GET /api/superadmin/tiendas**

```bash
curl -X GET http://localhost:3001/api/superadmin/tiendas \
  -H "Authorization: Bearer TU-TOKEN"
```

**Respuesta:**
```json
[
  {
    "id": "uuid-tienda-1",
    "nombre": "Cafetería Aroma",
    "dominio": "cafeteria-aroma",
    "dominio_personalizado": null,
    "plan": "profesional",
    "activo": true,
    "creado_en": "2025-01-15T10:30:00Z",
    "total_clientes": 145,
    "total_compras": 892,
    "total_facturado": 15234.50,
    "ultima_compra": "2025-11-09T18:45:00Z"
  },
  // ... más tiendas
]
```

---

#### Crear Nueva Tienda

**POST /api/superadmin/tiendas**

```bash
curl -X POST http://localhost:3001/api/superadmin/tiendas \
  -H "Authorization: Bearer TU-TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Cafetería El Sol",
    "dominio": "cafeteria-el-sol",
    "dominio_personalizado": "www.cafeteriaelsol.com",
    "direccion": "Calle Mayor 123, Madrid",
    "telefono": "+34912345678",
    "email": "info@cafeteriaelsol.com",
    "plan": "profesional",
    "configuracion": {
      "puntos_por_euro": 1,
      "moneda": "EUR"
    }
  }'
```

**Respuesta:**
```json
{
  "id": "uuid-nueva-tienda",
  "nombre": "Cafetería El Sol",
  "dominio": "cafeteria-el-sol",
  "dominio_personalizado": "www.cafeteriaelsol.com",
  "plan": "profesional",
  "activo": true,
  "creado_en": "2025-11-09T20:15:00Z",
  // ... otros campos
}
```

**Campos disponibles:**
- `nombre` *(requerido)*: Nombre del comercio
- `dominio` *(requerido)*: Dominio único (sin .qronnect.com)
- `dominio_personalizado`: Dominio propio del cliente (opcional)
- `direccion`: Dirección física
- `telefono`: Teléfono de contacto
- `email`: Email de contacto
- `logo_url`: URL del logo
- `plan`: `basico`, `profesional` o `enterprise`
- `configuracion`: Objeto JSON con configuración personalizada

---

#### Obtener Datos Completos de una Tienda

**GET /api/superadmin/tiendas/:id**

Retorna todos los datos de la tienda: información, clientes, compras recientes, estadísticas.

```bash
curl -X GET http://localhost:3001/api/superadmin/tiendas/UUID-DE-LA-TIENDA \
  -H "Authorization: Bearer TU-TOKEN"
```

**Respuesta:**
```json
{
  "tienda": {
    "id": "uuid-tienda",
    "nombre": "Cafetería Aroma",
    "dominio": "cafeteria-aroma",
    // ... todos los campos de la tienda
  },
  "clientes": [
    {
      "id": "uuid-cliente-1",
      "nombre": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "puntos_totales": 150,
      // ...
    },
    // ... más clientes
  ],
  "compras_recientes": [
    {
      "id": "uuid-compra-1",
      "importe": 25.50,
      "puntos_otorgados": 25,
      "fecha": "2025-11-09T18:30:00Z",
      // ...
    },
    // ... últimas 50 compras
  ],
  "estadisticas": {
    "total_clientes": 145,
    "total_compras": 892,
    "facturacion_total": 15234.50,
    "promedio_compra": 17.08
  }
}
```

---

#### Actualizar Tienda

**PUT /api/superadmin/tiendas/:id**

Puedes actualizar cualquier campo de la tienda.

```bash
curl -X PUT http://localhost:3001/api/superadmin/tiendas/UUID-DE-LA-TIENDA \
  -H "Authorization: Bearer TU-TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "enterprise",
    "activo": true,
    "configuracion": {
      "puntos_por_euro": 2
    }
  }'
```

---

#### Eliminar Tienda (Desactivar)

**DELETE /api/superadmin/tiendas/:id**

Desactiva la tienda (soft delete).

```bash
curl -X DELETE http://localhost:3001/api/superadmin/tiendas/UUID-DE-LA-TIENDA \
  -H "Authorization: Bearer TU-TOKEN"
```

**Respuesta:**
```json
{
  "message": "Tienda \"Cafetería Aroma\" desactivada correctamente"
}
```

---

### Obtener QR de Cliente

**GET /api/superadmin/tiendas/:tiendaId/clientes/:clienteId/qr**

Obtiene el código QR de cualquier cliente de cualquier tienda.

```bash
curl -X GET http://localhost:3001/api/superadmin/tiendas/UUID-TIENDA/clientes/UUID-CLIENTE/qr \
  -H "Authorization: Bearer TU-TOKEN"
```

**Respuesta:**
```json
{
  "cliente": {
    "id": "uuid-cliente",
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "puntos_totales": 150
  },
  "qr": {
    "id": "uuid-qr",
    "id_cliente": "uuid-cliente",
    "codigo": "ABC123XYZ789",
    "qr_data": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "activo": true,
    "creado_en": "2025-01-15T10:00:00Z"
  }
}
```

---

### Logs de Auditoría

**GET /api/superadmin/audit-logs?limit=100**

Obtiene el registro de todas las acciones realizadas por superadmins.

```bash
curl -X GET "http://localhost:3001/api/superadmin/audit-logs?limit=50" \
  -H "Authorization: Bearer TU-TOKEN"
```

**Respuesta:**
```json
[
  {
    "id": "uuid-log-1",
    "superadmin_id": "uuid-superadmin",
    "accion": "crear_tienda",
    "entidad": "tienda",
    "entidad_id": "uuid-nueva-tienda",
    "detalles": {
      "tienda_nombre": "Cafetería El Sol",
      "dominio": "cafeteria-el-sol"
    },
    "ip_address": null,
    "user_agent": null,
    "fecha": "2025-11-09T20:15:00Z",
    "superadmin": {
      "nombre": "Omar",
      "telefono": "+34630000356"
    }
  },
  // ... más logs
]
```

---

## 🔒 Seguridad

### Protección de Rutas

Todas las rutas de superadmin están protegidas con el `SuperAdminGuard`:

1. Verifica que el request incluya un JWT válido de Supabase
2. Verifica que el usuario está en la tabla `superadmin_users`
3. Verifica que el usuario está activo (`activo = TRUE`)
4. Registra el último acceso

### Bypass del Middleware de Tenant

Las rutas de superadmin **NO** pasan por el middleware de tenant resolution. Esto permite:
- Acceso global a todas las tiendas
- No requiere dominio específico
- Puede gestionar múltiples tiendas en una sola sesión

### Auditoría

Todas las acciones importantes se registran automáticamente en `audit_log_superadmin`:
- Crear tienda
- Actualizar tienda
- Eliminar tienda
- Login de superadmin
- Ver datos de tienda

---

## 📱 Swagger UI

Puedes probar todos los endpoints desde Swagger:

http://localhost:3001/api/docs

1. Haz clic en "Authorize"
2. Pega tu `access_token` obtenido del login SMS
3. Explora y prueba todos los endpoints

---

## 🧪 Prueba Completa del Flujo

### 1. Configurar todo
```bash
# 1. Ejecutar schema SQL en Supabase
# 2. Configurar Phone Auth en Supabase (Twilio)
# 3. Crear usuario superadmin en Supabase Auth
# 4. Insertar en tabla superadmin_users
```

### 2. Login
```bash
# Solicitar código SMS
curl -X POST http://localhost:3001/api/superadmin/auth/send-sms \
  -H "Content-Type: application/json" \
  -d '{"telefono": "+34630000356"}'

# Verificar código (reemplaza 123456 con el código real)
curl -X POST http://localhost:3001/api/superadmin/auth/verify-sms \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "+34630000356",
    "codigo": "123456"
  }'

# Guardar el access_token de la respuesta
```

### 3. Ver Dashboard
```bash
curl -X GET http://localhost:3001/api/superadmin/dashboard \
  -H "Authorization: Bearer TU-TOKEN"
```

### 4. Crear una Tienda
```bash
curl -X POST http://localhost:3001/api/superadmin/tiendas \
  -H "Authorization: Bearer TU-TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Farmacia Salud Plus",
    "dominio": "farmacia-salud-plus",
    "plan": "basico"
  }'
```

### 5. Listar Tiendas
```bash
curl -X GET http://localhost:3001/api/superadmin/tiendas \
  -H "Authorization: Bearer TU-TOKEN"
```

---

## 🎯 Próximos Pasos (Frontend)

Si quieres crear un frontend para el panel SuperAdmin, necesitarás:

### Páginas
1. **Login (`/superadmin/login`)**
   - Input de teléfono
   - Botón "Enviar código"
   - Input de código de 6 dígitos
   - Botón "Verificar"

2. **Dashboard (`/superadmin`)**
   - Métricas globales
   - Gráficos de actividad
   - Lista de tiendas recientes

3. **Gestión de Tiendas (`/superadmin/tiendas`)**
   - Tabla con todas las tiendas
   - Botón "Crear tienda"
   - Acciones: Ver, Editar, Desactivar

4. **Vista de Tienda (`/superadmin/tiendas/:id`)**
   - Datos de la tienda
   - Lista de clientes
   - Lista de compras
   - Estadísticas
   - Botón para obtener QR de clientes

5. **Logs de Auditoría (`/superadmin/logs`)**
   - Tabla con todas las acciones
   - Filtros por fecha, acción, usuario

### Tecnologías Sugeridas
- **Next.js 15** (ya tienes el frontend base)
- **Shadcn/UI** (ya usas estos componentes)
- **Zustand** para state management del token
- **React Query** para fetching de datos

---

## 📚 Recursos

- **Schema SQL**: `backend/database/superadmin-schema.sql`
- **Código Backend**: `backend/src/superadmin/`
- **Swagger Docs**: http://localhost:3001/api/docs
- **Supabase Phone Auth**: https://supabase.com/docs/guides/auth/phone-login
- **Twilio (SMS)**: https://www.twilio.com/

---

## 🆘 Troubleshooting

### No recibo el código SMS
- Verifica que Twilio está configurado correctamente en Supabase
- Verifica que el número está en formato internacional (`+34...`)
- Revisa los logs de Twilio Dashboard

### Error "Número de teléfono no autorizado"
- Verifica que el número está en la tabla `superadmin_users`
- Verifica que el campo `activo = TRUE`

### Error "Código inválido o expirado"
- Los códigos OTP expiran después de 60 segundos
- Solicita un nuevo código

### Error "Acceso denegado: No eres un superadministrador"
- Verifica que tu usuario Supabase está en `superadmin_users`
- Verifica que el `supabase_user_id` coincide con tu usuario de Supabase Auth

---

¡Todo listo! Ahora tienes un panel SuperAdmin completo con autenticación SMS y gestión de tiendas. 🎉
