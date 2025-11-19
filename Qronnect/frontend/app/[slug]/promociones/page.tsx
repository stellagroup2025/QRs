'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gift, Sparkles, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { ClientNav } from '@/components/ClientNav'

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
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCanjear = async (promocion: Promocion) => {
    const token = localStorage.getItem(`client_token_${slug}`)
    if (!token) return

    if (misPuntos < promocion.puntos_requeridos) {
      alert(`Te faltan ${promocion.puntos_requeridos - misPuntos} puntos para canjear esta promoción`)
      return
    }

    if (!confirm(`¿Quieres canjear ${promocion.puntos_requeridos} puntos por "${promocion.titulo}"?`)) {
      return
    }

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

      alert('¡Promoción canjeada exitosamente! Encuentra tu cupón en "Mis Canjes"')

      // Actualizar datos
      fetchData()

      // Redirigir a mis canjes
      router.push(`/${slug}/mis-canjes`)
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Error al canjear promoción')
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="border-b bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Promociones</h1>
              <p className="text-muted-foreground">
                Canjea tus puntos por descuentos y regalos exclusivos
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Tus puntos</p>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" style={{ color: hexToRgb(branding.color_acento) }} />
                <p className="text-3xl font-bold" style={{ color: hexToRgb(branding.color_primario) }}>
                  {misPuntos}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promociones Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {promociones.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl font-medium mb-2">No hay promociones disponibles</p>
              <p className="text-muted-foreground">
                Vuelve pronto para descubrir nuevas ofertas
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {promociones.map((promo) => {
              const puedeCanjearlo = puedeCanjear(promo)
              const puntosFaltantes = Math.max(0, promo.puntos_requeridos - misPuntos)

              return (
                <Card
                  key={promo.id}
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${
                    puedeCanjearlo ? 'border-2' : 'opacity-75'
                  }`}
                  style={puedeCanjearlo ? { borderColor: hexToRgb(branding.color_primario) } : {}}
                >
                  {/* Imagen de fondo si existe */}
                  {promo.imagen_url && (
                    <div className="h-40 overflow-hidden bg-gray-100">
                      <img
                        src={promo.imagen_url}
                        alt={promo.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Badge de disponibilidad */}
                  {puedeCanjearlo && (
                    <div className="absolute top-4 right-4">
                      <Badge
                        className="text-white"
                        style={{ backgroundColor: hexToRgb(branding.color_acento) }}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Disponible
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2">
                      <span>{promo.titulo}</span>
                      <Badge variant="outline">{getTipoLabel(promo.tipo)}</Badge>
                    </CardTitle>
                    {promo.descripcion && (
                      <CardDescription>{promo.descripcion}</CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Valor del beneficio */}
                    <div
                      className="text-center py-4 rounded-lg"
                      style={{ backgroundColor: hexToRgb(branding.color_primario) + '10' }}
                    >
                      <p className="text-sm text-muted-foreground mb-1">Ahorra</p>
                      <p
                        className="text-4xl font-bold"
                        style={{ color: hexToRgb(branding.color_primario) }}
                      >
                        {getValorLabel(promo.tipo, promo.valor)}
                      </p>
                    </div>

                    {/* Puntos requeridos */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Costo en puntos</span>
                      <div className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4" style={{ color: hexToRgb(branding.color_acento) }} />
                        <span className="font-bold text-lg">{promo.puntos_requeridos}</span>
                      </div>
                    </div>

                    {/* Cantidad disponible */}
                    {promo.cantidad_disponible !== null && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Disponibles
                        </span>
                        <span className="font-medium">
                          {promo.cantidad_disponible - promo.cantidad_canjeada}
                        </span>
                      </div>
                    )}

                    {/* Fecha de expiración */}
                    {promo.fecha_fin && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Válido hasta {new Date(promo.fecha_fin).toLocaleDateString('es-ES')}
                      </div>
                    )}

                    {/* Botón de canje */}
                    {puedeCanjearlo ? (
                      <Button
                        onClick={() => handleCanjear(promo)}
                        disabled={canjeando === promo.id}
                        className="w-full text-white"
                        style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                      >
                        {canjeando === promo.id ? (
                          'Canjeando...'
                        ) : (
                          <>
                            Canjear Ahora
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-center text-sm text-muted-foreground">
                          {puntosFaltantes > 0 ? (
                            <p>Te faltan <span className="font-bold">{puntosFaltantes}</span> puntos</p>
                          ) : (
                            <p>No disponible</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled
                        >
                          No Disponible
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
      </div>
    </>
  )
}
