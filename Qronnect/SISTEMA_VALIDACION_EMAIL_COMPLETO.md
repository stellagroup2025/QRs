# 🔒 Sistema Completo de Validación de Email

## 📋 Tabla de Contenidos

1. [Resumen](#resumen)
2. [Características Implementadas](#características-implementadas)
3. [Flujos de Usuario](#flujos-de-usuario)
4. [API Endpoints](#api-endpoints)
5. [Casos de Uso](#casos-de-uso)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Resumen

Este sistema asegura que **todos los usuarios deben validar su email antes de poder acceder** a la aplicación. Incluye:

✅ **Bloqueo de login** sin email validado
✅ **Regeneración automática** de enlaces expirados
✅ **Endpoint manual** para reenviar enlaces
✅ **UX amigable** con mensajes claros

---

## Características Implementadas

### 1. 🚫 Bloqueo de Acceso sin Email Validado

**Problema:** Usuarios podían entrar sin validar su email

**Solución:**
- El método `verifyLoginCode()` ahora verifica `email_validado`
- Si `email_validado = false` → **Login rechazado con error 401**
- Mensaje claro: *"Debes validar tu email antes de poder acceder. Revisa tu bandeja de entrada y haz clic en el enlace de validación."*

**Código:**
```typescript
// backend/src/clientes/clientes.service.ts (línea 606-615)
const emailValidado = cliente.email_validado === true;

if (!emailValidado) {
  console.log('  ⚠️  Email NO validado para:', cliente.email);
  throw new UnauthorizedException(
    'Debes validar tu email antes de poder acceder. Revisa tu bandeja de entrada y haz clic en el enlace de validación.'
  );
}
```

---

### 2. 🔄 Regeneración Automática de Enlaces Expirados

**Problema:** Si el usuario hace clic en un enlace expirado, simplemente ve un error

**Solución:**
- Al detectar token expirado, **automáticamente**:
  1. Genera un nuevo token de 64 caracteres
  2. Actualiza `codigo_validacion` y `codigo_validacion_expires_at` en BD
  3. Envía nuevo email con el enlace fresco
  4. Retorna respuesta especial al frontend

**Código:**
```typescript
// backend/src/clientes/clientes.service.ts (línea 992-1112)
if (now > expiresAt) {
  console.log('⏰ Token expirado para:', cliente.email);
  console.log('  - Generando nuevo enlace automáticamente...');

  // Generar nuevo token
  const newToken = crypto.randomBytes(32).toString('hex');
  const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Actualizar en BD
  await supabase
    .from('clientes')
    .update({
      codigo_validacion: newToken,
      codigo_validacion_expires_at: newExpiresAt.toISOString(),
      validacion_enviada_at: new Date().toISOString(),
    })
    .eq('id', cliente.id);

  // Enviar nuevo email
  const emailResult = await this.emailService.sendEmail({ /* ... */ });

  return {
    message: 'El enlace ha expirado. Te hemos enviado un nuevo enlace de validación a tu email.',
    email_validado: false,
    token_expirado: true,
    nuevo_enlace_enviado: emailResult.success,
  };
}
```

**Email enviado:**
- **Asunto:** `Nuevo enlace de validación - [Tienda]`
- **Color:** Gradiente rosa (#f093fb → #f5576c) para diferenciarlo
- **Mensaje:** Explica que el enlace anterior expiró

---

### 3. 📧 Endpoint para Reenviar Enlace Manualmente

**Problema:** Si el email no llega o se pierde, el usuario está bloqueado

**Solución:**
Nuevo endpoint público: `POST /api/clientes/auth/resend-validation-link`

**Request:**
```json
{
  "email": "usuario@example.com"
}
```

**Response (exitoso):**
```json
{
  "message": "Nuevo enlace de validación enviado a tu email. Revisa tu bandeja de entrada.",
  "enlace_enviado": true
}
```

**Validaciones:**
- ✅ Cliente debe existir en la tienda
- ✅ Email NO debe estar ya validado (retorna 400 si ya lo está)
- ✅ Genera nuevo token de 24 horas
- ✅ Envía email

**Código:**
```typescript
// backend/src/clientes/clientes.service.ts (línea 1152-1296)
async resendValidationLink(
  tenantId: string,
  sendValidationDto: SendValidationCodeDto,
): Promise<{ message: string; enlace_enviado: boolean }> {
  // ... buscar cliente

  if (cliente.email_validado) {
    throw new BadRequestException('Tu email ya está validado. Puedes iniciar sesión normalmente.');
  }

  // ... generar token, construir URL, enviar email
}
```

---

### 4. ✨ Frontend Mejorado para Validación

**Problema:** Frontend no manejaba el caso de token expirado

**Solución:**
Página `/validar-email` ahora detecta y muestra 4 estados:

1. **Validando** 🔵 - Spinner mientras se verifica el token
2. **Exitoso** ✅ - Email validado correctamente (redirige a perfil)
3. **Expirado** ⏰ - Token expiró pero nuevo enlace enviado
4. **Error** ❌ - Token inválido o problema desconocido

**Estado "Expirado":**
```typescript
// frontend/app/validar-email/page.tsx
if (data.token_expirado) {
  setStatus('expirado')
  setTokenExpirado(true)
  setNuevoEnlaceEnviado(data.nuevo_enlace_enviado || false)
  setMensaje(data.message || 'El enlace ha expirado. Te hemos enviado un nuevo enlace.')
  return
}
```

**UI mostrada:**
```
⏰ Enlace expirado
Te hemos enviado un nuevo enlace

[Box azul]
✉️ Revisa tu bandeja de entrada
Te hemos enviado un nuevo enlace de validación que expira en 24 horas.

[Botón: Ir al login]
```

---

## Flujos de Usuario

### Flujo 1: Registro y Validación Normal ✅

```
1. Usuario → /registro
2. Completa formulario multi-step
3. Click "Activar mis ventajas"

   Backend:
   - Crea cliente en BD
   - Genera token de 64 chars
   - Envía email con enlace

4. Usuario recibe email
5. Click en "Confirmar mi email"
6. → /validar-email?token=xxx

   Backend:
   - Verifica token válido y no expirado
   - Actualiza email_validado = true
   - Limpia token

7. Frontend muestra "✅ Email validado"
8. Redirige a /mi-perfil
```

**Tiempo estimado:** 1-2 minutos

---

### Flujo 2: Intento de Login sin Validar Email ❌

```
1. Usuario se registró pero NO validó email
2. Usuario → /login
3. Ingresa email
4. Recibe código OTP por email
5. Ingresa código OTP
6. Click "Iniciar sesión"

   Backend:
   - Valida código OTP ✅
   - Verifica email_validado = false ❌
   - Lanza UnauthorizedException

7. Frontend muestra error:
   "Debes validar tu email antes de poder acceder.
    Revisa tu bandeja de entrada y haz clic en el enlace de validación."

8. Usuario va a su email
9. Click en enlace de validación
10. Email validado ✅
11. Regresa al login
12. Login exitoso ✅
```

**Mensaje en logs:**
```
⚠️ Email NO validado para: usuario@example.com
```

---

### Flujo 3: Enlace Expirado (Regeneración Automática) 🔄

```
1. Usuario se registró hace >24 horas
2. Usuario encuentra el email viejo
3. Click en "Confirmar mi email"
4. → /validar-email?token=xxx_viejo

   Backend:
   - Busca cliente por token
   - Verifica expiración: NOW > expires_at ❌
   - Log: "⏰ Token expirado para: usuario@example.com"
   - Log: "- Generando nuevo enlace automáticamente..."
   - Genera nuevo token
   - Actualiza BD
   - Envía nuevo email
   - Retorna: { token_expirado: true, nuevo_enlace_enviado: true }

5. Frontend detecta token_expirado
6. Muestra:
   "⏰ Enlace expirado
    Te hemos enviado un nuevo enlace

    ✉️ Revisa tu bandeja de entrada
    Te hemos enviado un nuevo enlace de validación que expira en 24 horas."

7. Usuario revisa email
8. Recibe nuevo email: "🔄 Nuevo Enlace de Validación"
9. Click en nuevo enlace
10. Email validado ✅
```

**Tiempo estimado:** 2-3 minutos

---

### Flujo 4: Reenviar Enlace Manualmente 📤

```
1. Usuario perdió el email o no llegó
2. Usuario contacta soporte o usa botón "Reenviar enlace"
3. Frontend llama:
   POST /api/clientes/auth/resend-validation-link
   { "email": "usuario@example.com" }

   Backend:
   - Busca cliente por email ✅
   - Verifica email_validado = false ✅
   - Genera nuevo token
   - Envía email
   - Retorna: { enlace_enviado: true }

4. Usuario recibe email
5. Click en enlace
6. Email validado ✅
```

---

## API Endpoints

### 1. `GET /api/clientes/auth/validate-email/:token`

**Descripción:** Valida el email del cliente usando el token del enlace

**Headers:**
```
X-Tenant-Domain: lokeyokiera
```

**Response (exitoso):**
```json
{
  "message": "Email validado exitosamente",
  "email_validado": true,
  "cliente": {
    "id": "uuid",
    "nombre": "Juan",
    "email": "juan@example.com",
    ...
  }
}
```

**Response (token expirado - regeneración automática):**
```json
{
  "message": "El enlace ha expirado. Te hemos enviado un nuevo enlace de validación a tu email.",
  "email_validado": false,
  "token_expirado": true,
  "nuevo_enlace_enviado": true
}
```

**Errores:**
- `401` - Token inválido
- `404` - Cliente no encontrado

---

### 2. `POST /api/clientes/auth/resend-validation-link`

**Descripción:** Reenvía el enlace de validación manualmente

**Headers:**
```
Content-Type: application/json
X-Tenant-Domain: lokeyokiera
```

**Body:**
```json
{
  "email": "usuario@example.com"
}
```

**Response (exitoso):**
```json
{
  "message": "Nuevo enlace de validación enviado a tu email. Revisa tu bandeja de entrada.",
  "enlace_enviado": true
}
```

**Errores:**
- `404` - Cliente no encontrado
- `400` - Email ya validado
- `400` - No se pudo enviar el email

---

### 3. `POST /api/clientes/auth/verify-code` (Actualizado)

**Descripción:** Verifica el código OTP y devuelve token de acceso (SOLO si email está validado)

**Body:**
```json
{
  "email": "usuario@example.com",
  "codigo": "123456"
}
```

**Response (exitoso - email validado):**
```json
{
  "access_token": "base64_token",
  "cliente": { ... },
  "email_validado": true
}
```

**Errores:**
- `401` - Código inválido o expirado
- `401` - **Email no validado** (NUEVO)
- `404` - Cliente no encontrado

**Error específico (email no validado):**
```json
{
  "statusCode": 401,
  "message": "Debes validar tu email antes de poder acceder. Revisa tu bandeja de entrada y haz clic en el enlace de validación.",
  "error": "Unauthorized"
}
```

---

## Casos de Uso

### Caso 1: Usuario Nuevo que Sigue el Flujo Normal

**Escenario:** Usuario se registra y valida su email inmediatamente

1. Registro → Email enviado ✅
2. Click en enlace → Email validado ✅
3. Login → Acceso permitido ✅

**Resultado:** ✅ Usuario puede usar la app normalmente

---

### Caso 2: Usuario que Ignora el Email de Validación

**Escenario:** Usuario se registra pero cierra el navegador sin validar

1. Registro → Email enviado
2. **Usuario NO hace click en enlace**
3. Al día siguiente, intenta hacer login
4. Recibe código OTP
5. Ingresa código
6. **Login bloqueado con mensaje claro**
7. Va a su email
8. Click en enlace (puede estar expirado)
9. Si expiró → Recibe nuevo email automáticamente
10. Click en nuevo enlace
11. Email validado ✅
12. Login exitoso ✅

**Resultado:** ✅ Usuario eventualmente valida y accede

---

### Caso 3: Email de Validación va a Spam

**Escenario:** Email llega a spam, usuario no lo encuentra

**Opción A - Usuario encuentra el email:**
1. Usuario revisa spam
2. Encuentra email (puede estar expirado)
3. Click en enlace
4. Si expiró → Nuevo email enviado automáticamente ✅

**Opción B - Usuario contacta soporte:**
1. Soporte o usuario llama endpoint `resend-validation-link`
2. Nuevo email enviado
3. Usuario lo busca en bandeja principal y spam
4. Click en enlace ✅

**Resultado:** ✅ Usuario puede solicitar nuevo enlace

---

### Caso 4: Usuario Pierde el Email

**Escenario:** Email se borró accidentalmente

1. Usuario intenta login
2. Login bloqueado: "Debes validar tu email"
3. Usuario no encuentra el email
4. Opción 1: Espera a que el enlace expire y hace login para recibir el mensaje
5. Opción 2: Llama al endpoint `resend-validation-link` directamente
6. Nuevo email enviado ✅

**Resultado:** ✅ Usuario puede obtener nuevo enlace

---

## Testing

### Test Manual 1: Login Bloqueado sin Email Validado

**Pasos:**
1. Registra un nuevo usuario
2. **NO hagas click en el enlace de validación**
3. Ve a `/login`
4. Ingresa email y recibe código OTP
5. Ingresa código OTP
6. Click "Iniciar sesión"

**Resultado esperado:**
- ❌ Login rechazado
- Error 401: "Debes validar tu email antes de poder acceder..."
- Frontend muestra toast rojo con el mensaje

**Logs esperados:**
```
🔐 [VERIFY LOGIN CODE]
  - Email: usuario@example.com
  - Código: 123456
  ⚠️  Email NO validado para: usuario@example.com
```

---

### Test Manual 2: Regeneración Automática de Enlace Expirado

**Preparación:**
```sql
-- En Supabase SQL Editor, forzar expiración del token
UPDATE clientes
SET codigo_validacion_expires_at = NOW() - INTERVAL '1 hour'
WHERE email = 'tu@email.com';
```

**Pasos:**
1. Copia el enlace de validación de tu email
2. Haz click en el enlace
3. → /validar-email?token=xxx

**Resultado esperado:**
- ⏰ Frontend muestra: "Enlace expirado"
- ✉️ Mensaje: "Te hemos enviado un nuevo enlace"
- Box azul con instrucciones
- ✅ Recibes nuevo email: "🔄 Nuevo Enlace de Validación"

**Logs esperados:**
```
⏰ Token expirado para: tu@email.com
  - Generando nuevo enlace automáticamente...
📧 Nuevo enlace enviado: ✅
```

---

### Test Manual 3: Reenviar Enlace Manualmente

**Pasos:**
```bash
curl -X POST http://localhost:3001/api/clientes/auth/resend-validation-link \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -d '{
    "email": "tu@email.com"
  }'
```

**Resultado esperado:**
```json
{
  "message": "Nuevo enlace de validación enviado a tu email. Revisa tu bandeja de entrada.",
  "enlace_enviado": true
}
```

**Verificar:**
- ✅ Recibes email: "Confirma tu email - [Tienda]"
- ✅ Enlace es válido por 24 horas
- ✅ Click en enlace valida el email

**Logs esperados:**
```
🔄 [REENVIAR ENLACE DE VALIDACIÓN]
  - Email: tu@email.com
📧 Resultado del envío: ✅
```

---

### Test Manual 4: Email Ya Validado (Error Esperado)

**Pasos:**
1. Valida tu email normalmente
2. Intenta reenviar enlace:
```bash
curl -X POST http://localhost:3001/api/clientes/auth/resend-validation-link \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -d '{
    "email": "tu@email.com"
  }'
```

**Resultado esperado:**
```json
{
  "statusCode": 400,
  "message": "Tu email ya está validado. Puedes iniciar sesión normalmente.",
  "error": "Bad Request"
}
```

---

### Test Automatizado (Ejemplo para Jest)

```typescript
describe('Email Validation System', () => {
  it('should block login if email not validated', async () => {
    // 1. Register user
    const registerResponse = await request(app)
      .post('/api/clientes/auth/register')
      .set('X-Tenant-Domain', 'test')
      .send({ nombre: 'Test', email: 'test@example.com', telefono: '612345678' });

    expect(registerResponse.status).toBe(201);

    // 2. Get OTP code
    const otpCode = await getOTPFromDatabase('test@example.com');

    // 3. Try to login WITHOUT validating email
    const loginResponse = await request(app)
      .post('/api/clientes/auth/verify-code')
      .set('X-Tenant-Domain', 'test')
      .send({ email: 'test@example.com', codigo: otpCode });

    // 4. Expect 401 with specific message
    expect(loginResponse.status).toBe(401);
    expect(loginResponse.body.message).toContain('Debes validar tu email');
  });

  it('should regenerate link when expired', async () => {
    // 1. Create user with expired token
    const cliente = await createClienteWithExpiredToken();

    // 2. Try to validate with expired token
    const response = await request(app)
      .get(`/api/clientes/auth/validate-email/${cliente.codigo_validacion}`)
      .set('X-Tenant-Domain', 'test');

    // 3. Expect token_expirado response
    expect(response.body.token_expirado).toBe(true);
    expect(response.body.nuevo_enlace_enviado).toBe(true);

    // 4. Verify new email was sent
    const emails = await getEmailsSent();
    const newEmail = emails.find(e => e.to === cliente.email && e.subject.includes('Nuevo enlace'));
    expect(newEmail).toBeDefined();
  });
});
```

---

## Troubleshooting

### Problema 1: "Email ya está validado" pero usuario no puede entrar

**Síntoma:**
```
Tu email ya está validado. Puedes iniciar sesión normalmente.
```

**Pero al hacer login:**
```
Debes validar tu email antes de poder acceder
```

**Causa:** Inconsistencia en BD - campo `email_validado` tiene valor `NULL` en lugar de `false`

**Solución:**
```sql
-- Verificar estado del campo
SELECT id, email, email_validado FROM clientes WHERE email = 'usuario@example.com';

-- Si es NULL, actualizarlo a true (asumiendo que el usuario ya validó)
UPDATE clientes
SET email_validado = true
WHERE email = 'usuario@example.com' AND email_validado IS NULL;
```

---

### Problema 2: Login bloqueado pero NO recibo email de validación

**Síntoma:** Mensaje "Debes validar tu email" pero no llega email

**Diagnóstico:**
1. Verificar logs del backend:
```
📧 [VALIDACIÓN EMAIL]
  - Destinatario: usuario@example.com
📬 Resultado del envío: { "success": false, ... }
```

2. Si `success: false`, revisar:
   - `RESEND_API_KEY` en `.env`
   - Email remitente verificado en Resend Dashboard
   - Límite de emails no alcanzado (100/día en plan gratuito)

**Solución:**
```bash
# Reenviar enlace manualmente
curl -X POST http://localhost:3001/api/clientes/auth/resend-validation-link \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: tu_tienda" \
  -d '{ "email": "usuario@example.com" }'
```

---

### Problema 3: Enlace expirado NO regenera automáticamente

**Síntoma:** Al hacer click en enlace expirado, solo muestra error sin enviar nuevo email

**Diagnóstico:**
1. Verificar logs del backend:
```
⏰ Token expirado para: usuario@example.com
  - Generando nuevo enlace automáticamente...
📧 Nuevo enlace enviado: ❌
```

2. Si `❌`, el envío de email falló

**Solución:**
1. Verificar configuración de Resend
2. Intentar reenvío manual
3. Verificar que `emailService` está correctamente inyectado

---

### Problema 4: Frontend no muestra estado "Expirado" correctamente

**Síntoma:** Frontend muestra "Error de validación" en lugar de "Enlace expirado"

**Causa:** Frontend no está detectando `data.token_expirado`

**Diagnóstico:**
1. Inspeccionar Network tab del navegador
2. Verificar response del endpoint:
```json
{
  "token_expirado": true,
  "nuevo_enlace_enviado": true,
  "message": "El enlace ha expirado..."
}
```

3. Si NO tiene `token_expirado`, el backend no está retornando correctamente

**Solución:**
1. Verificar código del backend en línea 992-1112 de `clientes.service.ts`
2. Reiniciar backend para cargar nuevo código
3. Probar de nuevo

---

### Problema 5: Usuario validó email pero `email_validado` sigue en `false`

**Síntoma:** Usuario hace click en enlace, ve "✅ Email validado", pero al intentar login sigue bloqueado

**Causa:** Actualización en BD falló

**Diagnóstico:**
```sql
SELECT id, email, email_validado, codigo_validacion
FROM clientes
WHERE email = 'usuario@example.com';
```

Si `email_validado = false` y `codigo_validacion IS NULL` → Update falló parcialmente

**Solución temporal:**
```sql
UPDATE clientes
SET email_validado = true
WHERE email = 'usuario@example.com';
```

**Solución permanente:**
Verificar permisos de la tabla `clientes` en Supabase

---

## Resumen de Archivos Modificados

### Backend

1. **`backend/src/clientes/clientes.service.ts`**
   - Línea 559-642: `verifyLoginCode()` - Bloquea si email no validado
   - Línea 970-1150: `validateEmailLink()` - Regenera enlace si expiró
   - Línea 1152-1296: `resendValidationLink()` - Nuevo método para reenviar

2. **`backend/src/clientes/clientes.controller.ts`**
   - Línea 209-214: Actualizado tipo de retorno de `validateEmailLink`
   - Línea 216-245: Nuevo endpoint `POST /auth/resend-validation-link`

### Frontend

1. **`frontend/app/validar-email/page.tsx`**
   - Línea 12-15: Nuevos estados (expirado, tokenExpirado, nuevoEnlaceEnviado)
   - Línea 43-50: Detecta `token_expirado` en response
   - Línea 84-86: Nuevo estado visual "⏰ Enlace expirado"
   - Línea 115-132: Box azul con instrucciones para email nuevo

---

## Métricas y Monitoreo

### Logs Importantes a Monitorear

**Login bloqueado (esperado):**
```
⚠️ Email NO validado para: usuario@example.com
```

**Regeneración automática (esperado):**
```
⏰ Token expirado para: usuario@example.com
  - Generando nuevo enlace automáticamente...
📧 Nuevo enlace enviado: ✅
```

**Reenvío manual (esperado):**
```
🔄 [REENVIAR ENLACE DE VALIDACIÓN]
  - Email: usuario@example.com
📧 Resultado del envío: ✅
```

### Alertas Recomendadas

1. **Tasa alta de "Email NO validado"**
   - Indica que muchos usuarios no están validando
   - Revisar si emails llegan correctamente
   - Considerar mejorar copy del email

2. **Tasa alta de "Token expirado"**
   - Usuarios esperan >24h para validar
   - Considerar aumentar tiempo de expiración a 48h

3. **Tasa alta de "Reenviar enlace"**
   - Emails no están llegando
   - Revisar deliverability de Resend
   - Considerar verificar dominio propio

---

## Próximas Mejoras Opcionales

### 1. Botón "Reenviar Enlace" en Login

Cuando login es bloqueado, mostrar botón:
```
❌ Debes validar tu email

[Botón: Reenviar enlace de validación]
```

### 2. Validación Automática en Registro

Validar email inmediatamente en el flujo de registro:
```
Registro → Email validado → Auto-login → Perfil
```

### 3. Email con Código en lugar de Enlace

Para usuarios móviles, ofrecer opción de código de 6 dígitos:
```
Tu código de validación: 123456
```

### 4. Recordatorio si Email no Validado

Enviar email recordatorio después de 24h:
```
Asunto: Recuerda validar tu email en [Tienda]
```

---

## 🎉 Conclusión

Este sistema asegura que:

✅ **Seguridad:** Solo usuarios con email verificado pueden acceder
✅ **UX:** Mensajes claros y ayuda automática cuando enlaces expiran
✅ **Confiabilidad:** Múltiples formas de obtener un nuevo enlace
✅ **Escalabilidad:** Sistema robusto que maneja todos los edge cases

**Todos los flujos de usuario llevan al éxito final: Email validado y acceso permitido.**
