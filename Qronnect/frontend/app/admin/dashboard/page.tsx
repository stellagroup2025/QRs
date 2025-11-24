'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { AdminNav } from '@/components/AdminNav'
import { getQrUrl } from '@/lib/urls'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  ShoppingCart,
  Euro,
  QrCode,
  Download,
  ExternalLink,
  TrendingUp,
  Calendar,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BarChart3,
  Gift,
  Ticket,
  Mail,
  Sparkles,
} from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { RegistrarVentaDialogMejorado } from '@/components/admin/RegistrarVentaDialogMejorado'
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PromocionesPanel } from '@/components/admin/promociones/PromocionesPanel'
import { ValidarCanjeDialog } from '@/components/admin/promociones/ValidarCanjeDialog'
import { CampanasPanel } from '@/components/admin/campanas/CampanasPanel'
import { CampanasSMSPanel } from '@/components/admin/campanas/CampanasSMSPanel'
import { IADrawerCampanas } from '@/components/admin/campanas/IADrawer'
import { IADrawerPromociones } from '@/components/admin/promociones/IADrawer'
import { PanelIA } from '@/components/admin/ia/PanelIA'
import { AnalistaKPIs } from '@/components/admin/ia/AnalistaKPIs'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface DashboardData {
  total_clientes: number
  clientes_activos_ultimos_30_dias: number
  total_compras: number
  ventas_totales: number
  ticket_medio: number
  puntos_otorgados_totales: number
}

interface Cliente {
  id: string
  nombre: string
  email: string
  telefono?: string
  fecha_nacimiento?: string
  genero?: string
  puntos_totales: number
  fecha_registro: string
  ultima_visita?: string
  total_compras: number
  ticket_medio?: number
  num_compras?: number
  dias_desde_ultima_visita?: number
}

interface ClientesResponse {
  data: Cliente[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface Compra {
  id: string
  fecha: string
  importe: number
  puntos_otorgados: number
  notas?: string
  cliente: {
    id: string
    nombre: string
    email: string
    telefono?: string
  }
}

interface ComprasResponse {
  data: Compra[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface AnalyticsData {
  evolucion_clientes: Array<{ fecha: string; valor: number }>
  evolucion_facturacion: Array<{ fecha: string; valor: number }>
  distribucion_puntos: Array<{ rango: string; clientes: number; color?: string }>
  top_clientes: Array<{
    id: string
    nombre: string
    email: string
    total_gastado: number
    num_compras: number
    puntos_totales: number
  }>
  tasa_retencion: number
  frecuencia_visita_promedio: number
  cambio_clientes_pct: number
  cambio_facturacion_pct: number
  cambio_ticket_medio_pct: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { branding } = useBrandingContext()
  const [tienda, setTienda] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrUrl, setQrUrl] = useState('')

  // Estado para clientes
  const [clientes, setClientes] = useState<ClientesResponse | null>(null)
  const [clientesLoading, setClientesLoading] = useState(false)
  const [searchClientes, setSearchClientes] = useState('')
  const [clientesPage, setClientesPage] = useState(1)

  // Estado para compras
  const [compras, setCompras] = useState<ComprasResponse | null>(null)
  const [comprasLoading, setComprasLoading] = useState(false)
  const [comprasPage, setComprasPage] = useState(1)
  const [searchCompras, setSearchCompras] = useState('')

  // Estado para el tab activo
  const [activeTab, setActiveTab] = useState('qr')

  // Estado para los diálogos
  const [registrarVentaOpen, setRegistrarVentaOpen] = useState(false)
  const [validarCanjeOpen, setValidarCanjeOpen] = useState(false)

  // Estado para analytics
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsPeriodo, setAnalyticsPeriodo] = useState<'7d' | '30d' | '90d'>('30d')

  // Estado para refresh de campañas
  const [refreshCampanas, setRefreshCampanas] = useState<(() => void) | null>(null)

  useEffect(() => {
    // Verificar si hay un token de superadmin en la URL
    const urlParams = new URLSearchParams(window.location.search)
    const superadminToken = urlParams.get('superadmin_token')
    const openSale = urlParams.get('open_sale')
    const clienteId = urlParams.get('cliente_id')

    if (superadminToken) {
      // El superadmin está accediendo, guardar el token y limpiar la URL
      localStorage.setItem('admin_token', superadminToken)

      // Limpiar el token de la URL por seguridad
      window.history.replaceState({}, '', window.location.pathname)

      // Obtener info de la tienda desde el backend
      fetchTiendaInfo(superadminToken)
      return
    }

    const adminToken = localStorage.getItem('admin_token')
    const tiendaData = localStorage.getItem('admin_tienda')

    if (!adminToken || !tiendaData) {
      router.push('/admin/login')
      return
    }

    setToken(adminToken)
    setTienda(JSON.parse(tiendaData))
    fetchDashboard(adminToken)

    // Generar URL del QR con subdominio del tenant
    const storedTienda = JSON.parse(tiendaData)
    const registroUrl = getQrUrl(storedTienda.dominio)
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(registroUrl)}`)

    // Si viene de quick-sale, abrir modal de venta con cliente preseleccionado
    if (openSale === 'true' && clienteId) {
      console.log('🎯 Abriendo modal de venta con cliente:', clienteId)
      // Guardar el cliente_id para que el modal lo use
      sessionStorage.setItem('preselected_cliente_id', clienteId)
      setRegistrarVentaOpen(true)
      // Limpiar la URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [router])

  // Cargar datos cuando cambia el tab activo
  useEffect(() => {
    if (activeTab === 'clientes' && !clientes) {
      fetchClientes(1, searchClientes)
    } else if (activeTab === 'ventas' && !compras) {
      fetchCompras(1)
    } else if (activeTab === 'analytics' && !analytics) {
      fetchAnalytics(analyticsPeriodo)
    }
  }, [activeTab])

  // Recargar analytics cuando cambia el periodo
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics(analyticsPeriodo)
    }
  }, [analyticsPeriodo])

  const fetchTiendaInfo = async (token: string) => {
    try {
      // Decodificar el token para obtener el tienda_id
      const payload = JSON.parse(atob(token))
      const domain = window.location.hostname.split('.')[0] // Extraer el subdominio

      // Simular data de tienda basado en el dominio (en producción esto vendría del backend)
      const tiendaData = {
        id: payload.tienda_id,
        dominio: domain,
        nombre: domain.charAt(0).toUpperCase() + domain.slice(1), // Capitalizar
      }

      localStorage.setItem('admin_tienda', JSON.stringify(tiendaData))
      setToken(token)
      setTienda(tiendaData)

      // Generar URL del QR
      const registroUrl = getQrUrl(domain)
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(registroUrl)}`)

      // Cargar dashboard
      fetchDashboard(token)
    } catch (error) {
      console.error('Error al obtener info de tienda:', error)
      router.push('/admin/login')
    }
  }

  const fetchDashboard = async (token: string) => {
    try {
      // Obtener el dominio de la tienda desde localStorage
      const tiendaData = localStorage.getItem('admin_tienda')
      const domain = tiendaData ? JSON.parse(tiendaData).dominio : 'localhost'

      const response = await fetch(`${API_URL}/api/admin/dashboard/resumen`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
      })

      if (!response.ok) throw new Error('Error al cargar dashboard')

      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error:', error)
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchClientes = async (page = 1, search = '') => {
    setClientesLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const tiendaData = localStorage.getItem('admin_tienda')
      const domain = tiendaData ? JSON.parse(tiendaData).dominio : 'localhost'

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        orderBy: 'fecha_registro',
        order: 'desc',
      })

      if (search.trim()) {
        params.append('search', search.trim())
      }

      const response = await fetch(`${API_URL}/api/admin/clientes?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
      })

      if (!response.ok) throw new Error('Error al cargar clientes')

      const clientesData = await response.json()
      setClientes(clientesData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setClientesLoading(false)
    }
  }

  const fetchCompras = async (page = 1, search = '') => {
    setComprasLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const tiendaData = localStorage.getItem('admin_tienda')
      const domain = tiendaData ? JSON.parse(tiendaData).dominio : 'localhost'

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        orderBy: 'fecha',
        order: 'desc',
      })

      if (search.trim()) {
        params.append('search', search.trim())
      }

      const response = await fetch(`${API_URL}/api/admin/compras?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
      })

      if (!response.ok) throw new Error('Error al cargar compras')

      const comprasData = await response.json()
      setCompras(comprasData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setComprasLoading(false)
    }
  }

  const fetchAnalytics = async (periodo: '7d' | '30d' | '90d' = '30d') => {
    setAnalyticsLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const tiendaData = localStorage.getItem('admin_tienda')
      const domain = tiendaData ? JSON.parse(tiendaData).dominio : 'localhost'

      const response = await fetch(`${API_URL}/api/admin/dashboard/analytics?periodo=${periodo}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
      })

      if (!response.ok) throw new Error('Error al cargar analytics')

      const analyticsData = await response.json()
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calcularEdad = (fechaNacimiento?: string) => {
    if (!fechaNacimiento) return '-'
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  const formatearDiasDesdeUltimaVisita = (dias?: number) => {
    if (dias === undefined || dias === null) return '-'
    if (dias === 0) return 'Hoy'
    if (dias === 1) return 'Ayer'
    if (dias < 7) return `${dias} días`
    if (dias < 30) return `${Math.floor(dias / 7)} sem.`
    if (dias < 365) return `${Math.floor(dias / 30)} meses`
    return `${Math.floor(dias / 365)} años`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: hexToRgb(branding.color_primario) }}></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Admin Navigation */}
      <AdminNav />

      {/* Header - Logo y Info */}
      <header className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <BrandLogo width={120} height={40} />
            <div>
              <h1 className="text-xl font-bold" style={{ color: hexToRgb(branding.color_primario) }}>{branding.nombre_comercial}</h1>
              <p className="text-sm text-muted-foreground">
                Panel de administración
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-2 sm:p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Clientes</CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-2 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold">{data?.total_clientes || 0}</div>
              <p className="text-xs sm:text-xs text-muted-foreground hidden sm:block">Registrados</p>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Compras</CardTitle>
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-2 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold">{data?.total_compras || 0}</div>
              <p className="text-xs sm:text-xs text-muted-foreground hidden sm:block">
                Ticket: €{(data?.ticket_medio || 0).toFixed(0)}
              </p>
            </CardContent>
          </Card>

          <Card className="p-2 sm:p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-6 sm:pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Ventas</CardTitle>
              <Euro className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-2 pt-0 sm:p-6 sm:pt-0">
              <div className="text-lg sm:text-2xl font-bold">
                €{(data?.ventas_totales || 0).toLocaleString('es-ES', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs sm:text-xs text-muted-foreground hidden sm:block">
                {data?.puntos_otorgados_totales || 0} pts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="relative -mx-4 sm:mx-0">
            <div className="overflow-x-auto scrollbar-hide px-4 sm:px-0">
              <TabsList className="inline-flex w-auto min-w-full sm:w-full justify-start">
                <TabsTrigger value="qr" className="flex-shrink-0">
                  <QrCode className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">QR de Registro</span>
                </TabsTrigger>
                <TabsTrigger value="clientes" className="flex-shrink-0">
                  <Users className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Clientes</span>
                </TabsTrigger>
                <TabsTrigger value="ventas" className="flex-shrink-0">
                  <ShoppingCart className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Ventas</span>
                </TabsTrigger>
                <TabsTrigger value="promociones" className="flex-shrink-0">
                  <Gift className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Promociones</span>
                </TabsTrigger>
                <TabsTrigger value="campanas" className="flex-shrink-0">
                  <Mail className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Campañas</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex-shrink-0">
                  <BarChart3 className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="ia" className="flex-shrink-0">
                  <Sparkles className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">IA</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* QR Tab */}
          <TabsContent value="qr" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>QR de Registro de Clientes</CardTitle>
                <CardDescription>
                  Comparte este QR para que tus clientes se registren en tu programa de fidelización
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-6">
                  {/* QR Code */}
                  <div className="p-8 bg-white rounded-xl border-4 border-dashed" style={{ borderColor: `${hexToRgb(branding.color_primario).replace('rgb(', 'rgba(').replace(')', ', 0.3)')}` }}>
                    <img
                      src={qrUrl}
                      alt="QR de registro"
                      className="w-80 h-80"
                    />
                  </div>

                  {/* Info */}
                  <div className="w-full max-w-2xl space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">URL de registro</label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded">
                          {tienda?.dominio && getQrUrl(tienda.dominio)}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => tienda?.dominio && window.open(getQrUrl(tienda.dominio), '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button
                        size="lg"
                        className="text-white"
                        style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = qrUrl
                          link.download = `qr-registro-${tienda?.dominio}.png`
                          link.click()
                        }}
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Descargar QR
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        style={{
                          borderColor: hexToRgb(branding.color_primario),
                          color: hexToRgb(branding.color_primario)
                        }}
                        onClick={() => window.print()}
                      >
                        Imprimir
                      </Button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="w-full max-w-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <h4 className="font-semibold mb-3 flex items-center text-blue-900 dark:text-blue-100">
                      <QrCode className="h-5 w-5 mr-2" />
                      Cómo usar este QR
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      <li className="flex items-start">
                        <span className="font-bold mr-2">1.</span>
                        <span>Descarga o imprime el código QR</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">2.</span>
                        <span>Colócalo en un lugar visible de tu establecimiento (mostrador, entrada, mesas)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">3.</span>
                        <span>Los clientes lo escanean con la cámara de su móvil</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">4.</span>
                        <span>Se abre automáticamente el formulario de registro</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold mr-2">5.</span>
                        <span>¡Listo! Ya pueden acumular puntos con cada compra</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clientes Tab */}
          <TabsContent value="clientes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Gestión de Clientes</CardTitle>
                    <CardDescription>
                      {data?.total_clientes || 0} clientes registrados
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar clientes..."
                        className="pl-9 w-full sm:w-48"
                        value={searchClientes}
                        onChange={(e) => {
                          setSearchClientes(e.target.value)
                          setClientesPage(1)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            fetchClientes(1, searchClientes)
                          }
                        }}
                      />
                    </div>
                    <Button
                      onClick={() => fetchClientes(1, searchClientes)}
                      style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                      className="text-white"
                      size="sm"
                    >
                      Buscar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {clientesLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: hexToRgb(branding.color_primario) }}></div>
                  </div>
                ) : clientes && clientes.data && clientes.data.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No se encontraron clientes</p>
                  </div>
                ) : (
                  <>
                    {/* Vista Desktop - Tabla */}
                    <div className="hidden md:block rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Género</TableHead>
                            <TableHead className="text-right">Edad</TableHead>
                            <TableHead className="text-right">Puntos</TableHead>
                            <TableHead className="text-right">Compras</TableHead>
                            <TableHead className="text-right">Ticket Medio</TableHead>
                            <TableHead className="text-right">Última Visita</TableHead>
                            <TableHead>Registro</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientes?.data?.map((cliente) => (
                            <TableRow key={cliente.id}>
                              <TableCell className="font-medium">{cliente.nombre}</TableCell>
                              <TableCell>{cliente.email}</TableCell>
                              <TableCell>{cliente.telefono || '-'}</TableCell>
                              <TableCell className="text-sm">
                                {cliente.genero ? (
                                  cliente.genero === 'masculino' ? 'M' :
                                  cliente.genero === 'femenino' ? 'F' :
                                  cliente.genero === 'otro' ? 'Otro' :
                                  'N/D'
                                ) : '-'}
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {calcularEdad(cliente.fecha_nacimiento)}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-semibold" style={{ color: hexToRgb(branding.color_acento) }}>
                                  {cliente.puntos_totales}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">{cliente.total_compras || 0}</TableCell>
                              <TableCell className="text-right text-sm">
                                {cliente.ticket_medio !== undefined
                                  ? `${cliente.ticket_medio.toFixed(2)} €`
                                  : '-'}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                {formatearDiasDesdeUltimaVisita(cliente.dias_desde_ultima_visita)}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(cliente.fecha_registro)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Vista Móvil - Cards */}
                    <div className="md:hidden space-y-4">
                      {clientes?.data?.map((cliente) => (
                        <Card key={cliente.id}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-base">{cliente.nombre}</h3>
                                <p className="text-sm text-muted-foreground">{cliente.email}</p>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-lg font-bold" style={{ color: hexToRgb(branding.color_acento) }}>
                                  {cliente.puntos_totales}
                                </span>
                                <span className="text-xs text-muted-foreground">puntos</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Teléfono:</span>
                                <p className="font-medium">{cliente.telefono || '-'}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Edad:</span>
                                <p className="font-medium">{calcularEdad(cliente.fecha_nacimiento)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Compras:</span>
                                <p className="font-medium">{cliente.total_compras || 0}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Ticket medio:</span>
                                <p className="font-medium">
                                  {cliente.ticket_medio !== undefined
                                    ? `${cliente.ticket_medio.toFixed(2)} €`
                                    : '-'}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Última visita:</span>
                                <p className="font-medium">{formatearDiasDesdeUltimaVisita(cliente.dias_desde_ultima_visita)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Registro:</span>
                                <p className="font-medium">{formatDate(cliente.fecha_registro)}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Paginación */}
                    {clientes && clientes.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                          Página {clientes.page} de {clientes.totalPages} ({clientes.total} clientes)
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newPage = clientesPage - 1
                              setClientesPage(newPage)
                              fetchClientes(newPage, searchClientes)
                            }}
                            disabled={clientesPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newPage = clientesPage + 1
                              setClientesPage(newPage)
                              fetchClientes(newPage, searchClientes)
                            }}
                            disabled={clientesPage === clientes.totalPages}
                          >
                            Siguiente
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ventas Tab */}
          <TabsContent value="ventas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Registro de Ventas</CardTitle>
                    <CardDescription>
                      {data?.total_compras || 0} compras registradas
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1 sm:flex-initial">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por cliente..."
                        className="pl-9 w-full sm:w-48"
                        value={searchCompras}
                        onChange={(e) => {
                          setSearchCompras(e.target.value)
                          setComprasPage(1)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            fetchCompras(1, searchCompras)
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => fetchCompras(1, searchCompras)}
                        style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                        className="text-white flex-1 sm:flex-initial"
                        size="sm"
                      >
                        Buscar
                      </Button>
                      <Button
                        onClick={() => fetchCompras(1, searchCompras)}
                        variant="outline"
                        size="sm"
                        disabled={comprasLoading}
                      >
                        <RefreshCw className={`h-4 w-4 ${comprasLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {comprasLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: hexToRgb(branding.color_primario) }}></div>
                  </div>
                ) : compras && compras.data && compras.data.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No se encontraron ventas</p>
                  </div>
                ) : (
                  <>
                    {/* Vista Desktop - Tabla */}
                    <div className="hidden md:block rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead className="text-right">Importe</TableHead>
                            <TableHead className="text-right">Puntos</TableHead>
                            <TableHead>Notas</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {compras?.data?.map((compra) => (
                            <TableRow key={compra.id}>
                              <TableCell className="text-sm">
                                {formatDateTime(compra.fecha)}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{compra.cliente.nombre}</p>
                                  <p className="text-sm text-muted-foreground">{compra.cliente.email}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {formatCurrency(compra.importe)}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-semibold" style={{ color: hexToRgb(branding.color_acento) }}>
                                  +{compra.puntos_otorgados}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {compra.notas || '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Vista Móvil - Cards */}
                    <div className="md:hidden space-y-4">
                      {compras?.data?.map((compra) => (
                        <Card key={compra.id}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-base">{compra.cliente.nombre}</h3>
                                <p className="text-sm text-muted-foreground">{compra.cliente.email}</p>
                                <p className="text-xs text-muted-foreground mt-1">{formatDateTime(compra.fecha)}</p>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-lg font-bold">
                                  {formatCurrency(compra.importe)}
                                </span>
                                <span className="text-sm font-semibold" style={{ color: hexToRgb(branding.color_acento) }}>
                                  +{compra.puntos_otorgados} pts
                                </span>
                              </div>
                            </div>

                            {compra.notas && (
                              <div className="pt-2 border-t">
                                <span className="text-xs text-muted-foreground">Notas:</span>
                                <p className="text-sm mt-1">{compra.notas}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Paginación */}
                    {compras && compras.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                          Página {compras.page} de {compras.totalPages} ({compras.total} ventas)
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newPage = comprasPage - 1
                              setComprasPage(newPage)
                              fetchCompras(newPage, searchCompras)
                            }}
                            disabled={comprasPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newPage = comprasPage + 1
                              setComprasPage(newPage)
                              fetchCompras(newPage, searchCompras)
                            }}
                            disabled={comprasPage === compras.totalPages}
                          >
                            Siguiente
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promociones Tab */}
          <TabsContent value="promociones" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold">Promociones</h2>
                <p className="text-sm text-muted-foreground">
                  Gestiona las promociones canjeables con puntos
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <IADrawerPromociones
                  tenantDomain={tienda?.dominio || ''}
                  adminToken={token || ''}
                />
                <Button
                  onClick={() => setValidarCanjeOpen(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Ticket className="h-4 w-4" />
                  <span className="hidden sm:inline">Validar Cupón</span>
                </Button>
              </div>
            </div>

            <PromocionesPanel
              tiendaId={tienda?.id || ''}
              adminToken={token || ''}
              tenantDomain={tienda?.dominio || ''}
            />
          </TabsContent>

          {/* Tab de Campañas */}
          <TabsContent value="campanas" className="space-y-6">
            {/* Botón de IA en la parte superior */}
            <div className="flex justify-end">
              <IADrawerCampanas
                tenantDomain={tienda?.dominio || ''}
                adminToken={token || ''}
                onCampanaCreada={refreshCampanas}
              />
            </div>

            <CampanasPanel
              adminToken={localStorage.getItem('admin_token') || ''}
              tenantDomain={tienda?.dominio || 'localhost'}
              onRefreshNeeded={setRefreshCampanas}
            />

            {/* Campañas SMS */}
            <CampanasSMSPanel
              adminToken={localStorage.getItem('admin_token') || ''}
              tenantDomain={tienda?.dominio || 'localhost'}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analista de KPIs con IA */}
            <AnalistaKPIs
              tenantDomain={tienda?.dominio || ''}
              adminToken={token || ''}
            />

            {/* Selector de Periodo */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle>Analytics y Métricas</CardTitle>
                    <CardDescription>
                      Rendimiento del negocio
                    </CardDescription>
                  </div>
                  <Select value={analyticsPeriodo} onValueChange={(value: '7d' | '30d' | '90d') => setAnalyticsPeriodo(value)}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <SelectValue placeholder="Periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Últimos 7 días</SelectItem>
                      <SelectItem value="30d">Últimos 30 días</SelectItem>
                      <SelectItem value="90d">Últimos 90 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>

            {/* Gráficos */}
            <AnalyticsCharts data={analytics} loading={analyticsLoading} />
          </TabsContent>

          {/* IA Tab */}
          <TabsContent value="ia" className="space-y-4">
            <PanelIA
              tenantDomain={tienda?.dominio || 'localhost'}
              adminToken={token || ''}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Botón flotante para registrar venta */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg text-white"
          style={{ backgroundColor: hexToRgb(branding.color_primario) }}
          onClick={() => setRegistrarVentaOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Diálogo de registrar venta */}
      <RegistrarVentaDialogMejorado
        open={registrarVentaOpen}
        onOpenChange={setRegistrarVentaOpen}
        onSuccess={() => {
          // Recargar todas las métricas del dashboard
          fetchResumen()

          // Recargar los listados según el tab activo
          if (activeTab === 'ventas') {
            fetchCompras(comprasPage, searchCompras)
          } else if (activeTab === 'clientes') {
            fetchClientes(clientesPage, searchClientes)
          }
        }}
      />

      {/* Diálogo de validar canje */}
      <ValidarCanjeDialog
        open={validarCanjeOpen}
        onOpenChange={setValidarCanjeOpen}
        adminToken={token || ''}
        tenantDomain={tienda?.dominio || ''}
      />
    </div>
  )
}
