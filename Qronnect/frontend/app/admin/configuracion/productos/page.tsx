'use client'

import { useState, useEffect } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Coffee,
  Percent,
  Scissors,
  Coins,
  Gift,
  Loader2,
  Search,
  MoreVertical,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

interface Producto {
  id: string
  nombre: string
  descripcion?: string
  tipo: 'producto' | 'servicio' | 'descuento' | 'puntos'
  detalles: any
  icono?: string
  imagen_url?: string
  instrucciones_canje?: string
  dias_validez?: number
  requiere_validacion_staff: boolean
  activo: boolean
  creado_en: string
}

const tiposProducto = [
  { value: 'producto', label: 'Producto', icon: Coffee, descripcion: 'Producto fisico (cafe, comida, articulo)' },
  { value: 'servicio', label: 'Servicio', icon: Scissors, descripcion: 'Servicio gratuito (masaje, corte de pelo)' },
  { value: 'descuento', label: 'Descuento', icon: Percent, descripcion: 'Descuento porcentual o fijo' },
  { value: 'puntos', label: 'Puntos Extra', icon: Coins, descripcion: 'Puntos adicionales de fidelizacion' },
]

const iconosDisponibles = [
  { value: 'coffee', label: 'Cafe', emoji: '☕' },
  { value: 'pizza', label: 'Pizza', emoji: '🍕' },
  { value: 'cake', label: 'Pastel', emoji: '🎂' },
  { value: 'gift', label: 'Regalo', emoji: '🎁' },
  { value: 'star', label: 'Estrella', emoji: '⭐' },
  { value: 'heart', label: 'Corazon', emoji: '❤️' },
  { value: 'sparkles', label: 'Brillo', emoji: '✨' },
  { value: 'crown', label: 'Corona', emoji: '👑' },
  { value: 'scissors', label: 'Tijeras', emoji: '✂️' },
  { value: 'spa', label: 'Spa', emoji: '💆' },
  { value: 'ticket', label: 'Ticket', emoji: '🎫' },
  { value: 'percent', label: 'Descuento', emoji: '💯' },
]

export default function ProductosPage() {
  const { toast } = useToast()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productoActual, setProductoActual] = useState<Producto | null>(null)
  const [saving, setSaving] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'producto' as 'producto' | 'servicio' | 'descuento' | 'puntos',
    icono: 'gift',
    instrucciones_canje: '',
    dias_validez: 30,
    requiere_validacion_staff: true,
    activo: true,
    // Detalles segun tipo
    producto_nombre: '',
    producto_cantidad: 1,
    producto_valor: '',
    servicio_nombre: '',
    servicio_duracion: 30,
    descuento_porcentaje: 10,
    descuento_monto_fijo: '',
    descuento_min_compra: '',
    puntos_cantidad: 100,
  })

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    setLoading(true)
    try {
      const domain = window.location.hostname.split('.')[0]
      const token = localStorage.getItem(`admin_token_${domain}`) || localStorage.getItem('admin_token')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/api/regalos/catalogo?soloActivos=false`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProductos(data || [])
      }
    } catch (error) {
      console.error('Error cargando productos:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const abrirDialogNuevo = () => {
    setProductoActual(null)
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: 'producto',
      icono: 'gift',
      instrucciones_canje: 'Presenta este cupon en caja para canjearlo',
      dias_validez: 30,
      requiere_validacion_staff: true,
      activo: true,
      producto_nombre: '',
      producto_cantidad: 1,
      producto_valor: '',
      servicio_nombre: '',
      servicio_duracion: 30,
      descuento_porcentaje: 10,
      descuento_monto_fijo: '',
      descuento_min_compra: '',
      puntos_cantidad: 100,
    })
    setDialogOpen(true)
  }

  const abrirDialogEditar = (producto: Producto) => {
    setProductoActual(producto)
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      tipo: producto.tipo,
      icono: producto.icono || 'gift',
      instrucciones_canje: producto.instrucciones_canje || '',
      dias_validez: producto.dias_validez || 30,
      requiere_validacion_staff: producto.requiere_validacion_staff,
      activo: producto.activo,
      producto_nombre: producto.detalles?.producto || '',
      producto_cantidad: producto.detalles?.cantidad || 1,
      producto_valor: producto.detalles?.valor_aprox || '',
      servicio_nombre: producto.detalles?.servicio || '',
      servicio_duracion: producto.detalles?.duracion_min || 30,
      descuento_porcentaje: producto.detalles?.porcentaje || 10,
      descuento_monto_fijo: producto.detalles?.monto_fijo || '',
      descuento_min_compra: producto.detalles?.min_compra || '',
      puntos_cantidad: producto.detalles?.puntos || 100,
    })
    setDialogOpen(true)
  }

  const guardarProducto = async () => {
    if (!formData.nombre.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre es obligatorio',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const domain = window.location.hostname.split('.')[0]
      const token = localStorage.getItem(`admin_token_${domain}`) || localStorage.getItem('admin_token')

      // Construir detalles segun tipo
      let detalles: any = {}
      switch (formData.tipo) {
        case 'producto':
          detalles = {
            producto: formData.producto_nombre || formData.nombre,
            cantidad: formData.producto_cantidad,
            valor_aprox: formData.producto_valor,
          }
          break
        case 'servicio':
          detalles = {
            servicio: formData.servicio_nombre || formData.nombre,
            duracion_min: formData.servicio_duracion,
          }
          break
        case 'descuento':
          detalles = {
            porcentaje: formData.descuento_porcentaje,
            monto_fijo: formData.descuento_monto_fijo || null,
            min_compra: formData.descuento_min_compra || null,
          }
          break
        case 'puntos':
          detalles = {
            puntos: formData.puntos_cantidad,
          }
          break
      }

      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        tipo: formData.tipo,
        detalles,
        icono: formData.icono,
        instrucciones_canje: formData.instrucciones_canje,
        dias_validez: formData.dias_validez,
        requiere_validacion_staff: formData.requiere_validacion_staff,
        activo: formData.activo,
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const url = productoActual
        ? `${API_URL}/api/regalos/catalogo/${productoActual.id}`
        : `${API_URL}/api/regalos/catalogo`

      const response = await fetch(url, {
        method: productoActual ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: productoActual ? 'Producto actualizado' : 'Producto creado',
          description: `${formData.nombre} se ha guardado correctamente`,
        })
        setDialogOpen(false)
        cargarProductos()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Error al guardar')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el producto',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const eliminarProducto = async () => {
    if (!productoActual) return

    setSaving(true)
    try {
      const domain = window.location.hostname.split('.')[0]
      const token = localStorage.getItem(`admin_token_${domain}`) || localStorage.getItem('admin_token')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/api/regalos/catalogo/${productoActual.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
      })

      if (response.ok) {
        toast({
          title: 'Producto eliminado',
          description: `${productoActual.nombre} ha sido eliminado`,
        })
        setDeleteDialogOpen(false)
        setProductoActual(null)
        cargarProductos()
      } else {
        throw new Error('Error al eliminar')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const productosFiltrados = productos.filter((p) => {
    const matchSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || p.tipo === filtroTipo
    return matchSearch && matchTipo
  })

  const getIcono = (icono?: string) => {
    const found = iconosDisponibles.find((i) => i.value === icono)
    return found?.emoji || '🎁'
  }

  const getTipoBadge = (tipo: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      producto: { label: 'Producto', variant: 'default' },
      servicio: { label: 'Servicio', variant: 'secondary' },
      descuento: { label: 'Descuento', variant: 'outline' },
      puntos: { label: 'Puntos', variant: 'default' },
    }
    return config[tipo] || { label: tipo, variant: 'default' }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">


      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              Productos y Servicios
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tu catalogo de productos y servicios para regalos, milestones y promociones
            </p>
          </div>
          <Button onClick={abrirDialogNuevo} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-6 dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {tiposProducto.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Productos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : productosFiltrados.length === 0 ? (
          <Card className="py-12 dark:bg-slate-900 dark:border-slate-800">
            <CardContent className="text-center">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || filtroTipo !== 'todos'
                  ? 'No se encontraron productos'
                  : 'Aun no tienes productos'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filtroTipo !== 'todos'
                  ? 'Intenta con otros filtros'
                  : 'Crea tu primer producto o servicio para usarlo en regalos y promociones'}
              </p>
              {!searchTerm && filtroTipo === 'todos' && (
                <Button onClick={abrirDialogNuevo} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Producto
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosFiltrados.map((producto) => {
              const tipoBadge = getTipoBadge(producto.tipo)
              return (
                <Card
                  key={producto.id}
                  className={`transition-all hover:shadow-md ${!producto.activo ? 'opacity-60' : ''} dark:bg-slate-900 dark:border-slate-800`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{getIcono(producto.icono)}</div>
                        <div>
                          <CardTitle className="text-lg">{producto.nombre}</CardTitle>
                          <Badge variant={tipoBadge.variant} className="mt-1">
                            {tipoBadge.label}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => abrirDialogEditar(producto)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setProductoActual(producto)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {producto.descripcion && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {producto.descripcion}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {producto.dias_validez ? `${producto.dias_validez} dias` : 'Sin limite'}
                      </span>
                      {!producto.activo && (
                        <Badge variant="outline" className="text-orange-600">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Dialog Crear/Editar */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {productoActual ? 'Editar Producto' : 'Nuevo Producto o Servicio'}
              </DialogTitle>
              <DialogDescription>
                {productoActual
                  ? 'Modifica los datos del producto'
                  : 'Crea un producto o servicio que puedas usar como regalo, milestone o promocion'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Tipo de producto */}
              <div className="space-y-3">
                <Label>Tipo de producto</Label>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  {tiposProducto.map((tipo) => {
                    const Icon = tipo.icon
                    return (
                      <Card
                        key={tipo.value}
                        className={`cursor-pointer transition-all p-4 dark:bg-slate-900 dark:border-slate-800 ${formData.tipo === tipo.value
                          ? 'ring-2 ring-primary border-primary'
                          : 'hover:border-primary/50'
                          }`}
                        onClick={() => setFormData({ ...formData, tipo: tipo.value as any })}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{tipo.label}</p>
                            <p className="text-xs text-muted-foreground">{tipo.descripcion}</p>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Cafe gratis, Masaje 15 min, 20% descuento..."
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              {/* Descripcion */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripcion</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el producto o servicio..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Icono */}
              <div className="space-y-2">
                <Label>Icono</Label>
                <div className="flex flex-wrap gap-2">
                  {iconosDisponibles.map((icono) => (
                    <Button
                      key={icono.value}
                      type="button"
                      variant={formData.icono === icono.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, icono: icono.value })}
                      title={icono.label}
                    >
                      {icono.emoji}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Campos especificos segun tipo */}
              {formData.tipo === 'producto' && (
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="space-y-2">
                    <Label>Nombre del producto</Label>
                    <Input
                      placeholder="Ej: Cafe Americano"
                      value={formData.producto_nombre}
                      onChange={(e) => setFormData({ ...formData, producto_nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.producto_cantidad}
                      onChange={(e) =>
                        setFormData({ ...formData, producto_cantidad: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Valor aproximado (opcional)</Label>
                    <Input
                      placeholder="Ej: 2.50 EUR"
                      value={formData.producto_valor}
                      onChange={(e) => setFormData({ ...formData, producto_valor: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {formData.tipo === 'servicio' && (
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="space-y-2">
                    <Label>Nombre del servicio</Label>
                    <Input
                      placeholder="Ej: Masaje relajante"
                      value={formData.servicio_nombre}
                      onChange={(e) => setFormData({ ...formData, servicio_nombre: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duracion (minutos)</Label>
                    <Input
                      type="number"
                      min="5"
                      step="5"
                      value={formData.servicio_duracion}
                      onChange={(e) =>
                        setFormData({ ...formData, servicio_duracion: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
              )}

              {formData.tipo === 'descuento' && (
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="space-y-2">
                    <Label>Porcentaje de descuento</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.descuento_porcentaje}
                        onChange={(e) =>
                          setFormData({ ...formData, descuento_porcentaje: Number(e.target.value) })
                        }
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>O monto fijo (opcional)</Label>
                    <Input
                      placeholder="Ej: 5 EUR"
                      value={formData.descuento_monto_fijo}
                      onChange={(e) =>
                        setFormData({ ...formData, descuento_monto_fijo: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Compra minima (opcional)</Label>
                    <Input
                      placeholder="Ej: 20 EUR"
                      value={formData.descuento_min_compra}
                      onChange={(e) =>
                        setFormData({ ...formData, descuento_min_compra: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {formData.tipo === 'puntos' && (
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="space-y-2">
                    <Label>Cantidad de puntos</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        step="50"
                        value={formData.puntos_cantidad}
                        onChange={(e) =>
                          setFormData({ ...formData, puntos_cantidad: Number(e.target.value) })
                        }
                        className="max-w-[150px]"
                      />
                      <span className="text-muted-foreground">puntos</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Instrucciones de canje */}
              <div className="space-y-2">
                <Label htmlFor="instrucciones">Instrucciones de canje</Label>
                <Textarea
                  id="instrucciones"
                  placeholder="Ej: Presenta este cupon en caja..."
                  value={formData.instrucciones_canje}
                  onChange={(e) => setFormData({ ...formData, instrucciones_canje: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Configuracion adicional */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dias de validez</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.dias_validez}
                    onChange={(e) => setFormData({ ...formData, dias_validez: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">0 = sin limite</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="validacion-staff">Requiere validacion del staff</Label>
                    <Switch
                      id="validacion-staff"
                      checked={formData.requiere_validacion_staff}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, requiere_validacion_staff: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="activo">Activo</Label>
                    <Switch
                      id="activo"
                      checked={formData.activo}
                      onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={guardarProducto} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {productoActual ? 'Guardar Cambios' : 'Crear Producto'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Confirmar Eliminar */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar producto</AlertDialogTitle>
              <AlertDialogDescription>
                Estas seguro de que quieres eliminar "{productoActual?.nombre}"? Esta accion no se
                puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={eliminarProducto}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}
