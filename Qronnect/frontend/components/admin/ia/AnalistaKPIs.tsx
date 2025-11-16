'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, TrendingUp, Lightbulb, BarChart3, Calendar } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlanAccionModal } from './PlanAccionModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Recommendation {
  texto: string
  accionable: boolean
  tipo_accion?: 'campana_email' | 'promocion' | 'ambas' | 'ninguna'
  contexto_accion?: string
}

interface KpiAnalysisResponse {
  summary: string
  highlights: string[]
  recommendations: Recommendation[]
  kpis: {
    ventasTotales: number
    numeroTickets: number
    ticketMedio: number
    clientesNuevos: number
    clientesRecurrentes: number
    clientesActivos: number
    tasaRetencion?: number
  }
  periodo: {
    inicio: string
    fin: string
  }
}

interface AnalistaKPIsProps {
  tenantDomain: string
  adminToken: string
  onCreateCampaign?: (datosPrellenados: any) => void
  onCreatePromotion?: (datosPrellenados: any) => void
}

/**
 * Componente Analista de KPIs con IA
 *
 * Funcionalidad 1 de IA: Análisis de KPIs con Google Gemini
 * - Permite seleccionar período (últimos 7, 30 días, mes actual)
 * - Llama al endpoint POST /api/admin/ai/kpi-summary
 * - Muestra resumen ejecutivo, puntos destacados y recomendaciones
 */
export function AnalistaKPIs({ tenantDomain, adminToken, onCreateCampaign, onCreatePromotion }: AnalistaKPIsProps) {
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<KpiAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [periodo, setPeriodo] = useState<'7d' | '30d' | 'mes'>('30d')
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)

  /**
   * Calcular fechas del período seleccionado
   */
  function calcularPeriodo(tipo: '7d' | '30d' | 'mes'): { fromDate: string; toDate: string } {
    const now = new Date()
    const toDate = now.toISOString()
    let fromDate: Date

    if (tipo === '7d') {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (tipo === '30d') {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else {
      // Mes actual
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    return {
      fromDate: fromDate.toISOString(),
      toDate,
    }
  }

  /**
   * Llamar al endpoint de análisis de KPIs
   */
  async function generarAnalisis() {
    setLoading(true)
    setError(null)

    try {
      const fechas = calcularPeriodo(periodo)

      const response = await fetch(`${API_URL}/api/admin/ai/kpi-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
        body: JSON.stringify(fechas),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const data: KpiAnalysisResponse = await response.json()
      setAnalysis(data)
    } catch (err: any) {
      console.error('[ANALISTA KPIs] Error:', err)
      setError(err.message || 'Error al generar el análisis')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Abrir modal de plan de acción para una recomendación
   */
  function abrirPlanAccion(recommendation: Recommendation) {
    setSelectedRecommendation(recommendation)
    setShowPlanModal(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Analista IA de tus KPIs
            </CardTitle>
            <CardDescription>
              Obtén un análisis inteligente de tus métricas de negocio con insights y recomendaciones
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Selector de período y botón */}
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1.5 block">Período a analizar</label>
            <Select value={periodo} onValueChange={(v) => setPeriodo(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Últimos 7 días
                  </div>
                </SelectItem>
                <SelectItem value="30d">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Últimos 30 días
                  </div>
                </SelectItem>
                <SelectItem value="mes">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Mes actual
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generarAnalisis}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Explícame mis números
              </>
            )}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">Error al generar análisis</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Resultados del análisis */}
        {analysis && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* KPIs numéricos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 font-medium">Ventas</div>
                <div className="text-xl font-bold text-blue-900">{analysis.kpis.ventasTotales.toFixed(2)}€</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                <div className="text-xs text-green-600 font-medium">Tickets</div>
                <div className="text-xl font-bold text-green-900">{analysis.kpis.numeroTickets}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                <div className="text-xs text-purple-600 font-medium">Ticket Medio</div>
                <div className="text-xl font-bold text-purple-900">{analysis.kpis.ticketMedio.toFixed(2)}€</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
                <div className="text-xs text-orange-600 font-medium">Clientes Activos</div>
                <div className="text-xl font-bold text-orange-900">{analysis.kpis.clientesActivos}</div>
              </div>
            </div>

            {/* Resumen ejecutivo */}
            <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">Resumen Ejecutivo</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
                </div>
              </div>
            </div>

            {/* Puntos destacados */}
            {analysis.highlights && analysis.highlights.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2">Puntos Destacados</h4>
                    <ul className="space-y-2">
                      {analysis.highlights.map((highlight, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500 font-bold mt-0.5">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-900 mb-3">Recomendaciones</h4>
                    <ul className="space-y-3">
                      {analysis.recommendations.map((rec, idx) => {
                        // Soportar formato antiguo (string) y nuevo (objeto)
                        const recomendacion = typeof rec === 'string'
                          ? { texto: rec, accionable: false, tipo_accion: 'ninguna' as const }
                          : rec

                        return (
                          <li key={idx} className="text-sm text-gray-700">
                            <div className="flex items-start gap-2 mb-2">
                              <span className="text-amber-500 font-bold mt-0.5">→</span>
                              <span className="flex-1">{recomendacion.texto}</span>
                            </div>
                            {recomendacion.accionable && recomendacion.tipo_accion !== 'ninguna' && (
                              <div className="ml-5 mt-2">
                                <Button
                                  size="sm"
                                  onClick={() => abrirPlanAccion(recomendacion)}
                                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs"
                                >
                                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                  Ver Plan de Acción
                                </Button>
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Período analizado */}
            <div className="text-xs text-gray-500 text-center pt-2">
              Análisis del período: {new Date(analysis.periodo.inicio).toLocaleDateString('es-ES')} - {new Date(analysis.periodo.fin).toLocaleDateString('es-ES')}
            </div>
          </div>
        )}

        {/* Estado inicial */}
        {!analysis && !loading && !error && (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Selecciona un período y haz clic en "Explícame mis números" para obtener tu análisis personalizado</p>
          </div>
        )}
      </CardContent>

      {/* Modal de Plan de Acción */}
      <PlanAccionModal
        open={showPlanModal}
        onOpenChange={setShowPlanModal}
        recommendation={selectedRecommendation}
        tenantDomain={tenantDomain}
        adminToken={adminToken}
        onCreateCampaign={onCreateCampaign}
        onCreatePromotion={onCreatePromotion}
      />
    </Card>
  )
}
