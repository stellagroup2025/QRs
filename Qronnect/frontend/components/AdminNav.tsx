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
} from 'lucide-react'

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
    label: 'Wizard Inicial',
    icon: Sparkles,
    badge: 'Nuevo',
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
    badge: 'Nuevo',
  },
  {
    href: '/admin/configuracion/ia',
    label: 'Configuración IA',
    icon: Brain,
    badge: 'Nuevo',
  },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('tenant_domain')
    router.push('/admin/login')
  }

  return (
    <div className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="font-bold text-xl text-blue-600">
              Admin Panel
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
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={cn(
            "md:hidden border-t overflow-hidden transition-all duration-200 ease-out",
            mobileMenuOpen ? "max-h-[500px] py-4 opacity-100" : "max-h-0 py-0 opacity-0"
          )}
        >
          <div className="flex flex-col gap-2">
              {mainNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
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

              {/* Configuración Section */}
              <div className="border-t pt-2 mt-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Configuración
                </div>
                {configNavItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
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

              {/* Logout */}
              <div className="border-t pt-2 mt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

      </div>
    </div>
  )
}
