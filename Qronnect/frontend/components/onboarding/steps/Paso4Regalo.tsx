'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Gift, Coins, Percent } from 'lucide-react'

interface Paso4RegaloProps {
  datosIniciales?: {
    tipo_regalo?: 'puntos' | 'descuento' | 'ninguno'
    cantidad_puntos?: number
    descuento_porcentaje?: number
  }
  onChange: (data: any) => void
}

export function Paso4Regalo({ datosIniciales, onChange }: Paso4RegaloProps) {
  const [tipoRegalo, setTipoRegalo] = useState(datosIniciales?.tipo_regalo || 'puntos')
  const [cantidadPuntos, setCantidadPuntos] = useState(datosIniciales?.cantidad_puntos || 100)
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(
    datosIniciales?.descuento_porcentaje || 10
  )

  useEffect(() => {
    onChange({
      tipo_regalo: tipoRegalo,
      cantidad_puntos: tipoRegalo === 'puntos' ? cantidadPuntos : undefined,
      descuento_porcentaje: tipoRegalo === 'descuento' ? descuentoPorcentaje : undefined,
    })
  }, [tipoRegalo, cantidadPuntos, descuentoPorcentaje])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Gift className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Regalo de Bienvenida</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Incentiva a los nuevos clientes con un regalo al registrarse
        </p>
      </div>

      {/* Tipo de Regalo */}
      <RadioGroup value={tipoRegalo} onValueChange={setTipoRegalo}>
        <div className="space-y-3">
          {/* Opción: Puntos */}
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

          {/* Opción: Descuento */}
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

          {/* Opción: Ninguno */}
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

      {/* Preview */}
      {tipoRegalo !== 'ninguno' && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="space-y-3">
            <p className="font-medium text-purple-900">Vista previa del email:</p>
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <h4 className="font-semibold text-lg mb-2">¡Bienvenido!</h4>
              <p className="text-sm text-gray-700 mb-3">
                Gracias por unirte a nuestro programa de fidelización.
              </p>
              {tipoRegalo === 'puntos' && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 text-center">
                  <p className="text-2xl font-bold text-amber-600">+{cantidadPuntos} puntos</p>
                  <p className="text-xs text-amber-700 mt-1">de regalo de bienvenida</p>
                </div>
              )}
              {tipoRegalo === 'descuento' && (
                <div className="bg-green-50 border border-green-200 rounded p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{descuentoPorcentaje}% OFF</p>
                  <p className="text-xs text-green-700 mt-1">en tu primera compra</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Consejo:</strong> Un regalo de bienvenida aumenta la tasa de activación
          de nuevos clientes en un 40%. Es una inversión que vale la pena.
        </p>
      </div>
    </div>
  )
}
