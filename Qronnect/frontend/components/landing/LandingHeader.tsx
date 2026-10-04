'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SoundToggle } from './SoundToggle'

export interface LandingNavItem {
  href: string
  label: string
}

/**
 * Cabecera fija de las landings: transparente sobre el hero oscuro y con cristal al bajar.
 * Lleva la barra de progreso de lectura (la mueve ScrollFx) y el altavoz de los sonidos.
 */
export function LandingHeader({ brand, nav = [] }: { brand: ReactNode; nav?: LandingNavItem[] }) {
  const [solida, setSolida] = useState(false)

  useEffect(() => {
    const sync = () => setSolida(window.scrollY > 24)
    sync()
    window.addEventListener('scroll', sync, { passive: true })
    return () => window.removeEventListener('scroll', sync)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b text-white transition-[background-color,border-color,backdrop-filter] duration-300',
        solida
          ? 'border-white/10 bg-[color-mix(in_oklab,var(--s-dark)_82%,transparent)] backdrop-blur-xl backdrop-saturate-150'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:h-20 sm:gap-6 sm:px-8">
        {brand}
        <nav aria-label="Secciones" className="hidden items-center gap-7 text-sm text-white/70 lg:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="transition-colors hover:text-white">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <SoundToggle className="border-white/15 bg-white/5 text-white/80 hover:border-[var(--s-on-dark)] hover:text-[var(--s-on-dark)]" />
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--s-dark)] transition-transform hover:-translate-y-0.5"
          >
            <span className="sm:hidden">Mi panel</span>
            <span className="hidden sm:inline">Acceder a mi panel</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div
        id="scroll-progress"
        aria-hidden="true"
        className="absolute bottom-[-1px] left-0 h-0.5 w-full origin-left scale-x-0 bg-[var(--s-on-dark)]"
      />
    </header>
  )
}
