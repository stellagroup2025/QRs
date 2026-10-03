"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import QRCode from "qrcode"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Download, Sun } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useBrandingContext } from "@/components/BrandingProvider"
import { ClientPage, ClientSkeleton } from "@/components/cliente/ClientPage"
import { clienteQrValue } from "@/lib/cliente-qr"

interface Cliente {
  id: string
  nombre: string
  email: string
  puntos_totales?: number
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export default function MiQRPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { toast } = useToast()
  const { branding } = useBrandingContext()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    setOrigin(window.location.origin)
    loadClienteData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadClienteData = async () => {
    try {
      const token = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem("client_token")
      if (!token) {
        toast({ title: "No autenticado", description: "Por favor inicia sesión", variant: "destructive" })
        router.push(`/${slug}/login`)
        return
      }

      const res = await fetch(`${API_URL}/api/clientes/me`, {
        headers: { Authorization: `Bearer ${token}`, "X-Tenant-Domain": slug },
      })
      if (!res.ok) throw new Error("Error al obtener datos del cliente")
      setCliente(await res.json())
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudieron cargar tus datos", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!cliente) return
    const dataUrl = await QRCode.toDataURL(clienteQrValue(origin, cliente.id), { width: 600, margin: 2 })
    const link = document.createElement("a")
    link.download = `qr-${cliente.nombre.replace(/\s+/g, "-")}.png`
    link.href = dataUrl
    link.click()
    toast({ title: "QR descargado", description: "Guárdalo en tus fotos para tenerlo siempre a mano" })
  }

  const handleCopy = async () => {
    if (!cliente) return
    try {
      await navigator.clipboard.writeText(cliente.id)
      toast({ title: "Código copiado" })
    } catch {
      toast({ title: "Error", description: "No se pudo copiar el código", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <ClientPage>
        <ClientSkeleton blocks={1} />
      </ClientPage>
    )
  }

  if (!cliente) return null

  return (
    <ClientPage title="Mi QR" subtitle="Enséñalo en caja en cada compra para sumar puntos.">
      <div className="mx-auto max-w-[380px] overflow-hidden rounded-[32px] bg-brand text-brand-on shadow-[0_30px_60px_-24px_rgb(var(--ink)/0.5)]">
        <div className="flex items-center gap-3 px-6 pt-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white font-display text-lg font-bold text-ink">
            {branding.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={branding.logo_url} alt="" className="h-full w-full object-contain p-1" />
            ) : (
              (branding.nombre_comercial || "Q").charAt(0).toUpperCase()
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold leading-tight">{branding.nombre_comercial}</p>
            <p className="truncate text-sm opacity-75">{cliente.nombre}</p>
          </div>
          {typeof cliente.puntos_totales === "number" && (
            <p className="ml-auto text-right leading-tight">
              <span className="block font-display text-2xl font-bold tabular-nums">{cliente.puntos_totales.toLocaleString("es-ES")}</span>
              <span className="text-xs opacity-75">puntos</span>
            </p>
          )}
        </div>

        <div className="m-6 rounded-3xl bg-white p-6">
          {origin ? (
            <QRCodeSVG
              value={clienteQrValue(origin, cliente.id)}
              size={512}
              level="M"
              className="h-auto w-full"
              aria-label="Tu código QR de cliente"
              role="img"
            />
          ) : (
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-ink/5" />
          )}
        </div>

        <p className="flex items-center justify-center gap-2 px-6 pb-6 text-center text-sm opacity-80">
          <Sun className="h-4 w-4 shrink-0" aria-hidden="true" />
          Sube el brillo de la pantalla para que se lea mejor
        </p>
      </div>

      <div className="mx-auto mt-6 grid max-w-[380px] gap-3">
        <button
          type="button"
          onClick={handleDownload}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-paper"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Guardar en mis fotos
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink/55">Si no se puede escanear, dicta este código</p>
            <p className="truncate font-mono text-sm">{cliente.id}</p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copiar código"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/5 hover:bg-ink/10"
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </ClientPage>
  )
}
