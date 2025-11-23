'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * Página de acceso rápido para añadir venta desde QR del cliente
 *
 * Flujo:
 * 1. Cliente muestra su QR desde su perfil
 * 2. Admin escanea con cámara normal del móvil
 * 3. Se abre esta URL: /admin/quick-sale?cliente_id=UUID
 * 4. Si admin tiene sesión activa → Redirige a dashboard con modal abierto
 * 5. Si NO tiene sesión → Redirige a login y luego vuelve aquí
 */
export default function QuickSalePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clienteId = searchParams.get('cliente_id')

  useEffect(() => {
    // Verificar si hay sesión de admin
    const adminToken = localStorage.getItem('admin_token')
    const tiendaData = localStorage.getItem('admin_tienda')

    if (!adminToken || !tiendaData) {
      // No hay sesión - redirigir a login con returnUrl
      const returnUrl = `/admin/quick-sale?cliente_id=${clienteId}`
      router.push(`/admin/login?returnUrl=${encodeURIComponent(returnUrl)}`)
      return
    }

    if (!clienteId) {
      // No hay cliente_id - ir a dashboard normal
      router.push('/admin/dashboard')
      return
    }

    // Hay sesión y cliente_id - redirigir al dashboard con parámetro
    // El dashboard detectará el parámetro y abrirá el modal automáticamente
    router.push(`/admin/dashboard?open_sale=true&cliente_id=${clienteId}`)
  }, [clienteId, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  )
}
