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
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useBrandingContext } from "@/components/BrandingProvider"
import { hexToRgb } from "@/lib/brand-colors"

const recuperarSchema = z.object({
  email: z.string().email("Email inválido"),
})

type RecuperarFormData = z.infer<typeof recuperarSchema>

export function RecuperarForm() {
  const { branding } = useBrandingContext()
  const { recuperarPorEmail, crearSiNoExiste } = useClientes()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [noEncontrado, setNoEncontrado] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RecuperarFormData>({
    resolver: zodResolver(recuperarSchema),
  })

  const onSubmit = (data: RecuperarFormData) => {
    setIsSubmitting(true)
    setNoEncontrado(null)

    const cliente = recuperarPorEmail(data.email)

    if (cliente) {
      toast({
        title: "Te hemos encontrado",
        description: "Aquí está tu QR personal",
      })
      router.push(`/mi-qr?cid=${cliente.id}&t=${cliente.token}`)
    } else {
      setNoEncontrado(data.email)
      setIsSubmitting(false)
    }
  }

  const handleCrearNuevo = () => {
    const email = noEncontrado || getValues("email")
    if (!email) return

    const nombre = prompt("Por favor, introduce tu nombre completo:")
    if (!nombre || nombre.trim().length < 2) {
      toast({
        title: "Nombre requerido",
        description: "Necesitamos tu nombre para crear tu QR",
        variant: "destructive",
      })
      return
    }

    const cliente = crearSiNoExiste(email, { nombre: nombre.trim() })

    toast({
      title: "QR creado",
      description: "Tu código QR ha sido generado exitosamente",
    })

    router.push(`/mi-qr?cid=${cliente.id}&t=${cliente.token}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar mi QR</CardTitle>
        <CardDescription>Introduce tu email para acceder a tu código QR</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="tu@email.com" {...register("email")} disabled={isSubmitting} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {noEncontrado && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No encontramos este email en nuestro sistema. ¿Quieres crear tu QR con este email?
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button type="submit" className="w-full text-white" style={{ backgroundColor: hexToRgb(branding.color_primario) }} disabled={isSubmitting}>
              {isSubmitting ? "Buscando..." : "Buscar mi QR"}
            </Button>

            {noEncontrado && (
              <Button type="button" variant="outline" className="w-full border-[rgb(var(--brand-primary))] text-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary))]/10" onClick={handleCrearNuevo}>
                Crear mi QR con este email
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
