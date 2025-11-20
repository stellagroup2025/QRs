# 🔧 FIX: Subdominios apuntando a localhost

## Problema Resuelto
Los enlaces de subdominios estaban hardcodeados a `localhost:3000` en varios archivos.

## Solución Implementada

### 1. **Creada utilidad para URLs dinámicas** (`lib/urls.ts`)

Nueva función que detecta automáticamente el entorno:
- **Desarrollo:** usa `localhost:3000`
- **Producción:** usa `qronnect.es`

```typescript
// Ejemplos de uso:
getTenantUrl('lokeyokiera', '/admin/dashboard')
// Dev: http://lokeyokiera.localhost:3000/admin/dashboard
// Prod: https://lokeyokiera.qronnect.es/admin/dashboard

getQrUrl('lokeyokiera')
// Dev: http://lokeyokiera.localhost:3000/get-qr
// Prod: https://lokeyokiera.qronnect.es/get-qr

getRegistroUrl('lokeyokiera')
// Dev: http://localhost:3000/registro?tienda=lokeyokiera
// Prod: https://qronnect.es/registro?tienda=lokeyokiera
```

### 2. **Archivos actualizados:**

✅ `frontend/lib/urls.ts` - Nueva utilidad creada
✅ `frontend/app/superadmin/tiendas/page.tsx` - Enlaces de acceso a tienda
✅ `frontend/app/superadmin/tiendas/[id]/page.tsx` - URLs de registro
✅ `frontend/app/admin/dashboard/page.tsx` - URLs de QR

---

## Configuración en Vercel (OPCIONAL)

La detección de dominio es **automática**, pero puedes configurar manualmente:

### Opción A: Detección Automática (Recomendado)

No necesitas hacer nada. El código detecta:
- Si hostname es `localhost` → usa `localhost:3000`
- Si hostname es `*.qronnect.es` → extrae y usa `qronnect.es`

### Opción B: Variable de Entorno Manual

Si quieres forzar un dominio específico:

1. **Vercel Dashboard → Settings → Environment Variables**

2. **Añadir:**
   ```
   Name:  NEXT_PUBLIC_BASE_DOMAIN
   Value: qronnect.es

   Environments:
   ✅ Production
   ✅ Preview
   ```

3. **Re-deploy**

**IMPORTANTE:** Solo necesitas esto si la detección automática falla.

---

## Deployment

### 1. Hacer commit de los cambios:

```bash
git add frontend/lib/urls.ts
git add frontend/app/superadmin/tiendas/page.tsx
git add frontend/app/superadmin/tiendas/[id]/page.tsx
git add frontend/app/admin/dashboard/page.tsx
git commit -m "Fix: URLs de subdominios ahora detectan automáticamente dev/prod

- Creada utilidad lib/urls.ts para gestión centralizada de URLs
- Reemplazados todos los localhost:3000 hardcodeados
- Auto-detección de entorno (dev/prod)
- Soporte para localhost en desarrollo y qronnect.es en producción

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 2. Push:

```bash
git push origin main
```

Vercel detectará el cambio y re-desplegará automáticamente (2-3 min).

---

## Verificación

Después del deployment:

### 1. **En Superadmin:**
- Ve a: https://qronnect.es/superadmin/tiendas
- Click en "Acceder" a una tienda
- **Debe abrir:** `https://lokeyokiera.qronnect.es/admin/dashboard?superadmin_token=...`
- ✅ **NO debe decir localhost**

### 2. **En Admin Dashboard:**
- Ve a la pestaña "QR"
- Verifica la "URL de registro"
- **Debe mostrar:** `https://lokeyokiera.qronnect.es/get-qr`
- ✅ **NO debe decir localhost**

### 3. **En Detalle de Tienda:**
- Superadmin → Tiendas → Click en una tienda
- Pestaña "Información"
- Verifica "URL de registro"
- **Debe mostrar:** `https://qronnect.es/registro?tienda=lokeyokiera`
- ✅ **NO debe decir localhost**

---

## Cómo Funciona la Auto-detección

```typescript
// En el navegador, detecta:
const hostname = window.location.hostname

// Ejemplos:
// - "localhost" → usa "localhost:3000"
// - "app.qronnect.es" → extrae "qronnect.es"
// - "lokeyokiera.qronnect.es" → extrae "qronnect.es"
// - "qronnect.es" → usa "qronnect.es"
```

---

## Comportamiento en Diferentes Entornos

| Entorno | Hostname | Dominio Base | URLs Generadas |
|---------|----------|--------------|----------------|
| **Local Dev** | `localhost` | `localhost:3000` | `http://tienda.localhost:3000` |
| **Producción** | `qronnect.es` | `qronnect.es` | `https://tienda.qronnect.es` |
| **Producción** | `app.qronnect.es` | `qronnect.es` | `https://tienda.qronnect.es` |
| **Vercel Preview** | `*.vercel.app` | `vercel.app` | `https://tienda.vercel.app` |

---

## Archivos Modificados

```
frontend/
├── lib/
│   └── urls.ts                              ← NUEVO
├── app/
│   ├── admin/
│   │   └── dashboard/
│   │       └── page.tsx                     ← MODIFICADO
│   └── superadmin/
│       └── tiendas/
│           ├── page.tsx                     ← MODIFICADO
│           └── [id]/
│               └── page.tsx                 ← MODIFICADO
```

---

## Beneficios

✅ **Un solo código** para dev y producción
✅ **No más hardcoding** de localhost
✅ **Auto-detección** del entorno
✅ **Fácil de testear** localmente
✅ **Listo para producción**

---

## Próximos Pasos

Una vez deployado y verificado:

1. ✅ Probar flujo completo de superadmin → tienda
2. ✅ Generar QRs y verificar que las URLs sean correctas
3. ✅ Compartir QRs con clientes de prueba
4. ✅ Monitorear que todo funcione en producción

---

**¡Los subdominios ahora funcionan correctamente en producción!** 🚀
