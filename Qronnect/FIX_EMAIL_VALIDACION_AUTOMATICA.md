# 📧 FIX: Emails de Validación No Llegaban en Registro

## Problema Identificado

Cuando un usuario se registraba desde la página `/get-qr`, no recibía el email de validación con el código OTP de 6 dígitos.

**Causa raíz:** El endpoint `/api/clientes/auth/register` registraba al usuario y lo logueaba automáticamente, pero **nunca enviaba el código de validación de email**.

---

## Solución Implementada

### Backend: Auto-envío de código de validación

Modificado `backend/src/clientes/clientes.service.ts` para que automáticamente envíe el código de validación después de crear el cliente.

**Cambios en el método `registerCliente()`:**

```typescript
// ✅ DESPUÉS (líneas 213-221)
console.log('  - Cliente creado:', newCliente.id);

// Enviar código de validación de email automáticamente
try {
  console.log('  - Enviando código de validación de email...');
  await this.sendValidationCode(tenantId, { email: registerDto.email });
  console.log('  - Código de validación enviado exitosamente');
} catch (emailError) {
  console.error('  - Error enviando código de validación:', emailError);
  // No fallar el registro si el email falla, solo loguearlo
}

// El QR del cliente es su ID
const qr_code = newCliente.id;
```

**Ventajas de esta solución:**
- ✅ No requiere cambios en el flujo del frontend
- ✅ Envío automático tras cada registro
- ✅ No falla el registro si el email tiene problemas (solo loguea el error)
- ✅ Compatible con el auto-login existente

### Frontend: Mensaje informativo

Modificado `frontend/components/registro-form.tsx` para informar al usuario que debe revisar su email.

**Cambios en el método `onSubmit()` (líneas 93-96):**

```typescript
toast({
  title: "¡Cuenta creada!",
  description: "Hemos enviado un código de verificación a tu email. Por favor, revisa tu bandeja de entrada.",
})

// Redirigir directamente al perfil (auto-login)
// El usuario podrá usar la app pero verá un aviso para validar su email
router.push(`/mi-perfil`)
```

---

## Flujo Completo Ahora

```
┌──────────────────────────┐
│ Usuario completa         │
│ formulario de registro   │
│ en /get-qr               │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ POST /api/clientes/      │
│      auth/register       │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Backend crea cliente     │
│ en base de datos         │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Backend AUTOMÁTICAMENTE  │
│ llama a sendValidation   │
│ Code(email)              │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Se genera código de      │
│ 6 dígitos y se envía     │
│ email via Resend         │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Frontend muestra toast:  │
│ "Hemos enviado código    │
│  de verificación..."     │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Auto-login y redirect    │
│ a /mi-perfil             │
└──────────────────────────┘
             │
             ▼
┌──────────────────────────┐
│ Usuario recibe email     │
│ con código de validación │
└──────────────────────────┘
```

---

## Archivos Modificados

### Backend
- ✅ `backend/src/clientes/clientes.service.ts` (líneas 213-221)
  - Añadido try-catch para enviar código de validación automáticamente
  - Reutiliza método `sendValidationCode()` existente

### Frontend
- ✅ `frontend/components/registro-form.tsx` (líneas 93-96)
  - Actualizado mensaje del toast para mencionar el email de verificación

---

## Testing

### 1. **Desarrollo Local**

```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

**Pasos de prueba:**
1. Ir a: http://lokeyokiera.localhost:3000/get-qr
2. Completar formulario de registro con email real
3. Click "Enviar"
4. Verificar:
   - ✅ Toast muestra: "Hemos enviado un código de verificación a tu email..."
   - ✅ Redirige a `/mi-perfil`
   - ✅ Revisar email (bandeja de entrada o spam)
   - ✅ Verificar logs del backend muestran: "Código de validación enviado exitosamente"

**Logs esperados en backend:**
```
📝 [REGISTER CLIENTE]
  - Email: test@example.com
  - Tenant ID: 11bf2433-4232-4c58-a446-a805e1b78f9b
  - Cliente creado: 4308856f-9799-4a01-8fd6-1a3c6b5966e5
  - Enviando código de validación de email...
  - Código de validación enviado exitosamente
  - Token generado para auto-login
```

### 2. **Producción (Render + Vercel)**

**Pre-requisitos:**
1. Aplicar migración de base de datos (ver FEATURE_VALIDACION_EMAIL_CLIENTES.md)
2. Configurar variables de entorno en Render:
   ```
   RESEND_API_KEY=re_[tu-api-key]
   RESEND_FROM_EMAIL=noreply@qronnect.es
   NODE_ENV=production
   ```

**Pasos de prueba:**
1. Ir a: https://lokeyokiera.qronnect.es/get-qr
2. Registrarse con email real
3. Verificar email recibido
4. Revisar logs en Render Dashboard

---

## Configuración Necesaria

### 1. **Migración de Base de Datos**

Primero debes aplicar la migración para agregar los campos de validación:

```bash
cd backend
npx ts-node apply-email-validation-migration.ts
```

**O manualmente en Supabase Dashboard:**
1. SQL Editor → New Query
2. Copiar contenido de: `backend/supabase/migrations/20251120000001_add_email_validation_to_clientes.sql`
3. Run

### 2. **Variables de Entorno en Render**

Añadir/Verificar en Render Dashboard:

```bash
RESEND_API_KEY=re_[tu-api-key-real]
RESEND_FROM_EMAIL=noreply@qronnect.es
RESEND_WILDCARD_ENABLED=false
NODE_ENV=production
```

### 3. **Verificar Dominio en Resend**

1. Ir a: https://resend.com/domains
2. Verificar que `qronnect.es` está verificado
3. Si no está verificado, añadir registros DNS:
   - SPF
   - DKIM
   - DMARC

---

## Estructura del Email de Validación

El email que recibe el usuario contiene:

**Asunto:** `Verifica tu email - [Nombre de la Tienda]`

**Contenido:**
```
Hola [Nombre del Cliente],

Gracias por registrarte en [Nombre de la Tienda].

Tu código de verificación es:

[CÓDIGO DE 6 DÍGITOS]

Este código expira en 10 minutos.

Si no solicitaste este código, puedes ignorar este email.

---
[Nombre de la Tienda]
```

---

## Verificación de Código (Uso Futuro)

Aunque el email se envía automáticamente, **la validación del código NO es obligatoria actualmente**.

El usuario puede:
- ✅ Usar la app inmediatamente después del registro
- ✅ Validar su email más tarde (opcional)

**Para hacer la validación obligatoria:**

1. Modificar `ClientAuthGuard` en `backend/src/auth/guards/client-auth.guard.ts`
2. Verificar `email_validado = true` antes de permitir acceso
3. Redirigir a pantalla de validación si `email_validado = false`

**Ejemplo de guard con validación obligatoria:**
```typescript
// En client-auth.guard.ts
const { data: cliente } = await this.supabase.getAdminClient()
  .from('clientes')
  .select('email_validado')
  .eq('id', payload.sub)
  .single();

if (!cliente.email_validado) {
  throw new UnauthorizedException('Debes validar tu email para continuar');
}
```

---

## Troubleshooting

### ❌ Email no llega

**Posibles causas:**

1. **Resend API Key incorrecta**
   - Verificar en Render: Environment → RESEND_API_KEY
   - Debe empezar con `re_`

2. **Dominio no verificado en Resend**
   - Ir a: https://resend.com/domains
   - Verificar DNS records (SPF, DKIM, DMARC)

3. **Email bloqueado por spam**
   - Revisar carpeta de spam
   - Añadir `noreply@qronnect.es` a contactos

4. **Error en logs de Render**
   - Render Dashboard → tu servicio → Logs
   - Buscar: "Error enviando código de validación"

### ❌ Código expira muy rápido

El código tiene una validez de **10 minutos**.

**Para cambiar la duración:**
```typescript
// En clientes.service.ts, método sendValidationCode
const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos
// Cambiar a 30 minutos:
const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
```

### ❌ "Error enviando código de validación" en logs

Verificar en logs completos:
```bash
# Ver logs de Render en tiempo real
render logs -t backend-service-name --follow
```

Posibles errores:
- `RESEND_API_KEY is not defined` → Variable no configurada en Render
- `Invalid API key` → API key incorrecta
- `Domain not verified` → Verificar dominio en Resend

---

## Deployment

```bash
# 1. Stage changes
git add backend/src/clientes/clientes.service.ts
git add frontend/components/registro-form.tsx
git add FIX_EMAIL_VALIDACION_AUTOMATICA.md

# 2. Commit
git commit -m "fix: Envío automático de email de validación en registro

- Backend envía código OTP automáticamente tras crear cliente
- Frontend muestra mensaje informativo sobre verificación de email
- No falla el registro si email tiene problemas (solo loguea)
- Compatible con auto-login existente

Fixes: Usuario no recibía email de validación al registrarse desde /get-qr

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Push
git push origin main
```

Render y Vercel re-desplegarán automáticamente (2-5 min).

---

## Próximos Pasos (Opcional)

### 1. **Hacer validación obligatoria**
- Modificar `ClientAuthGuard` para verificar `email_validado`
- Crear pantalla de validación de código
- Bloquear acceso hasta que se valide

### 2. **Reenvío de código**
- Añadir botón "Reenviar código" en perfil
- Limitar reenvíos (ej: 1 cada 2 minutos)

### 3. **Recordatorios**
- Email recordatorio si no valida en 24h
- Banner en app: "Valida tu email para acceder a todas las funciones"

---

## Resumen

✅ **Problema resuelto:** Emails de validación ahora se envían automáticamente al registrarse

✅ **Backend:** Método `registerCliente()` llama a `sendValidationCode()` automáticamente

✅ **Frontend:** Usuario ve mensaje sobre verificación de email

✅ **No breaking changes:** Compatible con flujo existente de auto-login

✅ **Robusto:** No falla el registro si email tiene problemas

⚠️ **Pendiente:** Aplicar migración de base de datos en producción

⚠️ **Pendiente:** Configurar variables de Resend en Render

---

**Fecha:** 20 de Noviembre de 2025
