# 📧 SuperAdmin - Autenticación por EMAIL (100% GRATIS)

## ✅ Cambio Importante

El sistema SuperAdmin ahora usa **autenticación por EMAIL** en lugar de SMS.

### ¿Por qué?
- ✅ **100% GRATIS** - No requiere proveedores externos de pago
- ✅ **Sin configuración** - Supabase Email Auth está habilitado por defecto
- ✅ **Códigos OTP** - Igual de seguro, envía códigos de 6 dígitos por email
- ✅ **Sin límites** - Puedes enviar todos los emails que necesites

## 🚀 Cómo Funciona

### 1. Solicitar Código

**Endpoint**: `POST /api/superadmin/auth/send-email`

```bash
curl -X POST http://localhost:3001/api/superadmin/auth/send-email \
  -H "Content-Type: application/json" \
  -d '{"email": "tu@email.com"}'
```

**Respuesta**:
```json
{
  "message": "Código de verificación enviado a tu@email.com"
}
```

Recibirás un email con un código de 6 dígitos.

### 2. Verificar Código

**Endpoint**: `POST /api/superadmin/auth/verify-email`

```bash
curl -X POST http://localhost:3001/api/superadmin/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu@email.com",
    "codigo": "123456"
  }'
```

**Respuesta**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "superadmin": {
    "id": "uuid-superadmin",
    "nombre": "Omar",
    "email": "tu@email.com"
  }
}
```

### 3. Usar el Token

Usa el `access_token` en todas las peticiones posteriores:

```bash
curl -X GET http://localhost:3001/api/superadmin/dashboard \
  -H "Authorization: Bearer TU-ACCESS-TOKEN"
```

---

## 📋 Configuración Inicial

### Paso 1: Ejecutar Schema SQL

En Supabase SQL Editor:

```sql
-- Ejecutar todo el archivo:
backend/database/superadmin-schema.sql
```

### Paso 2: Crear tu Usuario

**Opción A - Desde Supabase Dashboard**:

1. Ve a **Authentication** → **Users**
2. Clic en **"Add user"**
3. Selecciona **"Email"**
4. Ingresa tu email (ej: `tu@email.com`)
5. Supabase te enviará un email de confirmación
6. Haz clic en el link del email para confirmar
7. Copia el UUID del usuario desde la tabla Users

**Opción B - Con Supabase CLI**:

```bash
supabase auth signup --email tu@email.com
```

### Paso 3: Añadir a tabla superadmin_users

Ejecuta este SQL (reemplaza con tu UUID real):

```sql
INSERT INTO superadmin_users (supabase_user_id, nombre, email, activo)
VALUES (
  'TU-SUPABASE-USER-UUID',  -- UUID del paso anterior
  'Tu Nombre',
  'tu@email.com',
  TRUE
);
```

**Verificar**:
```sql
SELECT * FROM superadmin_users;
```

Deberías ver tu usuario.

---

## 🧪 Probar Completo

### 1. Desde Swagger UI (Más Fácil)

1. Abre: http://localhost:3001/api/docs
2. Busca la sección **"SuperAdmin"**
3. Prueba **POST /api/superadmin/auth/send-email**:
   ```json
   {
     "email": "tu@email.com"
   }
   ```
4. Revisa tu bandeja de entrada del email
5. Copia el código de 6 dígitos
6. Prueba **POST /api/superadmin/auth/verify-email**:
   ```json
   {
     "email": "tu@email.com",
     "codigo": "123456"
   }
   ```
7. Copia el `access_token` de la respuesta
8. Haz clic en **"Authorize"** (botón verde arriba a la derecha)
9. Pega el token
10. ¡Ahora puedes probar todos los endpoints protegidos!

### 2. Con curl

```bash
# 1. Solicitar código
curl -X POST http://localhost:3001/api/superadmin/auth/send-email \
  -H "Content-Type: application/json" \
  -d '{"email": "tu@email.com"}'

# Revisa tu email y copia el código

# 2. Verificar código
curl -X POST http://localhost:3001/api/superadmin/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu@email.com",
    "codigo": "CODIGO-DEL-EMAIL"
  }'

# Copia el access_token de la respuesta

# 3. Probar endpoint protegido
curl -X GET http://localhost:3001/api/superadmin/dashboard \
  -H "Authorization: Bearer TU-ACCESS-TOKEN"

# 4. Listar tiendas
curl -X GET http://localhost:3001/api/superadmin/tiendas \
  -H "Authorization: Bearer TU-ACCESS-TOKEN"

# 5. Crear una tienda
curl -X POST http://localhost:3001/api/superadmin/tiendas \
  -H "Authorization: Bearer TU-ACCESS-TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mi Primera Tienda",
    "dominio": "mi-primera-tienda",
    "plan": "profesional"
  }'
```

---

## 📧 Formato del Email

Cuando solicites un código, recibirás un email de Supabase con este formato:

**Asunto**: `Confirm your signup`

**Cuerpo**:
```
Your confirmation code is: 123456

This code expires in 60 seconds.
```

---

## 🔐 Seguridad

- Los códigos OTP **expiran en 60 segundos**
- Cada código solo puede usarse **una vez**
- Si expira, solicita un nuevo código con `/send-email`
- Los tokens JWT tienen **expiración de 1 hora** (configurable)
- Usa el `refresh_token` para renovar la sesión sin pedir nuevo código

---

## ⚙️ Ventajas vs SMS

| Característica | Email (OTP) | SMS (Twilio) |
|----------------|-------------|--------------|
| **Costo** | ✅ GRATIS | ❌ De pago |
| **Configuración** | ✅ Sin config | ❌ Requiere Twilio |
| **Límites** | ✅ Sin límites | ❌ Créditos limitados |
| **Velocidad** | ⚡ Instantáneo | ⚡ Instantáneo |
| **Seguridad** | ✅ OTP 6 dígitos | ✅ OTP 6 dígitos |
| **Experiencia** | ✅ Igual de seguro | ✅ Igual de seguro |

---

## 🆘 Troubleshooting

### No recibo el email

1. **Revisa spam/correo no deseado**
2. **Verifica que el email esté confirmado** en Supabase Dashboard → Authentication → Users
3. **Revisa logs de Supabase**: Dashboard → Logs

### "Email no autorizado"

- Asegúrate de que tu email está en la tabla `superadmin_users`
- Verifica que `activo = TRUE`
- Ejecuta: `SELECT * FROM superadmin_users WHERE email = 'tu@email.com';`

### "Código inválido o expirado"

- Los códigos expiran en 60 segundos
- Solicita un nuevo código con `/send-email`
- Asegúrate de copiar el código correcto (6 dígitos)

### "Usuario no es superadmin"

- Verifica que el `supabase_user_id` en `superadmin_users` coincide con tu usuario de Supabase Auth
- Ejecuta:
  ```sql
  SELECT sa.*, u.email
  FROM superadmin_users sa
  JOIN auth.users u ON sa.supabase_user_id = u.id
  WHERE sa.email = 'tu@email.com';
  ```

---

## 📚 Documentación Completa

- **Guía completa**: `backend/SUPERADMIN.md` (actualizada)
- **Inicio rápido**: `SUPERADMIN_QUICKSTART.md` (actualizada)
- **Schema SQL**: `backend/database/superadmin-schema.sql`
- **Swagger**: http://localhost:3001/api/docs

---

## ✅ Resumen

**Antes (SMS)**:
- Requería Twilio (de pago)
- Configuración compleja
- Créditos limitados

**Ahora (Email)**:
- ✅ 100% GRATIS
- ✅ Sin configuración
- ✅ Sin límites
- ✅ Mismo nivel de seguridad

**Endpoints actualizados**:
- `POST /api/superadmin/auth/send-email` (antes: send-sms)
- `POST /api/superadmin/auth/verify-email` (antes: verify-sms)

¡Listo para usar! 🎉
