'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Promocion } from '@/types/promo'

interface PromoHeroProps {
  promo: Promocion
}

export function PromoHero({ promo }: PromoHeroProps) {
  // MISMO DOM en SSR y CSR: siempre hay contenedor de imagen + overlay
  const href = promo.ctaHref
    ? promo.utm
      ? `${promo.ctaHref}?${promo.utm}`
      : promo.ctaHref
    : '/'
  const imgSrc = promo.imagenUrl ?? '/placeholder.svg'
  const titulo = promo.titulo ?? 'Programa de fidelización'
  const subtitulo = promo.subtitulo
  const descripcion = promo.descripcion
  const ctaLabel = promo.ctaLabel

  return (
    <section className='relative overflow-hidden rounded-xl bg-gradient-to-br from-brand/20 via-brand/10 to-background border border-brand/20'>
      {/* Fondo siempre presente para evitar cambios de estructura entre SSR/CSR */}
      <div className='absolute inset-0'>
        <Image
          src={imgSrc}
          alt=''
          fill
          priority
          sizes='100vw'
          className='object-cover'
        />
      </div>

      {/* Capa de contraste siempre presente */}
      <div className='absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/85' />

      {/* Contenido */}
      <div className='relative z-10 py-12 px-6 md:py-16 md:px-12 text-center space-y-4'>
        <h2 className='text-3xl md:text-5xl font-bold text-balance'>
          {titulo}
        </h2>

        {subtitulo && (
          <p className='text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto'>
            {subtitulo}
          </p>
        )}

        {descripcion && (
          <p className='text-sm md:text-base text-muted-foreground max-w-xl mx-auto'>
            {descripcion}
          </p>
        )}

        {ctaLabel && (
          <div className='pt-4'>
            <Button asChild size='lg' className='bg-brand hover:bg-brand/90'>
              <Link href={href}>{ctaLabel}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
