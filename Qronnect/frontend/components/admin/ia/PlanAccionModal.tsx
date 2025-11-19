'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles, Mail, Tag, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Recommendation {
  texto: string
  accionable: boolean
  tipo_accion?: 'campana_email' | 'promocion' | 'ambas' | 'ninguna'
  contexto_accion?: string
}

interface Accion {
  tipo: 'crear_campana' | 'crear_promocion'
  titulo: string
  descripcion: string
  datos_prellenados: any
  prioridad: 'alta' | 'media' | 'baja'
}

interface PlanAccionResponse {
  acciones: Accion[]
  explicacion: string
  impacto_estimado: string
}

interface PlanAccionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recommendation: Recommendation | null
  tenantDomain: string
  adminToken: string
  onCreateCampaign?: (datosPrellenados: any) => void
  onCreatePromotion?: (datosPrellenados: any) => void
}

export function PlanAccionModal({
  open,
  onOpenChange,
  recommendation,
  tenantDomain,
  adminToken,
  onCreateCampaign,
  onCreatePromotion,
}: PlanAccionModalProps) {
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<PlanAccionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && recommendation) {
      generarPlan()
    }
  }, [open, recommendation])

  async function generarPlan() {
    if (!recommendation) return

    setLoading(true)
    setError(null)
    setPlan(null)

    try {
      const response = await fetch(`${API_URL}/api/admin/ai/plan-accion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
        body: JSON.stringify({
          recomendacion: recommendation.texto,
          contexto: recommendation.contexto_accion,
          tipo_accion: recommendation.tipo_accion,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const data: PlanAccionResponse = await response.json()
      setPlan(data)
    } catch (err: any) {
      console.error('[PLAN ACCION] Error:', err)
      setError(err.message || 'Error al generar el plan de acción')
    } finally {
      setLoading(false)
    }
  }

  function ejecutarAccion(accion: Accion) {
    if (accion.tipo === 'crear_campana' && onCreateCampaign) {
      onCreateCampaign(accion.datos_prellenados)
      onOpenChange(false)
    } else if (accion.tipo === 'crear_promocion' && onCreatePromotion) {
      onCreatePromotion(accion.datos_prellenados)
      onOpenChange(false)
    }
  }

  const prioridadColor = {
    alta: 'bg-red-100 text-red-700 border-red-300',
    media: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    baja: 'bg-blue-100 text-blue-700 border-blue-300',
  }

  const prioridadLabel = {
    alta: 'Alta Prioridad',
    media: 'Prioridad Media',
    baja: 'Prioridad Baja',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Plan de Acción
          </DialogTitle>
          <DialogDescription>
            Acciones concretas para implementar esta recomendación
          </DialogDescription>
        </DialogHeader>

        {/* Recomendación original */}
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
          <p className="text-sm text-gray-700">
            <span className="font-medium text-amber-900">Recomendación: </span>
            {recommendation?.texto}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-3" />
            <p className="text-sm text-gray-600">Generando plan de acción con IA...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">Error al generar plan</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Plan de acción */}
        {plan && !loading && (
          <div className="space-y-4">
            {/* Explicación */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                ¿Cómo funciona?
              </h4>
              <p className="text-sm text-gray-700">{plan.explicacion}</p>
            </div>

            {/* Impacto estimado */}
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-green-900">Impacto estimado: </span>
                {plan.impacto_estimado}
              </p>
            </div>

            {/* Acciones */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Acciones disponibles:</h4>
              {plan.acciones.map((accion, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      {accion.tipo === 'crear_campana' ? (
                        <Mail className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Tag className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{accion.titulo}</h5>
                        <p className="text-sm text-gray-600 mt-1">{accion.descripcion}</p>
                      </div>
                    </div>
                    <Badge className={`${prioridadColor[accion.prioridad]} border`}>
                      {prioridadLabel[accion.prioridad]}
                    </Badge>
                  </div>

                  <Button
                    onClick={() => ejecutarAccion(accion)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {accion.tipo === 'crear_campana' ? 'Crear Campaña' : 'Crear Promoción'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {plan.acciones.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No se encontraron acciones ejecutables para esta recomendación.</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
