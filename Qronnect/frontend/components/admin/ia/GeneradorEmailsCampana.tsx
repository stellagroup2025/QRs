'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, Mail, Copy, Check, Lightbulb, Save } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface EmailVariante {
  variante: string
  contenido: string
  cta: string
}

interface EmailCampaignResponse {
  asuntos: string[]
  cuerpos: EmailVariante[]
  consejos: string[]
}

/**
 * Componente Generador de Campañas de Email con IA
 *
 * Funcionalidad 3 de IA: Generación de campañas de email
 * - Permite describir el segmento de clientes
 * - Seleccionar objetivo y tono
 * - Llama al endpoint POST /api/admin/ai/email-campaigns
 * - Muestra asuntos, cuerpos y consejos
 */
export function GeneradorEmailsCampana({
  tenantDomain,
  adminToken,
  onCampanaCreada,
  datosPrellenados,
  onClearPrellenados
}: {
  tenantDomain: string
  adminToken: string
  onCampanaCreada?: () => void
  datosPrellenados?: any
  onClearPrellenados?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [campana, setCampana] = useState<EmailCampaignResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [segmento, setSegmento] = useState('')
  const [objetivo, setObjetivo] = useState<'reactivacion' | 'upsell' | 'lanzamiento' | 'fidelizacion'>('reactivacion')
  const [tono, setTono] = useState<'cercano' | 'familiar' | 'premium' | 'juvenil'>('cercano')
  const [copiedIndex, setCopiedIndex] = useState<{ type: string; idx: number } | null>(null)
  const [creatingDraft, setCreatingDraft] = useState<number | null>(null)
  const { toast} = useToast()

  // Estados para sugerencias de segmentos
  const [segmentosSugeridos, setSegmentosSugeridos] = useState<any[]>([])
  const [loadingSegmentos, setLoadingSegmentos] = useState(false)

  // Cargar sugerencias de segmentos al montar el componente
  useEffect(() => {
    cargarSegmentosSugeridos()
  }, [])

  // Aplicar datos prellenados si existen
  useEffect(() => {
    if (datosPrellenados) {
      console.log('[GENERADOR EMAILS] Aplicando datos prellenados:', datosPrellenados)
      if (datosPrellenados.segmentoDescripcion) setSegmento(datosPrellenados.segmentoDescripcion)
      if (datosPrellenados.objetivo) setObjetivo(datosPrellenados.objetivo)
      if (datosPrellenados.tono) setTono(datosPrellenados.tono)

      // Limpiar los datos prellenados después de aplicarlos
      if (onClearPrellenados) {
        setTimeout(() => onClearPrellenados(), 100)
      }

      // Mostrar notificación
      toast({
        title: '✨ Datos prellenados',
        description: 'Se han cargado los datos sugeridos por el análisis de IA',
      })
    }
  }, [datosPrellenados])

  async function cargarSegmentosSugeridos() {
    setLoadingSegmentos(true)
    try {
      const response = await fetch(`${API_URL}/api/admin/campanas/analisis-segmentos`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSegmentosSugeridos(data.segmentos || [])
      }
    } catch (error) {
      console.error('[CARGAR SEGMENTOS] Error:', error)
    } finally {
      setLoadingSegmentos(false)
    }
  }

  function aplicarSegmentoSugerido(descripcion: string) {
    setSegmento(descripcion)
  }

  async function generarCampana() {
    if (!segmento.trim()) {
      setError('Debes describir el segmento de clientes objetivo')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/admin/ai/email-campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
        body: JSON.stringify({
          segmentoDescripcion: segmento,
          objetivo,
          tono,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const data: EmailCampaignResponse = await response.json()
      setCampana(data)
    } catch (err: any) {
      console.error('[GENERADOR EMAIL] Error:', err)
      setError(err.message || 'Error al generar campaña de email')
    } finally {
      setLoading(false)
    }
  }

  async function copiarTexto(texto: string, type: string, idx: number) {
    await navigator.clipboard.writeText(texto)
    setCopiedIndex({ type, idx })
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const isCopied = (type: string, idx: number) =>
    copiedIndex?.type === type && copiedIndex?.idx === idx

  async function crearBorradorCampana(variante: EmailVariante, asuntoIdx: number, varianteIdx: number) {
    setCreatingDraft(varianteIdx)

    try {
      // Mapear objetivo a tipo de campaña
      const tipoMap: Record<string, string> = {
        'reactivacion': 'reactivacion',
        'upsell': 'promocional',
        'lanzamiento': 'promocional',
        'fidelizacion': 'fidelizacion',
      }

      // Mapear objetivo a filtros de segmentación inteligentes
      const filtrosMap: Record<string, any> = {
        'reactivacion': {
          dias_desde_ultima_visita_min: 30,
          dias_desde_ultima_visita_max: 180,
          num_visitas_min: 1,
        },
        'upsell': {
          ticket_medio_min: 20,
          num_visitas_min: 3,
        },
        'lanzamiento': {
          // Todos los clientes activos
        },
        'fidelizacion': {
          num_visitas_min: 5,
          dias_desde_ultima_visita_max: 60,
        },
      }

      const response = await fetch(`${API_URL}/api/admin/campanas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
        body: JSON.stringify({
          nombre: `Campaña ${objetivo} - ${variante.variante}`,
          asunto: campana?.asuntos[asuntoIdx] || '',
          contenido_html: variante.contenido,
          contenido_texto: variante.contenido,
          estado: 'borrador',
          tipo: tipoMap[objetivo] || 'promocional',
          filtros_segmentacion: filtrosMap[objetivo] || {},
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const nuevaCampana = await response.json()

      toast({
        title: "¡Borrador de campaña creado!",
        description: `La campaña "${variante.variante}" se ha creado como borrador.`,
        variant: "default",
      })

      // Refrescar lista de campañas si hay callback
      if (onCampanaCreada && typeof onCampanaCreada === 'function') {
        onCampanaCreada()
      }

    } catch (err: any) {
      console.error('[CREAR BORRADOR CAMPAÑA] Error:', err)
      toast({
        title: "Error al crear borrador",
        description: err.message || 'No se pudo crear la campaña',
        variant: "destructive",
      })
    } finally {
      setCreatingDraft(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          Generador de Campañas de Email con IA
        </CardTitle>
        <CardDescription>
          Genera asuntos y cuerpos de email personalizados para tus campañas de marketing
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sugerencias de Segmentos basadas en DB */}
        {!loadingSegmentos && (
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-purple-600" />
                Sugerencias de Segmentos (Basadas en tu Base de Datos)
              </CardTitle>
              <CardDescription className="text-xs">
                {segmentosSugeridos.length > 0
                  ? 'Haz clic en un segmento para usarlo como descripción'
                  : 'No hay suficientes clientes para generar sugerencias automáticas'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {segmentosSugeridos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {segmentosSugeridos.map((segmento, idx) => (
                    <button
                      key={idx}
                      onClick={() => aplicarSegmentoSugerido(segmento.descripcion)}
                      className="bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-400 rounded-lg p-3 text-left transition-all duration-200 hover:shadow-md group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700">
                            {segmento.descripcion}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            {segmento.porcentaje}%
                          </span>
                          <span className="text-xs text-gray-500">
                            {segmento.cantidad} clientes
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-purple-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">
                    Agrega clientes a tu base de datos para ver sugerencias automáticas de segmentación
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {loadingSegmentos && (
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="py-8">
              <div className="flex items-center justify-center gap-3 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Analizando tu base de clientes...</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Descripción del segmento objetivo
            </label>
            <Textarea
              placeholder="Ej: Mujeres 30-45 años, 2-4 visitas en el último año, ticket medio 35€, llevan entre 60 y 120 días sin venir. Tamaño: 124 personas."
              value={segmento}
              onChange={(e) => setSegmento(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe las características del segmento: edad, visitas, gasto, tiempo sin venir, etc.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Objetivo</label>
              <Select value={objetivo} onValueChange={(v) => setObjetivo(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reactivacion">Reactivar clientes</SelectItem>
                  <SelectItem value="upsell">Aumentar ticket medio</SelectItem>
                  <SelectItem value="lanzamiento">Lanzar producto/servicio</SelectItem>
                  <SelectItem value="fidelizacion">Fidelizar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Tono</label>
              <Select value={tono} onValueChange={(v) => setTono(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cercano">Cercano</SelectItem>
                  <SelectItem value="familiar">Familiar</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="juvenil">Juvenil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={generarCampana}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando campaña...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generar campaña de email
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {campana && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* Asuntos sugeridos */}
            {campana.asuntos && campana.asuntos.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Líneas de asunto sugeridas
                </h4>
                <div className="space-y-2">
                  {campana.asuntos.map((asunto, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-blue-200 flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-700 flex-1">{asunto}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copiarTexto(asunto, 'asunto', idx)}
                      >
                        {isCopied('asunto', idx) ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Variantes de cuerpo */}
            {campana.cuerpos && campana.cuerpos.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Variantes de email (A/B Testing)</h4>
                {campana.cuerpos.map((variante, idx) => (
                  <Card key={idx} className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Variante {variante.variante}</CardTitle>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copiarTexto(variante.contenido, 'cuerpo', idx)}
                        >
                          {isCopied('cuerpo', idx) ? (
                            <>
                              <Check className="mr-1 h-3.5 w-3.5 text-green-600" />
                              Copiado
                            </>
                          ) : (
                            <>
                              <Copy className="mr-1 h-3.5 w-3.5" />
                              Copiar
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                          {variante.contenido}
                        </pre>
                      </div>
                      <div className="bg-green-50 p-2 rounded border border-green-200">
                        <p className="text-xs text-green-800">
                          <span className="font-semibold">Call to Action:</span> {variante.cta}
                        </p>
                      </div>

                      <Button
                        onClick={() => crearBorradorCampana(variante, 0, idx)}
                        disabled={creatingDraft !== null}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        {creatingDraft === idx ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creando borrador...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Crear borrador de campaña
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Consejos */}
            {campana.consejos && campana.consejos.length > 0 && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Consejos para optimizar la campaña
                </h4>
                <ul className="space-y-2">
                  {campana.consejos.map((consejo, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-amber-500 font-bold mt-0.5">•</span>
                      <span>{consejo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {!campana && !loading && !error && (
          <div className="text-center py-8 text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Describe tu segmento objetivo y genera contenido personalizado para tu campaña de email</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
