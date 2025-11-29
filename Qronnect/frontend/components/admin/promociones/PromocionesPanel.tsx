'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Calendar, Gift, TrendingUp, Eye, ChevronRight } from 'lucide-react'
import { PromocionFormDialog } from './PromocionFormDialog'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { toast } from 'sonner'

interface Promocion {
  id: string
  titulo: string
  descripcion: string
  tipo: 'descuento_fijo' | 'descuento_porcentaje' | 'producto_gratis'
  valor: number
  puntos_requeridos: number
  imagen_url?: string
  activo: boolean
  fecha_inicio: string
  fecha_fin?: string
  cantidad_disponible?: number
  cantidad_canjeada: number
  disponible: boolean
  creado_en: string
  actualizado_en: string
}

interface PromocionesPanelProps {
  tiendaId: string
  adminToken: string
  tenantDomain: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function PromocionesPanel({ tiendaId, adminToken, tenantDomain }: PromocionesPanelProps) {
  const { branding } = useBrandingContext()
  const { confirm } = useConfirmDialog()
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promocion | null>(null)
  const [mostrarInactivas, setMostrarInactivas] = useState(false)
  const [detallePromo, setDetallePromo] = useState<Promocion | null>(null)

  const fetchPromociones = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/admin/promociones?page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (!response.ok) throw new Error('Error al cargar promociones')

      const data = await response.json()
      setPromociones(data.data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPromociones()
  }, [adminToken, tenantDomain])

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: '¿Eliminar promoción?',
      description: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      variant: 'destructive',
    })
    if (!confirmed) return

    try {
      const response = await fetch(`${API_URL}/api/admin/promociones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error('Error al eliminar', {
          description: error.message || 'No se pudo eliminar la promoción'
        })
        return
      }

      toast.success('Promoción eliminada', {
        description: 'La promoción ha sido eliminada exitosamente'
      })
      fetchPromociones()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar', {
        description: 'Ocurrió un error al eliminar la promoción'
      })
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'descuento_fijo': return 'Fijo'
      case 'descuento_porcentaje': return '%'
      case 'producto_gratis': return 'Gratis'
      default: return tipo
    }
  }

  const getValorLabel = (tipo: string, valor: number) => {
    switch (tipo) {
      case 'descuento_fijo': return `€${valor.toFixed(0)}`
      case 'descuento_porcentaje': return `${valor}%`
      case 'producto_gratis': return 'Gratis'
      default: return valor.toString()
    }
  }

  // Filtrar promociones según el estado del switch
  const promocionesVisibles = mostrarInactivas
    ? promociones
    : promociones.filter(p => p.activo)

  const promocionesActivas = promociones.filter(p => p.activo).length
  const totalCanjes = promociones.reduce((sum, p) => sum + p.cantidad_canjeada, 0)

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
            <Badge variant="secondary">{promocionesActivas} activas</Badge>
            <Badge variant="outline">{totalCanjes} canjes</Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="mostrar-inactivas"
              checked={mostrarInactivas}
              onCheckedChange={setMostrarInactivas}
            />
            <Label htmlFor="mostrar-inactivas" className="text-sm text-muted-foreground">
              Ver inactivas
            </Label>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setEditingPromo(null)
              setDialogOpen(true)
            }}
            style={{ backgroundColor: hexToRgb(branding.color_primario) }}
            className="text-white"
          >
            <Plus className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Nueva</span>
          </Button>
        </div>
      </div>

      {/* Lista de promociones */}
      {promocionesVisibles.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Gift className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              {mostrarInactivas ? 'No hay promociones' : 'No hay promociones activas'}
            </p>
            <Button
              size="sm"
              onClick={() => {
                setEditingPromo(null)
                setDialogOpen(true)
              }}
              style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              className="text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Crear Promoción
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {promocionesVisibles.map((promo) => (
            <Card
              key={promo.id}
              className={`overflow-hidden transition-opacity ${!promo.activo ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-3">
                {/* Header de la card */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{promo.titulo}</h3>
                      <Badge
                        variant={promo.activo ? 'default' : 'secondary'}
                        className="text-xs px-1.5 py-0"
                      >
                        {promo.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </div>
                    {promo.descripcion && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {promo.descripcion}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info principal */}
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg mb-2">
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold" style={{ color: hexToRgb(branding.color_primario) }}>
                      {getValorLabel(promo.tipo, promo.valor)}
                    </p>
                    <p className="text-xs text-muted-foreground">{getTipoLabel(promo.tipo)}</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold">{promo.puntos_requeridos}</p>
                    <p className="text-xs text-muted-foreground">puntos</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center flex-1">
                    <p className="text-lg font-bold">{promo.cantidad_canjeada}</p>
                    <p className="text-xs text-muted-foreground">canjes</p>
                  </div>
                </div>

                {/* Barra de progreso si hay límite */}
                {promo.cantidad_disponible !== null && promo.cantidad_disponible !== undefined && (
                  <div className="mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (promo.cantidad_canjeada / promo.cantidad_disponible) * 100)}%`,
                            backgroundColor: hexToRgb(branding.color_acento),
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {promo.cantidad_canjeada}/{promo.cantidad_disponible}
                      </span>
                    </div>
                  </div>
                )}

                {/* Footer con fechas y acciones */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    {promo.fecha_fin ? (
                      <span>Hasta {new Date(promo.fecha_fin).toLocaleDateString('es-ES')}</span>
                    ) : (
                      <span>Sin fecha límite</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 sm:h-9 sm:w-9"
                      aria-label="Ver detalle"
                      onClick={() => setDetallePromo(promo)}
                    >
                      <Eye className="h-5 w-5 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 sm:h-9 sm:w-9"
                      aria-label="Editar promoción"
                      onClick={() => {
                        setEditingPromo(promo)
                        setDialogOpen(true)
                      }}
                    >
                      <Edit className="h-5 w-5 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 sm:h-9 sm:w-9 text-red-500 hover:text-red-700"
                      aria-label="Eliminar promoción"
                      onClick={() => handleDelete(promo.id)}
                    >
                      <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalle */}
      <Dialog open={!!detallePromo} onOpenChange={() => setDetallePromo(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detallePromo?.titulo}
              <Badge variant={detallePromo?.activo ? 'default' : 'secondary'}>
                {detallePromo?.activo ? 'Activa' : 'Inactiva'}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {detallePromo && (
            <div className="space-y-4">
              {/* Descripción completa */}
              {detallePromo.descripcion && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Descripción</h4>
                  <p className="text-sm text-muted-foreground">{detallePromo.descripcion}</p>
                </div>
              )}

              {/* Detalles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold" style={{ color: hexToRgb(branding.color_primario) }}>
                    {getValorLabel(detallePromo.tipo, detallePromo.valor)}
                  </p>
                  <p className="text-xs text-muted-foreground">Beneficio</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{detallePromo.puntos_requeridos}</p>
                  <p className="text-xs text-muted-foreground">Puntos requeridos</p>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total canjeados:</span>
                  <span className="font-medium">{detallePromo.cantidad_canjeada}</span>
                </div>
                {detallePromo.cantidad_disponible && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Disponibles:</span>
                    <span className="font-medium">
                      {detallePromo.cantidad_disponible - detallePromo.cantidad_canjeada} de {detallePromo.cantidad_disponible}
                    </span>
                  </div>
                )}
              </div>

              {/* Fechas */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fecha inicio:</span>
                  <span>{new Date(detallePromo.fecha_inicio).toLocaleDateString('es-ES')}</span>
                </div>
                {detallePromo.fecha_fin && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fecha fin:</span>
                    <span>{new Date(detallePromo.fecha_fin).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDetallePromo(null)
                    setEditingPromo(detallePromo)
                    setDialogOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDetallePromo(null)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para crear/editar */}
      <PromocionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        promocion={editingPromo}
        adminToken={adminToken}
        tenantDomain={tenantDomain}
        onSuccess={() => {
          setDialogOpen(false)
          setEditingPromo(null)
          fetchPromociones()
        }}
      />
    </div>
  )
}
