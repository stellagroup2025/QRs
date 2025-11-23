# 🚨 Email de Validación NO Llega en Producción

## 🔍 Diagnóstico Específico de Producción

Tu aplicación está desplegada en **Render.com**. Los emails no están llegando en producción, pero en desarrollo sí funcionan.

---

## ❗ CAUSAS PRINCIPALES EN PRODUCCIÓN

### 1. ⚠️ Variables de entorno mal configuradas en Render

**Problema**: Las variables de entorno en Render pueden estar:
- No configuradas
- Con valores incorrectos
- Con valores de template (placeholders)

**Cómo verificar**:

1. Ve a tu dashboard de Render: https://dashboard.render.com
2. Selecciona tu servicio `qronnect-backend`
3. Ve a **Environment** en el menú lateral
4. Verifica estas variables:

```bash
RESEND_API_KEY=re_9oPTkYsE_EnsXoPVzKkjPuYVxdRUJvCZT  # Debe estar configurada
RESEND_FROM_EMAIL=noreply@qronnect.es                # Debe estar configurada
NODE_ENV=production                                   # Debe ser "production"
BASE_DOMAIN=qronnect.es                              # Debe estar configurada
```

**✅ SOLUCIÓN**:
Si falta alguna variable o tiene un valor placeholder, agrégala/corrígela y **redeploy** el servicio.

---

### 2. 🔴 El dominio de email NO está configurado para producción

**Problema**: En producción, el código construye la URL así:

```typescript
const baseDomain = this.configService.get('BASE_DOMAIN') || 'qronnect.es';
validationUrl = `https://${tienda.dominio}.${baseDomain}/validar-email?token=${token}`;
```

Si `BASE_DOMAIN` no está configurada en Render, usará el fallback `qronnect.es`.

**Cómo verificar**:
1. Ve a Render → Environment
2. Busca la variable `BASE_DOMAIN`
3. Debe ser: `BASE_DOMAIN=qronnect.es`

**✅ SOLUCIÓN**:
Agrega la variable si no existe.

---

### 3. 📧 Email configurado incorrectamente en Resend

**Problema**: El email `noreply@qronnect.es` puede no estar verificado en Resend para producción.

**Cómo verificar**:
1. Ve a Resend: https://resend.com/domains
2. Verifica que el dominio `qronnect.es` esté:
   - ✅ Agregado
   - ✅ Verificado (todos los registros DNS en verde)
   - ✅ Status: "Verified"

**Si NO está verificado**:
1. Agrega los registros DNS requeridos en tu proveedor de dominios (GoDaddy, Cloudflare, etc.)
2. Espera la propagación (5-30 minutos)

**✅ SOLUCIÓN TEMPORAL**:
Mientras se verifica el dominio, usa el dominio de onboarding de Resend.

**En Render → Environment, cambia**:
```bash
RESEND_FROM_EMAIL=onboarding@resend.dev
```

Luego redeploy.

---

### 4. 📊 Los logs de producción tienen el error exacto

**Problema**: Sin ver los logs de producción, es imposible saber el error exacto.

**Cómo ver los logs**:

1. **Opción A: Desde el dashboard de Render**
   - Ve a tu servicio en Render
   - Click en **Logs** en el menú lateral
   - Filtra por "email", "resend", o "validación"

2. **Opción B: Desde CLI de Render**
   ```bash
   render logs --service qronnect-backend --tail
   ```

3. **Opción C: Trigger de test**
   - Haz un nuevo registro en producción
   - Inmediatamente ve a los logs
   - Busca:
     ```
     📧 [VALIDACIÓN EMAIL - REGISTRO]
     ✅ Enlace de validación enviado
     ❌ Error al enviar email
     ```

**✅ SOLUCIÓN**:
Los logs te dirán exactamente qué está fallando.

---

### 5. 🌐 CORS o dominio incorrecto

**Problema**: El frontend en producción puede estar usando un dominio diferente.

**Cómo verificar**:
1. Abre DevTools en tu navegador (F12)
2. Ve a la pestaña **Network**
3. Registra un usuario
4. Busca la petición `POST /api/clientes/auth/register`
5. Verifica el header `X-Tenant-Domain`

**Debe ser algo como**:
```
X-Tenant-Domain: lokeyokiera
```

**Si es incorrecto**, el backend no encontrará la tienda y puede fallar silenciosamente.

---

## 🎯 PASOS PARA SOLUCIONAR

### Paso 1: Verificar Variables en Render

```bash
# Variables CRÍTICAS que deben estar:
✅ RESEND_API_KEY=re_9oPTkYsE_EnsXoPVzKkjPuYVxdRUJvCZT
✅ RESEND_FROM_EMAIL=noreply@qronnect.es
✅ NODE_ENV=production
✅ BASE_DOMAIN=qronnect.es
✅ FRONTEND_URL=https://qronnect.es
```

### Paso 2: Ver los Logs de Producción

```bash
# Si tienes CLI de Render instalado:
render logs --service qronnect-backend --tail

# O desde el dashboard:
# https://dashboard.render.com → Tu servicio → Logs
```

**Busca estas líneas**:
```
📧 [VALIDACIÓN EMAIL - REGISTRO]
  - Cliente ID: xxxxx
  - Destinatario: tu@email.com
  - Token generado: xxxxx

📬 Resultado del envío: {
  "success": false,  ⬅️ Si es false, aquí está el error
  "error": "mensaje de error"
}
```

### Paso 3: Solución Temporal (Funciona al 100%)

Si quieres que funcione YA mientras investigas:

1. Ve a Render → Environment
2. Cambia o agrega:
   ```
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```
3. Click en **Save Changes**
4. Render redesplegará automáticamente
5. Espera 2-3 minutos
6. Prueba de nuevo el registro

**onboarding@resend.dev** es un dominio especial de Resend que SIEMPRE funciona, sin necesidad de verificar nada.

### Paso 4: Verificar el Dominio en Resend

1. Ve a https://resend.com/domains
2. Si `qronnect.es` NO está verificado:
   - Click en "Add Domain"
   - Ingresa `qronnect.es`
   - Copia los registros DNS
   - Agrégalos en tu proveedor de dominios
   - Espera la verificación (5-30 min)

### Paso 5: Probar con un Email Real

Una vez hecho lo anterior:
1. Registra un usuario con TU email real
2. Espera 1-2 minutos
3. Revisa:
   - ✅ Bandeja de entrada
   - ✅ Carpeta de SPAM
   - ✅ Carpeta de Promociones (Gmail)

---

## 🧪 TEST RÁPIDO

Para verificar si Resend funciona desde producción:

```bash
# Conecta a tu servidor de Render (si tienes SSH)
# O crea este endpoint de test temporal:

# En backend/src/clientes/clientes.controller.ts
@Get('test-email')
async testEmail() {
  return this.emailService.sendEmail({
    from: 'noreply@qronnect.es',
    to: 'TU_EMAIL@gmail.com',
    subject: 'Test desde producción',
    html: '<h1>Si ves esto, funciona!</h1>',
  });
}
```

Luego:
```bash
curl https://tu-backend-production.onrender.com/api/clientes/test-email
```

Si retorna `{"success": true}`, el problema NO es Resend.

---

## 📋 CHECKLIST

- [ ] Variables de entorno verificadas en Render
- [ ] `RESEND_API_KEY` está configurada
- [ ] `RESEND_FROM_EMAIL` está configurada
- [ ] `BASE_DOMAIN=qronnect.es` está configurada
- [ ] Dominio `qronnect.es` verificado en Resend
- [ ] Logs de producción revisados
- [ ] Email de test enviado a tu email personal
- [ ] Esperaste 2-3 minutos
- [ ] Revisaste SPAM
- [ ] Probaste con `onboarding@resend.dev` temporalmente

---

## 💡 DIAGNÓSTICO FINAL

**Comparte esto conmigo**:

1. **Variables de entorno en Render**:
   ```
   RESEND_API_KEY=re_XXXX... (está configurada? ✅/❌)
   RESEND_FROM_EMAIL=??? (qué valor tiene?)
   BASE_DOMAIN=??? (qué valor tiene?)
   ```

2. **Logs de producción** cuando haces un registro (copia y pega)

3. **Estado del dominio en Resend**:
   - ¿Está agregado `qronnect.es`? ✅/❌
   - ¿Está verificado? ✅/❌

4. **¿Probaste con `onboarding@resend.dev`?** ✅/❌
   - ¿Funcionó? ✅/❌

Con esta información te puedo dar la solución exacta al 100%.

---

## 🚀 SOLUCIÓN GARANTIZADA (mientras tanto)

Si necesitas que funcione **YA** mientras debuggeamos:

```bash
# En Render → Environment:
RESEND_FROM_EMAIL=onboarding@resend.dev
```

Esto funcionará el 100% de las veces. Una vez verificado el dominio `qronnect.es`, cambias de vuelta a `noreply@qronnect.es`.
