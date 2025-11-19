'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Loader2,
  CheckCircle,
  XCircle,
  MessageSquare,
  Building2,
  Globe2,
  Phone,
  Key,
  CreditCard,
  AlertTriangle,
  Send
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface SMSConfig {
  activo: boolean
  modo: 'global' | 'propio'
  configurado: boolean
  sender_id?: string
  limites?: {
    max_por_dia?: number
    max_por_mes?: number
  }
  creditos_disponibles?: number
  credenciales_configuradas?: {
    account_sid?: string
    auth_token?: string
    phone_number?: string
  }
}

interface SMSConfigFormProps {
  tiendaId: string
  tiendaNombre: string
  onSuccess?: () => void
}

export function SMSConfigForm({ tiendaId, tiendaNombre, onSuccess }: SMSConfigFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [config, setConfig] = useState<SMSConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Estados del formulario
  const [activo, setActivo] = useState(true)
  const [modo, setModo] = useState<'global' | 'propio'>('global')

  // Modo Global
  const [creditosGlobal, setCreditosGlobal] = useState(0)
  const [maxDiaGlobal, setMaxDiaGlobal] = useState(100)
  const [maxMesGlobal, setMaxMesGlobal] = useState(2000)

  // Modo Propio
  const [accountSid, setAccountSid] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [telefonoTest, setTelefonoTest] = useState('')

  useEffect(() => {
    cargarConfiguracion()
  }, [tiendaId])

  const cargarConfiguracion = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('superadmin_token')
      if (!token) throw new Error('No autenticado')

      const res = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}/sms`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!res.ok) {
        if (res.status === 404) {
          // No hay config, usar defaults
          setConfig({
            activo: false,
            modo: 'global',
            configurado: false,
          })
          return
        }
        throw new Error('Error al cargar configuración')
      }

      const data = await res.json()
      setConfig(data)

      // Inicializar formulario con datos actuales
      setActivo(data.activo || false)
      setModo(data.modo || 'global')
      setCreditosGlobal(data.creditos_disponibles || 0)
      setMaxDiaGlobal(data.limites?.max_por_dia || 100)
      setMaxMesGlobal(data.limites?.max_por_mes || 2000)

      if (data.credenciales_configuradas) {
        setAccountSid(data.credenciales_configuradas.account_sid || '')
        setAuthToken('*'.repeat(20)) // Ocultar token por seguridad
        setPhoneNumber(data.credenciales_configuradas.phone_number || '')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const guardarConfiguracion = async () => {
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const token = localStorage.getItem('superadmin_token')
      if (!token) throw new Error('No autenticado')

      // Validaciones
      if (modo === 'propio') {
        if (!accountSid || !phoneNumber) {
          throw new Error('Debes completar Account SID y Número de teléfono para modo propio')
        }
        // Si el token es ***, significa que no se modificó
        if (authToken === '*'.repeat(20)) {
          throw new Error('Debes ingresar el Auth Token de Twilio')
        }
      }

      const payload: any = {
        activo,
        modo,
      }

      if (modo === 'global') {
        payload.creditos_disponibles = creditosGlobal
        payload.limites = {
          max_por_dia: maxDiaGlobal,
          max_por_mes: maxMesGlobal,
        }
      } else {
        payload.credenciales = {
          account_sid: accountSid,
          auth_token: authToken,
          phone_number: phoneNumber,
        }
      }

      const res = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}/sms`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error al guardar configuración')
      }

      setSuccessMessage('✅ Configuración SMS guardada correctamente')
      await cargarConfiguracion()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const probarEnvio = async () => {
    if (!telefonoTest) {
      setError('Ingresa un número de teléfono para probar')
      return
    }

    setTesting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const token = localStorage.getItem('superadmin_token')
      if (!token) throw new Error('No autenticado')

      const res = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}/sms/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telefono_test: telefonoTest }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Error al enviar SMS de prueba')
      }

      setSuccessMessage('✅ SMS de prueba enviado correctamente')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Configuración de SMS
        </CardTitle>
        <CardDescription>
          Configura el modo de envío de SMS para <strong>{tiendaNombre}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Switch Activo/Inactivo */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="space-y-0.5">
            <Label className="text-base">SMS Activo</Label>
            <p className="text-sm text-gray-500">
              Habilitar o deshabilitar el envío de SMS para esta tienda
            </p>
          </div>
          <Switch
            checked={activo}
            onCheckedChange={setActivo}
          />
        </div>

        {activo && (
          <>
            {/* Selector de Modo */}
            <div className="space-y-4">
              <Label className="text-base">Modo de Operación</Label>
              <Tabs value={modo} onValueChange={(v) => setModo(v as 'global' | 'propio')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="global" className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4" />
                    Modo Global
                  </TabsTrigger>
                  <TabsTrigger value="propio" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Modo Propio
                  </TabsTrigger>
                </TabsList>

                {/* Modo Global */}
                <TabsContent value="global" className="space-y-4 mt-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Globe2 className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Modo Global:</strong> La tienda usa la cuenta de Twilio de Qronnect.
                      Los SMS se descontarán de los créditos prepagados.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="creditos">
                        <CreditCard className="h-4 w-4 inline mr-1" />
                        Créditos Disponibles
                      </Label>
                      <Input
                        id="creditos"
                        type="number"
                        min="0"
                        value={creditosGlobal}
                        onChange={(e) => setCreditosGlobal(Number(e.target.value))}
                        placeholder="1000"
                      />
                      <p className="text-xs text-gray-500">SMS que puede enviar</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-dia">Límite Diario</Label>
                      <Input
                        id="max-dia"
                        type="number"
                        min="1"
                        value={maxDiaGlobal}
                        onChange={(e) => setMaxDiaGlobal(Number(e.target.value))}
                        placeholder="100"
                      />
                      <p className="text-xs text-gray-500">SMS por día</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-mes">Límite Mensual</Label>
                      <Input
                        id="max-mes"
                        type="number"
                        min="1"
                        value={maxMesGlobal}
                        onChange={(e) => setMaxMesGlobal(Number(e.target.value))}
                        placeholder="2000"
                      />
                      <p className="text-xs text-gray-500">SMS por mes</p>
                    </div>
                  </div>
                </TabsContent>

                {/* Modo Propio */}
                <TabsContent value="propio" className="space-y-4 mt-4">
                  <Alert className="bg-purple-50 border-purple-200">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-800">
                      <strong>Modo Propio:</strong> La tienda usa su propia cuenta de Twilio.
                      Necesitas configurar las credenciales.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="account-sid">
                        <Key className="h-4 w-4 inline mr-1" />
                        Account SID
                      </Label>
                      <Input
                        id="account-sid"
                        value={accountSid}
                        onChange={(e) => setAccountSid(e.target.value)}
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="auth-token">
                        <Key className="h-4 w-4 inline mr-1" />
                        Auth Token
                      </Label>
                      <Input
                        id="auth-token"
                        type="password"
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                        placeholder="Tu Auth Token de Twilio"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Se almacena de forma segura. Ingresa solo si quieres cambiarlo.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone-number">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Número de Teléfono Twilio
                      </Label>
                      <Input
                        id="phone-number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+34666123456"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">Formato E.164 (+34666123456)</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Test de envío */}
            {config?.configurado && (
              <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
                <Label className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Probar Envío de SMS
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="+34666123456"
                    value={telefonoTest}
                    onChange={(e) => setTelefonoTest(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={probarEnvio}
                    disabled={testing || !telefonoTest}
                    variant="outline"
                  >
                    {testing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Test'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Mensajes */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}

            {/* Botón Guardar */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={guardarConfiguracion}
                disabled={saving}
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Configuración'
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
