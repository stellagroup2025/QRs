'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Mail, Plus, Eye, Edit, Trash2, Send, Calendar, Users } from 'lucide-react'
import { hexToRgb } from '@/lib/brand-colors'
import { useBrandingContext } from '@/components/BrandingProvider'
import { CrearCampanaDialog } from './CrearCampanaDialog'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Campana {
  id: string
  nombre: string
  asunto: string
  contenido_html: string
  contenido_texto?: string
  filtros_segmentacion?: any
  estado: 'borrador' | 'programada' | 'enviando' | 'enviada' | 'cancelada'
  fecha_programada: string | null
  fecha_enviada: string | null
  total_destinatarios: number
  enviados: number
  abiertos: number
  clicks: number
  creado_en: string
}

interface CampanasPanelProps {
  adminToken: string
  tenantDomain: string
  onRefreshNeeded?: (refreshFn: () => void) => void
}

export function CampanasPanel({ adminToken, tenantDomain, onRefreshNeeded }: CampanasPanelProps) {
  const { branding } = useBrandingContext()
  const [campanas, setCampanas] = useState<Campana[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [campanaParaEditar, setCampanaParaEditar] = useState<Campana | null>(null)

  // Estados para los diálogos de acciones
  const [campanaSeleccionada, setCampanaSeleccionada] = useState<Campana | null>(null)
  const [verDialogOpen, setVerDialogOpen] = useState(false)
  const [borrarDialogOpen, setBorrarDialogOpen] = useState(false)
  const [enviarDialogOpen, setEnviarDialogOpen] = useState(false)

  useEffect(() => {
    cargarCampanas()
    // Exponer la función de refresh al componente padre
    if (onRefreshNeeded) {
      onRefreshNeeded(cargarCampanas)
    }
  }, [])

  async function cargarCampanas() {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/admin/campanas`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCampanas(data)
      }
    } catch (error) {
      console.error('Error cargando campañas:', error)
    } finally {
      setLoading(false)
    }
  }

  function getEstadoBadge(estado: Campana['estado']) {
    const estilos = {
      borrador: 'bg-gray-100 text-gray-700',
      programada: 'bg-blue-100 text-blue-700',
      enviando: 'bg-yellow-100 text-yellow-700',
      enviada: 'bg-green-100 text-green-700',
      cancelada: 'bg-red-100 text-red-700',
    }

    const textos = {
      borrador: 'Borrador',
      programada: 'Programada',
      enviando: 'Enviando',
      enviada: 'Enviada',
      cancelada: 'Cancelada',
    }

    return (
      <Badge className={estilos[estado]}>
        {textos[estado]}
      </Badge>
    )
  }

  function formatearFecha(fecha: string | null) {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Función para ver el contenido de la campaña
  function handleVer(campana: Campana) {
    setCampanaSeleccionada(campana)
    setVerDialogOpen(true)
  }

  // Función para borrar campaña
  async function handleBorrar() {
    if (!campanaSeleccionada) return

    try {
      const response = await fetch(`${API_URL}/api/admin/campanas/${campanaSeleccionada.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (response.ok) {
        await cargarCampanas()
        setBorrarDialogOpen(false)
        setCampanaSeleccionada(null)
      } else {
        alert('Error al borrar la campaña')
      }
    } catch (error) {
      console.error('Error borrando campaña:', error)
      alert('Error al borrar la campaña')
    }
  }

  // Función para enviar campaña
  async function handleEnviar() {
    if (!campanaSeleccionada) return

    try {
      const response = await fetch(`${API_URL}/api/admin/campanas/${campanaSeleccionada.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: campanaSeleccionada.nombre,
          asunto: campanaSeleccionada.asunto,
          contenido_html: campanaSeleccionada.contenido_html,
          estado: 'enviada',
        }),
      })

      if (response.ok) {
        await cargarCampanas()
        setEnviarDialogOpen(false)
        setCampanaSeleccionada(null)
        alert('Campaña enviada exitosamente')
      } else {
        const errorData = await response.text()
        console.error('Error al enviar campaña:', errorData)
        alert(`Error al enviar la campaña: ${errorData}`)
      }
    } catch (error) {
      console.error('Error enviando campaña:', error)
      alert(`Error al enviar la campaña: ${error.message}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de crear campaña */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campañas de Email</h2>
          <p className="text-muted-foreground">
            Crea y gestiona campañas de email marketing con segmentación avanzada
          </p>
        </div>
        <Button
          style={{ backgroundColor: hexToRgb(branding.color_primario) }}
          className="text-white"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Campaña
        </Button>
      </div>

      {/* Lista de campañas */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Campañas</CardTitle>
          <CardDescription>
            Historial de campañas de email enviadas y programadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : campanas.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No hay campañas</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Crea tu primera campaña para empezar a comunicarte con tus clientes
              </p>
              <Button
                className="mt-4"
                style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear Primera Campaña
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Destinatarios</TableHead>
                  <TableHead>Tasa Apertura</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campanas.map((campana) => {
                  const tasaApertura = campana.enviados > 0
                    ? ((campana.abiertos / campana.enviados) * 100).toFixed(1)
                    : '0'

                  return (
                    <TableRow key={campana.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campana.nombre}</p>
                          <p className="text-sm text-muted-foreground">{campana.asunto}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getEstadoBadge(campana.estado)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{campana.total_destinatarios}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{tasaApertura}%</span>
                          <span className="text-muted-foreground ml-2">
                            ({campana.abiertos}/{campana.enviados})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {campana.fecha_enviada
                          ? formatearFecha(campana.fecha_enviada)
                          : campana.fecha_programada
                          ? formatearFecha(campana.fecha_programada)
                          : formatearFecha(campana.creado_en)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVer(campana)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {campana.estado === 'borrador' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setCampanaParaEditar(campana)
                                  setEditDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                style={{ color: hexToRgb(branding.color_primario) }}
                                onClick={() => {
                                  setCampanaSeleccionada(campana)
                                  setEnviarDialogOpen(true)
                                }}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => {
                              setCampanaSeleccionada(campana)
                              setBorrarDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas generales */}
      {campanas.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Enviados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campanas.reduce((sum, c) => sum + c.enviados, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tasa Apertura Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(() => {
                  const totalEnviados = campanas.reduce((sum, c) => sum + c.enviados, 0)
                  const totalAbiertos = campanas.reduce((sum, c) => sum + c.abiertos, 0)
                  return totalEnviados > 0
                    ? ((totalAbiertos / totalEnviados) * 100).toFixed(1)
                    : '0'
                })()}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Campañas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campanas.filter(c => c.estado === 'programada' || c.estado === 'enviando').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Campañas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campanas.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Diálogo de crear campaña */}
      <CrearCampanaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        adminToken={adminToken}
        tenantDomain={tenantDomain}
        onCampanaCreada={cargarCampanas}
      />

      {/* Diálogo de editar campaña */}
      <CrearCampanaDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        adminToken={adminToken}
        tenantDomain={tenantDomain}
        onCampanaCreada={cargarCampanas}
        campanaInicial={campanaParaEditar}
      />

      {/* Dialog para ver contenido de campaña */}
      <Dialog open={verDialogOpen} onOpenChange={setVerDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{campanaSeleccionada?.nombre}</DialogTitle>
            <DialogDescription>
              Asunto: {campanaSeleccionada?.asunto}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Preview del HTML */}
            <div className="border rounded-lg p-4 bg-white">
              <div
                dangerouslySetInnerHTML={{
                  __html: campanaSeleccionada?.contenido_html || '',
                }}
              />
            </div>

            {/* Información adicional */}
            {campanaSeleccionada?.contenido_texto && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Versión texto plano:</h4>
                <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">
                  {campanaSeleccionada.contenido_texto}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog para confirmar borrado */}
      <AlertDialog open={borrarDialogOpen} onOpenChange={setBorrarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la campaña
              <strong className="block mt-2">{campanaSeleccionada?.nombre}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBorrar}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, borrar campaña
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog para confirmar envío */}
      <AlertDialog open={enviarDialogOpen} onOpenChange={setEnviarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Enviar campaña ahora?</AlertDialogTitle>
            <AlertDialogDescription>
              Se enviará la campaña <strong>{campanaSeleccionada?.nombre}</strong> inmediatamente
              a {campanaSeleccionada?.total_destinatarios} destinatarios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            ⚠️ Esta acción no se puede deshacer. Verifica que el contenido y los
            destinatarios sean correctos antes de continuar.
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnviar}
              style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              className="text-white"
            >
              Sí, enviar ahora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
