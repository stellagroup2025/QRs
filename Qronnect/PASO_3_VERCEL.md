# 📍 PASO 3: Deploy Frontend a Vercel

**Tiempo estimado:** 10 minutos

---

## ✅ Pre-requisitos

- [x] Código en GitHub
- [x] Backend funcionando: https://qronnect-backend.onrender.com ✅
- [x] Cuenta en Vercel (ya tienes)

---

## 🎯 Objetivo

Deployar el frontend Next.js en Vercel

---

## 📋 Pasos Detallados

### 1. Ir a Vercel

🔗 https://vercel.com

- Click **"Login"**
- **Sign in with GitHub**
- Autorizar Vercel

### 2. Crear Nuevo Proyecto

- Click **"Add New..."** → **"Project"**
- O directamente: https://vercel.com/new

### 3. Import Git Repository

- En la lista, busca: **stellagroup2025/QRs**
- Click **"Import"**

### 4. Configurar el Proyecto

#### Framework Preset:
```
Next.js (auto-detectado)
```

#### Root Directory:
```
Qronnect/frontend
```

**IMPORTANTE:** Click en **"Edit"** en Root Directory y escribe: `Qronnect/frontend`

#### Build Settings (auto-detectado):
```
Build Command:        npm run build
Output Directory:     .next
Install Command:      npm install
```

### 5. Environment Variables

Click **"Environment Variables"**

Añade SOLO esta variable:

```
Key:    NEXT_PUBLIC_API_URL
Value:  https://qronnect-backend.onrender.com
```

**IMPORTANTE:** NO pongas `/api` al final, solo la URL base.

### 6. Deploy!

- Click **"Deploy"** (abajo)
- Vercel comenzará a deployar
- Verás los logs en tiempo real
- Espera 3-5 minutos

### 7. Verificar Deployment

Cuando termine verás:

```
✓ Build Completed
✓ Deployment Ready
🎉 Your project is live!
```

URL asignada automáticamente (algo como):
```
https://qrs-stellagroup2025.vercel.app
```

O un nombre más corto.

### 8. Guardar URL del Frontend

**IMPORTANTE:** Copia la URL completa que Vercel te dio.

Ejemplo:
```
https://qrs-stellagroup2025.vercel.app
```

### 9. Actualizar Backend

Ahora necesitas actualizar la variable `FRONTEND_URL` en Render:

1. **Render Dashboard** → qronnect-backend → **Environment**
2. Busca `FRONTEND_URL`
3. Cambia el valor a: **la URL que Vercel te dio**
   ```
   https://qrs-stellagroup2025.vercel.app
   ```
4. **Save**
5. Render re-deploará automáticamente (1-2 min)

### 10. Test Básico

Abre la URL de Vercel en tu navegador:

```
https://[tu-url].vercel.app
```

Deberías ver:
- ✅ La página carga (aunque puede dar error de tenant por ahora - es normal)
- ✅ No hay errores 500
- ✅ El diseño se ve bien

---

## 🎨 Configurar Dominios Personalizados

### A) Dominio principal: qronnect.es

1. **Vercel Dashboard** → tu proyecto → **Settings** → **Domains**
2. Click **"Add"**
3. Escribe: `qronnect.es`
4. Click **"Add"**

Vercel te pedirá configurar DNS:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### B) Wildcard subdomain: *.qronnect.es

**NOTA:** Requiere plan Vercel Pro ($20/mes)

1. En Domains, click **"Add"**
2. Escribe: `*.qronnect.es`
3. Vercel te mostrará el registro DNS:

```
CNAME   *   cname.vercel-dns.com
```

### C) App subdomain: app.qronnect.es

Si no quieres pagar Pro, puedes añadir subdominios individuales:

1. Add domain: `app.qronnect.es`
2. DNS:
```
CNAME   app   cname.vercel-dns.com
```

---

## 🌐 Configurar DNS (en tu proveedor de dominio)

Ve a tu proveedor de DNS (donde compraste qronnect.es):

### Configuración Mínima:

```
Type    Name    Value                           TTL
A       @       76.76.21.21                     Auto
CNAME   www     cname.vercel-dns.com           Auto
CNAME   app     cname.vercel-dns.com           Auto
```

### Con Wildcard (si tienes Vercel Pro):

```
Type    Name    Value                           TTL
A       @       76.76.21.21                     Auto
CNAME   *       cname.vercel-dns.com           Auto
```

**Espera propagación:** 15 minutos a 1 hora

---

## 🔍 Troubleshooting

### Error: "Root directory not found"

- Verifica que pusiste: `Qronnect/frontend` (con mayúscula)
- No `frontend` solo

### Error: Build failed - TypeScript errors

- Ya está configurado para ignorar errores (next.config.mjs)
- Si falla, revisa los logs

### Error: Can't connect to backend

- Verifica `NEXT_PUBLIC_API_URL` en Vercel
- Debe ser: `https://qronnect-backend.onrender.com`
- SIN `/api` al final

### Dominio no funciona después de configurar DNS

- Espera 15-60 minutos para propagación
- Verifica en https://dnschecker.org
- Vercel configurará SSL automáticamente (puede tardar 5-10 min)

---

## ✅ Checklist

- [ ] Vercel account lista
- [ ] Proyecto importado: stellagroup2025/QRs
- [ ] Root Directory: `Qronnect/frontend`
- [ ] Variable configurada: NEXT_PUBLIC_API_URL
- [ ] Deploy exitoso
- [ ] URL del frontend guardada
- [ ] FRONTEND_URL actualizada en Render
- [ ] Frontend carga en navegador
- [ ] (Opcional) Dominios configurados

---

## 🎯 Siguiente Paso

Cuando el frontend esté OK:

**PASO 4: Configurar Dominios Completos**
- api.qronnect.es → Render
- qronnect.es → Vercel
- *.qronnect.es → Vercel (wildcard)

Luego:

**PASO 5: Testing Completo**
- Registrar cliente
- Enviar email
- Enviar SMS
- Probar todas las funcionalidades

---

**¿Todo listo?** ¡Vamos a Vercel! 🚀

---

**Fecha:** 19 de Noviembre de 2025
