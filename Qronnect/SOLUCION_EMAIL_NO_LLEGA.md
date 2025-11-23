# 🔧 Solución: Email de validación no llega

## ✅ Diagnóstico Realizado

### 1. Resend está funcionando correctamente
- API Key configurada y válida
- Dominio `qronnect.es` **VERIFICADO** ✅
- Test de envío directo: **EXITOSO** ✅

### 2. El código de envío es correcto
- El servicio `EmailService` funciona
- Los logs están implementados
- El HTML del email es válido

## 🔍 Posibles Causas

### Causa #1: El email está llegando a SPAM
**Solución**: Revisa la carpeta de SPAM/correo no deseado

### Causa #2: Email inválido o con typo
**Solución**: Verifica que el email registrado sea correcto

### Causa #3: El backend no se está ejecutando durante el registro
**Solución**: Asegúrate de que el backend esté corriendo cuando te registras

### Causa #4: Error silencioso en el try-catch
El código tiene:
```typescript
} catch (emailError) {
  console.error('💥 Error enviando enlace de validación:', emailError);
  // No fallar el registro si el email falla, solo loguearlo
}
```

Esto significa que si hay un error, el registro continuará pero el email no se enviará.

## 🎯 SOLUCIÓN RÁPIDA

### Paso 1: Verificar que el backend está corriendo

```bash
cd backend
npm run start:dev
```

Deberías ver:
```
[Nest] INFO [NestApplication] Nest application successfully started
```

### Paso 2: Registrar un usuario y observar los logs

Cuando te registres, deberías ver en la consola del backend:

```
📧 [REGISTRO]
  - Email: tu@email.com
  - Nombre: Tu Nombre
  - Tenant ID: xxxxx

📧 [VALIDACIÓN EMAIL - REGISTRO]
  - Cliente ID: xxxxx
  - Destinatario: tu@email.com
  - Token generado: xxxxx
  - Token expira en: 2025-11-...

✅ Token guardado en base de datos
  - URL de validación: http://...
  - Nombre tienda: ...

📬 Resultado del envío: {
  "success": true,
  "messageId": "xxxxx"
}

✅ Enlace de validación enviado a: tu@email.com
  - Message ID: xxxxx
```

### Paso 3: Si NO ves estos logs

Significa que el backend no está ejecutándose o hay un error antes de llegar al email.

### Paso 4: Si ves "success": false

Mira el error específico:
```json
{
  "success": false,
  "error": "mensaje de error aquí"
}
```

## 🧪 PRUEBA MANUAL

### Opción A: Registrarte desde el frontend

1. Abre `http://localhost:3000/get-qr` (o el puerto que uses)
2. Completa el formulario de registro
3. **MANTÉN LA CONSOLA DEL BACKEND VISIBLE**
4. Haz clic en "Activar mis ventajas"
5. Observa los logs del backend

### Opción B: Probar con cURL directamente

```bash
curl -X POST http://localhost:3001/api/clientes/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -d '{
    "nombre": "Test Usuario",
    "email": "tu_email_real@gmail.com",
    "telefono": "612345678"
  }'
```

**IMPORTANTE**: Cambia `tu_email_real@gmail.com` por tu email real.

## 🔧 FIX TEMPORAL: Usar dominio de onboarding

Si quieres que funcione YA mientras investigas, cambia temporalmente el remitente:

**Archivo**: `backend/src/clientes/clientes.service.ts` (línea ~302)

```typescript
// TEMPORAL: Usar dominio de onboarding de Resend
const emailResult = await this.emailService.sendEmail({
  to: newCliente.email,
  subject: `Confirma tu email - ${nombreTienda}`,
  from: 'onboarding@resend.dev', // ⬅️ AGREGAR ESTA LÍNEA
  html: `...`
});
```

También en: `backend/src/email/email.service.ts` (línea ~40)

```typescript
const from = params.from || 'onboarding@resend.dev'; // ⬅️ CAMBIAR ESTE DEFAULT
```

## 📝 CHECKLIST DE VERIFICACIÓN

- [ ] Backend está corriendo (`npm run start:dev`)
- [ ] Frontend está corriendo (`npm run dev`)
- [ ] Puedes acceder a `http://localhost:3000/get-qr`
- [ ] Al registrarte, ves logs en la consola del backend
- [ ] Los logs muestran "✅ Enlace de validación enviado"
- [ ] Has revisado la carpeta de SPAM
- [ ] El email que usaste es válido y accesible
- [ ] Has esperado al menos 2-3 minutos

## 🎓 SIGUIENTE PASO

**Ejecuta esto y pégame la salida completa**:

```bash
# 1. Asegúrate de que el backend esté corriendo
cd backend
npm run start:dev

# 2. En otra terminal, registra un usuario con cURL
curl -X POST http://localhost:3001/api/clientes/auth/register \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Domain: lokeyokiera" \
  -d '{
    "nombre": "Test Debug",
    "email": "TU_EMAIL_REAL@gmail.com",
    "telefono": "612345678"
  }'
```

Y envíame:
1. La respuesta del cURL
2. Los logs completos que aparecen en la consola del backend
3. Si el email llegó o no (y si está en SPAM)

Con esa información podré ver exactamente dónde está el problema.
