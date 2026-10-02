import Link from 'next/link'
import type { CSSProperties } from 'react'
import { ArrowRight, Check, ChevronDown, Play, Star } from 'lucide-react'
import type { SectorData } from '@/lib/sectores'
import { LotusMark, SECTOR_ICONS } from './sector-icons'
import { SectorPhoto } from './SectorPhoto'
import { PhoneMockup } from './PhoneMockup'
import { QrStand } from './QrStand'

/**
 * Destino de los botones de captación. Provisional: abre un email a ventas con el sector
 * en el asunto, hasta que exista un formulario de contacto para negocios.
 */
function contactHref(sector: SectorData) {
  const subject = encodeURIComponent(`Quiero Qronnect para mi negocio (${sector.nombre})`)
  return `mailto:sales@qronnect.com?subject=${subject}`
}

export function SectorLanding({ sector }: { sector: SectorData }) {
  const { palette } = sector
  const vars = {
    '--s-primary': palette.primary,
    '--s-primary-on': palette.primaryOn,
    '--s-ink': palette.ink,
    '--s-soft': palette.soft,
    '--s-softer': palette.softer,
    '--s-dark': palette.dark ?? palette.ink,
  } as CSSProperties
  const cta = contactHref(sector)
  const dark = Boolean(palette.dark)
  // En el hero oscuro, el texto "tinta" pasa a blanco; el móvil recupera la tinta original
  const heroVars = dark ? ({ '--s-ink': '#FFFFFF' } as CSSProperties) : undefined

  return (
    <div style={vars} className="min-h-screen bg-[var(--s-softer)] text-[var(--s-ink)]">
      {/* Cabecera */}
      <header className="sticky top-0 z-40 border-b border-[var(--s-soft)] bg-[var(--s-softer)]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Qronnect, ir al inicio">
            <LotusMark className="h-8 w-9 text-[var(--s-primary)]" />
            <span className="leading-none">
              <span className="block font-display text-xl font-bold tracking-tight">Qronnect</span>
              <span className="hidden text-xs text-[var(--s-ink)]/70 sm:block">Fideliza. Sorprende. Haz que vuelvan.</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3">
            <a href="#como-funciona" className="hidden rounded-full px-3 py-2 text-sm font-medium text-[var(--s-ink)]/75 hover:text-[var(--s-ink)] md:block">
              Cómo funciona
            </a>
            <a href="#preguntas" className="hidden rounded-full px-3 py-2 text-sm font-medium text-[var(--s-ink)]/75 hover:text-[var(--s-ink)] md:block">
              Preguntas
            </a>
            <a
              href={cta}
              className="rounded-full bg-[var(--s-primary)] px-4 py-2 text-sm font-semibold text-[var(--s-primary-on)] transition-transform hover:-translate-y-px"
            >
              Empieza gratis
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        aria-labelledby="sector-hero"
        className={dark ? 'mx-auto max-w-7xl px-4 pb-4 pt-4 sm:px-6' : 'relative overflow-hidden'}
      >
        <div
          style={heroVars}
          className={
            dark
              ? 'relative isolate grid gap-10 overflow-hidden rounded-[36px] bg-[var(--s-dark)] px-6 pb-10 pt-10 text-white sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-14'
              : 'mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:pb-20 lg:pt-14'
          }
        >
          {dark && (
            <>
              <SectorPhoto
                src={sector.hero.photo}
                priority
                className="absolute inset-0 -z-20 h-full w-full object-[center_15%] lg:left-[44%] lg:w-[36%]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0/0.72),var(--s-dark)_60%)] lg:bg-[linear-gradient(90deg,var(--s-dark)_46%,rgb(0_0_0/0.1)_62%,transparent_70%,var(--s-dark)_90%)]"
              />
            </>
          )}
          <div className="relative z-10">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--s-primary)]">
              Para {sector.nombre.toLowerCase()}
            </p>
            <h1
              id="sector-hero"
              className="font-display text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.035em] text-balance sm:text-6xl xl:text-7xl"
            >
              {sector.hero.titleStart}{' '}
              <span className="text-[var(--s-primary)]">{sector.hero.titleHighlight}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--s-ink)]/80 sm:text-xl">
              {sector.hero.subtitle}
            </p>

            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {sector.hero.features.map((f) => {
                const Icon = SECTOR_ICONS[f.icon]
                return (
                  <li key={f.title} className="flex gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--s-soft)] text-[var(--s-primary)]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-display font-bold">{f.title}</span>
                      {f.text && <span className="block text-sm text-[var(--s-ink)]/70">{f.text}</span>}
                    </span>
                  </li>
                )
              })}
            </ul>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={cta}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[var(--s-primary)] px-8 text-lg font-semibold text-[var(--s-primary-on)] shadow-[0_14px_28px_-14px_var(--s-primary)] transition-transform hover:-translate-y-0.5"
              >
                Empieza gratis
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                href="#como-funciona"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-[var(--s-ink)]/25 px-7 text-lg font-semibold transition-colors hover:border-[var(--s-ink)]/60"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                Ver cómo funciona
              </a>
            </div>
          </div>

          {dark ? (
            <div className="relative flex justify-center lg:justify-end">
              <PhoneMockup sector={sector} className="rotate-[4deg] scale-90 sm:scale-100" />
            </div>
          ) : (
            <div className="relative mx-auto w-full max-w-[640px] pb-10 lg:max-w-none lg:pb-0">
              <SectorPhoto
                src={sector.hero.photo}
                alt=""
                priority
                className="h-[440px] w-[82%] rounded-[36px] sm:h-[560px] sm:w-[78%]"
              />
              <PhoneMockup
                sector={sector}
                className="absolute bottom-0 right-0 origin-bottom-right rotate-[3deg] scale-[0.72] sm:scale-90 lg:-bottom-8 xl:scale-100"
              />
            </div>
          )}
        </div>
      </section>

      {/* Premio + propuesta de valor + cifras */}
      <section id="como-funciona" aria-label="Cómo funciona" className="mx-auto max-w-7xl scroll-mt-20 px-4 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="relative isolate flex min-h-[300px] overflow-hidden rounded-[28px] bg-[var(--s-dark)] text-white">
            <SectorPhoto src={sector.rewardBanner.photo} className="absolute inset-y-0 right-0 -z-10 h-full w-3/5 opacity-90" />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--s-dark)_45%,transparent)]" aria-hidden="true" />
            <div className="flex max-w-sm flex-col justify-center p-8 sm:p-10">
              <h2 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl">
                {sector.rewardBanner.title}
                {sector.rewardBanner.titleHighlight && (
                  <>
                    {' '}
                    <span className="text-[var(--s-primary)]">{sector.rewardBanner.titleHighlight}</span>
                  </>
                )}
              </h2>
              <p className="mt-4 text-white/85">{sector.rewardBanner.text}</p>
              <a
                href={cta}
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--s-primary)] px-5 py-3 font-semibold text-[var(--s-primary-on)]"
              >
                {sector.rewardBanner.cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </article>

          <div className="grid gap-4">
            <div
              className={`grid gap-6 rounded-[28px] bg-white p-7 sm:gap-0 sm:divide-x sm:divide-[var(--s-soft)] ${
                sector.valueProps.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'sm:grid-cols-3'
              }`}
            >
              {sector.valueProps.map((v) => {
                const Icon = SECTOR_ICONS[v.icon]
                return (
                  <div key={v.title} className="text-center sm:px-4">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--s-soft)] text-[var(--s-primary)]">
                      <Icon className="h-7 w-7" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold leading-tight">{v.title}</h3>
                    {v.text && <p className="mt-1.5 text-sm text-[var(--s-ink)]/70">{v.text}</p>}
                  </div>
                )
              })}
            </div>
            <dl className="grid grid-cols-2 gap-6 rounded-[28px] bg-white p-7 sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-[var(--s-soft)]">
              {sector.stats.map((s) => (
                <div key={s.label} className="flex flex-col text-center sm:px-4">
                  <dt className="order-2 mt-1 text-sm text-[var(--s-ink)]/70">{s.label}</dt>
                  <dd className="order-1 font-display text-4xl font-extrabold tracking-tight text-[var(--s-primary)]">{s.value}</dd>
                </div>
              ))}
              <div className="flex flex-col items-center justify-center text-center sm:px-4">
                <SECTOR_ICONS.chart className="h-9 w-9 text-[var(--s-primary)]" aria-hidden="true" />
                <span className="mt-1 text-sm text-[var(--s-ink)]/70">Todo en una única plataforma</span>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Tratamientos, promociones, expositor y testimonio */}
      <section aria-label="Ejemplos para tu negocio" className="mx-auto mt-4 grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2 xl:grid-cols-[0.8fr_1.3fr_0.75fr_1fr]">
        <article className="relative isolate overflow-hidden rounded-[28px] bg-white p-7">
          <SectorPhoto src={sector.services.photo} className="absolute inset-y-0 right-0 -z-10 h-full w-2/5 opacity-90" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#fff_60%,transparent)]" aria-hidden="true" />
          <h2 className="max-w-[12ch] font-display text-2xl font-extrabold leading-tight tracking-tight">{sector.services.title}</h2>
          <ul className="mt-5 space-y-2">
            {sector.services.items.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[15px]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--s-primary)] text-[var(--s-primary-on)]">
                  <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[28px] bg-white p-6">
          <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            {sector.promos.titleStart} <span className="text-[var(--s-primary)]">{sector.promos.titleHighlight}</span>
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {sector.promos.items.map((p) => {
              const Icon = SECTOR_ICONS[p.icon]
              return (
                <div key={p.title} className="overflow-hidden rounded-2xl ring-1 ring-[var(--s-soft)]">
                  <SectorPhoto src={p.photo} className="h-32 w-full" />
                  <div className="relative px-3 pb-4 pt-7 text-center">
                    <span className="absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-white text-[var(--s-primary)] shadow-md">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="font-display font-bold">{p.title}</p>
                    <p className="text-xs text-[var(--s-ink)]/65">{p.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="relative isolate flex items-center justify-center overflow-hidden rounded-[28px] bg-[var(--s-soft)] p-8">
          <SectorPhoto src={sector.qrStand.photo} className="absolute inset-0 -z-10 h-full w-full opacity-60" />
          <QrStand sector={sector} />
        </article>

        <figure className="relative isolate flex min-h-[260px] overflow-hidden rounded-[28px] bg-[var(--s-dark)] text-white">
          <SectorPhoto src={sector.testimonial.photo} className="absolute inset-y-0 right-0 -z-10 h-full w-1/2" />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--s-dark)_55%,transparent)]" aria-hidden="true" />
          <div className="flex max-w-[22rem] flex-col justify-center p-7">
            <div className="flex gap-0.5 text-amber-400" aria-label="5 de 5 estrellas">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" aria-hidden="true" />
              ))}
            </div>
            <blockquote className="mt-4 text-lg font-medium leading-snug">“{sector.testimonial.quote}”</blockquote>
            <figcaption className="mt-5 text-sm">
              <span className="block font-semibold">{sector.testimonial.author}</span>
              <span className="text-white/75">{sector.testimonial.role}</span>
            </figcaption>
          </div>
        </figure>
      </section>

      {/* Plataforma + CTA final */}
      <section aria-label="Todo lo que incluye" className="mx-auto mt-4 grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
        <ul
          className={`grid grid-cols-2 content-center gap-x-4 gap-y-7 rounded-[28px] bg-white p-7 ${
            sector.platform.length > 6 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'
          }`}
        >
          {sector.platform.map((f) => {
            const Icon = SECTOR_ICONS[f.icon]
            return (
              <li key={f.title} className="flex flex-col items-center text-center">
                <Icon className="h-9 w-9 text-[var(--s-primary)]" strokeWidth={1.6} aria-hidden="true" />
                <span className="mt-2 text-sm font-medium leading-tight">{f.title}</span>
              </li>
            )
          })}
        </ul>

        <article
          className={`relative isolate grid overflow-hidden rounded-[28px] bg-[linear-gradient(120deg,#fff,var(--s-soft))] ${
            sector.finalCta.notifications?.length ? 'sm:grid-cols-[1fr_15rem]' : ''
          }`}
        >
          <SectorPhoto
            src={sector.finalCta.photo}
            className={`absolute inset-y-0 right-0 -z-10 h-full ${
              sector.finalCta.notifications?.length ? 'w-1/3 opacity-30' : 'w-1/2 [mask-image:linear-gradient(90deg,transparent,#000_40%)]'
            }`}
          />
          <div className={`p-7 sm:p-9 ${sector.finalCta.notifications?.length ? '' : 'sm:max-w-[62%]'}`}>
            <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tight">
              {sector.finalCta.titleStart}{' '}
              {sector.finalCta.titleHighlight && (
                <span className="text-[var(--s-primary)]">{sector.finalCta.titleHighlight}</span>
              )}{' '}
              {sector.finalCta.titleEnd}
            </h2>
            <p className="mt-3 text-[var(--s-ink)]/75">{sector.finalCta.subtitle}</p>
            <a
              href={cta}
              className="mt-6 inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-xl bg-[var(--s-primary)] px-6 font-semibold text-[var(--s-primary-on)]"
            >
              Solicita una demo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          {sector.finalCta.notifications?.length ? (
          <ul className="flex flex-col justify-center gap-2.5 p-7 pt-0 sm:p-7 sm:pl-0" aria-label="Ejemplos de avisos">
            {sector.finalCta.notifications.map((n) => {
              const Icon = SECTOR_ICONS[n.icon]
              return (
                <li key={n.title} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                  <Icon className="h-5 w-5 shrink-0 text-[var(--s-primary)]" aria-hidden="true" />
                  <span className="min-w-0 leading-tight">
                    <span className="block text-xs font-bold">{n.title}</span>
                    <span className="block truncate text-[11px] text-[var(--s-ink)]/65">{n.text}</span>
                  </span>
                </li>
              )
            })}
          </ul>
          ) : null}
        </article>
      </section>

      {/* Preguntas frecuentes */}
      <section id="preguntas" aria-labelledby="faq-title" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-20 sm:px-6">
        <h2 id="faq-title" className="text-center font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Preguntas frecuentes
        </h2>
        <div className="mt-10 space-y-3">
          {sector.faq.map((item) => (
            <details key={item.q} className="group rounded-2xl bg-white p-5 open:shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold">
                {item.q}
                <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-3 leading-relaxed text-[var(--s-ink)]/75">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--s-soft)]">
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
