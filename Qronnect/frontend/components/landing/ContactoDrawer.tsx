'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { ArrowRight, Check, ChevronLeft, Coffee, Dumbbell, Loader2, ShoppingBag, Sparkles, Store, X } from 'lucide-react'
import { SECTORES } from '@/lib/sectores'
import { PORTADA_PLANES } from '@/lib/portada'
import { EMAIL_VALIDO, enviarSolicitudContacto } from '@/lib/contacto'
import { play } from '@/lib/sfx'
import { cn } from '@/lib/utils'

const ICONOS: Record<string, typeof Store> = {
  estetica: Sparkles,
  cafeterias: Coffee,
  deporte: Dumbbell,
  tiendas: ShoppingBag,
  otro: Store,
}

const NEGOCIOS = [...Object.values(SECTORES).map((s) => ({ slug: s.slug, nombre: s.nombre })), { slug: 'otro', nombre: 'Otro tipo de negocio' }]
const PASOS = 3

function Opcion({ elegida, onClick, children }: { elegida: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={elegida}
      className={cn(
        'flex min-h-14 w-full items-center gap-3 rounded-2xl border-[1.5px] bg-white px-4 py-3 text-left font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--s-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--s-primary)]/25',
        elegida ? 'border-[var(--s-primary)] bg-[var(--s-softer)]' : 'border-[var(--s-ink)]/12',
      )}
    >
      {children}
      <span
        className={cn(
          'ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          elegida ? 'border-[var(--s-primary)] bg-[var(--s-primary)] text-[var(--s-primary-on)]' : 'border-[var(--s-ink)]/15',
        )}
        aria-hidden="true"
      >
        {elegida && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
    </button>
  )
}

const inputClass =
  'block w-full rounded-xl border-[1.5px] border-[var(--s-ink)]/12 bg-white px-4 py-3 text-base text-[var(--s-ink)] outline-none transition-shadow placeholder:text-[var(--s-ink)]/35 focus:border-[var(--s-primary)] focus:ring-4 focus:ring-[var(--s-primary)]/15 aria-[invalid=true]:border-red-600'

/**
 * Panel lateral "Quiero Qronnect en mi negocio": se abre al pulsar cualquier enlace a /contacto
 * de la landing y pide los datos en tres pasos sin salir de la página.
 * Sin JavaScript, los enlaces siguen llevando a la página /contacto.
 */
export function ContactoDrawer() {
  const [abierto, setAbierto] = useState(false)
  const [visible, setVisible] = useState(false)
  const [paso, setPaso] = useState(1)
  const [sector, setSector] = useState('')
  const [plan, setPlan] = useState<string | null>(null)
  const [origen, setOrigen] = useState<string | undefined>()
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'enviado'>('idle')
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const quienAbrio = useRef<HTMLElement | null>(null)

  const abrir = useCallback((url: URL, desde: HTMLElement) => {
    quienAbrio.current = desde
    const s = url.searchParams.get('sector') ?? ''
    const p = url.searchParams.get('plan')
    setSector(s)
    setPlan(p)
    setOrigen(url.searchParams.get('origen') ?? window.location.pathname)
    setPaso(s ? (p ? 3 : 2) : 1)
    setEstado('idle')
    setErrores({})
    setErrorGeneral(null)
    setAbierto(true)
    document.documentElement.style.overflow = 'hidden'
    play('open')
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }, [])

  const cerrar = useCallback(() => {
    setVisible(false)
    document.documentElement.style.overflow = ''
    play('close')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => {
      setAbierto(false)
      quienAbrio.current?.focus({ preventScroll: true })
    }, reduced ? 0 : 420)
  }, [])

  // Los enlaces a /contacto de la página abren el panel en lugar de navegar
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement).closest?.('a[href^="/contacto"]') as HTMLAnchorElement | null
      if (!a) return
      e.preventDefault()
      abrir(new URL(a.href, window.location.origin), a)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [abrir])

  // Escape cierra y el foco no se escapa del panel
  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar()
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusables = panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([tabindex="-1"]), textarea, [tabindex="0"]')
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [abierto, cerrar])

  // Al cambiar de paso, el foco va al título para que los lectores de pantalla lo anuncien
  useEffect(() => {
    if (!abierto) return
    const t = window.setTimeout(() => tituloRef.current?.focus({ preventScroll: true }), 380)
    return () => window.clearTimeout(t)
  }, [paso, estado, abierto])

  const ir = (n: number) => {
    play(n > paso ? 'next' : 'back')
    setPaso(n)
  }

  const elegirSector = (slug: string) => {
    setSector(slug)
    play('tap')
    window.setTimeout(() => setPaso((p) => (p === 1 ? (plan !== null ? 3 : 2) : p)), 220)
  }

  const elegirPlan = (nombre: string) => {
    setPlan(nombre)
    play('tap')
    window.setTimeout(() => setPaso((p) => (p === 2 ? 3 : p)), 220)
  }

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const valor = (k: string) => String(form.get(k) ?? '').trim()
    const nuevos: Record<string, string> = {}
    if (valor('nombre_negocio').length < 2) nuevos.nombre_negocio = 'Escribe el nombre de tu negocio'
    if (valor('nombre_contacto').length < 2) nuevos.nombre_contacto = 'Escribe tu nombre'
    if (!EMAIL_VALIDO.test(valor('email'))) nuevos.email = 'Escribe un email válido'
    if (!form.get('acepta_privacidad')) nuevos.acepta_privacidad = 'Necesitamos tu permiso para contestarte'
    setErrores(nuevos)
    setErrorGeneral(null)
    if (Object.keys(nuevos).length > 0) {
      play('back')
      formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(nuevos)[0]}"]`)?.focus()
      return
    }

    setEstado('enviando')
    try {
      const opcional = (k: string) => valor(k) || undefined
      await enviarSolicitudContacto({
        nombre_negocio: valor('nombre_negocio'),
        nombre_contacto: valor('nombre_contacto'),
        email: valor('email'),
        telefono: opcional('telefono'),
        sector: sector || undefined,
        plan_interes: plan || undefined,
        mensaje: opcional('mensaje'),
        origen,
        web: opcional('web'),
      })
      setEstado('enviado')
      play('send')
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const r = panelRef.current?.getBoundingClientRect()
        confetti({
          particleCount: 120,
          spread: 80,
          origin: r ? { x: (r.left + r.width / 2) / window.innerWidth, y: 0.4 } : { y: 0.4 },
          zIndex: 130,
          disableForReducedMotion: true,
        })
      }
    } catch (err) {
      play('back')
      setErrorGeneral(err instanceof Error ? err.message : 'No se ha podido enviar.')
      setEstado('idle')
    }
  }

  if (!abierto) return null

  const err = (k: string) => (errores[k] ? { 'aria-invalid': true as const, 'aria-describedby': `drawer-${k}-error` } : {})
  const titulo = estado === 'enviado' ? '¡Solicitud enviada!' : paso === 1 ? '¿Qué negocio tienes?' : paso === 2 ? '¿Qué plan te interesa?' : 'Tus datos de contacto'

  return (
    <div className="fixed inset-0 z-[120]" role="dialog" aria-modal="true" aria-labelledby="drawer-titulo">
      <div
        className={cn('absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300', visible ? 'opacity-100' : 'opacity-0')}
        onClick={cerrar}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={cn(
          'absolute inset-x-0 bottom-0 flex max-h-[94svh] flex-col rounded-t-[28px] bg-[var(--s-softer)] text-[var(--s-ink)] shadow-[-30px_0_80px_-30px_rgba(0,0,0,0.5)] transition-transform duration-[420ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[480px] sm:rounded-none',
          visible ? 'translate-x-0 translate-y-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0',
        )}
      >
        <header className="grid grid-cols-[44px_1fr_44px] items-center gap-2 border-b border-[var(--s-ink)]/10 bg-white px-3 py-2 sm:rounded-none">
          <button
            type="button"
            onClick={() => ir(paso - 1)}
            aria-label="Paso anterior"
            className={cn('flex h-11 w-11 items-center justify-center rounded-full hover:bg-[var(--s-ink)]/5', (paso === 1 || estado === 'enviado') && 'invisible')}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--s-ink)]/55">
            {estado === 'enviado' ? 'Listo' : `Paso ${paso} de ${PASOS}`}
          </p>
          <button type="button" onClick={cerrar} aria-label="Cerrar" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-[var(--s-ink)]/5">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>
        <div className="h-1 bg-[var(--s-ink)]/[0.06]">
          <div
            className="h-full origin-left bg-[var(--s-primary)] transition-transform duration-500 ease-out"
            style={{ transform: `scaleX(${estado === 'enviado' ? 1 : paso / PASOS})` }}
          />
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-6 sm:px-7">
          <h2
            id="drawer-titulo"
            ref={tituloRef}
            tabIndex={-1}
            className={cn('font-display text-[1.75rem] font-bold leading-tight tracking-tight outline-none', estado === 'enviado' && 'mt-6 text-center')}
          >
            {titulo}
          </h2>

          {estado === 'enviado' ? (
            <div className="mt-6 text-center">
              <span className="pop-in mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--s-primary)] text-[var(--s-primary-on)]">
                <Check className="h-10 w-10" strokeWidth={3} aria-hidden="true" />
              </span>
              <p className="mx-auto mt-6 max-w-sm text-lg text-[var(--s-ink)]/75">
                Te escribiremos pronto para conocer tu negocio y enseñarte cómo quedaría tu programa.
              </p>
              <button
                type="button"
                onClick={cerrar}
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--s-primary)] px-8 font-semibold text-[var(--s-primary-on)]"
              >
                Seguir mirando
              </button>
            </div>
          ) : paso === 1 ? (
            <div key="p1" className="pop-in mt-6 grid gap-2.5">
              {NEGOCIOS.map((n) => {
                const Icono = ICONOS[n.slug] ?? Store
                return (
                  <Opcion key={n.slug} elegida={sector === n.slug} onClick={() => elegirSector(n.slug)}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--s-soft)] text-[var(--s-primary)]">
                      <Icono className="h-5 w-5" aria-hidden="true" />
                    </span>
                    {n.nombre}
                  </Opcion>
                )
              })}
            </div>
          ) : paso === 2 ? (
            <div key="p2" className="pop-in mt-6 grid gap-2.5">
              {PORTADA_PLANES.map((p) => (
                <Opcion key={p.nombre} elegida={plan === p.nombre} onClick={() => elegirPlan(p.nombre)}>
                  <span className="min-w-0">
                    <span className="block">{p.nombre}</span>
                    <span className="block text-sm font-normal text-[var(--s-ink)]/60">{p.descripcion}</span>
                  </span>
                  <span className="ml-auto shrink-0 font-display text-lg">{p.precio === 0 ? 'Gratis' : `${p.precio} €`}</span>
                </Opcion>
              ))}
              <Opcion elegida={plan === ''} onClick={() => elegirPlan('')}>
                Aún no lo sé
              </Opcion>
            </div>
          ) : null}

          {/* El formulario sigue montado al volver atrás, para no perder lo escrito */}
          {estado !== 'enviado' && (
            <form ref={formRef} noValidate onSubmit={enviar} hidden={paso !== 3} className="pop-in mt-6 grid gap-4" id="drawer-form">
              {[
                { name: 'nombre_negocio', label: 'Nombre del negocio', auto: 'organization' },
                { name: 'nombre_contacto', label: 'Tu nombre', auto: 'name' },
                { name: 'email', label: 'Email', auto: 'email', type: 'email' },
                { name: 'telefono', label: 'Teléfono', auto: 'tel', type: 'tel', opcional: true },
              ].map((c) => (
                <label key={c.name} className="grid gap-1.5">
                  <span className="text-sm font-medium">
                    {c.label}
                    {c.opcional && <span className="font-normal text-[var(--s-ink)]/50"> (opcional)</span>}
                  </span>
                  <input name={c.name} type={c.type ?? 'text'} autoComplete={c.auto} maxLength={200} className={inputClass} {...err(c.name)} />
                  {errores[c.name] && (
                    <span id={`drawer-${c.name}-error`} className="text-sm text-red-700">
                      {errores[c.name]}
                    </span>
                  )}
                </label>
              ))}
              <label className="grid gap-1.5">
                <span className="text-sm font-medium">
                  Cuéntanos tu negocio <span className="font-normal text-[var(--s-ink)]/50">(opcional)</span>
                </span>
                <textarea name="mensaje" rows={3} maxLength={2000} placeholder="Cuántos locales tienes, qué te gustaría conseguir…" className={cn(inputClass, 'resize-y')} />
              </label>

              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  No rellenes este campo
                  <input name="web" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <div>
                <label className="flex items-start gap-3 text-sm">
                  <input name="acepta_privacidad" type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--s-primary)]" {...err('acepta_privacidad')} />
                  <span className="text-[var(--s-ink)]/75">
                    Acepto que Qronnect use estos datos para contestar a mi solicitud, según la{' '}
                    <Link href="/privacidad" target="_blank" className="font-medium text-[var(--s-ink)] underline">
                      política de privacidad
                    </Link>
                    .
                  </span>
                </label>
                {errores.acepta_privacidad && (
                  <p id="drawer-acepta_privacidad-error" className="mt-1 text-sm text-red-700">
                    {errores.acepta_privacidad}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        {estado !== 'enviado' && paso === 3 && (
          <footer className="border-t border-[var(--s-ink)]/10 bg-white px-5 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3 sm:px-7">
            {errorGeneral && (
              <p role="alert" className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
                {errorGeneral}
              </p>
            )}
            <button
              type="submit"
              form="drawer-form"
              disabled={estado === 'enviando'}
              className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[var(--s-primary)] px-8 font-semibold text-[var(--s-primary-on)] transition-opacity disabled:opacity-60"
            >
              {estado === 'enviando' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Enviando…
                </>
              ) : (
                <>
                  Enviar solicitud
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </footer>
        )}
      </div>
    </div>
  )
}
