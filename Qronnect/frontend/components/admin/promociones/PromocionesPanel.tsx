'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Gift,
  Ticket,
  TrendingUp,
  Eye,
  Search,
  Zap,
  Tag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { PromocionFormDialog } from './PromocionFormDialog'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { toast } from 'sonner'
import { StatsCard } from './StatsCard'
import { IADrawerPromociones } from './IADrawer'
import { ValidarCanjeDialog } from './ValidarCanjeDialog'

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
  const [validarCanjeOpen, setValidarCanjeOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promocion | null>(null)
  const [mostrarInactivas, setMostrarInactivas] = useState(false)
  const [detallePromo, setDetallePromo] = useState<Promocion | null>(null)

  // Search state
  const [searchTerm, setSearchTerm] = useState('')

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

      toast.success('Promoción eliminada')
      fetchPromociones()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar')
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

  // Filtrado
  const filteredPromociones = promociones.filter(p => {
    const matchesSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesActive = mostrarInactivas ? true : p.activo
    return matchesSearch && matchesActive
  })

  const promocionesActivas = promociones.filter(p => p.activo).length
  const totalCanjes = promociones.reduce((sum, p) => sum + p.cantidad_canjeada, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* 1. Header & Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          title="Promociones Activas"
          value={promocionesActivas}
          icon={Tag}
          gradient="from-blue-500/20 to-cyan-500/20"
          description="Visibles en la app"
        />
        <StatsCard
          title="Canjes Totales"
          value={totalCanjes}
          icon={Ticket}
          gradient="from-purple-500/20 to-pink-500/20"
          description="Lifetime value"
        />
      </div>

      {/* 2. Toolbar & Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900/50 p-4 rounded-xl border shadow-sm">

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar promoción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 dark:bg-slate-800 border-none"
            />
          </div>
          <div className="flex items-center space-x-2 pl-2 border-l ml-2">
            <Switch
              id="mostrar-inactivas"
              checked={mostrarInactivas}
              onCheckedChange={setMostrarInactivas}
            />
            <Label htmlFor="mostrar-inactivas" className="text-sm text-muted-foreground cursor-pointer select-none">
              Inactivas
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            variant="outline"
            onClick={() => setValidarCanjeOpen(true)}
            className="hidden sm:flex gap-2"
          >
            <Ticket className="h-4 w-4" />
            Validar
          </Button>

          <IADrawerPromociones
            tenantDomain={tenantDomain}
            adminToken={adminToken}
          />

          <Button
            onClick={() => {
              setEditingPromo(null)
              setDialogOpen(true)
            }}
            className="gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            style={{ backgroundColor: hexToRgb(branding.color_primario) }}
          >
            <Plus className="h-4 w-4" />
            Nueva Promoción
          </Button>
        </div>
      </div>

      {/* 3. Grid of Cards */}
      <AnimatePresence mode="popLayout">
        {filteredPromociones.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-xl bg-slate-50/50 dark:bg-slate-900/50"
          >
            <div className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm mb-4">
              <Gift className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {searchTerm ? 'No se encontraron resultados' : 'No hay promociones creadas'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              {searchTerm ? 'Intenta con otro término de búsqueda.' : 'Crea tu primera promoción para fidelizar a tus clientes y aumentar las ventas.'}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setDialogOpen(true)}
              >
                Crear primera promoción
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPromociones.map((promo, index) => (
              <motion.div
                layout
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className={`h-full group hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 ${!promo.activo ? 'opacity-70 border-l-slate-300' : 'border-l-primary'}`}
                  style={{ borderLeftColor: promo.activo ? hexToRgb(branding.color_primario) : undefined }}
                >
                  <CardContent className="p-0">
                    {/* Ticket Header */}
                    <div className="p-4 pb-3 relative">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={promo.activo ? 'default' : 'secondary'} className={`${promo.activo ? 'bg-green-100 text-green-700 dark:bg-green-900/30 hover:bg-green-200' : ''}`}>
                          {promo.activo ? 'Activa' : 'Inactiva'}
                        </Badge>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingPromo(promo); setDialogOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(promo.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <h3 className="font-bold text-lg leading-tight mb-1 line-clamp-2" title={promo.titulo}>
                        {promo.titulo}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
                        {promo.descripcion}
                      </p>
                    </div>

                    {/* Ticket Divider (Dashed) */}
                    <div className="relative h-px bg-transparent border-t-2 border-dashed border-gray-100 dark:border-gray-800 mx-2">
                      <div className="absolute -left-3 -top-2 w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-950" />
                      <div className="absolute -right-3 -top-2 w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-950" />
                    </div>

                    {/* Ticket Body / Stats */}
                    <div className="p-4 pt-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <span className="block text-2xl font-bold text-primary" style={{ color: hexToRgb(branding.color_primario) }}>
                            {getValorLabel(promo.tipo, promo.valor)}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Beneficio</span>
                        </div>
                        <div className="h-8 w-px bg-border mx-2" />
                        <div className="text-center">
                          <span className="block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-100 dark:to-gray-300">
                            {promo.puntos_requeridos}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Puntos</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {promo.cantidad_disponible && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Canjeados</span>
                            <span>{promo.cantidad_canjeada} / {promo.cantidad_disponible}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-800 transition-all duration-500"
                              style={{
                                width: `${Math.min(100, (promo.cantidad_canjeada / promo.cantidad_disponible) * 100)}%`,
                                backgroundColor: hexToRgb(branding.color_acento)
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {!promo.cantidad_disponible && (
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900 py-1.5 rounded">
                          <TrendingUp className="h-3 w-3" />
                          <span>{promo.cantidad_canjeada} canjes totales</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Modal de detalle (Opcional, o usar el de edición directamente) - I skipped simple detail modal in favor of edit */}

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

      {/* Dialog Validar Canje - Integrated here */}
      <ValidarCanjeDialog
        open={validarCanjeOpen}
        onOpenChange={setValidarCanjeOpen}
        adminToken={adminToken}
        tenantDomain={tenantDomain}
      />
    </div>
  )
}
