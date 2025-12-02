'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Coins, TrendingUp } from 'lucide-react'

interface Paso2PuntosProps {
  datosIniciales?: {
    puntos_por_euro?: number
  }
  onChange: (data: any) => void
}

export function Paso2Puntos({ datosIniciales, onChange }: Paso2PuntosProps) {
  const [puntosPorEuro, setPuntosPorEuro] = useState(datosIniciales?.puntos_por_euro || 10)

  useEffect(() => {
    onChange({
      puntos_por_euro: puntosPorEuro,
    })
  }, [puntosPorEuro])

  // Cálculos de ejemplo
  const compra20Euros = puntosPorEuro * 20
  const compra50Euros = puntosPorEuro * 50

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Coins className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Sistema de Puntos</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Define cuántos puntos ganan tus clientes por cada euro gastado
        </p>
      </div>

      {/* Puntos por Euro */}
      <div className="space-y-2">
        <Label htmlFor="puntos-euro">Puntos por cada € gastado</Label>
        <div className="flex items-center gap-4">
          <Input
            id="puntos-euro"
            type="number"
            min="1"
            max="100"
            value={puntosPorEuro}
            onChange={(e) => setPuntosPorEuro(Number(e.target.value))}
            className="text-lg font-semibold"
          />
          <span className="text-sm text-muted-foreground">puntos / €</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Recomendado: 5-20 puntos por euro
        </p>
      </div>

      {/* Ejemplos */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <p className="font-medium text-green-900">Ejemplos con tu configuración:</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-gray-700">Compra de 20€:</span>
              <span className="font-bold text-green-600">+{compra20Euros} pts</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
              <span className="text-gray-700">Compra de 50€:</span>
              <span className="font-bold text-green-600">+{compra50Euros} pts</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Consejo:</strong> Un buen sistema de puntos motiva a los clientes a
          volver. Lo ideal es que con 5-10 visitas puedan obtener una recompensa significativa.
        </p>
      </div>
    </div>
  )
}
