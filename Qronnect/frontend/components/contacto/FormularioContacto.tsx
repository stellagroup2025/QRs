'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { SECTORES } from '@/lib/sectores'
import { PORTADA_PLANES } from '@/lib/portada'
import { cn } from '@/lib/utils'
import { EMAIL_VALIDO, enviarSolicitudContacto, origenActual } from '@/lib/contacto'

function Campo({
  id,
  label,
  opcional,
  error,
  children,
}: {
  id: string
  label: string
  opcional?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {opcional && <span className="font-normal text-[var(--s-ink)]/50"> (opcional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

const inputClass =
  'block w-full rounded-xl border border-[var(--s-ink)]/15 bg-white px-4 py-3 text-base text-[var(--s-ink)] outline-none transition-shadow placeholder:text-[var(--s-ink)]/35 focus:border-[var(--s-primary)] focus:ring-4 focus:ring-[var(--s-primary)]/15 aria-[invalid=true]:border-red-600'

/**
 * Formulario "Quiero Qronnect en mi negocio". Lo usan los botones de captación de la portada
 * y de las landings de sector (llegan con ?sector= o ?plan= para rellenarlo).
 */
export function FormularioContacto() {
  const params = useSearchParams()
  const sectorInicial = params.get('sector') ?? ''
  const planInicial = params.get('plan') ?? ''

  const [estado, setEstado] = useState<'idle' | 'enviando' | 'enviado'>('idle')
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [errores, setErrores] = useState<Record<string, string>>({})

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
      document.getElementById(Object.keys(nuevos)[0])?.focus()
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
        sector: opcional('sector'),
        plan_interes: opcional('plan_interes'),
        mensaje: opcional('mensaje'),
        origen: origenActual(params.get('origen')),
        web: opcional('web'),
      })
      setEstado('enviado')
    } catch (err) {
      setErrorGeneral(err instanceof Error ? err.message : 'No se ha podido enviar.')
      setEstado('idle')
    }
  }

  if (estado === 'enviado') {
    return (
      <div role="status" className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-[var(--s-ink)]/10 sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--s-soft)] text-[var(--s-primary)]">
          <Check className="h-7 w-7" strokeWidth={3} aria-hidden="true" />
        </span>
        <h2 className="mt-5 font-display text-3xl font-bold tracking-tight">¡Gracias! Ya tenemos tu solicitud</h2>
        <p className="mx-auto mt-3 max-w-md text-[var(--s-ink)]/70">
          Te escribiremos pronto para conocer tu negocio y enseñarte cómo quedaría tu programa.
        </p>
        <Link href="/" className="mt-8 inline-flex items-center gap-2 font-semibold text-[var(--s-primary)] hover:underline">
          Volver al inicio
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    )
  }

  const err = (k: string) =>
    errores[k] ? { 'aria-invalid': true as const, 'aria-describedby': `${k}-error` } : {}

  return (
    <form noValidate onSubmit={enviar} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[var(--s-ink)]/10 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo id="nombre_negocio" label="Nombre del negocio" error={errores.nombre_negocio}>
          <input id="nombre_negocio" name="nombre_negocio" autoComplete="organization" maxLength={120} className={inputClass} {...err('nombre_negocio')} />
        </Campo>
        <Campo id="nombre_contacto" label="Tu nombre" error={errores.nombre_contacto}>
          <input id="nombre_contacto" name="nombre_contacto" autoComplete="name" maxLength={120} className={inputClass} {...err('nombre_contacto')} />
        </Campo>
        <Campo id="email" label="Email" error={errores.email}>
          <input id="email" name="email" type="email" autoComplete="email" maxLength={200} className={inputClass} {...err('email')} />
        </Campo>
        <Campo id="telefono" label="Teléfono" opcional>
          <input id="telefono" name="telefono" type="tel" autoComplete="tel" maxLength={40} className={inputClass} />
        </Campo>
        <Campo id="sector" label="Tipo de negocio" opcional>
          <select id="sector" name="sector" defaultValue={sectorInicial} className={inputClass}>
            <option value="">Elige uno</option>
            {Object.values(SECTORES).map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.nombre}
              </option>
            ))}
            <option value="otro">Otro</option>
          </select>
        </Campo>
        <Campo id="plan_interes" label="Plan que te interesa" opcional>
          <select id="plan_interes" name="plan_interes" defaultValue={planInicial} className={inputClass}>
            <option value="">Aún no lo sé</option>
            {PORTADA_PLANES.map((p) => (
              <option key={p.nombre} value={p.nombre}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <div className="sm:col-span-2">
          <Campo id="mensaje" label="Cuéntanos tu negocio" opcional>
            <textarea
              id="mensaje"
              name="mensaje"
              rows={4}
              maxLength={2000}
              placeholder="Cuántos locales tienes, qué te gustaría conseguir con tus clientes…"
              className={cn(inputClass, 'resize-y')}
            />
          </Campo>
        </div>
      </div>

      {/* Campo trampa para bots: oculto para las personas */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="web">No rellenes este campo</label>
        <input id="web" name="web" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6">
        <label className="flex items-start gap-3 text-sm">
          <input
            id="acepta_privacidad"
            name="acepta_privacidad"
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--s-primary)]"
            {...err('acepta_privacidad')}
          />
          <span className="text-[var(--s-ink)]/75">
            Acepto que Qronnect use estos datos para contestar a mi solicitud, según la{' '}
            <Link href="/privacidad" className="font-medium text-[var(--s-ink)] underline">
              política de privacidad
            </Link>
            .
          </span>
        </label>
        {errores.acepta_privacidad && (
          <p id="acepta_privacidad-error" className="mt-1 text-sm text-red-700">
            {errores.acepta_privacidad}
          </p>
        )}
      </div>

      {errorGeneral && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {errorGeneral}
        </p>
      )}

      <button
        type="submit"
        disabled={estado === 'enviando'}
        className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[var(--s-primary)] px-8 py-3 text-base font-semibold text-[var(--s-primary-on)] transition-opacity disabled:opacity-60 sm:w-auto"
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
    </form>
  )
}
