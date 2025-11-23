'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Loader2,
  Search,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Tag,
  Receipt,
  Sparkles,
  Gift,
  Ticket,
  QrCode,
  Camera,
  Keyboard
} from 'lucide-react'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { useToast } from '@/hooks/use-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Cliente {
  id: string
  nombre: string
  email: string
  telefono?: string
  puntos_totales: number
}

interface Promocion {
  id: string
  titulo: string
  descripcion: string
  puntos_requeridos: number
  descuento_porcentaje?: number
  descuento_fijo?: number
}

interface Cupon {
  id: string
  promocion_id: string
  estado: string
  titulo: string
  descripcion: string
  descuento_porcentaje?: number
  descuento_fijo?: number
}

interface RegistrarVentaDialogMejoradoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RegistrarVentaDialogMejorado({
  open,
  onOpenChange,
  onSuccess
}: RegistrarVentaDialogMejoradoProps) {
  const { branding } = useBrandingContext()
  const { toast } = useToast()

  // Estados principales
  const [paso, setPaso] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Paso 1: Buscar cliente
  const [searchTerm, setSearchTerm] = useState('')
  const [searching, setSearching] = useState(false)
  const [clientesSugeridos, setClientesSugeridos] = useState<Cliente[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)

  // Escáner QR
  const [scannerMode, setScannerMode] = useState<'camera' | 'manual'>('camera')
  const [codigoQr, setCodigoQr] = useState('')
  const [scannerError, setScannerError] = useState('')
  const scannerRef = useRef<any>(null)
  const qrReaderDivId = 'qr-reader'
  const [isScanning, setIsScanning] = useState(false)

  // Paso 2: Promociones y cupones
  const [loadingPromos, setLoadingPromos] = useState(false)
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [cupones, setCupones] = useState<Cupon[]>([])
  const [cuponSeleccionado, setCuponSeleccionado] = useState<Cupon | null>(null)
  const [redeeming, setRedeeming] = useState(false)
  const [redeemingPromoId, setRedeemingPromoId] = useState<string | null>(null)

  // Paso 3: Confirmar venta
  const [importe, setImporte] = useState('')
  const [notas, setNotas] = useState('')
  const [puntosGanados, setPuntosGanados] = useState(0)
  const [descuentoAplicado, setDescuentoAplicado] = useState(0)
  const [importeFinal, setImporteFinal] = useState(0)

  // Éxito
  const [success, setSuccess] = useState(false)
  const [successData, setSuccessData] = useState<any>(null)

  // Inicializar escáner QR cuando se selecciona modo cámara
  useEffect(() => {
    console.log('🔍 useEffect ejecutado - Estado:', { open, scannerMode, paso, isScanning })

    if (open && scannerMode === 'camera' && paso === 1 && !isScanning) {
      console.log('✅ Condiciones cumplidas, iniciando scanner...')

      const initScanner = async () => {
        try {
          console.log('📦 Importando html5-qrcode...')
          const { Html5Qrcode } = await import('html5-qrcode')
          console.log('✅ html5-qrcode importado correctamente')

          // Esperar un tick para que el DOM se renderice
          setTimeout(async () => {
            const element = document.getElementById(qrReaderDivId)
            console.log('🎯 Elemento DOM:', element ? 'ENCONTRADO' : 'NO ENCONTRADO')
            console.log('🎯 scannerRef.current:', scannerRef.current ? 'YA EXISTE' : 'LIBRE')

            if (element && !scannerRef.current) {
              try {
                console.log('🎥 Creando instancia de Html5Qrcode...')
                scannerRef.current = new Html5Qrcode(qrReaderDivId)

                console.log('📹 Iniciando cámara...')
                setIsScanning(true)

                await scannerRef.current.start(
                  { facingMode: "environment" }, // Usa cámara trasera en móviles
                  {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                  },
                  (decodedText, decodedResult) => {
                    // Éxito al escanear
                    console.log('✅ QR escaneado:', decodedText)
                    setCodigoQr(decodedText)
                    setScannerError('')

                    // Detener scanner antes de buscar cliente
                    if (scannerRef.current) {
                      scannerRef.current.stop().then(() => {
                        console.log('🛑 Scanner detenido')
                        scannerRef.current = null
                        setIsScanning(false)
                        buscarClientePorQr(decodedText)
                      }).catch(console.error)
                    }
                  },
                  (errorMessage) => {
                    // Errores normales durante escaneo (cuando no hay QR en vista)
                    // No hacer nada, es normal
                  }
                )

                console.log('✅✅✅ Cámara iniciada correctamente')
                setScannerError('')
              } catch (err: any) {
                console.error('❌ Error iniciando scanner:', err)
                setIsScanning(false)
                let errorMsg = 'Error al iniciar la cámara.'

                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                  errorMsg = 'Permiso de cámara denegado. Permite el acceso en la configuración de tu navegador.'
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                  errorMsg = 'No se encontró ninguna cámara en este dispositivo.'
                } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                  errorMsg = 'La cámara está siendo usada por otra aplicación.'
                } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
                  errorMsg = 'La cámara no cumple con los requisitos necesarios.'
                } else if (err.name === 'NotSupportedError') {
                  errorMsg = 'Tu navegador no soporta acceso a la cámara. Usa el modo Manual.'
                } else if (err.name === 'TypeError') {
                  errorMsg = 'Error de inicialización. Intenta recargar la página.'
                }

                setScannerError(errorMsg)
              }
            }
          }, 100)
        } catch (importError) {
          console.error('❌ Error importando html5-qrcode:', importError)
          setIsScanning(false)
          setScannerError('Error al cargar el escáner. Por favor, recarga la página.')
        }
      }

      initScanner()
    } else {
      console.log('❌ Condiciones NO cumplidas para iniciar scanner')
    }

    // Limpiar el scanner cuando el modal se cierra o cambia de modo
    return () => {
      if (scannerRef.current && isScanning) {
        console.log('🧹 Limpiando scanner...')
        scannerRef.current.stop().then(() => {
          console.log('✅ Scanner limpiado')
          scannerRef.current = null
          setIsScanning(false)
        }).catch((err: any) => {
          console.error('Error limpiando scanner:', err)
          scannerRef.current = null
          setIsScanning(false)
        })
      }
    }
  }, [open, scannerMode, paso])

  // Detectar cliente preseleccionado desde QR (sessionStorage)
  useEffect(() => {
    if (open && paso === 1 && !clienteSeleccionado) {
      const preselectedClientId = sessionStorage.getItem('preselected_cliente_id')

      if (preselectedClientId) {
        console.log('🎯 Cliente preseleccionado detectado:', preselectedClientId)

        // Buscar y cargar el cliente automáticamente
        buscarClientePorQr(preselectedClientId)

        // Limpiar sessionStorage para que no se vuelva a usar
        sessionStorage.removeItem('preselected_cliente_id')
      }
    }
  }, [open, paso, clienteSeleccionado])

  // Auto-buscar clientes mientras escribe
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const debounce = setTimeout(() => {
        buscarClientes()
      }, 300)
      return () => clearTimeout(debounce)
    } else {
      setClientesSugeridos([])
    }
  }, [searchTerm])

  // Calcular puntos y descuento en tiempo real
  useEffect(() => {
    if (importe && !isNaN(parseFloat(importe))) {
      const importeNum = parseFloat(importe)

      // Calcular puntos (1 punto por cada euro)
      const puntos = Math.floor(importeNum)
      setPuntosGanados(puntos)

      // Calcular descuento si hay cupón seleccionado
      let descuento = 0
      if (cuponSeleccionado) {
        if (cuponSeleccionado.descuento_porcentaje) {
          descuento = importeNum * (cuponSeleccionado.descuento_porcentaje / 100)
        } else if (cuponSeleccionado.descuento_fijo) {
          descuento = cuponSeleccionado.descuento_fijo
        }
      }
      setDescuentoAplicado(descuento)
      setImporteFinal(Math.max(0, importeNum - descuento))
    } else {
      setPuntosGanados(0)
      setDescuentoAplicado(0)
      setImporteFinal(0)
    }
  }, [importe, cuponSeleccionado])

  async function buscarClientes() {
    if (!searchTerm.trim()) return

    setSearching(true)
    try {
      const token = localStorage.getItem('admin_token')
      const tiendaData = localStorage.getItem('admin_tienda')
      const domain = tiendaData ? JSON.parse(tiendaData).dominio : 'localhost'

      const response = await fetch(
        `${API_URL}/api/admin/clientes?search=${encodeURIComponent(searchTerm.trim())}&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Domain': domain,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setClientesSugeridos(data.data || [])
      }
    } catch (err) {
      console.error('Error buscando clientes:', err)
    } finally {
      setSearching(false)
    }
  }

  async function buscarClientePorQr(qrCode: string) {
    setSearching(true)
    try {
      const token = localStorage.getItem('admin_token')
      const tiendaData = localStorage.getItem('admin_tienda')
      const domain = tiendaData ? JSON.parse(tiendaData).dominio : 'localhost'

      // Buscar cliente usando el endpoint de compras/registrar que acepta código QR
      // O podemos buscar en la lista de clientes si tienen código QR
      const response = await fetch(
        `${API_URL}/api/admin/clientes?limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Domain': domain,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        // Buscar cliente que coincida con el código QR
        const cliente = data.data?.find((c: any) => c.codigo_qr === qrCode || c.id === qrCode)

        if (cliente) {
          await seleccionarCliente(cliente)
        } else {
          toast({
            title: 'Cliente no encontrado',
            description: 'No se encontró ningún cliente con este código QR',
            variant: 'destructive'
          })
        }
      }
    } catch (err) {
      console.error('Error buscando cliente por QR:', err)
      toast({
        title: 'Error',
        description: 'Error al buscar el cliente',
        variant: 'destructive'
      })
    } finally {
      setSearching(false)
    }
  }

  async function buscarClientePorQrManual() {
    if (!codigoQr.trim()) {
      toast({
        title: 'Código vacío',
        description: 'Por favor ingresa o escanea un código QR',
        variant: 'destructive'
      })
      return
    }
    await buscarClientePorQr(codigoQr.trim())
  }

  async function seleccionarCliente(cliente: Cliente) {
    setClienteSeleccionado(cliente)
    setClientesSugeridos([])
    setSearchTerm('')

    // Cargar promociones y cupones del cliente
    await cargarPromocionesYCupones(cliente.id)

    // Avanzar al paso 2
    setPaso(2)
  }

  async function cargarPromocionesYCupones(clienteId: string) {
    setLoadingPromos(true)
    try {
      const token = localStorage.getItem('admin_token')
      const tiendaData = localStorage.getItem('admin_tienda')
      const domain = tiendaData ? JSON.parse(tiendaData).dominio : 'localhost'

      // Cargar promociones disponibles
      const promosResponse = await fetch(
        `${API_URL}/api/admin/promociones/disponibles`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Domain': domain,
          },
        }
      )

      if (promosResponse.ok) {
        const promosData = await promosResponse.json()
        setPromociones(promosData || [])
      }

      // Cargar cupones disponibles del cliente
      const cuponesResponse = await fetch(
        `${API_URL}/api/admin/clientes/${clienteId}/cupones-disponibles`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Domain': domain,
          },
        }
      )

      if (cuponesResponse.ok) {
        const cuponesData = await cuponesResponse.json()
        setCupones(cuponesData || [])
      }
    } catch (err) {
      console.error('Error cargando promociones:', err)
    } finally {
      setLoadingPromos(false)
    }
  }

  async function canjearPromocion(promocionId: string) {
    if (!clienteSeleccionado) return

    setRedeeming(true)
    setRedeemingPromoId(promocionId)

    try {
      const token = localStorage.getItem('admin_token')
      const tiendaData = localStorage.getItem('admin_tienda')
      const domain = tiendaData ? JSON.parse(tiendaData).dominio : 'localhost'

      const response = await fetch(
        `${API_URL}/api/admin/clientes/${clienteSeleccionado.id}/canjear-promocion`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Domain': domain,
          },
          body: JSON.stringify({ id_promocion: promocionId }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al canjear' }))
        throw new Error(errorData.message || `Error ${response.status}`)
      }

      const data = await response.json()

      toast({
        title: '¡Promoción canjeada!',
        description: 'El cupón está listo para usar en esta venta',
      })

      // Actualizar puntos del cliente
      setClienteSeleccionado({
        ...clienteSeleccionado,
        puntos_totales: data.puntos_restantes,
      })

      // Agregar el nuevo cupón a la lista y seleccionarlo automáticamente
      const nuevoCupon: Cupon = {
        id: data.cupon.id,
        promocion_id: data.cupon.promocion_id,
        estado: data.cupon.estado,
        titulo: data.cupon.titulo,
        descripcion: data.cupon.descripcion,
        descuento_porcentaje: data.cupon.descuento_porcentaje,
        descuento_fijo: data.cupon.descuento_fijo,
      }

      setCupones([nuevoCupon, ...cupones])
      setCuponSeleccionado(nuevoCupon)

      // Remover la promoción de la lista
      setPromociones(promociones.filter(p => p.id !== promocionId))
    } catch (err: any) {
      toast({
        title: 'Error al canjear',
        description: err.message || 'No se pudo canjear la promoción',
        variant: 'destructive',
      })
    } finally {
      setRedeeming(false)
      setRedeemingPromoId(null)
    }
  }

  async function handleSubmit() {
    if (!clienteSeleccionado || !importe) return

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('admin_token')
      const tiendaData = localStorage.getItem('admin_tienda')
      const domain = tiendaData ? JSON.parse(tiendaData).dominio : 'localhost'

      const payload: any = {
        clienteId: clienteSeleccionado.id,
        importe: parseFloat(importe),
        notas: notas.trim() || undefined,
      }

      // Si hay cupón seleccionado, incluirlo
      if (cuponSeleccionado) {
        payload.cuponId = cuponSeleccionado.id
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

      toast({
        title: '¡Venta registrada!',
        description: `+${data.puntos_otorgados} puntos para ${data.cliente.nombre}`,
      })

      // Resetear después de 2 segundos
      setTimeout(() => {
        resetearFormulario()
        onSuccess?.()
        onOpenChange(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Error al registrar la venta')
    } finally {
      setLoading(false)
    }
  }

  function resetearFormulario() {
    setPaso(1)
    setSearchTerm('')
    setClienteSeleccionado(null)
    setClientesSugeridos([])
    setScannerMode('camera')
    setCodigoQr('')
    setScannerError('')
    setPromociones([])
    setCupones([])
    setCuponSeleccionado(null)
    setRedeeming(false)
    setRedeemingPromoId(null)
    setImporte('')
    setNotas('')
    setError('')
    setSuccess(false)
    setSuccessData(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetearFormulario()
        onOpenChange(open)
      }}
    >
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {paso === 1 && <><User className="h-5 w-5" /> Paso 1: Buscar Cliente</>}
            {paso === 2 && <><Gift className="h-5 w-5" /> Paso 2: Promociones Disponibles</>}
            {paso === 3 && <><Receipt className="h-5 w-5" /> Paso 3: Confirmar Venta</>}
          </DialogTitle>
          <DialogDescription>
            {paso === 1 && 'Busca el cliente por nombre, email o teléfono'}
            {paso === 2 && `Cliente: ${clienteSeleccionado?.nombre || ''}`}
            {paso === 3 && 'Revisa los detalles antes de confirmar'}
          </DialogDescription>
        </DialogHeader>

        {success && successData ? (
          // Pantalla de éxito
          <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div
              className="h-16 w-16 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${hexToRgb(branding.color_acento)}20` }}
            >
              <CheckCircle2
                className="h-10 w-10"
                style={{ color: hexToRgb(branding.color_acento) }}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold">¡Venta Registrada!</h3>
              <p className="text-gray-600 mt-2">{successData.cliente.nombre}</p>
              <p className="text-2xl font-bold mt-1">€{successData.importe.toFixed(2)}</p>
              {successData.descuento_aplicado > 0 && (
                <p className="text-sm text-green-600">
                  Descuento: -€{successData.descuento_aplicado.toFixed(2)}
                </p>
              )}
              <div
                className="mt-4 p-3 rounded-lg"
                style={{ backgroundColor: `${hexToRgb(branding.color_acento)}10` }}
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: hexToRgb(branding.color_acento) }}
                >
                  +{successData.puntos_otorgados} puntos
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Total: {successData.puntos_totales_cliente} puntos
                </p>
              </div>
            </div>
          </div>
        ) : paso === 1 ? (
          // PASO 1: Buscar Cliente
          <div className="space-y-4">
            <Tabs defaultValue="search" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </TabsTrigger>
                <TabsTrigger value="qr">
                  <QrCode className="h-4 w-4 mr-2" />
                  Escanear QR
                </TabsTrigger>
              </TabsList>

              {/* TAB: Búsqueda por texto */}
              <TabsContent value="search" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="search" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Buscar cliente
                  </Label>
                  <div className="relative">
                    <Input
                      id="search"
                      type="text"
                      placeholder="Nombre, email o teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus
                      className="pr-10"
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Lista de sugerencias */}
                {clientesSugeridos.length > 0 && (
                  <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                    {clientesSugeridos.map((cliente) => (
                      <button
                        key={cliente.id}
                        type="button"
                        onClick={() => seleccionarCliente(cliente)}
                        className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{cliente.nombre}</p>
                          <p className="text-sm text-gray-600">{cliente.email}</p>
                          {cliente.telefono && (
                            <p className="text-xs text-gray-500">{cliente.telefono}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge
                            className="text-white"
                            style={{ backgroundColor: hexToRgb(branding.color_acento) }}
                          >
                            {cliente.puntos_totales} pts
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchTerm.length >= 2 && !searching && clientesSugeridos.length === 0 && (
                  <Alert>
                    <AlertDescription className="text-sm">
                      No se encontraron clientes con "{searchTerm}"
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* TAB: Escanear QR */}
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
                    <div
                      id={qrReaderDivId}
                      className="rounded-lg overflow-hidden border-2 border-gray-200"
                      style={{ minHeight: '300px', width: '100%' }}
                    />
                    {scannerError && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription className="text-xs">{scannerError}</AlertDescription>
                      </Alert>
                    )}
                    <p className="text-xs text-muted-foreground text-center">
                      Apunta la cámara al QR del cliente
                    </p>
                  </div>
                )}

                {/* Input manual */}
                {scannerMode === 'manual' && (
                  <div className="space-y-2">
                    <Label htmlFor="codigoQr">Código QR del cliente</Label>
                    <div className="flex gap-2">
                      <Input
                        id="codigoQr"
                        placeholder="Pega el código QR aquí"
                        value={codigoQr}
                        onChange={(e) => setCodigoQr(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            buscarClientePorQrManual()
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        type="button"
                        onClick={buscarClientePorQrManual}
                        disabled={searching || !codigoQr.trim()}
                        style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                        className="text-white"
                      >
                        {searching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Buscar'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      El cliente debe mostrar su QR desde la app
                    </p>
                  </div>
                )}

                {/* Mostrar código escaneado */}
                {codigoQr && !searching && (
                  <Alert className="py-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      QR detectado: <code className="font-mono">{codigoQr.substring(0, 12)}...</code>
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : paso === 2 ? (
          // PASO 2: Promociones y Cupones
          <div className="space-y-4">
            {loadingPromos ? (
              <div className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-600 mt-2">Cargando promociones...</p>
              </div>
            ) : (
              <>
                {/* Cupones disponibles */}
                {cupones.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Ticket className="h-4 w-4" />
                      Cupones Disponibles ({cupones.length})
                    </Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cupones.map((cupon) => (
                        <button
                          key={cupon.id}
                          type="button"
                          onClick={() => {
                            setCuponSeleccionado(cupon.id === cuponSeleccionado?.id ? null : cupon)
                          }}
                          className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                            cuponSeleccionado?.id === cupon.id
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{cupon.titulo}</p>
                              <p className="text-xs text-gray-600 mt-1">{cupon.descripcion}</p>
                            </div>
                            {cuponSeleccionado?.id === cupon.id && (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                            )}
                          </div>
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {cupon.descuento_porcentaje
                                ? `${cupon.descuento_porcentaje}% OFF`
                                : `€${cupon.descuento_fijo} OFF`
                              }
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promociones disponibles (canjeables) */}
                {promociones.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Promociones Activas ({promociones.length})
                    </Label>
                    <p className="text-xs text-gray-600">
                      Canjea una promoción por puntos para usar en esta venta
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {promociones.map((promo) => {
                        const puedeRedimir = clienteSeleccionado && clienteSeleccionado.puntos_totales >= promo.puntos_requeridos
                        const isRedeeming = redeemingPromoId === promo.id

                        return (
                          <button
                            key={promo.id}
                            type="button"
                            onClick={() => {
                              if (puedeRedimir && !redeeming) {
                                canjearPromocion(promo.id)
                              }
                            }}
                            disabled={!puedeRedimir || redeeming}
                            className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                              puedeRedimir
                                ? 'border-purple-200 bg-purple-50 hover:border-purple-400 hover:bg-purple-100 cursor-pointer'
                                : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                            } ${isRedeeming ? 'opacity-50' : ''}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{promo.titulo}</p>
                                <p className="text-xs text-gray-600 mt-1">{promo.descripcion}</p>
                              </div>
                              {isRedeeming && (
                                <Loader2 className="h-5 w-5 animate-spin text-purple-600 flex-shrink-0 ml-2" />
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  puedeRedimir ? 'border-purple-400 text-purple-700' : 'border-gray-300 text-gray-500'
                                }`}
                              >
                                {promo.puntos_requeridos} pts requeridos
                              </Badge>
                              {promo.descuento_porcentaje && (
                                <Badge className="text-xs bg-purple-100 text-purple-700">
                                  {promo.descuento_porcentaje}% OFF
                                </Badge>
                              )}
                              {promo.descuento_fijo && (
                                <Badge className="text-xs bg-purple-100 text-purple-700">
                                  €{promo.descuento_fijo} OFF
                                </Badge>
                              )}
                              {puedeRedimir && !isRedeeming && (
                                <Badge className="text-xs bg-green-100 text-green-700">
                                  ✓ Disponible
                                </Badge>
                              )}
                              {!puedeRedimir && (
                                <Badge className="text-xs bg-red-100 text-red-700">
                                  Puntos insuficientes
                                </Badge>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {cupones.length === 0 && promociones.length === 0 && (
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      No hay promociones o cupones disponibles en este momento
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaso(1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <Button
                type="button"
                onClick={() => setPaso(3)}
                className="text-white"
                style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          // PASO 3: Confirmar Venta
          <div className="space-y-4">
            {/* Resumen del cliente */}
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${hexToRgb(branding.color_primario)}10` }}
            >
              <p className="text-sm font-medium">{clienteSeleccionado?.nombre}</p>
              <p className="text-xs text-gray-600">{clienteSeleccionado?.email}</p>
              <p className="text-xs mt-1" style={{ color: hexToRgb(branding.color_acento) }}>
                {clienteSeleccionado?.puntos_totales} puntos disponibles
              </p>
            </div>

            {/* Cupón seleccionado */}
            {cuponSeleccionado && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm">
                  <span className="font-medium">Cupón aplicado:</span> {cuponSeleccionado.titulo}
                </AlertDescription>
              </Alert>
            )}

            {/* Importe */}
            <div className="space-y-2">
              <Label htmlFor="importe">Importe (€) *</Label>
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
                className="text-lg"
              />
            </div>

            {/* Preview de cálculos */}
            {importe && parseFloat(importe) > 0 && (
              <div
                className="p-4 rounded-lg space-y-2"
                style={{ backgroundColor: `${hexToRgb(branding.color_acento)}10` }}
              >
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-medium">€{parseFloat(importe).toFixed(2)}</span>
                </div>
                {descuentoAplicado > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Descuento:</span>
                    <span className="font-medium">-€{descuentoAplicado.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span style={{ color: hexToRgb(branding.color_primario) }}>
                    €{importeFinal.toFixed(2)}
                  </span>
                </div>
                <div
                  className="mt-3 pt-3 border-t flex justify-between items-center"
                  style={{ borderColor: hexToRgb(branding.color_acento) }}
                >
                  <span className="text-sm">Puntos a ganar:</span>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: hexToRgb(branding.color_acento) }}
                  >
                    +{puntosGanados}
                  </span>
                </div>
              </div>
            )}

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea
                id="notas"
                placeholder="Descripción de la compra..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaso(2)}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Atrás
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !importe || parseFloat(importe) <= 0}
                className="text-white"
                style={{ backgroundColor: hexToRgb(branding.color_acento) }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmar Venta
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
