/**
 * RegistroForm.tsx
 *
 * Reutiliza:
 * - zod, @hookform/resolvers, react-hook-form (ya instalados en package.json)
 * - @/hooks/use-toast (existente en hooks/use-toast.ts)
 * - <Toaster /> ya configurado en app/layout.tsx línea 35
 * - shadcn/ui components: Button, Input, Label, Card (existentes)
 *
 * No usa localStorage/sessionStorage. Envía POST a /api/qr/register.
 */

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

// Schema de validación reutilizable
const registroSchema = z.object({
  nombre: z.string().min(2, "Tu nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Introduce un email válido"),
  telefono: z.string().min(9, "Teléfono inválido").optional().or(z.literal("")),
  consentimiento: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar el uso de tus datos" }),
  }),
})

type RegistroFormData = z.infer<typeof registroSchema>

export function RegistroForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
  })

  const onSubmit = async (values: RegistroFormData) => {
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/qr/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        // Intentar leer el mensaje de error del backend
        let errorMessage = "No se pudo crear tu QR. Inténtalo de nuevo."
        try {
          const errorData = await res.json()
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          // Si no hay JSON, usar mensaje genérico
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Éxito - obtener datos de la respuesta
      const data = await res.json()

      toast({
        title: "¡QR creado con éxito!",
        description: "Redirigiendo a tu código QR...",
      })

      // Redirigir con los parámetros del QR
      if (data.data?.qrUrl) {
        router.push(data.data.qrUrl)
      } else if (data.data?.id && data.data?.token) {
        router.push(`/mi-qr?cid=${data.data.id}&t=${data.data.token}`)
      } else {
        router.push("/mi-qr")
      }
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Verifica tu conexión.",
        variant: "destructive",
      })
      setIsSubmitting(false)
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
          {/* Campo: Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input
              id="nombre"
              type="text"
              placeholder="Juan Pérez"
              disabled={isSubmitting}
              aria-invalid={!!errors.nombre}
              aria-describedby={errors.nombre ? "nombre-error" : undefined}
              {...register("nombre")}
            />
            {errors.nombre && (
              <p id="nombre-error" className="text-sm text-destructive" role="alert">
                {errors.nombre.message}
              </p>
            )}
          </div>

          {/* Campo: Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Campo: Teléfono (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="612345678"
              disabled={isSubmitting}
              aria-invalid={!!errors.telefono}
              aria-describedby={errors.telefono ? "telefono-error" : undefined}
              {...register("telefono")}
            />
            {errors.telefono && (
              <p id="telefono-error" className="text-sm text-destructive" role="alert">
                {errors.telefono.message}
              </p>
            )}
          </div>

          {/* Campo: Consentimiento - RGPD compliant */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="consentimiento"
                disabled={isSubmitting}
                aria-invalid={!!errors.consentimiento}
                aria-describedby={errors.consentimiento ? "consentimiento-error" : undefined}
                className="mt-1"
                {...register("consentimiento")}
              />
              <Label htmlFor="consentimiento" className="text-sm font-normal cursor-pointer">
                Acepto el uso de mis datos para el programa de fidelización y he leído la{" "}
                <a href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                  Política de Privacidad
                </a>
                {" "}y los{" "}
                <a href="/terminos" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                  Términos y Condiciones
                </a>
                .
              </Label>
            </div>
            {errors.consentimiento && (
              <p id="consentimiento-error" className="text-sm text-destructive" role="alert">
                {errors.consentimiento.message}
              </p>
            )}
          </div>

          {/* Botón Submit */}
          <Button
            type="submit"
            className="w-full disabled:opacity-50 disabled:pointer-events-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando…" : "Obtener mi QR"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
