# 🧪 Guía de Testing de Emails en Local

## Paso 1: Configurar Variables de Entorno

### Backend `.env`

Verifica que tu archivo `backend/.env` tenga:

```bash
# Email
RESEND_API_KEY=re_tu_api_key_real
RESEND_FROM_EMAIL=onboarding@resend.dev  # o tu email verificado

# Entorno
NODE_ENV=development

# URLs
FRONTEND_PORT=3000
BASE_DOMAIN=qronnect.es

# Supabase
SUPABASE_URL=tu_url
SUPABASE_SERVICE_ROLE_KEY=tu_key
```

### Frontend `.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Paso 2: Iniciar Backend

```bash
cd backend
npm run start:dev
```

### ✅ Logs que DEBES ver al iniciar:

```
[EmailService] ✅ Resend email service initialized
[NestApplication] Nest application successfully started
```

### ❌ Si ves esto:

```
[EmailService] ⚠️  RESEND_API_KEY not configured. Email sending will be disabled.
```

**Solución**: Verifica que `RESEND_API_KEY` esté en tu `.env`

---

## Paso 3: Iniciar Frontend

```bash
cd frontend
npm run dev
```

---

## Paso 4: Probar Registro con Email

1. **Abre**: `http://localhost:3000/registro` o `http://tienda.localhost:3000/registro`

2. **Completa el formulario** con un email REAL (el tuyo para testing)

3. **Haz click en** "🎉 Activar mis ventajas"

4. **Observa los logs del backend**. Deberías ver:

```
📝 [REGISTER CLIENTE]
  - Email: tu@email.com
  - Tenant ID: xxx
  - Código referido: ninguno
  - Cliente creado: xxx
  - Enviando código de validación de email...

📧 [VALIDACIÓN EMAIL]
  - Destinatario: tu@email.com
  - Token generado: abc123def4...
  - URL de validación: http://tienda.localhost:3000/validar-email?token=abc123...
  - Nombre tienda: Mi Tienda

[EmailService] Sending email to: "tu@email.com"

📬 Resultado del envío: {
  "success": true,
  "messageId": "re_abc123..."
}

✅ Enlace de validación enviado a: tu@email.com
  - Message ID: re_abc123...

  - Código de validación enviado exitosamente
  - Token generado para auto-login
```

---

## Paso 5: Diagnóstico de Problemas

### Problema 1: "RESEND_API_KEY not configured"

**Causa**: La variable no está en `.env`

**Solución**:
1. Copia tu API key de https://resend.com/api-keys
2. Agrégala a `backend/.env`:
   ```
   RESEND_API_KEY=re_tu_key_aqui
   ```
3. Reinicia el backend

---

### Problema 2: Email NO se envía (success: false)

**Logs que verás**:
```
❌ Error al enviar email de validación: [mensaje de error]
```

**Posibles causas**:

#### A) Email remitente no verificado

Error: `"from" email address not verified`

**Solución**:
1. Ve a https://resend.com/domains
2. Verifica tu dominio O usa `onboarding@resend.dev` para testing

#### B) API Key inválida

Error: `Invalid API key`

**Solución**:
1. Verifica que la key empiece con `re_`
2. Crea una nueva en https://resend.com/api-keys

#### C) Límite de emails alcanzado

Error: `You have reached your sending limit`

**Solución**:
- Plan gratuito: 100 emails/día
- Espera 24h o upgrade tu plan

---

### Problema 3: Email se envía pero NO llega

**Logs que verás**:
```
✅ Enlace de validación enviado a: tu@email.com
  - Message ID: re_abc123...
```

**Pero NO recibes el email**

**Solución**:
1. **Revisa spam/promociones** en tu bandeja
2. **Verifica en Resend Dashboard**: https://resend.com/emails
   - Busca el `Message ID` en los logs
   - Ve el estado del email
   - Si dice "Delivered" → revisa spam
   - Si dice "Bounced" → email inválido
   - Si dice "Complained" → email marcado como spam antes

---

## Paso 6: Verificar Email Recibido

Si todo va bien, deberías recibir un email con:

**Asunto**: `Confirma tu email - [Nombre Tienda]`

**Contenido**:
- Saludo personalizado
- Botón grande azul: **"Confirmar mi email"**
- Enlace alternativo por si el botón no funciona
- Mensaje: "Este enlace expira en 24 horas"

---

## Paso 7: Probar Validación del Enlace

1. **Click en el botón** del email

2. Deberías ser redirigido a:
   ```
   http://tienda.localhost:3000/validar-email?token=abc123...
   ```

3. La página mostrará:
   - Spinner "Validando tu email..."
   - ✅ "¡Email validado!"
   - Redirige automáticamente a `/mi-perfil`

4. **Logs del backend**:
   ```
   ✅ Email validado exitosamente para: tu@email.com
   ```

---

## Debugging Avanzado

### Ver Detalles Completos del Email

En desarrollo, el response incluye el enlace completo:

```json
{
  "message": "Enlace de validación enviado al email",
  "codigo_enviado": "http://tienda.localhost:3000/validar-email?token=abc123..."
}
```

Copia ese enlace y ábrelo directamente en el navegador para testing.

---

### Probar con cURL

```bash
# 1. Registrar cliente
curl -X POST http://localhost:3001/api/clientes/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -d '{
    "nombre": "Test User",
    "email": "tu@email.com",
    "telefono": "612345678"
  }'

# Observa la respuesta y los logs del backend
```

---

### Logs Completos de Email

Si necesitas ver TODO el proceso:

```bash
# En el backend, busca estos logs en orden:

1. [EmailService] ✅ Resend email service initialized
2. 📝 [REGISTER CLIENTE]
3. 📧 [VALIDACIÓN EMAIL]
4. [EmailService] Sending email to: "..."
5. 📬 Resultado del envío: { success: true, ... }
6. ✅ Enlace de validación enviado a: ...
```

**Si falta alguno de estos logs**, ahí está el problema.

---

## Checklist de Verificación

- [ ] `RESEND_API_KEY` está en `backend/.env`
- [ ] Backend muestra: `✅ Resend email service initialized`
- [ ] Frontend está corriendo en `localhost:3000`
- [ ] Backend está corriendo en `localhost:3001`
- [ ] Al registrarse, ves logs de `📧 [VALIDACIÓN EMAIL]`
- [ ] Ves `success: true` en el resultado
- [ ] Revisaste spam/promociones
- [ ] Verificaste en Resend Dashboard

---

## Resultado Esperado

Si todo funciona correctamente:

1. ✅ Te registras
2. ✅ Ves toast: "🎉 ¡Bienvenido al club!"
3. ✅ Ves en logs: "✅ Enlace de validación enviado"
4. ✅ Recibes email (puede tardar 1-2 minutos)
5. ✅ Haces click en el enlace
6. ✅ Email se valida automáticamente
7. ✅ Entras a tu perfil

---

## Si Sigue Sin Funcionar

Comparte estos logs:

1. **Logs del backend** (toda la sección desde `📝 [REGISTER CLIENTE]` hasta el final)
2. **Screenshot del Resend Dashboard** mostrando el estado del email
3. **Variables de entorno** (sin mostrar las keys completas):
   ```
   RESEND_API_KEY=re_***
   NODE_ENV=development
   ```

Con esa información podré diagnosticar exactamente qué está fallando. 🔍
