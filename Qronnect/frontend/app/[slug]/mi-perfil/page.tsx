"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useConfirmDialog } from "@/hooks/use-confirm-dialog"
import { useBrandingContext } from "@/components/BrandingProvider"
import { LoyaltyPass } from "@/components/brand/LoyaltyPass"
import { TiendaInfoCard } from "@/components/TiendaInfoCard"
import { clienteQrValue } from "@/lib/cliente-qr"
import { mensajeInvitacion, resumenPremioReferido, type PremiosReferido } from "@/lib/referidos-texto"
import { ClientCard, ClientPage, ClientSectionTitle, ClientSkeleton } from "@/components/cliente/ClientPage"
import { ChevronRight, Copy, Dices, Gift, LogOut, Receipt, Share2, Stamp, Ticket, Users, type LucideIcon } from "lucide-react"

interface Cliente {
  id: string
  nombre: string
  email: string
  telefono?: string
  puntos_totales: number
  fecha_registro: string
  ultima_visita?: string
  codigo_referido_personal?: string
}

interface DatosReferidos {
  codigo: string
  url: string
  total_referidos: number
  premios?: PremiosReferido | null
}

interface Compra {
  id: string
  fecha: string
  importe: number
  puntos_otorgados: number
  notas?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const POPUP_DIAS = 30

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(amount)

function saludo() {
  const h = new Date().getHours()
  if (h < 12) return "Buenos días"
  if (h < 20) return "Buenas tardes"
  return "Buenas noches"
}

export default function MiPerfilPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()
  const { toast } = useToast()
  const { confirm } = useConfirmDialog()
  const { branding } = useBrandingContext()

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [compras, setCompras] = useState<Compra[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [promocionesCount, setPromocionesCount] = useState(0)
  const [canjesCount, setCanjesCount] = useState(0)
  const [datosReferidos, setDatosReferidos] = useState<DatosReferidos | null>(null)
  const [showReferidosPopup, setShowReferidosPopup] = useState(false)
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    setOrigin(window.location.origin)
    loadClienteData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // El aviso de "invita a tus amigos" sale la primera vez y luego una vez al mes
  useEffect(() => {
    if (!datosReferidos || isLoading) return
    const key = `referidos_popup_${slug}`
    const last = localStorage.getItem(key)
    const dias = last ? (Date.now() - new Date(last).getTime()) / 86_400_000 : Infinity
    if (dias >= POPUP_DIAS) {
      setShowReferidosPopup(true)
      localStorage.setItem(key, new Date().toISOString())
    }
  }, [datosReferidos, isLoading, slug])

  const loadClienteData = async () => {
    try {
      const token = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem("client_token")
      if (!token) {
        toast({ title: "No autenticado", description: "Por favor inicia sesión", variant: "destructive" })
        router.push(`/${slug}/login`)
        return
      }

      // Guardar el token con ambos formatos para compatibilidad
      localStorage.setItem("client_token", token)
      localStorage.setItem(`client_token_${slug}`, token)

      const headers = { Authorization: `Bearer ${token}`, "X-Tenant-Domain": slug }

      const clienteResponse = await fetch(`${API_URL}/api/clientes/me`, { headers })
      if (!clienteResponse.ok) throw new Error("Error al obtener datos del cliente")
      setCliente(await clienteResponse.json())

      const puntosResponse = await fetch(`${API_URL}/api/clientes/me/puntos`, { headers })
      if (!puntosResponse.ok) throw new Error("Error al obtener puntos")
      const puntosData = await puntosResponse.json()
      setCompras(puntosData.ultima_compras || [])

      // Lo que sigue es opcional: si falla, la pantalla se muestra igual
      const [promos, canjes, referidos] = await Promise.allSettled([
        fetch(`${API_URL}/api/clientes/promociones`, { headers }).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API_URL}/api/clientes/mis-canjes`, { headers }).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API_URL}/api/referidos/mi-codigo`, { headers }).then((r) => (r.ok ? r.json() : null)),
      ])
      if (promos.status === "fulfilled" && Array.isArray(promos.value)) setPromocionesCount(promos.value.length)
      if (canjes.status === "fulfilled" && Array.isArray(canjes.value)) setCanjesCount(canjes.value.length)
      if (referidos.status === "fulfilled" && referidos.value?.codigo) setDatosReferidos(referidos.value)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudieron cargar tus datos", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "¿Cerrar sesión?",
      description: "Tendrás que volver a iniciar sesión para acceder a tu cuenta.",
      confirmText: "Cerrar sesión",
    })
    if (!confirmed) return

    localStorage.removeItem("client_token")
    localStorage.removeItem(`client_token_${slug}`)
    localStorage.removeItem("client_data")
    router.push("/login")
  }

  const handleCompartirCodigo = async () => {
    if (!datosReferidos) return
    const tienda = branding.nombre_comercial || "nuestro club de clientes"
    const mensaje = mensajeInvitacion(tienda, datosReferidos.codigo, datosReferidos.url, datosReferidos.premios)

    if (navigator.share) {
      try {
        await navigator.share({ title: `Únete a ${tienda}`, text: mensaje })
      } catch {
        // El cliente canceló
      }
      return
    }
    try {
      await navigator.clipboard.writeText(mensaje)
      toast({ title: "Mensaje copiado", description: "Pégalo donde quieras compartirlo" })
    } catch {
      toast({ title: "Error", description: "No se pudo copiar el mensaje", variant: "destructive" })
    }
  }

  const handleCopiarCodigo = async () => {
    if (!datosReferidos) return
    try {
      await navigator.clipboard.writeText(datosReferidos.codigo)
      toast({ title: "Código copiado", description: datosReferidos.codigo })
    } catch {
      toast({ title: "Error", description: "No se pudo copiar el código", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <ClientPage>
        <ClientSkeleton blocks={4} />
      </ClientPage>
    )
  }

  if (!cliente) return null

  const nombre = cliente.nombre.split(" ")[0]
  const qrValue = origin ? clienteQrValue(origin, cliente.id) : cliente.id

  const accesos: { href: string; label: string; detail: string; icon: LucideIcon }[] = [
    {
      href: `/${slug}/promociones`,
      label: "Premios",
      detail: promocionesCount > 0 ? `${promocionesCount} disponibles` : "Canjea tus puntos",
      icon: Gift,
    },
    {
      href: `/${slug}/mis-canjes`,
      label: "Mis cupones",
      detail: canjesCount > 0 ? `${canjesCount} ${canjesCount === 1 ? "cupón" : "cupones"}` : "Tus premios canjeados",
      icon: Ticket,
    },
    { href: `/${slug}/mis-sellos`, label: "Sellos", detail: "Tus tarjetas", icon: Stamp },
    { href: `/${slug}/gacha`, label: "Máquina de premios", detail: "Prueba suerte", icon: Dices },
  ]

  return (
    <ClientPage
      title={`${saludo()}, ${nombre}`}
      subtitle={branding.nombre_comercial ? `Tu cuenta en ${branding.nombre_comercial}` : undefined}
      actions={
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white text-ink/60 transition-colors hover:text-ink"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </button>
      }
    >
      {/* Tarjeta del club: puntos y QR para enseñar en caja */}
      <Link href={`/${slug}/mi-qr`} className="mx-auto block max-w-[360px] transition-transform active:scale-[0.99]" aria-label="Ver mi QR en grande">
        <LoyaltyPass
          storeName={branding.nombre_comercial || "Club de clientes"}
          logoUrl={branding.logo_url}
          memberName={cliente.nombre}
          points={cliente.puntos_totales}
          qrValue={qrValue}
          qrCaption="Enséñalo en caja para sumar puntos · Toca para ampliar"
          className="max-w-none"
        />
      </Link>

      {/* Accesos rápidos */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {accesos.map(({ href, label, detail, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3 rounded-3xl border border-ink/[0.07] bg-white p-4 transition-colors hover:border-ink/20"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold leading-tight">{label}</span>
              <span className="mt-0.5 block text-sm text-ink/55">{detail}</span>
            </span>
          </Link>
        ))}
      </div>

      {/* Invita a tus amigos */}
      {datosReferidos && (
        <ClientCard className="mt-6 overflow-hidden bg-ink p-0 text-paper">
          <div className="p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-brand-on">
                <Users className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold leading-tight">Invita a tus amigos</h2>
                <p className="text-sm text-paper/60">
                  {datosReferidos.total_referidos > 0
                    ? `Ya se han unido ${datosReferidos.total_referidos} con tu código`
                    : resumenPremioReferido(datosReferidos.premios)}
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-paper/25 px-4 py-3">
              <span className="font-mono text-xl font-bold tracking-[0.15em]">{datosReferidos.codigo}</span>
              <button
                type="button"
                onClick={handleCopiarCodigo}
                aria-label="Copiar código"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/10 transition-colors hover:bg-paper/20"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCompartirCodigo}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-brand-on"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Compartir
              </button>
              <Link
                href={`/${slug}/mis-referidos`}
                className="flex h-12 items-center justify-center gap-1 rounded-full border border-paper/20 text-sm font-semibold"
              >
                Ver mis amigos
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </ClientCard>
      )}

      {/* Historial */}
      <ClientSectionTitle>Tus últimas visitas</ClientSectionTitle>
      {compras.length === 0 ? (
        <ClientCard className="text-center text-sm text-ink/60">
          Aún no hay compras. Enseña tu QR en caja y empezarás a sumar puntos.
        </ClientCard>
      ) : (
        <ClientCard className="p-0">
          <ul className="divide-y divide-ink/[0.07]">
            {compras.map((compra) => (
              <li key={compra.id} className="flex items-center gap-3 px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink/[0.05] text-ink/60">
                  <Receipt className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{formatCurrency(compra.importe)}</p>
                  <p className="truncate text-sm text-ink/55">{compra.notas || formatDate(compra.fecha)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand/10 px-2.5 py-1 text-sm font-semibold tabular-nums">
                  +{compra.puntos_otorgados} pts
                </span>
              </li>
            ))}
          </ul>
        </ClientCard>
      )}

      {/* Datos del cliente */}
      <ClientSectionTitle>Tus datos</ClientSectionTitle>
      <ClientCard className="p-0">
        <dl className="divide-y divide-ink/[0.07] text-[15px]">
          {[
            ["Nombre", cliente.nombre],
            ["Email", cliente.email],
            ["Teléfono", cliente.telefono],
            ["Socio desde", formatDate(cliente.fecha_registro)],
          ]
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <dt className="text-ink/55">{label}</dt>
                <dd className="min-w-0 truncate text-right font-medium">{value}</dd>
              </div>
            ))}
        </dl>
      </ClientCard>

      <div className="mt-8">
        <TiendaInfoCard slug={slug} />
      </div>

      {/* Aviso de referidos (primera vez y luego una vez al mes) */}
      {datosReferidos && (
        <Dialog open={showReferidosPopup} onOpenChange={setShowReferidosPopup}>
          <DialogContent className="max-w-sm rounded-3xl">
            <DialogHeader className="items-center text-center">
              <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-brand-on">
                <Users className="h-7 w-7" aria-hidden="true" />
              </span>
              <DialogTitle className="font-display text-2xl">Invita a tus amigos</DialogTitle>
              <DialogDescription>
                {resumenPremioReferido(datosReferidos.premios)} Comparte tu código y empieza a sumar.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-ink/20 px-4 py-3">
              <span className="font-mono text-xl font-bold tracking-[0.15em]">{datosReferidos.codigo}</span>
              <button
                type="button"
                onClick={handleCopiarCodigo}
                aria-label="Copiar código"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 hover:bg-ink/10"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => {
                  handleCompartirCodigo()
                  setShowReferidosPopup(false)
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-brand-on"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Compartir mi código
              </button>
              <button
                type="button"
                onClick={() => setShowReferidosPopup(false)}
                className="h-11 rounded-full text-sm font-medium text-ink/60 hover:text-ink"
              >
                Ahora no
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </ClientPage>
  )
}
