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
    <nav className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const badgeCount = getBadgeCount(item.label)

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                aria-label={`Ir a ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 px-1.5 sm:px-3 sm:py-3 text-xs sm:text-sm transition-colors relative flex-1',
                  isActive
                    ? 'border-b-2 font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                style={
                  isActive
                    ? {
                        borderColor: hexToRgb(branding.color_primario),
                        color: hexToRgb(branding.color_primario),
                      }
                    : {}
                }
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {badgeCount > 0 && (
                    <Badge
                      className="absolute -top-2 -right-2 h-4 min-w-4 px-1 flex items-center justify-center text-xs text-white"
                      style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                    >
                      {badgeCount}
                    </Badge>
                  )}
                  {item.badge && (
                    <Badge
                      className="absolute -top-1 -right-3 text-[8px] px-1 h-3"
                      variant="destructive"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="truncate max-w-[60px] sm:max-w-none text-center">{item.label}</span>
              </Link>
            )
          })}
          {/* Theme Toggle */}
          <div className="py-2 pl-1 sm:py-3 sm:pl-2 flex-shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
