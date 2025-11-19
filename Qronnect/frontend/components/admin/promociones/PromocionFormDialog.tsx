'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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
}

interface PromocionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promocion?: Promocion | null
  adminToken: string
  tenantDomain: string
  onSuccess: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function PromocionFormDialog({
  open,
  onOpenChange,
  promocion,
  adminToken,
  tenantDomain,
  onSuccess,
}: PromocionFormDialogProps) {
  const { branding } = useBrandingContext()
  const [loading, setLoading] = useState(false)

  // Form state
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipo, setTipo] = useState<'descuento_fijo' | 'descuento_porcentaje' | 'producto_gratis'>('descuento_fijo')
  const [valor, setValor] = useState('')
  const [puntosRequeridos, setPuntosRequeridos] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [activo, setActivo] = useState(true)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [cantidadDisponible, setCantidadDisponible] = useState('')
  const [ilimitado, setIlimitado] = useState(true)

  // Reset form cuando cambia la promoción o se abre el dialog
  useEffect(() => {
    if (open) {
      if (promocion) {
        // Editar promoción existente
        setTitulo(promocion.titulo)
        setDescripcion(promocion.descripcion || '')
        setTipo(promocion.tipo)
        setValor(promocion.valor.toString())
        setPuntosRequeridos(promocion.puntos_requeridos.toString())
        setImagenUrl(promocion.imagen_url || '')
        setActivo(promocion.activo)

        // Formatear fecha para input type="datetime-local"
        const fechaInicioFormatted = new Date(promocion.fecha_inicio).toISOString().slice(0, 16)
        setFechaInicio(fechaInicioFormatted)

        if (promocion.fecha_fin) {
          const fechaFinFormatted = new Date(promocion.fecha_fin).toISOString().slice(0, 16)
          setFechaFin(fechaFinFormatted)
        } else {
          setFechaFin('')
        }

        if (promocion.cantidad_disponible !== null && promocion.cantidad_disponible !== undefined) {
          setCantidadDisponible(promocion.cantidad_disponible.toString())
          setIlimitado(false)
        } else {
          setCantidadDisponible('')
          setIlimitado(true)
        }
      } else {
        // Nueva promoción - valores por defecto
        setTitulo('')
        setDescripcion('')
        setTipo('descuento_fijo')
        setValor('')
        setPuntosRequeridos('')
        setImagenUrl('')
        setActivo(true)

        // Fecha de inicio: ahora
        const now = new Date()
        setFechaInicio(now.toISOString().slice(0, 16))
        setFechaFin('')

        setCantidadDisponible('')
        setIlimitado(true)
      }
    }
  }, [open, promocion])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        titulo,
        descripcion: descripcion || undefined,
        tipo,
        valor: parseFloat(valor),
        puntos_requeridos: parseInt(puntosRequeridos),
        imagen_url: imagenUrl || undefined,
        activo,
        fecha_inicio: fechaInicio ? new Date(fechaInicio).toISOString() : undefined,
        fecha_fin: fechaFin ? new Date(fechaFin).toISOString() : undefined,
        cantidad_disponible: ilimitado ? null : parseInt(cantidadDisponible),
      }

      const url = promocion
        ? `${API_URL}/api/admin/promociones/${promocion.id}`
        : `${API_URL}/api/admin/promociones`

      const response = await fetch(url, {
        method: promocion ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al guardar promoción')
      }

      alert(promocion ? 'Promoción actualizada exitosamente' : 'Promoción creada exitosamente')
      onSuccess()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al guardar promoción')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {promocion ? 'Editar Promoción' : 'Nueva Promoción'}
          </DialogTitle>
          <DialogDescription>
            {promocion
              ? 'Modifica los datos de la promoción existente'
              : 'Completa los datos para crear una nueva promoción que los clientes puedan canjear'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: 10€ de descuento"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe los detalles de la promoción"
              rows={3}
            />
          </div>

          {/* Tipo y Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Promoción *</Label>
              <Select value={tipo} onValueChange={(value: any) => setTipo(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="descuento_fijo">Descuento Fijo (€)</SelectItem>
                  <SelectItem value="descuento_porcentaje">Descuento Porcentaje (%)</SelectItem>
                  <SelectItem value="producto_gratis">Producto Gratis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">
                {tipo === 'descuento_fijo' ? 'Valor (€) *' : tipo === 'descuento_porcentaje' ? 'Porcentaje (%) *' : 'Precio (€) *'}
              </Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder={tipo === 'descuento_fijo' ? '10.00' : tipo === 'descuento_porcentaje' ? '15' : '0'}
                required
              />
            </div>
          </div>

          {/* Puntos Requeridos */}
          <div className="space-y-2">
            <Label htmlFor="puntos">Puntos Requeridos *</Label>
            <Input
              id="puntos"
              type="number"
              min="1"
              value={puntosRequeridos}
              onChange={(e) => setPuntosRequeridos(e.target.value)}
              placeholder="100"
              required
            />
            <p className="text-xs text-muted-foreground">
              Cantidad de puntos que debe tener el cliente para canjear esta promoción
            </p>
          </div>

          {/* Imagen URL */}
          <div className="space-y-2">
            <Label htmlFor="imagen">URL de Imagen (opcional)</Label>
            <Input
              id="imagen"
              type="url"
              value={imagenUrl}
              onChange={(e) => setImagenUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
              <Input
                id="fechaInicio"
                type="datetime-local"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha de Fin (opcional)</Label>
              <Input
                id="fechaFin"
                type="datetime-local"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Dejar vacío = sin fecha de expiración
              </p>
            </div>
          </div>

          {/* Cantidad Disponible */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="ilimitado"
                checked={ilimitado}
                onCheckedChange={setIlimitado}
              />
              <Label htmlFor="ilimitado">Canjes ilimitados</Label>
            </div>

            {!ilimitado && (
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad Disponible *</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={cantidadDisponible}
                  onChange={(e) => setCantidadDisponible(e.target.value)}
                  placeholder="50"
                  required={!ilimitado}
                />
                <p className="text-xs text-muted-foreground">
                  Número máximo de veces que se puede canjear esta promoción
                </p>
              </div>
            )}
          </div>

          {/* Estado */}
          <div className="flex items-center space-x-2">
            <Switch
              id="activo"
              checked={activo}
              onCheckedChange={setActivo}
            />
            <Label htmlFor="activo">Promoción activa</Label>
          </div>

          {/* Botones */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              className="text-white"
            >
              {loading ? 'Guardando...' : promocion ? 'Actualizar' : 'Crear Promoción'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
