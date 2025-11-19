"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useClientes } from "@/stores/useClientes"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

const registroSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(9, "Teléfono inválido").optional().or(z.literal("")),
  aceptarTerminos: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
})

type RegistroFormData = z.infer<typeof registroSchema>

export function GetQRForm() {
  const { crearSiNoExiste, recuperarPorEmail } = useClientes()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
  })

  const onSubmit = (data: RegistroFormData) => {
    setIsSubmitting(true)

    // Verificar si el email ya existe
    const existente = recuperarPorEmail(data.email)

    if (existente) {
      setError("email", {
        type: "manual",
        message: "Este email ya está registrado. Usa 'Recuperar QR' en la página principal.",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const cliente = crearSiNoExiste(data.email, {
        nombre: data.nombre,
        telefono: data.telefono || undefined,
      })

      toast({
        title: "¡Bienvenido!",
        description: "Tu QR ha sido creado exitosamente",
      })

      router.push(`/mi-qr?cid=${cliente.id}&t=${cliente.token}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear tu QR. Inténtalo de nuevo.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handleClearData = () => {
    if (typeof window !== "undefined") {
      if (confirm("¿Estás seguro de que quieres limpiar todos los datos? Esta acción no se puede deshacer.")) {
        localStorage.clear()
        toast({
          title: "Datos limpiados",
          description: "Todos los datos locales han sido eliminados",
        })
        window.location.reload()
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Obtén tu QR</CardTitle>
        <CardDescription>Completa el formulario para crear tu código QR de fidelización</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input id="nombre" placeholder="Juan Pérez" {...register("nombre")} disabled={isSubmitting} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register("email")}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input id="telefono" type="tel" placeholder="612345678" {...register("telefono")} disabled={isSubmitting} />
            {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
          </div>

          <div className="flex items-start space-x-2">
            <input type="checkbox" id="aceptarTerminos" {...register("aceptarTerminos")} className="mt-1" disabled={isSubmitting} />
            <Label htmlFor="aceptarTerminos" className="text-sm font-normal">
              Acepto los términos y condiciones del programa de fidelización
            </Label>
          </div>
          {errors.aceptarTerminos && <p className="text-sm text-destructive">{errors.aceptarTerminos.message}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creando tu QR..." : "Obtener mi QR"}
          </Button>

          {/* Debug button - solo visible en desarrollo */}
          {process.env.NODE_ENV === "development" && (
            <Button type="button" variant="ghost" size="sm" className="w-full text-xs" onClick={handleClearData}>
              🗑️ Limpiar datos locales (dev)
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
