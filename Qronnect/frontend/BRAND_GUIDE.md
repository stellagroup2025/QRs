# 🎨 Guía de Personalización de Marca

Este proyecto usa un sistema centralizado de marca que permite personalizar toda la aplicación desde un único archivo.

## 📁 Archivo Principal

**`config/appBrand.ts`** - Único archivo a editar

## ⚡ Inicio Rápido (1 minuto)

1. Abre `config/appBrand.ts`
2. Edita el objeto `BRAND`:
   \`\`\`typescript
   export const BRAND: AppBrand = {
     palette: {
       primary: "#TU_COLOR",     // Tu color principal
       // ... más colores
     },
     copy: {
       companyName: "Tu Empresa",
       tagline: "Tu eslogan",
       // ... más textos
     },
     assets: {
       logo: "/tu-logo.svg",
       // ... más assets
     }
   }
   \`\`\`
3. Guarda y despliega

## 🎨 Paleta de Colores

\`\`\`typescript
palette: {
  primary: "#0ea5e9",       // Color principal (botones, enlaces)
  primaryFg: "#ffffff",     // Texto sobre color principal
  secondary: "#6366f1",     // Color secundario
  secondaryFg: "#ffffff",   // Texto sobre secundario
  accent: "#22c55e",        // Color de acento (destacados)
  background: "#ffffff",    // Fondo general de la app
  foreground: "#0f172a",    // Color de texto general
  muted: "#f1f5f9",         // Fondos suaves (cards, secciones)
  border: "#e5e7eb",        // Color de bordes
}
\`\`\`

### Formato
- Todos los colores en formato **HEX** (`#rrggbb`)
- El sistema convierte automáticamente a RGB para CSS

## 📝 Textos Personalizables

\`\`\`typescript
copy: {
  companyName: "Tu Comercio",         // Nombre visible en toda la app
  tagline: "Tu eslogan",               // Subtítulo del hero
  city: "Madrid",                      // Ciudad (opcional)
  footerNote: "© 2025 Tu Comercio",   // Pie de página (opcional)
  ctaGetQR: "Obtener mi QR",          // Botón principal (opcional)
  ctaRecover: "¿Ya tienes QR?",       // Link recuperar (opcional)
}
\`\`\`

## 🖼️ Assets (Imágenes)

\`\`\`typescript
assets: {
  logo: "/brand/base/logo.svg",       // Logo principal
  favicon: "/brand/base/favicon.ico", // Favicon del navegador
  ogImage: "/brand/base/og.jpg",      // Imagen social (Facebook, Twitter)
}
\`\`\`

### Recomendaciones
- **Logo**: SVG o PNG transparente, 200x200px ideal
- **Favicon**: .ico de 32x32px
- **OG Image**: JPG de 1200x630px para redes sociales

## 🚀 Dónde se Aplica la Marca

El sistema propaga automáticamente la configuración a:

1. **Layout**
   - Título de la página
   - Meta tags (SEO)
   - Open Graph (redes sociales)
   - Favicon

2. **Header**
   - Logo
   - Nombre de la empresa
   - Ciudad

3. **Footer**
   - Nota de copyright

4. **Páginas**
   - Hero section
   - Botones principales
   - Textos de CTA

5. **CSS**
   - Variables de color inyectadas dinámicamente
   - Utilidades de Tailwind (`.bg-brand`, `.text-brand`, etc.)

## 🛠️ Clases CSS Disponibles

Puedes usar estas clases en cualquier componente:

\`\`\`css
.bg-brand          /* Fondo con color primary */
.text-brand        /* Texto con color primary */
.border-brand      /* Borde con color primary */
.bg-brand-muted    /* Fondo con color muted */
.bg-brand-accent   /* Fondo con color accent */
\`\`\`

## 📦 Ejemplos de Configuración

### Perfumería Elegante
\`\`\`typescript
palette: {
  primary: "#8b5cf6",
  primaryFg: "#ffffff",
  secondary: "#ec4899",
  accent: "#fbbf24",
  background: "#fafafa",
  foreground: "#1f2937",
  muted: "#f3f4f6",
  border: "#e5e7eb",
}
copy: {
  companyName: "Parfums Élégance",
  tagline: "Fragancia y distinción desde 1995",
  city: "Barcelona",
}
\`\`\`

### Cafetería Cálida
\`\`\`typescript
palette: {
  primary: "#92400e",
  primaryFg: "#ffffff",
  secondary: "#ea580c",
  accent: "#fbbf24",
  background: "#fffbeb",
  foreground: "#1c1917",
  muted: "#fef3c7",
  border: "#d6d3d1",
}
copy: {
  companyName: "Café Luna",
  tagline: "El mejor café de especialidad",
  city: "Valencia",
}
\`\`\`

## 🔍 Debugging

Si algo no se actualiza:
1. Verifica que guardaste `config/appBrand.ts`
2. Recarga la página (Cmd/Ctrl + R)
3. Los colores se inyectan en runtime por `BrandProvider`

## 📂 Estructura de Archivos

\`\`\`
config/
  └─ appBrand.ts          ← EDITA AQUÍ
components/
  └─ BrandProvider.tsx    (no tocar)
lib/
  └─ theme.ts             (no tocar)
app/
  ├─ layout.tsx           (usa BRAND)
  ├─ globals.css          (define utilidades)
  └─ page.tsx             (usa BRAND)
public/
  └─ brand/
     └─ base/
        ├─ logo.svg       ← TU LOGO
        ├─ favicon.ico    ← TU FAVICON
        └─ og.jpg         ← TU IMAGEN SOCIAL
\`\`\`

## ✅ Checklist de Personalización

- [ ] Editar `companyName` y `tagline` en `appBrand.ts`
- [ ] Cambiar colores `primary`, `secondary`, `accent`
- [ ] Subir logo a `public/brand/base/logo.svg`
- [ ] Subir favicon a `public/brand/base/favicon.ico`
- [ ] Subir imagen OG a `public/brand/base/og.jpg`
- [ ] Ajustar `city` y `footerNote` si es necesario
- [ ] Probar en navegador

## 🎯 Ventajas de este Sistema

- **Un solo archivo**: Todo centralizado en `appBrand.ts`
- **Propagación automática**: Cambios se reflejan en toda la app
- **Sin variables de entorno**: Todo en el frontend
- **TypeScript**: Autocompletado y validación
- **Flexible**: Fácil añadir más opciones

---

**¿Dudas?** Todos los cambios se hacen editando `config/appBrand.ts`. El resto es automático.
