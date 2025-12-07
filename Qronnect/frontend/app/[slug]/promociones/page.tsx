'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AnimatePresence, motion } from 'framer-motion'
import { Gift, Sparkles, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { ClientNav } from '@/components/ClientNav'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Promocion {
  id: string
  titulo: string
  descripcion: string
  tipo: 'descuento_fijo' | 'descuento_porcentaje' | 'producto_gratis'
  valor: number
  puntos_requeridos: number
  imagen_url?: string
  fecha_inicio: string
  fecha_fin?: string
  cantidad_disponible?: number
  cantidad_canjeada: number
  disponible: boolean
}

export default function PromocionesPage() {
  const params = useParams()
  const router = useRouter()
  const { branding } = useBrandingContext()
  const { confirm } = useConfirmDialog()
  const slug = params.slug as string

  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [loading, setLoading] = useState(true)
  const [misPuntos, setMisPuntos] = useState(0)
  const [canjeando, setCanjeando] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = localStorage.getItem(`client_token_${slug}`)
    if (!token) {
      router.push(`/${slug}/recuperar`)
      return
    }

    setLoading(true)
    try {
      // Obtener promociones disponibles
      const promosResponse = await fetch(`${API_URL}/api/clientes/promociones`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      })

      if (promosResponse.ok) {
        const promosData = await promosResponse.json()
        setPromociones(promosData)
      } else {
        console.error('Error al cargar promociones:', promosResponse.status)
        toast.error('Error al cargar promociones')
      }

      // Obtener mis puntos
      const puntosResponse = await fetch(`${API_URL}/api/clientes/me/puntos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      })

      if (puntosResponse.ok) {
        const puntosData = await puntosResponse.json()
        setMisPuntos(puntosData.puntos_totales)
      } else {
        console.error('Error al cargar puntos:', puntosResponse.status)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCanjear = async (promocion: Promocion) => {
    const token = localStorage.getItem(`client_token_${slug}`)
    if (!token) return

    if (misPuntos < promocion.puntos_requeridos) {
      toast.error('Puntos insuficientes', {
        description: `Te faltan ${promocion.puntos_requeridos - misPuntos} puntos para canjear esta promoción`
      })
      return
    }

    const confirmed = await confirm({
      title: '¿Canjear promoción?',
      description: `Usarás ${promocion.puntos_requeridos} puntos para obtener "${promocion.titulo}"`,
      confirmText: 'Canjear',
    })
    if (!confirmed) return

    setCanjeando(promocion.id)
    try {
      const response = await fetch(`${API_URL}/api/clientes/promociones/canjear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
        body: JSON.stringify({
          id_promocion: promocion.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al canjear promoción')
      }

      toast.success('¡Promoción canjeada!', {
        description: 'Encuentra tu cupón en "Mis Canjes"'
      })

      // Actualizar datos
      fetchData()

      // Redirigir a mis canjes
      router.push(`/${slug}/mis-canjes`)
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al canjear', {
        description: error.message || 'No se pudo canjear la promoción'
      })
    } finally {
      setCanjeando(null)
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'descuento_fijo': return 'Descuento'
      case 'descuento_porcentaje': return 'Descuento'
      case 'producto_gratis': return 'Gratis'
      default: return tipo
    }
  }

  const getValorLabel = (tipo: string, valor: number) => {
    switch (tipo) {
      case 'descuento_fijo': return `€${valor.toFixed(2)}`
      case 'descuento_porcentaje': return `${valor}%`
      case 'producto_gratis': return 'Gratis'
      default: return valor.toString()
    }
  }

  const puedeCanjear = (promocion: Promocion) => {
    return misPuntos >= promocion.puntos_requeridos && promocion.disponible
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-24 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-100 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <ClientNav />
      {/* Container Principal con padding-bottom para nav móvil */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pb-24">

        {/* Header Glassmorphism */}
        <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h1 className="text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                  Promociones
                </h1>
                <p className="text-sm text-muted-foreground">
                  Canjea tus puntos por recompensas exclusivas
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-right bg-white dark:bg-gray-800 p-2 pr-4 pl-3 rounded-full shadow-sm border flex items-center gap-3"
              >
                <div className="bg-primary/10 p-2 rounded-full">
                  <Sparkles className="h-4 w-4" style={{ color: hexToRgb(branding.color_primario) }} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tus puntos</p>
                  <p className="text-xl font-bold leading-none" style={{ color: hexToRgb(branding.color_primario) }}>
                    {misPuntos}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Promociones Grid - Masonry Layout */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {promociones.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-white/50 backdrop-blur-sm border-dashed border-2">
                <CardContent className="py-16 text-center">
                  <div className="mb-6 bg-gray-50 dark:bg-gray-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
                    <Gift className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No hay promociones activas</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Estamos preparando nuevas ofertas para ti. ¡Vuelve pronto para descubrir recompensas increíbles!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              <AnimatePresence>
                {promociones.map((promo, index) => {
                  const puedeCanjearlo = puedeCanjear(promo)
                  const puntosFaltantes = Math.max(0, promo.puntos_requeridos - misPuntos)

                  return (
                    <motion.div
                      key={promo.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      layout
                      className="break-inside-avoid"
                    >
                      <Card
                        className={`relative overflow-hidden transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl border-0 ${puedeCanjearlo ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50 opacity-90'
                          }`}
                      >
                        {/* Background Decoration */}
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-all group-hover:scale-110 ${puedeCanjearlo ? 'bg-primary' : 'bg-gray-400'
                          }`} style={puedeCanjearlo ? { backgroundColor: hexToRgb(branding.color_primario) } : {}} />

                        {/* Imagen de fondo si existe */}
                        {promo.imagen_url && (
                          <div className="relative h-48 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                            <img
                              src={promo.imagen_url}
                              alt={promo.titulo}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute bottom-4 left-4 z-20">
                              <Badge className="backdrop-blur-md bg-white/20 text-white border-white/20 hover:bg-white/30">
                                {getTipoLabel(promo.tipo)}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {/* Badge de disponibilidad */}
                        {puedeCanjearlo && (
                          <div className="absolute top-4 right-4 z-20">
                            <Badge
                              className="shadow-lg border-0 text-white animate-fade-in"
                              style={{ backgroundColor: hexToRgb(branding.color_acento) }}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Canjeable
                            </Badge>
                          </div>
                        )}

                        <CardHeader className={promo.imagen_url ? 'pt-4' : ''}>
                          <div className="flex justify-between items-start mb-2">
                            {!promo.imagen_url && (
                              <Badge variant="secondary" className="mb-2">
                                {getTipoLabel(promo.tipo)}
                              </Badge>
                            )}
                          </div>

                          <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                            {promo.titulo}
                          </CardTitle>
                          {promo.descripcion && (
                            <CardDescription className="line-clamp-2 mt-2 text-sm">
                              {promo.descripcion}
                            </CardDescription>
                          )}
                        </CardHeader>

                        <CardContent className="space-y-5">
                          {/* Valor e Info */}
                          <div className="flex items-end justify-between border-b pb-4 border-gray-100 dark:border-gray-700">
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Ahorras</p>
                              <p className="text-3xl font-black tracking-tight" style={{ color: hexToRgb(branding.color_primario) }}>
                                {getValorLabel(promo.tipo, promo.valor)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Costo</p>
                              <div className="flex items-center gap-1 justify-end">
                                <Sparkles className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{promo.puntos_requeridos}</p>
                              </div>
                            </div>
                          </div>

                          {/* Footer Info */}
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            {promo.cantidad_disponible !== null && (
                              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                                <Users className="h-3.5 w-3.5" />
                                <span>
                                  <strong className="text-gray-900 dark:text-gray-100">{promo.cantidad_disponible - promo.cantidad_canjeada}</strong> disp.
                                </span>
                              </div>
                            )}
                            {promo.fecha_fin && (
                              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Expira {new Date(promo.fecha_fin).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="pt-2">
                            {puedeCanjearlo ? (
                              <Button
                                onClick={() => handleCanjear(promo)}
                                disabled={canjeando === promo.id}
                                className="w-full h-11 text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
                                style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                              >
                                {canjeando === promo.id ? (
                                  <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Procesando...
                                  </span>
                                ) : (
                                  <>
                                    Canjear Recompensa
                                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                className="w-full h-11 border-dashed cursor-not-allowed opacity-70"
                                disabled
                              >
                                {puntosFaltantes > 0 ? `Te faltan ${puntosFaltantes} pts` : 'No disponible'}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
