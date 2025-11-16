'use client'

import { useState, useEffect } from 'react'
import { useSenderID, validateSenderID, generarSenderID } from '@/hooks/useSenderID'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, XCircle, Smartphone } from 'lucide-react'

interface SenderIDModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tiendaId: string
  tiendaNombre: string
  currentSenderId?: string | null
  onSuccess?: () => void
}

export function SenderIDModal({
  open,
  onOpenChange,
  tiendaId,
  tiendaNombre,
  currentSenderId,
  onSuccess,
}: SenderIDModalProps) {
  const { actualizarSenderID, eliminarSenderID, loading, error } = useSenderID(tiendaId)

  const [senderId, setSenderId] = useState(currentSenderId || '')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Sincronizar con prop
  useEffect(() => {
    setSenderId(currentSenderId || '')
  }, [currentSenderId, open])

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

    if (!senderId.trim()) {
      setValidationError('El Sender ID no puede estar vacío')
      return
    }

    if (validationError) {
      return
    }

    try {
      await actualizarSenderID(senderId.toUpperCase())
      onSuccess?.()
      onOpenChange(false)
    } catch (err: any) {
      // Error manejado por el hook
    }
  }

  const handleEliminar = async () => {
    if (!confirm('¿Eliminar el Sender ID? La tienda volverá a usar número de teléfono.')) {
      return
    }

    try {
      await eliminarSenderID()
      onSuccess?.()
      onOpenChange(false)
    } catch (err: any) {
      // Error manejado por el hook
    }
  }

  const handleGenerarAutomatico = () => {
    const generado = generarSenderID(tiendaNombre)
    setSenderId(generado)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Configurar Sender ID
          </DialogTitle>
          <DialogDescription>
            Editar el identificador alfanumérico para <strong>{tiendaNombre}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sender-id-modal">Sender ID</Label>
              <span className={`text-xs ${senderId.length > 11 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                {senderId.length}/11
              </span>
            </div>
            <Input
              id="sender-id-modal"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value.toUpperCase())}
              placeholder="GYMFITZONE"
              maxLength={11}
              className={validationError ? 'border-red-500' : ''}
              autoFocus
            />
            {validationError && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                {validationError}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Solo letras (A-Z) y números (0-9). Máximo 11 caracteres.
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
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 font-medium mb-1">Vista previa:</p>
              <div className="bg-white p-2 rounded border border-blue-300">
                <p className="text-xs text-gray-500">De: <strong>{senderId}</strong></p>
                <p className="text-xs text-gray-700 mt-1">Hola! Tienes 250 puntos...</p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {currentSenderId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleEliminar}
                disabled={loading}
                className="text-red-600 hover:text-red-700"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar'}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !!validationError || !senderId.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
