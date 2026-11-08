'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, ChevronRight, Stamp, Star, UtensilsCrossed, type LucideIcon } from 'lucide-react'
import { getTenantDomain } from '@/lib/tenant'
import type { PaginaTresVias as DatosPagina } from '@/lib/api/carta'
import { LogoMarca, PortadaMarca, useMarca } from './CabeceraMarca'

interface Via {
  clave: string
  href: string
  externo?: boolean
  icono: LucideIcon
  titulo: string
  texto: string
  /** Fondo del icono: cada vía con un color de la marca */
  tono: string
}

/**
 * Página a la que lleva el QR de la mesa: tres botones grandes, uno por cada vía
 * (reseñar en Google, tarjeta de sellos y carta), vestida con la marca del negocio.
 */
export function PaginaTresVias({ datos }: { datos: DatosPagina }) {
  const { nombre, logo, portada } = useMarca()
  const router = useRouter()
  const [rutaSellos, setRutaSellos] = useState('/registro')
  // Hasta saber si hay sesión no sabemos a dónde lleva la tarjeta de sellos
  const [rutaLista, setRutaLista] = useState(false)

  // Con sesión iniciada va directo a su tarjeta; si no, a apuntarse
  useEffect(() => {
    const slug = getTenantDomain()
    const token = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem('client_token')
    if (token && slug) setRutaSellos(`/${slug}/mis-sellos`)
    setRutaLista(true)
  }, [])

  const vias: Via[] = []
  if (datos.hay_carta) {
    vias.push({
      clave: 'carta',
      href: '/carta',
      icono: UtensilsCrossed,
      titulo: 'Ver la carta',
      texto: 'Platos, precios y alérgenos, con fotos.',
      tono: 'bg-brand text-brand-on',
    })
  }
  vias.push({
    clave: 'sellos',
    href: rutaSellos,
    icono: Stamp,
    titulo: 'Tarjeta de sellos',
    texto: 'Suma un sello en cada visita y llévate premios.',
    tono: 'bg-brand-3 text-brand-3-on',
  })
  if (datos.google_reviews_url) {
    vias.push({
      clave: 'resena',
      href: datos.google_reviews_url,
      externo: true,
      icono: Star,
      titulo: 'Déjanos tu reseña',
      texto: '¿Te ha gustado? Cuéntalo en Google, nos ayuda muchísimo.',
      tono: 'bg-brand-2 text-brand-2-on',
    })
  }

  // Con una sola opción, el QR va directo a ella sin pasar por esta pantalla
  const unica = vias.length === 1 ? vias[0] : null
  useEffect(() => {
    if (!unica || !rutaLista) return
    if (unica.externo) window.location.replace(unica.href)
    else router.replace(unica.href)
  }, [unica?.href, unica?.externo, rutaLista, router]) // eslint-disable-line react-hooks/exhaustive-deps

  if (unica) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-paper" role="status" aria-live="polite">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-ink/10 border-t-brand" aria-hidden="true" />
        <span className="sr-only">Abriendo {unica.titulo.toLowerCase()}…</span>
      </div>
    )
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
            image: [logo, portada].filter(Boolean),
            url: typeof window !== 'undefined' ? window.location.origin : undefined,
            hasMenu: datos.hay_carta && typeof window !== 'undefined' ? `${window.location.origin}/carta` : undefined,
          }),
        }}
      />

      <PortadaMarca alto="h-64 sm:h-72" />

      {/* Fondo con un toque del color secundario de la marca */}
      <div className="flex-1 bg-gradient-to-b from-brand-2/15 to-paper">
        <main className="relative mx-auto -mt-16 w-full max-w-md px-4 pb-10">
          <header className="flex flex-col items-center text-center">
            <LogoMarca />
            <h1 className="mt-4 font-display text-[2rem] font-extrabold leading-tight tracking-[-0.02em] text-balance">
              {nombre}
            </h1>
            <p className="mt-1 text-base text-ink/65">¡Gracias por venir! ¿Qué te apetece hacer?</p>
          </header>

          <nav aria-label="Opciones" className="mt-7 flex flex-col gap-3">
            {vias.map((via, i) => {
              const Icono = via.icono
              const contenido = (
                <>
                  <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm ${via.tono}`}>
                    <Icono className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-bold leading-tight">{via.titulo}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-ink/60">{via.texto}</span>
                  </span>
                  {via.externo ? (
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  )}
                </>
              )
              const clases = `flex items-center gap-4 rounded-3xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 active:translate-y-0 ${
                i === 0 ? 'border-brand/30 ring-1 ring-brand/10' : 'border-ink/10'
              }`
              return via.externo ? (
                <a key={via.clave} href={via.href} target="_blank" rel="noopener noreferrer" className={clases} data-via={via.clave}>
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
      </div>

      <footer className="bg-paper pb-6 text-center text-xs text-ink/40">
        <a href="https://qronnect.es" className="hover:text-ink/70">
          Hecho con Qronnect
        </a>
      </footer>
    </div>
  )
}
