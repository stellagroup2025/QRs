"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface Compra {
  id: string
  fecha: string
  importe: number
  puntos_otorgados: number
  notas?: string
  cliente?: {
    id: string
    nombre: string
    email?: string
  }
}

interface EditarCompraDialogProps {
  compra: Compra
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function EditarCompraDialog({
  compra,
  open,
  onOpenChange,
  onSuccess,
}: EditarCompraDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    importe: compra.importe.toString(),
    notas: compra.notas || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        throw new Error('No autenticado')
      }

      const domain = window.location.host.split(':')[0].split('.')[0]
      const tenantDomain = domain === 'localhost' ? 'lokeyokiera' : domain

      // Preparar datos - solo enviar campos que cambiaron
      const updateData: any = {}
      if (parseFloat(formData.importe) !== compra.importe) {
        updateData.importe = parseFloat(formData.importe)
      }
      if (formData.notas !== compra.notas) {
        updateData.notas = formData.notas || null
      }

      // Si no hay cambios, no hacer nada
      if (Object.keys(updateData).length === 0) {
        toast({
          title: "Sin cambios",
          description: "No se realizaron modificaciones",
        })
        onOpenChange(false)
        return
      }

      const res = await fetch(`${API_URL}/api/admin/compras/${compra.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': tenantDomain,
        },
        body: JSON.stringify(updateData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error al actualizar compra')
      }

      const result = await res.json()

      toast({
        title: "Compra actualizada",
        description: result.diferencia_puntos
          ? `Se ${result.diferencia_puntos > 0 ? 'sumaron' : 'restaron'} ${Math.abs(result.diferencia_puntos)} puntos al cliente`
          : "La compra se actualizó correctamente",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la compra",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Compra</DialogTitle>
          <DialogDescription>
            Modifica el importe o las notas de la compra. Si cambias el importe, los puntos se recalcularán automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="importe">Importe (€) *</Label>
            <Input
              id="importe"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.importe}
              onChange={(e) => setFormData({ ...formData, importe: e.target.value })}
              required
              placeholder="25.50"
            />
            <p className="text-xs text-muted-foreground">
              Puntos actuales: {compra.puntos_otorgados}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Corrección de importe por devolución parcial..."
              rows={3}
            />
          </div>

          {compra.cliente && (
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium">{compra.cliente.nombre}</p>
              {compra.cliente.email && (
                <p className="text-muted-foreground">{compra.cliente.email}</p>
              )}
              <p className="text-muted-foreground mt-1">
                Fecha: {new Date(compra.fecha).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
