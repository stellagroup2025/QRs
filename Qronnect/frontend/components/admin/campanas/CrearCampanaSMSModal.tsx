'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  MessageSquare,
  Users,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Smartphone,
  Send,
  Sparkles,
  Calendar,
  Clock,
  DollarSign,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface CrearCampanaSMSModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  adminToken: string
  tenantDomain: string
  onSuccess?: () => void
}

interface Filtro {
  campo: string
  operador: string
  valor: any
}

export function CrearCampanaSMSModal({
  open,
  onOpenChange,
  adminToken,
  tenantDomain,
  onSuccess,
}: CrearCampanaSMSModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Campos del formulario
  const [nombre, setNombre] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [tipo, setTipo] = useState<'marketing' | 'informativa' | 'transaccional'>('informativa')
  const [enviarAhora, setEnviarAhora] = useState(true)

  // Nuevos campos
  const [asunto, setAsunto] = useState('')
  const [remitenteNombre, setRemitenteNombre] = useState('')
  const [fechaProgramada, setFechaProgramada] = useState('')
  const [horaProgramada, setHoraProgramada] = useState('')
  const [costoEstimado, setCostoEstimado] = useState<number>(0)

  // Filtros de segmentación
  const [genero, setGenero] = useState<string>('todos')
  const [edadMin, setEdadMin] = useState('')
  const [edadMax, setEdadMax] = useState('')
  const [puntosMi, setPuntosMin] = useState('')

  // Preview destinatarios
  const [totalDestinatarios, setTotalDestinatarios] = useState<number>(0)
  const [loadingPreview, setLoadingPreview] = useState(false)

  // IA
  const [mostrarIA, setMostrarIA] = useState(false)
  const [loadingIA, setLoadingIA] = useState(false)
  const [contextoIA, setContextoIA] = useState('')
  const [objetivoIA, setObjetivoIA] = useState<'promocion' | 'bienvenida' | 'reactivacion'>('promocion')
  const [mensajeClaveIA, setMensajeClaveIA] = useState('')
  const [tonoIA, setTonoIA] = useState<'formal' | 'amigable' | 'urgente' | 'cercano'>('amigable')
  const [urgenciaIA, setUrgenciaIA] = useState<'baja' | 'media' | 'alta'>('media')
  const [sugerenciasIA, setSugerenciasIA] = useState<string[]>([])

  // Calcular caracteres SMS
  const caracteresRestantes = 160 - mensaje.length
  const numeroSMS = Math.ceil(mensaje.length / 160) || 1

  useEffect(() => {
    if (open) {
      // Resetear formulario al abrir
      setNombre('')
      setMensaje('')
      setTipo('informativa')
      setEnviarAhora(true)
      setAsunto('')
      setRemitenteNombre('')
      setFechaProgramada('')
      setHoraProgramada('')
      setGenero('todos')
      setEdadMin('')
      setEdadMax('')
      setPuntosMin('')
      setError(null)
      setSuccess(false)
      setMostrarIA(false)
      setSugerenciasIA([])
    }
  }, [open])

  useEffect(() => {
    if (open) {
      obtenerPreviewDestinatarios()
    }
  }, [open, genero, edadMin, edadMax, puntosMi])

  // Calcular costo estimado cuando cambia el mensaje o destinatarios
  useEffect(() => {
    if (mensaje && totalDestinatarios > 0) {
      const costoPorSMS = 0.055 // 5.5 céntimos
      const longitudMensaje = mensaje.length
      let numSMS = 1

      if (longitudMensaje <= 160) {
        numSMS = 1
      } else if (longitudMensaje <= 306) {
        numSMS = 2
      } else if (longitudMensaje <= 459) {
        numSMS = 3
      } else {
        numSMS = Math.ceil(longitudMensaje / 153)
      }

      const costo = numSMS * costoPorSMS * totalDestinatarios
      setCostoEstimado(costo)
    } else {
      setCostoEstimado(0)
    }
  }, [mensaje, totalDestinatarios])

  const obtenerPreviewDestinatarios = async () => {
    setLoadingPreview(true)

    try {
      const filtros: Filtro[] = []

      if (genero !== 'todos') {
        filtros.push({ campo: 'genero', operador: '=', valor: genero })
      }

      if (edadMin) {
        filtros.push({ campo: 'edad', operador: '>=', valor: parseInt(edadMin) })
      }

      if (edadMax) {
        filtros.push({ campo: 'edad', operador: '<=', valor: parseInt(edadMax) })
      }

      if (puntosMi) {
        filtros.push({ campo: 'puntos_totales', operador: '>=', valor: parseInt(puntosMi) })
      }

      const res = await fetch(`${API_URL}/api/campanas-sms/preview-destinatarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filtros_segmentacion: filtros }),
      })

      if (res.ok) {
        const data = await res.json()
        setTotalDestinatarios(data.total || 0)
      }
    } catch (err) {
      console.error('Error al obtener preview:', err)
    } finally {
      setLoadingPreview(false)
    }
  }

  const generarConIA = async () => {
    if (!contextoIA.trim() || !mensajeClaveIA.trim()) {
      setError('Por favor completa el contexto y mensaje clave para generar con IA')
      return
    }

    setLoadingIA(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/api/campanas-sms/generar-con-ia`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contextoNegocio: contextoIA,
          objetivo: objetivoIA,
          mensajeClave: mensajeClaveIA,
          tono: tonoIA,
          urgencia: urgenciaIA,
          incluirCTA: true,
          variables: ['{{nombre}}', '{{puntos}}'],
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error al generar SMS con IA')
      }

      const data = await res.json()
      setMensaje(data.mensaje)
      setSugerenciasIA(data.sugerencias || [])
      setMostrarIA(false)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingIA(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validaciones
      if (!nombre.trim()) {
        throw new Error('El nombre de la campaña es obligatorio')
      }

      if (!mensaje.trim()) {
        throw new Error('El mensaje es obligatorio')
      }

      if (mensaje.length > 1600) {
        throw new Error('El mensaje no puede superar 1600 caracteres (10 SMS)')
      }

      // Construir filtros
      const filtros: Filtro[] = []

      if (genero !== 'todos') {
        filtros.push({ campo: 'genero', operador: '=', valor: genero })
      }

      if (edadMin) {
        filtros.push({ campo: 'edad', operador: '>=', valor: parseInt(edadMin) })
      }

      if (edadMax) {
        filtros.push({ campo: 'edad', operador: '<=', valor: parseInt(edadMax) })
      }

      if (puntosMi) {
        filtros.push({ campo: 'puntos_totales', operador: '>=', valor: parseInt(puntosMi) })
      }

      // Crear campaña
      const payload: any = {
        nombre,
        mensaje,
        tipo,
        estado: enviarAhora ? 'enviada' : 'borrador',
        filtros_segmentacion: filtros,
      }

      // Agregar campos opcionales
      if (asunto) payload.asunto = asunto
      if (remitenteNombre) payload.remitente_nombre = remitenteNombre
      if (fechaProgramada) payload.fecha_programada = fechaProgramada
      if (horaProgramada) payload.hora_programada = horaProgramada

      const res = await fetch(`${API_URL}/api/campanas-sms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error al crear campaña')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        onOpenChange(false)
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Nueva Campaña SMS
          </DialogTitle>
          <DialogDescription>
            Crea una campaña de SMS para enviar mensajes a tus clientes
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la campaña *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Promoción Black Friday"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="asunto">Asunto (interno)</Label>
                <Input
                  id="asunto"
                  placeholder="Para organización interna"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remitente">Nombre del remitente</Label>
                <Input
                  id="remitente"
                  placeholder="Ej: GymFit"
                  value={remitenteNombre}
                  onChange={(e) => setRemitenteNombre(e.target.value)}
                  maxLength={50}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de campaña</Label>
              <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="informativa">Informativa</SelectItem>
                  <SelectItem value="transaccional">Transaccional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botón para mostrar generador IA */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMostrarIA(!mostrarIA)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {mostrarIA ? 'Ocultar' : 'Generar con IA'}
              </Button>
            </div>

            {/* Panel de IA */}
            {mostrarIA && (
              <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-blue-50 space-y-4">
                <div className="flex items-center gap-2 text-purple-700 font-semibold">
                  <Sparkles className="h-5 w-5" />
                  Generador de SMS con IA
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="contextoIA">Contexto del negocio</Label>
                    <Textarea
                      id="contextoIA"
                      placeholder="Ej: Gimnasio boutique especializado en CrossFit en Madrid"
                      value={contextoIA}
                      onChange={(e) => setContextoIA(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="objetivoIA">Objetivo</Label>
                      <Select value={objetivoIA} onValueChange={(v: any) => setObjetivoIA(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="promocion">Promoción</SelectItem>
                          <SelectItem value="bienvenida">Bienvenida</SelectItem>
                          <SelectItem value="reactivacion">Reactivación</SelectItem>
                          <SelectItem value="cumpleanos">Cumpleaños</SelectItem>
                          <SelectItem value="fidelizacion">Fidelización</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tonoIA">Tono</Label>
                      <Select value={tonoIA} onValueChange={(v: any) => setTonoIA(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="amigable">Amigable</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                          <SelectItem value="cercano">Cercano</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mensajeClaveIA">Mensaje clave</Label>
                    <Input
                      id="mensajeClaveIA"
                      placeholder="Ej: 50% de descuento en matrícula durante noviembre"
                      value={mensajeClaveIA}
                      onChange={(e) => setMensajeClaveIA(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgenciaIA">Urgencia</Label>
                    <Select value={urgenciaIA} onValueChange={(v: any) => setUrgenciaIA(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    onClick={generarConIA}
                    disabled={loadingIA || !contextoIA || !mensajeClaveIA}
                    className="w-full"
                  >
                    {loadingIA ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar SMS
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Sugerencias de IA */}
            {sugerenciasIA.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">Sugerencias alternativas:</Label>
                <div className="space-y-2">
                  {sugerenciasIA.map((sugerencia, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMensaje(sugerencia)}
                      className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 text-sm"
                    >
                      {sugerencia}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="mensaje">Mensaje SMS *</Label>
                <div className="flex items-center gap-2 text-xs">
                  <span className={caracteresRestantes < 0 ? 'text-red-500 font-semibold' : 'text-gray-500'}>
                    {caracteresRestantes} caracteres
                  </span>
                  <Badge variant="outline">{numeroSMS} SMS</Badge>
                  {costoEstimado > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      <DollarSign className="h-3 w-3" />
                      {costoEstimado.toFixed(2)}€
                    </Badge>
                  )}
                </div>
              </div>
              <Textarea
                id="mensaje"
                placeholder="Escribe tu mensaje aquí. Puedes usar {{nombre}} para personalizar."
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={4}
                maxLength={1600}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                💡 Variables disponibles: {'{'}{'{'} nombre {'}'}{'}'}
              </p>
            </div>

            {/* Preview del SMS */}
            {mensaje && (
              <div className="bg-gray-50 border rounded-lg p-4">
                <p className="text-xs text-gray-600 font-medium mb-2 flex items-center gap-1">
                  <Smartphone className="h-3 w-3" />
                  Vista previa:
                </p>
                <div className="bg-white border rounded-lg p-3 shadow-sm">
                  <p className="text-sm whitespace-pre-wrap">
                    {mensaje.replace('{{nombre}}', 'Juan')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Segmentación */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Segmentación de Destinatarios</Label>
              <div className="flex items-center gap-2">
                {loadingPreview ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                ) : (
                  <>
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold">{totalDestinatarios} destinatarios</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genero">Género</Label>
                <Select value={genero} onValueChange={setGenero}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="puntos-min">Puntos mínimos</Label>
                <Input
                  id="puntos-min"
                  type="number"
                  placeholder="Ej: 100"
                  value={puntosMi}
                  onChange={(e) => setPuntosMin(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edad-min">Edad mínima</Label>
                <Input
                  id="edad-min"
                  type="number"
                  placeholder="Ej: 18"
                  value={edadMin}
                  onChange={(e) => setEdadMin(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edad-max">Edad máxima</Label>
                <Input
                  id="edad-max"
                  type="number"
                  placeholder="Ej: 65"
                  value={edadMax}
                  onChange={(e) => setEdadMax(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Opciones de envío */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold">Opciones de Envío</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enviar-ahora"
                checked={enviarAhora}
                onChange={(e) => setEnviarAhora(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="enviar-ahora" className="text-sm cursor-pointer">
                Enviar inmediatamente
              </Label>
            </div>

            {!enviarAhora && (
              <>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    La campaña se guardará como borrador. Podrás programar el envío a continuación.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha-programada" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha programada
                    </Label>
                    <Input
                      id="fecha-programada"
                      type="date"
                      value={fechaProgramada}
                      onChange={(e) => setFechaProgramada(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hora-programada" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Hora programada
                    </Label>
                    <Input
                      id="hora-programada"
                      type="time"
                      value={horaProgramada}
                      onChange={(e) => setHoraProgramada(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Alertas */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ¡Campaña SMS {enviarAhora ? 'enviada' : 'creada'} correctamente!
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !nombre || !mensaje || totalDestinatarios === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {enviarAhora ? 'Enviando...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {enviarAhora ? 'Enviar SMS' : 'Guardar Borrador'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
