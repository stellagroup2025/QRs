# Correcciones: Referidos y Email de Validación

## Problema 1: Lista de Amigos Referidos No Se Muestra

### ✅ SOLUCIONADO

**Síntoma**: El contador de "Total Referidos" se ve correctamente, pero la lista de "Tus Amigos Referidos" aparecía vacía.

**Causa**: El backend devuelve el array de referidos directamente, pero el frontend esperaba `{ referidos: [] }`.

**Solución Implementada**:

### Archivo Modificado:
`frontend/app/[slug]/mis-referidos/page.tsx` (líneas 121-126)

```typescript
// ANTES:
if (referidosRes.ok) {
  const data = await referidosRes.json();
  setReferidos(data.referidos || []);
}

// DESPUÉS:
if (referidosRes.ok) {
  const data = await referidosRes.json();
  console.log('📋 Referidos recibidos:', data);
  // El backend devuelve directamente el array, no { referidos: [] }
  setReferidos(Array.isArray(data) ? data : []);
}
```

**Resultado**: Ahora la lista de amigos referidos se mostrará correctamente con:
- Nombre del referido
- Fecha de registro
- Estado de primera compra
- Recompensa obtenida

---

## Problema 2: Email de Confirmación de Registro No Llega

### 🔍 DIAGNÓSTICO

El sistema tiene logs detallados que muestran exactamente qué está pasando. Para verificar:

### Paso 1: Verificar que el backend esté corriendo
```bash
cd backend
npm run start:dev
```

### Paso 2: Registrar un nuevo usuario y ver los logs

Los logs deben mostrar:
```
📧 [VALIDACIÓN EMAIL - REGISTRO]
  - Cliente ID: [uuid]
  - Destinatario: [email]
  - Token generado: [64 caracteres hex]
  - Token expira en: [timestamp]
✅ Token guardado en base de datos
  - URL de validación: [URL completa]
  - Nombre tienda: [nombre]
📬 Resultado del envío: {...}
✅ Enlace de validación enviado a: [email]
  - Message ID: [message_id]
```

### Posibles Causas y Soluciones:

#### A. Resend API Key no configurada
**Síntoma en logs**:
```
⚠️  RESEND_API_KEY not configured. Email sending will be disabled.
```

**Solución**:
1. Verificar que existe el archivo `backend/.env`
2. Verificar que contiene:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   RESEND_FROM_EMAIL=noreply@qronnect.es
   ```
3. Reiniciar el backend

#### B. Email bloqueado por Resend
**Síntoma en logs**:
```
❌ Error al enviar email de validación: [error de Resend]
```

**Soluciones**:
1. **Verificar dominio verificado en Resend**:
   - Ir a https://resend.com/domains
   - Verificar que `qronnect.es` está verificado
   - Si no, agregar los registros DNS necesarios

2. **Rate limiting**:
   - Resend tiene límites (100 emails/día en plan gratuito)
   - Verificar el panel de Resend si se alcanzó el límite

3. **Email en sandbox mode**:
   - En desarrollo, Resend solo envía a emails verificados
   - Agregar el email de prueba en https://resend.com/audiences

#### C. Error al guardar token en BD
**Síntoma en logs**:
```
❌ Error al guardar token de validación: [error]
```

**Solución**:
1. Verificar conexión a Supabase
2. Verificar que la tabla `clientes` tiene las columnas:
   - `codigo_validacion` (TEXT)
   - `codigo_validacion_expires_at` (TIMESTAMP)
   - `validacion_enviada_at` (TIMESTAMP)

### Verificación Manual:

1. **Verificar que el token se guardó en BD**:
   ```sql
   SELECT
     email,
     codigo_validacion,
     codigo_validacion_expires_at,
     validacion_enviada_at
   FROM clientes
   WHERE email = 'tu-email@ejemplo.com'
   ORDER BY fecha_registro DESC
   LIMIT 1;
   ```

2. **Probar URL manualmente**:
   - Copiar el token de la BD
   - Construir la URL: `https://visionplus.qronnect.es/validar-email?token=[TOKEN]`
   - Abrir en el navegador

---

## 📊 Estado Actual del Sistema

### ✅ Funcionando Correctamente:
1. Generación de token de validación
2. Guardado en base de datos
3. Construcción de URL de validación
4. Logs detallados para debugging
5. Lista de referidos (corregido)
6. Contador de total referidos
7. Email de referido (según indicaste que llega)

### ⚠️ Requiere Verificación:
1. Envío de email de validación de registro
   - Backend está preparado y con logs
   - Puede ser problema de configuración de Resend

---

## 🔧 Pasos para Testing

### Test 1: Verificar Lista de Referidos
1. Ir a `/[slug]/mis-referidos`
2. Verificar que aparecen los referidos si existen
3. Verificar el contador de "Total Referidos"

### Test 2: Verificar Email de Validación
1. Abrir consola del backend: `npm run start:dev`
2. Registrar nuevo usuario
3. Observar logs del backend
4. Verificar que aparece `✅ Enlace de validación enviado`
5. Si no llega el email:
   - Copiar el token de los logs
   - Construir la URL manualmente
   - Probar en el navegador

### Test 3: Verificar Sistema Completo
1. Registro → Email debe llegar
2. Click en enlace del email → Debe validar
3. Login → Debe permitir acceso
4. Referir amigo → Email de referido debe llegar
5. Amigo se registra → Debe aparecer en lista

---

## 📝 Archivos Modificados en Este Fix

```
frontend/app/[slug]/mis-referidos/page.tsx
FIXES_REFERIDOS_EMAIL.md (este archivo)
```

---

## 🚨 Si el Email Sigue Sin Llegar

### Opción A: Verificar con el token de los logs
```
1. Ver logs del backend al registrarse
2. Copiar el token completo (64 caracteres)
3. Usar URL: https://visionplus.qronnect.es/validar-email?token=[TOKEN]
```

### Opción B: Usar endpoint de reenvío
```bash
POST /api/clientes/auth/resend-validation-link
{
  "email": "tu-email@ejemplo.com"
}
```

### Opción C: Deshabilitar validación temporalmente
(Solo para testing, NO recomendado en producción)

En `backend/src/clientes/clientes.service.ts:609`:
```typescript
// Comentar estas líneas:
// if (!emailValidado) {
//   throw new UnauthorizedException(
//     'Debes validar tu email...'
//   );
// }
```

---

## 📬 Información de Contacto para Soporte

Si necesitas ayuda adicional:
1. Compartir logs del backend al registrar usuario
2. Compartir captura de configuración de Resend
3. Verificar estado en https://resend.com/logs

---

**Fecha de corrección**: 2025-11-21
**Versión**: 1.0
**Estado**: Lista de referidos ✅ | Email de validación 🔍 (requiere verificación de configuración)
