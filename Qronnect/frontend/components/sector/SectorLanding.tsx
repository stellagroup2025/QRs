import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { ArrowDown, ArrowRight, Check, Minus, Plus, Star, X } from 'lucide-react'
import type { SectorData } from '@/lib/sectores'
import { cn } from '@/lib/utils'
import { LotusMark, SECTOR_ICONS } from './sector-icons'
import { SectorPhoto } from './SectorPhoto'
import { PhoneMockup } from './PhoneMockup'
import { HowItWorks } from './HowItWorks'

/** Destino de los botones de captación: el formulario de contacto, con el sector ya elegido */
function contactHref(sector: SectorData) {
  return `/contacto?sector=${sector.slug}&origen=/para/${sector.slug}`
}

/** Etiqueta pequeña en mayúsculas espaciadas que abre cada bloque */
function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60', className)}>{children}</p>
}

function CtaButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={cn(
        'inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[var(--s-primary)] px-8 py-3 text-center text-base font-semibold text-[var(--s-primary-on)] shadow-[0_18px_40px_-18px_var(--s-primary)] transition-transform hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </a>
  )
}

/** Palabra destacada: serif en cursiva y color del sector */
function Accent({ children }: { children: ReactNode }) {
  return <em className="font-accent font-normal italic text-[var(--s-on-dark)]">{children}</em>
}

export function SectorLanding({ sector }: { sector: SectorData }) {
  const { palette } = sector
  const vars = {
    '--s-primary': palette.primary,
    '--s-primary-on': palette.primaryOn,
    '--s-ink': palette.ink,
    '--s-dark': palette.dark,
    // Color de acento legible sobre las secciones oscuras
    '--s-on-dark': palette.accentOnDark ?? palette.primary,
    '--s-soft': palette.soft,
    '--s-softer': palette.softer,
  } as CSSProperties
  const cta = contactHref(sector)
  const ctaLabel = sector.hero.ctaLabel

  return (
    <div style={vars} className="min-h-screen overflow-x-clip bg-[var(--s-softer)] text-[var(--s-ink)]">
      {/* ───────── Hero oscuro con la foto de fondo ───────── */}
      <section aria-labelledby="sector-hero" className="relative isolate overflow-hidden bg-[var(--s-dark)] text-white">
        <SectorPhoto
          src={sector.hero.photo}
          priority
          position={sector.hero.photoPosition ?? '50% 25%'}
          className="absolute inset-0 -z-20 h-full w-full opacity-70 lg:left-auto lg:w-[60%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--s-dark)_70%,transparent),var(--s-dark)_75%)] lg:bg-[linear-gradient(90deg,var(--s-dark)_40%,color-mix(in_oklab,var(--s-dark)_55%,transparent)_70%,color-mix(in_oklab,var(--s-dark)_35%,transparent))]"
        />

        <header className="border-b border-white/10">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
            <Link href="/" className="flex items-center gap-2.5" aria-label="Qronnect, ir al inicio">
              <LotusMark className="h-7 w-8 text-[var(--s-on-dark)]" />
              <span className="leading-none">
                <span className="block font-display text-xl font-semibold tracking-tight">Qronnect</span>
                <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.25em] text-white/60">
                  {sector.nombre}
                </span>
              </span>
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--s-dark)]"
            >
              <span className="sm:hidden">Mi panel</span>
              <span className="hidden sm:inline">Acceder a mi panel</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:pb-20 lg:pt-20">
          <div>
            <p className="flex items-center gap-4 text-white/75">
              <span className="h-px w-14 bg-[var(--s-primary)]" aria-hidden="true" />
              {sector.hero.eyebrow}
            </p>
            <h1
              id="sector-hero"
              className="mt-8 text-[3.2rem] font-light leading-[0.98] tracking-[-0.045em] text-balance sm:text-7xl xl:text-[6.2rem]"
            >
              {sector.hero.titleStart} <Accent>{sector.hero.titleAccent}</Accent>
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-snug text-white/60 sm:text-2xl">
              {sector.hero.subtitleLead} <strong className="font-semibold text-white">{sector.hero.subtitleStrong}</strong>
            </p>
          </div>

          <div className="relative hidden justify-end lg:flex">
            <PhoneMockup sector={sector} className="rotate-[4deg]" />
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 border-t border-white/10 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:items-end">
          <p className="max-w-lg text-lg leading-relaxed text-white/75">{sector.hero.intro}</p>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <CtaButton href={cta}>{ctaLabel}</CtaButton>
            <p className="text-sm text-white/55">{sector.hero.reassurance}</p>
            <a href="#como-funciona" className="inline-flex items-center gap-2 text-sm font-medium text-white/85 hover:text-white">
              Cómo funciona
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* En móvil el teléfono va debajo del texto */}
        <div className="flex justify-center pb-14 lg:hidden">
          <PhoneMockup sector={sector} className="scale-90" />
        </div>
      </section>

      {/* ───────── Cómo funciona, paso a paso ───────── */}
      <HowItWorks sector={sector} />

      {/* ───────── Problema ───────── */}
      <section aria-labelledby="problema-title" className="px-5 py-24 text-center sm:px-8 md:py-32">
        <Label className="text-[var(--s-ink)]">{sector.problem.eyebrow}</Label>
        <h2 id="problema-title" className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-5xl">
          {sector.problem.title1}
          <br />
          {sector.problem.title2}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[var(--s-ink)]/65">{sector.problem.body}</p>
        <p className="mt-14 font-display text-3xl font-bold tracking-tight sm:text-4xl">{sector.problem.contrast1}</p>
        <p className="font-accent text-4xl italic text-[var(--s-primary)] sm:text-5xl">{sector.problem.contrast2}</p>
        <p className="mx-auto mt-14 max-w-xl text-[var(--s-ink)]/65">{sector.problem.tail1}</p>
        <p className="mx-auto mt-3 max-w-2xl font-display text-2xl font-bold leading-snug tracking-tight text-balance">
          {sector.problem.tail2}
        </p>
      </section>

      {/* ───────── Método (oscuro) ───────── */}
      <section id="metodo" aria-labelledby="metodo-title" className="scroll-mt-4 bg-[var(--s-dark)] px-5 py-24 text-white sm:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Label>{sector.method.eyebrow}</Label>
          <h2 id="metodo-title" className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            {sector.method.title}
          </h2>
          <p className="mt-5 max-w-xl text-lg text-white/65">{sector.method.subtitle}</p>

          <p className="mt-14 flex flex-wrap items-baseline gap-x-4 gap-y-2 font-display text-2xl font-semibold tracking-tight sm:text-4xl">
            {sector.method.equation.map((term, i) => (
              <span key={term} className="inline-flex items-baseline gap-4">
                {i > 0 && <Plus className="h-5 w-5 self-center text-white/35" aria-label="más" />}
                {term}
              </span>
            ))}
            <span className="text-white/35" aria-label="igual a">=</span>
            <span className="font-accent text-3xl font-normal italic text-[var(--s-on-dark)] sm:text-5xl">{sector.method.result}</span>
          </p>

          <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {sector.method.pillars.map((p, i) => {
              const Icon = SECTOR_ICONS[p.icon]
              return (
                <li key={p.title} className="border-t border-white/10 pt-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-[var(--s-on-dark)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-6 text-xs tracking-[0.2em] text-white/45">0{i + 1}</p>
                  <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">{p.title}</h3>
                  <p className="mt-1 font-medium text-white/90">{p.subtitle}</p>
                  <p className="mt-4 leading-relaxed text-white/60">{p.text}</p>
                </li>
              )
            })}
          </ol>

          <div className="mt-24">
            <Label>{sector.ideas.label}</Label>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {sector.ideas.items.map((idea) => (
                <li key={idea.title}>
                  <SectorPhoto src={idea.photo} className="aspect-[4/3] w-full rounded-2xl" />
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{idea.label}</p>
                  <h3 className="mt-1 font-display text-xl font-bold uppercase tracking-tight">{idea.title}</h3>
                  <p className="mt-1 text-sm text-white/60">{idea.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-20 flex flex-col gap-8 border-t border-white/10 pt-12 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold tracking-tight">{sector.ideas.ctaTitle}</h2>
              <p className="mt-3 text-white/65">{sector.ideas.ctaText}</p>
            </div>
            <CtaButton href={cta} className="shrink-0">{ctaLabel}</CtaButton>
          </div>
        </div>
      </section>

      {/* ───────── Qué incluye y para quién es ───────── */}
      <section aria-labelledby="incluye-title" className="px-5 py-24 sm:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Label className="text-center">{sector.included.title}</Label>
          <h2 id="incluye-title" className="sr-only">{sector.included.title}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {sector.included.items.map((item, i) => (
              <li key={item.title} className="rounded-2xl border border-[var(--s-ink)]/10 bg-white p-7">
                <p className="text-xs font-semibold tracking-[0.2em] text-[var(--s-primary)]">
                  0{i + 1} — {item.title.toUpperCase()}
                </p>
                <p className="mt-3 leading-relaxed text-[var(--s-ink)]/70">{item.text}</p>
              </li>
            ))}
          </ul>

          {/* Para quién es / para quién no es */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--s-ink)]/10 bg-white p-7">
              <p className="flex items-center gap-2 font-semibold">
                <Check className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                Para quién es
              </p>
              <ul className="mt-4 space-y-3 text-[var(--s-ink)]/70">
                {sector.fit.forWho.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-[var(--s-ink)]/10 bg-white p-7">
              <p className="flex items-center gap-2 font-semibold">
                <X className="h-5 w-5 text-[var(--s-ink)]/40" aria-hidden="true" />
                Para quién no es
              </p>
              <ul className="mt-4 space-y-3 text-[var(--s-ink)]/70">
                {sector.fit.notFor.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Testimonio y resultados ───────── */}
      <section aria-label="Lo que dicen los negocios que usan Qronnect" className="border-t border-[var(--s-ink)]/10 px-5 py-24 sm:px-8 md:py-28">
        <figure className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[auto_1fr]">
          <SectorPhoto src={sector.testimonial.photo} className="mx-auto h-48 w-48 rounded-full md:h-60 md:w-60" />
          <div>
            <div className="flex gap-1 text-amber-500" aria-label="5 de 5 estrellas">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current" aria-hidden="true" />
              ))}
            </div>
            <blockquote className="mt-5 text-3xl font-light leading-snug tracking-[-0.02em] sm:text-4xl">
              “{sector.testimonial.quote}”
            </blockquote>
            <figcaption className="mt-6 text-sm">
              <span className="font-semibold">{sector.testimonial.author}</span>
              <span className="text-[var(--s-ink)]/55"> · {sector.testimonial.role}</span>
            </figcaption>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-[var(--s-ink)]/10 pt-8">
              {sector.stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="order-2 mt-1 text-sm text-[var(--s-ink)]/60">{s.label}</dt>
                  <dd className="order-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">{s.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-[var(--s-ink)]/45">{sector.statsFootnote}</p>
          </div>
        </figure>
      </section>

      {/* ───────── Cierre (oscuro) ───────── */}
      <section aria-labelledby="cierre-title" className="bg-[var(--s-dark)] px-5 py-24 text-center text-white sm:px-8 md:py-32">
        <h2 id="cierre-title" className="mx-auto max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-6xl">
          {sector.closing.title1}
          <br />
          <span className="text-white/45">{sector.closing.title2}</span>
        </h2>
        <p className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-x-3 gap-y-2 text-xl text-white/85 sm:text-2xl">
          {sector.closing.rhythm.map((r, i) => (
            <span key={r} className="inline-flex items-center gap-3">
              {i > 0 && <Minus className="h-3 w-3 text-white/30" aria-hidden="true" />}
              {r}
            </span>
          ))}
        </p>
        <p className="mt-12 text-lg text-white/60">{sector.closing.line1}</p>
        <p className="mt-1 font-display text-2xl font-bold sm:text-3xl">{sector.closing.line2}</p>
        <p className="mt-12 text-white/60">{sector.closing.pre}</p>
        <p className="mx-auto mt-2 max-w-2xl font-accent text-4xl italic leading-tight text-[var(--s-on-dark)] sm:text-5xl">
          {sector.closing.highlight}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <CtaButton href={cta}>{ctaLabel}</CtaButton>
          <p className="text-sm text-white/50">{sector.hero.reassurance}</p>
        </div>
      </section>

      {/* ───────── Preguntas frecuentes ───────── */}
      <section
        id="preguntas"
        aria-labelledby="faq-title"
        className="mx-auto grid max-w-6xl scroll-mt-4 gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"
      >
        <div>
          <Label>Preguntas frecuentes</Label>
          <h2 id="faq-title" className="mt-4 font-display text-4xl font-bold tracking-tight">Lo que suelen preguntarnos</h2>
          <a href={cta} className="mt-6 inline-flex items-center gap-2 font-semibold text-[var(--s-primary)] hover:underline">
            ¿Otra duda? Escríbenos
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <div className="divide-y divide-[var(--s-ink)]/10 border-y border-[var(--s-ink)]/10">
          {sector.faq.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                {item.q}
                <Plus className="h-5 w-5 shrink-0 transition-transform group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="mt-3 leading-relaxed text-[var(--s-ink)]/70">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--s-ink)]/10 px-5 py-10 text-center text-sm text-[var(--s-ink)]/60 sm:px-8">
        <p>Fideliza. Sorprende. Haz que vuelvan. · Qronnect</p>
        <nav aria-label="Enlaces legales" className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
          <span>© {new Date().getFullYear()} Qronnect · StellaGroup</span>
          <Link href="/" className="hover:text-[var(--s-ink)]">Inicio</Link>
          <Link href="/aviso-legal" className="hover:text-[var(--s-ink)]">Aviso legal</Link>
          <Link href="/privacidad" className="hover:text-[var(--s-ink)]">Privacidad</Link>
          <Link href="/politica-cookies" className="hover:text-[var(--s-ink)]">Cookies</Link>
          <Link href="/terminos" className="hover:text-[var(--s-ink)]">Términos</Link>
        </nav>
      </footer>
    </div>
  )
}
