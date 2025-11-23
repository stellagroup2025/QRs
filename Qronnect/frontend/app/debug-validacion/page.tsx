"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function DebugValidacionPage() {
  const { toast } = useToast()
  const [token, setToken] = useState('')
  const [tenantDomain, setTenantDomain] = useState('burgerco')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)

  const validar = async () => {
    if (!token || !tenantDomain) {
      toast({
        title: 'Error',
        description: 'Debes completar todos los campos',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    setResultado(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

      console.log('🔍 Intentando validar:', {
        token: token.substring(0, 16) + '...',
        tenantDomain,
        url: `${API_URL}/api/clientes/auth/validate-email/${token}`
      })

      const response = await fetch(`${API_URL}/api/clientes/auth/validate-email/${token}`, {
        method: 'GET',
        headers: {
          'X-Tenant-Domain': tenantDomain,
        },
      })

      const data = await response.json()

      console.log('📥 Respuesta:', {
        status: response.status,
        ok: response.ok,
        data
      })

      setResultado({
        status: response.status,
        ok: response.ok,
        data
      })

      if (response.ok) {
        toast({
          title: '✅ Email validado',
          description: 'Tu email ha sido validado correctamente',
        })
      } else {
        toast({
          title: '❌ Error',
          description: data.message || 'No se pudo validar el email',
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      console.error('Error:', error)
      setResultado({
        error: error.message
      })
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Debug: Validación de Email</CardTitle>
            <CardDescription>
              Herramienta de diagnóstico para probar la validación de email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Token de Validación</Label>
              <Input
                id="token"
                placeholder="8d574746f685a3ba5f603f2d0b8603d7bef853d93a0d77b48e193a435da45c53"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Copia el token completo de la URL del email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tenant">Dominio del Tenant</Label>
              <Input
                id="tenant"
                placeholder="burgerco"
                value={tenantDomain}
                onChange={(e) => setTenantDomain(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                El subdominio de la tienda (ej: burgerco, aquarelax, lokeyokiera)
              </p>
            </div>

            <Button
              onClick={validar}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Validando...' : 'Validar Email'}
            </Button>
          </CardContent>
        </Card>

        {resultado && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(resultado, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>💡 Instrucciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ol className="list-decimal list-inside space-y-2">
              <li>Copia el token completo de la URL del email de validación</li>
              <li>Pega el token en el campo de arriba</li>
              <li>Ingresa el dominio del tenant (ej: burgerco)</li>
              <li>Haz clic en "Validar Email"</li>
              <li>Revisa el resultado en la consola del navegador (F12)</li>
            </ol>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm font-medium text-yellow-800">
                ⚠️ Si da error, prueba con diferentes valores de tenant:
              </p>
              <ul className="text-xs text-yellow-700 mt-2 space-y-1">
                <li>• burgerco</li>
                <li>• aquarelax</li>
                <li>• lokeyokiera</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
