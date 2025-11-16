"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import QRCode from 'qrcode'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { Download, Copy } from 'lucide-react'
import { ClientNav } from '@/components/ClientNav'

interface Cliente {
  id: string
  nombre: string
  email: string
}

export default function MiQRPage() {
  const params = useParams()
  const slug = params.slug as string
  const { branding } = useBrandingContext()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadClienteData()
  }, [])

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

      // Generar QR Code con el ID del cliente
      const qrData = clienteData.id
      const qrUrl = await QRCode.toDataURL(qrData, { width: 400 })
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

  const handleDownload = () => {
    if (!qrCodeUrl || !cliente) return

    const link = document.createElement('a')
    link.download = `qr-${cliente.nombre.replace(/\s+/g, '-')}.png`
    link.href = qrCodeUrl
    link.click()

    toast({
      title: "QR descargado",
      description: "Tu código QR ha sido descargado",
    })
  }

  const handleCopy = async () => {
    if (!cliente) return

    try {
      await navigator.clipboard.writeText(cliente.id)
      toast({
        title: "ID copiado",
        description: "Tu ID ha sido copiado al portapapeles",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el ID",
        variant: "destructive",
      })
    }
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
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2" style={{ color: hexToRgb(branding.color_primario) }}>
              ¡Hola, {cliente.nombre}!
            </h1>
            <p className="text-muted-foreground">
              Este es tu código QR personal para acumular puntos
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tu Código QR</CardTitle>
              <CardDescription>
                Muestra este código al personal de la tienda para acumular puntos en tus compras
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center p-8 bg-white rounded-lg">
                {qrCodeUrl && (
                  <img
                    src={qrCodeUrl}
                    alt="Tu código QR"
                    className="w-full max-w-sm border-4 rounded-lg"
                    style={{ borderColor: hexToRgb(branding.color_primario) }}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="w-full"
                  style={{
                    borderColor: hexToRgb(branding.color_primario),
                    color: hexToRgb(branding.color_primario)
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar ID
                </Button>
                <Button
                  onClick={handleDownload}
                  className="w-full text-white"
                  style={{ backgroundColor: hexToRgb(branding.color_primario) }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar QR
                </Button>
              </div>

              <div className="pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground mb-1">Tu ID de cliente</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{cliente.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
