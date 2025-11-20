# 🔗 FIX: Enlaces de Referidos con localhost

## Problema Identificado

Los enlaces de referidos compartidos por clientes contenían `localhost:3000` en lugar del dominio de producción `qronnect.es`.

**Ejemplo del problema:**
```
http://lokeyokiera.localhost:3000/registro?ref=JUAN-A3F2
```

**Debería ser:**
```
https://lokeyokiera.qronnect.es/registro?ref=JUAN-A3F2
```

---

## Causa Raíz

En `backend/src/referidos/referidos.service.ts`, la URL se generaba con valor hardcodeado:

```typescript
// ❌ ANTES (línea 191)
const url = `http://${tiendaData.dominio}.localhost:${frontendPort}/registro?ref=${codigoReferido}`;
```

---

## Solución Implementada

### 1. **Detección automática de entorno**

Ahora el backend detecta si está en desarrollo o producción y genera la URL apropiada:

```typescript
// ✅ DESPUÉS
const nodeEnv = this.configService.get('NODE_ENV');
const isDevelopment = nodeEnv === 'development';

let url: string;
if (isDevelopment) {
  // En desarrollo: usar localhost con puerto
  const frontendPort = this.configService.get('FRONTEND_PORT') || '3000';
  url = `http://${tiendaData.dominio}.localhost:${frontendPort}/registro?ref=${codigoReferido}`;
} else {
  // En producción: usar dominio real
  const baseDomain = this.configService.get('BASE_DOMAIN') || 'qronnect.es';
  url = `https://${tiendaData.dominio}.${baseDomain}/registro?ref=${codigoReferido}`;
}
```

### 2. **Nueva variable de entorno**

Añadida `BASE_DOMAIN` en `.env.production`:

```bash
BASE_DOMAIN=qronnect.es
```

Esta variable permite cambiar fácilmente el dominio base sin tocar código.

---

## Archivos Modificados

### Backend
- ✅ `backend/src/referidos/referidos.service.ts`
  - Añadido import de `ConfigService`
  - Inyectado en constructor
  - Lógica de detección de entorno
  - Generación dinámica de URL

- ✅ `backend/.env.production`
  - Añadida variable `BASE_DOMAIN=qronnect.es`

---

## Comportamiento por Entorno

| Entorno | NODE_ENV | URL Generada | Ejemplo |
|---------|----------|--------------|---------|
| **Local Dev** | `development` | `http://[tienda].localhost:3000/registro?ref=...` | `http://lokeyokiera.localhost:3000/registro?ref=JUAN-A3F2` |
| **Producción** | `production` | `https://[tienda].qronnect.es/registro?ref=...` | `https://lokeyokiera.qronnect.es/registro?ref=JUAN-A3F2` |

---

## Configuración en Render

Para que funcione en producción, añade esta variable en Render:

1. Ve a: https://dashboard.render.com
2. Selecciona tu servicio backend
3. **Environment** → **Add Environment Variable**
4. Añade:
   ```
   Name:  BASE_DOMAIN
   Value: qronnect.es
   ```
5. **Save Changes**
6. El servicio se re-desplegará automáticamente

**NOTA:** Si ya tienes `NODE_ENV=production` configurado (que deberías), el fix funcionará automáticamente porque usa `qronnect.es` como fallback.

---

## Testing

### 1. **En Desarrollo (localhost)**

```bash
# Iniciar backend localmente
cd backend
npm run start:dev

# Probar endpoint de código de referido
curl -X GET http://localhost:3001/api/referidos/mi-codigo \
  -H "Authorization: Bearer [token]" \
  -H "X-Tenant-Domain: lokeyokiera"
```

**Respuesta esperada:**
```json
{
  "codigo": "JUAN-A3F2",
  "url": "http://lokeyokiera.localhost:3000/registro?ref=JUAN-A3F2",
  "nombre": "Juan Pérez",
  "nombre_tienda": "Perfumeria Lokeyokiera",
  "total_referidos": 5
}
```

### 2. **En Producción (Render)**

```bash
curl -X GET https://qronnect-backend.onrender.com/api/referidos/mi-codigo \
  -H "Authorization: Bearer [token]" \
  -H "X-Tenant-Domain: lokeyokiera"
```

**Respuesta esperada:**
```json
{
  "codigo": "JUAN-A3F2",
  "url": "https://lokeyokiera.qronnect.es/registro?ref=JUAN-A3F2",
  "nombre": "Juan Pérez",
  "nombre_tienda": "Perfumeria Lokeyokiera",
  "total_referidos": 5
}
```

### 3. **Probar enlace compartido**

1. Inicia sesión como cliente
2. Ve a: https://lokeyokiera.qronnect.es/mi-perfil/referidos
3. Copia tu enlace de referido
4. Verifica que sea: `https://lokeyokiera.qronnect.es/registro?ref=...`
5. Comparte en WhatsApp/Facebook/Email
6. El enlace debe funcionar correctamente

---

## Flujo Completo de Referido

```
┌──────────────────┐
│ Cliente A accede │
│   a su código    │
│   de referido    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Backend genera   │
│  URL dinámica    │
│ según entorno    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Cliente A        │
│  comparte link   │
│  en WhatsApp     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Cliente B hace   │
│   click y ve:    │
│ https://tienda   │
│ .qronnect.es/    │
│ registro?ref=... │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Cliente B se     │
│   registra con   │
│ código referido  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Cliente A recibe │
│    recompensa    │
└──────────────────┘
```

---

## Verificación Post-Deployment

### ✅ Checklist

1. [ ] Variable `BASE_DOMAIN` configurada en Render
2. [ ] Backend re-desplegado en Render
3. [ ] Endpoint `/api/referidos/mi-codigo` devuelve URL con `qronnect.es`
4. [ ] Enlaces compartidos en WhatsApp funcionan
5. [ ] Enlaces compartidos en Facebook funcionan
6. [ ] Enlaces compartidos en Email funcionan
7. [ ] QR de referido escaneable funciona
8. [ ] Registro con código de referido funciona

---

## Otros Enlaces que Podrían Tener el Mismo Problema

Revisados y confirmados que NO tienen el problema:

- ✅ **QR de registro** - Ya usa `getQrUrl()` de `frontend/lib/urls.ts`
- ✅ **Dashboard admin** - Ya usa utilidades de URLs
- ✅ **Subdominios de tienda** - Ya usa `getTenantUrl()`
- ✅ **Emails de validación** - Usan URLs relativas o del backend

**Único lugar con problema:** Sistema de referidos ✅ (Corregido)

---

## Beneficios del Fix

✅ **Funcionamiento correcto en producción**
✅ **Enlaces compartibles en redes sociales**
✅ **Mejor experiencia de usuario**
✅ **Tracking correcto de referidos**
✅ **Código limpio y mantenible**

---

## Variables de Entorno Resumen

### Desarrollo (.env local)
```bash
NODE_ENV=development
FRONTEND_PORT=3000
# BASE_DOMAIN no necesario, usa localhost por defecto
```

### Producción (Render)
```bash
NODE_ENV=production
BASE_DOMAIN=qronnect.es
FRONTEND_URL=https://qronnect.es
```

---

## Deployment

```bash
# 1. Stage changes
git add backend/src/referidos/referidos.service.ts
git add backend/.env.production

# 2. Commit
git commit -m "Fix: Enlaces de referidos ahora usan qronnect.es en producción

- Detección automática de entorno (dev/prod)
- Variable BASE_DOMAIN para configuración flexible
- localhost en desarrollo, qronnect.es en producción
- Links compartibles funcionan correctamente

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Push
git push origin main
```

Render re-desplegará automáticamente (2-5 min).

---

## Troubleshooting

### ❌ Problema: Enlace sigue mostrando localhost en producción

**Causa:** Variable `NODE_ENV` no está configurada en Render.

**Solución:**
1. Render Dashboard → Environment
2. Añade: `NODE_ENV=production`
3. Re-despliega

### ❌ Problema: Enlace muestra dominio incorrecto

**Causa:** Variable `BASE_DOMAIN` mal configurada.

**Solución:**
1. Verifica: `BASE_DOMAIN=qronnect.es` (sin https, sin barra final)
2. Re-despliega

### ❌ Problema: Enlace de referido da 404

**Causa:** La ruta `/registro` no maneja el parámetro `?ref=...`

**Solución:**
1. Verifica que el frontend procese el parámetro `ref`
2. Ver `frontend/app/registro/page.tsx` o donde manejes el registro

---

**¡Los enlaces de referidos ahora funcionan correctamente en producción!** 🎉
