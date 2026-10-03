'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Inbox, Mail, Phone, UserCheck, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { SECTORES } from '@/lib/sectores'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type Estado = 'nueva' | 'contactada' | 'convertida' | 'descartada'

interface Solicitud {
  id: string
  nombre_negocio: string
  nombre_contacto: string
  email: string
  telefono?: string | null
  sector?: string | null
  plan_interes?: string | null
  mensaje?: string | null
  origen?: string | null
  estado: Estado
  created_at: string
  asignada_en?: string | null
  comercial?: { id: string; nombre: string; email: string } | null
}

interface Comercial {
  id: string
  nombre: string
  email: string
  activo: boolean
}

const ESTADOS: Record<Estado, string> = {
  nueva: 'Nueva',
  contactada: 'Contactada',
  convertida: 'Convertida',
  descartada: 'Descartada',
}

const nombreSector = (slug?: string | null) =>
  !slug ? null : slug === 'otro' ? 'Otro' : (SECTORES[slug]?.nombre ?? slug)

/** Negocios que han rellenado el formulario de contacto de la web (/contacto) */
export default function SolicitudesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<Estado | 'todas'>('todas')
  const [comerciales, setComerciales] = useState<Comercial[]>([])
  const [asignando, setAsignando] = useState<Solicitud | null>(null)
  const [comercialElegido, setComercialElegido] = useState('')
  const [enviando, setEnviando] = useState(false)

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('superadmin_token')}` })

  useEffect(() => {
    if (!localStorage.getItem('superadmin_token')) {
      router.push('/superadmin/login')
      return
    }
    fetch(`${API_URL}/api/superadmin/solicitudes-contacto`, { headers: headers() })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          router.push('/superadmin/login')
          return
        }
        if (!res.ok) throw new Error()
        setSolicitudes(await res.json())
      })
      .catch(() => toast({ title: 'No se pudieron cargar las solicitudes', variant: 'destructive' }))
      .finally(() => setLoading(false))

    fetch(`${API_URL}/api/comerciales`, { headers: headers() })
      .then((res) => (res.ok ? res.json() : []))
      .then((lista: Comercial[]) => setComerciales(Array.isArray(lista) ? lista.filter((c) => c.activo) : []))
      .catch(() => setComerciales([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function cambiarEstado(id: string, estado: Estado) {
    const anterior = solicitudes
    setSolicitudes((lista) => lista.map((s) => (s.id === id ? { ...s, estado } : s)))
    const res = await fetch(`${API_URL}/api/superadmin/solicitudes-contacto/${id}`, {
      method: 'PATCH',
      headers: { ...headers(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    }).catch(() => null)
    if (!res?.ok) {
      setSolicitudes(anterior)
      toast({ title: 'No se pudo cambiar el estado', variant: 'destructive' })
    }
  }

  async function asignar() {
    if (!asignando || !comercialElegido) return
    setEnviando(true)
    try {
      const res = await fetch(`${API_URL}/api/superadmin/solicitudes-contacto/${asignando.id}/asignar`, {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ comercial_id: comercialElegido }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || 'No se pudo pasar la solicitud')
      setSolicitudes((lista) => lista.map((s) => (s.id === asignando.id ? { ...s, ...data } : s)))
      toast({ title: 'Solicitud pasada', description: `Ya está en el CRM de ${data?.comercial?.nombre ?? 'el comercial'}.` })
      setAsignando(null)
    } catch (err) {
      toast({ title: 'No se pudo pasar', description: err instanceof Error ? err.message : undefined, variant: 'destructive' })
    } finally {
      setEnviando(false)
    }
  }

  const visibles = useMemo(
    () => (filtro === 'todas' ? solicitudes : solicitudes.filter((s) => s.estado === filtro)),
    [solicitudes, filtro],
  )
  const nuevas = solicitudes.filter((s) => s.estado === 'nueva').length

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/superadmin/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al panel
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Solicitudes de contacto</h1>
            <p className="mt-1 text-muted-foreground">
              Negocios que han pedido información desde la web
              {nuevas > 0 ? ` · ${nuevas} ${nuevas === 1 ? 'nueva' : 'nuevas'}` : ''}.
            </p>
          </div>
          <Select value={filtro} onValueChange={(v) => setFiltro(v as Estado | 'todas')}>
            <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filtrar por estado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {Object.entries(ESTADOS).map(([valor, texto]) => (
                <SelectItem key={valor} value={valor}>
                  {texto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-8 space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)
          ) : visibles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-16 text-center text-muted-foreground">
                <Inbox className="h-10 w-10" aria-hidden="true" />
                <p className="mt-3">No hay solicitudes{filtro !== 'todas' ? ' con este estado' : ' todavía'}.</p>
              </CardContent>
            </Card>
          ) : (
            visibles.map((s) => (
              <Card key={s.id} className={s.estado === 'nueva' ? 'border-l-4 border-l-teal-600' : undefined}>
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold">{s.nombre_negocio}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.nombre_contacto} ·{' '}
                        {new Date(s.created_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {nombreSector(s.sector) && <Badge variant="secondary">{nombreSector(s.sector)}</Badge>}
                        {s.plan_interes && <Badge variant="secondary">Plan {s.plan_interes}</Badge>}
                        {s.origen && <Badge variant="outline">Desde {s.origen}</Badge>}
                      </div>
                    </div>
                    <Select value={s.estado} onValueChange={(v) => cambiarEstado(s.id, v as Estado)}>
                      <SelectTrigger className="w-full sm:w-[160px]" aria-label={`Estado de ${s.nombre_negocio}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ESTADOS).map(([valor, texto]) => (
                          <SelectItem key={valor} value={valor}>
                            {texto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {s.mensaje && <p className="mt-4 whitespace-pre-wrap rounded-lg bg-muted/60 p-3 text-sm">{s.mensaje}</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                    <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1.5 font-medium hover:underline">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      {s.email}
                    </a>
                    {s.telefono && (
                      <a href={`tel:${s.telefono.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 font-medium hover:underline">
                        <Phone className="h-4 w-4" aria-hidden="true" />
                        {s.telefono}
                      </a>
                    )}
                    <span className="sm:ml-auto">
                      {s.comercial ? (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <UserCheck className="h-4 w-4" aria-hidden="true" />
                          Pasada a <span className="font-medium text-foreground">{s.comercial.nombre}</span>
                          {s.asignada_en && ` el ${new Date(s.asignada_en).toLocaleDateString('es-ES')}`}
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setComercialElegido('')
                            setAsignando(s)
                          }}
                        >
                          <UserPlus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                          Pasar a un comercial
                        </Button>
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!asignando} onOpenChange={(open) => !open && setAsignando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pasar a un comercial</DialogTitle>
            <DialogDescription>
              {asignando?.nombre_negocio} aparecerá como prospecto nuevo en el CRM del comercial, con sus datos y su
              mensaje. Le avisaremos por email.
            </DialogDescription>
          </DialogHeader>
          {comerciales.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay comerciales activos. Créalos en Equipo comercial.</p>
          ) : (
            <Select value={comercialElegido} onValueChange={setComercialElegido}>
              <SelectTrigger aria-label="Comercial">
                <SelectValue placeholder="Elige un comercial" />
              </SelectTrigger>
              <SelectContent>
                {comerciales.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre} · {c.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAsignando(null)}>
              Cancelar
            </Button>
            <Button onClick={asignar} disabled={!comercialElegido || enviando}>
              {enviando ? 'Pasando…' : 'Pasar solicitud'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
