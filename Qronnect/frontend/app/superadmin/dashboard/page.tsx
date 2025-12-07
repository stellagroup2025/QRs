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
  BarChart3,
  FileText,
  QrCode,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import CountUp from 'react-countup'

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

      if (response.status === 401) {
        localStorage.removeItem('superadmin_token')
        localStorage.removeItem('superadmin_refresh_token')
        localStorage.removeItem('superadmin_user')
        router.push('/superadmin/login')
        return
      }

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
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/20 flex-shrink-0">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 truncate">
                  Panel Master
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate font-medium">
                  {(() => {
                    const h = new Date().getHours()
                    if (h < 12) return 'Buenos días'
                    if (h < 20) return 'Buenas tardes'
                    return 'Buenas noches'
                  })()}, {user?.nombre || 'Superadmin'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <div className="hidden md:flex items-center text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full dark:bg-green-900/30 dark:text-green-400 mr-2">
                <Zap className="w-3 h-3 mr-1 fill-current" />
                Sistema Operativo
              </div>
              <ThemeToggle />
              <Button variant="ghost" size="sm" className="hidden sm:flex text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
              <Button variant="ghost" size="icon" className="sm:hidden text-red-600" aria-label="Cerrar sesión" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Resumen Global</h2>
          <p className="text-slate-500 dark:text-slate-400">Visión general del rendimiento de toda la plataforma Qronnect.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Tiendas Activas */}
          <Card className="border-none shadow-xl bg-white dark:bg-slate-800 overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Store className="w-24 h-24 text-blue-600" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Tiendas Activas
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                <CountUp end={data?.tiendas_activas || 0} duration={2} />
              </div>
              <div className="text-xs font-medium text-slate-500 mt-2 flex items-center">
                <span className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mr-2">
                  {data?.total_tiendas}
                </span>
                registradas
              </div>
              {/* Progress bar visual */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 mt-4 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${(data?.tiendas_activas || 0) / (data?.total_tiendas || 1) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Total Clientes */}
          <Card className="border-none shadow-xl bg-white dark:bg-slate-800 overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-24 h-24 text-purple-600" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Usuarios Totales
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                <CountUp end={data?.total_clientes || 0} separator="." duration={2.5} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                En todo el ecosistema
              </p>
            </CardContent>
          </Card>

          {/* Total Compras */}
          <Card className="border-none shadow-xl bg-white dark:bg-slate-800 overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShoppingCart className="w-24 h-24 text-emerald-600" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Transacciones
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                <CountUp end={data?.total_compras || 0} separator="." duration={2.2} />
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{data?.compras_ultimo_mes} este mes
              </p>
            </CardContent>
          </Card>

          {/* Facturación Total */}
          <Card className="border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Euro className="w-24 h-24 text-white" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-slate-300 uppercase tracking-wider">
                Volumen Total
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-black tracking-tight">
                € <CountUp end={data?.facturacion_total || 0} separator="." decimals={2} duration={3} />
              </div>
              <p className="text-xs text-slate-300 mt-2 opacity-80">
                +€{(data?.facturacion_ultimo_mes || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} últimos 30 días
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Acciones Rápidas</h3>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 border-l-green-500" onClick={() => router.push('/superadmin/tiendas/nueva')}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Nueva Tienda</CardTitle>
                  <CardDescription>Onboarding de comercio</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500" onClick={() => router.push('/superadmin/tiendas')}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                  <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Gestión Tiendas</CardTitle>
                  <CardDescription>Directorio de comercios</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 border-l-orange-500" onClick={() => router.push('/superadmin/qr-codes')}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                  <QrCode className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Pool QR</CardTitle>
                  <CardDescription>Gestión de códigos físicos</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-l-4 border-l-purple-500" onClick={() => router.push('/superadmin/logs')}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Auditoría</CardTitle>
                  <CardDescription>Logs del sistema</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Info Card Refined */}
        <Card className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center text-2xl">
              <Zap className="h-6 w-6 mr-3 text-yellow-400 fill-yellow-400" />
              Estado del Sistema
            </CardTitle>
            <CardDescription className="text-slate-300 text-base">
              Todos los sistemas operacionales funcionando correctamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-green-500/20 p-1 rounded-full"><ShieldCheck className="w-4 h-4 text-green-400" /></div>
                <div>
                  <p className="font-bold text-lg">Seguridad</p>
                  <p className="text-slate-400">Auditoría activa y tokens validados.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-blue-500/20 p-1 rounded-full"><BarChart3 className="w-4 h-4 text-blue-400" /></div>
                <div>
                  <p className="font-bold text-lg">Métricas</p>
                  <p className="text-slate-400">Actualización en tiempo real.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 bg-purple-500/20 p-1 rounded-full"><TrendingUp className="w-4 h-4 text-purple-400" /></div>
                <div>
                  <p className="font-bold text-lg">Escalabilidad</p>
                  <p className="text-slate-400">Infraestructura optimizada.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

