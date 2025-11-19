'use client'

import { createContext, useContext, useEffect } from 'react'
import { useBranding, type BrandingConfig } from '@/hooks/use-branding'
import { getTenantDomain } from '@/lib/tenant'

interface BrandingContextValue {
  branding: BrandingConfig
  loading: boolean
  error: string | null
}

const BrandingContext = createContext<BrandingContextValue | null>(null)

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const tenantDomain = getTenantDomain()
  const { branding, loading, error } = useBranding(tenantDomain)

  console.log('🏪 [BRANDING] Provider iniciado:', {
    tenantDomain,
    loading,
    error,
    branding,
  })

  // Aplicar colores como CSS variables al documento
  useEffect(() => {
    if (!loading && branding) {
      const root = document.documentElement

      // Convertir hex a RGB para compatibilidad con Tailwind
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
          ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
          : '0 0 0'
      }

      // Aplicar colores de marca como CSS variables
      const primaryRgb = hexToRgb(branding.color_primario)
      const secondaryRgb = hexToRgb(branding.color_secundario)
      const accentRgb = hexToRgb(branding.color_acento)

      console.log('🎨 [BRANDING] Aplicando colores:', {
        color_primario: branding.color_primario,
        color_secundario: branding.color_secundario,
        color_acento: branding.color_acento,
        primaryRgb,
        secondaryRgb,
        accentRgb,
      })

      root.style.setProperty('--brand-primary', primaryRgb)
      root.style.setProperty('--brand-secondary', secondaryRgb)
      root.style.setProperty('--brand-accent', accentRgb)

      console.log('🎨 [BRANDING] Variables CSS aplicadas:', {
        '--brand-primary': root.style.getPropertyValue('--brand-primary'),
        '--brand-secondary': root.style.getPropertyValue('--brand-secondary'),
        '--brand-accent': root.style.getPropertyValue('--brand-accent'),
      })

      // También actualizar el título del documento
      if (branding.nombre_comercial) {
        document.title = `${branding.nombre_comercial} - Fidelización`
      }
    }
  }, [branding, loading])

  return (
    <BrandingContext.Provider value={{ branding, loading, error }}>
      {children}
    </BrandingContext.Provider>
  )
}

/**
 * Hook para acceder al branding desde cualquier componente
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { branding } = useBrandingContext()
 *   return <h1>{branding.nombre_comercial}</h1>
 * }
 * ```
 */
export function useBrandingContext() {
  const context = useContext(BrandingContext)
  if (!context) {
    throw new Error('useBrandingContext debe usarse dentro de BrandingProvider')
  }
  return context
}
