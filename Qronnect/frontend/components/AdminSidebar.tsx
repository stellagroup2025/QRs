'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import {
    LayoutDashboard,
    Users,
    ShoppingCart,
    UserPlus,
    Gift,
    Mail,
    CreditCard,
    Target, // Gacha alternative? Dices
    Dices,
    Store,
    Paintbrush,
    Coins,
    Package,
    Globe,
    Brain,
    Sparkles,
    User,
    LogOut,
    Menu,
    X,
    ChevronRight,
    QrCode
} from 'lucide-react'

interface SidebarItem {
    title: string
    href: string // Can be a path or a path?tab=...
    icon: React.ComponentType<{ className?: string }>
    badge?: string
    external?: boolean // If true, it forces a full page load navigation or just acts as standard link
}

interface SidebarGroup {
    label: string
    items: SidebarItem[]
}

const menuGroups: SidebarGroup[] = [
    {
        label: 'Principal',
        items: [
            {
                title: 'Dashboard',
                href: '/admin/dashboard', // Defaults to Analytics now
                icon: LayoutDashboard,
            },
            {
                title: 'QR Código',
                href: '/admin/dashboard?tab=qr',
                icon: QrCode,
            },
        ],
    },
    {
        label: 'Gestión',
        items: [
            {
                title: 'Clientes',
                href: '/admin/dashboard?tab=clientes',
                icon: Users,
            },
            {
                title: 'Ventas',
                href: '/admin/dashboard?tab=ventas',
                icon: ShoppingCart,
            },
            {
                title: 'Referidos',
                href: '/admin/referidos',
                icon: UserPlus,
                badge: 'Nuevo',
            },
        ],
    },
    {
        label: 'Marketing',
        items: [
            {
                title: 'Promociones',
                href: '/admin/dashboard?tab=promociones',
                icon: Gift,
            },
            {
                title: 'Campañas',
                href: '/admin/dashboard?tab=campanas',
                icon: Mail,
            },
            {
                title: 'Sellos',
                href: '/admin/dashboard?tab=sellos',
                icon: CreditCard,
            },
            {
                title: 'Regalos Bienvenida',
                href: '/admin/configuracion/regalos',
                icon: Target, // Or Gift
            },
            {
                title: 'Gacha',
                href: '/admin/configuracion/gacha',
                icon: Dices,
                badge: 'Nuevo',
            },
        ],
    },
    {
        label: 'Configuración',
        items: [
            {
                title: 'Tienda',
                href: '/admin/configuracion/tienda',
                icon: Store,
            },
            {
                title: 'Branding',
                href: '/admin/configuracion/branding',
                icon: Paintbrush,
            },
            {
                title: 'Puntos',
                href: '/admin/configuracion/puntos',
                icon: Coins,
            },
            {
                title: 'Productos',
                href: '/admin/configuracion/productos',
                icon: Package,
                badge: 'Nuevo',
            },
            {
                title: 'Landing Page',
                href: '/admin/configuracion/landing',
                icon: Globe,
            },
            {
                title: 'Inteligencia Artificial',
                href: '/admin/configuracion/ia',
                icon: Brain,
            },
            {
                title: 'Onboarding',
                href: '/admin/onboarding',
                icon: Sparkles,
            },
            {
                title: 'Mi Cuenta',
                href: '/admin/configuracion/cuenta',
                icon: User,
            },
        ],
    },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { branding } = useBrandingContext()
    const [isOpen, setIsOpen] = useState(false) // Mobile state

    // Brand colors
    const primaryColor = hexToRgb(branding.color_primario)

    // Determine active state with improved logic
    const isItemActive = (itemHref: string) => {
        // 1. Check exact path match first
        if (pathname === itemHref) return true

        // 2. Split item href into path and query
        const [itemPath, itemQuery] = itemHref.split('?')

        // 3. If standard route (no query params in itemHref)
        // Active if pathname starts with itemPath (handling nested routes)
        if (!itemQuery) {
            // Special case for dashboard root
            if (itemPath === '/admin/dashboard' && pathname === '/admin/dashboard' && !searchParams.get('tab')) return true

            return pathname === itemPath || (itemPath !== '/admin/dashboard' && pathname.startsWith(itemPath))
        }

        // 4. If tab route
        // Active if matches pathname AND tab param
        if (itemQuery) {
            const itemTab = new URLSearchParams(itemQuery).get('tab')
            const currentTab = searchParams.get('tab')
            return pathname === itemPath && currentTab === itemTab
        }

        return false
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('tenant_domain')
        window.location.href = '/admin/login'
    }

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                type="button"
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md text-gray-600"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r dark:border-slate-800 shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="h-16 flex items-center px-6 border-b">
                        {branding.logo_url && !branding.logo_url.includes('/brand/qronnect/') ? (
                            <img
                                src={branding.logo_url}
                                alt={branding.nombre_comercial}
                                className="h-8 w-auto max-w-[150px] object-contain"
                            />
                        ) : (
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                {branding.nombre_comercial || 'Panel Admin'}
                            </span>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <ScrollArea className="flex-1 py-6 px-3">
                        <div className="space-y-6">
                            {menuGroups.map((group) => (
                                <div key={group.label}>
                                    <h4 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {group.label}
                                    </h4>
                                    <div className="space-y-1">
                                        {group.items.map((item) => {
                                            const active = isItemActive(item.href)
                                            const Icon = item.icon

                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setIsOpen(false)} // Close on mobile click
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group relative overflow-hidden",
                                                        active
                                                            ? "text-primary bg-primary/10"
                                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-slate-800"
                                                    )}
                                                    style={active ? {
                                                        color: `rgb(${primaryColor})`,
                                                        backgroundColor: `rgba(${primaryColor}, 0.1)`
                                                    } : undefined}
                                                >
                                                    <Icon className="h-4 w-4 shrink-0 transition-colors" />
                                                    <span className="flex-1 truncate">{item.title}</span>
                                                    {item.badge && (
                                                        <span
                                                            className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-green-100 text-green-700"
                                                        >
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    {active && (
                                                        <div
                                                            className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                                                            style={{ backgroundColor: `rgb(${primaryColor})` }}
                                                        />
                                                    )}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    {/* Footer / User Profile */}
                    <div className="p-4 border-t bg-gray-50/50 dark:bg-slate-900/50 dark:border-slate-800">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
