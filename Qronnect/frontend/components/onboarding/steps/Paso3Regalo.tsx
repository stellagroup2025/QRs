'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Gift, Coins, Percent, Package, Loader2 } from 'lucide-react'

interface RegaloItem {
  id: string
  nombre: string
  descripcion?: string
  tipo: string
  icono?: string
}

interface Paso3RegaloProps {
  datosIniciales?: {
    tipo_regalo?: 'puntos' | 'descuento' | 'regalo' | 'ninguno'
    cantidad_puntos?: number
    descuento_porcentaje?: number
    id_regalo?: string
  }
  onChange: (data: any) => void
}

export function Paso3Regalo({ datosIniciales, onChange }: Paso3RegaloProps) {
  // Estados para regalo de bienvenida
  const [tipoRegalo, setTipoRegalo] = useState(datosIniciales?.tipo_regalo || 'puntos')
  const [cantidadPuntos, setCantidadPuntos] = useState(datosIniciales?.cantidad_puntos || 100)
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(
    datosIniciales?.descuento_porcentaje || 10
  )
  const [idRegaloSeleccionado, setIdRegaloSeleccionado] = useState(datosIniciales?.id_regalo || '')

  // Catalogo de regalos
  const [catalogoRegalos, setCatalogoRegalos] = useState<RegaloItem[]>([])
  const [cargandoRegalos, setCargandoRegalos] = useState(false)

  // Cargar catalogo de regalos
  useEffect(() => {
    const cargarCatalogo = async () => {
      setCargandoRegalos(true)
      try {
        const domain = window.location.hostname.split('.')[0]
        const token = localStorage.getItem(`admin_token_${domain}`) || localStorage.getItem('admin_token')

        if (!token) return

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${API_URL}/api/regalos/catalogo`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Domain': domain,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setCatalogoRegalos(data || [])
        }
      } catch (error) {
        console.error('Error cargando catalogo de regalos:', error)
      } finally {
        setCargandoRegalos(false)
      }
    }

    cargarCatalogo()
  }, [])

  // Notificar cambios al padre
  useEffect(() => {
    onChange({
      tipo_regalo: tipoRegalo,
      cantidad_puntos: tipoRegalo === 'puntos' ? cantidadPuntos : undefined,
      descuento_porcentaje: tipoRegalo === 'descuento' ? descuentoPorcentaje : undefined,
      id_regalo: tipoRegalo === 'regalo' ? idRegaloSeleccionado : undefined,
    })
  }, [tipoRegalo, cantidadPuntos, descuentoPorcentaje, idRegaloSeleccionado])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Gift className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Regalo de Bienvenida</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Configura qué reciben los nuevos clientes al registrarse
        </p>
      </div>

      <RadioGroup value={tipoRegalo} onValueChange={setTipoRegalo}>
        <div className="space-y-3">
          {/* Opcion: Puntos */}
          <Card
            className={`p-4 cursor-pointer transition-all ${
              tipoRegalo === 'puntos'
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-primary/50'
            }`}
            onClick={() => setTipoRegalo('puntos')}
          >
            <div className="flex items-start gap-3">
              <RadioGroupItem value="puntos" id="regalo-puntos" className="mt-1" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-amber-500" />
                  <Label htmlFor="regalo-puntos" className="font-semibold cursor-pointer">
                    Puntos de Bienvenida
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Los nuevos clientes reciben puntos al registrarse
                </p>

                {tipoRegalo === 'puntos' && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="cantidad-puntos" className="text-sm">
                      Cantidad de puntos:
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="cantidad-puntos"
                        type="number"
                        min="0"
                        step="50"
                        value={cantidadPuntos}
                        onChange={(e) => setCantidadPuntos(Number(e.target.value))}
                        className="max-w-[150px]"
                      />
                      <span className="text-sm text-muted-foreground">puntos</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Opcion: Descuento */}
          <Card
            className={`p-4 cursor-pointer transition-all ${
              tipoRegalo === 'descuento'
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-primary/50'
            }`}
            onClick={() => setTipoRegalo('descuento')}
          >
            <div className="flex items-start gap-3">
              <RadioGroupItem value="descuento" id="regalo-descuento" className="mt-1" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-green-500" />
                  <Label htmlFor="regalo-descuento" className="font-semibold cursor-pointer">
                    Descuento en Primera Compra
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Un cupón de descuento para usar en su primera visita
                </p>

                {tipoRegalo === 'descuento' && (
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="descuento-porcentaje" className="text-sm">
                      Porcentaje de descuento:
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="descuento-porcentaje"
                        type="number"
                        min="5"
                        max="50"
                        step="5"
                        value={descuentoPorcentaje}
                        onChange={(e) => setDescuentoPorcentaje(Number(e.target.value))}
                        className="max-w-[150px]"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Opcion: Regalo/Producto Gratis */}
          <Card
            className={`p-4 cursor-pointer transition-all ${
              tipoRegalo === 'regalo'
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-primary/50'
            }`}
            onClick={() => setTipoRegalo('regalo')}
          >
            <div className="flex items-start gap-3">
              <RadioGroupItem value="regalo" id="regalo-producto" className="mt-1" />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-500" />
                  <Label htmlFor="regalo-producto" className="font-semibold cursor-pointer">
                    Producto o Servicio Gratis
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Un regalo físico o servicio gratuito de tu catálogo
                </p>

                {tipoRegalo === 'regalo' && (
                  <div className="space-y-2 pt-2">
                    {cargandoRegalos ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando catálogo...
                      </div>
                    ) : catalogoRegalos.length > 0 ? (
                      <>
                        <Label htmlFor="regalo-seleccionado" className="text-sm">
                          Selecciona el regalo:
                        </Label>
                        <Select value={idRegaloSeleccionado} onValueChange={setIdRegaloSeleccionado}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Elige un regalo del catálogo" />
                          </SelectTrigger>
                          <SelectContent>
                            {catalogoRegalos.map((regalo) => (
                              <SelectItem key={regalo.id} value={regalo.id}>
                                <div className="flex items-center gap-2">
                                  <span>{regalo.icono || '🎁'}</span>
                                  <span>{regalo.nombre}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm text-orange-800 mb-2">
                          No tienes productos en tu catálogo todavía.
                        </p>
                        <p className="text-xs text-orange-600">
                          Crea productos en Configuración → Productos y Servicios
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Opcion: Ninguno */}
          <Card
            className={`p-4 cursor-pointer transition-all ${
              tipoRegalo === 'ninguno'
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-primary/50'
            }`}
            onClick={() => setTipoRegalo('ninguno')}
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="ninguno" id="regalo-ninguno" />
              <Label htmlFor="regalo-ninguno" className="font-semibold cursor-pointer">
                Sin regalo de bienvenida
              </Label>
            </div>
          </Card>
        </div>
      </RadioGroup>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Consejo:</strong> Un regalo de bienvenida atractivo aumenta significativamente
          las tasas de registro. Los puntos son la opción más popular.
        </p>
      </div>
    </div>
  )
}
