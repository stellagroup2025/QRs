'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const AdminSidebar = dynamic(
    () => import('@/components/AdminSidebar').then((mod) => mod.AdminSidebar),
    { ssr: false }
)

const RegistrarVentaDialogMejorado = dynamic(
    () => import('@/components/admin/RegistrarVentaDialogMejorado').then((mod) => mod.RegistrarVentaDialogMejorado),
    { ssr: false }
)

/** Evento que se lanza tras registrar una venta, para que las pantallas recarguen sus datos */
export const VENTA_REGISTRADA_EVENT = 'venta-registrada'

export function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isLoginPage = pathname === '/admin/login' || pathname.includes('/admin/login')
    const [ventaOpen, setVentaOpen] = useState(false)

    // El tema del panel va en <body> para que también lo usen los diálogos (se pintan fuera de este árbol)
    useEffect(() => {
        if (isLoginPage) return
        document.body.classList.add('admin-theme')
        return () => document.body.classList.remove('admin-theme')
    }, [isLoginPage])

    // "Registrar venta" se puede abrir desde cualquier pantalla del panel
    useEffect(() => {
        if (isLoginPage) return
        const open = () => setVentaOpen(true)
        window.addEventListener('open-sale-modal', open)

        // El QR del cliente abre /admin/dashboard?open_sale=true&cliente_id=...
        const params = new URLSearchParams(window.location.search)
        const clienteId = params.get('cliente_id')
        if (params.get('open_sale') === 'true' && clienteId) {
            sessionStorage.setItem('preselected_cliente_id', clienteId)
            setVentaOpen(true)
            window.history.replaceState({}, '', window.location.pathname)
        }

        return () => window.removeEventListener('open-sale-modal', open)
    }, [isLoginPage])

    if (isLoginPage) {
        return <>{children}</>
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <AdminSidebar />
            <main className="min-w-0 flex-1">
                <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-10 lg:pt-10">
                    {children}
                </div>
            </main>
            <RegistrarVentaDialogMejorado
                open={ventaOpen}
                onOpenChange={setVentaOpen}
                onSuccess={() => window.dispatchEvent(new CustomEvent(VENTA_REGISTRADA_EVENT))}
            />
        </div>
    )
}
