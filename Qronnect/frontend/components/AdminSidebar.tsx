'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
    Brain,
    Coins,
    Dices,
    Gift,
    Globe,
    LayoutDashboard,
    LogOut,
    Mail,
    Menu,
    Package,
    Paintbrush,
    Plus,
    QrCode,
    ShoppingCart,
    Sparkles,
    Stamp,
    Store,
    Ticket,
    User,
    UserPlus,
    Wand2,
    Users,
    X,
    type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBrandingContext } from '@/components/BrandingProvider'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface SidebarItem {
    title: string
    /** Ruta, o ruta con ?tab=... para las secciones del escritorio */
    href: string
    icon: LucideIcon
}

interface SidebarGroup {
    label: string
    items: SidebarItem[]
}

const MENU: SidebarGroup[] = [
    {
        label: 'Día a día',
        items: [
            { title: 'Resumen', href: '/admin/dashboard', icon: LayoutDashboard },
            { title: 'Clientes', href: '/admin/dashboard?tab=clientes', icon: Users },
            { title: 'Ventas', href: '/admin/dashboard?tab=ventas', icon: ShoppingCart },
            { title: 'QR de registro', href: '/admin/dashboard?tab=qr', icon: QrCode },
        ],
    },
    {
        label: 'Fidelización',
        items: [
            { title: 'Premios por puntos', href: '/admin/dashboard?tab=promociones', icon: Gift },
            { title: 'Tarjetas de sellos', href: '/admin/dashboard?tab=sellos', icon: Stamp },
            { title: 'Regalos', href: '/admin/configuracion/regalos', icon: Ticket },
            { title: 'Máquina de premios', href: '/admin/configuracion/gacha', icon: Dices },
            { title: 'Referidos', href: '/admin/referidos', icon: UserPlus },
        ],
    },
    {
        label: 'Comunicación',
        items: [
            { title: 'Campañas', href: '/admin/dashboard?tab=campanas', icon: Mail },
            { title: 'Asistente IA', href: '/admin/dashboard?tab=ia', icon: Sparkles },
        ],
    },
    {
        label: 'Tu negocio',
        items: [
            { title: 'Datos del negocio', href: '/admin/configuracion/tienda', icon: Store },
            { title: 'Imagen de marca', href: '/admin/configuracion/branding', icon: Paintbrush },
            { title: 'Página para clientes', href: '/admin/configuracion/landing', icon: Globe },
            { title: 'Puntos', href: '/admin/configuracion/puntos', icon: Coins },
            { title: 'Productos', href: '/admin/configuracion/productos', icon: Package },
            { title: 'Ajustes de IA', href: '/admin/configuracion/ia', icon: Brain },
            { title: 'Asistente de alta', href: '/admin/onboarding', icon: Wand2 },
            { title: 'Mi cuenta', href: '/admin/configuracion/cuenta', icon: User },
        ],
    },
]

/** Abre el formulario de "Registrar venta" que vive en AdminShell */
export function abrirRegistrarVenta() {
    window.dispatchEvent(new CustomEvent('open-sale-modal'))
}

function StoreMark() {
    const { branding } = useBrandingContext()
    const hasLogo = branding.logo_url && !branding.logo_url.includes('/brand/qronnect/')

    return (
        <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand font-display text-sm font-bold text-brand-on">
                {hasLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={branding.logo_url!} alt="" className="h-full w-full bg-white object-contain p-1" />
                ) : (
                    (branding.nombre_comercial || 'Q').charAt(0).toUpperCase()
                )}
            </span>
            <span className="min-w-0 leading-tight">
                <span className="block truncate font-display text-[15px] font-semibold text-foreground">
                    {branding.nombre_comercial || 'Mi negocio'}
                </span>
                <span className="block text-xs text-muted-foreground">Panel de gestión</span>
            </span>
        </Link>
    )
}

export function AdminSidebar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isOpen, setIsOpen] = useState(false)

    // Cerrar el menú del móvil al cambiar de pantalla
    useEffect(() => {
        setIsOpen(false)
    }, [pathname, searchParams])

    const isItemActive = (itemHref: string) => {
        const [itemPath, itemQuery] = itemHref.split('?')
        const currentTab = searchParams.get('tab')

        if (itemQuery) {
            return pathname === itemPath && currentTab === new URLSearchParams(itemQuery).get('tab')
        }
        if (itemPath === '/admin/dashboard') {
            return pathname === itemPath && (!currentTab || currentTab === 'analytics')
        }
        return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('tenant_domain')
        window.location.href = '/admin/login'
    }

    const nav = (
        <div className="flex h-full flex-col">
            <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-4">
                <StoreMark />
                <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-label="Cerrar menú"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="px-3 pb-2">
                <button
                    type="button"
                    onClick={() => {
                        setIsOpen(false)
                        abrirRegistrarVenta()
                    }}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Registrar venta
                </button>
            </div>

            <nav aria-label="Panel de gestión" className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
                <div className="space-y-6">
                    {MENU.map((group) => (
                        <div key={group.label}>
                            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                                {group.label}
                            </p>
                            <ul className="space-y-0.5">
                                {group.items.map((item) => {
                                    const active = isItemActive(item.href)
                                    const Icon = item.icon
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                aria-current={active ? 'page' : undefined}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                                    active
                                                        ? 'bg-accent text-foreground'
                                                        : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground',
                                                )}
                                            >
                                                <Icon className={cn('h-4 w-4 shrink-0', active && 'text-brand')} aria-hidden="true" />
                                                <span className="truncate">{item.title}</span>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
            </nav>

            <div className="flex items-center gap-1 border-t p-3">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex h-9 flex-1 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Cerrar sesión
                </button>
                <ThemeToggle />
            </div>
        </div>
    )

    return (
        <>
            {/* Móvil: barra superior con menú y botón de venta */}
            <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between gap-3 border-b bg-background/90 px-3 backdrop-blur-lg lg:hidden">
                <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-accent"
                    onClick={() => setIsOpen(true)}
                    aria-label="Abrir menú"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                    <StoreMark />
                </div>
                <button
                    type="button"
                    onClick={abrirRegistrarVenta}
                    className="flex h-10 items-center gap-1.5 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground"
                >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Venta
                </button>
            </div>

            {/* Escritorio: menú fijo. Móvil: cajón lateral */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0',
                    isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
                )}
            >
                {nav}
            </aside>

            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </>
    )
}
