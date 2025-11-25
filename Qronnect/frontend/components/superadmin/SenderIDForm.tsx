'use client'

import { useState, useEffect } from 'react'
import { useSenderID, validateSenderID, generarSenderID, type SMSConfig } from '@/hooks/useSenderID'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle, Smartphone, AlertTriangle } from 'lucide-react'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'

interface SenderIDFormProps {
  tiendaId: string
  tiendaNombre: string
  onSuccess?: () => void
}

export function SenderIDForm({ tiendaId, tiendaNombre, onSuccess }: SenderIDFormProps) {
  const { getConfiguracion, actualizarSenderID, eliminarSenderID, loading, error } = useSenderID(tiendaId)
  const { confirm } = useConfirmDialog()

  const [config, setConfig] = useState<SMSConfig | null>(null)
  const [senderId, setSenderId] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loadingConfig, setLoadingConfig] = useState(true)

  // Cargar configuración al montar
  useEffect(() => {
    const cargar = async () => {
      setLoadingConfig(true)
      const data = await getConfiguracion()
      setConfig(data)
      setSenderId(data?.sender_id || '')
      setLoadingConfig(false)
    }
    cargar()
  }, [tiendaId])

  // Validar en tiempo real
  useEffect(() => {
    if (senderId) {
      const error = validateSenderID(senderId)
      setValidationError(error)
    } else {
      setValidationError(null)
    }
  }, [senderId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)

    if (!senderId.trim()) {
      setValidationError('El Sender ID no puede estar vacío')
      return
    }

    if (validationError) {
      return
    }

    try {
      await actualizarSenderID(senderId.toUpperCase())
      setSuccessMessage('Sender ID actualizado correctamente')
      setSenderId(senderId.toUpperCase())

      // Recargar configuración
      const data = await getConfiguracion()
      setConfig(data)

      onSuccess?.()
    } catch (err: any) {
      // Error manejado por el hook
    }
  }

  const handleEliminar = async () => {
    const confirmed = await confirm({
      title: '¿Eliminar Sender ID?',
      description: 'La tienda volverá a usar número de teléfono.',
      confirmText: 'Eliminar',
      variant: 'destructive',
    })
    if (!confirmed) return

    setSuccessMessage(null)
    try {
      await eliminarSenderID()
      setSenderId('')
      setSuccessMessage('Sender ID eliminado. Se usará número de teléfono.')

      // Recargar configuración
      const data = await getConfiguracion()
      setConfig(data)

      onSuccess?.()
    } catch (err: any) {
      // Error manejado por el hook
    }
  }

  const handleGenerarAutomatico = () => {
    const generado = generarSenderID(tiendaNombre)
    setSenderId(generado)
  }

  if (loadingConfig) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!config?.configurado) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            SMS No Configurado
          </CardTitle>
          <CardDescription>
            Esta tienda no tiene configuración SMS. Configura primero las credenciales de Twilio.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sender ID Alfanumérico</CardTitle>
        <CardDescription>
          Configura el identificador que verán los clientes cuando reciban SMS. Por defecto se usa el número de teléfono.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Estado actual */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Estado Actual:</p>
                {config.sender_id ? (
                  <p className="text-sm text-gray-600 mt-1">
                    Los SMS se envían con el nombre: <strong>{config.sender_id}</strong>
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    Los SMS se envían desde el número de teléfono configurado
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sender-id">Sender ID</Label>
              <span className={`text-xs ${senderId.length > 11 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                {senderId.length}/11
              </span>
            </div>
            <Input
              id="sender-id"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value.toUpperCase())}
              placeholder="GYMFITZONE"
              maxLength={11}
              className={validationError ? 'border-red-500' : ''}
            />
            {validationError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                {validationError}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Solo letras (A-Z) y números (0-9). Debe contener al menos una letra. Máximo 11 caracteres.
            </p>
          </div>

          {/* Generar automático */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGenerarAutomatico}
            className="w-full"
          >
            Generar desde nombre de tienda
          </Button>

          {/* Preview */}
          {senderId && !validationError && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 font-medium mb-2">Vista previa del SMS:</p>
              <div className="bg-white p-3 rounded border border-blue-300 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">De: <strong>{senderId}</strong></p>
                <p className="text-sm text-gray-700">Hola Juan! Tienes 250 puntos disponibles para canjear...</p>
              </div>
            </div>
          )}

          {/* Mensajes */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading || !!validationError || !senderId.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Sender ID'
              )}
            </Button>

            {config.sender_id && (
              <Button
                type="button"
                variant="outline"
                onClick={handleEliminar}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Eliminar'
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
