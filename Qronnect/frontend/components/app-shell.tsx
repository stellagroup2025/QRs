'use client'

import type React from 'react'
import Link from 'next/link'
import { BrandLogo } from './BrandLogo'
import { useBrandingContext } from './BrandingProvider'

interface AppShellProps {
  children: React.ReactNode
  showBackButton?: boolean
}

export function AppShell({ children, showBackButton = false }: AppShellProps) {
  const { branding } = useBrandingContext()

  // ✅ Nombre a mostrar:
  // - Si el comercio ha configurado nombre (y no es "Mi Tienda") → usamos ese
  // - Si no → usamos "Qronnect"
  const displayBrandName =
    branding?.nombre_comercial && branding.nombre_comercial !== 'Mi Tienda'
      ? branding.nombre_comercial
      : 'Qronnect'

  // ✅ Texto del footer:
  const footerNote = `© ${displayBrandName}. Todos los derechos reservados.`

  return (
    <div className='min-h-screen bg-background'>
      {/* HEADER */}
      <header className='border-b border-[rgb(var(--brand-primary))]/10 bg-card sticky top-0 z-10'>
        <div className='container mx-auto px-4 h-16 flex items-center justify-between'>
          <Link href='/' className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              {/* ✅ Logo:
                  - Si el comercio tiene logo_url → usamos ese
                  - Si no → usamos LogoQronnect.png
              */}
              {branding?.logo_url ? (
                <img
                  src={branding.logo_url}
                  alt={displayBrandName}
                  className='h-10 w-auto object-contain'
                  onError={(e) => {
                    // Si falla el logo del cliente, usamos el de Qronnect
                    e.currentTarget.onerror = null
                    e.currentTarget.src = '/LogoQronnect.png'
                  }}
                />
              ) : (
                // Fallback a logo base de la app (BrandLogo) sin texto
                <BrandLogo width={40} height={40} showName={false} />
              )}

              {/* Nombre de la marca / comercio */}
              <span className='font-semibold text-sm text-foreground'>
                {displayBrandName}
              </span>
            </div>
          </Link>

          {showBackButton && (
            <Link
              href='/'
              className='text-sm text-[rgb(var(--brand-accent))] hover:text-[rgb(var(--brand-accent))]/80 font-medium'
            >
              Volver
            </Link>
          )}
        </div>
      </header>

      {/* CONTENIDO */}
      <main className='container mx-auto px-4 py-6'>{children}</main>

      {/* FOOTER FORMULARIO / RGPD */}
      <footer className='border-t bg-card mt-12'>
        <div className='container mx-auto px-4 py-6'>
          {footerNote && (
            <p className='text-center text-sm text-muted-foreground mb-4'>
              {footerNote}
            </p>
          )}
          <div className='flex flex-wrap justify-center gap-4 text-xs text-muted-foreground'>
            <Link
              href='/terminos'
              className='text-[rgb(var(--brand-accent))] hover:text-[rgb(var(--brand-accent))]/80 underline'
            >
              Términos y Condiciones
            </Link>
            <span>·</span>
            <Link
              href='/privacidad'
              className='text-[rgb(var(--brand-accent))] hover:text-[rgb(var(--brand-accent))]/80 underline'
            >
              Política de Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
