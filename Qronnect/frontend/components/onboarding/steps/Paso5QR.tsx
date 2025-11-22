'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, Download, Printer, Share2, CheckCircle2 } from 'lucide-react'

interface Paso5QRProps {
  onChange: (data: any) => void
}

export function Paso5QR({ onChange }: Paso5QRProps) {
  const [qrDescargado, setQrDescargado] = useState(false)

  const handleDescargar = () => {
    setQrDescargado(true)
    onChange({ qr_descargado: true })
    // TODO: Implementar descarga real del QR
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <QrCode className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Tu Código QR</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Descarga tu QR y compártelo con tus clientes para que se registren
        </p>
      </div>

      {/* QR Preview */}
      <Card className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center space-y-4">
          {/* QR Code Placeholder */}
          <div className="w-64 h-64 bg-white rounded-xl shadow-lg p-6 border-4 border-gray-200">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
              <QrCode className="h-32 w-32 text-gray-400" />
            </div>
          </div>

          {/* Nombre de la tienda */}
          <div className="text-center space-y-1">
            <p className="font-semibold text-lg">Escanea para unirte</p>
            <p className="text-sm text-muted-foreground">
              Obtén puntos y recompensas en cada compra
            </p>
          </div>
        </div>
      </Card>

      {/* Acciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button
          onClick={handleDescargar}
          className="flex items-center gap-2"
          variant={qrDescargado ? "outline" : "default"}
        >
          {qrDescargado ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Descargado
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Descargar QR
            </>
          )}
        </Button>

        <Button variant="outline" className="flex items-center gap-2">
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>

        <Button variant="outline" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
      </div>

      {/* Instrucciones */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="space-y-4">
          <h4 className="font-semibold text-blue-900 flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            ¿Dónde colocar tu QR?
          </h4>

          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-700">1</span>
              </div>
              <div>
                <p className="font-medium">En tu mostrador o caja</p>
                <p className="text-blue-700 text-xs">
                  Coloca el QR donde los clientes lo vean mientras pagan
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-700">2</span>
              </div>
              <div>
                <p className="font-medium">En las mesas (restaurantes/cafeterías)</p>
                <p className="text-blue-700 text-xs">
                  Usa porta-menús o displays de mesa
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-700">3</span>
              </div>
              <div>
                <p className="font-medium">En redes sociales</p>
                <p className="text-blue-700 text-xs">
                  Comparte en Instagram, Facebook stories, etc.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-700">4</span>
              </div>
              <div>
                <p className="font-medium">En tus productos/packaging</p>
                <p className="text-blue-700 text-xs">
                  Imprime stickers con el QR para bolsas o empaques
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tip Final */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">
          <strong>🎉 ¡Casi listo!</strong> Descarga tu QR y empieza a construir tu base de
          clientes fieles. Recuerda mencionar los beneficios cuando invites a escanear.
        </p>
      </div>
    </div>
  )
}
