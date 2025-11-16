'use client'

import { useBrandingContext } from './BrandingProvider'
import Image from 'next/image'

interface BrandLogoProps {
  className?: string
  width?: number
  height?: number
  showName?: boolean
}

/**
 * Componente que muestra el logo dinámico de la tienda
 * Si no hay logo, muestra el nombre comercial
 */
export function BrandLogo({ className = '', width = 120, height = 40, showName = false }: BrandLogoProps) {
  const { branding, loading } = useBrandingContext()

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded ${className}`} style={{ width, height }} />
    )
  }

  if (branding.logo_url) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Image
          src={branding.logo_url}
          alt={branding.nombre_comercial}
          width={width}
          height={height}
          className="object-contain"
        />
        {showName && (
          <span className="text-lg font-semibold">{branding.nombre_comercial}</span>
        )}
      </div>
    )
  }

  // Si no hay logo, mostrar solo el nombre comercial
  return (
    <div className={`flex items-center ${className}`}>
      <h1 className="text-xl font-bold text-[rgb(var(--brand-primary))]">
        {branding.nombre_comercial}
      </h1>
    </div>
  )
}
