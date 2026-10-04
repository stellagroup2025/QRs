'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Botón de captación siempre a mano en el móvil (aparece al pasar el hero)
 * y botón de subir arriba en todas las pantallas.
 */
export function MobileCtaBar({ href, label }: { href: string; label: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let ticking = false
    const sync = () => {
      ticking = false
      setVisible(window.scrollY > window.innerHeight * 0.75)
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(sync)
      }
    }
    sync()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const subir = () =>
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })

  return (
    <>
      <div
        className={cn(
          'fixed inset-x-3 bottom-[calc(10px+env(safe-area-inset-bottom))] z-40 flex rounded-full border border-white/15 bg-[color-mix(in_oklab,var(--s-dark)_86%,transparent)] p-1.5 shadow-[0_14px_34px_-14px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-[opacity,transform] duration-300 sm:hidden',
          visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0',
        )}
        aria-hidden={!visible}
      >
        <a
          href={href}
          tabIndex={visible ? 0 : -1}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--s-primary)] px-5 text-sm font-semibold text-[var(--s-primary-on)]"
        >
          <span className="truncate">{label}</span>
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </a>
      </div>
      <button
        type="button"
        onClick={subir}
        aria-label="Subir arriba"
        tabIndex={visible ? 0 : -1}
        className={cn(
          'fixed bottom-[calc(84px+env(safe-area-inset-bottom))] right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[color-mix(in_oklab,var(--s-dark)_80%,transparent)] text-[var(--s-on-dark)] shadow-lg backdrop-blur-lg transition-[opacity,transform] duration-300 hover:-translate-y-0.5 sm:bottom-6 sm:right-6 sm:h-12 sm:w-12',
          visible ? 'opacity-100' : 'pointer-events-none translate-y-3 scale-90 opacity-0',
        )}
      >
        <ArrowUp className="h-5 w-5" aria-hidden="true" />
      </button>
    </>
  )
}
