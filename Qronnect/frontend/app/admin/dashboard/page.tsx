'use client'

import { useEffect, useRef, useState } from 'react'
import { eur } from '@/lib/format'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import CountUp from 'react-countup'
import { useDebounce } from '@/hooks/use-debounce'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { getQrUrl } from '@/lib/urls'
import { QRCodeSVG } from 'qrcode.react'
import QRCodeLib from 'qrcode'
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
  CreditCard,
} from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { VENTA_REGISTRADA_EVENT } from '@/components/AdminShell'
import { abrirRegistrarVenta } from '@/components/AdminSidebar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DashboardSkeleton, CardSkeleton } from '@/components/ui/skeleton'
import { ErrorRetry } from '@/components/ui/error-retry'
import { useToast } from '@/hooks/use-toast'

// 🚀 Dynamic imports para code splitting (mejora performance)
const AnalyticsCharts = dynamic(
  () => import('@/components/admin/AnalyticsCharts').then(mod => ({ default: mod.AnalyticsCharts })),
  {
    loading: () => <CardSkeleton />,
    ssr: false, // Charts no necesitan SSR
  }
)

const PromocionesPanel = dynamic(
  () => import('@/components/admin/promociones/PromocionesPanel').then(mod => ({ default: mod.PromocionesPanel })),
  {
    loading: () => <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>,
    ssr: false,
  }
)

const CampanasPanel = dynamic(
  () => import('@/components/admin/campanas/CampanasPanel').then(mod => ({ default: mod.CampanasPanel })),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  }
)

const CampanasSMSPanel = dynamic(
  () => import('@/components/admin/campanas/CampanasSMSPanel').then(mod => ({ default: mod.CampanasSMSPanel })),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  }
)

const IADrawerCampanas = dynamic(
  () => import('@/components/admin/campanas/IADrawer').then(mod => ({ default: mod.IADrawerCampanas })),
  { ssr: false }
)


const PanelIA = dynamic(
  () => import('@/components/admin/ia/PanelIA').then(mod => ({ default: mod.PanelIA })),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  }
)

const AnalistaKPIs = dynamic(
  () => import('@/components/admin/ia/AnalistaKPIs').then(mod => ({ default: mod.AnalistaKPIs })),
  { ssr: false }
)

const ProgramasSellosPanel = dynamic(
  () => import('@/components/admin/sellos/ProgramasSellosPanel').then(mod => ({ default: mod.ProgramasSellosPanel })),
  {
    loading: () => <CardSkeleton />,
    ssr: false,
  }
)

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
  const [loadError, setLoadError] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState('')
  const [adminUser, setAdminUser] = useState<{ nombre: string; email: string; rol: string } | null>(null)

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

  // Debounce para búsquedas automáticas
  const debouncedSearchClientes = useDebounce(searchClientes, 400)
  const debouncedSearchCompras = useDebounce(searchCompras, 400)

  const searchParams = useSearchParams()
  // Estado para el tab activo (sincronizado con URL)
  const activeTab = searchParams.get('tab') || 'analytics'

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`/admin/dashboard?${params.toString()}`)
  }

  // Estado para los diálogos
  const [registrarVentaOpen, setRegistrarVentaOpen] = useState(false)

  // Estado para analytics
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsPeriodo, setAnalyticsPeriodo] = useState<'7d' | '30d' | '90d'>('30d')

  // Estado para refresh de campañas
  const [refreshCampanas, setRefreshCampanas] = useState<(() => void) | undefined>(undefined)

  // Toast para notificaciones
  const { toast } = useToast()

  // Handlers para crear campaña/promoción desde el plan de acción IA
  const handleCreateCampaignFromIA = (datosPrellenados: any) => {
    setActiveTab('campanas')
    toast({
      title: '💡 Sugerencia de IA',
      description: datosPrellenados?.asunto || datosPrellenados?.objetivo || 'Crea una nueva campaña de email',
    })
  }

  const handleCreatePromotionFromIA = (datosPrellenados: any) => {
    setActiveTab('promociones')
    toast({
      title: '💡 Sugerencia de IA',
      description: datosPrellenados?.nombre || datosPrellenados?.objetivo || 'Crea una nueva promoción',
    })
  }

  useEffect(() => {
    // Verificar si hay un token de superadmin en la URL
    const urlParams = new URLSearchParams(window.location.search)
    const superadminToken = urlParams.get('superadmin_token')

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
    const adminUserData = localStorage.getItem('admin_user')

    if (!adminToken || !tiendaData) {
      router.push('/admin/login')
      return
    }

    setToken(adminToken)
    setTienda(JSON.parse(tiendaData))
    if (adminUserData) {
      setAdminUser(JSON.parse(adminUserData))
    }
    fetchDashboard(adminToken)

    // Generar URL del QR con subdominio del tenant
    const storedTienda = JSON.parse(tiendaData)
    const registroUrl = getQrUrl(storedTienda.dominio)
    setQrUrl(registroUrl)

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

  // Búsqueda automática con debounce para clientes
  useEffect(() => {
    if (activeTab === 'clientes' && token) {
      fetchClientes(1, debouncedSearchClientes)
      setClientesPage(1)
    }
  }, [debouncedSearchClientes])

  // Búsqueda automática con debounce para compras
  useEffect(() => {
    if (activeTab === 'ventas' && token) {
      fetchCompras(1, debouncedSearchCompras)
      setComprasPage(1)
    }
  }, [debouncedSearchCompras])

  // La venta se registra desde AdminShell: aquí solo se recargan los datos (con el estado actual)
  const onVentaRegistrada = useRef<() => void>(() => {})
  onVentaRegistrada.current = () => {
    fetchDashboard()
    fetchAnalytics(analyticsPeriodo)
    if (activeTab === 'ventas') fetchCompras(comprasPage, searchCompras)
    if (activeTab === 'clientes') fetchClientes(clientesPage, searchClientes)
  }

  // 🚀 Listeners para eventos del CommandMenu (Cmd+K)
  useEffect(() => {
    const handleVentaRegistrada = () => onVentaRegistrada.current()
    const handleOpenPromoModal = () => setActiveTab('promociones')
    const handleOpenCampaignModal = () => setActiveTab('campanas')

    window.addEventListener(VENTA_REGISTRADA_EVENT, handleVentaRegistrada)
    window.addEventListener('open-promo-modal', handleOpenPromoModal)
    window.addEventListener('open-campaign-modal', handleOpenCampaignModal)

    return () => {
      window.removeEventListener(VENTA_REGISTRADA_EVENT, handleVentaRegistrada)
      window.removeEventListener('open-promo-modal', handleOpenPromoModal)
      window.removeEventListener('open-campaign-modal', handleOpenCampaignModal)
    }
  }, [])

  const fetchTiendaInfo = async (token: string) => {
    try {
      // Decodificar el token para obtener el tienda_id
      // El token es un JWT: header.payload.signature
      const base64Url = token.includes('.') ? token.split('.')[1] : token;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64))

      console.log('🔍 [fetchTiendaInfo] Token payload:', payload)
      console.log('🌐 [fetchTiendaInfo] Current hostname:', window.location.hostname)

      // Para superadmin, el token tiene el dominio de la tienda
      // Para admin normal, obtenerlo del hostname o del token
      let domain = payload.dominio || payload.tienda_dominio

      if (!domain) {
        // Fallback: extraer de hostname (puede ser incorrecto en Vercel)
        domain = window.location.hostname.split('.')[0]
      }

      console.log('📍 [fetchTiendaInfo] Using domain:', domain)

      // Obtener datos reales de la tienda desde el backend
      const response = await fetch(`${API_URL}/api/admin/tienda`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
      })

      console.log('📡 [fetchTiendaInfo] Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ [fetchTiendaInfo] Error response:', errorText)
        throw new Error('Error al obtener datos de la tienda')
      }

      const tiendaData = await response.json()

      localStorage.setItem('admin_tienda', JSON.stringify(tiendaData))
      setToken(token)
      setTienda(tiendaData)

      // Generar URL del QR usando el dominio real de la tienda
      const registroUrl = getQrUrl(tiendaData.dominio)
      setQrUrl(registroUrl)

      // Cargar dashboard
      fetchDashboard(token)
    } catch (error) {
      console.error('Error al obtener info de tienda:', error)
      router.push('/admin/login')
    }
  }

  const fetchDashboard = async (adminToken?: string) => {
    const tokenToUse = adminToken || token
    if (!tokenToUse) return

    setLoadError(null)
    setLoading(true)
    try {
      // Obtener el dominio de la tienda desde localStorage
      const tiendaData = localStorage.getItem('admin_tienda')
      const domain = tiendaData ? JSON.parse(tiendaData).dominio : 'localhost'

      const response = await fetch(`${API_URL}/api/admin/dashboard/resumen`, {
        headers: {
          'Authorization': `Bearer ${tokenToUse}`,
          'X-Tenant-Domain': domain,
        },
      })

      if (response.status === 401) {
        localStorage.removeItem('admin_token')
        router.push('/admin/login')
        return
      }

      if (!response.ok) throw new Error('Error al cargar dashboard')

      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (error) {
      console.error('Error:', error)
      setLoadError('No se pudo cargar el dashboard. Verifica tu conexión.')
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="max-w-md p-6">
          <ErrorRetry
            title="Error de conexión"
            message={loadError}
            onRetry={() => fetchDashboard()}
            isRetrying={loading}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabecera: solo en el resumen; el resto de secciones llevan su propio título */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {(() => {
                const hour = new Date().getHours()
                if (hour < 12) return 'Buenos días'
                if (hour < 20) return 'Buenas tardes'
                return 'Buenas noches'
              })()}
              {adminUser?.nombre ? `, ${adminUser.nombre.split(' ')[0]}` : ''}
            </h1>
            <p className="mt-1 text-muted-foreground">Así va {branding.nombre_comercial || 'tu negocio'}.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab('qr')} className="rounded-xl">
              <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />
              QR de registro
            </Button>
            <Button onClick={abrirRegistrarVenta} className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Registrar venta
            </Button>
          </div>
        </div>
      )}

      {/* Tabs Content Wrapper */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Navigation is now handled by AdminSidebar */}

        {/* QR Tab */}
        <TabsContent value="qr" className="space-y-6">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">QR de registro</h1>
            <p className="mt-1 text-muted-foreground">Ponlo a la vista: tus clientes lo escanean y se unen a tu club en 30 segundos.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
            {/* Cartel con los colores de la tienda */}
            <div className="overflow-hidden rounded-3xl bg-brand p-6 text-center text-brand-on shadow-sm">
              <p className="font-display text-xl font-bold">{branding.nombre_comercial}</p>
              <p className="text-sm opacity-80">Únete a nuestro club y gana premios</p>
              <div className="mx-auto mt-5 max-w-[280px] rounded-2xl bg-white p-4">
                {qrUrl ? (
                  <QRCodeSVG id="qr-registro" value={qrUrl} size={512} level="M" className="h-auto w-full" />
                ) : (
                  <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />
                )}
              </div>
              <p className="mt-4 text-sm font-medium">Escanéame con la cámara del móvil</p>
            </div>

            <div className="space-y-4">
              <Card className="rounded-2xl">
                <CardContent className="space-y-4 p-5">
                  <div>
                    <p className="text-sm font-medium">Enlace de registro</p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="min-w-0 flex-1 truncate rounded-lg bg-muted px-3 py-2 text-sm">{qrUrl}</code>
                      <Button size="icon" variant="outline" onClick={() => qrUrl && window.open(qrUrl, '_blank')} aria-label="Abrir enlace">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={async () => {
                        if (!qrUrl) return
                        const dataUrl = await QRCodeLib.toDataURL(qrUrl, { width: 1200, margin: 2 })
                        const link = document.createElement('a')
                        link.href = dataUrl
                        link.download = `qr-registro-${tienda?.dominio || 'tienda'}.png`
                        link.click()
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                      Descargar QR
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (!qrUrl) return
                        await navigator.clipboard.writeText(qrUrl)
                        toast({ title: 'Enlace copiado' })
                      }}
                    >
                      Copiar enlace
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardContent className="p-5">
                  <p className="font-medium">Cómo usarlo</p>
                  <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
                    {[
                      'Descarga el QR e imprímelo (o enséñalo en una pantalla).',
                      'Colócalo en el mostrador, la entrada o las mesas.',
                      'Tus clientes lo escanean y se registran desde el móvil, sin app.',
                      'En cada compra, escanea el QR de su móvil con “Registrar venta” para sumarle puntos.',
                    ].map((paso, i) => (
                      <li key={paso} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                          {i + 1}
                        </span>
                        {paso}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Clientes Tab */}
        <TabsContent value="clientes" className="space-y-6">
          <Card className="dark:bg-slate-900 dark:border-slate-800">
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
                      className="pl-9 pr-9 w-full sm:w-48"
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
                      aria-label="Buscar clientes por nombre, email o teléfono"
                    />
                    {clientesLoading && searchClientes && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" aria-hidden="true" />
                        <span className="sr-only" aria-live="polite">Buscando clientes...</span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => fetchClientes(1, searchClientes)}
                    className="text-white"
                    size="sm"
                    disabled={clientesLoading}
                  >
                    {clientesLoading ? 'Buscando...' : 'Buscar'}
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
                  <div className="hidden md:block rounded-md border overflow-x-auto">
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
                                ? eur(cliente.ticket_medio)
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
                      <Card key={cliente.id} className="dark:bg-slate-900 dark:border-slate-800">
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
                                  ? eur(cliente.ticket_medio)
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
          <Card className="dark:bg-slate-900 dark:border-slate-800">
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
                      className="pl-9 pr-9 w-full sm:w-48"
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
                      aria-label="Buscar compras por nombre de cliente"
                    />
                    {comprasLoading && searchCompras && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" aria-hidden="true" />
                        <span className="sr-only" aria-live="polite">Buscando compras...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => fetchCompras(1, searchCompras)}
                      className="text-white flex-1 sm:flex-initial"
                      size="sm"
                      disabled={comprasLoading}
                    >
                      {comprasLoading ? 'Buscando...' : 'Buscar'}
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
                  <div className="hidden md:block rounded-md border overflow-x-auto">
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
                      <Card key={compra.id} className="dark:bg-slate-900 dark:border-slate-800">
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
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Promociones</h2>
            <p className="text-sm text-muted-foreground">
              Gestiona las promociones y recompensas para tus clientes
            </p>
          </div>

          <PromocionesPanel
            tiendaId={tienda?.id || ''}
            adminToken={token || ''}
            tenantDomain={tienda?.dominio || ''}
          />
        </TabsContent>

        {/* Sellos Tab */}
        <TabsContent value="sellos" className="space-y-6">


          <ProgramasSellosPanel token={token || ''} domain={tienda?.dominio || ''} />
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
          {/* Cifras principales (los cambios se comparan con el periodo anterior, cuando hay datos) */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" role="region" aria-label="Cifras principales">
            {[
              {
                label: 'Clientes',
                value: (data?.total_clientes ?? 0).toLocaleString('es-ES'),
                detail: `${(data?.clientes_activos_ultimos_30_dias ?? 0).toLocaleString('es-ES')} activos en 30 días`,
                change: analytics?.cambio_clientes_pct,
                icon: Users,
                onClick: () => setActiveTab('clientes'),
              },
              {
                label: 'Facturación',
                value: formatCurrency(data?.ventas_totales ?? 0),
                detail: 'Total registrado con Qronnect',
                change: analytics?.cambio_facturacion_pct,
                icon: Euro,
                onClick: () => setActiveTab('ventas'),
              },
              {
                label: 'Ventas',
                value: (data?.total_compras ?? 0).toLocaleString('es-ES'),
                detail: 'Compras con puntos',
                icon: ShoppingCart,
                onClick: () => setActiveTab('ventas'),
              },
              {
                label: 'Ticket medio',
                value: formatCurrency(data?.ticket_medio ?? 0),
                detail: `${(data?.puntos_otorgados_totales ?? 0).toLocaleString('es-ES')} puntos dados`,
                change: analytics?.cambio_ticket_medio_pct,
                icon: TrendingUp,
              },
            ].map(({ label, value, detail, change, icon: Icon, onClick }) => {
              const Tag = onClick ? 'button' : 'div'
              return (
                <Tag
                  key={label}
                  {...(onClick ? { type: 'button' as const, onClick } : {})}
                  className="group rounded-2xl border bg-card p-5 text-left transition-colors hover:border-foreground/20"
                >
                  <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                    <span>{label}</span>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className="mt-3 font-display text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">{value}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    {typeof change === 'number' && Number.isFinite(change) && (
                      <span className={change >= 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-red-600'}>
                        {change >= 0 ? '+' : ''}
                        {change.toLocaleString('es-ES', { maximumFractionDigits: 1 })}%
                      </span>
                    )}
                    <span>{detail}</span>
                  </p>
                </Tag>
              )
            })}
          </div>

          {/* Analista de KPIs con IA */}
          <AnalistaKPIs
            tenantDomain={tienda?.dominio || ''}
            adminToken={token || ''}
            onCreateCampaign={handleCreateCampaignFromIA}
            onCreatePromotion={handleCreatePromotionFromIA}
          />

          {/* Selector de periodo */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold tracking-tight">Evolución</h2>
              <p className="text-sm text-muted-foreground">Clientes, facturación y fidelidad en el periodo elegido.</p>
            </div>
            <Select value={analyticsPeriodo} onValueChange={(value: '7d' | '30d' | '90d') => setAnalyticsPeriodo(value)}>
              <SelectTrigger className="w-full rounded-xl sm:w-[180px]">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Últimos 7 días</SelectItem>
                <SelectItem value="30d">Últimos 30 días</SelectItem>
                <SelectItem value="90d">Últimos 90 días</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
      </Tabs >


    </div >
  )
}
