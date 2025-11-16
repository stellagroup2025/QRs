'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, QrCode, Mail, CheckCircle2, Camera, Keyboard } from 'lucide-react'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'

// Importar QrReader dinámicamente para evitar SSR issues
const QrReader = dynamic(() => import('react-qr-reader').then(mod => mod.QrReader), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">Cargando cámara...</div>
})

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface RegistrarVentaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RegistrarVentaDialog({ open, onOpenChange, onSuccess }: RegistrarVentaDialogProps) {
  const { branding } = useBrandingContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [successData, setSuccessData] = useState<any>(null)

  // Formulario
  const [codigoQr, setCodigoQr] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [importe, setImporte] = useState('')
  const [notas, setNotas] = useState('')

  // Estados para el escáner
  const [scannerMode, setScannerMode] = useState<'camera' | 'manual'>('camera')
  const [scannerError, setScannerError] = useState('')

  // Estados para búsqueda por email
  const [email, setEmail] = useState('')
  const [searchingEmail, setSearchingEmail] = useState(false)
  const [clienteEncontrado, setClienteEncontrado] = useState<any>(null)
  const [emailError, setEmailError] = useState('')

  // Estado para controlar los pasos del wizard
  const [paso, setPaso] = useState<1 | 2>(1)

  const handleScan = async (result: any) => {
    if (result?.text) {
      setCodigoQr(result.text)
      setScannerMode('manual')
      setScannerError('')

      // Buscar información del cliente con este código QR (opcional, para mostrar preview)
      // Por ahora solo seteamos un cliente genérico para habilitar el botón continuar
      setClienteEncontrado({ codigo_qr: result.text })
    }
  }

  const handleScanError = (error: any) => {
    console.error('Error al escanear:', error)
    setScannerError('Error al acceder a la cámara. Verifica los permisos.')
  }

  const handleBuscarPorEmail = async () => {
    if (!email.trim()) {
      setEmailError('Por favor introduce un email')
      return
    }

    setSearchingEmail(true)
    setEmailError('')
    setClienteEncontrado(null)

    try {
      const token = localStorage.getItem('admin_token')
      const tiendaData = localStorage.getItem('admin_tienda')
      const domain = tiendaData ? JSON.parse(tiendaData).dominio : 'localhost'

      const response = await fetch(`${API_URL}/api/admin/clientes?search=${encodeURIComponent(email.trim())}&limit=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
      })

      if (!response.ok) {
        throw new Error('Error al buscar cliente')
      }

      const data = await response.json()

      if (data.data && data.data.length > 0) {
        const cliente = data.data[0]
        setClienteEncontrado(cliente)
        setClienteId(cliente.id) // Usar el ID del cliente directamente
      } else {
        setEmailError('No se encontró ningún cliente con ese email')
      }
    } catch (err: any) {
      setEmailError(err.message || 'Error al buscar el cliente')
    } finally {
      setSearchingEmail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const token = localStorage.getItem('admin_token')
      const tiendaData = localStorage.getItem('admin_tienda')
      const domain = tiendaData ? JSON.parse(tiendaData).dominio : 'localhost'

      if (!token) {
        throw new Error('No autenticado')
      }

      // Preparar el payload: usar clienteId si está disponible, sino usar codigoQr
      const payload: any = {
        importe: parseFloat(importe),
        notas: notas.trim() || undefined,
      }

      if (clienteId) {
        payload.clienteId = clienteId
      } else if (codigoQr) {
        payload.codigoQr = codigoQr.trim()
      }

      const response = await fetch(`${API_URL}/api/admin/compras/registrar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
        throw new Error(errorData.message || `Error ${response.status}`)
      }

      const data = await response.json()
      setSuccessData(data)
      setSuccess(true)

      // Resetear formulario
      setTimeout(() => {
        setCodigoQr('')
        setImporte('')
        setNotas('')
        setSuccess(false)
        setSuccessData(null)
        onSuccess?.()
        onOpenChange(false)
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Error al registrar la venta')
    } finally {
      setLoading(false)
    }
  }

  const resetearFormulario = () => {
    setPaso(1)
    setCodigoQr('')
    setClienteId('')
    setImporte('')
    setNotas('')
    setEmail('')
    setClienteEncontrado(null)
    setEmailError('')
    setScannerError('')
    setError('')
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetearFormulario()
      onOpenChange(open)
    }}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {paso === 1 ? 'Paso 1: Identificar Cliente' : 'Paso 2: Registrar Venta'}
          </DialogTitle>
          <DialogDescription>
            {paso === 1
              ? 'Escanea el QR o busca por email'
              : `Venta para ${clienteEncontrado?.nombre || 'cliente'}`
            }
          </DialogDescription>
        </DialogHeader>

        {success && successData ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 mx-auto" style={{ color: hexToRgb(branding.color_acento) }} />
            <div>
              <h3 className="font-semibold">¡Venta registrada!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {successData.cliente.nombre}
              </p>
              <p className="text-sm text-muted-foreground">
                €{successData.importe.toFixed(2)}
              </p>
              <p className="text-lg font-bold mt-2" style={{ color: hexToRgb(branding.color_acento) }}>
                +{successData.puntos_otorgados} puntos
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total: {successData.puntos_totales_cliente} puntos
              </p>
            </div>
          </div>
        ) : paso === 1 ? (
          // PASO 1: Identificar Cliente
          <div className="space-y-4">
            <Tabs defaultValue="qr" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr">
                  <QrCode className="h-4 w-4 mr-2" />
                  Escanear QR
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="h-4 w-4 mr-2" />
                  Por Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="space-y-3 mt-4">
                {/* Selector de modo: Cámara o Manual */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={scannerMode === 'camera' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScannerMode('camera')}
                    className={`flex-1 ${scannerMode === 'camera' ? 'text-white' : ''}`}
                    style={scannerMode === 'camera' ? { backgroundColor: hexToRgb(branding.color_primario) } : {}}
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Cámara
                  </Button>
                  <Button
                    type="button"
                    variant={scannerMode === 'manual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setScannerMode('manual')}
                    className={`flex-1 ${scannerMode === 'manual' ? 'text-white' : ''}`}
                    style={scannerMode === 'manual' ? { backgroundColor: hexToRgb(branding.color_primario) } : {}}
                  >
                    <Keyboard className="h-4 w-4 mr-1" />
                    Manual
                  </Button>
                </div>

                {/* Escáner de cámara */}
                {scannerMode === 'camera' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Escanea el QR del cliente</Label>
                    <div className="border-2 rounded-lg overflow-hidden bg-black" style={{ maxWidth: '220px', margin: '0 auto' }}>
                      <QrReader
                        constraints={{ facingMode: 'environment' }}
                        onResult={handleScan}
                        videoStyle={{ width: '100%', objectFit: 'cover' }}
                        containerStyle={{ paddingTop: '100%', position: 'relative' }}
                      />
                    </div>
                    {scannerError && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription className="text-xs">{scannerError}</AlertDescription>
                      </Alert>
                    )}
                    <p className="text-xs text-muted-foreground text-center">
                      Apunta la cámara al QR
                    </p>
                  </div>
                )}

                {/* Input manual */}
                {scannerMode === 'manual' && (
                  <div className="space-y-2">
                    <Label htmlFor="codigoQr">Código QR del cliente</Label>
                    <Input
                      id="codigoQr"
                      placeholder="Pega el código QR aquí"
                      value={codigoQr}
                      onChange={(e) => setCodigoQr(e.target.value)}
                      required
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      El cliente debe mostrar su QR desde la app
                    </p>
                  </div>
                )}

                {/* Mostrar código escaneado */}
                {codigoQr && (
                  <Alert className="py-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      QR detectado: <code className="font-mono">{codigoQr.substring(0, 12)}...</code>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="email" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email del cliente</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="cliente@ejemplo.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setEmailError('')
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleBuscarPorEmail()
                        }
                      }}
                      disabled={searchingEmail}
                    />
                    <Button
                      type="button"
                      onClick={handleBuscarPorEmail}
                      disabled={searchingEmail || !email.trim()}
                      style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                      className="text-white"
                    >
                      {searchingEmail ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Buscar'
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Introduce el email del cliente registrado
                  </p>
                </div>

                {emailError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-xs">{emailError}</AlertDescription>
                  </Alert>
                )}

                {clienteEncontrado && (
                  <Alert className="py-3">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">{clienteEncontrado.nombre}</p>
                        <p className="text-xs text-muted-foreground">{clienteEncontrado.email}</p>
                        <p className="text-xs" style={{ color: hexToRgb(branding.color_acento) }}>
                          {clienteEncontrado.puntos_totales} puntos acumulados
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={!clienteEncontrado}
                onClick={() => setPaso(2)}
                className="text-white"
                style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              >
                Continuar
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // PASO 2: Registrar Venta
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="importe">Importe (€)</Label>
              <Input
                id="importe"
                type="number"
                step="0.01"
                min="0"
                placeholder="25.00"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea
                id="notas"
                placeholder="Descripción de la compra..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaso(1)}
                disabled={loading}
              >
                Atrás
              </Button>
              <Button
                type="submit"
                disabled={loading || !importe || parseFloat(importe) <= 0}
                className="text-white"
                style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Registrar Venta'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
