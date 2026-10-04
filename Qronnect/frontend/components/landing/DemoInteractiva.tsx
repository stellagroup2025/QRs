'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import confetti from 'canvas-confetti'
import {
  Check, ChevronRight, Gift, Home, Megaphone, QrCode, RotateCcw, ScanLine, Share2, Sparkles, Users,
} from 'lucide-react'
import type { SectorShowcase } from '@/lib/sectores'
import { play } from '@/lib/sfx'
import { cn } from '@/lib/utils'
import { LotusMark } from '@/components/sector/sector-icons'

type Pantalla = 'inicio' | 'maquina' | 'amigos'
type Accion = 'escanear' | 'maquina' | 'amigo' | 'promo'

const COSTE_TIRADA = 50
const PUNTOS_AMIGO = 50
const AMIGOS = ['Lucía', 'Marcos', 'Irene', 'Dani', 'Sara']
const ALTO_FILA = 56

interface Aviso {
  id: number
  icono: 'promo' | 'amigo' | 'premio'
  titulo: string
  texto: string
}

function codigo() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let r = ''
  for (let i = 0; i < 8; i++) r += A[Math.floor(Math.random() * A.length)] + (i === 3 ? '-' : '')
  return r
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches), [])
  return reduced
}

/** Número que cuenta hasta su nuevo valor cuando cambia */
function Contador({ valor }: { valor: number }) {
  const [mostrado, setMostrado] = useState(valor)
  const desde = useRef(valor)

  useEffect(() => {
    const inicio = desde.current
    if (inicio === valor) return
    const t0 = performance.now()
    let raf = 0
    const paso = (t: number) => {
      const k = Math.min(1, (t - t0) / 700)
      const v = Math.round(inicio + (valor - inicio) * (1 - Math.pow(1 - k, 3)))
      setMostrado(v)
      if (k < 1) raf = requestAnimationFrame(paso)
      else desde.current = valor
    }
    raf = requestAnimationFrame(paso)
    return () => {
      cancelAnimationFrame(raf)
      desde.current = valor
    }
  }, [valor])

  return <>{mostrado.toLocaleString('es-ES')}</>
}

/**
 * "Pruébalo tú": un móvil con la app del cliente que responde de verdad.
 * El visitante escanea en caja, junta sellos, desbloquea su premio, juega a la máquina,
 * invita a un amigo y recibe una promoción, con la paleta y los premios de su sector.
 */
export function DemoInteractiva({ sector }: { sector: SectorShowcase }) {
  const { demo, demoBusiness, phone } = sector
  const reduced = useReducedMotion()
  const telefonoRef = useRef<HTMLDivElement>(null)
  const inclinacionRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])

  const inicial = {
    puntos: phone.points,
    sellos: Math.max(0, demo.sellos - 3),
  }
  const [puntos, setPuntos] = useState(inicial.puntos)
  const [sellos, setSellos] = useState(inicial.sellos)
  const [ultimoSello, setUltimoSello] = useState<number | null>(null)
  const [pantalla, setPantalla] = useState<Pantalla>('inicio')
  const [escaneo, setEscaneo] = useState<'no' | 'leyendo' | 'ok'>('no')
  const [ganados, setGanados] = useState<{ id: number; texto: string }[]>([])
  const [premio, setPremio] = useState<{ codigo: string; canjeado: boolean } | null>(null)
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const [promo, setPromo] = useState(false)
  const [doble, setDoble] = useState(false)
  const [amigos, setAmigos] = useState<string[]>([])
  const [invitando, setInvitando] = useState(false)
  const [girando, setGirando] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)
  const [fila, setFila] = useState(0)
  const [conTransicion, setConTransicion] = useState(false)
  const [activa, setActiva] = useState<Accion | null>(null)
  const [mensaje, setMensaje] = useState('')

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, reduced ? Math.min(ms, 60) : ms))
  }, [reduced])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const colores = [sector.palette.primary, sector.palette.accentOnDark ?? sector.palette.soft, '#FFD166', '#FFFFFF']

  const lanzarConfeti = useCallback(() => {
    if (reduced) return
    const r = telefonoRef.current?.getBoundingClientRect()
    if (!r) return
    confetti({
      particleCount: 90,
      spread: 75,
      startVelocity: 38,
      origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height * 0.4) / window.innerHeight },
      colors: colores,
      disableForReducedMotion: true,
      zIndex: 60,
    })
  }, [reduced, colores])

  const sumar = useCallback((n: number) => {
    setPuntos((p) => p + n)
    const id = Date.now() + Math.random()
    setGanados((g) => [...g, { id, texto: `+${n}` }])
    later(() => setGanados((g) => g.filter((x) => x.id !== id)), 1200)
  }, [later])

  const mostrarAviso = useCallback((a: Omit<Aviso, 'id'>) => {
    const id = Date.now()
    setAviso({ ...a, id })
    play('notify')
    later(() => setAviso((actual) => (actual?.id === id ? null : actual)), 4200)
  }, [later])

  // ───────── Acciones ─────────
  const escanear = useCallback(() => {
    if (escaneo !== 'no' || premio) return
    setActiva('escanear')
    setPantalla('inicio')
    setEscaneo('leyendo')
    play('tap')
    later(() => {
      play('scan')
      setEscaneo('ok')
      const n = doble ? demo.puntos * 2 : demo.puntos
      sumar(n)
      if (doble) setDoble(false)
      setMensaje(`Escaneado en caja: ${n} puntos y un sello más.`)
      later(() => {
        setEscaneo('no')
        play('stamp')
        const nuevo = Math.min(demo.sellos, sellos + 1)
        setSellos(nuevo)
        setUltimoSello(nuevo - 1)
        if (nuevo >= demo.sellos) {
          later(() => {
            setPremio({ codigo: codigo(), canjeado: false })
            play('unlock')
            lanzarConfeti()
            setMensaje(`Premio conseguido: ${phone.reward.title}.`)
          }, 550)
        }
      }, 900)
    }, 1300)
  }, [escaneo, premio, doble, sellos, demo.puntos, demo.sellos, sumar, later, lanzarConfeti, phone.reward.title])

  const canjear = () => {
    if (!premio) return
    play('coin')
    setPremio({ ...premio, canjeado: true })
    setMensaje('Cupón canjeado en caja. La tarjeta vuelve a empezar.')
    later(() => {
      setPremio(null)
      setSellos(0)
      setUltimoSello(null)
    }, 1600)
  }

  const tirar = useCallback(() => {
    setActiva('maquina')
    setPantalla('maquina')
    if (girando) return
    if (puntos < COSTE_TIRADA) {
      setMensaje(`Necesitas ${COSTE_TIRADA} puntos para tirar. Escanea en caja para sumar más.`)
      return
    }
    setPuntos((p) => p - COSTE_TIRADA)
    setResultado(null)
    setGirando(true)
    play('spin')
    const elegido = Math.floor(Math.random() * demo.maquina.length)
    const destino = demo.maquina.length * 6 + elegido
    // Primero vuelve arriba sin animación y luego gira hasta el premio
    setConTransicion(false)
    setFila(fila % demo.maquina.length)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setConTransicion(true)
        setFila(destino)
      }),
    )
    if (!reduced) [0, 120, 260, 420, 600, 820, 1080, 1380, 1720, 2100].forEach((ms) => later(() => play('tick'), ms))
    later(() => {
      const premioMaquina = demo.maquina[elegido]
      setGirando(false)
      setResultado(premioMaquina)
      play('win')
      lanzarConfeti()
      if (/doble/i.test(premioMaquina)) setDoble(true)
      setMensaje(`La máquina de premios ha dado: ${premioMaquina}.`)
    }, 2500)
  }, [girando, puntos, demo.maquina, fila, reduced, later, lanzarConfeti])

  const invitar = useCallback(() => {
    setActiva('amigo')
    setPantalla('amigos')
    if (invitando) return
    setInvitando(true)
    play('send')
    later(() => {
      const nombre = AMIGOS[amigos.length % AMIGOS.length]
      setAmigos((a) => [...a, nombre])
      setInvitando(false)
      sumar(PUNTOS_AMIGO)
      mostrarAviso({ icono: 'amigo', titulo: `${nombre} se ha unido con tu código`, texto: `+${PUNTOS_AMIGO} puntos para ti y para ${nombre}` })
      setMensaje(`${nombre} se ha unido con tu código. Los dos ganáis ${PUNTOS_AMIGO} puntos.`)
    }, 1400)
  }, [invitando, amigos.length, sumar, mostrarAviso, later])

  const recibirPromo = useCallback(() => {
    setActiva('promo')
    setPantalla('inicio')
    setPromo(true)
    mostrarAviso({ icono: 'promo', titulo: `${demoBusiness.name} · ${demo.promo.titulo}`, texto: demo.promo.texto })
    setMensaje(`Promoción recibida: ${demo.promo.titulo}. ${demo.promo.texto}.`)
  }, [demoBusiness.name, demo.promo, mostrarAviso])

  const reiniciar = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPuntos(inicial.puntos)
    setSellos(inicial.sellos)
    setUltimoSello(null)
    setPantalla('inicio')
    setEscaneo('no')
    setGanados([])
    setPremio(null)
    setAviso(null)
    setPromo(false)
    setDoble(false)
    setAmigos([])
    setInvitando(false)
    setGirando(false)
    setResultado(null)
    setActiva(null)
    play('back')
    setMensaje('Demo reiniciada.')
  }

  // ───────── Inclinación 3D al mover el ratón ─────────
  const inclinar = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== 'mouse' || !inclinacionRef.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    inclinacionRef.current.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`
  }
  const enderezar = () => {
    if (inclinacionRef.current) inclinacionRef.current.style.transform = ''
  }

  const faltan = demo.sellos - sellos
  const acciones: { id: Accion; icono: typeof ScanLine; titulo: string; texto: string; hacer: () => void }[] = [
    { id: 'escanear', icono: ScanLine, titulo: 'Escanea en caja', texto: `${demo.accion}: +${demo.puntos} puntos y un sello`, hacer: escanear },
    { id: 'maquina', icono: Sparkles, titulo: 'Juega a la máquina de premios', texto: `Cambia ${COSTE_TIRADA} puntos por una tirada`, hacer: tirar },
    { id: 'amigo', icono: Users, titulo: 'Invita a un amigo', texto: 'Cuando se une, los dos ganáis puntos', hacer: invitar },
    { id: 'promo', icono: Megaphone, titulo: 'Recibe una promoción', texto: 'Lo que envías desde tu panel', hacer: recibirPromo },
  ]

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,500px)_auto] lg:justify-between lg:gap-16">
      {/* Acciones */}
      <div className="order-2 w-full lg:order-1">
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-1">
          {acciones.map(({ id, icono: Icono, titulo, texto, hacer }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  hacer()
                  // En móvil el teléfono queda arriba: lo traemos a la vista para ver qué pasa
                  if (window.innerWidth < 1024) {
                    const r = telefonoRef.current?.getBoundingClientRect()
                    if (r && (r.top < 64 || r.bottom > window.innerHeight)) {
                      telefonoRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
                      window.scrollBy({ top: -80 })
                    }
                  }
                }}
                className={cn(
                  'group flex h-full w-full flex-col items-start gap-2.5 rounded-2xl border bg-white/[0.04] p-3 text-left sm:flex-row sm:items-center sm:gap-4 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--s-on-dark)] hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--s-on-dark)]/40',
                  activa === id ? 'border-[var(--s-on-dark)] bg-white/[0.08]' : 'border-white/10',
                )}
              >
                <span
                  className={cn(
                    'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 bg-[var(--s-primary)] text-[var(--s-primary-on)] transition-transform group-hover:scale-105',
                    id === 'escanear' && activa === null && 'ping-dot',
                  )}
                >
                  <Icono className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-snug text-white sm:text-base">{titulo}</span>
                  <span className="hidden text-sm text-white/60 sm:block">{texto}</span>
                </span>
                <ChevronRight className="hidden h-5 w-5 shrink-0 sm:block text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--s-on-dark)]" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={reiniciar}
          className="mt-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Empezar de nuevo
        </button>
        <p className="sr-only" aria-live="polite">{mensaje}</p>
      </div>

      {/* Móvil */}
      <div
        className="order-1 flex justify-center [perspective:1400px] lg:order-2"
        onPointerMove={inclinar}
        onPointerLeave={enderezar}
      >
        <div ref={inclinacionRef} className="transition-transform duration-300 ease-out [transform-style:preserve-3d]">
          <div
            ref={telefonoRef}
            style={{ '--s-ink': sector.palette.ink } as CSSProperties}
            className="relative w-[280px] rounded-[48px] bg-[#16121A] p-[10px] sm:w-[300px] sm:rounded-[50px] sm:p-[11px] shadow-[0_50px_90px_-30px_rgba(0,0,0,0.75),0_0_0_2px_rgba(255,255,255,0.06)]"
          >
            <div className="relative flex h-[540px] flex-col overflow-hidden rounded-[38px] bg-white text-[var(--s-ink)] sm:h-[600px] sm:rounded-[40px]">
              {/* Barra de estado */}
              <div className="relative flex h-10 shrink-0 items-center justify-between px-7 text-[11px] font-semibold text-[#16121A]">
                <span>9:41</span>
                <span className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-[#16121A]" />
                <span className="flex items-center gap-1">
                  <span className="h-2 w-3 rounded-sm bg-[#16121A]" />
                  <span className="h-2 w-4 rounded-sm border border-[#16121A]" />
                </span>
              </div>

              {/* Notificación */}
              {aviso && (
                <div key={aviso.id} className="notif-in absolute inset-x-2.5 top-11 z-30 flex items-start gap-2.5 rounded-2xl bg-white/95 p-3 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--s-primary)] text-[var(--s-primary-on)]">
                    {aviso.icono === 'promo' ? <Megaphone className="h-4 w-4" aria-hidden="true" /> : aviso.icono === 'amigo' ? <Users className="h-4 w-4" aria-hidden="true" /> : <Gift className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 text-[12px] leading-snug">
                    <span className="block font-semibold">{aviso.titulo}</span>
                    <span className="block text-[var(--s-ink)]/65">{aviso.texto}</span>
                  </span>
                </div>
              )}

              {/* Cabecera del negocio */}
              <div className="flex shrink-0 items-center gap-2 px-4 py-2">
                <LotusMark className="h-7 w-8 text-[var(--s-primary)]" />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="font-display text-[15px] font-bold">{demoBusiness.name}</p>
                  <p className="truncate text-[11px] text-[var(--s-ink)]/60">{demoBusiness.tagline}</p>
                </div>
                <span className="relative rounded-full bg-[var(--s-softer)] px-2.5 py-1 text-[11px] font-bold tabular-nums ring-1 ring-[var(--s-soft)]">
                  <Contador valor={puntos} /> pts
                  {ganados.map((g) => (
                    <span key={g.id} className="float-up pointer-events-none absolute left-1/2 top-0 whitespace-nowrap rounded-full bg-[var(--s-primary)] px-2 py-0.5 text-[11px] font-bold text-[var(--s-primary-on)] shadow">
                      {g.texto}
                    </span>
                  ))}
                </span>
              </div>

              {/* Pantallas */}
              <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-3">
                {pantalla === 'inicio' && (
                  <div className="space-y-2.5">
                    {promo && (
                      <div className="pop-in flex items-center gap-2.5 rounded-2xl bg-[var(--s-primary)] p-3 text-[var(--s-primary-on)]">
                        <Megaphone className="h-5 w-5 shrink-0" aria-hidden="true" />
                        <span className="text-[12px] leading-snug">
                          <span className="block font-bold">{demo.promo.titulo}</span>
                          {demo.promo.texto}
                        </span>
                      </div>
                    )}

                    <div className="rounded-2xl bg-[var(--s-softer)] p-3.5 ring-1 ring-[var(--s-soft)]">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-[var(--s-ink)]/70">Tu tarjeta de sellos</p>
                        <p className="text-[11px] font-semibold tabular-nums">
                          {sellos}/{demo.sellos}
                        </p>
                      </div>
                      <div
                        className={cn('mt-2.5 grid gap-1.5', demo.sellos === 8 ? 'grid-cols-4' : demo.sellos === 6 ? 'grid-cols-6' : 'grid-cols-5')}
                        aria-label={`${sellos} de ${demo.sellos} sellos`}
                      >
                        {Array.from({ length: demo.sellos }).map((_, i) => (
                          <span
                            key={i}
                            className={cn(
                              'flex aspect-square items-center justify-center rounded-full border-2 border-dashed',
                              i < sellos ? 'border-transparent bg-[var(--s-primary)] text-[var(--s-primary-on)]' : 'border-[var(--s-ink)]/15',
                              i === demo.sellos - 1 && i >= sellos && 'border-[var(--s-primary)]/50',
                            )}
                          >
                            {i < sellos ? (
                              <Check key={i === ultimoSello ? `n${i}` : i} className={cn('h-4 w-4', i === ultimoSello && 'stamp-in')} strokeWidth={3} aria-hidden="true" />
                            ) : i === demo.sellos - 1 ? (
                              <Gift className="h-3.5 w-3.5 text-[var(--s-primary)]" aria-hidden="true" />
                            ) : null}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--s-soft)]">
                        <div
                          className="h-full rounded-full bg-[var(--s-primary)] transition-[width] duration-700 ease-out"
                          style={{ width: `${(sellos / demo.sellos) * 100}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-[10.5px] text-[var(--s-ink)]/65">
                        {faltan > 0 ? `Te ${faltan === 1 ? 'falta 1 sello' : `faltan ${faltan} sellos`} para: ${phone.reward.title.toLowerCase()}` : '¡Tarjeta completa!'}
                      </p>
                    </div>

                    {doble && (
                      <p className="pop-in rounded-xl bg-amber-100 px-3 py-2 text-[11px] font-semibold text-amber-900">
                        Doble de puntos en tu próxima visita
                      </p>
                    )}

                    <ul className="space-y-1.5">
                      {[
                        { icono: Sparkles, label: 'Máquina de premios', ir: () => setPantalla('maquina') },
                        { icono: Users, label: 'Invita a un amigo', ir: () => setPantalla('amigos') },
                      ].map(({ icono: Icono, label, ir }) => (
                        <li key={label}>
                          <button
                            type="button"
                            onClick={() => {
                              play('tap')
                              ir()
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl bg-white px-3 py-2 text-left ring-1 ring-black/5 hover:bg-[var(--s-softer)]"
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--s-softer)] text-[var(--s-primary)]">
                              <Icono className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span className="flex-1 text-[12px] font-medium">{label}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-[var(--s-ink)]/30" aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[var(--s-ink)]/15 p-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--s-softer)] text-[var(--s-primary)]">
                        <QrCode className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <p className="text-[11px] leading-snug text-[var(--s-ink)]/65">
                        Enseña tu QR en caja para sumar. <span className="font-semibold text-[var(--s-ink)]">Toca el botón del centro.</span>
                      </p>
                    </div>
                  </div>
                )}

                {pantalla === 'maquina' && (
                  <div className="flex h-full flex-col">
                    <p className="font-display text-lg font-bold">Máquina de premios</p>
                    <p className="text-[11px] text-[var(--s-ink)]/60">Cada tirada cuesta {COSTE_TIRADA} puntos</p>
                    <div className="relative mt-4 overflow-hidden rounded-2xl p-3" style={{ background: sector.palette.dark }}>
                      <div className="relative overflow-hidden rounded-xl bg-white" style={{ height: ALTO_FILA }}>
                        <ul
                          className="absolute inset-x-0 top-0"
                          style={{
                            transform: `translateY(-${fila * ALTO_FILA}px)`,
                            transition: conTransicion ? `transform ${reduced ? 0.05 : 2.4}s cubic-bezier(0.12, 0.8, 0.18, 1)` : 'none',
                          }}
                          aria-hidden="true"
                        >
                          {Array.from({ length: 8 }).flatMap((_, vuelta) =>
                            demo.maquina.map((p, i) => (
                              <li key={`${vuelta}-${i}`} className="flex items-center justify-center px-3 text-center font-display text-[15px] font-bold" style={{ height: ALTO_FILA }}>
                                {p}
                              </li>
                            )),
                          )}
                        </ul>
                        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),transparent_30%,transparent_70%,rgba(0,0,0,0.18))]" />
                      </div>
                      <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <span
                            key={i}
                            className={cn('h-1.5 w-1.5 rounded-full', girando ? 'animate-pulse bg-[#FFD166]' : 'bg-white/30')}
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                    </div>
                    {resultado && !girando && (
                      <div className="pop-in mt-3 rounded-2xl bg-[var(--s-softer)] p-3 text-center ring-1 ring-[var(--s-soft)]">
                        <p className="text-[11px] text-[var(--s-ink)]/60">¡Te ha tocado!</p>
                        <p className="font-display text-[15px] font-bold">{resultado}</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={tirar}
                      disabled={girando}
                      className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--s-primary)] px-4 text-sm font-semibold text-[var(--s-primary-on)] transition-transform active:scale-95 disabled:opacity-60"
                    >
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      {girando ? 'Girando…' : puntos < COSTE_TIRADA ? `Te faltan ${COSTE_TIRADA - puntos} puntos` : `Tirar · ${COSTE_TIRADA} puntos`}
                    </button>
                  </div>
                )}

                {pantalla === 'amigos' && (
                  <div className="flex h-full flex-col">
                    <p className="font-display text-lg font-bold">Invita a un amigo</p>
                    <p className="text-[11px] text-[var(--s-ink)]/60">Cuando se une con tu código, los dos ganáis {PUNTOS_AMIGO} puntos</p>
                    <div className="mt-4 rounded-2xl bg-[var(--s-softer)] p-4 text-center ring-1 ring-[var(--s-soft)]">
                      <p className="text-[11px] text-[var(--s-ink)]/60">Tu código</p>
                      <p className="mt-1 font-mono text-xl font-bold tracking-[0.2em]">ANA-7K2</p>
                    </div>
                    {amigos.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {amigos.map((a, i) => (
                          <li key={i} className="pop-in flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 text-[12px] ring-1 ring-black/5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--s-primary)] text-[11px] font-bold text-[var(--s-primary-on)]">
                              {a[0]}
                            </span>
                            <span className="flex-1 font-medium">{a}</span>
                            <span className="font-semibold text-emerald-600">+{PUNTOS_AMIGO}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <button
                      type="button"
                      onClick={invitar}
                      disabled={invitando}
                      className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#1FA855] px-4 text-sm font-semibold text-white transition-transform active:scale-95 disabled:opacity-70"
                    >
                      <Share2 className="h-4 w-4" aria-hidden="true" />
                      {invitando ? 'Esperando a que se una…' : 'Compartir por WhatsApp'}
                    </button>
                  </div>
                )}

                {/* Escáner en caja */}
                {escaneo !== 'no' && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0d0d10]/92 px-6 text-center text-white backdrop-blur-sm">
                    {escaneo === 'leyendo' ? (
                      <>
                        <div className="relative h-36 w-36 rounded-2xl border-2 border-white/25 p-4">
                          <QrCode className="h-full w-full text-white/85" aria-hidden="true" />
                          <span className="scan-line absolute inset-x-2 h-0.5 rounded-full bg-[var(--s-on-dark,#6FE0D6)] shadow-[0_0_14px_2px_var(--s-on-dark,#6FE0D6)]" />
                        </div>
                        <p className="mt-5 text-sm text-white/75">Tu equipo escanea tu QR…</p>
                      </>
                    ) : (
                      <div className="pop-in">
                        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check className="h-8 w-8" strokeWidth={3} aria-hidden="true" />
                        </span>
                        <p className="mt-4 font-display text-xl font-bold">¡Sumado!</p>
                        <p className="mt-1 text-sm text-white/75">+1 sello · +{doble ? demo.puntos * 2 : demo.puntos} puntos</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Premio desbloqueado */}
                {premio && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--s-primary)] px-6 text-center text-[var(--s-primary-on)]">
                    <div className="pop-in">
                      <Gift className="mx-auto h-12 w-12" aria-hidden="true" />
                      <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.2em] opacity-80">¡Premio conseguido!</p>
                      <p className="mt-2 font-display text-2xl font-bold leading-tight">{phone.reward.title}</p>
                      <div className="mx-auto mt-5 rounded-xl border-2 border-dashed border-current/50 bg-white/15 px-4 py-2 font-mono text-sm tracking-[0.2em]">
                        {premio.codigo}
                      </div>
                      <button
                        type="button"
                        onClick={canjear}
                        disabled={premio.canjeado}
                        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[var(--s-ink)] transition-transform active:scale-95"
                      >
                        {premio.canjeado ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} aria-hidden="true" />
                            Canjeado
                          </>
                        ) : (
                          'Canjear en caja'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Barra inferior con el QR en el centro */}
              <nav className="flex shrink-0 items-end justify-around border-t border-black/5 bg-white px-3 pb-4 pt-2 text-[9px] text-[var(--s-ink)]/50" aria-label="Menú de la app de ejemplo">
                {[
                  { id: 'inicio' as const, icono: Home, label: 'Inicio' },
                  { id: 'maquina' as const, icono: Sparkles, label: 'Premios' },
                ].map(({ id, icono: Icono, label }) => (
                  <button key={id} type="button" onClick={() => { play('tap'); setPantalla(id) }} className={cn('flex flex-col items-center gap-0.5 px-1', pantalla === id && 'text-[var(--s-primary)]')} aria-current={pantalla === id ? 'page' : undefined}>
                    <Icono className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={escanear}
                  aria-label="Enseñar mi QR en caja"
                  className={cn('-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--s-primary)] text-white shadow-lg transition-transform active:scale-90', activa === null && 'ping-dot')}
                >
                  <QrCode className="h-5 w-5" aria-hidden="true" />
                </button>
                {[
                  { id: 'amigos' as const, icono: Users, label: 'Amigos' },
                  { id: 'inicio' as const, icono: Gift, label: 'Cupones' },
                ].map(({ id, icono: Icono, label }) => (
                  <button key={label} type="button" onClick={() => { play('tap'); setPantalla(id) }} className={cn('flex flex-col items-center gap-0.5 px-1', label === 'Amigos' && pantalla === id && 'text-[var(--s-primary)]')} aria-current={label === 'Amigos' && pantalla === id ? 'page' : undefined}>
                    <Icono className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
