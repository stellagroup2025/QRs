'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [mensaje, setMensaje] = useState('')
  const [nombreCliente, setNombreCliente] = useState('')

  useEffect(() => {
    const unsubscribe = async () => {
      if (!token) {
        setStatus('error')
        setMensaje('Token de baja no válido')
        return
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
        const response = await fetch(`${apiUrl}/clientes/unsubscribe?token=${token}`)

        if (!response.ok) {
          throw new Error('Error al procesar tu solicitud')
        }

        const data = await response.json()
        setStatus('success')
        setMensaje(data.mensaje)
        setNombreCliente(data.nombre)
      } catch (error) {
        setStatus('error')
        setMensaje('No pudimos procesar tu solicitud. El enlace puede haber expirado.')
      }
    }

    unsubscribe()
  }, [token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
              <CardTitle>Procesando tu solicitud...</CardTitle>
              <CardDescription>Un momento por favor</CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <CardTitle>¡Listo, {nombreCliente}!</CardTitle>
              <CardDescription className="text-base mt-2">{mensaje}</CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <CardTitle>No pudimos completar tu solicitud</CardTitle>
              <CardDescription className="text-base mt-2">{mensaje}</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-1">¿Qué significa esto?</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>No recibirás más emails de ofertas y promociones</li>
                    <li>Seguirás recibiendo emails importantes sobre tu cuenta</li>
                    <li>Puedes reactivar las comunicaciones desde tu perfil cuando quieras</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Si sigues teniendo problemas, por favor contacta con nosotros directamente.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Volver al inicio
              </Button>
            </Link>
            {status === 'success' && (
              <Link href="/mi-perfil" className="flex-1">
                <Button className="w-full">
                  Ir a mi perfil
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
