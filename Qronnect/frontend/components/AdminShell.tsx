'use client'

import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

const AdminSidebar = dynamic(
    () => import('@/components/AdminSidebar').then((mod) => mod.AdminSidebar),
    { ssr: false }
)

export function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isLoginPage = pathname === '/admin/login' || pathname.includes('/admin/login')

    if (isLoginPage) {
        return <>{children}</>
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
            <AdminSidebar />
            <main className="flex-1 w-full overflow-y-auto h-screen transition-all bg-gray-50/50">
                <div className="p-4 md:p-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
