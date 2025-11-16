'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Shield } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function SuperAdminLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [devCode, setDevCode] = useState<string>('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${API_URL}/api/superadmin/auth/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar código')
      }

      // En desarrollo, el backend devuelve el código en la respuesta
      if (data.codigo) {
        setDevCode(data.codigo)
        setSuccess(`Código generado: ${data.codigo}`)
      } else {
        setSuccess('Código enviado! Revisa tu email.')
      }
      setStep('code')
    } catch (err: any) {
      setError(err.message || 'Error al enviar código')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/superadmin/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo: code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Código inválido')
      }

      // Guardar token en localStorage
      localStorage.setItem('superadmin_token', data.access_token)
      localStorage.setItem('superadmin_refresh_token', data.refresh_token)
      localStorage.setItem('superadmin_user', JSON.stringify(data.superadmin))

      // Redirigir al dashboard
      router.push('/superadmin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Error al verificar código')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    setCode('')
    setError('')
    setSuccess('')
    await handleSendCode({ preventDefault: () => {} } as any)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-purple-500/20">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-500/10 rounded-full">
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">SuperAdmin</CardTitle>
          <CardDescription>
            Panel de administración global de Qronnect
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email de SuperAdmin</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Recibirás un código de verificación de 6 dígitos
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar código'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {devCode && (
                <Alert className="bg-blue-500/10 border-blue-500/50 text-blue-700 dark:text-blue-400">
                  <AlertDescription className="text-center">
                    <div className="font-semibold mb-1">🔐 Código de Desarrollo</div>
                    <div className="text-2xl font-mono tracking-wider">{devCode}</div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">Código de verificación</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  disabled={loading}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  Código enviado a: <span className="font-semibold">{email}</span>
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar código'
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setCode('')
                    setError('')
                    setSuccess('')
                    setDevCode('')
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← Cambiar email
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-purple-500 hover:text-purple-600 disabled:opacity-50"
                >
                  Reenviar código
                </button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t text-center text-xs text-muted-foreground">
            <p>Acceso restringido solo para administradores del sistema</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
