# Sistema de Autenticación de Clientes - Resumen de Cambios

## Problema Detectado y Solución

### Error: "Could not find the table 'public.email_otps'"

**Causa**: La tabla `email_otps` no existe en Supabase.

**Solución**: Ejecutar la migración `backend/database/create-email-otps.sql`

Ver instrucciones completas en: `backend/database/INSTRUCCIONES.md`

## Arquitectura Implementada

### Backend (NestJS + Supabase)

#### Nuevos archivos creados:
1. **`src/auth/guards/client-auth.guard.ts`**
   - Guard personalizado para autenticación de clientes
   - Valida tokens base64 con estructura: `{ sub, email, role, tienda_id, exp }`
   - Verifica que el cliente existe, está activo y pertenece al tenant correcto

2. **`src/clientes/dto/register-cliente.dto.ts`**
   - DTO para registro con validaciones
   - Campos: nombre, email, telefono, codigo_postal?, fecha_nacimiento?

3. **`src/clientes/dto/send-code-cliente.dto.ts`**
   - DTO para envío de código OTP
   - Campo: email

4. **`src/clientes/dto/verify-code-cliente.dto.ts`**
   - DTO para verificación de código
   - Campos: email, codigo (6 dígitos)

#### Archivos modificados:

**`src/clientes/clientes.service.ts`**
- Métodos nuevos:
  - `registerCliente()`: Crea cliente con todos los campos, devuelve `{ cliente, qr_code }`
  - `sendLoginCode()`: Genera código OTP de 6 dígitos, expira en 10 min
  - `verifyLoginCode()`: Valida código, devuelve token con expiración de 30 días
  - `getClienteById()`: Obtiene datos del cliente por ID
  - `updateClienteById()`: Actualiza datos del cliente
  - `getPuntosYComprasByClienteId()`: Obtiene puntos y últimas 10 compras

**`src/clientes/clientes.controller.ts`**
- Endpoints públicos (sin autenticación):
  - `POST /api/clientes/auth/register` - Registro de nuevo cliente
  - `POST /api/clientes/auth/send-code` - Envío de código OTP
  - `POST /api/clientes/auth/verify-code` - Verificación de código y login

- Endpoints protegidos (requieren `ClientAuthGuard`):
  - `GET /api/clientes/me` - Datos del cliente autenticado
  - `PUT /api/clientes/me` - Actualizar datos del cliente
  - `GET /api/clientes/me/puntos` - Puntos y compras del cliente

#### Migraciones SQL:

**`database/add-cliente-fields.sql`** (ejecutada)
```sql
ALTER TABLE clientes ADD COLUMN codigo_postal VARCHAR(10);
ALTER TABLE clientes ADD COLUMN fecha_nacimiento DATE;
```

**`database/create-email-otps.sql`** (PENDIENTE DE EJECUTAR)
```sql
CREATE TABLE email_otps (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  codigo VARCHAR(6) NOT NULL,
  expira_en TIMESTAMPTZ NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Frontend (Next.js 15 + React)

#### Archivos modificados:

**`components/registro-form.tsx`**
- Agregados campos: `codigo_postal`, `fecha_nacimiento`
- Cambiado para llamar API del backend en lugar de localStorage
- Redirect a `/login` después de registro exitoso

**`app/login/page.tsx`** (NUEVO)
- Flujo de 2 pasos:
  1. Ingreso de email → envío de código OTP
  2. Ingreso de código → verificación y redirect a perfil
- En desarrollo muestra el código en un toast
- Guarda token en localStorage

**`app/mi-perfil/page.tsx`** (NUEVO)
- Muestra QR del cliente (generado desde su ID con biblioteca `qrcode`)
- Muestra puntos totales
- Muestra información personal
- Muestra historial de últimas 10 compras
- Botón de logout
- Ruta protegida: redirect a `/login` si no hay token

## Flujo de Usuario Completo

### 1. Registro
```
Usuario → http://lokeyokiera.localhost:3000
↓
Completa formulario (nombre, email, telefono, cp, fecha nac)
↓
POST /api/clientes/auth/register
↓
Backend crea cliente en Supabase
↓
Redirect a /login
```

### 2. Login
```
Usuario → /login
↓
Ingresa email
↓
POST /api/clientes/auth/send-code
↓
Backend genera código de 6 dígitos y lo guarda en email_otps
↓
Usuario recibe código (en dev se muestra en toast)
↓
Ingresa código
↓
POST /api/clientes/auth/verify-code
↓
Backend valida código y devuelve token JWT
↓
Token guardado en localStorage
↓
Redirect a /mi-perfil
```

### 3. Ver Perfil
```
Usuario → /mi-perfil (con token en localStorage)
↓
GET /api/clientes/me (con Authorization: Bearer token)
↓
GET /api/clientes/me/puntos
↓
Se muestra QR, puntos, datos personales, compras
```

## Multitenancy

### Estructura de dominio:
- **Producción**: `{tienda}.qrconnect.es`
- **Desarrollo**: `{tienda}.localhost:3000` o `localhost:3000` (usa 'lokeyokiera' por defecto)

### Header importante:
Todas las peticiones incluyen: `X-Tenant-Domain: {tienda}`

### Aislamiento de datos:
- Cada tienda tiene sus propios clientes en tabla `clientes` con `id_tienda`
- Los tokens incluyen `tienda_id` para validación
- El guard verifica que el cliente pertenece al tenant actual

## Seguridad

### Tokens de Cliente:
- Formato: Base64 JSON con estructura:
  ```json
  {
    "sub": "uuid-del-cliente",
    "email": "cliente@email.com",
    "role": "cliente",
    "tienda_id": "uuid-de-la-tienda",
    "exp": timestamp (30 días)
  }
  ```

### Códigos OTP:
- 6 dígitos numéricos
- Expiran en 10 minutos
- Se marcan como "usado" después de validación exitosa
- Se eliminan de la base de datos después de uso

### Validaciones:
- Email válido (validado con class-validator)
- Teléfono mínimo 9 caracteres
- Código postal opcional, debe ser 5 dígitos
- Fecha de nacimiento opcional, formato YYYY-MM-DD
- Código OTP debe ser exactamente 6 dígitos numéricos

## Próximos Pasos

### OBLIGATORIO:
1. ✅ Ejecutar migración `create-email-otps.sql` en Supabase
2. ✅ Reiniciar backend después de ejecutar migración

### OPCIONAL (para mejor experiencia en desarrollo):
3. Configurar subdominios en archivo hosts (ver INSTRUCCIONES.md)
4. Probar flujo completo: registro → login → perfil
5. Crear segunda tienda y verificar aislamiento de datos

## Testing

### Endpoints a probar:

```bash
# 1. Registro
curl -X POST http://localhost:3001/api/clientes/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -d '{
    "nombre": "Test User",
    "email": "test@example.com",
    "telefono": "612345678",
    "codigo_postal": "28001",
    "fecha_nacimiento": "1990-01-01"
  }'

# 2. Enviar código
curl -X POST http://localhost:3001/api/clientes/auth/send-code \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -d '{"email": "test@example.com"}'

# 3. Verificar código (usar código recibido)
curl -X POST http://localhost:3001/api/clientes/auth/verify-code \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -d '{"email": "test@example.com", "codigo": "123456"}'

# 4. Obtener perfil (usar token recibido)
curl http://localhost:3001/api/clientes/me \
  -H "Authorization: Bearer {TOKEN}" \
  -H "X-Tenant-Domain: lokeyokiera"

# 5. Obtener puntos
curl http://localhost:3001/api/clientes/me/puntos \
  -H "Authorization: Bearer {TOKEN}" \
  -H "X-Tenant-Domain: lokeyokiera"
```

## Respuesta a tu pregunta sobre subdominios

**Pregunta**: "podriamos usar la estructura con tenantnombre.localhost?"

**Respuesta**: ¡Sí! El sistema ya está preparado para usar subdominios en localhost.

### Configuración necesaria:

1. Editar archivo hosts de Windows (desde WSL):
   ```bash
   sudo nano /mnt/c/Windows/System32/drivers/etc/hosts
   ```

2. Agregar líneas:
   ```
   127.0.0.1 lokeyokiera.localhost
   127.0.0.1 otratienda.localhost
   ```

3. Acceder a:
   - http://lokeyokiera.localhost:3000 (frontend)
   - http://localhost:3001 (backend)

### Ventajas:
- ✅ Simula el comportamiento de producción
- ✅ No necesitas cambiar código
- ✅ Fácil probar multitenancy
- ✅ Cookies se aíslan por subdominio

### Sin subdominios (fallback):
Si accedes a `localhost:3000` sin subdominio, el sistema automáticamente usa `lokeyokiera` como tenant por defecto (ver líneas 61 y 76 en `mi-perfil/page.tsx`):

```typescript
'X-Tenant-Domain': domain === 'localhost' ? 'lokeyokiera' : domain
```

## Errores Comunes y Soluciones

### Error: "Could not find the table 'public.email_otps'"
**Solución**: Ejecutar migración `create-email-otps.sql`

### Error: "Token expirado"
**Solución**: Hacer login nuevamente (los tokens duran 30 días)

### Error: "Cliente no encontrado o inactivo"
**Solución**: Verificar que el cliente existe en Supabase y `activo = true`

### Error: "Código inválido o expirado"
**Solución**: Los códigos expiran en 10 minutos, solicitar uno nuevo

### Error 404 en endpoints
**Solución**: Verificar que backend está corriendo y las rutas están registradas
