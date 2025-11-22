'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Megaphone, Sparkles, Gift, Crown, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Paso3PromocionProps {
  onChange: (data: any) => void
}

const plantillasEjemplo = [
  {
    id: '1',
    nombre: 'Bienvenida - 20% Descuento',
    categoria: 'bienvenida',
    descripcion: 'Atrae nuevos clientes con un descuento irresistible en su primera compra',
    icono: <Sparkles className="h-5 w-5" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: '2',
    nombre: 'Cumpleaños - Regalo Gratis',
    categoria: 'cumpleanos',
    descripcion: 'Felicita a tus clientes con un regalo automático en su cumpleaños',
    icono: <Gift className="h-5 w-5" />,
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: '3',
    nombre: 'Cliente VIP - Doble Puntos',
    categoria: 'vip',
    descripcion: 'Recompensa a tus clientes más fieles con puntos extra',
    icono: <Crown className="h-5 w-5" />,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: '4',
    nombre: 'Flash Sale - 24 Horas',
    categoria: 'flash',
    descripcion: 'Genera urgencia con una oferta de tiempo limitado',
    icono: <Zap className="h-5 w-5" />,
    color: 'from-purple-500 to-indigo-500',
  },
]

export function Paso3Promocion({ onChange }: Paso3PromocionProps) {
  const [seleccionada, setSeleccionada] = useState<string | null>(null)

  const handleSelect = (id: string) => {
    setSeleccionada(id)
    onChange({ plantilla_seleccionada: id })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Megaphone className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Tu Primera Promoción</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Elige una plantilla prediseñada para empezar a atraer clientes
        </p>
      </div>

      {/* Plantillas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plantillasEjemplo.map((plantilla) => (
          <Card
            key={plantilla.id}
            className={cn(
              'p-4 cursor-pointer transition-all hover:shadow-lg',
              seleccionada === plantilla.id
                ? 'ring-2 ring-primary shadow-lg'
                : 'hover:border-primary/50'
            )}
            onClick={() => handleSelect(plantilla.id)}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0',
                  `bg-gradient-to-br ${plantilla.color}`
                )}
              >
                {plantilla.icono}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-sm leading-tight">
                    {plantilla.nombre}
                  </h4>
                  {seleccionada === plantilla.id && (
                    <Badge className="bg-primary text-primary-foreground flex-shrink-0">
                      Seleccionada
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {plantilla.descripcion}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Selected Info */}
      {seleccionada && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="space-y-3">
            <p className="font-medium text-green-900">✅ Plantilla seleccionada</p>
            <p className="text-sm text-green-800">
              Podrás personalizar todos los detalles de esta promoción más tarde desde el
              panel de Campañas. Por ahora, esto te permite empezar rápidamente.
            </p>
          </div>
        </Card>
      )}

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Consejo:</strong> Las promociones de bienvenida tienen la mayor tasa
          de conversión. Empieza por ahí y luego experimenta con otras categorías.
        </p>
      </div>
    </div>
  )
}
