'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Calendar, Gift, TrendingUp } from 'lucide-react'
import { PromocionFormDialog } from './PromocionFormDialog'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'

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
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promocion | null>(null)

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
    if (!confirm('¿Estás seguro de eliminar esta promoción?')) return

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
        alert(error.message || 'Error al eliminar promoción')
        return
      }

      alert('Promoción eliminada exitosamente')
      fetchPromociones()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar promoción')
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'descuento_fijo': return 'Descuento Fijo'
      case 'descuento_porcentaje': return 'Descuento %'
      case 'producto_gratis': return 'Producto Gratis'
      default: return tipo
    }
  }

  const getValorLabel = (tipo: string, valor: number) => {
    switch (tipo) {
      case 'descuento_fijo': return `€${valor.toFixed(2)}`
      case 'descuento_porcentaje': return `${valor}%`
      case 'producto_gratis': return 'Gratis'
      default: return valor.toString()
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Promociones</h2>
          <p className="text-muted-foreground">Gestiona las promociones disponibles para canjear</p>
        </div>
        <Button
          onClick={() => {
            setEditingPromo(null)
            setDialogOpen(true)
          }}
          style={{ backgroundColor: hexToRgb(branding.color_primario) }}
          className="text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Promoción
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promociones Activas</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promociones.filter(p => p.activo).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Canjes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promociones.reduce((sum, p) => sum + p.cantidad_canjeada, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas a Vencer</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promociones.filter(p => {
                if (!p.fecha_fin) return false
                const diff = new Date(p.fecha_fin).getTime() - new Date().getTime()
                return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000 // 7 días
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promociones Grid */}
      {promociones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No hay promociones creadas</p>
            <p className="text-muted-foreground mb-4">
              Crea tu primera promoción para que los clientes puedan canjear sus puntos
            </p>
            <Button
              onClick={() => {
                setEditingPromo(null)
                setDialogOpen(true)
              }}
              style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              className="text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Promoción
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {promociones.map((promo) => (
            <Card key={promo.id} className={!promo.activo ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{promo.titulo}</CardTitle>
                    <CardDescription className="mt-1">
                      {promo.descripcion || 'Sin descripción'}
                    </CardDescription>
                  </div>
                  <Badge variant={promo.activo ? 'default' : 'secondary'}>
                    {promo.activo ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Valor de la promoción */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Beneficio</p>
                    <p className="text-2xl font-bold" style={{ color: hexToRgb(branding.color_primario) }}>
                      {getValorLabel(promo.tipo, promo.valor)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Puntos</p>
                    <p className="text-2xl font-bold">{promo.puntos_requeridos}</p>
                  </div>
                </div>

                {/* Tipo */}
                <div>
                  <Badge variant="outline">{getTipoLabel(promo.tipo)}</Badge>
                </div>

                {/* Cantidad */}
                {promo.cantidad_disponible !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Canjes disponibles</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (promo.cantidad_canjeada / promo.cantidad_disponible) * 100)}%`,
                            backgroundColor: hexToRgb(branding.color_acento),
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {promo.cantidad_canjeada}/{promo.cantidad_disponible}
                      </span>
                    </div>
                  </div>
                )}

                {/* Fechas */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Inicio: {new Date(promo.fecha_inicio).toLocaleDateString('es-ES')}</p>
                  {promo.fecha_fin && (
                    <p>Fin: {new Date(promo.fecha_fin).toLocaleDateString('es-ES')}</p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingPromo(promo)
                      setDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(promo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
