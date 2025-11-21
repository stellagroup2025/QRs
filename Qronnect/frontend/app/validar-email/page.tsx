"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

function ValidarEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'validando' | 'exitoso' | 'error' | 'expirado' | 'reenviando'>('validando')
  const [mensaje, setMensaje] = useState('')
  const [tokenExpirado, setTokenExpirado] = useState(false)
  const [nuevoEnlaceEnviado, setNuevoEnlaceEnviado] = useState(false)

  useEffect(() => {
    const validarEmail = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMensaje('No se proporcionó un token de validación válido')
        return
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

        // Obtener el dominio de la tienda actual
        const host = window.location.host
        const domain = host.split(':')[0].split('.')[0]

        const response = await fetch(`${API_URL}/api/clientes/auth/validate-email/${token}`, {
          method: 'GET',
          headers: {
            'X-Tenant-Domain': domain === 'localhost' ? 'lokeyokiera' : domain,
          },
        })

        const data = await response.json()

        // Si el token expiró, el backend automáticamente envía un nuevo enlace
        if (data.token_expirado) {
          setStatus('expirado')
          setTokenExpirado(true)
          setNuevoEnlaceEnviado(data.nuevo_enlace_enviado || false)
          setMensaje(data.message || 'El enlace ha expirado. Te hemos enviado un nuevo enlace.')
          return
        }

        if (!response.ok) {
          throw new Error(data.message || 'Error al validar el email')
        }

        setStatus('exitoso')
        setMensaje(data.message || 'Email validado exitosamente')

        // Redirigir al perfil después de 3 segundos
        setTimeout(() => {
          router.push('/mi-perfil')
        }, 3000)
      } catch (error: any) {
        console.error('Error validando email:', error)
        setStatus('error')
        setMensaje(error.message || 'No se pudo validar el email. El enlace puede haber expirado.')
      }
    }

    validarEmail()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'validando' && (
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            )}
            {status === 'exitoso' && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === 'expirado' && (
              <div className="text-6xl">⏰</div>
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'validando' && 'Validando tu email...'}
            {status === 'exitoso' && '¡Email validado!'}
            {status === 'expirado' && 'Enlace expirado'}
            {status === 'error' && 'Error de validación'}
          </CardTitle>
          <CardDescription>
            {status === 'validando' && 'Por favor espera mientras confirmamos tu email'}
            {status === 'exitoso' && 'Tu email ha sido confirmado exitosamente'}
            {status === 'expirado' && 'Te hemos enviado un nuevo enlace'}
            {status === 'error' && 'Hubo un problema al validar tu email'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-gray-600">
            {mensaje}
          </p>

          {status === 'exitoso' && (
            <p className="text-center text-sm text-gray-500">
              Redirigiendo a tu perfil en unos segundos...
            </p>
          )}

          {status === 'expirado' && nuevoEnlaceEnviado && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 text-center">
                  ✉️ <strong>Revisa tu bandeja de entrada</strong>
                  <br />
                  Te hemos enviado un nuevo enlace de validación que expira en 24 horas.
                </p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
                variant="outline"
              >
                Ir al login
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <Button
                onClick={() => router.push('/registro')}
                className="w-full"
                variant="outline"
              >
                Volver al registro
              </Button>
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Ir al login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ValidarEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            </div>
            <CardTitle className="text-2xl">Cargando...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <ValidarEmailContent />
    </Suspense>
  )
}
