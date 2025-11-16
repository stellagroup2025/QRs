'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, Gift, MessageSquare, FileText, Copy, Check, Save } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface PromoIdea {
  titulo: string
  descripcion: string
  condiciones: string
  mensajeWhatsApp: string
  textoCartel: string
  estimadoImpacto: string
}

interface PromoIdeasResponse {
  ideas: PromoIdea[]
}

/**
 * Componente Generador de Promociones con IA
 *
 * Funcionalidad 2 de IA: Generación de ideas de promociones
 * - Permite seleccionar objetivo de la promoción
 * - Llama al endpoint POST /api/admin/ai/promo-ideas
 * - Muestra ideas con mensajes para WhatsApp y carteles
 */
export function GeneradorPromos({
  tenantDomain,
  adminToken,
  datosPrellenados,
  onClearPrellenados
}: {
  tenantDomain: string
  adminToken: string
  datosPrellenados?: any
  onClearPrellenados?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [ideas, setIdeas] = useState<PromoIdea[]>([])
  const [error, setError] = useState<string | null>(null)
  const [objetivo, setObjetivo] = useState<'aumentar_visitas' | 'subir_ticket' | 'reactivar_inactivos' | 'fidelizar'>('aumentar_visitas')
  const [contexto, setContexto] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<{ type: string; idx: number } | null>(null)
  const [creatingDraft, setCreatingDraft] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Aplicar datos prellenados si existen
  useEffect(() => {
    if (datosPrellenados) {
      console.log('[GENERADOR PROMOS] Aplicando datos prellenados:', datosPrellenados)
      if (datosPrellenados.objetivo) setObjetivo(datosPrellenados.objetivo)
      if (datosPrellenados.contexto) setContexto(datosPrellenados.contexto)

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

  async function generarIdeas() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/admin/ai/promo-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
        body: JSON.stringify({
          objetivo,
          contexto: contexto || undefined,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const data: PromoIdeasResponse = await response.json()
      setIdeas(data.ideas || [])
    } catch (err: any) {
      console.error('[GENERADOR PROMOS] Error:', err)
      setError(err.message || 'Error al generar ideas de promociones')
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

  async function crearBorradorPromocion(idea: PromoIdea, idx: number) {
    setCreatingDraft(idx)

    try {
      const response = await fetch(`${API_URL}/api/admin/promociones/from-ai-suggestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
        body: JSON.stringify({
          titulo: idea.titulo,
          descripcion: idea.descripcion,
          condiciones: idea.condiciones,
          mensajeWhatsApp: idea.mensajeWhatsApp,
          textoCartel: idea.textoCartel,
          estimadoImpacto: idea.estimadoImpacto,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const nuevaPromocion = await response.json()

      toast({
        title: "¡Borrador creado!",
        description: `La promoción "${idea.titulo}" se ha creado como borrador.`,
        variant: "default",
      })

      // No redirigir, solo mostrar éxito
      // El usuario puede seguir creando más borradores o navegar manualmente

    } catch (err: any) {
      console.error('[CREAR BORRADOR] Error:', err)
      toast({
        title: "Error al crear borrador",
        description: err.message || 'No se pudo crear la promoción',
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
          <Gift className="h-5 w-5 text-pink-500" />
          Generador de Promociones con IA
        </CardTitle>
        <CardDescription>
          Obtén ideas creativas de promociones adaptadas a tu negocio y objetivos
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Objetivo de la promoción</label>
            <Select value={objetivo} onValueChange={(v) => setObjetivo(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aumentar_visitas">Aumentar frecuencia de visitas</SelectItem>
                <SelectItem value="subir_ticket">Incrementar ticket medio</SelectItem>
                <SelectItem value="reactivar_inactivos">Reactivar clientes inactivos</SelectItem>
                <SelectItem value="fidelizar">Fidelizar clientes actuales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Contexto adicional (opcional)
            </label>
            <Textarea
              placeholder="Ej: Tenemos mucho flujo los sábados pero muy poco entre semana"
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            onClick={generarIdeas}
            disabled={loading}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando ideas...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Sugerir promociones
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">Error al generar ideas</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {ideas.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {ideas.map((idea, idx) => (
              <Card key={idx} className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-pink-900">{idea.titulo}</CardTitle>
                  <CardDescription className="text-sm">{idea.descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-1">Condiciones:</div>
                    <p className="text-sm text-gray-700">{idea.condiciones}</p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-pink-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Mensaje para WhatsApp:
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copiarTexto(idea.mensajeWhatsApp, 'whatsapp', idx)}
                      >
                        {isCopied('whatsapp', idx) ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700 italic">{idea.mensajeWhatsApp}</p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                        <FileText className="h-3.5 w-3.5" />
                        Texto para cartel:
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copiarTexto(idea.textoCartel, 'cartel', idx)}
                      >
                        {isCopied('cartel', idx) ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{idea.textoCartel}</pre>
                  </div>

                  <div className="bg-blue-50 p-2 rounded border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <span className="font-semibold">Impacto estimado:</span> {idea.estimadoImpacto}
                    </p>
                  </div>

                  <Button
                    onClick={() => crearBorradorPromocion(idea, idx)}
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
                        Crear borrador de promoción
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!ideas.length && !loading && !error && (
          <div className="text-center py-8 text-gray-500">
            <Gift className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Selecciona un objetivo y genera ideas de promociones personalizadas para tu negocio</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
