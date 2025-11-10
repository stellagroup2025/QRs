# ⚡ Comandos Rápidos - Qronnect

Guía rápida de todos los comandos que necesitas.

---

## 🔧 **BACKEND** (NestJS + Supabase)

### Ubicación
```powershell
cd C:\Users\Omar\Documents\Qronnect\backend
```

### Primera vez (Setup)
```powershell
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
Copy-Item .env.example .env
notepad .env  # Editar con credenciales de Supabase

# 3. Ejecutar schema SQL en Supabase
# Ir a: https://supabase.com/dashboard → SQL Editor
# Copiar y ejecutar: database/schema.sql
```

### Comandos de Desarrollo
```powershell
# Ejecutar en modo desarrollo (con hot-reload)
npm run start:dev

# Compilar a producción
npm run build

# Ejecutar versión de producción
npm run start:prod

# Linting
npm run lint

# Tests
npm run test
```

### Endpoints Importantes
- **API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api

---

## 🎨 **FRONTEND** (Next.js)

### Ubicación
```powershell
cd C:\Users\Omar\Documents\Qronnect\QRs
```

### Primera vez (Setup)
```powershell
# 1. Instalar dependencias
npm install --legacy-peer-deps

# 2. Personalizar tienda
notepad config\commerce.ts    # Configuración general
notepad config\appBrand.ts    # Branding y colores

# 3. Cambiar logo (opcional)
# Reemplazar: public/logo.jpg
```

### Comandos de Desarrollo
```powershell
# Ejecutar en modo desarrollo
npm run dev

# Compilar a producción
npm run build

# Ejecutar versión de producción
npm run start

# Linting
npm run lint
```

### URLs Importantes
- **App**: http://localhost:3000 (o 3001 si el backend usa 3000)
- **Registro**: http://localhost:3000/registro
- **Panel Admin**: http://localhost:3000/staff
- **Mi QR**: http://localhost:3000/mi-qr

---

## 🚀 **Ejecutar TODO el Proyecto**

### Opción 1: Dos Terminales PowerShell

**Terminal 1 - Backend:**
```powershell
cd C:\Users\Omar\Documents\Qronnect\backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```powershell
cd C:\Users\Omar\Documents\Qronnect\QRs
npm run dev
```

---

### Opción 2: Script de Inicio Rápido

Crea este archivo: `C:\Users\Omar\Documents\Qronnect\start.ps1`

```powershell
# start.ps1
Write-Host "🚀 Iniciando Qronnect..." -ForegroundColor Green

# Iniciar Backend en una nueva ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\Omar\Documents\Qronnect\backend; npm run start:dev"

# Esperar 5 segundos
Start-Sleep -Seconds 5

# Iniciar Frontend en otra ventana
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\Omar\Documents\Qronnect\QRs; npm run dev"

Write-Host "✅ Backend y Frontend iniciados!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3000/api" -ForegroundColor Cyan
Write-Host "Frontend: Verifica la terminal del frontend para la URL" -ForegroundColor Cyan
```

**Ejecutar:**
```powershell
# Desde C:\Users\Omar\Documents\Qronnect
.\start.ps1
```

---

## 🗄️ **Base de Datos (Supabase)**

### Setup Inicial
```sql
-- 1. Crear proyecto en https://supabase.com
-- 2. Ir a SQL Editor
-- 3. Ejecutar el contenido de: backend/database/schema.sql
```

### Crear Nueva Tienda
```sql
INSERT INTO tiendas (nombre, dominio, plan, configuracion)
VALUES (
  'Mi Tienda',
  'mi-tienda',  -- Acceso: mi-tienda.qronnect.com
  'profesional',
  '{"puntos_por_euro": 1}'::jsonb
);
```

### Asignar Admin a Tienda
```sql
-- El usuario debe hacer login primero con Supabase Auth
-- Luego ejecutar:

INSERT INTO roles_tienda (supabase_user_id, id_tienda, rol)
VALUES (
  'uuid-del-usuario',
  (SELECT id FROM tiendas WHERE dominio = 'mi-tienda'),
  'admin'
);
```

### Ver Datos
```sql
-- Ver todas las tiendas
SELECT * FROM tiendas;

-- Ver clientes de una tienda
SELECT * FROM clientes WHERE id_tienda = 'uuid-de-la-tienda';

-- Ver compras recientes
SELECT * FROM compras ORDER BY fecha DESC LIMIT 10;

-- Dashboard de una tienda
SELECT * FROM vista_dashboard_tienda WHERE id_tienda = 'uuid-de-la-tienda';
```

---

## 🔧 **Troubleshooting Rápido**

### Backend no arranca

```powershell
# Verificar que .env existe
Test-Path backend\.env

# Verificar puerto libre
netstat -ano | findstr :3000

# Reinstalar dependencias
cd backend
Remove-Item -Recurse -Force node_modules
npm install
```

---

### Frontend no arranca

```powershell
# Verificar que backend está corriendo
Invoke-WebRequest http://localhost:3000/api

# Reinstalar dependencias
cd QRs
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install --legacy-peer-deps
```

---

### Puerto 3000 ocupado

```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplazar PID)
taskkill /PID <numero> /F

# O cambiar puerto del backend en .env
# PORT=3001
```

---

### Limpiar y Reinstalar TODO

```powershell
# BACKEND
cd C:\Users\Omar\Documents\Qronnect\backend
Remove-Item -Recurse -Force node_modules, package-lock.json, dist
npm install
npm run build

# FRONTEND
cd C:\Users\Omar\Documents\Qronnect\QRs
Remove-Item -Recurse -Force node_modules, package-lock.json, .next
npm install --legacy-peer-deps
```

---

## 📊 **Verificar que Todo Funciona**

### 1. Backend
```powershell
# Health check
Invoke-WebRequest http://localhost:3000/api

# Ver Swagger
start http://localhost:3000/api/docs
```

### 2. Frontend
```powershell
# Abrir en navegador
start http://localhost:3000
```

### 3. Supabase
```powershell
# Verificar que las tablas existen
# Ir a: https://supabase.com/dashboard → Table Editor
# Deberías ver: tiendas, clientes, compras, qr_clientes, etc.
```

---

## 🎯 **Flujo de Prueba Completo**

1. **Crear una tienda en Supabase** (SQL arriba)
2. **Ejecutar Backend** → `npm run start:dev`
3. **Ejecutar Frontend** → `npm run dev`
4. **Registrar un cliente** → http://localhost:3000/registro
5. **Ver QR del cliente** → http://localhost:3000/mi-qr
6. **Acceder al panel admin** → http://localhost:3000/staff (PIN: 1234)
7. **Escanear QR y registrar compra**
8. **Verificar puntos** → http://localhost:3000/mi-cuenta

---

## 📚 **Documentación**

| Archivo | Descripción |
|---------|-------------|
| `backend/README.md` | Documentación completa del backend |
| `backend/SETUP_GUIDE.md` | Guía de instalación paso a paso |
| `backend/API_REFERENCE.md` | Referencia de todos los endpoints |
| `backend/MULTITENANCY.md` | Arquitectura multitenancy |
| `backend/START.md` | Guía rápida de inicio (backend) |
| `QRs/README.md` | Documentación del frontend |
| `QRs/PERSONALIZACION.md` | Cómo personalizar tu tienda |
| `QRs/START.md` | Guía rápida de inicio (frontend) |

---

## 🆘 **Ayuda Rápida**

```powershell
# Ver todos los comandos disponibles
cd backend
npm run

cd ..\QRs
npm run

# Ver versiones instaladas
node --version
npm --version

# Ver logs del backend (si está corriendo)
# Los logs se muestran en la terminal donde ejecutaste start:dev

# Ver logs del frontend
# Los logs se muestran en la terminal donde ejecutaste npm run dev
# Además, abre F12 en el navegador para ver errores del cliente
```

---

## ✅ **Checklist de Inicio Rápido**

### Primera Vez

- [ ] Node.js instalado (v18+)
- [ ] Cuenta de Supabase creada
- [ ] Proyecto de Supabase creado
- [ ] Schema SQL ejecutado en Supabase
- [ ] Backend: `npm install` completado
- [ ] Backend: `.env` configurado
- [ ] Frontend: `npm install --legacy-peer-deps` completado
- [ ] Frontend: Tienda personalizada en `config/`

### Cada Vez que Trabajes

- [ ] Terminal 1: `cd backend && npm run start:dev`
- [ ] Terminal 2: `cd QRs && npm run dev`
- [ ] Verificar: http://localhost:3000/api (backend)
- [ ] Verificar: http://localhost:3000 (frontend)

---

¡Listo para desarrollar! 🚀
