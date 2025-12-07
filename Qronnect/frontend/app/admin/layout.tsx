import { AdminShell } from '@/components/AdminShell'

// Force dynamic rendering for all admin pages to avoid build-time prerendering errors
// caused by extensive client-side logic and searchParams
export const dynamic = 'force-dynamic'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AdminShell>
            {children}
        </AdminShell>
    )
}
