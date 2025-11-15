# 🚀 Cómo Ejecutar el Backend de Qronnect

## ⚡ Inicio Rápido

```powershell
# 1. Configurar .env (solo la primera vez)
Copy-Item .env.example .env
notepad .env  # Editar con tus credenciales de Supabase

# 2. Ejecutar en modo desarrollo
npm run start:dev
```

## 📋 Checklist Antes del Primer Arranque

### ✅ 1. Supabase Configurado

- [ ] Proyecto creado en https://supabase.com
- [ ] Schema SQL ejecutado (`database/schema.sql`)
- [ ] Credenciales copiadas (URL, ANON_KEY, SERVICE_ROLE_KEY)

### ✅ 2. Variables de Entorno

Edita el archivo `.env`:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### ✅ 3. Dependencias Instaladas

```powershell
npm install
```

## 🎯 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | **Desarrollo** con hot-reload (recomendado) |
| `npm run build` | Compilar a producción |
| `npm run start:prod` | Ejecutar versión compilada |
| `npm run lint` | Verificar código con ESLint |
| `npm run test` | Ejecutar tests |

## 🔍 Verificar que Funciona

### 1. Health Check

```powershell
# En PowerShell (mientras el servidor corre)
Invoke-WebRequest http://localhost:3000/api
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "message": "Qronnect API is running",
  "timestamp": "2025-11-09T18:30:00.000Z"
}
```

### 2. Swagger UI

Abre en tu navegador:
```
http://localhost:3000/api/docs
```

Deberías ver la documentación interactiva de la API.

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

**Solución:** Verifica que `.env` existe y tiene las 3 variables de Supabase.

```powershell
# Verificar que .env existe
Test-Path .env

# Ver contenido (sin mostrar claves)
Get-Content .env | Select-String "SUPABASE_URL"
```

---

### Error: Puerto 3000 ya está en uso

**Solución 1:** Cambiar puerto en `.env`
```env
PORT=3001
```

**Solución 2:** Matar el proceso que usa el puerto
```powershell
# Ver qué está usando el puerto 3000
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID <numero> /F
```

---

### Error: Cannot find module 'xxx'

**Solución:** Reinstalar dependencias
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

---

### Warnings de "Unsupported engine"

**Es normal.** Las librerías de Supabase recomiendan Node 20+, pero funcionan con Node 18. Puedes ignorar estos warnings o actualizar Node.js:

```powershell
# Verificar versión actual
node --version

# Para actualizar a Node 20 (recomendado):
# 1. Descargar desde https://nodejs.org/
# 2. Instalar versión LTS (20.x)
# 3. Reiniciar PowerShell
```

---

## 📚 Recursos

- **Documentación completa:** `README.md`
- **Guía de setup:** `SETUP_GUIDE.md`
- **API Reference:** `API_REFERENCE.md`
- **Multitenancy:** `MULTITENANCY.md`

## 🎉 ¡Listo!

Si ves este mensaje, todo está funcionando:

```
🚀 Qronnect Backend is running!
📝 API: http://localhost:3000/api
📚 Swagger Docs: http://localhost:3000/api/docs
```

**Siguiente paso:** Configurar el frontend en `../QRs/`
