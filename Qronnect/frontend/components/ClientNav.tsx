'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Dices, Gift, Home, QrCode, Stamp, Ticket, Users, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBrandingContext } from './BrandingProvider'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type CountKey = 'promociones' | 'canjes'

interface NavItem {
  path: string
  label: string
  /** Nombre corto para la barra inferior del móvil */
  short: string
  icon: LucideIcon
  count?: CountKey
  /** Solo en el menú de escritorio (en el móvil se llega desde Inicio) */
  desktopOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { path: 'mi-perfil', label: 'Inicio', short: 'Inicio', icon: Home },
  { path: 'promociones', label: 'Premios', short: 'Premios', icon: Gift, count: 'promociones' },
  { path: 'mis-sellos', label: 'Sellos', short: 'Sellos', icon: Stamp, desktopOnly: true },
  { path: 'gacha', label: 'Máquina de premios', short: 'Máquina', icon: Dices, desktopOnly: true },
  { path: 'mis-canjes', label: 'Mis cupones', short: 'Cupones', icon: Ticket, count: 'canjes' },
  { path: 'mis-referidos', label: 'Invita amigos', short: 'Invitar', icon: Users },
]

/** Slug de la tienda: de la ruta /[slug]/... o, si no, del subdominio */
export function useClientSlug() {
  const params = useParams()
  const [slug, setSlug] = useState<string>((params?.slug as string) || '')

  useEffect(() => {
    if (params?.slug) {
      setSlug(params.slug as string)
    } else if (typeof window !== 'undefined') {
      const domain = window.location.host.split(':')[0].split('.')[0]
      setSlug(domain === 'localhost' ? 'lokeyokiera' : domain)
    }
  }, [params?.slug])

  return slug
}

function useNavCounts(slug: string) {
  const [counts, setCounts] = useState<Record<CountKey, number>>({ promociones: 0, canjes: 0 })

  useEffect(() => {
    if (!slug) return
    const token = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem('client_token')
    if (!token) return

    const headers = { Authorization: `Bearer ${token}`, 'X-Tenant-Domain': slug }
    const count = async (path: string, filtro: (item: any) => boolean = () => true) => {
      try {
        const res = await fetch(`${API_URL}${path}`, { headers })
        if (!res.ok) return 0
        const data = await res.json()
        return Array.isArray(data) ? data.filter(filtro).length : 0
      } catch {
        return 0
      }
    }

    // Cupones: solo los que aún se pueden usar
    Promise.all([
      count('/api/clientes/promociones'),
      count('/api/clientes/mis-canjes', (c) => c.estado === 'pendiente'),
    ]).then(
      ([promociones, canjes]) => setCounts({ promociones, canjes }),
    )
  }, [slug])

  return counts
}

function CountBadge({ value, className }: { value: number; className?: string }) {
  if (value <= 0) return null
  return (
    <span
      className={cn(
        'flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-brand-on',
        className,
      )}
    >
      {value > 9 ? '9+' : value}
    </span>
  )
}

/**
 * Navegación de la app del cliente: barra superior en escritorio y barra inferior
 * con el QR en el centro en el móvil. Usa los colores de la tienda (bg-brand...).
 */
export function ClientNav() {
  const pathname = usePathname()
  const slug = useClientSlug()
  const counts = useNavCounts(slug)
  const { branding } = useBrandingContext()

  if (!slug) return null

  const href = (path: string) => `/${slug}/${path}`
  const isActive = (path: string) => {
    // "Mis cupones" agrupa los canjes y los regalos, que tienen ruta propia
    const paths = path === 'mis-canjes' ? ['mis-canjes', 'mis-cupones'] : [path]
    return paths.some((p) => pathname === href(p) || pathname.startsWith(`${href(p)}/`))
  }
  const mobileItems = NAV_ITEMS.filter((i) => !i.desktopOnly)
  const qrActive = isActive('mi-qr')

  return (
    <>
      {/* Escritorio: barra superior */}
      <header className="sticky top-0 z-40 hidden border-b border-ink/10 bg-paper/85 backdrop-blur-lg md:block">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
          <Link href={href('mi-perfil')} className="flex min-w-0 shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand font-display text-sm font-bold text-brand-on">
              {branding.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={branding.logo_url} alt="" className="h-full w-full bg-white object-contain p-1" />
              ) : (
                (branding.nombre_comercial || 'Q').charAt(0).toUpperCase()
              )}
            </span>
            <span className="hidden truncate font-display text-base font-semibold text-ink lg:block">{branding.nombre_comercial}</span>
          </Link>

          <nav aria-label="Secciones" className="ml-auto flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path)
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  href={href(item.path)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-brand/10 text-ink' : 'text-ink/60 hover:bg-ink/5 hover:text-ink',
                  )}
                >
                  <Icon className={cn('hidden h-4 w-4 shrink-0 lg:block', active && 'text-brand')} aria-hidden="true" />
                  <span className="xl:hidden">{item.short}</span>
                  <span className="hidden xl:inline">{item.label}</span>
                  {item.count && <CountBadge value={counts[item.count]} />}
                </Link>
              )
            })}
          </nav>

          <Link
            href={href('mi-qr')}
            className="flex shrink-0 items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-on shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <QrCode className="h-4 w-4" aria-hidden="true" />
            Mi QR
          </Link>
        </div>
      </header>

      {/* Móvil: barra inferior con el QR en el centro */}
      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
      >
        <ul className="mx-auto grid h-16 max-w-md grid-cols-5 items-center">
          {mobileItems.slice(0, 2).map((item) => (
            <MobileTab key={item.path} item={item} href={href(item.path)} active={isActive(item.path)} count={item.count && counts[item.count]} />
          ))}
          <li className="flex justify-center">
            <Link
              href={href('mi-qr')}
              aria-label="Mi QR"
              aria-current={qrActive ? 'page' : undefined}
              className={cn(
                '-mt-7 flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full bg-brand text-brand-on shadow-[0_10px_25px_-8px_rgb(var(--brand-primary))] ring-4 ring-paper transition-transform active:scale-95',
              )}
            >
              <QrCode className="h-6 w-6" aria-hidden="true" />
              <span className="text-[10px] font-semibold">Mi QR</span>
            </Link>
          </li>
          {mobileItems.slice(2).map((item) => (
            <MobileTab key={item.path} item={item} href={href(item.path)} active={isActive(item.path)} count={item.count && counts[item.count]} />
          ))}
        </ul>
      </nav>
    </>
  )
}

function MobileTab({ item, href, active, count }: { item: NavItem; href: string; active: boolean; count?: number }) {
  const Icon = item.icon
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'relative flex flex-col items-center gap-1 py-1.5 text-[11px] font-medium transition-colors active:scale-95',
          active ? 'text-ink' : 'text-ink/50',
        )}
      >
        <span className={cn('flex h-7 w-12 items-center justify-center rounded-full transition-colors', active && 'bg-brand/15')}>
          <Icon className={cn('h-5 w-5', active && 'text-brand')} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
        </span>
        {item.short}
        {count ? <CountBadge value={count} className="absolute right-[calc(50%-22px)] top-0.5 ring-2 ring-paper" /> : null}
      </Link>
    </li>
  )
}
