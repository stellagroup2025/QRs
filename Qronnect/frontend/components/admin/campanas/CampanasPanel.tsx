'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
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
import { Mail, Plus, Eye, Edit, Trash2, Send, Users, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
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
  const [mostrarTodas, setMostrarTodas] = useState(false)

  // Estados para los diálogos de acciones
  const [campanaSeleccionada, setCampanaSeleccionada] = useState<Campana | null>(null)
  const [verDialogOpen, setVerDialogOpen] = useState(false)
  const [borrarDialogOpen, setBorrarDialogOpen] = useState(false)
  const [enviarDialogOpen, setEnviarDialogOpen] = useState(false)

  useEffect(() => {
    cargarCampanas()
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

  function getEstadoIcon(estado: Campana['estado']) {
    switch (estado) {
      case 'borrador': return <Clock className="h-3 w-3" />
      case 'programada': return <Clock className="h-3 w-3" />
      case 'enviando': return <Loader2 className="h-3 w-3 animate-spin" />
      case 'enviada': return <CheckCircle className="h-3 w-3" />
      case 'cancelada': return <XCircle className="h-3 w-3" />
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
      <Badge className={`${estilos[estado]} text-xs px-1.5 py-0 gap-1`}>
        {getEstadoIcon(estado)}
        {textos[estado]}
      </Badge>
    )
  }

  function formatearFecha(fecha: string | null) {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    })
  }

  function handleVer(campana: Campana) {
    setCampanaSeleccionada(campana)
    setVerDialogOpen(true)
  }

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
    } catch (error: any) {
      console.error('Error enviando campaña:', error)
      alert(`Error al enviar la campaña: ${error.message}`)
    }
  }

  // Filtrar campañas
  const campanasActivas = campanas.filter(c => c.estado !== 'enviada' && c.estado !== 'cancelada')
  const campanasVisibles = mostrarTodas ? campanas : campanasActivas

  // Stats
  const totalEnviados = campanas.reduce((sum, c) => sum + c.enviados, 0)
  const totalAbiertos = campanas.reduce((sum, c) => sum + c.abiertos, 0)
  const tasaApertura = totalEnviados > 0 ? ((totalAbiertos / totalEnviados) * 100).toFixed(0) : '0'

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary">{campanasActivas.length} pendientes</Badge>
            <Badge variant="outline">{totalEnviados} enviados</Badge>
            <Badge variant="outline">{tasaApertura}% apertura</Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="mostrar-todas"
              checked={mostrarTodas}
              onCheckedChange={setMostrarTodas}
            />
            <Label htmlFor="mostrar-todas" className="text-sm text-muted-foreground">
              Ver historial
            </Label>
          </div>
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            style={{ backgroundColor: hexToRgb(branding.color_primario) }}
            className="text-white"
          >
            <Plus className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Nueva</span>
          </Button>
        </div>
      </div>

      {/* Lista de campañas */}
      {campanasVisibles.length === 0 ? (
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="py-8 text-center">
            <Mail className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              {mostrarTodas ? 'No hay campañas' : 'No hay campañas pendientes'}
            </p>
            <Button
              size="sm"
              onClick={() => setDialogOpen(true)}
              style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              className="text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Crear Campaña
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {campanasVisibles.map((campana) => {
            const tasaCampana = campana.enviados > 0
              ? ((campana.abiertos / campana.enviados) * 100).toFixed(0)
              : '0'

            return (
              <Card
                key={campana.id}
                className={`overflow-hidden transition-opacity dark:bg-slate-900 dark:border-slate-800 ${campana.estado === 'cancelada' ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-3">
                  {/* Header de la card */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate">{campana.nombre}</h3>
                        {getEstadoBadge(campana.estado)}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {campana.asunto}
                      </p>
                    </div>
                  </div>

                  {/* Info principal */}
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg mb-2">
                    <div className="text-center flex-1">
                      <p className="text-lg font-bold flex items-center justify-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {campana.total_destinatarios}
                      </p>
                      <p className="text-xs text-muted-foreground">destinatarios</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center flex-1">
                      <p className="text-lg font-bold" style={{ color: hexToRgb(branding.color_primario) }}>
                        {campana.enviados}
                      </p>
                      <p className="text-xs text-muted-foreground">enviados</p>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center flex-1">
                      <p className="text-lg font-bold">{tasaCampana}%</p>
                      <p className="text-xs text-muted-foreground">apertura</p>
                    </div>
                  </div>

                  {/* Barra de progreso de apertura */}
                  {campana.enviados > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, parseFloat(tasaCampana))}%`,
                              backgroundColor: hexToRgb(branding.color_acento),
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {campana.abiertos}/{campana.enviados}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer con fecha y acciones */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      {campana.fecha_enviada ? (
                        <span>Enviada {formatearFecha(campana.fecha_enviada)}</span>
                      ) : campana.fecha_programada ? (
                        <span className="text-blue-600">Programada {formatearFecha(campana.fecha_programada)}</span>
                      ) : (
                        <span>Creada {formatearFecha(campana.creado_en)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => handleVer(campana)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {campana.estado === 'borrador' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => {
                              setCampanaParaEditar(campana)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
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
                        size="icon"
                        className="h-9 w-9 text-red-500 hover:text-red-700"
                        onClick={() => {
                          setCampanaSeleccionada(campana)
                          setBorrarDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {campanaSeleccionada?.nombre}
              {campanaSeleccionada && getEstadoBadge(campanaSeleccionada.estado)}
            </DialogTitle>
          </DialogHeader>

          {campanaSeleccionada && (
            <div className="space-y-4">
              {/* Asunto */}
              <div>
                <h4 className="text-sm font-medium mb-1">Asunto</h4>
                <p className="text-sm text-muted-foreground">{campanaSeleccionada.asunto}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-muted rounded-lg text-center">
                  <p className="text-xl font-bold">{campanaSeleccionada.total_destinatarios}</p>
                  <p className="text-xs text-muted-foreground">Destinatarios</p>
                </div>
                <div className="p-2 bg-muted rounded-lg text-center">
                  <p className="text-xl font-bold" style={{ color: hexToRgb(branding.color_primario) }}>
                    {campanaSeleccionada.enviados}
                  </p>
                  <p className="text-xs text-muted-foreground">Enviados</p>
                </div>
                <div className="p-2 bg-muted rounded-lg text-center">
                  <p className="text-xl font-bold">{campanaSeleccionada.abiertos}</p>
                  <p className="text-xs text-muted-foreground">Abiertos</p>
                </div>
              </div>

              {/* Clicks */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Clicks en enlaces:</span>
                <span className="font-medium">{campanaSeleccionada.clicks}</span>
              </div>

              {/* Preview del contenido */}
              <div>
                <h4 className="text-sm font-medium mb-2">Vista previa</h4>
                <div className="border rounded-lg p-3 bg-white max-h-48 overflow-y-auto">
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{
                      __html: campanaSeleccionada.contenido_html || '',
                    }}
                  />
                </div>
              </div>

              {/* Fechas */}
              <div className="space-y-1 pt-2 border-t text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creada:</span>
                  <span>{new Date(campanaSeleccionada.creado_en).toLocaleDateString('es-ES')}</span>
                </div>
                {campanaSeleccionada.fecha_programada && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Programada:</span>
                    <span>{new Date(campanaSeleccionada.fecha_programada).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
                {campanaSeleccionada.fecha_enviada && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Enviada:</span>
                    <span>{new Date(campanaSeleccionada.fecha_enviada).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-2">
                {campanaSeleccionada.estado === 'borrador' && (
                  <Button
                    className="flex-1 text-white"
                    style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                    onClick={() => {
                      setVerDialogOpen(false)
                      setCampanaSeleccionada(campanaSeleccionada)
                      setEnviarDialogOpen(true)
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setVerDialogOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AlertDialog para confirmar borrado */}
      <AlertDialog open={borrarDialogOpen} onOpenChange={setBorrarDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar campaña?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente la campaña
              <strong className="block mt-2">{campanaSeleccionada?.nombre}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBorrar}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
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
              Se enviará a {campanaSeleccionada?.total_destinatarios} destinatarios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            ⚠️ Esta acción no se puede deshacer.
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnviar}
              style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              className="text-white"
            >
              Enviar ahora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
