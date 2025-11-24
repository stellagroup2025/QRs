'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Store,
  Users,
  ShoppingCart,
  Euro,
  TrendingUp,
  LogOut,
  Plus,
  Settings,
  BarChart3
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface DashboardData {
  tiendas_activas: number
  total_tiendas: number
  total_clientes: number
  total_compras: number
  facturacion_total: number
  compras_ultimo_mes: number
  facturacion_ultimo_mes: number
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('superadmin_token')
    const userData = localStorage.getItem('superadmin_user')

    if (!token) {
      router.push('/superadmin/login')
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchDashboard(token)
  }, [router])

  const fetchDashboard = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/superadmin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al cargar dashboard')
      }

      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error:', error)
      // Si hay error de autenticación, redirigir al login
      localStorage.removeItem('superadmin_token')
      router.push('/superadmin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('superadmin_token')
    localStorage.removeItem('superadmin_refresh_token')
    localStorage.removeItem('superadmin_user')
    router.push('/superadmin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2 bg-purple-500/10 rounded-lg flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                  SuperAdmin
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {user?.nombre || 'Admin'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                onClick={() => router.push('/superadmin/tiendas')}
              >
                <Store className="h-4 w-4 mr-2" />
                Gestionar Tiendas
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="sm:hidden"
                onClick={() => router.push('/superadmin/tiendas')}
              >
                <Store className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
              <Button variant="ghost" size="icon" className="sm:hidden" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Tiendas Activas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tiendas Activas
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.tiendas_activas}</div>
              <p className="text-xs text-muted-foreground">
                de {data?.total_tiendas} totales
              </p>
            </CardContent>
          </Card>

          {/* Total Clientes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.total_clientes.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                En todas las tiendas
              </p>
            </CardContent>
          </Card>

          {/* Total Compras */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Compras
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data?.total_compras.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {data?.compras_ultimo_mes} este mes
              </p>
            </CardContent>
          </Card>

          {/* Facturación Total */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Facturación Total
              </CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{data?.facturacion_total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                €{data?.facturacion_ultimo_mes.toLocaleString('es-ES', { minimumFractionDigits: 2 })} este mes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/superadmin/tiendas/nueva')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Plus className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Crear Tienda</CardTitle>
                  <CardDescription>Añadir nuevo comercio</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/superadmin/tiendas')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Store className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ver Tiendas</CardTitle>
                  <CardDescription>Gestionar comercios</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/superadmin/logs')}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Settings className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Logs de Auditoría</CardTitle>
                  <CardDescription>Ver historial</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
              Panel SuperAdmin
            </CardTitle>
            <CardDescription>
              Gestión centralizada de todas las tiendas del sistema Qronnect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1">✓ Control total</p>
                <p className="text-muted-foreground">
                  Gestiona todas las tiendas desde un solo lugar
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">✓ Métricas en tiempo real</p>
                <p className="text-muted-foreground">
                  Estadísticas globales del sistema
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1">✓ Auditoría completa</p>
                <p className="text-muted-foreground">
                  Registro de todas las acciones
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
