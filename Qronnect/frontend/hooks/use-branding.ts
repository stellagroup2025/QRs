import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface BrandingConfig {
  logo_url: string | null
  favicon_url: string | null
  og_image_url: string | null
  color_primario: string
  color_secundario: string
  color_acento: string
  nombre_comercial: string
}

const defaultBranding: BrandingConfig = {
  logo_url: null,
  favicon_url: '/brand/base/favicon.ico',
  og_image_url: '/brand/base/og.jpg',
  color_primario: '#000000',
  color_secundario: '#666666',
  color_acento: '#0066cc',
  nombre_comercial: 'Mi Tienda',
}

/**
 * Hook para obtener la configuración de branding de la tienda actual
 *
 * @param tenantDomain - Dominio de la tienda (ej: "lokeyokiera")
 * @returns Configuración de branding y estado de carga
 *
 * @example
 * ```tsx
 * const { branding, loading, error } = useBranding('lokeyokiera')
 *
 * if (loading) return <Spinner />
 * if (error) return <div>Error al cargar branding</div>
 *
 * return (
 *   <div style={{ backgroundColor: branding.color_primario }}>
 *     <h1>{branding.nombre_comercial}</h1>
 *   </div>
 * )
 * ```
 */
export function useBranding(tenantDomain?: string) {
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantDomain) {
      console.log('⚠️ [BRANDING] No tenant domain, usando defaults')
      setLoading(false)
      return
    }

    const fetchBranding = async () => {
      try {
        setLoading(true)
        setError(null)

        const url = `${API_URL}/api/config/branding`
        console.log('🔄 [BRANDING] Fetching from:', url, 'with tenant:', tenantDomain)

        const response = await fetch(url, {
          headers: {
            'X-Tenant-Domain': tenantDomain,
          },
        })

        console.log('📡 [BRANDING] Response status:', response.status, response.statusText)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data: BrandingConfig = await response.json()
        console.log('✅ [BRANDING] Data received:', data)
        setBranding(data)
      } catch (err) {
        console.error('❌ [BRANDING] Error fetching branding:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
        // En caso de error, usar branding por defecto
        console.log('🔄 [BRANDING] Using default branding')
        setBranding(defaultBranding)
      } finally {
        setLoading(false)
      }
    }

    fetchBranding()
  }, [tenantDomain])

  return {
    branding,
    loading,
    error,
  }
}
