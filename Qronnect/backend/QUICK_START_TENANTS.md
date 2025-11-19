# ⚡ Quick Start: Tenants en 3 Pasos

## 🎯 Objetivo
Configurar los subdominios locales para que puedas acceder a cada tienda demo usando URLs como `stylecut.localhost:3001`

---

## 📝 Paso 1: Ejecutar el Script PowerShell (Windows) ⭐

### Opción Automática (Recomendada):

1. **Abre PowerShell como Administrador**
   - Presiona `Win + X`
   - Selecciona **"Windows PowerShell (Admin)"** o **"Terminal (Admin)"**

2. **Navega a la carpeta del backend**
   ```powershell
   cd C:\Users\Omar\Documents\Qrs\Qronnect\backend
   ```

3. **Ejecuta el script**
   ```powershell
   .\setup-hosts-windows.ps1
   ```

4. **¡Listo!** El script configurará automáticamente:
   - ✅ 19 tenants en tu archivo hosts
   - ✅ Backup de seguridad del archivo hosts original
   - ✅ Limpieza de caché DNS

---

## 📝 Paso 2: Aplicar el Seed de Tiendas

Si aún no has creado las tiendas de ejemplo, ejecuta el seed:

### Opción A: SQL Directo (Recomendado)

1. Abre Supabase SQL Editor
2. Copia el contenido de `database/seed-tiendas-ejemplo.sql`
3. Pégalo y ejecuta

### Opción B: Script TypeScript

```bash
cd backend
npx ts-node apply-seed-tiendas.ts
```

---

## 📝 Paso 3: Probar los Tenants

1. **Inicia el backend** (si no está corriendo):
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Abre tu navegador** y prueba:

   ```
   http://lokeyokiera.localhost:3001/api/config/branding
   ```

   Deberías ver algo como:
   ```json
   {
     "logo_url": "...",
     "color_primario": "#FF1493",
     "color_secundario": "#8B008B",
     "nombre_comercial": "Perfumería Lokeyokiera Premium"
   }
   ```

3. **Prueba otra tienda**:
   ```
   http://stylecut.localhost:3001/api/config/branding
   ```

   Si el seed fue aplicado, verás los datos de Style&Cut.

---

## 🎨 URLs de Todas las Tiendas

Una vez configurado, puedes acceder a:

### Belleza & Bienestar
- http://stylecut.localhost:3001
- http://urbancut.localhost:3001
- http://bellaskin.localhost:3001
- http://perfectnails.localhost:3001
- http://aquarelax.localhost:3001
- http://visionplus.localhost:3001

### Foodie & Restauración
- http://elrincon.localhost:3001
- http://dolcefrio.localhost:3001
- http://laparrilla.localhost:3001
- http://donnapoli.localhost:3001
- http://burgerco.localhost:3001

### Mascotas
- http://huellafeliz.localhost:3001
- http://doggystyle.localhost:3001
- http://vetcare.localhost:3001

### Infantil & Familia
- http://mundopeques.localhost:3001
- http://cuentosmas.localhost:3001
- http://pequelook.localhost:3001

### Salud & Deporte
- http://fitzone.localhost:3001
- http://fisioplus.localhost:3001
- http://nutrishop.localhost:3001

---

## 🧪 Verificación Rápida

### Test con curl:

```bash
# Test básico
curl http://stylecut.localhost:3001/api/config/branding

# Test con header (alternativa sin editar hosts)
curl http://localhost:3001/api/config/branding -H "X-Tenant-Domain: stylecut"
```

### Test con ping:

```bash
ping stylecut.localhost
```

Deberías ver:
```
Respuesta desde 127.0.0.1: bytes=32 tiempo<1ms TTL=128
```

---

## ⚠️ Troubleshooting Rápido

### ❌ El navegador dice "No se puede acceder"

**Solución:**
1. Verifica que ejecutaste el script PowerShell **como Administrador**
2. Limpia caché DNS:
   ```powershell
   ipconfig /flushdns
   ```
3. Reinicia el navegador completamente
4. Prueba en modo incógnito

---

### ❌ El endpoint retorna 404 "Tienda no encontrada"

**Solución:**
1. Verifica que aplicaste el seed:
   ```bash
   npx ts-node apply-seed-tiendas.ts
   ```
2. Verifica que la tienda existe:
   ```sql
   SELECT nombre, dominio FROM tiendas WHERE dominio = 'stylecut';
   ```

---

### ❌ "Cannot GET /api/config/branding"

**Solución:**
1. Verifica que el backend esté corriendo:
   ```bash
   npm run start:dev
   ```
2. Verifica que el puerto sea 3001:
   ```
   http://stylecut.localhost:3001/api/config/branding
                              ^^^^
                              No olvides el puerto!
   ```

---

## 🔄 Alternativa: Sin Editar Hosts

Si no quieres editar el archivo hosts, usa el header `X-Tenant-Domain`:

### Frontend (Next.js):

```typescript
const response = await fetch('http://localhost:3001/api/config/branding', {
  headers: {
    'X-Tenant-Domain': 'stylecut'
  }
});
```

### Postman/Insomnia:

- URL: `http://localhost:3001/api/config/branding`
- Header: `X-Tenant-Domain: stylecut`

---

## 📚 Documentación Completa

Para más detalles, consulta:

- **Configuración detallada**: `CONFIGURAR_TENANTS_LOCAL.md`
- **Seed de tiendas**: `SEED_TIENDAS_EJEMPLO.md`
- **Resumen de tiendas**: `TIENDAS_DEMO_RESUMEN.md`

---

## ✅ Checklist Final

- [ ] Script PowerShell ejecutado como Administrador
- [ ] Seed de tiendas aplicado
- [ ] Backend corriendo en puerto 3001
- [ ] Probado `http://lokeyokiera.localhost:3001/api/config/branding`
- [ ] Probado otro tenant (ej: `stylecut`)
- [ ] Navegador reiniciado si fue necesario

---

¡Ya estás listo para trabajar con multitenancy! 🎉
