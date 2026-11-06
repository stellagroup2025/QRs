'use client'

import type { ReactNode } from 'react'
import { useBrandingContext } from '@/components/BrandingProvider'
import { useLandingConfig } from '@/hooks/use-landing-config'
import { cn } from '@/lib/utils'

/** Logo propio de la tienda, o null si solo tiene el de Qronnect por defecto */
export function logoDeLaTienda(url?: string | null) {
  if (!url || !url.trim() || url.includes('/brand/qronnect/')) return null
  return url
}

export function nombreDeLaTienda(nombre?: string | null, porDefecto = 'Nuestro restaurante') {
  return !nombre || nombre === 'Mi Tienda' ? porDefecto : nombre
}

/** Datos de marca para las páginas del comensal: nombre, logo y foto de portada */
export function useMarca() {
  const { branding } = useBrandingContext()
  const { config } = useLandingConfig()
  return {
    nombre: nombreDeLaTienda(branding.nombre_comercial),
    logo: logoDeLaTienda(branding.logo_url),
    portada: config?.hero_bg_url || config?.hero_imagen_url || null,
  }
}

/**
 * Portada con la foto del negocio (o un degradado con sus colores si no tiene)
 * y su logo superpuesto. La usan la página QR y la carta.
 */
export function PortadaMarca({
  alto = 'h-52 sm:h-60',
  children,
  className,
}: {
  alto?: string
  children?: ReactNode
  className?: string
}) {
  const { portada } = useMarca()
  return (
    <div className={cn('relative overflow-hidden bg-brand', alto, className)}>
      {portada ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={portada} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-brand via-brand to-brand-3">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand-2/30 blur-2xl" />
          <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-brand-3/40 blur-2xl" />
        </div>
      )}
      {/* Velo con el color de la marca para que todo encaje y el texto se lea */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-brand/90" />
      {children}
    </div>
  )
}

/** Logo redondeado; sin logo, la inicial con los colores de la marca */
export function LogoMarca({
  tamano = 'h-28 w-28',
  letra = 'text-5xl',
  className,
}: {
  tamano?: string
  letra?: string
  className?: string
}) {
  const { nombre, logo } = useMarca()
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-xl',
        tamano,
        className,
      )}
    >
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="h-full w-full object-contain p-2" />
      ) : (
        <span
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-2 to-brand-3 font-display font-extrabold text-brand-2-on ${letra}`}
        >
          {nombre.charAt(0).toUpperCase()}
        </span>
      )}
    </span>
  )
}
