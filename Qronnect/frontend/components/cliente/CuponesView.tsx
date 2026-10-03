'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle2, Clock, Gift, Sparkles, Ticket, Users, XCircle, type LucideIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { ClientEmpty, ClientPage, ClientSectionTitle, ClientSkeleton } from './ClientPage'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/** Cupón obtenido al canjear puntos por una promoción (/api/clientes/mis-canjes) */
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

/** Regalo recibido: bienvenida, amigos, objetivos... (/api/regalos/mis-cupones) */
interface CuponRegalo {
  id: string
  codigo: string
  regalo_nombre: string
  regalo_descripcion: string | null
  estado: 'disponible' | 'usado' | 'expirado' | 'cancelado'
  fecha_otorgado: string
  fecha_expiracion: string | null
  fecha_usado: string | null
  visto_por_cliente: boolean
  instrucciones_canje: string | null
  origen: 'bienvenida' | 'referido' | 'milestone' | 'promocion' | 'manual'
}

/** Forma común para pintar los dos tipos en la misma lista */
interface Cupon {
  key: string
  codigo: string
  titulo: string
  descripcion?: string | null
  origen: string
  origenIcon: LucideIcon
  usable: boolean
  estado: 'usable' | 'usado' | 'expirado' | 'cancelado'
  fecha: string
  expira?: string | null
  usado?: string | null
  instrucciones?: string | null
  nuevo?: boolean
}

const ORIGEN: Record<CuponRegalo['origen'], { text: string; icon: LucideIcon }> = {
  bienvenida: { text: 'Regalo de bienvenida', icon: Sparkles },
  referido: { text: 'Por invitar a un amigo', icon: Users },
  milestone: { text: 'Objetivo conseguido', icon: Sparkles },
  promocion: { text: 'Promoción', icon: Ticket },
  manual: { text: 'Regalo especial', icon: Gift },
}

const fecha = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })

function desdeCanje(c: Canje): Cupon {
  return {
    key: `canje-${c.id}`,
    codigo: c.codigo_canje,
    titulo: c.promocion?.titulo ?? 'Premio',
    descripcion: c.promocion?.descripcion,
    origen: `Canjeado por ${c.puntos_usados} puntos`,
    origenIcon: Ticket,
    usable: c.estado === 'pendiente',
    estado: c.estado === 'pendiente' ? 'usable' : c.estado,
    fecha: c.fecha_canje,
    expira: c.fecha_expiracion,
    usado: c.fecha_uso,
  }
}

function desdeRegalo(c: CuponRegalo): Cupon {
  const origen = ORIGEN[c.origen] ?? { text: 'Regalo', icon: Gift }
  return {
    key: `regalo-${c.id}`,
    codigo: c.codigo,
    titulo: c.regalo_nombre,
    descripcion: c.regalo_descripcion,
    origen: origen.text,
    origenIcon: origen.icon,
    usable: c.estado === 'disponible',
    estado: c.estado === 'disponible' ? 'usable' : c.estado,
    fecha: c.fecha_otorgado,
    expira: c.fecha_expiracion,
    usado: c.fecha_usado,
    instrucciones: c.instrucciones_canje,
    nuevo: !c.visto_por_cliente,
  }
}

const ESTADO: Record<Cupon['estado'], { text: string; icon: LucideIcon }> = {
  usable: { text: 'Para usar', icon: Clock },
  usado: { text: 'Usado', icon: CheckCircle2 },
  expirado: { text: 'Caducado', icon: XCircle },
  cancelado: { text: 'Cancelado', icon: XCircle },
}

/**
 * "Mis cupones": premios canjeados con puntos y regalos recibidos en una sola lista.
 * Arriba los que se pueden usar; al tocar uno se abre su QR para enseñarlo en caja.
 */
export function CuponesView({ slug }: { slug: string }) {
  const router = useRouter()
  const [cupones, setCupones] = useState<Cupon[]>([])
  const [loading, setLoading] = useState(true)
  const [abierto, setAbierto] = useState<Cupon | null>(null)

  useEffect(() => {
    const token = localStorage.getItem(`client_token_${slug}`) || localStorage.getItem('client_token')
    if (!token) {
      router.push(`/${slug}/recuperar`)
      return
    }
    const headers = { Authorization: `Bearer ${token}`, 'X-Tenant-Domain': slug }

    const cargar = async () => {
      const [canjes, regalos] = await Promise.allSettled([
        fetch(`${API_URL}/api/clientes/mis-canjes`, { headers }).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API_URL}/api/regalos/mis-cupones`, { headers }).then((r) => (r.ok ? r.json() : [])),
      ])
      const lista: Cupon[] = []
      if (canjes.status === 'fulfilled' && Array.isArray(canjes.value)) lista.push(...canjes.value.map(desdeCanje))
      if (regalos.status === 'fulfilled' && Array.isArray(regalos.value)) {
        lista.push(...regalos.value.map(desdeRegalo))
        // Los regalos nuevos se marcan como vistos al entrar
        regalos.value
          .filter((c: CuponRegalo) => !c.visto_por_cliente)
          .forEach((c: CuponRegalo) =>
            fetch(`${API_URL}/api/regalos/cupones/${c.id}/marcar-visto`, { method: 'PUT', headers }).catch(() => {}),
          )
      }
      lista.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      setCupones(lista)
      setLoading(false)
    }
    cargar()
  }, [slug, router])

  if (loading) {
    return (
      <ClientPage>
        <ClientSkeleton blocks={3} />
      </ClientPage>
    )
  }

  const paraUsar = cupones.filter((c) => c.usable)
  const historial = cupones.filter((c) => !c.usable)

  return (
    <ClientPage title="Mis cupones" subtitle="Tus premios y regalos. Enséñalos en caja para usarlos.">
      {paraUsar.length === 0 ? (
        <ClientEmpty
          icon={<Ticket className="h-7 w-7" aria-hidden="true" />}
          title="No tienes cupones para usar"
          text="Cambia tus puntos por un premio y aparecerá aquí, listo para enseñarlo en caja."
          action={
            <Link href={`/${slug}/promociones`} className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-on">
              Ver premios
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {paraUsar.map((c) => (
            <li key={c.key}>
              <CuponTicket cupon={c} onOpen={() => setAbierto(c)} />
            </li>
          ))}
        </ul>
      )}

      {historial.length > 0 && (
        <>
          <ClientSectionTitle>Historial</ClientSectionTitle>
          <ul className="space-y-3">
            {historial.map((c) => (
              <li key={c.key}>
                <CuponTicket cupon={c} />
              </li>
            ))}
          </ul>
        </>
      )}

      <Dialog open={!!abierto} onOpenChange={(open) => !open && setAbierto(null)}>
        {abierto && (
          <DialogContent className="max-w-sm rounded-3xl">
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle className="font-display text-2xl">{abierto.titulo}</DialogTitle>
              <DialogDescription>Enseña este código en caja para usar tu cupón.</DialogDescription>
            </DialogHeader>
            <div className="mx-auto w-full max-w-[260px] rounded-3xl border border-ink/10 bg-white p-4">
              <QRCodeSVG value={abierto.codigo} size={512} level="H" className="h-auto w-full" />
            </div>
            <p className="text-center font-mono text-2xl font-bold tracking-[0.2em]">{abierto.codigo}</p>
            {abierto.instrucciones && (
              <p className="rounded-2xl bg-ink/[0.04] p-4 text-sm text-ink/70">{abierto.instrucciones}</p>
            )}
            {abierto.expira && <p className="text-center text-sm text-ink/55">Válido hasta el {fecha(abierto.expira)}</p>}
          </DialogContent>
        )}
      </Dialog>
    </ClientPage>
  )
}

function CuponTicket({ cupon, onOpen }: { cupon: Cupon; onOpen?: () => void }) {
  const Origen = cupon.origenIcon
  const estado = ESTADO[cupon.estado]
  const EstadoIcon = estado.icon
  const Tag = onOpen ? 'button' : 'div'

  return (
    <Tag
      {...(onOpen ? { type: 'button' as const, onClick: onOpen } : {})}
      className={cn(
        'relative flex w-full overflow-hidden rounded-3xl text-left',
        cupon.usable ? 'bg-brand text-brand-on shadow-[0_14px_30px_-18px_rgb(var(--brand-primary))]' : 'border border-ink/[0.07] bg-white text-ink/60',
      )}
    >
      <div className="min-w-0 flex-1 p-5">
        <p className={cn('flex items-center gap-1.5 text-xs font-medium', cupon.usable ? 'opacity-80' : 'text-ink/50')}>
          <Origen className="h-3.5 w-3.5" aria-hidden="true" />
          {cupon.origen}
          {cupon.nuevo && <span className="ml-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-ink">NUEVO</span>}
        </p>
        <p className={cn('mt-1 font-display text-lg font-bold leading-snug', !cupon.usable && 'text-ink/80')}>{cupon.titulo}</p>
        <p className={cn('mt-1 text-xs', cupon.usable ? 'opacity-75' : 'text-ink/45')}>
          {cupon.usable
            ? cupon.expira
              ? `Válido hasta el ${fecha(cupon.expira)}`
              : 'Sin fecha de caducidad'
            : cupon.usado
              ? `Usado el ${fecha(cupon.usado)}`
              : `Conseguido el ${fecha(cupon.fecha)}`}
        </p>
      </div>

      {/* Talón del ticket */}
      <div
        className={cn(
          'relative flex w-28 shrink-0 flex-col items-center justify-center gap-1 border-l-2 border-dashed px-3 text-center',
          cupon.usable ? 'border-current/30' : 'border-ink/10',
        )}
        style={cupon.usable ? { borderColor: 'rgb(var(--brand-primary-on) / 0.35)' } : undefined}
      >
        <span className="absolute -left-[11px] -top-2.5 h-5 w-5 rounded-full bg-paper" aria-hidden="true" />
        <span className="absolute -bottom-2.5 -left-[11px] h-5 w-5 rounded-full bg-paper" aria-hidden="true" />
        <EstadoIcon className="h-5 w-5" aria-hidden="true" />
        <span className="text-xs font-semibold">{cupon.usable ? 'Ver código' : estado.text}</span>
      </div>
    </Tag>
  )
}
