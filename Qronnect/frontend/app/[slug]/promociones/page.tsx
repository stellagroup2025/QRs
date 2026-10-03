'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowRight, Clock, Gift, Lock, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ClientEmpty, ClientPage, ClientSkeleton } from '@/components/cliente/ClientPage'
import { useConfirmDialog } from '@/hooks/use-confirm-dialog'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Promocion {
  id: string
  titulo: string
  descripcion: string
  tipo: 'descuento_fijo' | 'descuento_porcentaje' | 'producto_gratis'
  valor: number
  puntos_requeridos: number
  imagen_url?: string
  fecha_inicio: string
  fecha_fin?: string
  cantidad_disponible?: number
  cantidad_canjeada: number
  disponible: boolean
}

export default function PromocionesPage() {
  const params = useParams()
  const router = useRouter()
  const { confirm } = useConfirmDialog()
  const slug = params.slug as string

  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [loading, setLoading] = useState(true)
  const [misPuntos, setMisPuntos] = useState(0)
  const [canjeando, setCanjeando] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = localStorage.getItem(`client_token_${slug}`)
    if (!token) {
      router.push(`/${slug}/recuperar`)
      return
    }

    setLoading(true)
    try {
      // Obtener promociones disponibles
      const promosResponse = await fetch(`${API_URL}/api/clientes/promociones`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      })

      if (promosResponse.ok) {
        const promosData = await promosResponse.json()
        setPromociones(promosData)
      } else {
        console.error('Error al cargar promociones:', promosResponse.status)
        toast.error('Error al cargar promociones')
      }

      // Obtener mis puntos
      const puntosResponse = await fetch(`${API_URL}/api/clientes/me/puntos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
      })

      if (puntosResponse.ok) {
        const puntosData = await puntosResponse.json()
        setMisPuntos(puntosData.puntos_totales)
      } else {
        console.error('Error al cargar puntos:', puntosResponse.status)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCanjear = async (promocion: Promocion) => {
    const token = localStorage.getItem(`client_token_${slug}`)
    if (!token) return

    if (misPuntos < promocion.puntos_requeridos) {
      toast.error('Puntos insuficientes', {
        description: `Te faltan ${promocion.puntos_requeridos - misPuntos} puntos para canjear esta promoción`
      })
      return
    }

    const confirmed = await confirm({
      title: '¿Canjear promoción?',
      description: `Usarás ${promocion.puntos_requeridos} puntos para obtener "${promocion.titulo}"`,
      confirmText: 'Canjear',
    })
    if (!confirmed) return

    setCanjeando(promocion.id)
    try {
      const response = await fetch(`${API_URL}/api/clientes/promociones/canjear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': slug,
        },
        body: JSON.stringify({
          id_promocion: promocion.id,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al canjear promoción')
      }

      toast.success('¡Promoción canjeada!', {
        description: 'Lo tienes en "Mis cupones"'
      })

      // Actualizar datos
      fetchData()

      // Redirigir a mis canjes
      router.push(`/${slug}/mis-canjes`)
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al canjear', {
        description: error.message || 'No se pudo canjear la promoción'
      })
    } finally {
      setCanjeando(null)
    }
  }

  const getValorLabel = (tipo: string, valor: number) => {
    switch (tipo) {
      case 'descuento_fijo': return `${valor.toLocaleString('es-ES', { maximumFractionDigits: 2 })} € de descuento`
      case 'descuento_porcentaje': return `${valor}% de descuento`
      case 'producto_gratis': return 'Gratis'
      default: return ''
    }
  }

  const puedeCanjear = (promocion: Promocion) => {
    return misPuntos >= promocion.puntos_requeridos && promocion.disponible
  }

  if (loading) {
    return (
      <ClientPage>
        <ClientSkeleton blocks={3} />
      </ClientPage>
    )
  }

  // Primero las que ya puede canjear, luego por puntos
  const ordenadas = [...promociones].sort(
    (a, b) => Number(puedeCanjear(b)) - Number(puedeCanjear(a)) || a.puntos_requeridos - b.puntos_requeridos,
  )

  return (
    <ClientPage
      title="Premios"
      subtitle="Cambia tus puntos por descuentos y regalos."
      actions={
        <div className="rounded-2xl bg-brand px-4 py-2 text-right text-brand-on">
          <p className="font-display text-2xl font-bold leading-none tabular-nums">{misPuntos.toLocaleString('es-ES')}</p>
          <p className="mt-0.5 text-[11px] font-medium opacity-80">tus puntos</p>
        </div>
      }
    >
      {ordenadas.length === 0 ? (
        <ClientEmpty
          icon={<Gift className="h-7 w-7" aria-hidden="true" />}
          title="Aún no hay premios"
          text="Estamos preparando nuevos premios. Mientras, sigue sumando puntos en cada visita."
        />
      ) : (
        <ul className="space-y-4">
          {ordenadas.map((promo) => {
            const canjeable = puedeCanjear(promo)
            const faltan = Math.max(0, promo.puntos_requeridos - misPuntos)
            const progreso = promo.puntos_requeridos > 0 ? Math.min(1, misPuntos / promo.puntos_requeridos) : 1
            const quedan = promo.cantidad_disponible != null ? promo.cantidad_disponible - promo.cantidad_canjeada : null
            const valor = getValorLabel(promo.tipo, promo.valor)

            return (
              <li key={promo.id} className="overflow-hidden rounded-3xl border border-ink/[0.07] bg-white">
                <div className="flex gap-4 p-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-brand/10">
                    {promo.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={promo.imagen_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-brand">
                        <Gift className="h-9 w-9" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {valor && <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">{valor}</p>}
                    <h2 className="mt-0.5 font-display text-lg font-bold leading-snug">{promo.titulo}</h2>
                    {promo.descripcion && <p className="mt-1 line-clamp-2 text-sm text-ink/60">{promo.descripcion}</p>}
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/55">
                      {quedan != null && (
                        <span className="inline-flex items-center gap-1">
                          <Package className="h-3.5 w-3.5" aria-hidden="true" />
                          Quedan {Math.max(0, quedan)}
                        </span>
                      )}
                      {promo.fecha_fin && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          Hasta el {new Date(promo.fecha_fin).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t border-ink/[0.07] px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold tabular-nums">{promo.puntos_requeridos.toLocaleString('es-ES')} puntos</p>
                    {!canjeable && faltan > 0 && (
                      <>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.07]">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${progreso * 100}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-ink/55">Te faltan {faltan.toLocaleString('es-ES')}</p>
                      </>
                    )}
                  </div>
                  {canjeable ? (
                    <button
                      type="button"
                      onClick={() => handleCanjear(promo)}
                      disabled={canjeando === promo.id}
                      className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-brand-on transition-transform active:scale-95 disabled:opacity-60"
                    >
                      {canjeando === promo.id ? 'Canjeando…' : 'Canjear'}
                      {canjeando !== promo.id && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  ) : (
                    <span
                      className={cn(
                        'flex h-11 shrink-0 items-center gap-2 rounded-full border border-dashed border-ink/15 px-4 text-sm font-medium text-ink/50',
                      )}
                    >
                      <Lock className="h-4 w-4" aria-hidden="true" />
                      {faltan > 0 ? 'Bloqueado' : 'No disponible'}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </ClientPage>
  )
}
