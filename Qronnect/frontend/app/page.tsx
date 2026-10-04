'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { isRootDomain } from '@/lib/tenant'
import { Portada } from '@/components/portada/Portada'
import { useBrandingContext } from '@/components/BrandingProvider'
import { useLandingConfig } from '@/hooks/use-landing-config'
import { LoyaltyPass } from '@/components/brand/LoyaltyPass'
import {
  Users, Gift, TrendingUp, QrCode, Shield, Zap, Check, Star, ArrowRight,
  Heart, CheckCircle, Calendar, Clock, MapPin, Phone, Mail, Globe,
  Award, ThumbsUp, Camera, Video, Music, Smile, ShoppingBag, CreditCard, Truck,
  UserPlus, ScanLine,
} from 'lucide-react'
import { VisuallyHidden } from '@/components/ui/visually-hidden'

export default function HomePage() {
  const [isRoot, setIsRoot] = useState(false)

  // Detectar si es dominio raíz en el cliente
  useEffect(() => {
    setIsRoot(isRootDomain())
  }, [])

  // Si es dominio raíz de Qronnect, mostrar landing de producto
  if (isRoot) {
    return <Portada />
  }

  // Si no, es un tenant - mostrar landing personalizada
  return <TenantLandingPage />
}

const iconMap: Record<string, typeof Users> = {
  Users, Gift, TrendingUp, QrCode, Shield, Zap, Heart, Star, CheckCircle,
  Calendar, Clock, MapPin, Phone, Mail, Globe, Award, ThumbsUp, Camera,
  Video, Music, Smile, ShoppingBag, CreditCard, Truck,
}

const steps = [
  {
    icon: UserPlus,
    title: 'Únete gratis',
    text: 'Regístrate en 30 segundos con tu nombre y tu email. Sin descargar ninguna app.',
  },
  {
    icon: ScanLine,
    title: 'Enseña tu QR',
    text: 'En cada compra, muestra tu tarjeta digital en caja y suma puntos y sellos.',
  },
  {
    icon: Gift,
    title: 'Disfruta tus premios',
    text: 'Canjea descuentos, regalos y promociones exclusivas para socios.',
  },
]

function TenantLandingPage() {
  const { branding, loading: brandingLoading } = useBrandingContext()
  const { config, loading: configLoading } = useLandingConfig()

  const loading = brandingLoading || configLoading

  const displayBrandName =
    !branding.nombre_comercial || branding.nombre_comercial === 'Mi Tienda'
      ? 'Qronnect'
      : branding.nombre_comercial

  const logoSrc =
    branding.logo_url && branding.logo_url.trim() !== '' ? branding.logo_url : null

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('promos:v1')
    }
  }, [])

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-paper"
        role="status"
        aria-live="polite"
        aria-label="Cargando página"
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-ink/10 border-t-ink"
          aria-hidden="true"
        />
        <VisuallyHidden>Cargando contenido de la página...</VisuallyHidden>
      </div>
    )
  }

  const metrics = [
    { value: config.estadistica_principal_numero, label: config.estadistica_principal_texto },
    { value: config.estadistica_1_numero, label: config.estadistica_1_texto },
    { value: config.estadistica_2_numero, label: config.estadistica_2_texto },
  ].filter((m) => m.value && m.value.trim() !== '')

  const services = [1, 2, 3, 4, 5, 6]
    .map((n) => {
      const c = config as unknown as Record<string, any>
      return {
        icon: iconMap[c[`servicio_${n}_icono`]] || Gift,
        title: c[`servicio_${n}_titulo`] as string,
        description: c[`servicio_${n}_descripcion`] as string,
        active: (c[`servicio_${n}_activo`] ?? true) as boolean,
      }
    })
    .filter((s) => s.active && s.title)

  const benefits = [1, 2, 3, 4, 5, 6]
    .map((n) => {
      const c = config as unknown as Record<string, any>
      return { text: c[`beneficio_${n}`] as string, active: (c[`beneficio_${n}_activo`] ?? true) as boolean }
    })
    .filter((b) => b.active && b.text)
    .map((b) => b.text)

  const testimonials = [1, 2, 3]
    .map((n) => {
      const c = config as unknown as Record<string, any>
      return {
        name: c[`testimonio_${n}_nombre`] as string,
        role: c[`testimonio_${n}_cargo`] as string,
        content: c[`testimonio_${n}_contenido`] as string,
        rating: (c[`testimonio_${n}_rating`] as number) || 5,
      }
    })
    .filter((t) => t.content)

  return (
    <div className="min-h-screen bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: displayBrandName,
            description: config.hero_subtitulo || `Programa de fidelización de ${displayBrandName}`,
            image: [config.hero_imagen_url || undefined, branding.logo_url || undefined].filter(Boolean),
            url: typeof window !== 'undefined' ? window.location.href : undefined,
          }),
        }}
      />

      {/* Cabecera */}
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <StoreMark logoSrc={logoSrc} name={displayBrandName} />
            <span className="truncate font-display text-lg font-semibold">{displayBrandName}</span>
          </Link>
          <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
            {config.hero_cta_secundario && (
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:text-ink sm:px-4"
              >
                {config.hero_cta_secundario}
              </Link>
            )}
            <Link
              href="/registro"
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-transform hover:-translate-y-px"
            >
              Unirme
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pb-24">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1 text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
              Club de {displayBrandName}
            </p>
            <h1
              id="hero-title"
              className="font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl lg:text-7xl"
            >
              {config.hero_titulo_principal}{' '}
              {config.hero_titulo_destacado && (
                <span className="relative whitespace-normal">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.08em] bottom-[0.06em] top-[0.55em] -z-0 -skew-x-6 rounded-sm bg-brand/30"
                  />
                  <span className="relative">{config.hero_titulo_destacado}</span>
                </span>
              )}
            </h1>
            {config.hero_subtitulo && (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70 sm:text-xl">
                {config.hero_subtitulo}
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/registro"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand px-8 text-base font-semibold text-brand-on shadow-[0_12px_24px_-12px_rgb(var(--brand-primary))] transition-transform hover:-translate-y-0.5"
              >
                {config.hero_cta_principal || 'Unirme gratis'}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              {config.hero_cta_secundario && (
                <Link
                  href="/login"
                  className="inline-flex h-14 items-center justify-center rounded-full border-2 border-ink/15 bg-white px-8 text-base font-semibold transition-colors hover:border-ink/40"
                >
                  {config.hero_cta_secundario}
                </Link>
              )}
            </div>
            {config.hero_social_proof && (
              <p className="mt-6 flex items-center gap-2 text-sm text-ink/60">
                <span className="flex gap-0.5 text-amber-500" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </span>
                {config.hero_social_proof}
              </p>
            )}
          </div>

          <div className="relative mx-auto w-full max-w-[420px]">
            {config.hero_imagen_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.hero_imagen_url}
                alt=""
                className="absolute -right-4 -top-6 hidden h-[78%] w-[70%] rounded-[28px] object-cover sm:block"
              />
            )}
            <div className="relative mx-auto w-[86%] max-w-[340px] -rotate-3 sm:mx-0">
              <LoyaltyPass
                storeName={displayBrandName}
                logoUrl={logoSrc}
                memberName="Tu nombre aquí"
                points={240}
                stampsFilled={7}
                stampsTotal={10}
                qrValue={typeof window !== 'undefined' ? window.location.origin : 'qronnect'}
                qrCaption="Tu tarjeta, siempre en el móvil"
              />
              <div className="absolute -right-3 top-24 rotate-6 rounded-2xl bg-white px-4 py-3 shadow-xl sm:-right-10">
                <p className="text-xs text-ink/60">Última visita</p>
                <p className="font-display text-xl font-bold text-ink">+10 puntos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section aria-labelledby="pasos-title" className="border-y border-ink/5 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <h2 id="pasos-title" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Así de fácil
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
            {steps.map((step, i) => (
              <li key={step.title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-brand-on">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-display text-sm font-semibold text-ink/40">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-ink/65">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Servicios */}
      {services.length > 0 && (
        <section aria-labelledby="servicios-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="max-w-2xl">
            <h2 id="servicios-title" className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
              {config.servicios_titulo}
            </h2>
            {config.servicios_subtitulo && (
              <p className="mt-4 text-lg text-ink/65">{config.servicios_subtitulo}</p>
            )}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article key={service.title} className="rounded-3xl border border-ink/5 bg-white p-6 sm:p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/12 text-ink">
                  <service.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{service.title}</h3>
                {service.description && (
                  <p className="mt-2 leading-relaxed text-ink/65">{service.description}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Beneficios + cifras */}
      {(benefits.length > 0 || metrics.length > 0) && (
        <section aria-labelledby="beneficios-title" className="bg-brand text-brand-on">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
            <div>
              <h2 id="beneficios-title" className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
                {config.beneficios_titulo}
              </h2>
              {config.beneficios_subtitulo && (
                <p className="mt-4 text-lg opacity-80">{config.beneficios_subtitulo}</p>
              )}
              {metrics.length > 0 && (
                <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
                  {metrics.map((metric) => (
                    <div key={metric.label} className="flex flex-col">
                      <dt className="text-sm opacity-75">{metric.label}</dt>
                      <dd className="order-first font-display text-4xl font-bold tracking-tight sm:text-5xl">
                        {metric.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            {benefits.length > 0 && (
              <ul className="grid content-start gap-3">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-3 rounded-2xl p-4 text-lg font-medium leading-snug"
                    style={{ backgroundColor: 'rgb(var(--brand-primary-on) / 0.1)' }}
                  >
                    <Check className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={3} aria-hidden="true" />
                    {benefit}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Testimonios */}
      {testimonials.length > 0 && (
        <section aria-labelledby="testimonios-title" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <h2 id="testimonios-title" className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
            {config.testimonios_titulo}
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name + t.content} className="flex flex-col rounded-3xl bg-white p-7">
                <div className="flex gap-0.5 text-amber-500" aria-label={`${t.rating} de 5 estrellas`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={i < t.rating ? 'h-4 w-4 fill-current' : 'h-4 w-4 text-ink/15'}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-lg leading-relaxed">“{t.content}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-ink/5 pt-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display font-bold text-paper">
                    {t.name?.charAt(0) || '·'}
                  </span>
                  <span>
                    <span className="block font-semibold">{t.name}</span>
                    {t.role && <span className="block text-sm text-ink/55">{t.role}</span>}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="px-4 pb-16 sm:px-6 md:pb-24">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-ink px-6 py-14 text-center text-paper sm:px-12 md:py-20">
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight text-balance sm:text-5xl">
            {config.cta_final_titulo_1} {config.cta_final_titulo_2}
          </h2>
          {config.cta_final_subtitulo && (
            <p className="mx-auto mt-5 max-w-xl text-lg text-paper/70">{config.cta_final_subtitulo}</p>
          )}
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/registro"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand px-8 font-semibold text-brand-on transition-transform hover:-translate-y-0.5"
            >
              {config.cta_final_boton_principal || 'Unirme gratis'}
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            {config.cta_final_boton_secundario && (
              <Link
                href="/login"
                className="inline-flex h-14 items-center justify-center rounded-full border-2 border-paper/20 px-8 font-semibold transition-colors hover:border-paper/50"
              >
                {config.cta_final_boton_secundario}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Pie */}
      <footer className="border-t border-ink/5">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-ink/60 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5 text-ink">
            <StoreMark logoSrc={logoSrc} name={displayBrandName} />
            <span className="font-display font-semibold">{displayBrandName}</span>
          </div>
          <nav aria-label="Enlaces legales" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/terminos" className="hover:text-ink">Términos</Link>
            <Link href="/privacidad" className="hover:text-ink">Privacidad</Link>
            <Link href="/politica-cookies" className="hover:text-ink">Cookies</Link>
            <Link href="/aviso-legal" className="hover:text-ink">Aviso legal</Link>
          </nav>
          <p>
            © {new Date().getFullYear()} {displayBrandName} · Funciona con{' '}
            <a href="https://qronnect.es" className="font-medium text-ink hover:underline">Qronnect</a>
          </p>
        </div>
      </footer>
    </div>
  )
}

function StoreMark({ logoSrc, name }: { logoSrc: string | null; name: string }) {
  if (logoSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoSrc}
        alt=""
        className="h-9 w-9 shrink-0 rounded-xl bg-white object-contain p-0.5"
        onError={(e) => {
          e.currentTarget.onerror = null
          e.currentTarget.src = '/LogoQronnect.png'
        }}
      />
    )
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand font-display font-bold text-brand-on">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}
