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
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface Cliente {
  id: string
  nombre: string
  email?: string
  telefono?: string
  fecha_nacimiento?: string
  genero?: string
}

interface EditarClienteDialogProps {
  cliente: Cliente
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function EditarClienteDialog({
  cliente,
  open,
  onOpenChange,
  onSuccess,
}: EditarClienteDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: cliente.nombre || '',
    email: cliente.email || '',
    telefono: cliente.telefono || '',
    fecha_nacimiento: cliente.fecha_nacimiento || '',
    genero: cliente.genero || '',
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
      if (formData.nombre !== cliente.nombre) updateData.nombre = formData.nombre
      if (formData.email !== cliente.email) updateData.email = formData.email || null
      if (formData.telefono !== cliente.telefono) updateData.telefono = formData.telefono || null
      if (formData.fecha_nacimiento !== cliente.fecha_nacimiento) {
        updateData.fecha_nacimiento = formData.fecha_nacimiento || null
      }
      if (formData.genero !== cliente.genero) updateData.genero = formData.genero || null

      // Si no hay cambios, no hacer nada
      if (Object.keys(updateData).length === 0) {
        toast({
          title: "Sin cambios",
          description: "No se realizaron modificaciones",
        })
        onOpenChange(false)
        return
      }

      const res = await fetch(`${API_URL}/api/admin/clientes/${cliente.id}`, {
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
        throw new Error(errorData.message || 'Error al actualizar cliente')
      }

      toast({
        title: "Cliente actualizado",
        description: "Los datos del cliente se actualizaron correctamente",
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el cliente",
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
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Modifica los datos del cliente. Los cambios se guardarán inmediatamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              minLength={2}
              maxLength={100}
              placeholder="Juan Pérez"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="juan@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+34612345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
            <Input
              id="fecha_nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="genero">Género</Label>
            <select
              id="genero"
              value={formData.genero}
              onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Seleccionar...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
              <option value="prefiero_no_decir">Prefiero no decir</option>
            </select>
          </div>

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
