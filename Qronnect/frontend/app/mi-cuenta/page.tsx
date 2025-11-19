"use client"

import { AppShell } from "@/components/app-shell"
import { ProgresoSellos } from "@/components/progreso-sellos"
import { HistorialLista } from "@/components/historial-lista"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Mail, Phone, Percent, Copy, Download, Trash2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getClientePorToken } from "@/lib/dataAdapter"
import { useFidelizacion } from "@/stores/useFidelizacion"
import type { Cliente, Evento, EstadoSellos } from "@/types"
import { COMERCIO } from "@/config/commerce"
import { QRCodeSVG } from "qrcode.react"
import { buildClienteURL, descargarQRPNG } from "@/lib/qr"
import { useToast } from "@/hooks/use-toast"
import { ClientNav } from "@/components/ClientNav"
// Reutiliza shadcn/ui AlertDialog para confirmación RGPD
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MiCuentaPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const cid = searchParams.get("cid")
  const t = searchParams.get("t")

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sellos, setSellos] = useState<EstadoSellos | null>(null)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const { obtenerEstadoSellos, obtenerEventosCliente } = useFidelizacion()
  const { toast } = useToast()

  const qrUrl = cid && t ? buildClienteURL(cid, t) : ""

  const copiarEnlace = () => {
    navigator.clipboard.writeText(qrUrl)
    toast({
      title: "Enlace copiado",
      description: "El enlace ha sido copiado al portapapeles",
    })
  }

  const descargar = () => {
    if (cliente) {
      descargarQRPNG("qr-container-cuenta", `qr-${cliente.nombre.replace(/\s+/g, "-")}.png`)
      toast({
        title: "QR descargado",
        description: "Tu código QR ha sido descargado",
      })
    }
  }

  // RGPD: Eliminación de datos del usuario
  const eliminarMisDatos = async () => {
    if (!cid || !t) return

    setIsDeleting(true)

    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clienteId: cid, token: t }),
      })

      if (!res.ok) {
        let errorMessage = "No pudimos eliminar tus datos. Intenta de nuevo."
        try {
          const errorData = await res.json()
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
          // Usar mensaje genérico
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
        setIsDeleting(false)
        return
      }

      toast({
        title: "Tus datos han sido eliminados",
        description: "Tu cuenta y todos tus datos han sido eliminados correctamente.",
      })

      // Redirigir a la home tras eliminación exitosa
      setTimeout(() => {
        router.replace("/")
      }, 2000)
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: "No pudimos conectar con el servidor. Intenta de nuevo.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    if (!cid || !t) {
      setError("Parámetros inválidos")
      return
    }

    const clienteData = getClientePorToken(cid, t)
    if (!clienteData) {
      setError("Cliente no encontrado o token inválido")
      return
    }

    setCliente(clienteData)
    setSellos(obtenerEstadoSellos(cid))
    setEventos(obtenerEventosCliente(cid))
  }, [cid, t, obtenerEstadoSellos, obtenerEventosCliente])

  return (
    <>
      <ClientNav />
      <AppShell showBackButton>
        <div className="max-w-7xl mx-auto py-8 px-4">
        {error ? (
          <div className="space-y-4 max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button asChild className="w-full bg-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary))]/90 text-white">
              <Link href="/recuperar">Recuperar mi QR</Link>
            </Button>
          </div>
        ) : cliente ? (
          <div className="grid lg:grid-cols-[380px_1fr] gap-6">
            {/* Left Column - QR and User Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tu código QR</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div id="qr-container-cuenta" className="bg-white p-6 rounded-lg flex justify-center">
                    <QRCodeSVG value={qrUrl} size={180} level="H" includeMargin />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={copiarEnlace} variant="outline" size="sm" className="border-[rgb(var(--brand-primary))] text-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary))]/10">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                    <Button onClick={descargar} variant="outline" size="sm" className="border-[rgb(var(--brand-primary))] text-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary))]/10">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mi información</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold">{cliente.nombre}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {cliente.email && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {cliente.email}
                        </Badge>
                      )}
                      {cliente.telefono && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {cliente.telefono}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Miembro desde{" "}
                    {new Date(cliente.createdAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  {/* RGPD: Botón de eliminación de datos */}
                  <div className="pt-4 border-t mt-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          disabled={isDeleting}
                          aria-busy={isDeleting}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {isDeleting ? "Eliminando..." : "Eliminar mis datos"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar todos tus datos?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminarán permanentemente tu cuenta,
                            tu código QR, tu historial de compras y todos tus datos personales del sistema.
                            <br /><br />
                            Esta acción cumple con tu derecho de supresión según el RGPD.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={eliminarMisDatos}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? "Eliminando..." : "Sí, eliminar todo"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>

              {/* Using brand colors for the discount card */}
              {COMERCIO.programas.descuento.activo && (
                <Card className="border-[rgb(var(--brand-accent))]">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[rgb(var(--brand-accent))]/10 flex items-center justify-center">
                        <Percent className="w-6 h-6 text-[rgb(var(--brand-accent))]" />
                      </div>
                      <div>
                        <p className="font-semibold">Descuento activo</p>
                        <p className="text-sm text-muted-foreground">
                          {COMERCIO.programas.descuento.porcentaje}% en todas tus compras
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Progress and History */}
            <div className="space-y-6">
              {sellos && COMERCIO.programas.sellos.activo && (
                <ProgresoSellos progreso={sellos.progreso} requisito={sellos.requisito} />
              )}

              <HistorialLista eventos={eventos} />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        )}
      </div>
      </AppShell>
    </>
  )
}
