'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Users, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { hexToRgb } from '@/lib/brand-colors'
import { useBrandingContext } from '@/components/BrandingProvider'
import { SegmentacionClientes } from './SegmentacionClientes'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Template {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  asunto_predeterminado: string
  contenido_html: string
  variables_disponibles: string[]
}

interface PreviewDestinatarios {
  total_destinatarios: number
  ejemplos: Array<{
    id: string
    nombre: string
    email: string
    puntos_totales: number
    num_compras: number
    ticket_medio: number
    ultima_visita: string
  }>
}

interface FiltrosSegmentacion {
  ticket_medio_min?: number
  ticket_medio_max?: number
  num_visitas_min?: number
  num_visitas_max?: number
  edad_min?: number
  edad_max?: number
  dias_desde_ultima_visita_min?: number
  dias_desde_ultima_visita_max?: number
  puntos_min?: number
  puntos_max?: number
}

interface Campana {
  id: string
  nombre: string
  asunto: string
  contenido_html: string
  contenido_texto?: string
  filtros_segmentacion?: FiltrosSegmentacion
  estado: 'borrador' | 'programada' | 'enviando' | 'enviada' | 'cancelada'
  fecha_programada: string | null
  fecha_enviada: string | null
  total_destinatarios: number
  destinatarios_ids?: string[]
}

interface CrearCampanaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  adminToken: string
  tenantDomain: string
  onCampanaCreada: () => void
  campanaInicial?: Campana | null
}

export function CrearCampanaDialog({
  open,
  onOpenChange,
  adminToken,
  tenantDomain,
  onCampanaCreada,
  campanaInicial,
}: CrearCampanaDialogProps) {
  const isEditMode = !!campanaInicial
  const { branding } = useBrandingContext()
  const [step, setStep] = useState<'datos' | 'filtros' | 'preview'>('datos')
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [previewDestinatarios, setPreviewDestinatarios] = useState<PreviewDestinatarios | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  // Datos básicos - CON VALORES POR DEFECTO PARA TESTING RÁPIDO O DESDE CAMPAÑA EXISTENTE
  const [nombre, setNombre] = useState(
    campanaInicial?.nombre || 'Campaña de Prueba - ' + new Date().toLocaleDateString('es-ES')
  )
  const [asunto, setAsunto] = useState(campanaInicial?.asunto || '')
  const [templateId, setTemplateId] = useState('')
  const [contenidoHtml, setContenidoHtml] = useState(campanaInicial?.contenido_html || '')

  // Filtros de segmentación - CON VALORES POR DEFECTO RAZONABLES O DESDE CAMPAÑA EXISTENTE
  const [filtros, setFiltros] = useState<FiltrosSegmentacion>(
    campanaInicial?.filtros_segmentacion || {
      ticket_medio_min: 0,
      ticket_medio_max: 999999,
      num_visitas_min: 0,
      num_visitas_max: 999999,
      edad_min: 0,
      edad_max: 150,
      dias_desde_ultima_visita_min: 0,
      dias_desde_ultima_visita_max: 999999,
      puntos_min: 0,
      puntos_max: 999999,
    }
  )

  // Clientes seleccionados para la campaña
  const [clientesSeleccionados, setClientesSeleccionados] = useState<string[]>(
    campanaInicial?.destinatarios_ids || []
  )

  useEffect(() => {
    if (open) {
      cargarTemplates()

      // Si estamos en modo edición, cargar los datos de la campaña
      if (campanaInicial) {
        setNombre(campanaInicial.nombre)
        setAsunto(campanaInicial.asunto)
        setContenidoHtml(campanaInicial.contenido_html)

        if (campanaInicial.filtros_segmentacion) {
          setFiltros(campanaInicial.filtros_segmentacion)
        }

        if (campanaInicial.destinatarios_ids) {
          setClientesSeleccionados(campanaInicial.destinatarios_ids)
        }
      }
    }
  }, [open, campanaInicial])

  // Auto-seleccionar el primer template cuando se cargan
  useEffect(() => {
    if (templates.length > 0 && !templateId) {
      setTemplateId(templates[0].id)
    }
  }, [templates])

  useEffect(() => {
    // Auto-completar asunto cuando se selecciona un template (solo si NO estamos editando)
    const template = templates.find(t => t.id === templateId)
    const editMode = !!campanaInicial

    if (template && !asunto && !editMode) {
      setAsunto(template.asunto_predeterminado)
    }
    if (template && !editMode) {
      setContenidoHtml(template.contenido_html)
    }
  }, [templateId, templates, campanaInicial, asunto])

  async function cargarTemplates() {
    try {
      const response = await fetch(`${API_URL}/api/admin/campanas/templates/list`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error cargando templates:', error)
    }
  }

  async function cargarPreviewDestinatarios() {
    setLoadingPreview(true)
    try {
      // Cargar los datos de los primeros clientes seleccionados para mostrar preview
      const response = await fetch(`${API_URL}/api/admin/clientes?limit=10`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Filtrar solo los clientes seleccionados
        const clientesFiltrados = data.data.filter((c: any) => clientesSeleccionados.includes(c.id))
        setPreviewDestinatarios({
          total_destinatarios: clientesSeleccionados.length,
          ejemplos: clientesFiltrados.slice(0, 10),
        })
      }
    } catch (error) {
      console.error('Error cargando preview:', error)
    } finally {
      setLoadingPreview(false)
    }
  }

  async function handleCrearCampana() {
    setLoading(true)
    try {
      const payload = {
        nombre,
        asunto,
        contenido_html: contenidoHtml,
        filtros_segmentacion: filtros,
        destinatarios_ids: clientesSeleccionados,
        estado: 'borrador',
      }

      const action = isEditMode ? 'EDITAR' : 'CREAR'
      console.log(`[${action} CAMPAÑA] Payload:`, payload)
      console.log(`[${action} CAMPAÑA] Clientes seleccionados:`, clientesSeleccionados.length)

      const url = isEditMode
        ? `${API_URL}/api/admin/campanas/${campanaInicial?.id}`
        : `${API_URL}/api/admin/campanas`

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      console.log(`[${action} CAMPAÑA] Response status:`, response.status)

      if (!response.ok) {
        const errorData = await response.text()
        console.error(`[${action} CAMPAÑA] Error response:`, errorData)
        alert(`Error al ${isEditMode ? 'editar' : 'crear'} campaña: ${errorData}`)
        return
      }

      onCampanaCreada()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error(`Error ${isEditMode ? 'editando' : 'creando'} campaña:`, error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setStep('datos')
    setNombre('Campaña de Prueba - ' + new Date().toLocaleDateString('es-ES'))
    setAsunto('')
    setTemplateId(templates.length > 0 ? templates[0].id : '')
    setContenidoHtml('')
    setFiltros({
      ticket_medio_min: 0,
      ticket_medio_max: 999999,
      num_visitas_min: 0,
      num_visitas_max: 999999,
      edad_min: 0,
      edad_max: 150,
      dias_desde_ultima_visita_min: 0,
      dias_desde_ultima_visita_max: 999999,
      puntos_min: 0,
      puntos_max: 999999,
    })
    setClientesSeleccionados([])
    setPreviewDestinatarios(null)
  }

  function handleNextStep() {
    if (step === 'datos') {
      setStep('filtros')
    } else if (step === 'filtros') {
      cargarPreviewDestinatarios()
      setStep('preview')
    }
  }

  const puedeAvanzar = step === 'datos'
    ? nombre && asunto && templateId
    : true

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {isEditMode ? 'Editar Campaña' : 'Nueva Campaña'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {isEditMode
              ? 'Modifica los datos de tu campaña'
              : 'Configura tu campaña de email marketing'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps - Compacto en móvil */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <div
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                step === 'datos'
                  ? 'bg-primary text-white'
                  : 'bg-green-500 text-white'
              }`}
            >
              1
            </div>
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Datos</span>
          </div>
          <div className="w-4 sm:w-12 h-0.5 bg-gray-300" />
          <div className="flex items-center gap-1 sm:gap-2">
            <div
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                step === 'filtros'
                  ? 'bg-primary text-white'
                  : step === 'preview'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              2
            </div>
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Destinatarios</span>
          </div>
          <div className="w-4 sm:w-12 h-0.5 bg-gray-300" />
          <div className="flex items-center gap-1 sm:gap-2">
            <div
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                step === 'preview'
                  ? 'bg-primary text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              3
            </div>
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Confirmar</span>
          </div>
        </div>

        {/* Step 1: Datos Básicos */}
        {step === 'datos' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la Campaña</Label>
              <Input
                id="nombre"
                placeholder="Ej: Promoción Black Friday 2025"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{template.categoria}</Badge>
                        <span>{template.nombre}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {templateId && (
                <p className="text-sm text-muted-foreground">
                  {templates.find(t => t.id === templateId)?.descripcion}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="asunto">Asunto del Email</Label>
              <Input
                id="asunto"
                placeholder="¡Oferta especial solo para ti!"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
              />
            </div>

            {templateId && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Variables disponibles:</strong>{' '}
                  {templates.find(t => t.id === templateId)?.variables_disponibles.join(', ')}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Step 2: Segmentación de Clientes */}
        {step === 'filtros' && (
          <SegmentacionClientes
            adminToken={adminToken}
            tenantDomain={tenantDomain}
            onClientesSeleccionados={setClientesSeleccionados}
            initialFiltros={filtros}
          />
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && (
          <div className="space-y-4">
            {loadingPreview ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : previewDestinatarios ? (
              <>
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{clientesSeleccionados.length} destinatarios</strong> seleccionados para recibir esta campaña.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Vista Previa de Destinatarios</CardTitle>
                    <CardDescription>Primeros 10 clientes que recibirán el email</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {previewDestinatarios.ejemplos.map((cliente) => (
                        <div
                          key={cliente.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{cliente.nombre}</p>
                            <p className="text-sm text-muted-foreground">{cliente.email}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p>{cliente.puntos_totales} pts</p>
                            <p className="text-muted-foreground">
                              {cliente.num_compras} compras · €{cliente.ticket_medio}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Resumen de la Campaña</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Nombre:</span>
                      <span className="font-medium">{nombre}</span>
                      <span className="text-muted-foreground">Asunto:</span>
                      <span className="font-medium">{asunto}</span>
                      <span className="text-muted-foreground">Template:</span>
                      <span className="font-medium">
                        {templates.find(t => t.id === templateId)?.nombre}
                      </span>
                      <span className="text-muted-foreground">Destinatarios:</span>
                      <span className="font-medium">{clientesSeleccionados.length}</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        )}

        <DialogFooter>
          {step !== 'datos' && (
            <Button variant="outline" onClick={() => setStep(step === 'preview' ? 'filtros' : 'datos')}>
              Atrás
            </Button>
          )}
          {step !== 'preview' ? (
            <Button
              onClick={handleNextStep}
              disabled={!puedeAvanzar}
              style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              className="text-white"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleCrearCampana}
              disabled={loading}
              style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              className="text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Guardando...' : 'Creando...'}
                </>
              ) : (
                isEditMode ? 'Guardar Cambios' : 'Crear Campaña'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
