'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { SenderIDModal } from '@/components/superadmin/SenderIDModal'
import { getAdminDashboardUrl } from '@/lib/urls'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Store,
  Plus,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Users,
  ShoppingCart,
  Euro,
  Calendar,
  Smartphone,
  MessageSquare,
  Globe2,
  Building2,
  Search
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Tienda {
  id: string
  nombre: string
  dominio: string
  dominio_personalizado?: string
  plan: string
  activo: boolean
  creado_en: string
  total_clientes: number
  total_compras: number
  total_facturado: number
  ultima_compra?: string
  sender_id?: string | null
  sms_modo?: 'global' | 'propio' | null
  sms_activo?: boolean
}

export default function SuperAdminTiendasPage() {
  const router = useRouter()
  const [tiendas, setTiendas] = useState<Tienda[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTienda, setSelectedTienda] = useState<Tienda | null>(null)
  const [searchTiendas, setSearchTiendas] = useState('')

  // Filtrar tiendas por búsqueda
  const filteredTiendas = tiendas.filter((tienda) => {
    if (!searchTiendas.trim()) return true
    const search = searchTiendas.toLowerCase()
    return (
      tienda.nombre.toLowerCase().includes(search) ||
      tienda.dominio.toLowerCase().includes(search) ||
      tienda.plan.toLowerCase().includes(search)
    )
  })

  useEffect(() => {
    const token = localStorage.getItem('superadmin_token')
    if (!token) {
      router.push('/superadmin/login')
      return
    }

    fetchTiendas(token)
  }, [router])

  const fetchTiendas = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/superadmin/tiendas`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      // Check for unauthorized (session expired or invalid token)
      if (response.status === 401) {
        localStorage.removeItem('superadmin_token')
        router.push('/superadmin/login')
        return
      }

      if (!response.ok) throw new Error('Error al cargar tiendas')

      const data = await response.json()
      setTiendas(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Seguro que quieres eliminar la tienda "${nombre}"?`)) return

    const token = localStorage.getItem('superadmin_token')
    try {
      const response = await fetch(`${API_URL}/api/superadmin/tiendas/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      // Check for unauthorized (session expired or invalid token)
      if (response.status === 401) {
        localStorage.removeItem('superadmin_token')
        router.push('/superadmin/login')
        return
      }

      if (!response.ok) throw new Error('Error al eliminar')

      // Recargar lista
      fetchTiendas(token!)
      alert('Tienda eliminada correctamente')
    } catch (error) {
      alert('Error al eliminar tienda')
    }
  }

  const handleOpenSenderIDModal = (tienda: Tienda) => {
    setSelectedTienda(tienda)
    setModalOpen(true)
  }

  const handleSenderIDSuccess = () => {
    const token = localStorage.getItem('superadmin_token')
    if (token) {
      fetchTiendas(token)
    }
  }

  const handleViewTienda = async (tienda: Tienda) => {
    const token = localStorage.getItem('superadmin_token')
    if (!token) {
      alert('Sesión expirada, por favor inicia sesión nuevamente')
      router.push('/superadmin/login')
      return
    }

    try {
      // Llamar al endpoint para generar el token de admin
      const response = await fetch(`${API_URL}/api/superadmin/tiendas/${tienda.id}/generar-token-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        localStorage.removeItem('superadmin_token')
        alert('Sesión expirada, por favor inicia sesión nuevamente')
        router.push('/superadmin/login')
        return
      }

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al generar token de acceso')
      }

      const data = await response.json()

      // Construir la URL del tenant con el token como parámetro
      // El panel de admin detectará este parámetro y lo usará para autenticar
      const tenantUrl = getAdminDashboardUrl(data.tienda.dominio, data.access_token)

      // Abrir en nueva pestaña
      window.open(tenantUrl, '_blank')

    } catch (error: any) {
      console.error('Error al acceder a la tienda:', error)
      alert(error.message || 'Error al acceder a la tienda')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                onClick={() => router.push('/superadmin/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold truncate">Tiendas</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {tiendas.length} registradas
                </p>
              </div>
            </div>
            <Button size="sm" className="flex-shrink-0" onClick={() => router.push('/superadmin/tiendas/nueva')}>
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nueva Tienda</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Todas las Tiendas</CardTitle>
                <CardDescription>
                  {searchTiendas ? `${filteredTiendas.length} de ${tiendas.length}` : tiendas.length} comercios
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar tienda..."
                  className="pl-9"
                  value={searchTiendas}
                  onChange={(e) => setSearchTiendas(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTiendas.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                {searchTiendas ? (
                  <>
                    <h3 className="text-lg font-semibold mb-2">Sin resultados</h3>
                    <p className="text-muted-foreground mb-4">
                      No se encontraron tiendas con "{searchTiendas}"
                    </p>
                    <Button variant="outline" onClick={() => setSearchTiendas('')}>
                      Limpiar búsqueda
                    </Button>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-2">No hay tiendas</h3>
                    <p className="text-muted-foreground mb-4">
                      Crea tu primera tienda para empezar
                    </p>
                    <Button onClick={() => router.push('/superadmin/tiendas/nueva')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Tienda
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Vista Móvil - Cards */}
                <div className="lg:hidden space-y-4">
                  {filteredTiendas.map((tienda) => (
                    <Card key={tienda.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        {/* Header de la card */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-base truncate">{tienda.nombre}</h3>
                              <Badge variant={tienda.activo ? 'default' : 'destructive'} className="flex-shrink-0">
                                {tienda.activo ? 'Activa' : 'Inactiva'}
                              </Badge>
                            </div>
                            <p className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">
                              {tienda.dominio}.qronnect.com
                            </p>
                          </div>
                          <Badge
                            variant={
                              tienda.plan === 'enterprise'
                                ? 'default'
                                : tienda.plan === 'profesional'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="flex-shrink-0 ml-2"
                          >
                            {tienda.plan}
                          </Badge>
                        </div>

                        {/* Métricas */}
                        <div className="grid grid-cols-3 gap-3 py-3 border-y">
                          <div className="text-center">
                            <div className="flex items-center justify-center text-muted-foreground mb-1">
                              <Users className="h-4 w-4" />
                            </div>
                            <p className="font-semibold">{tienda.total_clientes}</p>
                            <p className="text-xs text-muted-foreground">Clientes</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center text-muted-foreground mb-1">
                              <ShoppingCart className="h-4 w-4" />
                            </div>
                            <p className="font-semibold">{tienda.total_compras}</p>
                            <p className="text-xs text-muted-foreground">Compras</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center text-muted-foreground mb-1">
                              <Euro className="h-4 w-4" />
                            </div>
                            <p className="font-semibold">{tienda.total_facturado.toLocaleString('es-ES', { minimumFractionDigits: 0 })}</p>
                            <p className="text-xs text-muted-foreground">Facturado</p>
                          </div>
                        </div>

                        {/* Info SMS y fecha */}
                        <div className="flex items-center justify-between py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {tienda.sms_activo ? (
                              <Badge
                                variant={tienda.sms_modo === 'global' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {tienda.sms_modo === 'global' ? (
                                  <><Globe2 className="h-3 w-3 mr-1" />Global</>
                                ) : (
                                  <><Building2 className="h-3 w-3 mr-1" />Propio</>
                                )}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                <MessageSquare className="h-3 w-3 inline opacity-50" /> SMS Inactivo
                              </span>
                            )}
                            {tienda.sender_id && (
                              <span className="font-mono text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                                {tienda.sender_id}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(tienda.creado_en).toLocaleDateString('es-ES')}
                          </span>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center justify-between pt-3 border-t gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleOpenSenderIDModal(tienda)}
                          >
                            <Smartphone className="h-4 w-4 mr-1" />
                            SMS
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewTienda(tienda)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/superadmin/tiendas/${tienda.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tienda.id, tienda.nombre)}
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Vista Desktop - Tabla */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tienda</TableHead>
                        <TableHead>Dominio</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead className="text-center">Modo SMS</TableHead>
                        <TableHead className="text-center">Sender ID</TableHead>
                        <TableHead className="text-center">Clientes</TableHead>
                        <TableHead className="text-center">Compras</TableHead>
                        <TableHead className="text-right">Facturado</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTiendas.map((tienda) => (
                        <TableRow key={tienda.id}>
                          <TableCell>
                            <div>
                              <p className="font-semibold">{tienda.nombre}</p>
                              <p className="text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {new Date(tienda.creado_en).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                {tienda.dominio}.qronnect.com
                              </p>
                              {tienda.dominio_personalizado && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {tienda.dominio_personalizado}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                tienda.plan === 'enterprise'
                                  ? 'default'
                                  : tienda.plan === 'profesional'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {tienda.plan}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {tienda.sms_activo ? (
                              <div className="flex flex-col items-center gap-1">
                                <Badge
                                  variant={tienda.sms_modo === 'global' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {tienda.sms_modo === 'global' ? (
                                    <>
                                      <Globe2 className="h-3 w-3 mr-1" />
                                      Global
                                    </>
                                  ) : (
                                    <>
                                      <Building2 className="h-3 w-3 mr-1" />
                                      Propio
                                    </>
                                  )}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                <MessageSquare className="h-3 w-3 inline opacity-50" /> Inactivo
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              onClick={() => handleOpenSenderIDModal(tienda)}
                              className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-2 py-1 transition-colors"
                            >
                              {tienda.sender_id ? (
                                <div className="flex items-center justify-center space-x-1">
                                  <Smartphone className="h-4 w-4 text-green-600" />
                                  <span className="font-mono text-sm font-semibold">{tienda.sender_id}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground hover:text-blue-600 hover:underline">
                                  Configurar
                                </span>
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{tienda.total_clientes}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                              <span>{tienda.total_compras}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <Euro className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">
                                {tienda.total_facturado.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={tienda.activo ? 'default' : 'destructive'}>
                              {tienda.activo ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewTienda(tienda)}
                                title="Ver panel de admin de la tienda"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/superadmin/tiendas/${tienda.id}`)}
                                title="Ver y editar tienda"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(tienda.id, tienda.nombre)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Sender ID Modal */}
      {selectedTienda && (
        <SenderIDModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          tiendaId={selectedTienda.id}
          tiendaNombre={selectedTienda.nombre}
          currentSenderId={selectedTienda.sender_id}
          onSuccess={handleSenderIDSuccess}
        />
      )}
    </div>
  )
}
