"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

export default function ValidarEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'validando' | 'exitoso' | 'error'>('validando')
  const [mensaje, setMensaje] = useState('')

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

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Error al validar el email')
        }

        const data = await response.json()

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
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'validando' && 'Validando tu email...'}
            {status === 'exitoso' && '¡Email validado!'}
            {status === 'error' && 'Error de validación'}
          </CardTitle>
          <CardDescription>
            {status === 'validando' && 'Por favor espera mientras confirmamos tu email'}
            {status === 'exitoso' && 'Tu email ha sido confirmado exitosamente'}
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
                onClick={() => router.push('/mi-perfil')}
                className="w-full"
              >
                Ir a mi perfil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
