# ✉️ FEATURE: Validación de Email para Clientes

## 📋 Resumen

Sistema completo de validación de email para clientes de tienda mediante código OTP de 6 dígitos.

### Objetivo
Garantizar que solo clientes con emails válidos puedan acceder a la plataforma, mejorando la seguridad y calidad de la base de datos de clientes.

---

## 🎯 Funcionalidades Implementadas

### 1. **Sistema de Validación por Email**
- ✅ Código OTP de 6 dígitos
- ✅ Expiración en 10 minutos
- ✅ Email HTML personalizado con branding de la tienda
- ✅ Campo `email_validado` en base de datos
- ✅ Limpieza automática de códigos expirados

### 2. **Nuevos Endpoints API**

#### `POST /api/clientes/auth/send-validation-code`
Envía código de validación al email del cliente.

**Request:**
```json
{
  "email": "cliente@example.com"
}
```

**Response:**
```json
{
  "message": "Código de validación enviado al email",
  "codigo_enviado": "123456"  // Solo en desarrollo
}
```

#### `POST /api/clientes/auth/verify-validation-code`
Verifica el código y marca el email como validado.

**Request:**
```json
{
  "email": "cliente@example.com",
  "codigo": "123456"
}
```

**Response:**
```json
{
  "message": "Email validado exitosamente",
  "email_validado": true
}
```

### 3. **Cambios en Base de Datos**

**Nuevos campos en tabla `clientes`:**
- `email_validado` (BOOLEAN) - Indica si el email está verificado
- `codigo_validacion` (VARCHAR(6)) - Código temporal de validación
- `codigo_validacion_expires_at` (TIMESTAMPTZ) - Expiración del código
- `validacion_enviada_at` (TIMESTAMPTZ) - Fecha del último envío

**Índices añadidos:**
- `idx_clientes_codigo_validacion` - Búsqueda rápida de códigos
- `idx_clientes_email_validado` - Filtrado por estado de validación

---

## 📁 Archivos Modificados/Creados

### Backend

**Migraciones:**
- ✅ `backend/supabase/migrations/20251120000001_add_email_validation_to_clientes.sql`

**DTOs:**
- ✅ `backend/src/clientes/dto/send-validation-code.dto.ts`
- ✅ `backend/src/clientes/dto/verify-validation-code.dto.ts`

**Service:**
- ✅ `backend/src/clientes/clientes.service.ts`
  - `sendValidationCode()` - Envía código por email
  - `verifyValidationCode()` - Verifica y marca como validado
  - `requireEmailValidated()` - Guard helper para verificar validación

**Controller:**
- ✅ `backend/src/clientes/clientes.controller.ts`
  - Endpoint de envío de código
  - Endpoint de verificación

### Frontend (Pendiente)
- ⏳ Pantalla de verificación de email
- ⏳ Formulario de ingreso de código
- ⏳ Integración en flujo de registro

---

## 🚀 Deployment

### 1. Aplicar Migración en Supabase

**Opción A - Desde Supabase Dashboard:**
1. Ve a: https://app.supabase.com
2. Project Settings → Database → SQL Editor
3. Copia y pega el contenido de:
   ```
   backend/supabase/migrations/20251120000001_add_email_validation_to_clientes.sql
   ```
4. Run

**Opción B - Desde CLI:**
```bash
cd backend
supabase db push
```

### 2. Verificar Migración

```sql
-- Verificar que los campos existen
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes'
  AND column_name IN ('email_validado', 'codigo_validacion', 'codigo_validacion_expires_at');

-- Debería devolver 3 filas
```

### 3. Desplegar Backend

```bash
# 1. Commit changes
git add backend/src/clientes backend/supabase/migrations

git commit -m "feat: Sistema de validación de email para clientes

- Añadidos campos de validación en tabla clientes
- Endpoints de envío y verificación de código OTP
- Email personalizado con branding de tienda
- Códigos expiran en 10 minutos
- Limpieza automática de códigos expirados

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 2. Push
git push origin main
```

Render re-desplegará automáticamente (2-5 min).

---

## 🧪 Testing

### 1. **Testing Manual con curl**

**a) Registrar un cliente:**
```bash
curl -X POST http://localhost:3001/api/clientes/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -d '{
    "nombre": "Cliente Test",
    "email": "test@example.com",
    "telefono": "+34666123456"
  }'
```

**b) Solicitar código de validación:**
```bash
curl -X POST http://localhost:3001/api/clientes/auth/send-validation-code \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -d '{
    "email": "test@example.com"
  }'
```

En desarrollo, la respuesta incluirá el código:
```json
{
  "message": "Código de validación enviado al email",
  "codigo_enviado": "123456"
}
```

**c) Verificar código:**
```bash
curl -X POST http://localhost:3001/api/clientes/auth/verify-validation-code \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -d '{
    "email": "test@example.com",
    "codigo": "123456"
  }'
```

### 2. **Verificar en Base de Datos**

```sql
-- Ver estado de validación de un cliente
SELECT
  nombre,
  email,
  email_validado,
  codigo_validacion,
  codigo_validacion_expires_at,
  validacion_enviada_at
FROM clientes
WHERE email = 'test@example.com';
```

### 3. **Testing de Expiración**

```sql
-- Simular código expirado (cambiar fecha a pasado)
UPDATE clientes
SET codigo_validacion_expires_at = NOW() - INTERVAL '1 hour'
WHERE email = 'test@example.com';

-- Intentar verificar con código expirado
-- Debe devolver: "El código de validación ha expirado"
```

### 4. **Testing de Swagger**

1. Ve a: http://localhost:3001/api/docs
2. Busca la sección "Clientes"
3. Endpoints:
   - `POST /clientes/auth/send-validation-code`
   - `POST /clientes/auth/verify-validation-code`

---

## 🔒 Seguridad

### Medidas Implementadas

1. **Códigos de un solo uso**
   - El código se elimina después de usarse
   - No se puede reutilizar

2. **Expiración temporal**
   - Los códigos expiran en 10 minutos
   - Se limpian automáticamente

3. **Validación por tienda**
   - Multi-tenancy: cada tienda tiene sus propios clientes
   - Un cliente puede tener diferentes estados de validación en diferentes tiendas

4. **Rate limiting (Recomendado)**
   - ⚠️ Implementar límite de envíos por IP/email
   - Ejemplo: máximo 3 códigos por hora

5. **Email real requerido**
   - Se envía código al email proporcionado
   - Si el email no existe, no se recibe el código

---

## 🔄 Flujo Completo

```
┌─────────────────┐
│ 1. Cliente se   │
│    registra     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Sistema crea │
│    cliente con  │
│ email_validado  │
│    = FALSE      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. Cliente      │
│    solicita     │
│    código       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Sistema      │
│    genera       │
│    código y     │
│    envía email  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. Cliente      │
│    recibe email │
│    con código   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. Cliente      │
│    ingresa      │
│    código en    │
│    frontend     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 7. Sistema      │
│    verifica     │
│    código       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 8. email_       │
│    validado =   │
│    TRUE         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 9. Cliente      │
│    puede        │
│    acceder a    │
│    todos los    │
│    endpoints    │
└─────────────────┘
```

---

## 📧 Template de Email

El email enviado tiene este formato:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Validación de Email</h2>
  <p>Hola <strong>{{nombre}}</strong>,</p>
  <p>Tu código de validación para <strong>{{tienda}}</strong> es:</p>
  <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
    <h1 style="color: #667eea; margin: 0; font-size: 36px; letter-spacing: 5px;">
      {{codigo}}
    </h1>
  </div>
  <p>Este código expira en <strong>10 minutos</strong>.</p>
  <p style="color: #666; font-size: 14px; margin-top: 30px;">
    Si no solicitaste este código, puedes ignorar este email.
  </p>
</div>
```

---

## 🛠️ Configuración Opcional

### Limpieza Automática de Códigos Expirados

**Opción A - Cronjob en servidor:**
```bash
# Ejecutar cada hora
0 * * * * psql $DATABASE_URL -c "SELECT limpiar_codigos_validacion_expirados();"
```

**Opción B - Desde Supabase (pg_cron):**
```sql
-- Instalar pg_cron (si no está instalado)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programar limpieza cada hora
SELECT cron.schedule(
  'limpiar-codigos-validacion',
  '0 * * * *',  -- Cada hora
  $$ SELECT limpiar_codigos_validacion_expirados(); $$
);
```

---

## ⚠️ Clientes Existentes

Los clientes registrados ANTES de esta migración tendrán `email_validado = FALSE`.

**Opciones:**

1. **Marcar todos como validados (migración legacy):**
```sql
UPDATE clientes
SET email_validado = TRUE
WHERE email_validado = FALSE;
```

2. **Forzar re-validación:**
   - Los clientes existentes deberán validar su email la próxima vez que intenten acceder

3. **Validación gradual:**
   - Solo los endpoints críticos requieren validación
   - Los clientes pueden seguir usando funcionalidades básicas

---

## 🔜 Próximos Pasos (Frontend)

### 1. Pantalla de Validación

Crear componente `VerifyEmailScreen.tsx`:
```typescript
// Después del registro exitoso:
1. Mostrar mensaje: "Revisa tu email"
2. Input para código de 6 dígitos
3. Botón "Verificar"
4. Link "Reenviar código"
5. Countdown de expiración (10 min)
```

### 2. Integración en Registro

```typescript
// components/registro-form.tsx

const handleRegister = async () => {
  // 1. Registrar cliente
  const { cliente, access_token } = await registerCliente(data)

  // 2. Enviar código de validación automáticamente
  await sendValidationCode({ email: cliente.email })

  // 3. Redirigir a pantalla de verificación
  router.push(`/verify-email?email=${cliente.email}`)
}
```

### 3. Guard en Frontend

```typescript
// middleware.ts o guard personalizado

if (!cliente.email_validado) {
  redirect('/verify-email')
}
```

---

## 📊 Métricas y Monitoring

### KPIs a Monitorear

1. **Tasa de validación**
   ```sql
   SELECT
     COUNT(CASE WHEN email_validado THEN 1 END) * 100.0 / COUNT(*) as tasa_validacion
   FROM clientes;
   ```

2. **Tiempo promedio de validación**
   ```sql
   SELECT
     AVG(EXTRACT(EPOCH FROM (updated_at - validacion_enviada_at))) / 60 as minutos_promedio
   FROM clientes
   WHERE email_validado = TRUE;
   ```

3. **Códigos expirados sin validar**
   ```sql
   SELECT COUNT(*)
   FROM clientes
   WHERE codigo_validacion IS NOT NULL
     AND codigo_validacion_expires_at < NOW();
   ```

---

## 🐛 Troubleshooting

### Problema: "Cliente no encontrado"
**Causa:** El email no existe en la tienda actual.
**Solución:** Verificar que el cliente esté registrado primero.

### Problema: "Código inválido"
**Causa:** El código no coincide o ya fue usado.
**Solución:** Solicitar un nuevo código.

### Problema: "Código expirado"
**Causa:** Han pasado más de 10 minutos.
**Solución:** Solicitar un nuevo código.

### Problema: "Email no llega"
**Causa:** Configuración incorrecta de Resend o email en spam.
**Solución:**
1. Verificar logs del backend
2. Revisar carpeta de spam
3. Verificar configuración de Resend

---

## ✅ Checklist de Implementación

### Backend
- [x] Migración de base de datos
- [x] DTOs de validación
- [x] Lógica de envío de código
- [x] Lógica de verificación
- [x] Endpoints en controller
- [x] Documentación Swagger

### Frontend
- [ ] Pantalla de verificación
- [ ] Formulario de código
- [ ] Integración en registro
- [ ] Guard de validación
- [ ] Testing E2E

### Deployment
- [ ] Aplicar migración en Supabase producción
- [ ] Deploy backend a Render
- [ ] Deploy frontend a Vercel
- [ ] Testing en producción
- [ ] Monitoring de emails

---

**Estado:** Backend completo ✅ | Frontend pendiente ⏳

**¡El sistema de validación de email está listo para usar en el backend!** 🎉
