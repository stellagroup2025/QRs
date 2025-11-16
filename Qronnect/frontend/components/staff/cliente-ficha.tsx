"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Cliente } from "@/types"
import { Mail, Phone, Gift, ShoppingBag, X, Award, Sparkles, CheckCircle2, Ticket } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

interface ClienteFichaProps {
  cliente: Cliente
  onClose: () => void
  onUpdate?: () => void
}

interface Promocion {
  id: string
  titulo: string
  descripcion: string
  tipo: 'descuento_fijo' | 'descuento_porcentaje' | 'producto_gratis'
  valor: number
  puntos_requeridos: number
}

interface Cupon {
  id: string
  codigo_canje: string
  promociones: {
    id: string
    titulo: string
    descripcion?: string
    tipo: 'descuento_fijo' | 'descuento_porcentaje' | 'producto_gratis'
    valor: number
    imagen_url?: string
  }
  estado: 'pendiente' | 'usado' | 'expirado' | 'cancelado'
  fecha_canje: string
  fecha_expiracion?: string
  puntos_usados: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function ClienteFicha({ cliente, onClose, onUpdate }: ClienteFichaProps) {
  const { toast } = useToast()
  const [puntosTotales, setPuntosTotales] = useState(0)
  const [promocionesDisponibles, setPromocionesDisponibles] = useState<Promocion[]>([])
  const [cuponesActivos, setCuponesActivos] = useState<Cupon[]>([])
  const [loading, setLoading] = useState(true)
  const [registrandoVenta, setRegistrandoVenta] = useState(false)
  const [importe, setImporte] = useState('')
  const [notas, setNotas] = useState('')
  const [cuponSeleccionado, setCuponSeleccionado] = useState<string | null>(null)
  const [promoSeleccionada, setPromoSeleccionada] = useState<string | null>(null)

  useEffect(() => {
    cargarDatosCliente()
  }, [cliente.id])

  const cargarDatosCliente = async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    const domain = window.location.host.split(':')[0].split('.')[0]
    const tenantDomain = domain === 'localhost' ? 'lokeyokiera' : domain

    try {
      // Cargar puntos del cliente
      const puntosRes = await fetch(`${API_URL}/api/admin/clientes/${cliente.id}/puntos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })
      if (puntosRes.ok) {
        const puntosData = await puntosRes.json()
        setPuntosTotales(puntosData.puntos_totales || 0)
      }

      // Cargar promociones disponibles
      const promosRes = await fetch(`${API_URL}/api/admin/promociones/disponibles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })
      if (promosRes.ok) {
        const promosData = await promosRes.json()
        setPromocionesDisponibles(promosData)
      }

      // Cargar cupones disponibles del cliente (pendientes y no expirados)
      const cuponesRes = await fetch(`${API_URL}/api/admin/clientes/${cliente.id}/cupones-disponibles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })
      if (cuponesRes.ok) {
        const cuponesData = await cuponesRes.json()
        setCuponesActivos(cuponesData)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error cargando datos del cliente:', error)
      setLoading(false)
    }
  }

  const handleRegistrarVenta = async () => {
    if (!importe || parseFloat(importe) <= 0) {
      toast({
        title: "Error",
        description: "Ingresa un importe válido",
        variant: "destructive",
      })
      return
    }

    const token = localStorage.getItem('admin_token')
    if (!token) return

    const domain = window.location.host.split(':')[0].split('.')[0]
    const tenantDomain = domain === 'localhost' ? 'lokeyokiera' : domain

    setRegistrandoVenta(true)

    try {
      // Preparar body de la compra
      const bodyData: any = {
        clienteId: cliente.id,
        importe: parseFloat(importe),
      }

      // Agregar notas si existen
      if (notas) {
        bodyData.notas = notas
      }

      // Agregar cupón si hay uno seleccionado
      if (cuponSeleccionado) {
        bodyData.cuponId = cuponSeleccionado
      }

      // Registrar la compra
      const compraRes = await fetch(`${API_URL}/api/admin/compras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': tenantDomain,
        },
        body: JSON.stringify(bodyData),
      })

      if (!compraRes.ok) {
        const errorData = await compraRes.json()
        throw new Error(errorData.message || 'Error al registrar venta')
      }

      const compraData = await compraRes.json()

      // Mostrar mensaje de éxito con información del descuento si aplica
      let descripcion = `+${compraData.puntos_otorgados} puntos para ${cliente.nombre}`
      if (compraData.descuento_aplicado && compraData.descuento_aplicado > 0) {
        descripcion += ` | Descuento aplicado: €${compraData.descuento_aplicado.toFixed(2)}`
      }

      toast({
        title: "Venta registrada",
        description: descripcion,
      })

      // Resetear formulario
      setImporte('')
      setNotas('')
      setCuponSeleccionado(null)
      setPromoSeleccionada(null)

      // Recargar datos
      cargarDatosCliente()
      onUpdate?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar la venta",
        variant: "destructive",
      })
    } finally {
      setRegistrandoVenta(false)
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

  const promosCanjeables = promocionesDisponibles.filter(
    p => puntosTotales >= p.puntos_requeridos
  )

  // Calcular descuento a aplicar si hay un cupón seleccionado
  const calcularDescuento = () => {
    if (!cuponSeleccionado || !importe) return 0

    const cupon = cuponesActivos.find(c => c.id === cuponSeleccionado)
    if (!cupon) return 0

    const importeNum = parseFloat(importe)
    if (isNaN(importeNum) || importeNum <= 0) return 0

    const promo = cupon.promociones
    if (promo.tipo === 'descuento_fijo') {
      return Math.min(promo.valor, importeNum)
    } else if (promo.tipo === 'descuento_porcentaje') {
      return (importeNum * promo.valor) / 100
    }
    return 0
  }

  const descuentoCalculado = calcularDescuento()
  const importeFinal = importe ? Math.max(0, parseFloat(importe) - descuentoCalculado) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{cliente.nombre}</CardTitle>
            <CardDescription>
              Cliente desde{" "}
              {new Date(cliente.createdAt).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información de contacto */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Contacto</h3>
          <div className="flex flex-wrap gap-2">
            {cliente.email && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {cliente.email}
              </Badge>
            )}
            {cliente.telefono && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {cliente.telefono}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Puntos */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Puntos disponibles</p>
              <p className="text-2xl font-bold text-purple-600">{puntosTotales}</p>
            </div>
          </div>
        </div>

        {/* Cupones activos */}
        {cuponesActivos.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Cupones disponibles ({cuponesActivos.length})
              </h3>
              <div className="space-y-2">
                {cuponesActivos.map((cupon) => (
                  <div
                    key={cupon.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      cuponSeleccionado === cupon.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                    onClick={() => {
                      setCuponSeleccionado(cuponSeleccionado === cupon.id ? null : cupon.id)
                      setPromoSeleccionada(null) // No se puede usar cupón y promo a la vez
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{cupon.promociones.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          Ahorro: {getValorLabel(cupon.promociones.tipo, cupon.promociones.valor)}
                        </p>
                        {cupon.promociones.descripcion && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {cupon.promociones.descripcion}
                          </p>
                        )}
                      </div>
                      {cuponSeleccionado === cupon.id && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Promociones canjeables */}
        {promosCanjeables.length > 0 && !cuponSeleccionado && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Puede canjear ahora ({promosCanjeables.length})
              </h3>
              <Alert>
                <Award className="h-4 w-4" />
                <AlertDescription>
                  Este cliente tiene puntos suficientes para canjear promociones
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                {promosCanjeables.map((promo) => (
                  <div
                    key={promo.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      promoSeleccionada === promo.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => {
                      setPromoSeleccionada(promoSeleccionada === promo.id ? null : promo.id)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{promo.titulo}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getValorLabel(promo.tipo, promo.valor)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {promo.puntos_requeridos} puntos
                          </span>
                        </div>
                      </div>
                      {promoSeleccionada === promo.id && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Registrar venta */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Registrar venta</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="importe">Importe (€)</Label>
              <Input
                id="importe"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
              />
            </div>

            {/* Previsualización del descuento */}
            {cuponSeleccionado && importe && parseFloat(importe) > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Importe original:</span>
                  <span className="font-medium">€{parseFloat(importe).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700 font-medium">Descuento aplicado:</span>
                  <span className="font-bold text-green-700">-€{descuentoCalculado.toFixed(2)}</span>
                </div>
                <Separator className="bg-green-200" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total a cobrar:</span>
                  <span className="text-2xl font-bold text-green-700">€{importeFinal.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Input
                id="notas"
                placeholder="Ej: Compra de productos..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>
            {cuponSeleccionado && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Se aplicará el cupón seleccionado a esta venta
                </AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleRegistrarVenta}
              disabled={registrandoVenta || !importe}
              className="w-full"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              {registrandoVenta ? 'Registrando...' : 'Registrar venta'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
