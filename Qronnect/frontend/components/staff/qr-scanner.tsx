"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, CameraOff, AlertCircle } from "lucide-react"

interface QRScannerProps {
  onScan: (url: string) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const qrReaderRef = useRef<HTMLDivElement>(null)

  const startScanning = async () => {
    try {
      setError(null)

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader")
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScan(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // Silenciar errores de escaneo continuo
          console.debug("[v0] QR scan error:", errorMessage)
        },
      )

      setScanning(true)
    } catch (err) {
      console.error("[v0] Scanner error:", err)
      setError("No se pudo acceder a la cámara. Verifica los permisos.")
      setScanning(false)
    }
  }

  const stopScanning = async () => {
    try {
      if (scannerRef.current && scanning) {
        await scannerRef.current.stop()
        setScanning(false)
      }
    } catch (err) {
      console.error("[v0] Stop scanning error:", err)
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {
          // Cleanup silently
        })
      }
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escáner de QR</CardTitle>
        <CardDescription>Escanea el código QR del cliente para gestionar su cuenta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div
          id="qr-reader"
          ref={qrReaderRef}
          className={`w-full ${scanning ? "block" : "hidden"}`}
          style={{ minHeight: scanning ? "300px" : "0" }}
        />

        {!scanning && (
          <div className="bg-muted rounded-lg p-12 text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Presiona el botón para activar la cámara</p>
          </div>
        )}

        <Button
          onClick={scanning ? stopScanning : startScanning}
          variant={scanning ? "destructive" : "default"}
          className="w-full"
        >
          {scanning ? (
            <>
              <CameraOff className="w-4 h-4 mr-2" />
              Detener escáner
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Activar cámara
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
