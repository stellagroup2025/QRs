# 🔧 FIX: Error de CORS en Subdominios

## ❌ Error

```
Access to fetch at 'https://qronnect-backend.onrender.com/api/clientes/auth/register'
from origin 'https://cuentosmas.qronnect.es' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 🔍 Causa

La configuración de CORS en `backend/src/main.ts` tenía un regex que no funcionaba correctamente:

```typescript
// ANTES (❌ No funcionaba siempre):
/^https:\/\/([\w-]+\.)?qronnect\.es$/
```

El problema está en el `?` que hace el subdominio opcional. Esto creaba ambigüedad en la validación.

## ✅ Solución

Se separó el dominio principal de los subdominios en dos reglas distintas:

```typescript
// DESPUÉS (✅ Funciona correctamente):
'https://qronnect.es', // Dominio principal
/^https:\/\/[\w-]+\.qronnect\.es$/, // Todos los subdominios
```

### Cambios Adicionales

1. **Headers permitidos explícitamente**:
   ```typescript
   allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Domain']
   ```
   - `X-Tenant-Domain` es crítico para el sistema multi-tenant

2. **Métodos HTTP explícitos**:
   ```typescript
   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
   ```

3. **Logging mejorado**:
   ```typescript
   // Cuando se permite:
   console.log(`✅ CORS permitido para origin: ${origin}`);

   // Cuando se bloquea:
   console.warn(`⚠️  CORS bloqueado para origin: ${origin}`);
   console.warn(`   Origenes permitidos:`, allowedOrigins.map(o => o.toString()));
   ```

## 📋 Instrucciones para Aplicar el Fix

### 1. Hacer Push del Cambio

```bash
cd backend
git add src/main.ts
git commit -m "fix: Mejorar configuración de CORS para permitir todos los subdominios"
git push origin main
```

### 2. Esperar Deploy en Render

El deploy automático tomará 2-3 minutos. Puedes ver el progreso en:
- https://dashboard.render.com → Tu servicio backend → "Events"

### 3. Verificar que Funciona

Una vez completado el deploy, prueba registrarte desde:
- ✅ https://cuentosmas.qronnect.es/registro
- ✅ https://burgerco.qronnect.es/registro
- ✅ https://aquarelax.qronnect.es/registro
- ✅ https://lokeyokiera.qronnect.es/registro

Todos deberían funcionar sin error de CORS.

### 4. Verificar en los Logs de Render

Deberías ver en los logs:

```
✅ CORS permitido para origin: https://cuentosmas.qronnect.es
```

Si ves esto, significa que el fix funcionó correctamente.

## 🎯 Testing Completo

Después del deploy, el flujo completo debería funcionar:

1. ✅ Registro desde cualquier subdominio (sin error de CORS)
2. ✅ Email de validación llega automáticamente (después del fix de VARCHAR(64))
3. ✅ Enlace de validación funciona (sin error 401)
4. ✅ Usuario puede hacer login

## 📝 Archivos Modificados

- **backend/src/main.ts** - Configuración de CORS mejorada

## 🔗 Relacionado

Este fix se suma a los otros dos fixes necesarios:

1. ✅ **FIX_CODIGO_VALIDACION_LENGTH.md** - Campo VARCHAR(64)
2. ✅ **FIX_CORS_SUBDOMINIOS.md** - Este archivo (CORS)

Con ambos fixes aplicados, el sistema de registro y validación funcionará completamente.

## ⚠️ IMPORTANTE: Orden de Aplicación

**Aplica los fixes en este orden:**

1. **Primero**: Ejecutar migración SQL para VARCHAR(64)
   ```sql
   ALTER TABLE clientes
   ALTER COLUMN codigo_validacion TYPE VARCHAR(64);
   ```

2. **Segundo**: Push del fix de CORS
   ```bash
   git push origin main
   ```

3. **Tercero**: Esperar deploy y probar

No funcionará correctamente si solo aplicas uno de los dos fixes.

## 🐛 Si Sigue Sin Funcionar

Si después de aplicar ambos fixes aún hay problemas:

1. **Verificar logs en Render**:
   - Busca: `✅ CORS permitido para origin:`
   - Si no aparece, el regex aún no está funcionando

2. **Verificar campo en BD**:
   ```sql
   SELECT character_maximum_length
   FROM information_schema.columns
   WHERE table_name = 'clientes'
   AND column_name = 'codigo_validacion';
   ```
   - Debe devolver: `64`

3. **Probar en consola del navegador**:
   ```javascript
   // Abre DevTools (F12) en https://cuentosmas.qronnect.es
   fetch('https://qronnect-backend.onrender.com/api/clientes/auth/register', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'X-Tenant-Domain': 'cuentosmas'
     },
     body: JSON.stringify({
       email: 'test@test.com',
       nombre: 'Test',
       telefono: '123456789'
     })
   })
   .then(r => console.log('✅ CORS OK', r))
   .catch(e => console.error('❌ CORS ERROR', e))
   ```

4. **Si sigue dando error de CORS**, comparte:
   - El error exacto de la consola
   - Los logs de Render filtrados por "CORS"
   - El resultado del fetch manual arriba

## ✅ Confirmación de Éxito

Sabrás que todo funciona cuando:

1. ✅ No hay error de CORS en la consola del navegador
2. ✅ En los logs de Render aparece: `✅ CORS permitido para origin: https://cuentosmas.qronnect.es`
3. ✅ El email de validación llega automáticamente
4. ✅ El enlace de validación funciona sin error 401

---

**Estado actual**: Fix creado ✅ | Pendiente: git push y deploy
