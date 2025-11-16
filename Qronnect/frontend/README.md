# Sistema de Fidelización con QR - Plantilla Base

Sistema genérico de fidelización para comercios con códigos QR, sellos digitales y descuentos. Personalizable para cualquier tipo de negocio.

## 🚀 Configuración Rápida

### 1. Personalizar el Comercio

Edita el archivo `config/commerce.ts` y modifica:

- ✅ **Información básica**: nombre, ciudad, slug
- ✅ **Logo**: sube tu logo a `/public/logo.jpg`
- ✅ **PIN de staff**: cambia el PIN por seguridad
- ✅ **Programas**: activa/desactiva sellos y descuentos
- ✅ **Textos**: personaliza mensajes y llamadas a acción

### 2. Personalizar Colores (Opcional)

Edita `app/globals.css` para cambiar el tema de colores completo.

### 3. Desplegar

El proyecto está listo para desplegarse en Vercel con un clic.

## 📱 Funcionalidades

### Para Clientes
- ✅ Registro rápido con email o teléfono
- ✅ QR personal único para identificación
- ✅ Seguimiento de progreso de sellos
- ✅ Historial de actividad
- ✅ Descarga del QR en diferentes formatos

### Para Staff
- ✅ Dashboard protegido por PIN
- ✅ Escáner QR integrado (cámara del dispositivo)
- ✅ Acciones rápidas: añadir sellos, aplicar descuentos, registrar compras
- ✅ Vista de todos los clientes registrados
- ✅ Gestión en tiempo real

## 🏗️ Estructura del Proyecto

\`\`\`
├── app/                    # Páginas Next.js
│   ├── page.tsx           # Home pública
│   ├── registro/          # Formulario de registro
│   ├── mi-qr/             # QR personal del cliente
│   ├── mi-cuenta/         # Cuenta y progreso del cliente
│   ├── staff/             # Dashboard de staff (protegido por PIN)
│   └── [slug]/c/          # Validación de QR
├── components/            # Componentes reutilizables
│   ├── staff/             # Componentes específicos del staff
│   └── ui/                # Componentes UI base (shadcn)
├── config/
│   └── commerce.ts        # ⭐ CONFIGURACIÓN PRINCIPAL DEL COMERCIO
├── lib/                   # Utilidades y lógica de negocio
├── stores/                # Estado global (Zustand)
└── types/                 # Tipos TypeScript

\`\`\`

## 🔑 Elementos Clave a Personalizar

### 1. Información del Comercio (`config/commerce.ts`)

\`\`\`typescript
{
  nombre: "Tu Comercio Aquí",
  slug: "tu-comercio",
  ciudad: "Tu Ciudad",
  logoUrl: "/logo.jpg",
  pinStaff: "TU_PIN_AQUÍ", // ⚠️ Cambiar obligatoriamente
}
\`\`\`

### 2. Logo (`/public/logo.jpg`)

- Formato: JPG o PNG
- Tamaño recomendado: 200x200px cuadrado
- Peso: < 100KB

### 3. Programas de Fidelización

\`\`\`typescript
programas: {
  sellos: {
    activo: true,
    requisito: 10, // Número de sellos
    titulo: "Compra 10 y llévate 1 gratis"
  },
  descuento: {
    activo: true,
    porcentaje: 5, // Porcentaje de descuento
    titulo: "5% para miembros"
  }
}
\`\`\`

### 4. Colores del Tema (`app/globals.css`)

Personaliza los colores CSS en la sección `@theme`:

\`\`\`css
--color-primary: tu_color_aquí;
--color-secondary: tu_color_aquí;
\`\`\`

## 📦 Tecnologías

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos
- **Zustand** - Gestión de estado
- **html5-qrcode** - Escáner QR
- **qrcode** - Generación de QR
- **shadcn/ui** - Componentes UI

## 💾 Almacenamiento

Por defecto usa **LocalStorage** para desarrollo. Para producción:

1. Reemplaza `lib/dataAdapter.ts` con llamadas a tu API
2. Los stores de Zustand ya están preparados para trabajar con async/await
3. Mantén la misma interfaz de datos definida en `types/index.ts`

## 🔒 Seguridad

- ⚠️ **Cambia el PIN de staff** en producción
- ⚠️ Cada cliente tiene un **token único** para validación
- ⚠️ Para producción, implementa autenticación real en el backend

## 📝 Licencia

Este es un proyecto base personalizable. Úsalo libremente para tus comercios.
