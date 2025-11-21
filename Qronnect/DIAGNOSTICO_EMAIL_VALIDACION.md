# 🔍 Diagnóstico: Email de Validación No Llega y Enlace Da Error 401

## 🔴 Problemas Actuales

1. ❌ Email de validación NO llega automáticamente al registrarse
2. ✅ Email SÍ llega cuando das clic en "Reenviar"
3. ❌ El enlace da error 401 "Enlace de validación inválido"

---

## 📊 Análisis

### Problema 1: Email No Llega Automáticamente

**Posibles causas**:

1. **Error silencioso en el try-catch** del registro
   - El código tiene un try-catch que NO falla el registro si el email falla
   - Esto significa que si hay un error, el registro se completa pero el email no se envía

2. **Variables de entorno en producción**
   - `BASE_DOMAIN` podría estar mal configurada
   - `NODE_ENV` podría no ser 'production'
   - `RESEND_FROM_EMAIL` podría estar incorrecta

3. **Error al obtener la tienda**
   - Si `tenantId` es incorrecto, no encontrará la tienda
   - Si la tienda no tiene `dominio` configurado, fallará

### Problema 2: Enlace Da Error 401

**Causa más probable**: El `tenantId` que se está usando para validar es diferente al `tenantId` con el que se guardó el token.

**Flujo normal**:
```
Registro:
  tenantId = "xxx-xxx-xxx"  (de burgerco)
  token = "8d574746..."
  Guarda en BD: clientes donde id_tienda = "xxx-xxx-xxx"

Validación:
  tenantId = "yyy-yyy-yyy"  (¿diferente?)
  token = "8d574746..."
  Busca: clientes donde id_tienda = "yyy-yyy-yyy" AND token = "8d574746..."
  ❌ NO ENCUENTRA NADA
```

---

## 🎯 SOLUCIÓN PASO A PASO

### Paso 1: Ver los Logs en Render

1. Ve a https://dashboard.render.com
2. Selecciona tu servicio backend
3. Click en "Logs"
4. Filtra por "REGISTRO" o "VALIDACIÓN"

**Busca estas líneas cuando te registres**:

```
📝 [REGISTER CLIENTE]
  - Email: tu@email.com
  - Nombre: ...
  - Tenant ID: xxx-xxx-xxx

📧 [VALIDACIÓN EMAIL - REGISTRO]
  - Cliente ID: ...
  - Destinatario: tu@email.com
  - Token generado: 8d574746...
  - Token expira en: ...

✅ Token guardado en base de datos
  - Tienda: BurgerCo (dominio: burgerco)
  - URL de validación: https://burgerco.qronnect.es/validar-email?token=...
  - From Email: BurgerCo <noreply@qronnect.es>

📬 Resultado del envío: {
  "success": true/false,  ⬅️ ESTO ES CRÍTICO
  "messageId": "..." / "error": "..."
}
```

**Si ves**:
- `"success": false` → El problema está en Resend
- `"success": true` → El email debería llegar
- `💥 ERROR CRÍTICO` → Hay un error en el código

### Paso 2: Verificar Variables en Render

Ve a Render → Environment y verifica:

```bash
✅ BASE_DOMAIN=qronnect.es
✅ NODE_ENV=production
✅ RESEND_API_KEY=re_9oPTkYsE...
✅ RESEND_FROM_EMAIL=noreply@qronnect.es
```

### Paso 3: Verificar el Token en la BD

**Opción A**: Desde Supabase Dashboard

1. Ve a tu proyecto en Supabase
2. Ve a Table Editor → `clientes`
3. Busca tu email
4. Verifica:
   - ✅ `codigo_validacion` tiene un valor (el token)
   - ✅ `codigo_validacion_expires_at` es una fecha futura
   - ✅ `email_validado` es `false`
   - ✅ `id_tienda` es el UUID correcto de BurgerCo

**Opción B**: Con SQL Query

```sql
SELECT
  id,
  email,
  codigo_validacion,
  codigo_validacion_expires_at,
  email_validado,
  id_tienda,
  validacion_enviada_at
FROM clientes
WHERE email = 'tu@email.com'
ORDER BY created_at DESC
LIMIT 1;
```

### Paso 4: Verificar el Tenant ID

El problema del error 401 puede ser que el `X-Tenant-Domain` header no se está enviando correctamente.

**En el frontend** (`validar-email/page.tsx` línea 32-37):

```typescript
const host = window.location.host  // burgerco.qronnect.es
const domain = host.split(':')[0].split('.')[0]  // burgerco
```

**Si `domain` es incorrecto**, el backend buscará en la tienda equivocada.

**Para verificar**: Abre DevTools → Network → Haz clic en el enlace de validación → Ve la petición → Headers → Busca `X-Tenant-Domain`

Debe ser: `X-Tenant-Domain: burgerco`

### Paso 5: Ver los Logs de Validación

Cuando haces clic en el enlace, busca en los logs de Render:

```
✅ [VALIDAR EMAIL]
  - Tenant ID: xxx-xxx-xxx  ⬅️ Compara con el Tenant ID del registro
  - Token: 8d574746f685a3ba...

  - Cliente encontrado: tu@email.com  ⬅️ Si aparece esto, BIEN
```

**Si aparece**:
```
❌ Error buscando cliente: ...
  - ¿El token es correcto?
  - ¿El tenant ID es correcto?
```

Entonces el problema es que **el Tenant ID de la validación es diferente al Tenant ID del registro**.

---

## 🔧 FIX TEMPORAL

Si quieres que funcione YA mientras investigamos, puedes:

### Opción 1: Actualizar el token manualmente en la BD

1. Ve a Supabase → Table Editor → `clientes`
2. Busca tu email
3. Copia el `id_tienda` (UUID)
4. Busca la tienda con ese UUID en la tabla `tiendas`
5. Verifica que el `dominio` sea correcto ("burgerco")

### Opción 2: Usar el reenvío (que sí funciona)

Ya que el reenvío SÍ funciona, puedes:
1. Registrarte
2. Ir a `/validacion-pendiente`
3. Click en "Reenviar email"
4. Usar ese enlace

---

## 📝 Información que Necesito

Para darte la solución exacta, necesito que me compartas:

### Del Registro:

```
📝 [REGISTER CLIENTE]
  - Tenant ID: ???

✅ Token guardado en base de datos
  - Tienda: ???
  - URL de validación: ???

📬 Resultado del envío: {
  "success": ???,
  "error": ???
}
```

### De la Validación:

```
✅ [VALIDAR EMAIL]
  - Tenant ID: ???  ⬅️ ¿Es el mismo que en el registro?
  - Token: ???

❌ Error buscando cliente: ???
```

### Del DevTools:

1. Network → Request de validación → Headers → `X-Tenant-Domain`: ???

---

## 🎓 Teoría: Por Qué el Reenvío Funciona pero el Registro No

**Hipótesis 1**: El try-catch está capturando un error silencioso

```typescript
try {
  // Código de envío de email
} catch (emailError) {
  console.error('💥 ERROR CRÍTICO...')
  // NO lanza error, solo loguea
}
```

Si hay un error (por ejemplo, `tienda` es null), el catch lo captura pero no falla el registro. El usuario se registra pero el email no se envía.

**Hipótesis 2**: Variable de entorno incorrecta

Si `BASE_DOMAIN` no está configurada en Render, usará el fallback `'qronnect.es'`, pero podría construir la URL mal.

**Hipótesis 3**: El reenvío funciona porque usa datos ya guardados

El reenvío lee el cliente de la BD (donde ya tiene `id_tienda` correcto) y reenvía. El registro inicial podría estar usando un `tenantId` incorrecto por algún bug en el middleware.

---

## ✅ SIGUIENTE PASO

**Corre el commit que acabo de hacer** y prueba de nuevo. Los logs ahora son MUCHO más detallados y te dirán exactamente qué está fallando.

```bash
git pull
git push origin main
```

Espera el redeploy de Render (2-3 min) y:

1. Registra un nuevo usuario
2. Copia TODOS los logs que aparezcan en Render relacionados con el registro
3. Intenta validar el enlace
4. Copia TODOS los logs que aparezcan en Render relacionados con la validación
5. Pégame ambos sets de logs

Con esos logs te daré la solución exacta.
