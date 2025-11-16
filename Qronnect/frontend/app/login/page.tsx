"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { BrandButton } from "@/components/ui/brand-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { BrandLogo } from "@/components/BrandLogo"
import { useBrandingContext } from "@/components/BrandingProvider"
import { hexToRgb } from "@/lib/brand-colors"

const emailSchema = z.object({
  email: z.string().email("Email inválido"),
})

const codeSchema = z.object({
  codigo: z.string().length(6, "El código debe tener 6 dígitos").regex(/^\d+$/, "Solo números"),
})

type EmailFormData = z.infer<typeof emailSchema>
type CodeFormData = z.infer<typeof codeSchema>

export default function LoginPage() {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { branding } = useBrandingContext()

  // Verificar si el usuario ya está logueado
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("client_token")
      if (token) {
        // Usuario ya está logueado, redirigir a su perfil
        router.push("/mi-perfil")
      }
    }
  }, [router])

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  })

  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
  })

  const onSubmitEmail = async (data: EmailFormData) => {
    setIsSubmitting(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const host = window.location.host
      const domain = host.split(':')[0].split('.')[0]

      const response = await fetch(`${API_URL}/api/clientes/auth/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Domain': domain === 'localhost' ? 'lokeyokiera' : domain,
        },
        body: JSON.stringify({ email: data.email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al enviar código')
      }

      const result = await response.json()

      toast({
        title: "Código enviado",
        description: `Hemos enviado un código de 6 dígitos a ${data.email}`,
      })

      // En desarrollo, mostrar el código
      if (result.codigo_enviado) {
        toast({
          title: "Código (solo desarrollo)",
          description: `Tu código es: ${result.codigo_enviado}`,
          duration: 10000,
        })
      }

      setEmail(data.email)
      emailForm.reset() // Limpiar el formulario de email
      setStep('code')
      setIsSubmitting(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el código. Inténtalo de nuevo.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const onSubmitCode = async (data: CodeFormData) => {
    setIsSubmitting(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const host = window.location.host
      const domain = host.split(':')[0].split('.')[0]

      const response = await fetch(`${API_URL}/api/clientes/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Domain': domain === 'localhost' ? 'lokeyokiera' : domain,
        },
        body: JSON.stringify({
          email,
          codigo: data.codigo,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Código inválido')
      }

      const result = await response.json()

      // Guardar el token en localStorage
      localStorage.setItem('client_token', result.access_token)
      localStorage.setItem('client_data', JSON.stringify(result.cliente))

      toast({
        title: "¡Bienvenido!",
        description: `Hola ${result.cliente.nombre}`,
      })

      // Redirigir a mi-perfil
      router.push('/mi-perfil')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Código inválido o expirado. Inténtalo de nuevo.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md shadow-lg border-[rgb(var(--brand-primary))]/10">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <BrandLogo width={180} height={60} />
          </div>
          <div className="space-y-1.5 text-center">
            <CardTitle className="text-2xl">Accede a tu cuenta</CardTitle>
            <CardDescription>
              {step === 'email'
                ? 'Ingresa tu email para recibir un código de acceso'
                : 'Ingresa el código de 6 dígitos que enviamos a tu email'
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...emailForm.register("email")}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full text-white"
                style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar código"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                ¿No tienes cuenta?{" "}
                <a
                  href="/"
                  className="hover:underline font-medium"
                  style={{ color: hexToRgb(branding.color_acento) }}
                >
                  Regístrate aquí
                </a>
              </div>
            </form>
          ) : (
            <form onSubmit={codeForm.handleSubmit(onSubmitCode)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código de 6 dígitos</Label>
                <Input
                  id="codigo"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  {...codeForm.register("codigo")}
                  autoComplete="off"
                  autoFocus
                />
                {codeForm.formState.errors.codigo && (
                  <p className="text-sm text-destructive">{codeForm.formState.errors.codigo.message}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Código enviado a: <span className="font-medium">{email}</span>
                </p>
              </div>

              <Button
                type="submit"
                className="w-full text-white"
                style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Verificando..." : "Verificar código"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full hover:bg-[rgb(var(--brand-primary))]/10"
                onClick={() => {
                  setStep('email')
                  codeForm.reset()
                }}
              >
                Cambiar email
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
