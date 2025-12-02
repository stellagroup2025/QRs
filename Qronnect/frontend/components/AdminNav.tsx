'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  Gift,
  Settings,
  LogOut,
  UserPlus,
  Brain,
  Mail,
  MessageSquare,
  Sparkles,
  Globe,
  Menu,
  X,
  Paintbrush,
  Coins,
  Store,
  Package,
  User,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { CommandMenu } from '@/components/ui/command-menu'
import { useAnalytics } from '@/hooks/use-analytics'
import { OnboardingBanner } from '@/components/OnboardingBanner'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const mainNavItems: NavItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/referidos',
    label: 'Referidos',
    icon: UserPlus,
    badge: 'Nuevo',
  },
]

const configNavItems: NavItem[] = [
  {
    href: '/admin/onboarding',
    label: 'Configuracion Inicial',
    icon: Sparkles,
  },
  {
    href: '/admin/configuracion/branding',
    label: 'Branding',
    icon: Paintbrush,
  },
  {
    href: '/admin/configuracion/puntos',
    label: 'Sistema de Puntos',
    icon: Coins,
  },
  {
    href: '/admin/configuracion/productos',
    label: 'Productos y Servicios',
    icon: Package,
    badge: 'Nuevo',
  },
  {
    href: '/admin/configuracion/tienda',
    label: 'Informacion de Tienda',
    icon: Store,
  },
  {
    href: '/admin/configuracion/landing',
    label: 'Landing Page',
    icon: Globe,
  },
  {
    href: '/admin/configuracion/regalos',
    label: 'Regalos Bienvenida',
    icon: Gift,
  },
  {
    href: '/admin/configuracion/ia',
    label: 'Configuracion IA',
    icon: Brain,
  },
  {
    href: '/admin/configuracion/cuenta',
    label: 'Mi Cuenta',
    icon: User,
  },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { trackEvent, trackInteraction } = useAnalytics()

  const handleLogout = () => {
    // Track logout event
    trackEvent({
      category: 'Admin',
      action: 'Logout',
      label: 'Admin Navigation',
    })

    localStorage.removeItem('admin_token')
    localStorage.removeItem('tenant_domain')
    router.push('/admin/login')
  }

  return (
    <>
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex flex-col">
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Qronnect
                </span>
                <span className="text-[10px] text-muted-foreground font-medium -mt-1">
                  Fidelización Inteligente
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}

            {/* Configuración Dropdown */}
            <div className="relative group">
              <button
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith('/admin/configuracion')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <Settings className="h-4 w-4" />
                Configuración
              </button>

              {/* Dropdown */}
              <div className="absolute left-0 mt-2 w-56 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="py-2">
                  {configNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <CommandMenu />
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <CommandMenu />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          id="mobile-menu"
          className={cn(
            "md:hidden border-t overflow-hidden transition-all duration-200 ease-out",
            mobileMenuOpen ? "max-h-[500px] py-4 opacity-100" : "max-h-0 py-0 opacity-0"
          )}
        >
          <div className="flex flex-col gap-2">
              {/* Configuración General primero */}
              <Link
                href="/admin/onboarding"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-[44px]',
                  pathname === '/admin/onboarding'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <Sparkles className="h-5 w-5" />
                Configuración General
              </Link>

              {mainNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-[44px]',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}

              {/* Configuración Section - sin Configuración General que ya está arriba */}
              <div className="border-t pt-2 mt-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Configuración
                </div>
                {configNavItems.filter(item => item.href !== '/admin/onboarding').map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-[44px]',
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* Logout */}
              <div className="border-t pt-2 mt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 w-full transition-colors min-h-[44px]"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

      </div>
    </div>
    <OnboardingBanner />
    </>
  )
}
