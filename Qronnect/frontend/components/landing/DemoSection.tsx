import type { SectorShowcase } from '@/lib/sectores'
import { DemoInteractiva } from './DemoInteractiva'

/** Bloque oscuro "Pruébalo tú" con la demo del móvil del cliente */
export function DemoSection({ sector, cliente = 'cliente' }: { sector: SectorShowcase; cliente?: string }) {
  return (
    <section
      id="pruebalo"
      aria-labelledby="pruebalo-title"
      className="relative isolate scroll-mt-20 overflow-hidden bg-[var(--s-dark)] px-5 py-24 text-white sm:px-8 md:py-32"
    >
      <div
        aria-hidden="true"
        className="absolute -right-32 top-10 -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--s-primary)_30%,transparent),transparent_65%)]"
      />
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl" data-reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60">Pruébalo tú</p>
          <h2 id="pruebalo-title" className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl">
            Ponte en el lugar de tu <em className="font-accent font-normal italic text-[var(--s-on-dark)]">{cliente}</em>
          </h2>
          <p className="mt-5 text-lg text-white/65">
            Esto es lo que verá en su móvil. Toca las acciones o el botón del QR y mira cómo responde.
          </p>
        </div>
        <div className="mt-14" data-reveal>
          <DemoInteractiva sector={sector} />
        </div>
      </div>
    </section>
  )
}
