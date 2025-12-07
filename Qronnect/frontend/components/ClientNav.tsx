'use client'

import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { Gift, Ticket, QrCode, User, Users, CreditCard, Dices } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBrandingContext } from './BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface Promocion {
  id: string
  activa: boolean
}

export function ClientNav() {
  const params = useParams()
  const pathname = usePathname()
  const { branding } = useBrandingContext()
  const [slug, setSlug] = useState<string>('')
  const [promocionesCount, setPromocionesCount] = useState(0)
  const [canjesCount, setCanjesCount] = useState(0)

  useEffect(() => {
    // Intenta obtener el slug de los parámetros de la ruta
    if (params.slug) {
      setSlug(params.slug as string)
    } else {
      // Si no está en los parámetros, intenta obtenerlo del dominio
      if (typeof window !== 'undefined') {
        const host = window.location.host
        const domain = host.split(':')[0].split('.')[0]
        setSlug(domain === 'localhost' ? 'lokeyokiera' : domain)
      }
    }
  }, [params.slug])

  useEffect(() => {
    if (!slug) return

    const loadCounts = async () => {
      try {
        const token = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem('client_token')
        console.log('ClientNav - Token:', token ? 'Presente' : 'No encontrado')
        console.log('ClientNav - Slug:', slug)

        if (!token) {
          console.log('ClientNav - No hay token, no se cargan los contadores')
          return
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

        // Obtener promociones disponibles
        try {
          const promocionesResponse = await fetch(`${API_URL}/api/clientes/promociones`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Tenant-Domain': slug,
            },
          })
          console.log('ClientNav - Promociones response status:', promocionesResponse.status)

          if (promocionesResponse.ok) {
            const promocionesData = await promocionesResponse.json()
            // Ya vienen filtradas como activas desde el backend
            console.log('ClientNav - Promociones disponibles:', promocionesData.length)
            setPromocionesCount(promocionesData.length)
          } else {
            console.error('ClientNav - Error response promociones:', await promocionesResponse.text())
          }
        } catch (error) {
          console.error('ClientNav - Error al cargar promociones:', error)
        }

        // Obtener canjes del usuario
        try {
          const canjesResponse = await fetch(`${API_URL}/api/clientes/mis-canjes`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Tenant-Domain': slug,
            },
          })
          console.log('ClientNav - Canjes response status:', canjesResponse.status)

          if (canjesResponse.ok) {
            const canjesData = await canjesResponse.json()
            console.log('ClientNav - Canjes count:', canjesData.length || 0)
            setCanjesCount(canjesData.length || 0)
          } else {
            console.error('ClientNav - Error response canjes:', await canjesResponse.text())
          }
        } catch (error) {
          console.error('ClientNav - Error al cargar canjes:', error)
        }
      } catch (error) {
        console.error('ClientNav - Error al cargar contadores:', error)
      }
    }

    loadCounts()
  }, [slug])

  if (!slug) return null

  const navItems: Array<{
    href: string;
    label: string;
    icon: any;
    badge?: string;
  }> = [
      {
        href: `/${slug}/mi-perfil`,
        label: 'Mi Cuenta',
        icon: User,
      },
      {
        href: `/${slug}/promociones`,
        label: 'Promociones',
        icon: Gift,
      },
      {
        href: `/${slug}/gacha`,
        label: 'Gacha',
        icon: Dices,
        badge: 'Nuevo',
      },
      {
        href: `/${slug}/mis-sellos`,
        label: 'Mis Sellos',
        icon: CreditCard,
      },
      {
        href: `/${slug}/mis-canjes`,
        label: 'Mis Cupones',
        icon: Ticket,
      },
      {
        href: `/${slug}/mis-referidos`,
        label: 'Invita Amigos',
        icon: Users,
      },
    ]

  const getBadgeCount = (label: string) => {
    if (label === 'Promociones') return promocionesCount
    if (label === 'Mis Cupones') return canjesCount
    return 0
  }

  return (
    <>
      {/* DESKTOP NAVIGATION (Top Header) */}
      <nav className="hidden md:block border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                const badgeCount = getBadgeCount(item.label)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all relative',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                    style={
                      isActive
                        ? {
                          color: hexToRgb(branding.color_primario),
                          backgroundColor: `${hexToRgb(branding.color_primario)}15`,
                        }
                        : {}
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {badgeCount > 0 && (
                      <Badge
                        className="ml-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs text-white rounded-full"
                        style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                      >
                        {badgeCount}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE NAVIGATION (Bottom Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t pb-safe">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const badgeCount = getBadgeCount(item.label)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 min-w-[60px] relative transition-all active:scale-95',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
                style={isActive ? { color: hexToRgb(branding.color_primario) } : {}}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all",
                  isActive ? "bg-primary/10" : ""
                )}
                  style={isActive ? { backgroundColor: `${hexToRgb(branding.color_primario)}15` } : {}}
                >
                  <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
                </div>

                <span className="text-[10px] font-medium truncate max-w-[64px]">
                  {item.label === 'Mis Sellos' ? 'Sellos' :
                    item.label === 'Mis Cupones' ? 'Cupones' :
                      item.label === 'Mis Cuenta' ? 'Perfil' :
                        item.label === 'Invita Amigos' ? 'Invitar' :
                          item.label}
                </span>

                {badgeCount > 0 && (
                  <span
                    className="absolute top-1 right-2 h-4 min-w-[16px] px-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full ring-2 ring-white dark:ring-gray-900"
                    style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                  >
                    {badgeCount}
                  </span>
                )}
                {item.badge && (
                  <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
