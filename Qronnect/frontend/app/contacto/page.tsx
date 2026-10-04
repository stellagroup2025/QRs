import type { CSSProperties } from 'react'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { PORTADA_PALETTE } from '@/lib/portada'
import { FormularioContacto } from '@/components/contacto/FormularioContacto'

export const metadata: Metadata = {
  title: 'Quiero Qronnect en mi negocio',
  description: 'Cuéntanos tu negocio y te enseñamos cómo quedaría tu programa de fidelización con QR.',
  alternates: { canonical: 'https://www.qronnect.es/contacto' },
}

const QUE_PASA = [
  'Te escribimos para conocer tu negocio.',
  'Te enseñamos cómo quedaría tu programa, con tu marca.',
  'Si te encaja, te ayudamos a ponerlo en marcha.',
]

export default function ContactoPage() {
  const p = PORTADA_PALETTE
  const vars = {
    '--s-primary': p.primary,
    '--s-primary-on': p.primaryOn,
    '--s-ink': p.ink,
    '--s-dark': p.dark,
    '--s-soft': p.soft,
    '--s-softer': p.softer,
  } as CSSProperties

  return (
    <div style={vars} className="min-h-screen bg-[var(--s-softer)] text-[var(--s-ink)]">
      <header className="border-b border-[var(--s-ink)]/10 bg-white/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Qronnect, ir al inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/LogoQronnect.png" alt="" className="h-8 w-8 object-contain" />
            <span className="font-display text-lg font-semibold tracking-tight">Qronnect</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60">Contacto</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl">
            Quiero Qronnect en mi negocio
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[var(--s-ink)]/70">
            Déjanos tus datos y te contamos cómo funcionaría en tu negocio. Sin compromiso.
          </p>
          <p className="mt-10 font-semibold">Qué pasa después</p>
          <ol className="mt-4 space-y-3">
            {QUE_PASA.map((paso) => (
              <li key={paso} className="flex gap-3 text-[var(--s-ink)]/75">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--s-primary)]" aria-hidden="true" />
                {paso}
              </li>
            ))}
          </ol>
          <p className="mt-10 text-sm text-[var(--s-ink)]/60">
            ¿Prefieres el email? Escríbenos a{' '}
            <a href="mailto:sales@qronnect.com" className="font-medium text-[var(--s-ink)] underline">
              sales@qronnect.com
            </a>
            .
          </p>
        </div>

        <div className="relative">
          <Suspense fallback={<div className="h-[560px] animate-pulse rounded-3xl bg-white/70" />}>
            <FormularioContacto />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
