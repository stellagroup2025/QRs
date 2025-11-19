// ============================================================
// 🎨 UTILIDADES DE TEMA
// ============================================================
// Helpers para acceder a la configuración de marca desde cualquier componente
// ============================================================

import { BRAND } from "@/config/appBrand"

// Exportaciones directas para fácil acceso
export const brand = BRAND
export const brandCopy = BRAND.copy
export const brandPalette = BRAND.palette
export const brandAssets = BRAND.assets

// Helper: obtener color primario en formato hex
export function getPrimaryColor(): string {
  return BRAND.palette.primary
}

// Helper: obtener nombre de la empresa
export function getCompanyName(): string {
  return BRAND.copy.companyName
}

// Helper: obtener logo
export function getLogoUrl(): string {
  return BRAND.assets.logo
}
