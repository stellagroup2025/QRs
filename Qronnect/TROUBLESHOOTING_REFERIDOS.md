# Troubleshooting: Sistema de Referidos y Validación

## Verificación Paso a Paso

### 1. Verificar que los cambios se desplegaron

#### Backend (Render)
```bash
# Verificar último commit en Render
git log --oneline -1

# Debería mostrar:
# 490ec79 fix: Sistema completo de referidos y validación por enlace
```

¿Cómo desplegar?
```bash
cd backend
git push origin main  # Render detectará el push automáticamente
```

#### Frontend (Vercel)
```bash
cd frontend
git push origin main  # Vercel detectará el push automáticamente
```

---

### 2. Verificar Logs del Backend

#### En Render:
1. Ve a https://dashboard.render.com
2. Selecciona tu servicio de backend
3. Ve a la pestaña **Logs**
4. Busca estos logs cuando alguien se registra con código de referido:

```
📝 [REGISTER CLIENTE]
  - Email: ...
  - Tenant ID: ...
  - Código referido: JUAN-A3F2  ← Debe aparecer el código
  - Procesando código de referido: JUAN-A3F2
  ✅ Referido registrado exitosamente
  - Puntos para referidor: 500
  - Puntos para nuevo cliente: 500
✅ Email de referido enviado a: referidor@email.com
```

**Si NO ves estos logs:**
- El frontend NO está enviando `codigo_referido` al backend
- Verificar en consola del navegador si aparece: `"Código de referido detectado: JUAN-A3F2"`

---

### 3. Verificar Frontend en el Navegador

#### Test 1: Banner de Referido

1. Visita: `https://tutienda.qronnect.es/registro?ref=TEST123`
2. **Deberías ver un banner azul** que dice:
   ```
   ✓ ¡Te registras con un código de referido!
      Recibirás puntos bonus al completar tu registro.
   ```

**Si NO ves el banner:**
- Abre la consola del navegador (F12)
- Busca: `"Código de referido detectado: TEST123"`
- Si NO aparece → El componente no se desplegó correctamente

#### Test 2: Red Request

1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Completa el formulario de registro
4. Busca la request a `/api/clientes/auth/register`
5. Click derecho → **Copy** → **Copy as cURL**
6. Verifica que el JSON incluya:
   ```json
   {
     "nombre": "...",
     "email": "...",
     "codigo_referido": "TEST123"  ← Debe estar aquí
   }
   ```

**Si `codigo_referido` NO está en el request:**
- El frontend NO está enviando el parámetro
- Puede ser un problema de cache del navegador
- Intenta: Ctrl+Shift+R (hard refresh)

---

### 4. Verificar Base de Datos

#### Verificar Referido en Supabase

```sql
-- Ver últimos referidos registrados
SELECT
  hr.*,
  c_referidor.nombre AS referidor_nombre,
  c_referido.nombre AS referido_nombre
FROM historial_referidos hr
LEFT JOIN clientes c_referidor ON hr.referidor_id = c_referidor.id
LEFT JOIN clientes c_referido ON hr.referido_id = c_referido.id
ORDER BY hr.fecha_registro DESC
LIMIT 10;
```

**Si la tabla está vacía:**
- El backend NO está registrando el referido
- Verificar logs del backend

#### Verificar Código Personal

```sql
-- Ver códigos de referido generados
SELECT
  id,
  nombre,
  email,
  codigo_referido_personal,
  total_referidos
FROM clientes
WHERE codigo_referido_personal IS NOT NULL
ORDER BY total_referidos DESC;
```

---

### 5. Verificar Email de Validación

#### Test: Registro nuevo

1. Registrarse con un email REAL
2. Verificar en Render logs:
   ```
   ✅ Enlace de validación enviado a: tu@email.com
   ```

3. **En desarrollo**, el response incluirá el enlace completo:
   ```json
   {
     "message": "Enlace de validación enviado al email",
     "codigo_enviado": "http://tienda.localhost:3000/validar-email?token=abc123..."
   }
   ```

4. **En producción**, revisar bandeja de email:
   - **Asunto**: "Confirma tu email - [Nombre Tienda]"
   - **Botón**: "Confirmar mi email"

**Si NO llega el email:**
- Verificar configuración de Resend en Render
- Verificar variables de entorno:
  - `RESEND_API_KEY`
  - `RESEND_WILDCARD_ENABLED` (opcional)

---

### 6. Verificar Email al Referidor

#### Test: Usar código de referido

1. Cliente A genera su código de referido
2. Copiar enlace de referido (ej: `https://tienda.qronnect.es/registro?ref=CLIENTEA-123`)
3. Cliente B se registra usando ese enlace
4. **Cliente A debe recibir email**:
   - **Asunto**: "🎉 ¡[Nombre B] usó tu código de referido!"
   - **Contenido**: Nombre del amigo + puntos ganados

**Si NO llega el email:**
- Verificar logs en Render:
   ```
   ✅ Email de referido enviado a: clienteA@email.com
   ```
- Si NO aparece el log → Verificar `referidos.service.ts`

---

## Problemas Comunes

### Problema 1: "No parece que haya funcionado nada"

**Diagnóstico:**
1. ¿Desplegaste los cambios a producción?
   ```bash
   git push origin main
   ```

2. ¿Estás probando en la URL correcta?
   - ❌ `localhost:3000/registro?ref=ABC` (si el backend está en Render, no funcionará)
   - ✅ `https://tutienda.qronnect.es/registro?ref=ABC`

3. ¿El backend está corriendo la versión nueva?
   - Verificar en Render: **Deploy → Latest Deployment**
   - Debe mostrar commit: `490ec79`

---

### Problema 2: Frontend muestra banner pero backend no registra

**Causa:** El frontend SÍ captura el `ref` pero NO lo envía al backend

**Solución:**
1. Verificar en Network tab que `codigo_referido` está en el request
2. Si NO está → Hard refresh: Ctrl+Shift+R
3. Si persiste → Verificar `registro-form.tsx` línea 84

---

### Problema 3: Backend registra referido pero NO envía email

**Causa:** EmailService no está configurado o falló el envío

**Solución:**
1. Verificar variables de entorno en Render:
   ```
   RESEND_API_KEY=re_...
   ```
2. Verificar logs:
   ```
   Error enviando email al referidor: [detalle del error]
   ```

---

### Problema 4: Enlace de validación da error 404

**Causa:** La página `/validar-email` no se desplegó

**Solución:**
1. Verificar que existe: `frontend/app/validar-email/page.tsx`
2. Verificar en Vercel → **Deployments** → Latest
3. Debe incluir el archivo `page.tsx`

---

## Comandos Útiles

### Ver logs en tiempo real (Render)
```bash
# Ir a Render Dashboard → tu servicio → Logs
# O usar Render CLI:
render logs -f
```

### Limpiar cache de Vercel
```bash
cd frontend
vercel --prod --force
```

### Verificar variables de entorno
```bash
# Backend (Render)
# Dashboard → tu servicio → Environment

# Frontend (Vercel)
# Dashboard → tu proyecto → Settings → Environment Variables
```

---

## Checklist de Deployment

- [ ] Commit `490ec79` está en `main`
- [ ] Backend desplegado en Render (verificar en Dashboard)
- [ ] Frontend desplegado en Vercel (verificar en Dashboard)
- [ ] Variables de entorno configuradas:
  - [ ] `RESEND_API_KEY`
  - [ ] `BASE_DOMAIN=qronnect.es`
  - [ ] `NODE_ENV=production`
- [ ] Base de datos tiene tabla `historial_referidos`
- [ ] Función `registrar_referido` existe en Supabase

---

## Próximos Pasos

Si todo lo anterior está correcto y sigue sin funcionar:

1. **Compartir logs** del backend cuando alguien se registra
2. **Compartir screenshot** del Network tab mostrando el request
3. **Verificar** si hay errores en la consola del navegador

