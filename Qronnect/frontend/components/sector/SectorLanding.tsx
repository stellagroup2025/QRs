import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { ArrowRight, ChevronDown, Sparkles, Star } from 'lucide-react'
import type { SectorData } from '@/lib/sectores'
import { cn } from '@/lib/utils'
import { LotusMark, SECTOR_ICONS } from './sector-icons'
import { SectorPhoto } from './SectorPhoto'
import { DashboardMockup, PhoneMockup } from './PhoneMockup'
import { QrStand } from './QrStand'

/**
 * Destino de los botones de captación. Provisional: abre un email a ventas con el sector
 * en el asunto, hasta que exista un formulario de contacto para negocios.
 */
function contactHref(sector: SectorData) {
  const subject = encodeURIComponent(`Quiero Qronnect para mi negocio (${sector.nombre})`)
  return `mailto:sales@qronnect.com?subject=${subject}`
}

/** Encabezado de sección centrado con línea de color encima, al estilo de la referencia */
function SectionHeading({ eyebrow, title, subtitle, id }: { eyebrow: string; title: ReactNode; subtitle?: string; id: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="inline-flex items-center gap-2 font-semibold text-[var(--s-primary)]">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 id={id} className="mt-3 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-5 text-lg leading-relaxed text-[var(--s-ink)]/70">{subtitle}</p>}
    </div>
  )
}

function PrimaryButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={cn(
        'inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--s-primary)] px-8 text-lg font-bold text-[var(--s-primary-on)] shadow-[0_14px_28px_-14px_var(--s-primary)] transition-transform hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
      <ArrowRight className="h-5 w-5" aria-hidden="true" />
    </a>
  )
}

export function SectorLanding({ sector }: { sector: SectorData }) {
  const { palette } = sector
  const vars = {
    '--s-primary': palette.primary,
    '--s-primary-on': palette.primaryOn,
    '--s-ink': palette.ink,
    '--s-soft': palette.soft,
    '--s-softer': palette.softer,
  } as CSSProperties
  const cta = contactHref(sector)
  // Colores de los círculos de iconos y cifras: principal y los dos acentos
  const circleColors = [palette.primary, palette.accents[0], palette.accents[1]]

  return (
    <div style={vars} className="min-h-screen overflow-x-clip bg-white text-[var(--s-ink)]">
      {/* Cabecera de color sólido */}
      <header className="sticky top-0 z-40 bg-[linear-gradient(90deg,var(--s-primary),color-mix(in_oklab,var(--s-primary)_80%,black))] text-[var(--s-primary-on)] shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Qronnect, ir al inicio">
            <LotusMark className="h-8 w-9" />
            <span className="font-display text-2xl font-bold tracking-tight">Qronnect</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-6">
            <a href="#como-funciona" className="hidden text-[15px] font-medium opacity-90 hover:opacity-100 md:block">Cómo funciona</a>
            <a href="#ventajas" className="hidden text-[15px] font-medium opacity-90 hover:opacity-100 md:block">Ventajas</a>
            <a href="#preguntas" className="hidden text-[15px] font-medium opacity-90 hover:opacity-100 md:block">Preguntas</a>
            <Link href="/admin/login" className="hidden text-[15px] font-medium opacity-90 hover:opacity-100 sm:block">Acceso negocios</Link>
            <a
              href={cta}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[var(--s-ink)] shadow-sm transition-transform hover:-translate-y-px sm:text-base"
            >
              Empieza gratis
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section aria-labelledby="sector-hero" className="relative overflow-hidden bg-[var(--s-softer)]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-6 lg:pb-24 lg:pt-20">
          <div className="relative z-10 max-w-xl">
            <p className="inline-block rounded-lg bg-white px-3 py-1.5 text-sm font-bold uppercase tracking-wide shadow-sm">
              {sector.hero.eyebrow}
            </p>
            <h1
              id="sector-hero"
              className="mt-6 font-display text-[2.8rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl xl:text-[4.25rem]"
            >
              {sector.hero.titleStart} <span className="text-[var(--s-primary)]">{sector.hero.titleHighlight}</span>
            </h1>
            <p className="mt-6 text-lg leading-[1.8] text-[var(--s-ink)]/80 sm:text-xl sm:leading-[1.8]">{sector.hero.subtitle}</p>
            <div className="mt-8">
              <PrimaryButton href={cta}>Empieza gratis</PrimaryButton>
              <p className="mt-4 font-medium text-[var(--s-ink)]/75">{sector.hero.reassurance}</p>
            </div>
          </div>

          {/* Móvil con la tarjeta de sellos y, detrás, el panel del negocio */}
          <div className="relative mx-auto h-[470px] w-full max-w-[560px] sm:h-[600px] lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute right-[-12%] top-[6%] h-[80%] w-[80%] rounded-[42%_58%_55%_45%/48%_40%_60%_52%] bg-[var(--s-soft)]"
            />
            <DashboardMockup
              sector={sector}
              className="absolute right-[-210px] top-[150px] hidden origin-top-left scale-[0.92] sm:block xl:right-[-120px]"
            />
            <PhoneMockup
              sector={sector}
              className="absolute left-1/2 top-0 origin-top -translate-x-1/2 scale-[0.82] sm:left-[6%] sm:translate-x-0 sm:scale-100"
            />
          </div>
        </div>
      </section>

      {/* Banda de confianza */}
      <section aria-label="Qronnect en cifras" className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 md:py-24">
        <p className="mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">{sector.proof.text}</p>
        <dl className="mt-12 grid gap-10 sm:grid-cols-3">
          {sector.proof.stats.map((s, i) => {
            const color = circleColors[i % circleColors.length]
            const Icon = SECTOR_ICONS[(['stamp', 'gift', 'star'] as const)[i % 3]]
            return (
              <div key={s.label} className="flex flex-col items-center">
                <span
                  className="order-0 flex h-24 w-24 items-center justify-center rounded-full border-[5px]"
                  style={{ borderColor: color, backgroundColor: `color-mix(in oklab, ${color} 14%, white)`, color }}
                >
                  <Icon className="h-10 w-10" aria-hidden="true" />
                </span>
                <dt className="order-2 mt-1 font-semibold">{s.label}</dt>
                <dd className="order-1 mt-5 font-display text-5xl font-extrabold tracking-tight" style={{ color }}>
                  {s.value}
                </dd>
              </div>
            )
          })}
        </dl>
      </section>

      {/* Ventajas */}
      <section id="ventajas" aria-labelledby="ventajas-title" className="scroll-mt-20 bg-[var(--s-softer)] px-4 py-20 sm:px-6 md:py-28">
        <SectionHeading
          id="ventajas-title"
          eyebrow={sector.features.eyebrow}
          title={
            <>
              {sector.features.title1}
              <br className="hidden sm:block" /> {sector.features.title2}
            </>
          }
        />
        <ul className="mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sector.features.items.map((f, i) => {
            const Icon = SECTOR_ICONS[f.icon]
            const color = circleColors[i % circleColors.length]
            return (
              <li key={f.title} className="rounded-3xl bg-white p-7 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: `color-mix(in oklab, ${color} 14%, white)`, color }}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold">{f.title}</h3>
                {f.text && <p className="mt-2 leading-relaxed text-[var(--s-ink)]/70">{f.text}</p>}
              </li>
            )
          })}
        </ul>
      </section>

      {/* Historias: foto y texto alternos */}
      <section aria-label="Para qué sirve" className="space-y-20 py-20 md:space-y-28 md:py-28">
        {sector.stories.map((story, i) => {
          const reverse = i % 2 === 1
          const color = circleColors[(i + 1) % circleColors.length]
          return (
            <article
              key={story.titleHighlight}
              className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-16"
            >
              <div className={cn('relative', reverse && 'md:order-2')}>
                <div
                  aria-hidden="true"
                  className={cn(
                    'absolute -bottom-3 h-full w-full rounded-[32px] sm:-bottom-5',
                    reverse ? '-right-3 sm:-right-5' : '-left-3 sm:-left-5',
                  )}
                  style={{ backgroundColor: `color-mix(in oklab, ${color} 45%, white)` }}
                />
                <SectorPhoto src={story.photo} className="relative aspect-[4/3] w-full rounded-[32px]" />
              </div>
              <div>
                <h2 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
                  {story.titleStart} <span style={{ color }}>{story.titleHighlight}</span>
                </h2>
                <p className="mt-6 text-lg font-bold leading-relaxed">{story.lead}</p>
                <p className="mt-4 text-lg leading-[1.8] text-[var(--s-ink)]/75">{story.body}</p>
              </div>
            </article>
          )
        })}
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" aria-labelledby="pasos-title" className="scroll-mt-20 bg-[var(--s-softer)] px-4 py-20 sm:px-6 md:py-28">
        <SectionHeading id="pasos-title" eyebrow="Cómo funciona" title="Tres pasos. Cero complicaciones." />
        <ol className="mx-auto mt-16 grid max-w-6xl gap-14 md:grid-cols-3 md:gap-8">
          {sector.steps.map((step, i) => {
            const Icon = SECTOR_ICONS[step.icon]
            const color = circleColors[i % circleColors.length]
            return (
              <li key={step.title} className="flex flex-col items-center">
                <span
                  className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full border-[7px] text-white shadow-lg"
                  style={{ backgroundColor: color, borderColor: `color-mix(in oklab, ${color} 75%, black)` }}
                >
                  <Icon className="h-14 w-14" aria-hidden="true" />
                </span>
                <div className="-mt-6 w-full flex-1 rounded-3xl border border-black/5 bg-white px-6 pb-8 pt-12 text-center">
                  <p className="font-semibold text-[var(--s-ink)]/60">Paso {i + 1}</p>
                  <h3 className="mt-1 font-display text-2xl font-extrabold">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-[var(--s-ink)]/75">{step.text}</p>
                </div>
              </li>
            )
          })}
        </ol>
        <div className="mt-14 text-center">
          <PrimaryButton href={cta}>Crea tu tarjeta de sellos</PrimaryButton>
        </div>
      </section>

      {/* Ideas de promociones */}
      <section aria-labelledby="promos-title" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
        <h2 id="promos-title" className="text-center font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          {sector.promos.titleStart} <span className="text-[var(--s-primary)]">{sector.promos.titleHighlight}</span>
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {sector.promos.items.map((p) => {
            const Icon = SECTOR_ICONS[p.icon]
            return (
              <article key={p.title} className="overflow-hidden rounded-3xl border border-black/5 bg-white">
                <SectorPhoto src={p.photo} className="aspect-[16/10] w-full" />
                <div className="relative px-6 pb-7 pt-9 text-center">
                  <span className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-white text-[var(--s-primary)] shadow-md">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-xl font-bold">{p.title}</h3>
                  <p className="mt-1 text-[var(--s-ink)]/65">{p.text}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Testimonio y resultados */}
      <section aria-label="Lo que dicen nuestros clientes" className="bg-[var(--s-ink)] text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-[auto_1fr] md:py-24">
          <SectorPhoto
            src={sector.testimonial.photo}
            className="mx-auto h-56 w-56 rounded-full ring-8 ring-white/10 md:h-64 md:w-64"
          />
          <figure>
            <div className="flex gap-1 text-amber-400" aria-label="5 de 5 estrellas">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-current" aria-hidden="true" />
              ))}
            </div>
            <blockquote className="mt-5 font-display text-2xl font-semibold leading-snug sm:text-3xl">
              “{sector.testimonial.quote}”
            </blockquote>
            <figcaption className="mt-6">
              <span className="block text-lg font-bold">{sector.testimonial.author}</span>
              <span className="text-white/70">{sector.testimonial.role}</span>
            </figcaption>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/15 pt-8">
              {sector.results.stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="order-2 mt-1 text-sm text-white/70">{s.label}</dt>
                  <dd className="order-1 font-display text-3xl font-extrabold text-[var(--s-primary)] sm:text-4xl">{s.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-white/50">{sector.results.footnote}</p>
          </figure>
        </div>
      </section>

      {/* CTA final */}
      <section aria-labelledby="cta-title" className="bg-[var(--s-softer)]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-[1fr_auto] md:py-24">
          <div>
            <h2 id="cta-title" className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl">
              {sector.finalCta.titleStart}{' '}
              <span className="text-[var(--s-primary)]">{sector.finalCta.titleHighlight}</span>
            </h2>
            <p className="mt-5 text-lg text-[var(--s-ink)]/75">{sector.finalCta.subtitle}</p>
            <div className="mt-8">
              <PrimaryButton href={cta}>Solicita una demo</PrimaryButton>
              <p className="mt-4 font-medium text-[var(--s-ink)]/75">{sector.hero.reassurance}</p>
            </div>
          </div>
          <QrStand sector={sector} />
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section id="preguntas" aria-labelledby="faq-title" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 sm:px-6 md:py-24">
        <h2 id="faq-title" className="text-center font-display text-4xl font-extrabold tracking-tight">
          Preguntas frecuentes
        </h2>
        <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
          {sector.faq.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold">
                {item.q}
                <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-3 leading-relaxed text-[var(--s-ink)]/75">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[var(--s-ink)]/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Qronnect · Un producto de StellaGroup</p>
          <nav aria-label="Enlaces legales" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/" className="hover:text-[var(--s-ink)]">Inicio</Link>
            <Link href="/terminos" className="hover:text-[var(--s-ink)]">Términos</Link>
            <Link href="/privacidad" className="hover:text-[var(--s-ink)]">Privacidad</Link>
            <Link href="/politica-cookies" className="hover:text-[var(--s-ink)]">Cookies</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
