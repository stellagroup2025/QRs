# 🔍 Guía de Diagnóstico: Logs de Producción

## 📋 RESUMEN DEL PROBLEMA

1. ❌ Email de validación NO llega automáticamente al registrarse
2. ✅ Email SÍ llega cuando das clic en "Reenviar"
3. ❌ El enlace de validación da error 401 "Enlace de validación inválido"

---

## 🎯 QUÉ BUSCAR EN LOS LOGS

### PASO 1: Acceder a los Logs de Render

1. Ve a https://dashboard.render.com
2. Selecciona tu servicio **backend**
3. Haz clic en **"Logs"** en el menú izquierdo
4. Los logs aparecen en tiempo real

---

### PASO 2: Registrar un Nuevo Usuario

Mientras tienes los logs abiertos en una pestaña:

1. Abre otra pestaña con https://burgerco.qronnect.es/registro
2. Registra un nuevo usuario con un email de prueba
3. Observa los logs en tiempo real

---

### PASO 3: Buscar Estas Líneas en el Registro

Deberías ver esta secuencia de logs cuando te registras:

```
🏪 [TENANT RESOLVER]
  - X-Tenant-Domain header: burgerco
  - Host header: burgerco.qronnect.es
  - Resolviendo con: burgerco
  - Tenant resuelto: BurgerCo (ID: xxx-xxx-xxx-xxx)  ⬅️ ANOTA ESTE ID

📝 [REGISTER CLIENTE]
  - Email: tu@email.com
  - Nombre: Tu Nombre
  - Tenant ID: xxx-xxx-xxx-xxx  ⬅️ DEBE SER EL MISMO DE ARRIBA

📧 [VALIDACIÓN EMAIL - REGISTRO]
  - Cliente ID: yyy-yyy-yyy-yyy
  - Destinatario: tu@email.com
  - Token generado: 8d574746f685a3ba5f603f2d0b8603d7bef853d93a0d77b48e193a435da45c53
  - Token expira en: 2024-01-23T12:00:00.000Z

✅ Token guardado en base de datos
  - Tienda: BurgerCo (dominio: burgerco)
  - URL de validación: https://burgerco.qronnect.es/validar-email?token=...
  - From Email: BurgerCo <noreply@qronnect.es>

📬 Resultado del envío: {
  "success": true,  ⬅️ ESTO ES CRÍTICO - ¿Es true o false?
  "messageId": "abc123..."
}
```

---

### PASO 4: Analizar el Resultado del Envío

#### ✅ SI VES `"success": true`

El email debería llegar. Si no llega, el problema está en:
- **Resend API** - Puede estar en sandbox mode o el dominio no verificado
- **Spam** - El email llegó pero está en spam/correo no deseado
- **Email provider** - Gmail/Outlook bloqueó el email

**Acción**: Revisa la carpeta de spam. También ve a https://resend.com/logs y busca el `messageId`.

#### ❌ SI VES `"success": false`

Habrá un campo `"error"` que explica el problema:

```json
{
  "success": false,
  "error": "Missing required parameter: from"  // Ejemplo
}
```

**Acción**: Copia el mensaje de error completo.

#### 💥 SI VES `💥 ERROR CRÍTICO enviando enlace de validación:`

Significa que hubo una excepción antes de poder enviar el email:

```
💥 ERROR CRÍTICO enviando enlace de validación:
   Tipo: TypeError
   Mensaje: Cannot read property 'dominio' of null
   Stack: at ClientesService.registerCliente (/app/...)
```

**Esto significa**:
- El objeto `tienda` es `null` o `undefined`
- La búsqueda de la tienda falló
- El `tenantId` es incorrecto

**Acción**: Copia todo el stack trace.

---

### PASO 5: Probar el Enlace de Validación

1. Si el email SÍ llegó (aunque tarde), haz clic en el enlace
2. Observa los logs de nuevo

Deberías ver:

```
🏪 [TENANT RESOLVER]
  - X-Tenant-Domain header: burgerco  ⬅️ ¿Es correcto?
  - Host header: burgerco.qronnect.es
  - Resolviendo con: burgerco
  - Tenant resuelto: BurgerCo (ID: xxx-xxx-xxx-xxx)  ⬅️ ANOTA ESTE ID

✅ [VALIDAR EMAIL]
  - Tenant ID: xxx-xxx-xxx-xxx  ⬅️ COMPARA CON EL DEL REGISTRO
  - Token: 8d574746f685a3ba...

  - Cliente encontrado: tu@email.com  ⬅️ SI VES ESTO, BIEN
```

#### ✅ SI VES `"Cliente encontrado: ..."`

El token es correcto y el tenant ID coincide. El email se validará.

#### ❌ SI VES `❌ Error buscando cliente:`

```
❌ Error buscando cliente: { code: 'PGRST116', details: null, hint: null, message: 'JSON object requested, multiple (or no) rows returned' }
  - ¿El token es correcto?
  - ¿El tenant ID es correcto?
```

**Esto significa**:
- El token NO existe en la base de datos con ese `tenantId`
- El `tenantId` del registro es diferente al `tenantId` de la validación

**Acción**: Compara los dos Tenant IDs:
1. El Tenant ID cuando te registraste (PASO 3)
2. El Tenant ID cuando haces clic en el enlace (PASO 5)

**Si son diferentes**, ese es el problema. El enlace se generó con un tenant pero se está validando con otro.

---

### PASO 6: Probar el Reenvío (que sí funciona)

1. Ve a https://burgerco.qronnect.es/validacion-pendiente
2. Haz clic en "Reenviar email"
3. Observa los logs

Deberías ver:

```
🏪 [TENANT RESOLVER]
  - X-Tenant-Domain header: burgerco
  - Host header: burgerco.qronnect.es
  - Resolviendo con: burgerco
  - Tenant resuelto: BurgerCo (ID: xxx-xxx-xxx-xxx)

📧 [REENVIAR VALIDACIÓN]
  - Email: tu@email.com
  - Tenant ID: xxx-xxx-xxx-xxx

📬 Resultado del envío: {
  "success": true,
  "messageId": "..."
}
```

**Compara** el `Tenant ID` del reenvío con el `Tenant ID` del registro original.

---

## 🔎 ESCENARIOS POSIBLES

### Escenario A: Email No Se Envía (success: false)

**Logs que verás**:
```
📬 Resultado del envío: {
  "success": false,
  "error": "..."
}
```

**Causa**: Problema con Resend API
**Solución**: Verificar API key, dominio verificado, rate limits

---

### Escenario B: Error Antes de Enviar Email (💥 ERROR CRÍTICO)

**Logs que verás**:
```
💥 ERROR CRÍTICO enviando enlace de validación:
   Tipo: TypeError
   Mensaje: Cannot read property 'dominio' of null
```

**Causa**: El objeto `tienda` es null/undefined
**Solución**: Verificar que `tenantId` es correcto y que la tienda existe en la BD

---

### Escenario C: Email Se Envía Pero Da 401 al Validar

**Logs del registro**:
```
✅ Token guardado en base de datos
  - Tienda: BurgerCo (ID: xxx-xxx-xxx-xxx)

📬 Resultado del envío: { "success": true }
```

**Logs de la validación**:
```
🏪 [TENANT RESOLVER]
  - Tenant resuelto: BurgerCo (ID: yyy-yyy-yyy-yyy)  ⬅️ DIFERENTE ID

❌ Error buscando cliente:
  - ¿El token es correcto?
  - ¿El tenant ID es correcto?
```

**Causa**: El `tenantId` del registro es diferente al de la validación
**Solución**: Investigar por qué el tenant resolver devuelve diferentes IDs

---

### Escenario D: Email Llega Tarde (delay de minutos/horas)

**Logs**:
```
📬 Resultado del envío: { "success": true, "messageId": "abc123" }
```

**Causa**: Resend está en sandbox mode o hay rate limiting
**Solución**:
1. Ve a https://resend.com/logs
2. Busca el `messageId`
3. Ve el status del email (queued, sent, delivered, bounced)

---

## 📊 CHECKLIST DE INFORMACIÓN A RECOPILAR

Cuando veas los logs, copia esta información:

### Del Registro:

- [ ] Tenant ID resuelto: `___________________________`
- [ ] Email registrado: `___________________________`
- [ ] Token generado: `___________________________`
- [ ] URL de validación: `___________________________`
- [ ] Resultado del envío:
  - [ ] `success: true` o `success: false`
  - [ ] `messageId` (si success=true): `___________________________`
  - [ ] `error` (si success=false): `___________________________`
- [ ] ¿Apareció `💥 ERROR CRÍTICO`? [ ] Sí [ ] No
  - Si sí, copia el error completo: `___________________________`

### De la Validación (al hacer clic en el enlace):

- [ ] Tenant ID resuelto: `___________________________`
- [ ] Token enviado: `___________________________`
- [ ] ¿Apareció "Cliente encontrado"? [ ] Sí [ ] No
- [ ] ¿Apareció "Error buscando cliente"? [ ] Sí [ ] No
- [ ] Error completo (si aplica): `___________________________`

### Del Reenvío (al hacer clic en "Reenviar"):

- [ ] Tenant ID resuelto: `___________________________`
- [ ] Resultado del envío:
  - [ ] `success: true` o `success: false`
  - [ ] `messageId`: `___________________________`

---

## 🎯 SIGUIENTE PASO

Una vez que tengas esta información, podremos identificar exactamente:

1. **Por qué el email no llega automáticamente** (Escenario A o B)
2. **Por qué el enlace da 401** (Escenario C)
3. **Si el problema es de configuración o de código**

---

## 🛠️ HERRAMIENTAS ADICIONALES

### 1. Script de Verificación de Cliente

Si ya tienes un email registrado, puedes verificar su estado en la BD:

```bash
cd backend
node verificar-cliente.js tu@email.com
```

Esto te mostrará:
- El token actual
- Si está expirado
- El tenant ID asociado
- La URL de validación correcta

### 2. Página de Debug

Si quieres probar manualmente la validación:

1. Ve a https://burgerco.qronnect.es/debug-validacion
2. Pega el token completo
3. Ingresa el dominio del tenant (ej: `burgerco`)
4. Haz clic en "Validar Email"
5. Ve la consola del navegador (F12) para ver los logs del frontend

### 3. Verificar Token en la Base de Datos

Si tienes acceso a Supabase:

1. Ve a tu proyecto en Supabase
2. SQL Editor → Nueva query
3. Ejecuta:

```sql
SELECT
  id,
  email,
  codigo_validacion,
  codigo_validacion_expires_at,
  email_validado,
  id_tienda,
  validacion_enviada_at,
  created_at
FROM clientes
WHERE email = 'tu@email.com'
ORDER BY created_at DESC
LIMIT 1;
```

4. Verifica:
   - ✅ `codigo_validacion` tiene un valor (el token)
   - ✅ `codigo_validacion_expires_at` es una fecha futura
   - ✅ `email_validado` es `false`
   - ✅ `id_tienda` es un UUID válido

5. Luego, verifica la tienda:

```sql
SELECT
  id,
  nombre,
  nombre_comercial,
  dominio,
  activo
FROM tiendas
WHERE id = 'EL-UUID-DEL-id_tienda-DE-ARRIBA';
```

6. Comprueba que:
   - ✅ `activo` es `true`
   - ✅ `dominio` es correcto (ej: `burgerco`)

---

## 💡 TIPS

1. **Mantén los logs abiertos en tiempo real** mientras pruebas. No uses logs antiguos.

2. **Usa emails diferentes cada vez** para evitar confusión. Ej:
   - test1@gmail.com
   - test2@gmail.com
   - test3@gmail.com

3. **Anota el timestamp** de cada prueba para encontrar los logs más fácilmente.

4. **Copia TODO el contexto** cuando veas un error. No solo la línea del error, sino las 5-10 líneas anteriores también.

5. **Compara siempre los Tenant IDs**. Este es el problema más probable para el error 401.

---

## ✅ RESUMEN

El sistema está completamente instrumentado con logs. La información que necesitamos está en los logs de producción en Render. Sigue esta guía paso a paso y copia la información solicitada.

Con esos logs, identificaremos exactamente:
- Por qué el email no se envía automáticamente
- Por qué el enlace da 401
- Cuál es la solución exacta

**No hagas más cambios de código hasta tener esta información**. Cualquier cambio adicional sin ver los logs sería especulativo.
