# 📖 API Reference - Qronnect Backend

Referencia rápida de todos los endpoints disponibles.

**Base URL**: `http://localhost:3000/api`

**Swagger UI**: `http://localhost:3000/api/docs`

---

## 🔓 Endpoints Públicos

### Health Check

```http
GET /api
```

**Respuesta**:
```json
{
  "status": "ok",
  "message": "Qronnect API is running",
  "timestamp": "2024-03-20T10:00:00.000Z",
  "version": "1.0.0"
}
```

---

## 👤 Endpoints de Clientes

**Autenticación requerida**: Bearer JWT de Supabase

### Obtener datos del cliente actual

```http
GET /api/clientes/me
Authorization: Bearer <jwt_token>
```

**Respuesta**:
```json
{
  "id": "uuid",
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "telefono": "+34 600 123 456",
  "puntos_totales": 150,
  "fecha_registro": "2024-01-15T10:30:00Z",
  "ultima_visita": "2024-03-20T14:45:00Z"
}
```

**Notas**:
- Si el cliente no existe, se crea automáticamente
- El cliente se asocia a `DEFAULT_TIENDA_ID`

---

### Actualizar datos del cliente

```http
PUT /api/clientes/me
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "nombre": "Juan Pérez García",
  "telefono": "+34 600 999 888",
  "email": "nuevo@ejemplo.com"
}
```

**Respuesta**: Igual que GET /api/clientes/me

---

### Obtener puntos y compras

```http
GET /api/clientes/me/puntos
Authorization: Bearer <jwt_token>
```

**Respuesta**:
```json
{
  "puntos_totales": 150,
  "ultima_compras": [
    {
      "id": "uuid",
      "fecha": "2024-03-20T14:45:00Z",
      "importe": 25.5,
      "puntos_otorgados": 25,
      "notas": "Compra de productos varios"
    }
  ]
}
```

**Notas**:
- Devuelve las últimas 10 compras
- Ordenadas por fecha descendente

---

### Obtener código QR

```http
GET /api/clientes/me/qr
Authorization: Bearer <jwt_token>
```

**Respuesta**:
```json
{
  "id": "uuid",
  "codigo": "Vx9kR2mP7nQ4sLt8",
  "creado_en": "2024-01-15T10:30:00Z"
}
```

**Notas**:
- Si no existe, se genera automáticamente
- El código tiene 16 caracteres alfanuméricos
- El frontend debe convertir el `codigo` a QR visual

---

## 🔐 Endpoints de Administración

**Autenticación requerida**: Bearer JWT + Rol de admin en `roles_tienda`

### Registrar una compra

```http
POST /api/admin/compras/registrar
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "codigoQr": "Vx9kR2mP7nQ4sLt8",
  "importe": 25.5,
  "notas": "Compra de productos varios"
}
```

**Respuesta**:
```json
{
  "compra_id": "uuid",
  "cliente": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com"
  },
  "importe": 25.5,
  "puntos_otorgados": 25,
  "puntos_totales_cliente": 175,
  "fecha": "2024-03-20T14:45:00Z"
}
```

**Notas**:
- `puntos_otorgados` = `importe` × `PUNTOS_POR_EURO`
- Se actualiza `puntos_totales` y `ultima_visita` del cliente
- Si el `codigoQr` no existe, devuelve 400

---

### Listar clientes de la tienda

```http
GET /api/admin/clientes?limit=50&offset=0
Authorization: Bearer <jwt_token>
```

**Query params**:
- `limit` (opcional): Número de resultados (default: 50)
- `offset` (opcional): Saltar resultados (default: 0)

**Respuesta**:
```json
[
  {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "telefono": "+34 600 123 456",
    "puntos_totales": 150,
    "fecha_registro": "2024-01-15T10:30:00Z",
    "ultima_visita": "2024-03-20T14:45:00Z",
    "numero_compras": 12
  }
]
```

**Notas**:
- Solo devuelve clientes de la tienda del admin
- Ordenados por fecha de registro (más recientes primero)
- Solo clientes activos

---

### Listar compras de la tienda

```http
GET /api/admin/compras?limit=50&offset=0
Authorization: Bearer <jwt_token>
```

**Query params**:
- `limit` (opcional): Número de resultados (default: 50)
- `offset` (opcional): Saltar resultados (default: 0)

**Respuesta**:
```json
[
  {
    "id": "uuid",
    "fecha": "2024-03-20T14:45:00Z",
    "importe": 25.5,
    "puntos_otorgados": 25,
    "notas": "Compra de productos varios",
    "cliente": {
      "id": "uuid",
      "nombre": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "telefono": "+34 600 123 456"
    }
  }
]
```

**Notas**:
- Ordenadas por fecha descendente (más recientes primero)
- Solo compras de la tienda del admin

---

### Obtener resumen del dashboard

```http
GET /api/admin/dashboard/resumen
Authorization: Bearer <jwt_token>
```

**Respuesta**:
```json
{
  "total_clientes": 250,
  "clientes_activos_ultimos_30_dias": 85,
  "total_compras": 1250,
  "ventas_totales": 15750.5,
  "ticket_medio": 12.6,
  "puntos_otorgados_totales": 15750
}
```

**Notas**:
- Usa la vista SQL `vista_dashboard_tienda` si está disponible
- Fallback a cálculo manual si la vista falla
- Solo datos de la tienda del admin

---

## 🔑 Autenticación

### Obtener JWT (desde Supabase Auth)

Este endpoint NO está en el backend de NestJS, sino en Supabase Auth directamente:

```http
POST https://tu-proyecto.supabase.co/auth/v1/token?grant_type=password
Content-Type: application/json
apikey: <SUPABASE_ANON_KEY>

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": { ... }
}
```

**Notas**:
- Usa el `access_token` en el header `Authorization: Bearer <token>`
- El token expira en 1 hora por defecto
- Usa el `refresh_token` para obtener un nuevo `access_token`

---

## 🚫 Códigos de Error

| Código | Significado |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o no proporcionado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## 📦 Ejemplos con cURL

### Cliente: Obtener mis datos

```bash
curl http://localhost:3000/api/clientes/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Cliente: Actualizar mis datos

```bash
curl -X PUT http://localhost:3000/api/clientes/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Nuevo Nombre",
    "telefono": "+34 600 999 888"
  }'
```

### Cliente: Obtener mi QR

```bash
curl http://localhost:3000/api/clientes/me/qr \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Admin: Registrar compra

```bash
curl -X POST http://localhost:3000/api/admin/compras/registrar \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "codigoQr": "Vx9kR2mP7nQ4sLt8",
    "importe": 25.5,
    "notas": "Compra de prueba"
  }'
```

### Admin: Ver dashboard

```bash
curl http://localhost:3000/api/admin/dashboard/resumen \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 🔧 Configuración del Factor de Puntos

El factor de conversión euros → puntos se configura en `.env`:

```env
PUNTOS_POR_EURO=1   # 1 euro = 1 punto
PUNTOS_POR_EURO=10  # 1 euro = 10 puntos
PUNTOS_POR_EURO=0.5 # 2 euros = 1 punto
```

**Ejemplo de cálculo**:
- Compra: 25.50 €
- Factor: 10
- Puntos otorgados: `Math.floor(25.50 × 10)` = **255 puntos**

---

## 📚 Recursos Adicionales

- **Swagger UI**: http://localhost:3000/api/docs (Documentación interactiva)
- **Guía de Setup**: Ver `SETUP_GUIDE.md`
- **README completo**: Ver `README.md`
- **Schema SQL**: Ver `database/schema.sql`

---

## 💡 Tips

1. **Usa Swagger UI para probar**: Es más fácil que cURL
2. **Guarda el JWT**: Los tokens son largos, úsalos desde variables
3. **Verifica el rol admin**: Si recibes 403 en `/admin/*`, revisa `roles_tienda`
4. **Logs del servidor**: Ejecuta con `npm run start:dev` para ver logs detallados
5. **Reinicia si cambias .env**: Los cambios en variables requieren reiniciar NestJS
