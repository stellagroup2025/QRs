"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge as BadgeUI } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import QRCode from 'qrcode'
import { BrandLogo } from '@/components/BrandLogo'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { Gift, Ticket, ArrowRight, Download, Copy, Badge, Users, Share2, Sparkles, QrCode } from 'lucide-react'
import Link from 'next/link'
import { ClientNav } from '@/components/ClientNav'
import { TiendaInfoCard } from '@/components/TiendaInfoCard'

interface Cliente {
  id: string
  nombre: string
  email: string
  telefono?: string
  puntos_totales: number
  fecha_registro: string
  ultima_visita?: string
  codigo_referido_personal?: string
}

interface Promocion {
  id: string
  activa: boolean
}

interface DatosReferidos {
  codigo: string
  url: string
  total_referidos: number
}

interface Compra {
  id: string
  fecha: string
  importe: number
  puntos_otorgados: number
  notas?: string
}

export default function MiPerfilPage() {
  const params = useParams()
  const slug = params.slug as string
  const { branding } = useBrandingContext()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [compras, setCompras] = useState<Compra[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [promocionesCount, setPromocionesCount] = useState(0)
  const [canjesCount, setCanjesCount] = useState(0)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [showQRReferidoDialog, setShowQRReferidoDialog] = useState(false)
  const [showReferidosPopup, setShowReferidosPopup] = useState(false)
  const [qrReferidoUrl, setQrReferidoUrl] = useState<string>('')
  const [datosReferidos, setDatosReferidos] = useState<DatosReferidos | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadClienteData()
  }, [])

  useEffect(() => {
    // Verificar si debe mostrarse el popup de referidos
    if (datosReferidos && !isLoading) {
      console.log('🔍 Verificando popup de referidos...', { datosReferidos, isLoading })
      checkReferidosPopup()
    }
  }, [datosReferidos, isLoading])

  const checkReferidosPopup = () => {
    const POPUP_KEY = `referidos_popup_${slug}`
    const lastShown = localStorage.getItem(POPUP_KEY)

    console.log('🔍 CheckReferidosPopup:', { slug, POPUP_KEY, lastShown })

    if (!lastShown) {
      // Primera vez - mostrar inmediatamente
      console.log('✅ Primera vez - mostrando popup')
      console.log('🔄 Llamando a setShowReferidosPopup(true)')
      setShowReferidosPopup(true)
      localStorage.setItem(POPUP_KEY, new Date().toISOString())

      // Verificar que se actualizó
      setTimeout(() => {
        console.log('🔍 Estado actual de showReferidosPopup después de 100ms')
      }, 100)
    } else {
      // Verificar si ha pasado 1 mes (30 días)
      const lastShownDate = new Date(lastShown)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - lastShownDate.getTime()) / (1000 * 60 * 60 * 24))

      console.log('📅 Días desde último popup:', daysDiff)

      // TODO: Cambiar a 30 antes de producción (ahora es 7 para testing)
      const DIAS_INTERVALO = 7

      if (daysDiff >= DIAS_INTERVALO) {
        console.log(`✅ Han pasado ${DIAS_INTERVALO} días - mostrando popup`)
        setShowReferidosPopup(true)
        localStorage.setItem(POPUP_KEY, now.toISOString())
      } else {
        console.log(`⏳ Aún no han pasado ${DIAS_INTERVALO} días, faltan:`, DIAS_INTERVALO - daysDiff, 'días')
        console.log('💡 TIP: Para testear, ejecuta en consola: localStorage.removeItem("' + POPUP_KEY + '")')
      }
    }
  }

  const handleCloseReferidosPopup = () => {
    setShowReferidosPopup(false)
  }

  const handleResetPopupReferidos = () => {
    const POPUP_KEY = `referidos_popup_${slug}`
    localStorage.removeItem(POPUP_KEY)
    toast({
      title: "Popup reiniciado",
      description: "Recarga la página para ver el popup de nuevo",
    })
  }

  const loadClienteData = async () => {
    try {
      const token = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem('client_token')
      if (!token) {
        toast({
          title: "No autenticado",
          description: "Por favor inicia sesión",
          variant: "destructive",
        })
        router.push(`/${slug}/login`)
        return
      }

      // Guardar el token con ambos formatos para compatibilidad
      localStorage.setItem('client_token', token)
      localStorage.setItem(`client_token_${slug}`, token)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

      // Obtener datos del cliente
      const clienteResponse = await fetch(`${API_URL}/api/clientes/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      })

      if (!clienteResponse.ok) {
        throw new Error('Error al obtener datos del cliente')
      }

      const clienteData = await clienteResponse.json()
      setCliente(clienteData)

      // Obtener puntos y compras
      const puntosResponse = await fetch(`${API_URL}/api/clientes/me/puntos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      })

      if (!puntosResponse.ok) {
        throw new Error('Error al obtener puntos')
      }

      const puntosData = await puntosResponse.json()
      setCompras(puntosData.ultima_compras || [])

      // Obtener promociones disponibles
      try {
        const promocionesResponse = await fetch(`${API_URL}/api/clientes/promociones`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Domain': slug,
          },
        })
        if (promocionesResponse.ok) {
          const promocionesData = await promocionesResponse.json()
          // Ya vienen filtradas como activas desde el backend
          setPromocionesCount(promocionesData.length)
        }
      } catch (error) {
        console.error('Error al cargar promociones:', error)
      }

      // Obtener canjes del usuario
      try {
        const canjesResponse = await fetch(`${API_URL}/api/clientes/mis-canjes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Domain': slug,
          },
        })
        if (canjesResponse.ok) {
          const canjesData = await canjesResponse.json()
          setCanjesCount(canjesData.length || 0)
        }
      } catch (error) {
        console.error('Error al cargar canjes:', error)
      }

      // Obtener datos de referidos
      try {
        const referidosResponse = await fetch(`${API_URL}/api/referidos/mi-codigo`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Domain': slug,
          },
        })
        console.log('📡 Respuesta referidos:', referidosResponse.status)

        if (referidosResponse.ok) {
          const referidosData = await referidosResponse.json()
          console.log('✅ Datos de referidos cargados:', referidosData)
          setDatosReferidos(referidosData)

          // Generar QR del código de referido
          if (referidosData.url) {
            const qrReferidoData = await QRCode.toDataURL(referidosData.url, { width: 400 })
            setQrReferidoUrl(qrReferidoData)
          }
        } else {
          console.error('❌ Error al obtener referidos:', await referidosResponse.text())
        }
      } catch (error) {
        console.error('💥 Error al cargar datos de referidos:', error)
      }

      // Generar QR Code con URL que abre directamente añadir venta
      // Si se escanea desde cámara normal del móvil, abre el admin con este cliente preseleccionado
      const baseUrl = window.location.origin
      const qrData = `${baseUrl}/admin/quick-sale?cliente_id=${clienteData.id}`
      const qrUrl = await QRCode.toDataURL(qrData, { width: 300 })
      setQrCodeUrl(qrUrl)

      setIsLoading(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar tus datos",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('client_token')
    localStorage.removeItem(`client_token_${slug}`)
    localStorage.removeItem('client_data')
    router.push('/login')
  }

  const handleDownloadQR = () => {
    if (!qrCodeUrl || !cliente) return

    const link = document.createElement('a')
    link.download = `mi-qr-${cliente.nombre.replace(/\s+/g, '-')}.png`
    link.href = qrCodeUrl
    link.click()

    toast({
      title: "QR descargado",
      description: "Tu código QR ha sido descargado",
    })
  }

  const handleCopyID = async () => {
    if (!cliente) return

    try {
      await navigator.clipboard.writeText(cliente.id)
      toast({
        title: "ID copiado",
        description: "Tu ID de cliente ha sido copiado al portapapeles",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el ID",
        variant: "destructive",
      })
    }
  }

  const handleCompartirCodigo = async () => {
    if (!datosReferidos) return

    const mensaje = `¡Únete a ${branding.nombre_tienda || 'nuestro programa de fidelización'}! Usa mi código ${datosReferidos.codigo} y ambos ganaremos puntos. ${datosReferidos.url}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Únete a ${branding.nombre_tienda}`,
          text: mensaje,
        })
      } catch (error) {
        // Usuario canceló o error
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(mensaje)
        toast({
          title: "¡Copiado!",
          description: "El mensaje ha sido copiado. Pégalo donde quieras compartirlo",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo copiar el mensaje",
          variant: "destructive",
        })
      }
    }
  }

  const handleCopiarCodigo = async () => {
    if (!datosReferidos) return

    try {
      await navigator.clipboard.writeText(datosReferidos.codigo)
      toast({
        title: "¡Código copiado!",
        description: "Tu código de referido ha sido copiado al portapapeles",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el código",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  if (isLoading) {
    return (
      <>
        <ClientNav />
        <div className="min-h-screen flex items-center justify-center">
          <p>Cargando...</p>
        </div>
      </>
    )
  }

  if (!cliente) {
    return null
  }

  return (
    <>
      <ClientNav />
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <BrandLogo width={120} height={40} />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: hexToRgb(branding.color_primario) }}>Mi Perfil</h1>
              <p className="text-muted-foreground">¡Hola, {cliente.nombre}!</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            style={{
              borderColor: hexToRgb(branding.color_primario),
              color: hexToRgb(branding.color_primario)
            }}
          >
            Cerrar sesión
          </Button>
        </div>

        {/* Puntos Destacados - Primero en móvil */}
        <Card className="bg-gradient-to-br from-white to-gray-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Mis Puntos</p>
              <p className="text-6xl md:text-7xl font-bold mb-2" style={{ color: hexToRgb(branding.color_primario) }}>{cliente.puntos_totales}</p>
              <p className="text-sm text-muted-foreground">puntos disponibles</p>
            </div>
          </CardContent>
        </Card>

        {/* QR Code - Compacto en móvil, completo en desktop */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code Card */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Tu Código QR</CardTitle>
              <CardDescription>
                Muestra este código al realizar compras
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                {qrCodeUrl && (
                  <div className="relative">
                    <div
                      className="relative cursor-pointer active:scale-95 transition-transform"
                      onClick={() => setShowQRDialog(true)}
                    >
                      <img
                        src={qrCodeUrl}
                        alt="Tu código QR"
                        className="w-48 h-48 md:w-64 md:h-64 border-4 rounded-lg shadow-lg"
                        style={{ borderColor: hexToRgb(branding.color_primario) }}
                      />
                    </div>
                    {/* Indicador visual permanente */}
                    <div
                      className="mt-2 flex items-center justify-center gap-2 text-sm font-medium cursor-pointer"
                      style={{ color: hexToRgb(branding.color_primario) }}
                      onClick={() => setShowQRDialog(true)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                      <span>Toca para ampliar</span>
                    </div>
                  </div>
                )}
                <p className="mt-2 text-xs text-muted-foreground font-mono">
                  ID: {cliente.id.substring(0, 8)}...
                </p>
              </div>

              {/* Botones de acción */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleDownloadQR}
                  className="w-full"
                  style={{
                    borderColor: hexToRgb(branding.color_primario),
                    color: hexToRgb(branding.color_primario)
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyID}
                  className="w-full"
                  style={{
                    borderColor: hexToRgb(branding.color_acento),
                    color: hexToRgb(branding.color_acento)
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar ID
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Información de Puntos - Solo en desktop */}
          <Card className="h-full hidden md:block">
            <CardHeader>
              <CardTitle>Usa tus puntos</CardTitle>
              <CardDescription>Beneficios disponibles</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-center h-[calc(100%-5rem)]">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-purple-900 mb-2">
                    ✨ Beneficios
                  </h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Canjea por descuentos exclusivos</li>
                    <li>• Accede a promociones especiales</li>
                    <li>• Consigue regalos y premios</li>
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-sm text-blue-900 mb-2">
                    💡 Cómo acumular
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Muestra tu QR en cada compra</li>
                    <li>• Acumula puntos automáticamente</li>
                    <li>• Refiere amigos y gana más</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECCIÓN DESTACADA: Invita Amigos */}
        {datosReferidos && (
          <Card className="relative overflow-hidden border-2" style={{ borderColor: hexToRgb(branding.color_acento) }}>
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <Sparkles className="w-full h-full" style={{ color: hexToRgb(branding.color_acento) }} />
            </div>

            <CardHeader className="relative">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl flex items-center gap-3 mb-2">
                    <Users className="h-8 w-8" style={{ color: hexToRgb(branding.color_acento) }} />
                    ¡Invita Amigos y Gana!
                  </CardTitle>
                  <CardDescription className="text-base">
                    Comparte tu código y ambos ganarán puntos cuando se registren
                  </CardDescription>
                </div>
                {datosReferidos.total_referidos > 0 && (
                  <BadgeUI
                    className="text-white font-bold text-lg px-4 py-2"
                    style={{ backgroundColor: hexToRgb(branding.color_acento) }}
                  >
                    {datosReferidos.total_referidos} {datosReferidos.total_referidos === 1 ? 'amigo' : 'amigos'}
                  </BadgeUI>
                )}
              </div>
            </CardHeader>

            <CardContent className="relative space-y-6">
              {/* Código de Referido Destacado */}
              <div className="bg-gradient-to-br from-gray-50 to-white border-2 rounded-xl p-6 text-center" style={{ borderColor: hexToRgb(branding.color_acento) }}>
                <p className="text-sm text-muted-foreground mb-2 font-medium">Tu Código de Referido</p>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <p className="text-4xl md:text-5xl font-bold tracking-wider" style={{ color: hexToRgb(branding.color_acento) }}>
                    {datosReferidos.codigo}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopiarCodigo}
                    className="h-12 w-12"
                    style={{
                      borderColor: hexToRgb(branding.color_acento),
                      color: hexToRgb(branding.color_acento)
                    }}
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>

                {/* Botones de Compartir */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleCompartirCodigo}
                    className="text-white font-semibold flex-1 sm:flex-none"
                    style={{ backgroundColor: hexToRgb(branding.color_acento) }}
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Compartir Código
                  </Button>
                  <Button
                    onClick={() => setShowQRReferidoDialog(true)}
                    variant="outline"
                    className="flex-1 sm:flex-none font-semibold"
                    style={{
                      borderColor: hexToRgb(branding.color_acento),
                      color: hexToRgb(branding.color_acento)
                    }}
                  >
                    <QrCode className="h-5 w-5 mr-2" />
                    Mostrar QR
                  </Button>
                  <Link href={`/${slug}/mis-referidos`} className="flex-1 sm:flex-none">
                    <Button
                      variant="outline"
                      className="w-full"
                      style={{
                        borderColor: hexToRgb(branding.color_acento),
                        color: hexToRgb(branding.color_acento)
                      }}
                    >
                      Ver Mis Referidos
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Beneficios de Referir */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🎁</div>
                  <p className="font-semibold text-green-900 text-sm">Tú ganas puntos</p>
                  <p className="text-xs text-green-700 mt-1">Por cada amigo que se registre</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🎉</div>
                  <p className="font-semibold text-blue-900 text-sm">Tu amigo gana</p>
                  <p className="text-xs text-blue-700 mt-1">Puntos de bienvenida al registrarse</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🚀</div>
                  <p className="font-semibold text-purple-900 text-sm">Beneficios ilimitados</p>
                  <p className="text-xs text-purple-700 mt-1">Sin límite de referidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Acciones Rápidas */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link href={`/${slug}/promociones`}>
            <Card className="hover:shadow-lg transition-all cursor-pointer h-full" style={{ borderColor: hexToRgb(branding.color_primario), borderWidth: '2px' }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5" style={{ color: hexToRgb(branding.color_primario) }} />
                    Promociones
                  </div>
                  {promocionesCount > 0 && (
                    <BadgeUI
                      className="text-white font-bold px-3 py-1"
                      style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                    >
                      {promocionesCount}
                    </BadgeUI>
                  )}
                </CardTitle>
                <CardDescription>
                  {promocionesCount > 0
                    ? `${promocionesCount} ${promocionesCount === 1 ? 'promoción disponible' : 'promociones disponibles'} para canjear`
                    : 'Canjea tus puntos por descuentos y regalos'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full text-white" style={{ backgroundColor: hexToRgb(branding.color_primario) }}>
                  Ver Promociones
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/${slug}/mis-canjes`}>
            <Card className="hover:shadow-lg transition-all cursor-pointer h-full" style={{ borderColor: hexToRgb(branding.color_acento), borderWidth: '2px' }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" style={{ color: hexToRgb(branding.color_acento) }} />
                    Mis Cupones
                  </div>
                  {canjesCount > 0 && (
                    <BadgeUI
                      className="text-white font-bold px-3 py-1"
                      style={{ backgroundColor: hexToRgb(branding.color_acento) }}
                    >
                      {canjesCount}
                    </BadgeUI>
                  )}
                </CardTitle>
                <CardDescription>
                  {canjesCount > 0
                    ? `Tienes ${canjesCount} ${canjesCount === 1 ? 'cupón canjeado' : 'cupones canjeados'}`
                    : 'Revisa tus cupones canjeados'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full text-white" style={{ backgroundColor: hexToRgb(branding.color_acento) }}>
                  Ver Cupones
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{cliente.email}</p>
              </div>
              {cliente.telefono && (
                <div>
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="font-medium">{cliente.telefono}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Miembro desde</p>
                <p className="font-medium">{formatDate(cliente.fecha_registro)}</p>
              </div>
              {cliente.ultima_visita && (
                <div>
                  <p className="text-sm text-muted-foreground">Última visita</p>
                  <p className="font-medium">{formatDate(cliente.ultima_visita)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Historial de Compras */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Compras</CardTitle>
            <CardDescription>Últimas 10 compras realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            {compras.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aún no has realizado ninguna compra
              </p>
            ) : (
              <div className="space-y-4">
                {compras.map((compra) => (
                  <div
                    key={compra.id}
                    className="flex justify-between items-center p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{formatDate(compra.fecha)}</p>
                      {compra.notas && (
                        <p className="text-sm text-muted-foreground">{compra.notas}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(compra.importe)}</p>
                      <p className="text-sm font-medium" style={{ color: hexToRgb(branding.color_acento) }}>+{compra.puntos_otorgados} puntos</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Información de la Tienda */}
        <TiendaInfoCard slug={slug} />
      </div>

      {/* Dialog QR Ampliado */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center" style={{ color: hexToRgb(branding.color_primario) }}>
              Tu Código QR
            </DialogTitle>
            <DialogDescription className="text-center">
              Muestra este código al cajero para acumular puntos
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6 space-y-6">
            {qrCodeUrl && (
              <div className="bg-white p-6 rounded-lg shadow-2xl">
                <img
                  src={qrCodeUrl}
                  alt="Tu código QR ampliado"
                  className="w-80 h-80 border-4 rounded-lg"
                  style={{ borderColor: hexToRgb(branding.color_primario) }}
                />
              </div>
            )}
            <div className="text-center space-y-2">
              <p className="text-lg font-bold" style={{ color: hexToRgb(branding.color_primario) }}>
                {cliente.nombre}
              </p>
              <p className="text-sm text-muted-foreground font-mono">
                ID: {cliente.id}
              </p>
              <div className="pt-4">
                <p className="text-3xl font-bold" style={{ color: hexToRgb(branding.color_acento) }}>
                  {cliente.puntos_totales} pts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full pt-4">
              <Button
                variant="outline"
                onClick={handleDownloadQR}
                className="w-full"
                style={{
                  borderColor: hexToRgb(branding.color_primario),
                  color: hexToRgb(branding.color_primario)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyID}
                className="w-full"
                style={{
                  borderColor: hexToRgb(branding.color_acento),
                  color: hexToRgb(branding.color_acento)
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar ID
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog QR de Referido */}
      {datosReferidos && (
        <Dialog open={showQRReferidoDialog} onOpenChange={setShowQRReferidoDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl" style={{ color: hexToRgb(branding.color_acento) }}>
                QR para Invitar Amigos
              </DialogTitle>
              <DialogDescription className="text-center">
                Tus amigos pueden escanear este código para registrarse
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center py-6 space-y-6">
              {qrReferidoUrl && (
                <div className="bg-white p-6 rounded-lg shadow-2xl">
                  <img
                    src={qrReferidoUrl}
                    alt="QR código de referido"
                    className="w-80 h-80 border-4 rounded-lg"
                    style={{ borderColor: hexToRgb(branding.color_acento) }}
                  />
                </div>
              )}
              <div className="text-center space-y-3 w-full">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 rounded-lg p-4" style={{ borderColor: hexToRgb(branding.color_acento) }}>
                  <p className="text-sm text-muted-foreground mb-1">Tu código de referido</p>
                  <p className="text-3xl font-bold tracking-wider" style={{ color: hexToRgb(branding.color_acento) }}>
                    {datosReferidos.codigo}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    <Users className="h-4 w-4" />
                    {datosReferidos.total_referidos} {datosReferidos.total_referidos === 1 ? 'amigo referido' : 'amigos referidos'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full pt-4">
                <Button
                  variant="outline"
                  onClick={handleCompartirCodigo}
                  className="w-full"
                  style={{
                    borderColor: hexToRgb(branding.color_acento),
                    color: hexToRgb(branding.color_acento)
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopiarCodigo}
                  className="w-full"
                  style={{
                    borderColor: hexToRgb(branding.color_acento),
                    color: hexToRgb(branding.color_acento)
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Código
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
                <p className="text-sm text-blue-900 font-semibold mb-2 text-center">
                  💡 ¿Cómo funciona?
                </p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Muestra este QR a tus amigos</li>
                  <li>• Ellos lo escanean y se registran</li>
                  <li>• ¡Ambos ganan puntos automáticamente!</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Popup Promocional de Referidos - Se muestra automáticamente */}
      {datosReferidos && (
        <Dialog open={showReferidosPopup} onOpenChange={setShowReferidosPopup}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex flex-col items-center space-y-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-50"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                </div>
                <DialogTitle className="text-center text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ¡Gana Puntos Invitando Amigos!
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Código destacado */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 text-center">
                <p className="text-sm text-purple-700 mb-2 font-medium">Tu código personal</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-4xl font-bold tracking-widest bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {datosReferidos.codigo}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopiarCodigo}
                    className="h-10 w-10 border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Beneficios con animación */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                    🎁
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Tú ganas puntos</p>
                    <p className="text-sm text-green-700">Por cada amigo que se registre con tu código</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl">
                    🎉
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">Tu amigo también gana</p>
                    <p className="text-sm text-blue-700">Puntos de bienvenida al registrarse</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                    ♾️
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-purple-900">Sin límites</p>
                    <p className="text-sm text-purple-700">Invita a todos tus amigos, ¡no hay máximo!</p>
                  </div>
                </div>
              </div>

              {/* Estadística si tiene referidos */}
              {datosReferidos.total_referidos > 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-800 mb-1">¡Vas muy bien! 🎊</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    Ya has invitado a {datosReferidos.total_referidos} {datosReferidos.total_referidos === 1 ? 'amigo' : 'amigos'}
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => {
                    handleCompartirCodigo()
                    setShowReferidosPopup(false)
                  }}
                  className="text-white font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
                <Button
                  onClick={() => {
                    setShowReferidosPopup(false)
                    setShowQRReferidoDialog(true)
                  }}
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 font-semibold"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Ver QR
                </Button>
              </div>

              <Button
                onClick={handleCloseReferidosPopup}
                variant="ghost"
                className="w-full text-gray-500 hover:text-gray-700"
              >
                Ahora no
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Botón de desarrollo - Reiniciar popup de referidos */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={handleResetPopupReferidos}
          className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-600 text-white shadow-lg opacity-30 hover:opacity-100 transition-all z-50 flex items-center justify-center"
          title="Reiniciar popup de referidos (solo desarrollo)"
        >
          <Users className="h-6 w-6" />
        </button>
      )}
    </div>
    </>
  )
}
