// ============================================================
// 🎨 CONFIGURACIÓN DE MARCA - CONTROL CENTRALIZADO
// ============================================================
// Este es el ÚNICO archivo para personalizar la marca completa:
// - Nombre y textos de la empresa
// - Colores (paleta completa)
// - Logo, favicon e imágenes
//
// TODO se propaga automáticamente a layout, botones, meta tags, etc.
// ============================================================

export type BrandPalette = {
  primary: string // Color principal (hex)
  primaryFg: string // Texto sobre primario
  secondary: string // Color secundario
  secondaryFg: string // Texto sobre secundario
  accent: string // Color de acento
  background: string // Fondo general
  foreground: string // Texto general
  muted: string // Fondos suaves (cards)
  border: string // Bordes
}

export type BrandCopy = {
  companyName: string // Nombre público de la empresa
  tagline?: string // Claim corto (hero)
  city?: string // Ciudad
  footerNote?: string // Texto pie de página
  ctaGetQR?: string // Texto botón principal
  ctaRecover?: string // Texto enlace recuperación
}

export type BrandAssets = {
  logo: string // Ruta pública del logo
  favicon?: string // Ruta del favicon
  ogImage?: string // Imagen para Open Graph
}

export type AppBrand = {
  palette: BrandPalette
  copy: BrandCopy
  assets: BrandAssets
}

// ============================================================
// 🔧 PERSONALIZA AQUÍ TU MARCA
// ============================================================

export const BRAND: AppBrand = {
  palette: {
    primary: "#0ea5e9", // Azul cielo
    primaryFg: "#ffffff", // Blanco
    secondary: "#6366f1", // Índigo
    secondaryFg: "#ffffff", // Blanco
    accent: "#22c55e", // Verde
    background: "#ffffff", // Blanco
    foreground: "#0f172a", // Gris oscuro
    muted: "#f1f5f9", // Gris muy claro
    border: "#e5e7eb", // Gris borde
  },

  copy: {
    companyName: "Tu Comercio",
    tagline: "Tarjeta digital de fidelización con QR",
    city: "Madrid",
    footerNote: "© Tu Comercio. Todos los derechos reservados.",
    ctaGetQR: "Obtener mi QR",
    ctaRecover: "¿Ya tienes QR? Recupéralo",
  },

  assets: {
    logo: "/brand/base/logo.svg",
    favicon: "/brand/base/favicon.ico",
    ogImage: "/brand/base/og.jpg",
  },
}

// ============================================================
// 💡 EJEMPLOS DE PERSONALIZACIÓN
// ============================================================
//
// EJEMPLO: Perfumería elegante
// palette: {
//   primary: "#8b5cf6",       // Violeta elegante
//   primaryFg: "#ffffff",
//   secondary: "#ec4899",     // Rosa
//   secondaryFg: "#ffffff",
//   accent: "#fbbf24",        // Dorado
//   background: "#fafafa",
//   foreground: "#1f2937",
//   muted: "#f3f4f6",
//   border: "#e5e7eb",
// }
//
// EJEMPLO: Cafetería cálida
// palette: {
//   primary: "#92400e",       // Marrón café
//   primaryFg: "#ffffff",
//   secondary: "#ea580c",     // Naranja
//   secondaryFg: "#ffffff",
//   accent: "#fbbf24",        // Amarillo
//   background: "#fffbeb",    // Crema
//   foreground: "#1c1917",
//   muted: "#fef3c7",
//   border: "#d6d3d1",
// }
//
// ============================================================
