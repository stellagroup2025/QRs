# 🏪 Qronnect - Sistema de Fidelización con QR

Sistema completo de fidelización para tiendas físicas con códigos QR. Incluye app para clientes y panel de administración.

## 🎯 ¿Qué es Qronnect?

Un sistema **SaaS multitenancy** que permite a comercios implementar programas de fidelización mediante códigos QR:

- ✅ **Para clientes**: App para acumular puntos y canjear recompensas
- ✅ **Para tiendas**: Panel de administración para gestionar clientes y compras
- ✅ **Multitenancy**: Múltiples tiendas en la misma plataforma
- ✅ **QR único por cliente**: Identificación rápida y segura
- ✅ **Configurable**: Cada tienda tiene su propia configuración

---

## 📂 Estructura del Proyecto

```
Qronnect/
│
├── backend/                  # Backend NestJS + Supabase
│   ├── src/                 # Código fuente
│   ├── database/            # Schema SQL
│   ├── .env.example         # Plantilla de configuración
│   ├── README.md            # Documentación del backend
│   ├── MULTITENANCY.md      # Arquitectura multitenancy
│   └── START.md             # Guía de inicio rápido
│
├── QRs/                     # Frontend Next.js
│   ├── app/                # Páginas (Next.js App Router)
│   ├── components/         # Componentes React
│   ├── config/             # 🔥 Configuración de tienda
│   ├── public/             # Assets (logo, imágenes)
│   └── START.md            # Guía de inicio rápido
│
├── start.ps1               # 🚀 Script de inicio automático
├── COMANDOS.md             # Referencia rápida de comandos
└── README.md               # Este archivo
```

---

## ⚡ Inicio Rápido

### **Opción 1: Script Automático** (Recomendado)

```powershell
# Desde PowerShell en C:\Users\Omar\Documents\Qronnect
.\start.ps1
```

Este script:
1. ✅ Verifica dependencias
2. ✅ Instala lo que falta
3. ✅ Inicia Backend y Frontend automáticamente
4. ✅ Abre el navegador

---

### **Opción 2: Manual**

**Terminal 1 - Backend:**
```powershell
cd backend
npm install
Copy-Item .env.example .env
notepad .env  # Configurar Supabase
npm run start:dev
```

**Terminal 2 - Frontend:**
```powershell
cd QRs
npm install --legacy-peer-deps
npm run dev
```

---

## 📋 Requisitos Previos

### Software

- ✅ **Node.js 18+** (recomendado: 20+)
  - Descargar: https://nodejs.org/
  - Verificar: `node --version`

- ✅ **npm** (incluido con Node.js)
  - Verificar: `npm --version`

- ✅ **PowerShell** (incluido en Windows)

### Servicios en la Nube

- ✅ **Cuenta de Supabase** (gratuita)
  - Crear en: https://supabase.com
  - Necesitarás: URL, ANON_KEY, SERVICE_ROLE_KEY

---

## 🔧 Configuración Inicial

### 1. Configurar Supabase

1. **Crear proyecto** en https://supabase.com
2. **Ejecutar schema SQL**:
   - Ir a SQL Editor
   - Copiar contenido de `backend/database/schema.sql`
   - Ejecutar
3. **Copiar credenciales**:
   - Settings → API
   - Copiar: URL, anon key, service_role key

### 2. Configurar Backend

```powershell
cd backend
Copy-Item .env.example .env
notepad .env
```

Completar con tus credenciales:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Personalizar Frontend

```powershell
cd QRs
notepad config\commerce.ts
```

Editar:
```typescript
export const COMMERCE_CONFIG = {
  nombre: "Tu Tienda",
  slug: "tu-tienda",
  // ... más opciones
}
```

---

## 🚀 Ejecutar el Proyecto

### Desarrollo

```powershell
# Opción fácil: Script automático
.\start.ps1

# O manualmente:
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd QRs && npm run dev
```

### Producción

```powershell
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd QRs
npm run build
npm run start
```

---

## 📍 URLs Importantes

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Backend API** | http://localhost:3000/api | API REST |
| **Swagger Docs** | http://localhost:3000/api/docs | Documentación interactiva |
| **Frontend App** | http://localhost:3000 | App principal |
| **Panel Admin** | http://localhost:3000/staff | Panel de tienda (PIN: 1234) |

---

## 🏗️ Tecnologías

### Backend
- **NestJS** - Framework de Node.js
- **TypeScript** - Type safety
- **Supabase** - Base de datos Postgres + Auth
- **Swagger** - Documentación de API

### Frontend
- **Next.js 15** - Framework de React
- **React 18** - UI Library
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Zustand** - State management

---

## 🏪 Arquitectura Multitenancy

Cada tienda tiene:
- ✅ **Dominio único**: `mi-tienda.qronnect.com`
- ✅ **Datos aislados**: Clientes, compras, configuración
- ✅ **Configuración personalizada**: Puntos, descuentos, branding

**Ver documentación completa:** `backend/MULTITENANCY.md`

---

## 📱 Funcionalidades

### Para Clientes Finales

- ✅ Registro con email
- ✅ Código QR personal único
- ✅ Acumulación de puntos por compra
- ✅ Visualización de puntos y progreso
- ✅ Historial de compras
- ✅ Canjes de premios

### Para Personal de Tienda

- ✅ Panel de administración (PIN protegido)
- ✅ Escáner de QR en tiempo real
- ✅ Registro de compras
- ✅ Gestión de clientes
- ✅ Dashboard con métricas
- ✅ Gestión de promociones
- ✅ Reportes y estadísticas

---

## 📚 Documentación Completa

### Backend
- [`backend/README.md`](backend/README.md) - Documentación general
- [`backend/SETUP_GUIDE.md`](backend/SETUP_GUIDE.md) - Guía de instalación
- [`backend/API_REFERENCE.md`](backend/API_REFERENCE.md) - Referencia de API
- [`backend/MULTITENANCY.md`](backend/MULTITENANCY.md) - Arquitectura multitenancy
- [`backend/START.md`](backend/START.md) - Inicio rápido

### Frontend
- [`QRs/README.md`](QRs/README.md) - Documentación general
- [`QRs/PERSONALIZACION.md`](QRs/PERSONALIZACION.md) - Personalización
- [`QRs/BRAND_GUIDE.md`](QRs/BRAND_GUIDE.md) - Guía de branding
- [`QRs/START.md`](QRs/START.md) - Inicio rápido

### General
- [`COMANDOS.md`](COMANDOS.md) - ⭐ Referencia rápida de comandos
- [`start.ps1`](start.ps1) - Script de inicio automático

---

## 🎯 Flujo de Uso Típico

### 1. Cliente se Registra
```
Cliente → Abre app → Registro (/registro)
        → Ingresa email y datos
        → Obtiene QR único
```

### 2. Cliente Acumula Puntos
```
Cliente → Compra en tienda
        → Muestra QR al staff
Staff   → Escanea QR desde panel (/staff)
        → Registra compra + monto
        → Sistema otorga puntos automáticamente
Cliente → Ve puntos actualizados en app
```

### 3. Cliente Canjea Recompensa
```
Cliente → Acumula puntos suficientes
        → Va a tienda
        → Muestra QR
Staff   → Escanea QR
        → Aplica canje/descuento
        → Puntos se deducen
```

---

## 🔐 Seguridad

- ✅ **JWT Authentication** (Supabase Auth)
- ✅ **Row Level Security** (RLS en Postgres)
- ✅ **PIN de acceso** al panel de admin
- ✅ **Guards de autorización** (NestJS)
- ✅ **Validación de datos** (class-validator, Zod)
- ✅ **HTTPS** en producción (Vercel/Railway)

---

## 🐛 Troubleshooting

### Backend no arranca

```powershell
# Verificar .env
Test-Path backend\.env
Get-Content backend\.env

# Reinstalar dependencias
cd backend
Remove-Item -Recurse -Force node_modules
npm install
```

### Frontend no arranca

```powershell
# Verificar que backend esté corriendo
Invoke-WebRequest http://localhost:3000/api

# Reinstalar dependencias
cd QRs
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install --legacy-peer-deps
```

### Puerto ocupado

```powershell
# Ver qué usa el puerto 3000
netstat -ano | findstr :3000

# Matar proceso
taskkill /PID <numero> /F
```

**Más soluciones:** Ver `COMANDOS.md`

---

## 📊 Modelo de Datos

```
tiendas (comercios que usan el sistema)
  ├── id (UUID)
  ├── nombre
  ├── dominio (único)
  ├── configuracion (JSONB)
  └── ...

clientes (clientes finales)
  ├── id (UUID)
  ├── supabase_user_id (auth)
  ├── id_tienda (FK)
  ├── puntos_totales
  └── ...

qr_clientes (códigos QR)
  ├── id (UUID)
  ├── id_cliente (FK)
  ├── codigo (único)
  └── ...

compras (transacciones)
  ├── id (UUID)
  ├── id_cliente (FK)
  ├── id_tienda (FK)
  ├── importe
  ├── puntos_otorgados
  └── ...
```

---

## 🚢 Despliegue

### Backend (Railway/Render)

```bash
# 1. Conectar repositorio
# 2. Variables de entorno: copiar .env
# 3. Build command: npm run build
# 4. Start command: npm run start:prod
```

### Frontend (Vercel)

```bash
# 1. Importar repositorio
# 2. Root directory: QRs
# 3. Build command: npm run build
# 4. Variables: NEXT_PUBLIC_API_URL
```

---

## 📈 Roadmap

- [ ] App móvil (React Native)
- [ ] Notificaciones push
- [ ] Programa de referidos
- [ ] Analytics avanzado
- [ ] Integración con sistemas POS
- [ ] Multi-idioma
- [ ] Temas personalizables

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📝 Licencia

MIT

---

## 🆘 Soporte

- **Documentación**: Ver archivos README en cada carpeta
- **Comandos**: `COMANDOS.md`
- **Issues**: Abre un issue en el repositorio

---

## ✅ Checklist de Inicio

- [ ] Node.js instalado (v18+)
- [ ] Cuenta de Supabase creada
- [ ] Proyecto de Supabase creado
- [ ] Schema SQL ejecutado en Supabase
- [ ] Backend: dependencias instaladas (`npm install`)
- [ ] Backend: `.env` configurado
- [ ] Frontend: dependencias instaladas (`npm install --legacy-peer-deps`)
- [ ] Frontend: tienda personalizada (`config/commerce.ts`)
- [ ] Backend ejecutándose (`npm run start:dev`)
- [ ] Frontend ejecutándose (`npm run dev`)
- [ ] http://localhost:3000/api responde ✅
- [ ] http://localhost:3000 carga la app ✅

---

## 🎉 ¡Listo!

Si llegaste aquí, deberías tener Qronnect funcionando.

**Próximos pasos:**
1. Personaliza tu tienda en `QRs/config/`
2. Prueba el flujo completo (registro → QR → compra)
3. Explora el panel de admin (`/staff`)
4. Lee la documentación completa para aprovechar todas las funciones

---

**¡Feliz desarrollo!** 🚀
