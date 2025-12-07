'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

import { User, Lock, Mail, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface AdminUser {
  id: string
  nombre: string
  email: string
  rol: string
}

export default function CuentaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Estado para cambio de PIN
  const [pinActual, setPinActual] = useState('')
  const [pinNuevo, setPinNuevo] = useState('')
  const [pinConfirmar, setPinConfirmar] = useState('')
  const [showPins, setShowPins] = useState(false)
  const [changingPin, setChangingPin] = useState(false)
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState(false)

  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token')
    const adminUserData = localStorage.getItem('admin_user')

    if (!adminToken) {
      router.push('/admin/login')
      return
    }

    if (adminUserData) {
      setAdminUser(JSON.parse(adminUserData))
    }
    setLoading(false)
  }, [router])

  const handleChangePIN = async (e: React.FormEvent) => {
    e.preventDefault()
    setPinError('')
    setPinSuccess(false)

    // Validaciones
    if (!pinActual) {
      setPinError('Debes ingresar tu PIN actual')
      return
    }

    if (!pinNuevo || pinNuevo.length < 4 || pinNuevo.length > 6) {
      setPinError('El nuevo PIN debe tener entre 4 y 6 digitos')
      return
    }

    if (pinNuevo !== pinConfirmar) {
      setPinError('Los PINs no coinciden')
      return
    }

    if (pinActual === pinNuevo) {
      setPinError('El nuevo PIN debe ser diferente al actual')
      return
    }

    setChangingPin(true)

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/api/admin/auth/cambiar-pin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pin_actual: pinActual,
          pin_nuevo: pinNuevo,
        }),
      })

      if (response.status === 401) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        router.push('/admin/login')
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar PIN')
      }

      setPinSuccess(true)
      setPinActual('')
      setPinNuevo('')
      setPinConfirmar('')

      toast({
        title: 'PIN actualizado',
        description: 'Tu nuevo PIN ha sido guardado y enviado a tu email.',
      })
    } catch (error: any) {
      setPinError(error.message || 'Error al cambiar PIN')
    } finally {
      setChangingPin(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">


      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mi Cuenta</h1>
          <p className="text-muted-foreground">Gestiona tu informacion personal y seguridad</p>
        </div>

        <div className="grid gap-6">
          {/* Informacion del Usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informacion Personal
              </CardTitle>
              <CardDescription>
                Tus datos de acceso al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-sm">Nombre</Label>
                    <p className="font-medium">{adminUser?.nombre || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Rol</Label>
                    <p className="font-medium">
                      {adminUser?.rol === 'owner' ? 'Admin' :
                        adminUser?.rol === 'empleado' ? 'Empleado' :
                          adminUser?.rol || '-'}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Email</Label>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {adminUser?.email || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cambiar PIN */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cambiar PIN de Acceso
              </CardTitle>
              <CardDescription>
                Actualiza tu PIN para mayor seguridad. El nuevo PIN se enviara a tu email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pinSuccess && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    PIN actualizado correctamente. Hemos enviado el nuevo PIN a tu email.
                  </AlertDescription>
                </Alert>
              )}

              {pinError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{pinError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleChangePIN} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pinActual">PIN Actual</Label>
                  <div className="relative">
                    <Input
                      id="pinActual"
                      type={showPins ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="****"
                      value={pinActual}
                      onChange={(e) => setPinActual(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      disabled={changingPin}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pinNuevo">Nuevo PIN (4-6 digitos)</Label>
                    <Input
                      id="pinNuevo"
                      type={showPins ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="****"
                      value={pinNuevo}
                      onChange={(e) => setPinNuevo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      disabled={changingPin}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pinConfirmar">Confirmar Nuevo PIN</Label>
                    <Input
                      id="pinConfirmar"
                      type={showPins ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="****"
                      value={pinConfirmar}
                      onChange={(e) => setPinConfirmar(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      disabled={changingPin}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPins(!showPins)}
                  >
                    {showPins ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Ocultar PINs
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Mostrar PINs
                      </>
                    )}
                  </Button>
                </div>

                <Button type="submit" disabled={changingPin} className="w-full sm:w-auto">
                  {changingPin ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Cambiar PIN
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
