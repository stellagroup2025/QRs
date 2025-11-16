"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRCodeSVG } from "qrcode.react"
import { buildClienteURL, descargarQRPNG } from "@/lib/qr"
import { Copy, Download, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface MiQRCardProps {
  clienteId: string
  token: string
  nombre: string
}

export function MiQRCard({ clienteId, token, nombre }: MiQRCardProps) {
  const { toast } = useToast()
  const qrUrl = buildClienteURL(clienteId, token)

  const copiarEnlace = () => {
    navigator.clipboard.writeText(qrUrl)
    toast({
      title: "Enlace copiado",
      description: "El enlace ha sido copiado al portapapeles",
    })
  }

  const descargar = () => {
    descargarQRPNG("qr-container", `qr-${nombre.replace(/\s+/g, "-")}.png`)
    toast({
      title: "QR descargado",
      description: "Tu código QR ha sido descargado",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tu código QR</CardTitle>
        <CardDescription>Muestra este código en cada compra para acumular sellos y obtener descuentos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div id="qr-container" className="bg-white p-6 rounded-lg flex justify-center">
          <QRCodeSVG value={qrUrl} size={200} level="H" includeMargin />
        </div>

        <div className="space-y-2">
          <Button onClick={copiarEnlace} variant="outline" className="w-full bg-transparent">
            <Copy className="w-4 h-4 mr-2" />
            Copiar enlace
          </Button>
          <Button onClick={descargar} variant="outline" className="w-full bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Descargar PNG
          </Button>
          <Button asChild variant="default" className="w-full">
            <Link href={`/mi-cuenta?cid=${clienteId}&t=${token}`}>
              <User className="w-4 h-4 mr-2" />
              Ver mi cuenta
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Guarda este enlace o descarga el QR para tenerlo siempre disponible
        </p>
      </CardContent>
    </Card>
  )
}
