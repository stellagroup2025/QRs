"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import QRCode from 'qrcode'
import { BrandLogo } from '@/components/BrandLogo'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { Gift, Ticket, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ClientNav } from '@/components/ClientNav'

interface Cliente {
  id: string
  nombre: string
  email: string
  telefono?: string
  puntos_totales: number
  fecha_registro: string
  ultima_visita?: string
}

interface Compra {
  id: string
  fecha: string
  importe: number
  puntos_otorgados: number
  notas?: string
}

export default function MiPerfilPage() {
  const { branding } = useBrandingContext()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [compras, setCompras] = useState<Compra[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [tenantDomain, setTenantDomain] = useState<string>('')
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadClienteData()
  }, [])

  const loadClienteData = async () => {
    try {
      const token = localStorage.getItem('client_token')
      if (!token) {
        toast({
          title: "No autenticado",
          description: "Por favor inicia sesión",
          variant: "destructive",
        })
        router.push('/login')
        return
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const host = window.location.host
      const domain = host.split(':')[0].split('.')[0]
      const finalDomain = domain === 'localhost' ? 'lokeyokiera' : domain
      setTenantDomain(finalDomain)

      // Guardar el token también con el slug para que funcione en las páginas de promociones
      localStorage.setItem(`client_token_${finalDomain}`, token)

      // Obtener datos del cliente
      const clienteResponse = await fetch(`${API_URL}/api/clientes/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain === 'localhost' ? 'lokeyokiera' : domain,
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
          'X-Tenant-Domain': domain === 'localhost' ? 'lokeyokiera' : domain,
        },
      })

      if (!puntosResponse.ok) {
        throw new Error('Error al obtener puntos')
      }

      const puntosData = await puntosResponse.json()
      setCompras(puntosData.ultima_compras || [])

      // Generar QR Code con el ID del cliente
      const qrData = clienteData.id
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
    localStorage.removeItem('client_data')
    if (tenantDomain) {
      localStorage.removeItem(`client_token_${tenantDomain}`)
    }
    router.push('/login')
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
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
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

        {/* QR Code Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tu Código QR</CardTitle>
            <CardDescription>
              Muestra este código al realizar compras para acumular puntos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt="Tu código QR"
                className="w-64 h-64 border-4 rounded-lg"
                style={{ borderColor: hexToRgb(branding.color_primario) }}
              />
            )}
            <p className="mt-4 text-sm text-muted-foreground">ID: {cliente.id}</p>
          </CardContent>
        </Card>

        {/* Puntos Card */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Puntos</CardTitle>
            <CardDescription>Puntos acumulados en el programa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-6xl font-bold" style={{ color: hexToRgb(branding.color_primario) }}>{cliente.puntos_totales}</p>
              <p className="text-muted-foreground mt-2">puntos totales</p>
            </div>
          </CardContent>
        </Card>

        {/* Acciones Rápidas */}
        {tenantDomain && (
          <div className="grid md:grid-cols-2 gap-4">
            <Link href={`/${tenantDomain}/promociones`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer h-full" style={{ borderColor: hexToRgb(branding.color_primario), borderWidth: '2px' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" style={{ color: hexToRgb(branding.color_primario) }} />
                    Promociones
                  </CardTitle>
                  <CardDescription>
                    Canjea tus puntos por descuentos y regalos
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

            <Link href={`/${tenantDomain}/mis-canjes`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer h-full" style={{ borderColor: hexToRgb(branding.color_acento), borderWidth: '2px' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" style={{ color: hexToRgb(branding.color_acento) }} />
                    Mis Cupones
                  </CardTitle>
                  <CardDescription>
                    Revisa tus cupones canjeados
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
        )}

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
      </div>
    </div>
    </>
  )
}
