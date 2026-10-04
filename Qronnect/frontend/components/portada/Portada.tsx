import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { ArrowDown, ArrowRight, Check, Instagram, Mail, Minus, Plus, QrCode, ScanLine, ShieldCheck, Smartphone, Palette } from 'lucide-react'
import { SECTORES } from '@/lib/sectores'
import { PORTADA_FAQ, PORTADA_FEATURES, PORTADA_PALETTE, PORTADA_PLANES, PORTADA_SHOWCASE } from '@/lib/portada'
import { cn } from '@/lib/utils'
import { SECTOR_ICONS } from '@/components/sector/sector-icons'
import { PhoneMockup } from '@/components/sector/PhoneMockup'
import { HowItWorks } from '@/components/sector/HowItWorks'
import { SectorGrid } from '@/components/sector/SectorGrid'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { ScrollFx } from '@/components/landing/ScrollFx'
import { MobileCtaBar } from '@/components/landing/MobileCtaBar'
import { ContactoDrawer } from '@/components/landing/ContactoDrawer'
import { DemoSection } from '@/components/landing/DemoSection'
import { Marquee } from '@/components/landing/Marquee'

/** Destino de los botones de captación: el formulario de contacto */
const CONTACT_HREF = '/contacto?origen=/'
const CTA_LABEL = 'Quiero Qronnect en mi negocio'

const NAV = [
  { href: '#pruebalo', label: 'Pruébalo' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#sectores', label: 'Sectores' },
  { href: '#incluye', label: 'Qué incluye' },
  { href: '#precios', label: 'Precios' },
  { href: '#preguntas', label: 'Preguntas' },
]

const LEGAL = [
  { href: '/aviso-legal', label: 'Aviso legal' },
  { href: '/privacidad', label: 'Privacidad' },
  { href: '/politica-cookies', label: 'Cookies' },
  { href: '/terminos', label: 'Términos' },
]

function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-[11px] font-semibold uppercase tracking-[0.22em] opacity-60', className)}>{children}</p>
}

function CtaButton({ className, children = CTA_LABEL }: { className?: string; children?: ReactNode }) {
  return (
    <a
      href={CONTACT_HREF}
      className={cn(
        'group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[var(--s-primary)] px-8 py-3 text-center text-base font-semibold text-[var(--s-primary-on)] shadow-[0_18px_40px_-18px_var(--s-primary)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-16px_var(--s-primary)]',
        className,
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </a>
  )
}

function Accent({ children }: { children: ReactNode }) {
  return <em className="font-accent font-normal italic text-[var(--s-on-dark)]">{children}</em>
}

function Logo({ dark = true }: { dark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Qronnect, ir al inicio">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/LogoQronnect.png" alt="" className="h-9 w-9 object-contain" />
      <span className={cn('font-display text-xl font-semibold tracking-tight', dark ? 'text-white' : 'text-[var(--s-ink)]')}>
        Qronnect
      </span>
    </Link>
  )
}

/** Variables de color de un sector, para pintar su móvil con su paleta */
function sectorVars(slug: string): CSSProperties {
  const p = SECTORES[slug].palette
  return { '--s-primary': p.primary, '--s-primary-on': p.primaryOn } as CSSProperties
}

/** Tipos de negocio para la cinta animada bajo el hero */
const NEGOCIOS = [
  'Cafeterías', 'Peluquerías', 'Centros de estética', 'Gimnasios', 'Panaderías', 'Heladerías', 'Tiendas de moda',
  'Floristerías', 'Restaurantes', 'Barberías', 'Estudios de yoga', 'Librerías', 'Ópticas', 'Jugueterías',
]

const PROOF = [
  { icon: Smartphone, title: 'Sin app', text: 'Escanean tu QR y se unen desde el navegador.' },
  { icon: Palette, title: 'Con tu marca', text: 'Tu logo, tus colores y tu propia página.' },
  { icon: ScanLine, title: 'En tu mostrador', text: 'Tu equipo suma puntos escaneando su QR.' },
  { icon: ShieldCheck, title: 'Datos tuyos', text: 'Tratados conforme al RGPD.' },
]

/** Portada de qronnect.es: vende el producto a negocios */
export function Portada() {
  const p = PORTADA_PALETTE
  const vars = {
    '--s-primary': p.primary,
    '--s-primary-on': p.primaryOn,
    '--s-ink': p.ink,
    '--s-dark': p.dark,
    '--s-on-dark': p.accentOnDark,
    '--s-soft': p.soft,
    '--s-softer': p.softer,
  } as CSSProperties

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'Qronnect',
        url: 'https://qronnect.es',
        logo: 'https://qronnect.es/LogoQronnect.png',
        email: 'soporte@qronnect.com',
        sameAs: ['https://www.instagram.com/qronnect/', 'https://stellagroup.es'],
      },
      {
        '@type': 'SoftwareApplication',
        name: 'Qronnect',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: 'https://qronnect.es',
        description: 'Programa de fidelización con QR para negocios locales: puntos, premios y promociones con tu marca, sin apps.',
        offers: PORTADA_PLANES.map((plan) => ({
          '@type': 'Offer',
          name: plan.nombre,
          price: plan.precio,
          priceCurrency: 'EUR',
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: PORTADA_FAQ.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  }

  return (
    <div style={vars} className="min-h-screen overflow-x-clip bg-[var(--s-softer)] text-[var(--s-ink)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ScrollFx />
      <LandingHeader brand={<Logo />} nav={NAV} />
      <a href="#pruebalo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold">
        Saltar al contenido
      </a>

      {/* ───────── Hero ───────── */}
      <section aria-labelledby="portada-hero" className="relative isolate overflow-hidden bg-[var(--s-dark)] pt-16 text-white sm:pt-20">
        <div
          aria-hidden="true"
          className="absolute -right-40 -top-40 -z-10 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--s-on-dark)_28%,transparent),transparent_65%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-60 -left-40 -z-10 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--s-primary)_35%,transparent),transparent_65%)]"
        />


        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pb-20 lg:pt-20">
          <div className="hero-rise">
            <p className="flex items-center gap-4 text-white/75">
              <span className="h-px w-14 bg-[var(--s-on-dark)]" aria-hidden="true" />
              Fidelización con QR para negocios locales
            </p>
            <h1
              id="portada-hero"
              className="mt-8 text-[3.2rem] font-light leading-[0.98] tracking-[-0.045em] text-balance sm:text-7xl xl:text-[5.8rem]"
            >
              Que tus clientes <Accent>vuelvan</Accent>
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-snug text-white/60 sm:text-2xl">
              Puntos, premios y promociones con tu marca, en el móvil de cada cliente.{' '}
              <strong className="font-semibold text-white">Sin apps y sin tarjetas de cartón.</strong>
            </p>
            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <CtaButton />
              <a href="#pruebalo" className="group inline-flex items-center gap-2 px-2 text-sm font-medium text-white/85 hover:text-white">
                Pruébalo como cliente
                <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Dos móviles: el mismo producto con la marca de dos negocios distintos */}
          <div className="relative mx-auto h-[600px] w-full max-w-[340px] sm:max-w-[500px]">
            <div style={sectorVars('estetica')} className="float-slower absolute left-0 top-10 hidden sm:block">
              <PhoneMockup sector={SECTORES.estetica} className="-rotate-[7deg] scale-[0.88] opacity-90" />
            </div>
            <div className="float-slow absolute right-0 top-0 sm:right-2">
              <div style={sectorVars('cafeterias')}>
                <PhoneMockup sector={SECTORES.cafeterias} className="rotate-[4deg]" />
              </div>
            </div>
            <div className="pop-loop absolute bottom-6 left-0 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-[var(--s-ink)] shadow-2xl sm:bottom-10 sm:left-24">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--s-soft)] text-[var(--s-primary)]">
                <QrCode className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-sm leading-tight">
                <span className="block font-semibold">+25 puntos</span>
                <span className="text-[var(--s-ink)]/60">Sumados al escanear</span>
              </span>
            </div>
          </div>
        </div>

        <ul className="mx-auto grid max-w-7xl gap-px border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {PROOF.map(({ icon: Icon, title, text }) => (
            <li key={title} data-reveal className="flex gap-4 px-5 py-4 first:pt-8 last:pb-8 sm:px-8 sm:py-8">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--s-on-dark)]" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-white/60">
                <span className="block font-semibold text-white">{title}</span>
                {text}
              </p>
            </li>
          ))}
        </ul>
        <Marquee items={NEGOCIOS} className="border-t border-white/10 text-white" />
      </section>

      {/* ───────── Problema ───────── */}
      <section aria-labelledby="problema-title" className="px-5 py-24 text-center sm:px-8 md:py-32">
        <div data-reveal>
        <Label>Captar no es fidelizar</Label>
        <h2 id="problema-title" className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-5xl">
          Conseguir un cliente nuevo cuesta.
          <br />
          Que vuelva, no tanto.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[var(--s-ink)]/65">
          Cada día entra gente a tu negocio que no vuelve. No porque no le gustara, sino porque nada le recordó que existías.
        </p>
        </div>
        <div data-reveal>
          <p className="mt-14 font-display text-3xl font-bold tracking-tight sm:text-4xl">Una tarjeta de cartón se pierde.</p>
          <p className="font-accent text-4xl italic text-[var(--s-primary)] sm:text-5xl">El móvil siempre está a mano.</p>
        </div>
        <p data-reveal className="mx-auto mt-14 max-w-2xl font-display text-2xl font-bold leading-snug tracking-tight text-balance">
          Qronnect convierte cada visita en una relación: sabes quién viene, le premias por volver y le avisas cuando tienes algo para él.
        </p>
      </section>

      {/* ───────── Demo interactiva ───────── */}
      <DemoSection sector={PORTADA_SHOWCASE} />

      {/* ───────── Cómo funciona ───────── */}
      <div className="border-t border-[var(--s-ink)]/10">
        <HowItWorks sector={PORTADA_SHOWCASE} />
      </div>

      {/* ───────── Qué incluye (oscuro) ───────── */}
      <section id="incluye" aria-labelledby="incluye-title" className="scroll-mt-20 bg-[var(--s-dark)] px-5 py-24 text-white sm:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div data-reveal>
          <Label>Qué incluye</Label>
          <h2 id="incluye-title" className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Todo para que <Accent>vuelvan</Accent>, en un solo panel
          </h2>
          <p className="mt-5 max-w-xl text-lg text-white/65">
            Sin integraciones ni instalaciones: lo configuras una vez y tu equipo lo usa desde el móvil.
          </p>
          </div>

          <ul className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {PORTADA_FEATURES.map((f, i) => {
              const Icon = SECTOR_ICONS[f.icon]
              return (
                <li key={f.title} data-reveal className="group border-t border-white/10 pt-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-[var(--s-on-dark)] transition-all duration-300 group-hover:scale-110 group-hover:border-[var(--s-on-dark)] group-hover:bg-[var(--s-on-dark)] group-hover:text-[var(--s-dark)]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-6 text-xs tracking-[0.2em] text-white/45">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-2 font-display text-xl font-bold tracking-tight">{f.title}</h3>
                  <p className="mt-3 leading-relaxed text-white/60">{f.text}</p>
                </li>
              )
            })}
          </ul>

          <div data-reveal className="mt-20 flex flex-col gap-8 border-t border-white/10 pt-12 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h3 className="font-display text-3xl font-bold tracking-tight">¿Te lo enseñamos con tu negocio?</h3>
              <p className="mt-3 text-white/65">Cuéntanos qué tienes y te mostramos cómo quedaría tu programa.</p>
            </div>
            <CtaButton className="shrink-0" />
          </div>
        </div>
      </section>

      {/* ───────── Sectores ───────── */}
      <SectorGrid />

      {/* ───────── Precios ───────── */}
      <section id="precios" aria-labelledby="precios-title" className="scroll-mt-20 border-t border-[var(--s-ink)]/10 bg-white px-5 py-24 sm:px-8 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl" data-reveal>
            <Label>Precios</Label>
            <h2 id="precios-title" className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Un plan según tu tamaño
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[var(--s-ink)]/70">
              Todos incluyen puntos, premios, máquina de premios, referidos, campañas y el escáner para tu equipo. Cambia el número de locales y de clientes.
            </p>
          </div>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PORTADA_PLANES.map((plan) => (
              <li
                key={plan.nombre}
                data-reveal
                className={cn(
                  'relative flex flex-col rounded-3xl border p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]',
                  plan.destacado
                    ? 'border-transparent bg-[var(--s-dark)] text-white'
                    : 'border-[var(--s-ink)]/10 bg-[var(--s-softer)]',
                )}
              >
                {plan.destacado && (
                  <span className="absolute -top-3 left-7 rounded-full bg-[var(--s-on-dark)] px-3 py-1 text-xs font-semibold text-[var(--s-dark)]">
                    Para crecer
                  </span>
                )}
                <h3 className="font-display text-xl font-bold">{plan.nombre}</h3>
                <p className={cn('mt-1 text-sm', plan.destacado ? 'text-white/60' : 'text-[var(--s-ink)]/60')}>{plan.descripcion}</p>
                <p className="mt-6 flex flex-wrap items-baseline gap-x-1.5">
                  <span className="font-display text-5xl font-bold tracking-tight">{plan.precio === 0 ? 'Gratis' : `${plan.precio} €`}</span>
                  <span className={cn('text-sm', plan.destacado ? 'text-white/60' : 'text-[var(--s-ink)]/60')}>{plan.periodo}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {plan.limites.map((l) => (
                    <li key={l} className="flex items-start gap-2.5">
                      <Check
                        className={cn('mt-0.5 h-4 w-4 shrink-0', plan.destacado ? 'text-[var(--s-on-dark)]' : 'text-[var(--s-primary)]')}
                        aria-hidden="true"
                      />
                      {l}
                    </li>
                  ))}
                </ul>
                <a
                  href={`/contacto?plan=${encodeURIComponent(plan.nombre)}&origen=/`}
                  className={cn(
                    'mt-8 inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors',
                    plan.destacado
                      ? 'bg-[var(--s-on-dark)] text-[var(--s-dark)] hover:bg-white'
                      : 'border border-[var(--s-ink)]/15 hover:border-[var(--s-ink)]/40',
                  )}
                >
                  {plan.precio === 0 ? 'Probarlo gratis' : `Quiero el plan ${plan.nombre}`}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── Cierre (oscuro) ───────── */}
      <section aria-labelledby="cierre-title" className="bg-[var(--s-dark)] px-5 py-24 text-center text-white sm:px-8 md:py-32">
        <h2 id="cierre-title" data-reveal className="mx-auto max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-6xl">
          Tus clientes ya te eligieron una vez.
          <br />
          <span className="text-white/45">Dales motivos para repetir.</span>
        </h2>
        <p data-reveal className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-x-3 gap-y-2 text-xl text-white/85 sm:text-2xl">
          {['Escanean', 'Suman', 'Ganan', 'Vuelven'].map((r, i) => (
            <span key={r} className="inline-flex items-center gap-3">
              {i > 0 && <Minus className="h-3 w-3 text-white/30" aria-hidden="true" />}
              {r}
            </span>
          ))}
        </p>
        <p data-reveal className="mx-auto mt-10 max-w-2xl font-accent text-4xl italic leading-tight text-[var(--s-on-dark)] sm:text-5xl">
          Fideliza. Sorprende. Haz que vuelvan.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <CtaButton />
          <p className="text-sm text-white/50">Tus clientes no descargan nada · Funciona en cualquier móvil</p>
        </div>
      </section>

      {/* ───────── Preguntas frecuentes ───────── */}
      <section
        id="preguntas"
        aria-labelledby="faq-title"
        className="mx-auto grid max-w-6xl scroll-mt-20 gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"
      >
        <div>
          <Label>Preguntas frecuentes</Label>
          <h2 id="faq-title" className="mt-4 font-display text-4xl font-bold tracking-tight">Lo que suelen preguntarnos</h2>
          <a href={CONTACT_HREF} className="mt-6 inline-flex items-center gap-2 font-semibold text-[var(--s-primary)] hover:underline">
            ¿Otra duda? Escríbenos
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <div data-reveal className="divide-y divide-[var(--s-ink)]/10 border-y border-[var(--s-ink)]/10">
          {PORTADA_FAQ.map((item) => (
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

      {/* ───────── Pie ───────── */}
      <footer className="border-t border-[var(--s-ink)]/10 bg-white px-5 pb-10 pt-16 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo dark={false} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--s-ink)]/60">
              Fidelización con QR para negocios locales. Un producto de StellaGroup.
            </p>
            <div className="mt-5 flex flex-col gap-2 text-sm">
              <a href="mailto:soporte@qronnect.com" className="inline-flex items-center gap-2 text-[var(--s-ink)]/70 hover:text-[var(--s-ink)]">
                <Mail className="h-4 w-4" aria-hidden="true" />
                soporte@qronnect.com
              </a>
              <a
                href="https://www.instagram.com/qronnect/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[var(--s-ink)]/70 hover:text-[var(--s-ink)]"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
                @qronnect
              </a>
            </div>
          </div>
          <FooterCol title="Producto" links={NAV.map((n) => ({ href: n.href, label: n.label }))} />
          <FooterCol
            title="Sectores"
            links={Object.values(SECTORES).map((s) => ({ href: `/para/${s.slug}`, label: s.nombre }))}
          />
          <FooterCol
            title="Empresa"
            links={[
              { href: 'https://stellagroup.es', label: 'StellaGroup' },
              { href: '/partners', label: 'Partners' },
              { href: CONTACT_HREF, label: 'Contacto' },
              { href: '/admin/login', label: 'Acceso negocios' },
            ]}
          />
        </div>
        <div className="mx-auto mt-14 flex max-w-6xl flex-col gap-4 border-t border-[var(--s-ink)]/10 pt-8 text-xs text-[var(--s-ink)]/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Qronnect · StellaGroup</p>
          <nav aria-label="Enlaces legales" className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-[var(--s-ink)]">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>

      <MobileCtaBar href={CONTACT_HREF} label={CTA_LABEL} />
      <ContactoDrawer />
    </div>
  )
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3 text-sm text-[var(--s-ink)]/65">
        {links.map((l) => (
          <li key={l.href}>
            <a href={l.href} className="hover:text-[var(--s-ink)]">
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
