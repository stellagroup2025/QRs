'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ChevronRight, Stamp, Star, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { useBrandingContext } from '@/components/BrandingProvider'
import { getTenantDomain } from '@/lib/tenant'
import type { PaginaTresVias as DatosPagina } from '@/lib/api/carta'

interface Via {
  clave: string
  href: string
  externo?: boolean
  icono: LucideIcon
  titulo: string
  texto: string
}

/**
 * Página a la que lleva el QR de la mesa: tres botones grandes, uno por cada vía
 * (reseñar en Google, tarjeta de sellos y carta). Pensada para el móvil.
 */
export function PaginaTresVias({ datos }: { datos: DatosPagina }) {
  const { branding } = useBrandingContext()
  const [rutaSellos, setRutaSellos] = useState('/registro')

  const nombre =
    !branding.nombre_comercial || branding.nombre_comercial === 'Mi Tienda' ? 'Nuestro restaurante' : branding.nombre_comercial
  const logo = branding.logo_url && branding.logo_url.trim() !== '' ? branding.logo_url : null

  // Con sesión iniciada va directo a su tarjeta; si no, a apuntarse
  useEffect(() => {
    const slug = getTenantDomain()
    const token = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem('client_token')
    if (token && slug) setRutaSellos(`/${slug}/mis-sellos`)
  }, [])

  const vias: Via[] = []
  if (datos.google_reviews_url) {
    vias.push({
      clave: 'resena',
      href: datos.google_reviews_url,
      externo: true,
      icono: Star,
      titulo: 'Déjanos tu reseña',
      texto: 'Cuéntanos qué tal en Google. Nos ayuda muchísimo.',
    })
  }
  vias.push({
    clave: 'sellos',
    href: rutaSellos,
    icono: Stamp,
    titulo: 'Tarjeta de sellos',
    texto: 'Suma un sello en cada visita y llévate premios.',
  })
  if (datos.hay_carta) {
    vias.push({
      clave: 'carta',
      href: '/carta',
      icono: UtensilsCrossed,
      titulo: 'Ver la carta',
      texto: 'Platos, precios y alérgenos.',
    })
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Restaurant',
            name: nombre,
            image: logo || undefined,
            url: typeof window !== 'undefined' ? window.location.origin : undefined,
            hasMenu: datos.hay_carta && typeof window !== 'undefined' ? `${window.location.origin}/carta` : undefined,
          }),
        }}
      />

      {/* Franja de color de la marca */}
      <div aria-hidden="true" className="h-40 bg-brand sm:h-48" />

      <main className="mx-auto -mt-20 w-full max-w-md flex-1 px-4 pb-10">
        <header className="flex flex-col items-center text-center">
          <span className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-paper bg-white shadow-lg">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt=""
                className="h-full w-full object-contain p-2"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = '/LogoQronnect.png'
                }}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-brand font-display text-5xl font-bold text-brand-on">
                {nombre.charAt(0).toUpperCase()}
              </span>
            )}
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.02em] text-balance">{nombre}</h1>
          <p className="mt-1 text-base text-ink/60">¡Gracias por venir! ¿Qué te apetece hacer?</p>
        </header>

        <nav aria-label="Opciones" className="mt-8 flex flex-col gap-3">
          {vias.map((via) => {
            const Icono = via.icono
            const contenido = (
              <>
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-on">
                  <Icono className="h-7 w-7" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-semibold leading-tight">{via.titulo}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-ink/60">{via.texto}</span>
                </span>
                {via.externo ? (
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-ink/40" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-5 w-5 shrink-0 text-ink/40" aria-hidden="true" />
                )}
              </>
            )
            const clases =
              'flex items-center gap-4 rounded-3xl border border-ink/10 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:translate-y-0'
            return via.externo ? (
              <a
                key={via.clave}
                href={via.href}
                target="_blank"
                rel="noopener noreferrer"
                className={clases}
                data-via={via.clave}
              >
                {contenido}
                <span className="sr-only"> (se abre en una pestaña nueva)</span>
              </a>
            ) : (
              <Link key={via.clave} href={via.href} className={clases} data-via={via.clave}>
                {contenido}
              </Link>
            )
          })}
        </nav>
      </main>

      <footer className="pb-6 text-center text-xs text-ink/40">
        <a href="https://qronnect.es" className="hover:text-ink/70">
          Hecho con Qronnect
        </a>
      </footer>
    </div>
  )
}
