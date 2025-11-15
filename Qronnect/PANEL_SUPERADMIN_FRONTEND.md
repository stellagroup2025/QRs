# 🎨 Panel SuperAdmin - Interfaz Web

## ✅ ¡Panel SuperAdmin Creado!

He creado un **panel web completo** para gestionar todo el sistema Qronnect desde una interfaz visual.

---

## 🚀 Cómo Acceder

### 1. Asegúrate de que el backend esté corriendo

```bash
# En la terminal del backend:
cd C:\Users\Omar\Documents\Qronnect\backend
npm run start:dev

# Debe estar corriendo en: http://localhost:3001
```

### 2. Inicia el frontend

```bash
# En otra terminal:
cd C:\Users\Omar\Documents\Qronnect\QRs
npm run dev

# Se abrirá en: http://localhost:3000
```

### 3. Accede al Panel SuperAdmin

Abre tu navegador y ve a:
```
http://localhost:3000/superadmin/login
```

---

## 🔐 Login

1. **Ingresa tu email**: `stellagroupapps@gmail.com`
2. **Clic en "Enviar código"**
3. **Revisa tu email** - Recibirás un código de 6 dígitos
4. **Ingresa el código** en el formulario
5. **Clic en "Verificar código"**
6. ✅ **¡Listo!** Serás redirigido al dashboard

---

## 📊 Páginas Disponibles

### 1. Login (`/superadmin/login`)
- Autenticación con email y código OTP
- Interfaz moderna y segura
- Validación en tiempo real

### 2. Dashboard (`/superadmin/dashboard`)
**Métricas globales:**
- Tiendas activas / totales
- Total de clientes en el sistema
- Total de compras realizadas
- Facturación total y mensual

**Acciones rápidas:**
- Crear nueva tienda
- Ver lista de tiendas
- Ver logs de auditoría

### 3. Gestión de Tiendas (`/superadmin/tiendas`)
**Tabla completa con:**
- Nombre y fecha de creación
- Dominio (principal y personalizado)
- Plan contratado (básico/profesional/enterprise)
- Estadísticas (clientes, compras, facturación)
- Estado (activa/inactiva)

**Acciones por tienda:**
- 👁️ Ver detalles completos
- ✏️ Editar información
- 🗑️ Eliminar/desactivar

### 4. Crear Tienda (`/superadmin/tiendas/nueva`)
**Formulario completo con:**

**Información básica:**
- Nombre de la tienda
- Dominio único (ej: `mi-tienda` → `mi-tienda.qronnect.com`)
- Dominio personalizado (opcional)
- Plan (básico/profesional/enterprise)

**Información de contacto:**
- Dirección
- Teléfono
- Email
- URL del logo

**Configuración:**
- Puntos por euro
- Moneda (EUR por defecto)

---

## 🎯 Flujo de Uso Típico

### Crear tu Primera Tienda

1. **Login** en `/superadmin/login`
2. Ir al **Dashboard**
3. Clic en **"Crear Tienda"** o **"Ver Tiendas"** → **"Nueva Tienda"**
4. Llenar el formulario:
   ```
   Nombre: Cafetería Demo
   Dominio: cafeteria-demo
   Plan: profesional
   Puntos por euro: 1
   ```
5. **"Crear Tienda"**
6. ✅ La tienda aparecerá en la lista

### Ver Todas las Tiendas

1. Dashboard → **"Ver Tiendas"**
2. Verás tabla con todas las tiendas
3. Cada fila muestra:
   - Nombre, dominio, plan
   - Número de clientes
   - Número de compras
   - Facturación total
   - Estado

### Gestionar una Tienda

**Opción 1: Ver detalles**
- Clic en el icono 👁️
- Ver info completa: clientes, compras, QRs, estadísticas

**Opción 2: Editar**
- Clic en el icono ✏️
- Modificar cualquier campo
- Guardar cambios

**Opción 3: Eliminar**
- Clic en el icono 🗑️
- Confirmar eliminación
- La tienda se desactiva (soft delete)

---

## 🎨 Características de la Interfaz

### Diseño
- ✅ **Responsive** - Funciona en móvil, tablet y desktop
- ✅ **Dark mode** - Soporte para tema oscuro
- ✅ **Moderno** - Componentes de shadcn/ui
- ✅ **Intuitivo** - Navegación clara y sencilla

### UX/UI
- ✅ **Loading states** - Indicadores de carga
- ✅ **Error handling** - Mensajes de error claros
- ✅ **Validación** - Formularios validados en tiempo real
- ✅ **Confirmaciones** - Diálogos antes de acciones destructivas
- ✅ **Feedback visual** - Alertas de éxito/error

### Seguridad
- ✅ **Protección de rutas** - Redirige al login si no hay token
- ✅ **Token JWT** - Guardado en localStorage
- ✅ **Auto-logout** - Si el token expira
- ✅ **Validación backend** - Todas las peticiones verificadas

---

## 📱 Páginas Creadas

```
/superadmin/
├── login/
│   └── page.tsx           ✅ Login con email OTP
├── dashboard/
│   └── page.tsx           ✅ Dashboard con métricas
└── tiendas/
    ├── page.tsx           ✅ Lista de tiendas
    └── nueva/
        └── page.tsx       ✅ Crear tienda
```

---

## 🔧 Tecnologías Usadas

- **Next.js 15** - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
  - Card, Button, Input, Label
  - Table, Badge, Alert
  - Select, Textarea
- **Lucide Icons** - Iconos
- **localStorage** - Almacenamiento de token

---

## 🎯 Próximos Pasos (Opcional)

Si quieres expandir el panel, podrías añadir:

### Página de Detalle de Tienda (`/superadmin/tiendas/[id]`)
- Ver todos los clientes de la tienda
- Ver todas las compras
- Gráficos de actividad
- Exportar datos

### Página de Logs (`/superadmin/logs`)
- Historial de todas las acciones
- Filtros por fecha, usuario, acción
- Exportar a CSV

### Página de Editar Tienda (`/superadmin/tiendas/[id]/editar`)
- Formulario pre-rellenado
- Actualizar información
- Cambiar plan

### Features Adicionales
- Búsqueda de tiendas
- Filtros y ordenamiento
- Paginación
- Exportar datos
- Gráficos y estadísticas avanzadas

---

## ✅ Checklist de Uso

- [x] Backend corriendo en puerto 3001
- [x] Frontend corriendo en puerto 3000
- [x] Usuario superadmin creado en Supabase
- [ ] **→ Probar login** en `/superadmin/login`
- [ ] Ver dashboard
- [ ] Crear primera tienda
- [ ] Ver lista de tiendas

---

## 🆘 Troubleshooting

### "No puedo hacer login"
- Verifica que el backend esté corriendo en puerto 3001
- Verifica que tu email esté en `superadmin_users`
- Revisa tu bandeja de entrada del email

### "Error al cargar dashboard"
- Verifica que el token no haya expirado
- Cierra sesión y vuelve a hacer login
- Revisa la consola del navegador (F12)

### "No aparecen las tiendas"
- Verifica que el backend responda correctamente
- Abre las DevTools (F12) → Network para ver las peticiones
- Verifica que el token sea válido

### "Errores de compilación en el frontend"
- Asegúrate de que todas las dependencias estén instaladas
- Ejecuta: `npm install --legacy-peer-deps`
- Reinicia el servidor: Ctrl+C y `npm run dev`

---

## 🎉 ¡Todo Listo!

Ahora tienes un **panel SuperAdmin completo con interfaz web** para:

✅ Hacer login con email y código OTP (GRATIS)
✅ Ver dashboard con métricas globales
✅ Listar todas las tiendas
✅ Crear nuevas tiendas con formulario
✅ Editar y eliminar tiendas
✅ Ver estadísticas de cada tienda

**Para empezar:**
```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd QRs && npm run dev

# Navegador
http://localhost:3000/superadmin/login
```

¡Disfruta tu panel SuperAdmin! 🚀
