# 🌐 Configurar Tenants en Desarrollo Local

## 📋 Problema

Para que el sistema multitenancy funcione correctamente en tu entorno de desarrollo local, necesitas que los subdominios de cada tienda (ej: `stylecut.localhost`, `urbancut.localhost`) sean reconocidos por tu sistema operativo.

Por defecto, tu navegador no sabe cómo resolver estos dominios locales, por lo que necesitas configurar el archivo `hosts`.

---

## ✅ Solución: Editar el archivo HOSTS

### 🪟 Windows

#### Paso 1: Abrir el archivo hosts como Administrador

1. Presiona `Win + X` y selecciona **"Windows PowerShell (Admin)"** o **"Terminal (Admin)"**
2. Ejecuta este comando:

```powershell
notepad C:\Windows\System32\drivers\etc\hosts
```

O manualmente:
- Abre el Bloc de notas **como Administrador** (click derecho → Ejecutar como administrador)
- Ve a `Archivo → Abrir`
- Navega a: `C:\Windows\System32\drivers\etc\`
- En el filtro de archivos, selecciona **"Todos los archivos (*.*)"**
- Abre el archivo `hosts`

#### Paso 2: Agregar las entradas de tenants

Agrega estas líneas al final del archivo:

```plaintext
# ===================================
# Qronnect - Tenants Locales
# ===================================

# Tienda existente
127.0.0.1    lokeyokiera.localhost

# Sector: Belleza & Bienestar
127.0.0.1    stylecut.localhost
127.0.0.1    urbancut.localhost
127.0.0.1    bellaskin.localhost
127.0.0.1    perfectnails.localhost
127.0.0.1    aquarelax.localhost
127.0.0.1    visionplus.localhost

# Sector: Foodie & Restauración
127.0.0.1    elrincon.localhost
127.0.0.1    dolcefrio.localhost
127.0.0.1    laparrilla.localhost
127.0.0.1    donnapoli.localhost
127.0.0.1    burgerco.localhost

# Sector: Mascotas
127.0.0.1    huellafeliz.localhost
127.0.0.1    doggystyle.localhost
127.0.0.1    vetcare.localhost

# Sector: Infantil & Familia
127.0.0.1    mundopeques.localhost
127.0.0.1    cuentosmas.localhost
127.0.0.1    pequelook.localhost

# Sector: Salud & Deporte
127.0.0.1    fitzone.localhost
127.0.0.1    fisioplus.localhost
127.0.0.1    nutrishop.localhost
```

#### Paso 3: Guardar y verificar

1. Guarda el archivo (`Ctrl + S`)
2. Cierra el Bloc de notas
3. Abre el navegador y prueba: `http://lokeyokiera.localhost:3001`

---

### 🐧 Linux / MacOS

#### Paso 1: Editar el archivo hosts

```bash
sudo nano /etc/hosts
```

O si prefieres vim:

```bash
sudo vim /etc/hosts
```

#### Paso 2: Agregar las entradas

Agrega las mismas líneas que en Windows:

```plaintext
# ===================================
# Qronnect - Tenants Locales
# ===================================

# Tienda existente
127.0.0.1    lokeyokiera.localhost

# Sector: Belleza & Bienestar
127.0.0.1    stylecut.localhost
127.0.0.1    urbancut.localhost
127.0.0.1    bellaskin.localhost
127.0.0.1    perfectnails.localhost
127.0.0.1    aquarelax.localhost
127.0.0.1    visionplus.localhost

# Sector: Foodie & Restauración
127.0.0.1    elrincon.localhost
127.0.0.1    dolcefrio.localhost
127.0.0.1    laparrilla.localhost
127.0.0.1    donnapoli.localhost
127.0.0.1    burgerco.localhost

# Sector: Mascotas
127.0.0.1    huellafeliz.localhost
127.0.0.1    doggystyle.localhost
127.0.0.1    vetcare.localhost

# Sector: Infantil & Familia
127.0.0.1    mundopeques.localhost
127.0.0.1    cuentosmas.localhost
127.0.0.1    pequelook.localhost

# Sector: Salud & Deporte
127.0.0.1    fitzone.localhost
127.0.0.1    fisioplus.localhost
127.0.0.1    nutrishop.localhost
```

#### Paso 3: Guardar

- En nano: `Ctrl + O`, `Enter`, `Ctrl + X`
- En vim: `Esc`, `:wq`, `Enter`

#### Paso 4: Limpiar caché DNS (opcional)

En macOS:
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

En Linux:
```bash
sudo systemctl restart systemd-resolved
```

---

## 🧪 Verificar que funciona

### Opción 1: Ping

Abre una terminal/cmd y ejecuta:

```bash
ping stylecut.localhost
```

Deberías ver:
```
Respuesta desde 127.0.0.1: bytes=32 tiempo<1ms TTL=128
```

### Opción 2: Navegador

1. Asegúrate de que el backend esté corriendo:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Abre el navegador y ve a:
   ```
   http://lokeyokiera.localhost:3001/api/config/branding
   ```

   Deberías ver los datos de branding de la tienda Lokeyokiera.

3. Prueba otra tienda:
   ```
   http://stylecut.localhost:3001/api/config/branding
   ```

   Debería retornar datos de la tienda Style&Cut (si ya ejecutaste el seed).

---

## 🔧 Configuración Alternativa: Usar Headers

Si no quieres editar el archivo hosts, puedes usar el header `X-Tenant-Domain` para probar:

### Con curl:

```bash
curl http://localhost:3001/api/config/branding \
  -H "X-Tenant-Domain: stylecut"
```

### Con Postman/Insomnia:

1. URL: `http://localhost:3001/api/config/branding`
2. Agregar header:
   - Key: `X-Tenant-Domain`
   - Value: `stylecut`

### En el código frontend:

```typescript
fetch('http://localhost:3001/api/config/branding', {
  headers: {
    'X-Tenant-Domain': 'stylecut'
  }
})
```

---

## 🌐 Frontend: Configurar Next.js para Multitenancy

Si tu frontend (QRs) también necesita manejar subdominios, configura:

### `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite para manejar subdominios en desarrollo
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<tenant>.*)\\.localhost',
            },
          ],
          destination: '/:path*',
        },
      ],
    }
  },
}

module.exports = nextConfig
```

### Obtener el tenant en el código:

```typescript
// app/page.tsx
export default function Home() {
  const hostname = typeof window !== 'undefined'
    ? window.location.hostname
    : '';

  const tenant = hostname.split('.')[0]; // "stylecut" de "stylecut.localhost"

  console.log('Tenant actual:', tenant);

  return <div>Tienda: {tenant}</div>
}
```

---

## 📝 Script de PowerShell para Windows (Automático)

Guarda esto como `setup-hosts.ps1` y ejecútalo como Administrador:

```powershell
# Requiere ejecutarse como Administrador
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "Este script debe ejecutarse como Administrador!"
    exit
}

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$tenants = @(
    "lokeyokiera",
    "stylecut",
    "urbancut",
    "bellaskin",
    "perfectnails",
    "aquarelax",
    "visionplus",
    "elrincon",
    "dolcefrio",
    "laparrilla",
    "donnapoli",
    "burgerco",
    "huellafeliz",
    "doggystyle",
    "vetcare",
    "mundopeques",
    "cuentosmas",
    "pequelook",
    "fitzone",
    "fisioplus",
    "nutrishop"
)

Write-Host "🌐 Configurando tenants en archivo hosts..." -ForegroundColor Green

$hostsContent = Get-Content $hostsPath -Raw

# Verificar si ya existe la sección
if ($hostsContent -notmatch "# Qronnect - Tenants Locales") {
    # Agregar sección
    $newEntries = "`n`n# ===================================`n"
    $newEntries += "# Qronnect - Tenants Locales`n"
    $newEntries += "# ===================================`n"

    foreach ($tenant in $tenants) {
        $newEntries += "127.0.0.1    $tenant.localhost`n"
    }

    Add-Content -Path $hostsPath -Value $newEntries
    Write-Host "✅ Tenants agregados exitosamente!" -ForegroundColor Green
    Write-Host "Total: $($tenants.Count) tenants configurados" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  La configuración ya existe en el archivo hosts" -ForegroundColor Yellow
}

Write-Host "`n🧪 Prueba con: http://lokeyokiera.localhost:3001" -ForegroundColor Cyan
```

**Ejecutar:**
```powershell
# Como Administrador
.\setup-hosts.ps1
```

---

## 🗑️ Limpiar configuración (Opcional)

Si quieres eliminar las entradas del archivo hosts:

### Windows:

1. Abre el archivo hosts como Administrador
2. Elimina las líneas entre `# Qronnect - Tenants Locales` y el final de esa sección
3. Guarda

### Linux/Mac:

```bash
sudo nano /etc/hosts
# Eliminar las líneas
# Guardar con Ctrl+O, Enter, Ctrl+X
```

---

## ⚠️ Troubleshooting

### El navegador no encuentra el dominio

1. **Verifica el archivo hosts**:
   ```bash
   # Windows
   type C:\Windows\System32\drivers\etc\hosts

   # Linux/Mac
   cat /etc/hosts
   ```

2. **Limpia caché DNS**:
   ```bash
   # Windows (como Admin)
   ipconfig /flushdns

   # Mac
   sudo dscacheutil -flushcache

   # Linux
   sudo systemctl restart systemd-resolved
   ```

3. **Reinicia el navegador completamente**

4. **Prueba en modo incógnito** (evita problemas de caché)

### El backend no reconoce el tenant

Verifica que el tenant resolver esté configurado en el backend:

```typescript
// src/tenant/tenant.middleware.ts o similar
// Debe extraer el tenant del hostname o del header X-Tenant-Domain
```

### Errores de CORS

Si usas subdominios diferentes entre frontend y backend, agrega la configuración CORS:

```typescript
// main.ts
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://stylecut.localhost:3000',
    'http://urbancut.localhost:3000',
    // ... más tenants
  ],
  credentials: true,
});
```

O usa un wildcard en desarrollo:

```typescript
app.enableCors({
  origin: /\.localhost(:\d+)?$/,
  credentials: true,
});
```

---

## 📚 Recursos Adicionales

- **Tenant Resolver**: `src/tenant/` (revisa cómo se extrae el tenant)
- **Multitenancy docs**: `backend/MULTITENANCY.md`
- **Database schema**: `backend/database/schema.sql`

---

## ✅ Checklist

- [ ] Archivo hosts editado con las 19 tiendas
- [ ] Caché DNS limpiado
- [ ] Backend corriendo (`npm run start:dev`)
- [ ] Probado `http://lokeyokiera.localhost:3001/api/config/branding`
- [ ] Probado otro tenant (ej: `stylecut.localhost`)
- [ ] Frontend configurado para subdominios (si aplica)

---

¡Listo! Ahora puedes acceder a cada tienda usando su subdominio local 🎉
