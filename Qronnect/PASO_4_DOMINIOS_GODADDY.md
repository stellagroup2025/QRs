# 📍 PASO 4: Configurar Dominios en GoDaddy

**Dominio:** qronnect.es
**Registrador:** GoDaddy
**Tiempo estimado:** 20 minutos + propagación DNS (15-60 min)

---

## 🎯 Objetivo

Configurar:
- `qronnect.es` → Frontend (Vercel)
- `app.qronnect.es` → Frontend (Vercel)
- `*.qronnect.es` → Frontend (Vercel) - Wildcard
- `api.qronnect.es` → Backend (Render)

---

## 📋 PARTE 1: Configurar Backend en Render

### 1. Render Dashboard

1. Ve a: https://dashboard.render.com
2. Click en tu service: **qronnect-backend**
3. Click **"Settings"** (menú lateral)

### 2. Custom Domain

1. Scroll hasta **"Custom Domain"**
2. Click **"Add Custom Domain"**
3. Escribe: `api.qronnect.es`
4. Click **"Save"**

### 3. Obtener CNAME de Render

Render te mostrará algo como:

```
Add a CNAME record pointing api.qronnect.es to:
qronnect-backend.onrender.com
```

**Cópialo y guárdalo.** Lo necesitarás para GoDaddy.

---

## 📋 PARTE 2: Configurar Frontend en Vercel

### 1. Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Click en tu proyecto: **qrs** o similar
3. Click **"Settings"** (arriba)
4. Click **"Domains"** (menú lateral)

### 2. Añadir Dominio Principal

1. En "Domain", escribe: `qronnect.es`
2. Click **"Add"**

Vercel te pedirá configurar DNS. Te mostrará:

```
A Record
Name: @
Value: 76.76.21.21
```

### 3. Añadir Wildcard (Requiere Vercel Pro $20/mes)

**Opción A: Si tienes Vercel Pro**

1. En "Domain", escribe: `*.qronnect.es`
2. Click **"Add"**

Vercel te mostrará:
```
CNAME Record
Name: *
Value: cname.vercel-dns.com
```

**Opción B: Si NO tienes Vercel Pro (Gratis)**

Añade subdominios individuales:

1. Añadir: `app.qronnect.es`
2. Añadir: `lokeyokiera.qronnect.es`
3. Añadir: `stylecut.qronnect.es`
4. Etc. (para cada tienda)

Cada uno te pedirá:
```
CNAME Record
Name: app (o el subdominio)
Value: cname.vercel-dns.com
```

---

## 📋 PARTE 3: Configurar DNS en GoDaddy

### 1. Login a GoDaddy

1. Ve a: https://dcc.godaddy.com/control/portfolio
2. Login con tu cuenta
3. Click en **"DNS"** junto a qronnect.es
4. O ve directamente a: https://dcc.godaddy.com/control/qronnect.es/dns

### 2. Eliminar Registros Existentes (Opcional)

Si hay registros A o CNAME existentes que interfieran:

- Elimina registros A con nombre `@` o `*`
- Elimina CNAME antiguos

**CUIDADO:** No elimines registros importantes como MX (email) si los tienes.

### 3. Añadir Registros DNS

Click en **"Add"** para cada registro:

#### Registro 1: Dominio principal → Vercel

```
Type:   A
Name:   @
Value:  76.76.21.21
TTL:    600 (10 minutos) o Auto
```

#### Registro 2: WWW → Vercel

```
Type:   CNAME
Name:   www
Value:  cname.vercel-dns.com
TTL:    600 o Auto
```

#### Registro 3: APP → Vercel

```
Type:   CNAME
Name:   app
Value:  cname.vercel-dns.com
TTL:    600 o Auto
```

#### Registro 4: API → Render (Backend)

```
Type:   CNAME
Name:   api
Value:  qronnect-backend.onrender.com
TTL:    600 o Auto
```

#### Registro 5: Wildcard → Vercel (Solo si tienes Vercel Pro)

```
Type:   CNAME
Name:   *
Value:  cname.vercel-dns.com
TTL:    600 o Auto
```

### 4. Guardar

Click **"Save"** en cada registro.

---

## 📋 Configuración Final DNS

Tu configuración en GoDaddy debería verse así:

### Con Vercel Pro (Wildcard):

```
Type    Name    Value                           TTL
─────────────────────────────────────────────────────
A       @       76.76.21.21                     600
CNAME   www     cname.vercel-dns.com           600
CNAME   *       cname.vercel-dns.com           600
CNAME   api     qronnect-backend.onrender.com  600
```

### Sin Vercel Pro (Subdominios individuales):

```
Type    Name    Value                           TTL
─────────────────────────────────────────────────────
A       @       76.76.21.21                     600
CNAME   www     cname.vercel-dns.com           600
CNAME   app     cname.vercel-dns.com           600
CNAME   api     qronnect-backend.onrender.com  600
```

Si tienes más tiendas, añade un CNAME por cada una:
```
CNAME   lokeyokiera   cname.vercel-dns.com     600
CNAME   stylecut      cname.vercel-dns.com     600
```

---

## ⏱️ Esperar Propagación DNS

**Tiempo:** 15 minutos a 1 hora (típicamente 15-30 min)

### Verificar propagación:

1. Ve a: https://dnschecker.org
2. Escribe: `qronnect.es`
3. Selecciona tipo: **A**
4. Click **"Search"**

Debería mostrar `76.76.21.21` en varios servidores.

Repite para:
- `api.qronnect.es` (tipo CNAME) → debería mostrar `qronnect-backend.onrender.com`
- `app.qronnect.es` (tipo CNAME) → debería mostrar `cname.vercel-dns.com`

---

## 🔐 SSL/TLS Automático

**Vercel:**
- Configura SSL automáticamente
- Puede tardar 5-10 minutos después de la propagación DNS
- Recibirás email cuando esté listo

**Render:**
- Configura SSL automáticamente
- También tarda 5-10 minutos
- Verás el estado en Settings → Custom Domain

---

## 🧪 Testing

### Después de propagación (15-60 min):

#### 1. Test Dominio Principal

```bash
curl -I https://qronnect.es
```

Debería retornar `200 OK` o redirigir.

#### 2. Test API

```bash
curl https://api.qronnect.es/api/health
```

Debería retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...,
  "environment": "production"
}
```

#### 3. Test Subdominios

Abre en navegador:
- https://qronnect.es
- https://app.qronnect.es
- https://api.qronnect.es/api/health

---

## 🔍 Troubleshooting

### "DNS_PROBE_FINISHED_NXDOMAIN"

- DNS aún no propagado
- Espera 15-30 minutos más
- Verifica configuración en GoDaddy

### "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"

- SSL aún no configurado
- Espera 5-10 minutos
- Vercel/Render lo configuran automáticamente

### Dominio carga pero muestra error 404

- Verifica que el dominio esté añadido en Vercel Dashboard
- Settings → Domains debe mostrar todos tus dominios

### API no funciona

- Verifica CNAME en GoDaddy
- Debe apuntar a: `qronnect-backend.onrender.com`
- Verifica en Render que el custom domain esté activo

---

## ✅ Checklist

- [ ] Render: Custom domain `api.qronnect.es` añadido
- [ ] Vercel: Domain `qronnect.es` añadido
- [ ] Vercel: Domain `app.qronnect.es` añadido
- [ ] (Opcional) Vercel: Wildcard `*.qronnect.es` añadido
- [ ] GoDaddy: Registro A para `@` → 76.76.21.21
- [ ] GoDaddy: CNAME para `www` → cname.vercel-dns.com
- [ ] GoDaddy: CNAME para `app` → cname.vercel-dns.com
- [ ] GoDaddy: CNAME para `api` → qronnect-backend.onrender.com
- [ ] Esperado 15-60 min para propagación
- [ ] DNS propagado (verificado en dnschecker.org)
- [ ] SSL activo (candado verde en navegador)
- [ ] qronnect.es carga correctamente
- [ ] api.qronnect.es/api/health funciona

---

## 🎯 Siguiente Paso

Una vez que los dominios funcionen:

**PASO 5: Testing Completo en Producción**
- Registrar cliente test
- Enviar email
- Enviar SMS
- Probar todas las funcionalidades

---

**Fecha:** 19 de Noviembre de 2025
