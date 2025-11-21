"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useBrandingContext } from "@/components/BrandingProvider"
import { hexToRgb } from "@/lib/brand-colors"

export default function ValidacionPendientePage() {
  const { branding } = useBrandingContext()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState<string>("")
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    // Obtener el email guardado durante el registro
    const pendingEmail = localStorage.getItem('pending_validation_email')
    if (pendingEmail) {
      setEmail(pendingEmail)
    } else {
      // Si no hay email pendiente, redirigir al login
      router.push('/login')
    }
  }, [router])

  const handleResendEmail = async () => {
    if (!email) return

    setIsResending(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const host = window.location.host
      const domain = host.split(':')[0].split('.')[0]

      const response = await fetch(`${API_URL}/api/clientes/auth/resend-validation-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Domain': domain === 'localhost' ? 'lokeyokiera' : domain,
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al reenviar el email')
      }

      toast({
        title: "✅ Email reenviado",
        description: "Revisa tu bandeja de entrada y también la carpeta de spam.",
        duration: 5000,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No pudimos reenviar el email. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleGoToLogin = () => {
    localStorage.removeItem('pending_validation_email')
    router.push('/login')
  }

  const colorPrimario = hexToRgb(branding.color_primario)

  return (
    <AppShell showBackButton>
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card className="relative overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-2"
            style={{ backgroundColor: colorPrimario }}
          />

          <CardHeader className="text-center pt-8">
            <div className="flex justify-center mb-4">
              <div
                className="p-4 rounded-full"
                style={{ backgroundColor: `${colorPrimario}15` }}
              >
                <Mail className="h-12 w-12" style={{ color: colorPrimario }} />
              </div>
            </div>
            <CardTitle className="text-2xl">¡Revisa tu email!</CardTitle>
            <CardDescription className="text-base">
              Te hemos enviado un enlace de validación a
              <br />
              <strong className="text-gray-800">{email}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-2">Pasos para validar tu cuenta:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Abre tu bandeja de entrada</li>
                    <li>Busca el email de confirmación</li>
                    <li>Haz clic en el enlace "Confirmar mi email"</li>
                    <li>¡Listo! Ya podrás iniciar sesión</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reenviar email de validación
                  </>
                )}
              </Button>

              <Button
                onClick={handleGoToLogin}
                className="w-full text-white"
                style={{ backgroundColor: colorPrimario }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ir al inicio de sesión
              </Button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>⚠️ ¿No encuentras el email?</strong>
                <br />
                Revisa tu carpeta de spam o correo no deseado. Si no lo encuentras,
                usa el botón de arriba para reenviar el email.
              </p>
            </div>

            <div className="text-center text-xs text-gray-500 pt-4">
              El enlace de validación expira en 24 horas
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
