'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Ticket, QrCode, CheckCircle2, Clock, XCircle, Calendar } from 'lucide-react'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import QRCodeLib from 'qrcode'
import { ClientNav } from '@/components/ClientNav'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Canje {
  id: string
  codigo_canje: string
  estado: 'pendiente' | 'usado' | 'expirado' | 'cancelado'
  puntos_usados: number
  fecha_canje: string
  fecha_uso?: string
  fecha_expiracion?: string
  promocion: {
    id: string
    titulo: string
    descripcion: string
    tipo: string
    valor: number
    imagen_url?: string
  }
}

export default function MisCanjesPage() {
  const params = useParams()
  const router = useRouter()
  const { branding } = useBrandingContext()
  const slug = params.slug as string

  const [canjes, setCanjes] = useState<Canje[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCanje, setSelectedCanje] = useState<Canje | null>(null)
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    fetchCanjes()
  }, [])

  useEffect(() => {
    if (selectedCanje) {
      generateQR(selectedCanje.codigo_canje)
    }
  }, [selectedCanje])

  const fetchCanjes = async () => {
    const token = localStorage.getItem(`client_token_${slug}`)
    if (!token) {
      router.push(`/${slug}/recuperar`)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/clientes/mis-canjes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCanjes(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQR = async (codigo: string) => {
    try {
      const url = await QRCodeLib.toDataURL(codigo, {
        width: 400,
        margin: 2,
        color: {
          dark: hexToRgb(branding.color_primario).replace('rgb(', '').replace(')', '').split(',').map(Number),
          light: '#FFFFFF',
        },
      })
      setQrUrl(url)
    } catch (error) {
      console.error('Error generating QR:', error)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Badge className="bg-blue-500 text-white"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>
      case 'usado':
        return <Badge className="bg-green-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Usado</Badge>
      case 'expirado':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Expirado</Badge>
      case 'cancelado':
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Cancelado</Badge>
      default:
        return <Badge variant="outline">{estado}</Badge>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
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
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">Mis Cupones</h1>
          <p className="text-muted-foreground">
            Tus promociones canjeadas y su estado actual
          </p>
        </div>
      </div>

      {/* Canjes List */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {canjes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl font-medium mb-2">No tienes cupones</p>
              <p className="text-muted-foreground mb-6">
                Canjea tus puntos por promociones para obtener cupones
              </p>
              <Button
                onClick={() => router.push(`/${slug}/promociones`)}
                style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                className="text-white"
              >
                Ver Promociones
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {canjes.map((canje) => (
              <Card
                key={canje.id}
                className={canje.estado === 'pendiente' ? 'border-2' : 'opacity-75'}
                style={canje.estado === 'pendiente' ? { borderColor: hexToRgb(branding.color_primario) } : {}}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <Ticket className="h-5 w-5" />
                        {canje.promocion.titulo}
                      </CardTitle>
                      <CardDescription>{canje.promocion.descripcion}</CardDescription>
                    </div>
                    {getEstadoBadge(canje.estado)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Código del cupón */}
                  <div
                    className="p-4 rounded-lg text-center"
                    style={{ backgroundColor: hexToRgb(branding.color_primario) + '10' }}
                  >
                    <p className="text-sm text-muted-foreground mb-2">Código del Cupón</p>
                    <p className="text-2xl font-mono font-bold tracking-wider">{canje.codigo_canje}</p>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Beneficio</p>
                      <p className="font-bold text-lg" style={{ color: hexToRgb(branding.color_primario) }}>
                        {getValorLabel(canje.promocion.tipo, canje.promocion.valor)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Puntos Usados</p>
                      <p className="font-bold text-lg">{canje.puntos_usados}</p>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Canjeado el {new Date(canje.fecha_canje).toLocaleDateString('es-ES')}</span>
                    </div>

                    {canje.fecha_uso && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Usado el {new Date(canje.fecha_uso).toLocaleDateString('es-ES')}</span>
                      </div>
                    )}

                    {canje.fecha_expiracion && canje.estado === 'pendiente' && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          Expira el {new Date(canje.fecha_expiracion).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botón para mostrar QR */}
                  {canje.estado === 'pendiente' && (
                    <Button
                      onClick={() => setSelectedCanje(canje)}
                      className="w-full text-white"
                      style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Mostrar QR para Validar
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog del QR */}
      <Dialog open={!!selectedCanje} onOpenChange={() => setSelectedCanje(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Código QR del Cupón</DialogTitle>
            <DialogDescription>
              Muestra este código al personal para validar tu cupón
            </DialogDescription>
          </DialogHeader>

          {selectedCanje && (
            <div className="space-y-6">
              {/* Título de la promoción */}
              <div className="text-center">
                <h3 className="font-bold text-lg mb-1">{selectedCanje.promocion.titulo}</h3>
                <p
                  className="text-3xl font-bold"
                  style={{ color: hexToRgb(branding.color_primario) }}
                >
                  {getValorLabel(selectedCanje.promocion.tipo, selectedCanje.promocion.valor)}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div
                  className="p-6 bg-white rounded-xl border-4 border-dashed"
                  style={{
                    borderColor: `${hexToRgb(branding.color_primario).replace('rgb(', 'rgba(').replace(')', ', 0.3)')}`
                  }}
                >
                  {qrUrl && (
                    <img
                      src={qrUrl}
                      alt="QR del cupón"
                      className="w-64 h-64"
                    />
                  )}
                </div>
              </div>

              {/* Código manual */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Código (si no funciona el QR)</p>
                <p className="text-xl font-mono font-bold tracking-wider">{selectedCanje.codigo_canje}</p>
              </div>

              {/* Advertencia */}
              <div className="text-center text-sm text-muted-foreground">
                <p>Este cupón solo puede usarse una vez</p>
                {selectedCanje.fecha_expiracion && (
                  <p className="text-orange-600 font-medium mt-1">
                    Válido hasta {new Date(selectedCanje.fecha_expiracion).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </>
  )
}
