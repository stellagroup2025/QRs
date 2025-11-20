# 📍 PASO 5: Verificar Configuración DNS

**Tiempo estimado:** 5 minutos + espera de propagación (15-60 min)

---

## ✅ Pre-requisitos Completados

- [x] Backend deployed: https://qronnect-backend.onrender.com
- [x] Frontend deployed: https://qronnect.vercel.app
- [x] Dominios configurados en Render y Vercel
- [x] DNS configurado en GoDaddy

---

## 🔍 Verificar Configuración DNS en GoDaddy

Antes de esperar la propagación, verifica que todo esté correcto:

### 1. Login a GoDaddy DNS

🔗 https://dcc.godaddy.com/control/qronnect.es/dns

Deberías ver estos registros:

```
Type    Name    Value                           TTL
─────────────────────────────────────────────────────
A       @       76.76.21.21                     600
CNAME   www     cname.vercel-dns.com           600
CNAME   app     cname.vercel-dns.com           600
CNAME   api     qronnect-backend.onrender.com  600
```

Si tienes Vercel Pro (wildcard):
```
CNAME   *       cname.vercel-dns.com           600
```

### 2. Verificar Configuración en Render

🔗 https://dashboard.render.com

- Ve a tu service: **qronnect-backend**
- Settings → Custom Domain
- Deberías ver: `api.qronnect.es` con estado **Verifying** o **Active**

### 3. Verificar Configuración en Vercel

🔗 https://vercel.com/dashboard

- Ve a tu proyecto
- Settings → Domains
- Deberías ver:
  - `qronnect.es` ✓
  - `www.qronnect.es` ✓
  - `app.qronnect.es` ✓

---

## ⏱️ Comprobar Propagación DNS

### Opción 1: DNSChecker.org (Recomendado)

1. Ve a: https://dnschecker.org

2. **Test 1: Dominio principal**
   - Domain: `qronnect.es`
   - Type: `A`
   - Debería mostrar: `76.76.21.21`

3. **Test 2: API subdomain**
   - Domain: `api.qronnect.es`
   - Type: `CNAME`
   - Debería mostrar: `qronnect-backend.onrender.com`

4. **Test 3: App subdomain**
   - Domain: `app.qronnect.es`
   - Type: `CNAME`
   - Debería mostrar: `cname.vercel-dns.com`

### Opción 2: Terminal (Más rápido)

Copia y pega estos comandos para verificar:

```bash
# Test dominio principal
nslookup qronnect.es 8.8.8.8

# Test API subdomain
nslookup api.qronnect.es 8.8.8.8

# Test App subdomain
nslookup app.qronnect.es 8.8.8.8
```

**Resultado esperado:**

```bash
# qronnect.es
Address: 76.76.21.21

# api.qronnect.es
canonical name = qronnect-backend.onrender.com

# app.qronnect.es
canonical name = cname.vercel-dns.com
```

---

## 🧪 Testing Después de Propagación

**Espera 15-60 minutos** para propagación DNS completa.

### 1. Test Backend (API)

```bash
curl https://api.qronnect.es/api/health
```

**Esperado:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-19T...",
  "uptime": 123.45,
  "environment": "production"
}
```

### 2. Test Frontend (Dominio principal)

```bash
curl -I https://qronnect.es
```

**Esperado:**
```
HTTP/2 200
...
```

### 3. Test App Subdomain

Abre en navegador:
```
https://app.qronnect.es
```

Debería cargar la aplicación (puede dar error de tenant si no hay tienda configurada, pero no debería dar error 404 o SSL).

---

## 🔐 Verificar SSL/TLS

### Estado de Certificados

1. **Vercel**:
   - Dashboard → tu proyecto → Settings → Domains
   - Cada dominio debe tener un 🔒 verde
   - Estado: "Valid"

2. **Render**:
   - Dashboard → qronnect-backend → Settings → Custom Domain
   - Estado: "Certificate Active"

### Test en Navegador

Abre estos URLs en navegador:

- https://qronnect.es → Debería mostrar 🔒 verde
- https://app.qronnect.es → Debería mostrar 🔒 verde
- https://api.qronnect.es/api/health → Debería mostrar 🔒 verde

**Si ves advertencias de SSL:**
- Espera 5-10 minutos más
- Vercel y Render configuran SSL automáticamente
- Puede tardar un poco después de la propagación DNS

---

## 🚨 Troubleshooting

### "DNS_PROBE_FINISHED_NXDOMAIN"

**Causa:** DNS aún no propagado

**Solución:**
1. Verifica que los registros existan en GoDaddy
2. Espera 15-30 minutos más
3. Limpia caché DNS local:
   ```bash
   # Windows
   ipconfig /flushdns

   # macOS
   sudo dscacheutil -flushcache

   # Linux
   sudo systemd-resolve --flush-caches
   ```

### "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"

**Causa:** SSL aún no configurado

**Solución:**
1. Verifica que DNS esté propagado primero
2. Espera 5-10 minutos para que Vercel/Render generen certificado
3. Verifica estado en dashboards

### "404 Not Found" pero dominio carga

**Causa:** Dominio no añadido en Vercel

**Solución:**
1. Ve a Vercel Dashboard → Settings → Domains
2. Añade el dominio faltante
3. Espera 2-3 minutos

### API no funciona pero frontend sí

**Causa:** CNAME incorrecto o Render no configurado

**Solución:**
1. Verifica CNAME en GoDaddy: debe ser `qronnect-backend.onrender.com`
2. Verifica en Render que custom domain esté activo
3. Espera propagación DNS

---

## ✅ Checklist de Verificación

- [ ] DNS configurado en GoDaddy (4-5 registros)
- [ ] Custom domain añadido en Render (api.qronnect.es)
- [ ] Dominios añadidos en Vercel (qronnect.es, app.qronnect.es)
- [ ] Propagación DNS completada (verificado en dnschecker.org)
- [ ] `nslookup qronnect.es` retorna 76.76.21.21
- [ ] `nslookup api.qronnect.es` retorna qronnect-backend.onrender.com
- [ ] SSL activo en todos los dominios (🔒 verde)
- [ ] `curl https://api.qronnect.es/api/health` funciona
- [ ] https://qronnect.es carga en navegador
- [ ] https://app.qronnect.es carga en navegador

---

## ⏭️ Siguiente Paso

Una vez que TODOS los checks estén OK:

**PASO 6: Testing Completo en Producción**

Vamos a probar:
1. Registrar una tienda test con subdominio
2. Registrar un cliente
3. Enviar email de bienvenida
4. Enviar SMS de prueba
5. Escanear QR y acumular sellos
6. Validar canje de promoción

---

## 📊 Estado Actual

```
✅ Backend deployed:  https://qronnect-backend.onrender.com
✅ Frontend deployed: https://qronnect.vercel.app
✅ DNS configurado:   GoDaddy
⏳ Propagación:       15-60 minutos
⏳ SSL:               Auto-configurándose
🎯 Siguiente:         Testing en producción
```

---

**Fecha:** 19 de Noviembre de 2025

