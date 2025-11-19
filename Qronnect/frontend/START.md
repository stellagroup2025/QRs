# 🚀 Cómo Ejecutar el Frontend de Qronnect

## ⚡ Inicio Rápido

```powershell
# 1. Instalar dependencias (solo la primera vez)
npm install --legacy-peer-deps

# 2. Ejecutar en modo desarrollo
npm run dev
```

## 📋 Antes de Empezar

### ✅ 1. Backend Debe Estar Ejecutándose

El frontend necesita conectarse al backend:

```powershell
# En otra terminal PowerShell
cd C:\Users\Omar\Documents\Qronnect\backend
npm run start:dev
```

Verifica que el backend esté en: http://localhost:3000/api

### ✅ 2. Configurar URL del Backend (si es necesario)

Si el backend NO está en `localhost:3000`, crea un archivo `.env.local`:

```env
# QRs/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🎯 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | **Desarrollo** con hot-reload (recomendado) |
| `npm run build` | Compilar para producción |
| `npm run start` | Ejecutar versión compilada |
| `npm run lint` | Verificar código con ESLint |

## 🔍 Verificar que Funciona

### Abrir en el Navegador

```
http://localhost:3000
```

**Deberías ver:**
- Página de inicio de tu comercio
- Sistema de fidelización con QR
- Formulario de registro de clientes

## 🏪 Configuración de Tienda

### Personalizar tu Tienda

Edita el archivo de configuración:

```powershell
notepad config\commerce.ts
```

**Personaliza:**
```typescript
export const COMMERCE_CONFIG = {
  nombre: "Tu Tienda",
  slug: "tu-tienda",
  ciudad: "Tu Ciudad",
  logoUrl: "/logo.jpg",

  colores: {
    primary: "#8B4513",    // Color principal
    secondary: "#FFA500",  // Color secundario
  },

  programas: {
    sellos: {
      activo: true,
      requisito: 10,  // Número de sellos para canjear
    },
    descuento: {
      activo: true,
      porcentaje: 10,  // % de descuento
    }
  },

  // ... más opciones en el archivo
}
```

### Cambiar Logo

1. Reemplaza `/public/logo.jpg` con tu logo
2. Mantén el nombre `logo.jpg` o actualiza `logoUrl` en `config/commerce.ts`

### Cambiar Colores y Branding

Edita `config/appBrand.ts`:

```typescript
export const BRAND = {
  palette: {
    primary: "#8B4513",      // Marrón (cafetería)
    primaryFg: "#FFFFFF",    // Blanco
    // ... más colores
  },

  copy: {
    companyName: "Tu Tienda",
    tagline: "Tu eslogan aquí",
    // ...
  }
}
```

## 🐛 Troubleshooting

### Error: "ECONNREFUSED localhost:3000"

**Problema:** El frontend no puede conectarse al backend.

**Solución:**
1. Verifica que el backend esté ejecutándose
2. Verifica la URL en la configuración

```powershell
# En otra terminal
cd ..\backend
npm run start:dev
```

---

### Error: Cannot find module 'next'

**Solución:** Reinstalar dependencias

```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install --legacy-peer-deps
```

---

### Error: Puerto 3000 ya en uso

El puerto por defecto de Next.js es 3000. Si el backend ya lo usa, Next.js automáticamente usará el siguiente disponible (3001, 3002...).

**O puedes especificar un puerto:**

```powershell
# Ejecutar en puerto 3001
$env:PORT=3001; npm run dev
```

---

### La página se ve rota / sin estilos

**Solución:** Verificar que Tailwind CSS esté funcionando

```powershell
# Verificar que estos archivos existen
Test-Path tailwind.config.js
Test-Path postcss.config.js

# Si no existen, reinstalar:
npm install --legacy-peer-deps
```

---

### Cambios en config/ no se reflejan

**Solución:** Reiniciar el servidor de desarrollo

```powershell
# Presiona Ctrl+C para detener
# Luego ejecuta de nuevo:
npm run dev
```

---

## 🎨 Estructura del Proyecto

```
QRs/
├── app/                    # Páginas de Next.js (App Router)
│   ├── page.tsx           # Página de inicio
│   ├── registro/          # Registro de clientes
│   ├── mi-qr/            # Ver QR personal
│   ├── staff/            # Panel de administración
│   └── ...
│
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn)
│   ├── staff/            # Componentes del panel
│   └── ...
│
├── config/               # 🔥 Configuración personalizable
│   ├── commerce.ts       # Config de tu tienda
│   └── appBrand.ts       # Branding y colores
│
├── lib/                  # Utilidades
├── stores/              # Estado global (Zustand)
├── types/               # Tipos TypeScript
└── public/              # Assets estáticos (logo, imágenes)
```

## 📱 Rutas Principales

| Ruta | Descripción |
|------|-------------|
| `/` | Página de inicio |
| `/registro` | Registro de nuevos clientes |
| `/get-qr` | Obtener QR existente |
| `/mi-qr` | Ver mi código QR |
| `/mi-cuenta` | Cuenta y puntos del cliente |
| `/staff` | Panel de administración (requiere PIN) |

## 🔐 Panel de Administración

### Acceder al Panel

1. Ir a: http://localhost:3000/staff
2. Ingresar el PIN de admin (configurado en `config/commerce.ts`)
3. Por defecto: `1234` (admin) o `5678` (comercial)

**⚠️ IMPORTANTE:** Cambia estos PINs en producción!

```typescript
// config/commerce.ts
pins: {
  admin: "tu-pin-secreto-admin",
  comercial: "tu-pin-secreto-staff",
}
```

### Funciones del Panel

- **Escanear QR**: Leer código QR de clientes
- **Registrar Compras**: Añadir sellos/puntos
- **Ver Clientes**: Lista de todos los clientes
- **Gestionar Promociones**: Crear y editar ofertas
- **Dashboard**: Métricas y estadísticas

## 🎉 ¡Listo!

Si ves la página de inicio de tu tienda, ¡todo está funcionando!

**Próximos pasos:**

1. ✅ Personaliza tu tienda en `config/commerce.ts`
2. ✅ Cambia el logo en `/public/logo.jpg`
3. ✅ Ajusta colores en `config/appBrand.ts`
4. ✅ Prueba el flujo completo:
   - Registrar un cliente
   - Obtener QR
   - Escanear desde el panel
   - Registrar una compra

## 📚 Documentación

- **Personalización completa:** `PERSONALIZACION.md`
- **Guía de branding:** `BRAND_GUIDE.md`
- **README general:** `README.md`

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. Verifica que el **backend esté ejecutándose**
2. Revisa la **consola del navegador** (F12)
3. Revisa los **logs de la terminal**
4. Consulta la documentación completa
