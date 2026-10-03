import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SECTORES } from '@/lib/sectores'
import { SectorPhoto } from './SectorPhoto'

/** Tarjetas de la portada que llevan a cada landing de sector (/para/[sector]) */
export function SectorGrid() {
  const sectores = Object.values(SECTORES)

  return (
    <section id="sectores" aria-labelledby="sectores-title" className="scroll-mt-4 px-5 py-24 sm:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60">Para tu sector</p>
          <h2 id="sectores-title" className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl">
            Mira cómo funciona en un negocio como el tuyo
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[var(--s-ink)]/70">
            Ejemplos de premios, campañas y el día a día con tus clientes, contados para cada tipo de negocio.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {sectores.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/para/${s.slug}`}
                style={{ '--s-soft': s.palette.soft, '--s-softer': s.palette.softer } as React.CSSProperties}
                className="group relative flex h-96 flex-col justify-end overflow-hidden rounded-3xl text-white shadow-sm transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--s-primary)]"
              >
                <SectorPhoto
                  src={s.hero.photo}
                  position={s.hero.photoPosition ?? '50% 25%'}
                  className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(to top, ${s.palette.dark} 15%, ${s.palette.dark}cc 45%, transparent 85%)` }}
                />
                <div className="relative p-6">
                  <span
                    className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: s.palette.primary, color: s.palette.primaryOn }}
                  >
                    {s.nombre}
                  </span>
                  <p className="mt-4 text-2xl font-light leading-tight tracking-[-0.02em]">
                    {s.hero.titleStart}{' '}
                    <em className="font-accent italic" style={{ color: s.palette.accentOnDark ?? s.palette.primary }}>
                      {s.hero.titleAccent}
                    </em>
                  </p>
                  <p className="mt-2 text-sm text-white/70">{s.hero.eyebrow}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold">
                    Ver cómo funciona
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
