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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  MessageSquare,
  Plus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Eye,
  Trash2,
  Smartphone,
  Loader2,
} from 'lucide-react'
import { CrearCampanaSMSModal } from './CrearCampanaSMSModal'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface CampanaSMS {
  id: string
  nombre: string
  mensaje: string
  tipo: 'marketing' | 'informativa' | 'transaccional'
  estado: 'borrador' | 'programada' | 'enviada' | 'cancelada'
  fecha_programada?: string
  fecha_envio?: string
  total_destinatarios: number
  enviados?: number
  entregados?: number
  fallidos?: number
  creado_en: string
}

interface CampanasSMSPanelProps {
  adminToken: string
  tenantDomain: string
}

export function CampanasSMSPanel({ adminToken, tenantDomain }: CampanasSMSPanelProps) {
  const { branding } = useBrandingContext()
  const { confirm } = useConfirmDialog()
  const [campanas, setCampanas] = useState<CampanaSMS[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [mostrarTodas, setMostrarTodas] = useState(false)
  const [detalleCampana, setDetalleCampana] = useState<CampanaSMS | null>(null)

  useEffect(() => {
    cargarCampanas()
  }, [adminToken, tenantDomain])

  const cargarCampanas = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/api/campanas-sms`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (!res.ok) {
        throw new Error('Error al cargar campañas SMS')
      }

      const data = await res.json()
      setCampanas(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const eliminarCampana = async (id: string) => {
    const confirmed = await confirm({
      title: '¿Eliminar campaña SMS?',
      description: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'destructive',
    })
    if (!confirmed) return

    try {
      const res = await fetch(`${API_URL}/api/campanas-sms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (!res.ok) throw new Error('Error al eliminar campaña')

      await cargarCampanas()
    } catch (err: any) {
      alert(err.message)
    }
  }

  function getEstadoIcon(estado: string) {
    switch (estado) {
      case 'borrador': return <Clock className="h-3 w-3" />
      case 'programada': return <Clock className="h-3 w-3" />
      case 'enviando': return <Loader2 className="h-3 w-3 animate-spin" />
      case 'enviada': return <CheckCircle className="h-3 w-3" />
      case 'cancelada': return <XCircle className="h-3 w-3" />
      default: return null
    }
  }

  const getEstadoBadge = (estado: string) => {
    const estilos: Record<string, string> = {
      borrador: 'bg-gray-100 text-gray-700',
      programada: 'bg-blue-100 text-blue-700',
      enviada: 'bg-green-100 text-green-700',
      cancelada: 'bg-red-100 text-red-700',
    }
    const textos: Record<string, string> = {
      borrador: 'Borrador',
      programada: 'Programada',
      enviada: 'Enviada',
      cancelada: 'Cancelada',
    }
    return (
      <Badge className={`${estilos[estado] || ''} text-xs px-1.5 py-0 gap-1`}>
        {getEstadoIcon(estado)}
        {textos[estado] || estado}
      </Badge>
    )
  }

  const getTipoBadge = (tipo: string) => {
    const estilos: Record<string, string> = {
      marketing: 'bg-purple-100 text-purple-700',
      informativa: 'bg-blue-100 text-blue-700',
      transaccional: 'bg-gray-100 text-gray-700',
    }
    return (
      <Badge className={`${estilos[tipo] || ''} text-xs px-1.5 py-0`}>
        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </Badge>
    )
  }

  function formatearFecha(fecha: string | undefined) {
    if (!fecha) return '-'
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    })
  }

  // Filtrar campañas
  const campanasActivas = campanas.filter(c => c.estado !== 'enviada' && c.estado !== 'cancelada')
  const campanasVisibles = mostrarTodas ? campanas : campanasActivas

  // Stats
  const totalEnviados = campanas.reduce((acc, c) => acc + (c.enviados || 0), 0)
  const totalEntregados = campanas.reduce((acc, c) => acc + (c.entregados || 0), 0)
  const tasaEntrega = totalEnviados > 0 ? ((totalEntregados / totalEnviados) * 100).toFixed(0) : '0'

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
    <>
      <div className="space-y-4">
        {/* Header compacto */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <Badge variant="secondary">{campanasActivas.length} pendientes</Badge>
              <Badge variant="outline">{totalEnviados} SMS enviados</Badge>
              <Badge variant="outline">{tasaEntrega}% entrega</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="mostrar-todas-sms"
                checked={mostrarTodas}
                onCheckedChange={setMostrarTodas}
              />
              <Label htmlFor="mostrar-todas-sms" className="text-sm text-muted-foreground">
                Ver historial
              </Label>
            </div>
            <Button
              size="sm"
              onClick={() => setModalOpen(true)}
              style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              className="text-white"
            >
              <Plus className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Nueva</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Lista de campañas */}
        {campanasVisibles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Smartphone className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                {mostrarTodas ? 'No hay campañas SMS' : 'No hay campañas SMS pendientes'}
              </p>
              <Button
                size="sm"
                onClick={() => setModalOpen(true)}
                style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                className="text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Crear Campaña SMS
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {campanasVisibles.map((campana) => {
              const tasaCampana = campana.enviados && campana.enviados > 0
                ? ((campana.entregados || 0) / campana.enviados * 100).toFixed(0)
                : '0'

              return (
                <Card
                  key={campana.id}
                  className={`overflow-hidden transition-opacity ${campana.estado === 'cancelada' ? 'opacity-60' : ''}`}
                >
                  <CardContent className="p-3">
                    {/* Header de la card */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm truncate">{campana.nombre}</h3>
                          {getEstadoBadge(campana.estado)}
                          {getTipoBadge(campana.tipo)}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {campana.mensaje.length > 50
                            ? campana.mensaje.substring(0, 50) + '...'
                            : campana.mensaje}
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
                          {campana.enviados || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">enviados</p>
                      </div>
                      <div className="w-px h-8 bg-border" />
                      <div className="text-center flex-1">
                        <p className="text-lg font-bold text-green-600">{campana.entregados || 0}</p>
                        <p className="text-xs text-muted-foreground">entregados</p>
                      </div>
                    </div>

                    {/* Barra de progreso de entrega */}
                    {campana.enviados && campana.enviados > 0 && (
                      <div className="mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full transition-all bg-green-500"
                              style={{
                                width: `${Math.min(100, parseFloat(tasaCampana))}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {campana.entregados || 0}/{campana.enviados}
                          </span>
                        </div>
                        {campana.fallidos && campana.fallidos > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                            <XCircle className="h-3 w-3" />
                            {campana.fallidos} fallidos
                          </div>
                        )}
                      </div>
                    )}

                    {/* Footer con fecha y acciones */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        {campana.fecha_envio ? (
                          <span>Enviada {formatearFecha(campana.fecha_envio)}</span>
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
                          onClick={() => setDetalleCampana(campana)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {campana.estado === 'borrador' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-red-500 hover:text-red-700"
                            onClick={() => eliminarCampana(campana.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      <Dialog open={!!detalleCampana} onOpenChange={() => setDetalleCampana(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {detalleCampana?.nombre}
              {detalleCampana && getEstadoBadge(detalleCampana.estado)}
              {detalleCampana && getTipoBadge(detalleCampana.tipo)}
            </DialogTitle>
          </DialogHeader>

          {detalleCampana && (
            <div className="space-y-4">
              {/* Mensaje completo */}
              <div>
                <h4 className="text-sm font-medium mb-1">Mensaje</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {detalleCampana.mensaje}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {detalleCampana.mensaje.length} caracteres
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-muted rounded-lg text-center">
                  <p className="text-xl font-bold">{detalleCampana.total_destinatarios}</p>
                  <p className="text-xs text-muted-foreground">Destinatarios</p>
                </div>
                <div className="p-2 bg-muted rounded-lg text-center">
                  <p className="text-xl font-bold" style={{ color: hexToRgb(branding.color_primario) }}>
                    {detalleCampana.enviados || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Enviados</p>
                </div>
                <div className="p-2 bg-muted rounded-lg text-center">
                  <p className="text-xl font-bold text-green-600">{detalleCampana.entregados || 0}</p>
                  <p className="text-xs text-muted-foreground">Entregados</p>
                </div>
              </div>

              {/* Fallidos */}
              {detalleCampana.fallidos && detalleCampana.fallidos > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fallidos:</span>
                  <span className="font-medium text-red-500">{detalleCampana.fallidos}</span>
                </div>
              )}

              {/* Fechas */}
              <div className="space-y-1 pt-2 border-t text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creada:</span>
                  <span>{new Date(detalleCampana.creado_en).toLocaleDateString('es-ES')}</span>
                </div>
                {detalleCampana.fecha_programada && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Programada:</span>
                    <span>{new Date(detalleCampana.fecha_programada).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
                {detalleCampana.fecha_envio && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Enviada:</span>
                    <span>{new Date(detalleCampana.fecha_envio).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDetalleCampana(null)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para crear campaña */}
      <CrearCampanaSMSModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        adminToken={adminToken}
        tenantDomain={tenantDomain}
        onSuccess={cargarCampanas}
      />
    </>
  )
}
