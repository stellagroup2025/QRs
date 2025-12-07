"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge as BadgeUI } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useConfirmDialog } from "@/hooks/use-confirm-dialog"
import QRCode from 'qrcode'
import { BrandLogo } from '@/components/BrandLogo'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { motion, AnimatePresence } from "framer-motion"
import { Gift, Ticket, ArrowRight, Download, Copy, Badge, Users, Share2, Sparkles, QrCode, RotateCw, Wallet, Star } from 'lucide-react'
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
  const { confirm } = useConfirmDialog()

  useEffect(() => {
    loadClienteData()
  }, [])

  useEffect(() => {
    // Verificar si debe mostrarse el popup de referidos
    if (datosReferidos && !isLoading) {
      checkReferidosPopup()
    }
  }, [datosReferidos, isLoading])

  const checkReferidosPopup = () => {
    const POPUP_KEY = `referidos_popup_${slug}`
    const lastShown = localStorage.getItem(POPUP_KEY)

    if (!lastShown) {
      // Primera vez - mostrar inmediatamente
      setShowReferidosPopup(true)
      localStorage.setItem(POPUP_KEY, new Date().toISOString())
    } else {
      // Verificar si ha pasado 1 mes (30 días)
      const lastShownDate = new Date(lastShown)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - lastShownDate.getTime()) / (1000 * 60 * 60 * 24))

      const DIAS_INTERVALO = 30

      if (daysDiff >= DIAS_INTERVALO) {
        setShowReferidosPopup(true)
        localStorage.setItem(POPUP_KEY, now.toISOString())
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

        if (referidosResponse.ok) {
          const referidosData = await referidosResponse.json()
          setDatosReferidos(referidosData)

          // Generar QR del código de referido
          if (referidosData.url) {
            const qrReferidoData = await QRCode.toDataURL(referidosData.url, { width: 400 })
            setQrReferidoUrl(qrReferidoData)
          }
        }
      } catch (error) {
        // Error silencioso - referidos es funcionalidad opcional
      }

      // Generar QR Code con URL que abre directamente añadir venta
      const baseUrl = window.location.origin
      const qrData = `${baseUrl}/admin/dashboard?open_sale=true&cliente_id=${clienteData.id}`
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

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: '¿Cerrar sesión?',
      description: 'Tendrás que volver a iniciar sesión para acceder a tu cuenta.',
      confirmText: 'Cerrar sesión',
    })
    if (!confirmed) return

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
        <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                <div>
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
            </div>
            {/* Puntos skeleton */}
            <div className="bg-white rounded-lg p-6">
              <div className="text-center">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto mb-4" />
                <div className="h-16 w-32 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mx-auto" />
              </div>
            </div>
            {/* QR y cards skeleton */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="h-48 w-48 bg-gray-200 rounded animate-pulse mx-auto" />
              </div>
              <div className="bg-white rounded-lg p-6">
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="space-y-3">
                  <div className="h-20 bg-gray-100 rounded animate-pulse" />
                  <div className="h-20 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
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
      <div className="min-h-screen p-4 pb-28 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Header con Saludo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center"
          >
            <div className="flex items-center space-x-4">
              <BrandLogo width={40} height={40} className="rounded-xl shadow-sm" />
              <div>
                <p className="text-sm text-muted-foreground font-medium">Bienvenido de nuevo,</p>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                  {cliente.nombre}
                </h1>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <RotateCw className="h-5 w-5 text-muted-foreground" />
            </Button>
          </motion.div>

          {/* Hero Card: Puntos y Wallet */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl shadow-xl"
          >
            {/* Background Gradient dinámico basado en branding */}
            <div
              className="absolute inset-0 opacity-90"
              style={{
                background: `linear-gradient(135deg, ${hexToRgb(branding.color_primario)} 0%, ${hexToRgb(branding.color_acento)} 100%)`
              }}
            />
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="relative p-8 text-white">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-white/80 font-medium mb-1 flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> Balance Total
                  </p>
                  <h2 className="text-5xl md:text-6xl font-black tracking-tight flex items-baseline gap-2">
                    {cliente.puntos_totales}
                    <span className="text-2xl font-medium opacity-80">pts</span>
                  </h2>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                  <Star className="h-8 w-8 text-yellow-300 fill-yellow-300 animate-pulse" />
                </div>
              </div>

              {/* Barra de progreso simulada para próximo nivel/recompensa */}
              <div className="bg-black/20 rounded-full h-2 mb-2 overflow-hidden backdrop-blur-sm">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "70%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-white/90 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                />
              </div>
              <div className="flex justify-between text-xs font-medium text-white/80">
                <span>Nivel Actual</span>
                <span>Siguiente recompensa a 50 pts</span>
              </div>
            </div>
          </motion.div>

          {/* QR Code Section - Flip Card Animation */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative h-[400px] perspective-1000 group">
              <motion.div
                className="w-full h-full relative preserve-3d cursor-pointer transition-all duration-500"
                initial={false}
                animate={{ rotateY: showQRDialog ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                onClick={() => setShowQRDialog(!showQRDialog)}
              >
                {/* FRONT: QR Code */}
                <div className="absolute inset-0 backface-hidden">
                  <Card className="h-full border-0 shadow-lg bg-white overflow-hidden relative">
                    {/* Decorative corner */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-gray-50/50 rounded-bl-full -mr-16 -mt-16 z-0" />

                    <CardHeader className="relative z-10 pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <QrCode className="h-5 w-5" style={{ color: hexToRgb(branding.color_primario) }} />
                        Tu Código QR
                      </CardTitle>
                      <CardDescription>Toca para ver detalles o ampliar</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 flex flex-col items-center justify-center h-[calc(100%-5rem)] space-y-4">
                      {qrCodeUrl ? (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
                        >
                          <img
                            src={qrCodeUrl}
                            alt="Tu código QR"
                            className="w-48 h-48 md:w-54 md:h-54 object-contain"
                          />
                        </motion.div>
                      ) : (
                        <div className="w-48 h-48 bg-gray-100 rounded-xl animate-pulse" />
                      )}
                      <p className="text-xs font-mono text-muted-foreground bg-gray-50 px-3 py-1 rounded-full border">
                        Tap to flip ↻
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* BACK: User Details & Actions */}
                <div
                  className="absolute inset-0 backface-hidden h-full rotate-y-180"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <Card className="h-full border-0 shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ background: `radial-gradient(circle at center, ${hexToRgb(branding.color_primario)}, transparent)` }}
                    />

                    <CardHeader className="relative z-10 text-center pb-2">
                      <CardTitle className="text-white">Tu Identificación</CardTitle>
                      <CardDescription className="text-gray-400">ID de Cliente Seguro</CardDescription>
                    </CardHeader>

                    <CardContent className="relative z-10 flex flex-col items-center justify-center h-[calc(100%-5rem)] space-y-6">
                      <div className="text-center space-y-1">
                        <p className="text-sm text-gray-400">ID Cliente</p>
                        <p className="font-mono text-xl tracking-widest font-bold text-white bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
                          {cliente.id.substring(0, 8)}...
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 w-full">
                        <Button
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); handleDownloadQR(); }}
                          className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent backdrop-blur-md"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Guardar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); handleCopyID(); }}
                          className="w-full border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent backdrop-blur-md"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 cursor-pointer hover:text-white transition-colors" onClick={() => setShowQRDialog(false)}>
                        <RotateCw className="h-3 w-3" /> Volver al QR
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </div>

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
                      aria-label="Copiar código de referido"
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
                      aria-label="Copiar código"
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
