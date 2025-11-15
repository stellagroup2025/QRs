# 🧪 Ejemplos de Prueba - Sender ID API

## Pruebas con cURL

Aquí tienes ejemplos completos para probar la API de Sender ID desde la terminal.

---

## 📋 Pre-requisitos

1. **Tener un token de SuperAdmin**
2. **Conocer el ID de una tienda**
3. **Servidor corriendo en**: `http://localhost:3001`

---

## 🔐 1. Autenticarse como SuperAdmin

```bash
# Paso 1: Solicitar código por email
curl -X POST http://localhost:3001/api/superadmin/auth/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu_email@superadmin.com"
  }'

# Respuesta:
# {
#   "message": "Código enviado al email",
#   "codigo": "123456"  // En desarrollo aparece aquí
# }

# Paso 2: Verificar código y obtener token
curl -X POST http://localhost:3001/api/superadmin/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu_email@superadmin.com",
    "codigo": "123456"
  }'

# Respuesta:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "refresh_token": "...",
#   "superadmin": {
#     "id": "uuid-superadmin",
#     "nombre": "Admin",
#     "email": "tu_email@superadmin.com"
#   }
# }
```

**⚠️ Guardar el `access_token` para usarlo en las siguientes peticiones**

---

## 📊 2. Listar Todas las Tiendas

```bash
# Obtener lista de tiendas y sus IDs
curl -X GET http://localhost:3001/api/superadmin/tiendas \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"

# Respuesta (ejemplo):
# [
#   {
#     "id": "123e4567-e89b-12d3-a456-426614174000",
#     "nombre": "Gym FitZone",
#     "dominio": "gymfitzone",
#     "activo": true
#   },
#   ...
# ]
```

**📝 Copiar el `id` de la tienda que quieres configurar**

---

## 🔍 3. Ver Configuración SMS Actual

```bash
# Ver config SMS de una tienda
TIENDA_ID="123e4567-e89b-12d3-a456-426614174000"
TOKEN="tu_access_token_aqui"

curl -X GET "http://localhost:3001/api/superadmin/tiendas/${TIENDA_ID}/sms" \
  -H "Authorization: Bearer ${TOKEN}"

# Respuesta:
# {
#   "activo": true,
#   "modo": "global",
#   "configurado": true,
#   "sender_id": null,  // ⬅️ Sin Sender ID configurado
#   "limites": {
#     "max_por_dia": 100,
#     "max_por_mes": 2000
#   },
#   "creditos_disponibles": 500
# }
```

---

## ✏️ 4. Configurar Sender ID por Primera Vez

```bash
# Configurar Sender ID "GYMFITZONE"
TIENDA_ID="123e4567-e89b-12d3-a456-426614174000"
TOKEN="tu_access_token_aqui"

curl -X PATCH "http://localhost:3001/api/superadmin/tiendas/${TIENDA_ID}/sms/sender-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": "GYMFITZONE"
  }'

# Respuesta exitosa:
# {
#   "message": "Sender ID actualizado correctamente",
#   "tienda": {
#     "id": "123e4567-e89b-12d3-a456-426614174000",
#     "nombre": "Gym FitZone",
#     "sender_id": "GYMFITZONE"
#   }
# }
```

---

## 🔄 5. Actualizar Sender ID Existente

```bash
# Cambiar de "GYMFITZONE" a "FITGYM"
curl -X PATCH "http://localhost:3001/api/superadmin/tiendas/${TIENDA_ID}/sms/sender-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": "FITGYM"
  }'

# Respuesta:
# {
#   "message": "Sender ID actualizado correctamente",
#   "tienda": {
#     "id": "123e4567-e89b-12d3-a456-426614174000",
#     "nombre": "Gym FitZone",
#     "sender_id": "FITGYM"
#   }
# }
```

---

## 🗑️ 6. Eliminar Sender ID

```bash
# Eliminar Sender ID (volver a usar número de teléfono)
curl -X DELETE "http://localhost:3001/api/superadmin/tiendas/${TIENDA_ID}/sms/sender-id" \
  -H "Authorization: Bearer ${TOKEN}"

# Respuesta:
# {
#   "message": "Sender ID eliminado correctamente. La tienda usará número de teléfono.",
#   "tienda": {
#     "id": "123e4567-e89b-12d3-a456-426614174000",
#     "nombre": "Gym FitZone"
#   }
# }
```

---

## ❌ 7. Casos de Error - Ejemplos

### Error: Sender ID muy largo (>11 caracteres)

```bash
curl -X PATCH "http://localhost:3001/api/superadmin/tiendas/${TIENDA_ID}/sms/sender-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": "GYMFITNESSCENTER"
  }'

# Error:
# {
#   "statusCode": 400,
#   "message": [
#     "El Sender ID no puede tener más de 11 caracteres"
#   ],
#   "error": "Bad Request"
# }
```

### Error: Caracteres especiales no permitidos

```bash
curl -X PATCH "http://localhost:3001/api/superadmin/tiendas/${TIENDA_ID}/sms/sender-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": "GYM@FITNESS"
  }'

# Error:
# {
#   "statusCode": 400,
#   "message": [
#     "El Sender ID solo puede contener letras mayúsculas (A-Z) y números (0-9), sin espacios ni caracteres especiales"
#   ],
#   "error": "Bad Request"
# }
```

### Error: Solo números (debe tener al menos 1 letra)

```bash
curl -X PATCH "http://localhost:3001/api/superadmin/tiendas/${TIENDA_ID}/sms/sender-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": "123456"
  }'

# Error:
# {
#   "statusCode": 400,
#   "message": "El Sender ID debe contener al menos una letra",
#   "error": "Bad Request"
# }
```

### Error: Tienda no encontrada

```bash
TIENDA_INVALIDA="00000000-0000-0000-0000-000000000000"

curl -X PATCH "http://localhost:3001/api/superadmin/tiendas/${TIENDA_INVALIDA}/sms/sender-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": "GYMFIT"
  }'

# Error:
# {
#   "statusCode": 404,
#   "message": "Tienda no encontrada",
#   "error": "Not Found"
# }
```

---

## ✅ 8. Validaciones que se Aplican Automáticamente

### Conversión a Mayúsculas

```bash
# Enviar en minúsculas
curl -X PATCH "http://localhost:3001/api/superadmin/tiendas/${TIENDA_ID}/sms/sender-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": "gymfitzone"
  }'

# ✅ Se convierte automáticamente a:
# {
#   "sender_id": "GYMFITZONE"
# }
```

### Espacios (no permitidos)

```bash
# Con espacios
curl -X PATCH "http://localhost:3001/api/superadmin/tiendas/${TIENDA_ID}/sms/sender-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "sender_id": "GYM FITNESS"
  }'

# ❌ Error:
# "El Sender ID solo puede contener letras mayúsculas (A-Z) y números (0-9), sin espacios..."
```

---

## 🧪 9. Workflow Completo de Prueba

```bash
#!/bin/bash

# Variables
EMAIL="admin@superadmin.com"
TIENDA_ID="123e4567-e89b-12d3-a456-426614174000"
BASE_URL="http://localhost:3001/api"

# 1. Autenticarse
echo "📝 Solicitando código..."
curl -X POST "${BASE_URL}/superadmin/auth/send-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\"}" \
  | jq .

echo ""
read -p "Ingresa el código recibido: " CODIGO

echo "🔐 Verificando código..."
AUTH_RESPONSE=$(curl -s -X POST "${BASE_URL}/superadmin/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"codigo\":\"${CODIGO}\"}")

TOKEN=$(echo $AUTH_RESPONSE | jq -r '.access_token')
echo "✅ Token obtenido: ${TOKEN:0:20}..."

# 2. Ver config actual
echo ""
echo "📊 Configuración SMS actual:"
curl -s -X GET "${BASE_URL}/superadmin/tiendas/${TIENDA_ID}/sms" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq .

# 3. Configurar Sender ID
echo ""
echo "✏️ Configurando Sender ID..."
curl -s -X PATCH "${BASE_URL}/superadmin/tiendas/${TIENDA_ID}/sms/sender-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"sender_id":"GYMFITZONE"}' \
  | jq .

# 4. Verificar cambio
echo ""
echo "✅ Config actualizada:"
curl -s -X GET "${BASE_URL}/superadmin/tiendas/${TIENDA_ID}/sms" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq .

echo ""
echo "🎉 ¡Prueba completada!"
```

---

## 📱 10. Probar con Campaña SMS Real

```bash
# 1. Primero configurar Sender ID
curl -X PATCH "http://localhost:3001/api/superadmin/tiendas/${TIENDA_ID}/sms/sender-id" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"sender_id":"GYMFITZONE"}'

# 2. Login como Admin de la tienda
ADMIN_TOKEN="token_del_admin_de_tienda"

# 3. Crear campaña SMS
curl -X POST "http://localhost:3001/api/campanas-sms" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test Sender ID",
    "mensaje": "Hola {{nombre}}! Este mensaje llega con Sender ID.",
    "tipo": "informativa",
    "estado": "enviada",
    "destinatarios_ids": ["uuid-cliente-test"]
  }'

# 4. El cliente recibirá:
# ┌─────────────────────────┐
# │ De: GYMFITZONE          │ ⬅️ Sender ID!
# ├─────────────────────────┤
# │ Hola María! Este        │
# │ mensaje llega con       │
# │ Sender ID.              │
# └─────────────────────────┘
```

---

## 💡 Tips para Pruebas

### Usar variables de entorno

```bash
# ~/.bashrc o ~/.zshrc
export QRONNECT_API="http://localhost:3001/api"
export QRONNECT_TOKEN="tu_token_superadmin"
export TIENDA_TEST_ID="uuid-tienda-test"

# Uso:
curl -X PATCH "${QRONNECT_API}/superadmin/tiendas/${TIENDA_TEST_ID}/sms/sender-id" \
  -H "Authorization: Bearer ${QRONNECT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"sender_id":"TESTSHOP"}'
```

### Usar jq para formatear respuestas

```bash
# Instalar jq: brew install jq (Mac) o apt install jq (Linux)

curl ... | jq '.'  # Formatear JSON
curl ... | jq '.sender_id'  # Extraer campo específico
curl ... | jq -r '.message'  # Extraer sin comillas
```

### Guardar respuestas

```bash
curl ... > response.json
cat response.json | jq '.'
```

---

## ✅ Checklist de Pruebas

- [ ] Autenticación SuperAdmin funciona
- [ ] Ver config SMS de tienda existente
- [ ] Configurar Sender ID válido (GYMFITZONE)
- [ ] Actualizar Sender ID existente
- [ ] Eliminar Sender ID
- [ ] Probar Sender ID con más de 11 caracteres (debe fallar)
- [ ] Probar Sender ID solo con números (debe fallar)
- [ ] Probar Sender ID con caracteres especiales (debe fallar)
- [ ] Probar conversión automática a mayúsculas
- [ ] Enviar campaña SMS real con Sender ID configurado
- [ ] Verificar que el SMS llega con el Sender ID correcto

---

**¡API lista para ser probada! 🚀**
