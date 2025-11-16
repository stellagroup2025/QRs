'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Store, Mail, Lock } from 'lucide-react'
import { BrandLogo } from '@/components/BrandLogo'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function AdminLoginPage() {
  const router = useRouter()
  const { branding } = useBrandingContext()
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Obtener dominio actual del host
      const host = window.location.host
      const parts = host.split('.')

      let domain = ''

      // Si es subdominio.localhost:3000 -> usar subdominio
      if (parts.length > 1 && parts[1].startsWith('localhost')) {
        domain = parts[0]
      }
      // Si es localhost:3000 -> extraer del email
      else if (host.startsWith('localhost')) {
        const emailDomain = email.split('@')[1]?.split('.')[0]
        domain = emailDomain || 'lokeyokiera' // fallback
      }
      // En producción: subdominio.qrconnect.es -> usar subdominio
      else {
        domain = parts[0]
      }

      console.log('🔑 [ADMIN LOGIN]', {
        host,
        email,
        domain,
        apiUrl: `${API_URL}/api/admin/auth/login`
      })

      const response = await fetch(`${API_URL}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Domain': domain,
        },
        body: JSON.stringify({ email, pin }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Email o PIN incorrecto')
      }

      // Guardar token y datos de la tienda
      localStorage.setItem('admin_token', data.access_token)
      localStorage.setItem('admin_tienda', JSON.stringify(data.tienda))
      localStorage.setItem('admin_user', JSON.stringify(data.admin))
      localStorage.setItem('tenant_domain', domain) // Guardar el dominio del tenant

      // Redirigir al dashboard
      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-[rgb(var(--brand-primary))]/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BrandLogo width={180} height={60} />
          </div>
          <CardTitle className="text-2xl font-bold">Panel de Administración</CardTitle>
          <CardDescription>
            Acceso para dueños de tienda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@tienda.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pin"
                  type="password"
                  placeholder="****"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  disabled={loading}
                  maxLength={4}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                PIN de 4 dígitos proporcionado por el administrador
              </p>
            </div>

            <Button type="submit" className="w-full text-white" style={{ backgroundColor: hexToRgb(branding.color_primario) }} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <Store className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
