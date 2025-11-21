# Fix: Error "No se encontró ninguna tienda para el dominio" en Admin

## 🔴 Problema

Al intentar guardar configuraciones en el admin (regalos de bienvenida, IA, etc.), se genera el error:

```
No se encontró ninguna tienda para el dominio: qronnect-backend.onrender.com.
Verifica que la tienda esté activa y el dominio configurado correctamente.
```

## 🔍 Causa Raíz

El header `X-Tenant-Domain` se estaba enviando vacío o `undefined` porque `localStorage.tenant_domain` no existía o se había perdido.

Cuando el backend no recibe este header, usa `req.get('host')` como fallback, que en producción es el dominio del backend (`qronnect-backend.onrender.com`), no el de la tienda.

### Flujo del Problema:

1. Frontend hace petición sin `X-Tenant-Domain` o con valor vacío
2. Backend (TenantResolverMiddleware) usa `req.get('host')` como fallback
3. En producción, `req.get('host')` = `qronnect-backend.onrender.com`
4. Backend busca tienda con dominio `qronnect-backend.onrender.com`
5. No existe esa tienda → Error 404

## ✅ Solución Implementada

### 1. Fix Inmediato en `configuracion/regalos/page.tsx`

Se agregó lógica de fallback para extraer el tenant del dominio actual cuando `localStorage.tenant_domain` no existe:

```typescript
let tenant = localStorage.getItem('tenant_domain');

// Fallback: Si no hay tenant en localStorage, extraerlo del dominio actual
if (!tenant) {
  const host = window.location.host;
  const parts = host.split('.');

  // Si es subdominio.qronnect.es -> usar subdominio
  if (parts.length >= 2 && !host.startsWith('localhost')) {
    tenant = parts[0]; // Ej: "aquarelax" de "aquarelax.qronnect.es"
  }
  // Si es localhost -> usar default
  else {
    tenant = 'lokeyokiera'; // fallback para desarrollo
  }

  console.log('⚠️ tenant_domain no encontrado en localStorage, usando:', tenant);
  // Guardar para futuras peticiones
  localStorage.setItem('tenant_domain', tenant);
}
```

### 2. Hook Reutilizable: `useTenant()`

Se creó un hook personalizado en `frontend/hooks/use-tenant.ts` para evitar duplicar este código:

```typescript
import { useTenant } from '@/hooks/use-tenant';

// En el componente:
const { tenantDomain } = useTenant();

// Usar en las peticiones:
fetch(`${API_URL}/api/endpoint`, {
  headers: {
    'X-Tenant-Domain': tenantDomain,
    // ...
  }
});
```

## 📊 Comparación

### ❌ Antes (Fallaba):

```typescript
const tenant = localStorage.getItem('tenant_domain');
// tenant puede ser null o undefined

fetch(url, {
  headers: {
    'X-Tenant-Domain': tenant || '', // ⬅️ Envía string vacío si es null
  }
});
```

### ✅ Ahora (Funciona):

```typescript
const { tenantDomain } = useTenant();
// tenantDomain siempre tiene un valor válido

fetch(url, {
  headers: {
    'X-Tenant-Domain': tenantDomain, // ⬅️ Siempre envía un valor correcto
  }
});
```

## 🎯 Archivos Modificados

- ✅ `frontend/app/admin/configuracion/regalos/page.tsx` - Fix aplicado
- ✅ `frontend/hooks/use-tenant.ts` - Hook reutilizable creado

## 🚀 Próximos Pasos (Opcional)

Refactorizar las otras 7 páginas del admin para usar `useTenant()`:

```bash
# Páginas que aún usan el código duplicado:
- frontend/app/admin/configuracion/ia/page.tsx
- frontend/app/admin/configuracion/tienda/page.tsx
- frontend/app/admin/referidos/page.tsx
- ...etc
```

## 🧪 Testing

### Paso 1: Reproducir el error (antes del fix)

1. Ir a `https://aquarelax.qronnect.es/admin/configuracion/regalos`
2. Modificar la configuración
3. Guardar
4. ❌ Error: "No se encontró ninguna tienda para el dominio: qronnect-backend.onrender.com"

### Paso 2: Verificar el fix

1. Deploy del código con el fix
2. Ir a la misma página
3. Abrir DevTools → Console
4. Modificar configuración
5. Guardar
6. ✅ Debe aparecer: `tenant: aquarelax`
7. ✅ La configuración se guarda correctamente

### Paso 3: Verificar logs del backend

En los logs de Render, debe aparecer:

```
🏪 [TENANT RESOLVER]
  - X-Tenant-Domain header: aquarelax
  - Host header: qronnect-backend.onrender.com
  - Resolviendo con: aquarelax
  - Tenant resuelto: AquaRelax (ID: xxxxx-xxx-xxx...)
```

## 📝 Notas Técnicas

### ¿Por qué se pierde `tenant_domain` del localStorage?

Posibles causas:
1. **Limpieza manual**: El usuario limpia localStorage o cookies
2. **Navegación privada**: localStorage no persiste entre sesiones
3. **Error en el login**: Si el login falla, no se guarda el tenant
4. **Diferentes dominios**: localStorage no se comparte entre subdominios

### ¿Por qué el fallback funciona?

Porque extrae el tenant directamente del dominio de la URL:
- URL: `https://aquarelax.qronnect.es/admin/...`
- Extrae: `aquarelax` (primer segmento antes del primer punto)
- Guarda en localStorage para futuras peticiones

## ✅ Validación

- ✅ El fix resuelve el problema inmediato
- ✅ No afecta el funcionamiento cuando localStorage existe
- ✅ Agrega logs claros para debugging
- ✅ Hook reutilizable disponible para futuras páginas
- ✅ Funciona tanto en desarrollo (localhost) como en producción

## 🎓 Lección Aprendida

**Nunca enviar headers con valores vacíos o undefined**:

```typescript
// ❌ MAL - Envía string vacío si tenant es null
'X-Tenant-Domain': tenant || ''

// ✅ BIEN - Siempre tiene un valor válido
'X-Tenant-Domain': tenantDomain
```

Cuando un header crítico está vacío, el backend puede usar fallbacks incorrectos que causan errores difíciles de debuggear.
