'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Filter, Star, X } from 'lucide-react'
import { useBrandingContext } from '@/components/BrandingProvider'
import { ALERGENOS, ETIQUETAS, formatearPrecio, obtenerCartaPublica, type Categoria, type Plato } from '@/lib/api/carta'
import { cn } from '@/lib/utils'

const ALERGENO = Object.fromEntries(ALERGENOS.map((a) => [a.id, a]))
const ETIQUETA = Object.fromEntries(ETIQUETAS.map((e) => [e.id, e.nombre]))

export default function CartaPage() {
  const { branding } = useBrandingContext()
  const [categorias, setCategorias] = useState<Categoria[] | null>(null)
  const [error, setError] = useState(false)
  const [sinAlergenos, setSinAlergenos] = useState<string[]>([])
  const [filtroAbierto, setFiltroAbierto] = useState(false)

  const nombre =
    !branding.nombre_comercial || branding.nombre_comercial === 'Mi Tienda' ? 'Carta' : branding.nombre_comercial

  useEffect(() => {
    obtenerCartaPublica()
      .then(setCategorias)
      .catch(() => setError(true))
  }, [])

  // Platos que no llevan ninguno de los alérgenos que el comensal quiere evitar
  const visibles = useMemo(() => {
    if (!categorias) return []
    if (!sinAlergenos.length) return categorias
    return categorias
      .map((c) => ({ ...c, platos: c.platos.filter((p) => !p.alergenos.some((a) => sinAlergenos.includes(a))) }))
      .filter((c) => c.platos.length > 0)
  }, [categorias, sinAlergenos])

  const alternar = (id: string) =>
    setSinAlergenos((actual) => (actual.includes(id) ? actual.filter((a) => a !== id) : [...actual, id]))

  return (
    <div className="min-h-[100dvh] bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/5 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4">
          <Link
            href="/"
            aria-label="Volver"
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/5"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <h1 className="min-w-0 flex-1 truncate font-display text-lg font-semibold">{nombre}</h1>
          {categorias && categorias.length > 0 && (
            <button
              type="button"
              onClick={() => setFiltroAbierto((v) => !v)}
              aria-expanded={filtroAbierto}
              aria-controls="filtro-alergenos"
              className={cn(
                'flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium',
                sinAlergenos.length ? 'bg-brand text-brand-on' : 'hover:bg-ink/5',
              )}
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              Alérgenos{sinAlergenos.length ? ` (${sinAlergenos.length})` : ''}
            </button>
          )}
        </div>

        {filtroAbierto && (
          <div id="filtro-alergenos" className="mx-auto max-w-2xl px-4 pb-3">
            <p className="mb-2 text-sm text-ink/60">Ocultar platos que lleven:</p>
            <div className="flex flex-wrap gap-2">
              {ALERGENOS.map((a) => {
                const activo = sinAlergenos.includes(a.id)
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => alternar(a.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm',
                      activo ? 'border-ink bg-ink text-paper' : 'border-ink/15 bg-white',
                    )}
                  >
                    <span aria-hidden="true">{a.emoji}</span> {a.nombre}
                  </button>
                )
              })}
              {sinAlergenos.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSinAlergenos([])}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-ink/60 hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" /> Quitar filtro
                </button>
              )}
            </div>
          </div>
        )}

        {visibles.length > 1 && (
          <nav aria-label="Secciones de la carta" className="mx-auto max-w-2xl overflow-x-auto px-4 pb-3">
            <ul className="flex gap-2 whitespace-nowrap">
              {visibles.map((c) => (
                <li key={c.id}>
                  <a
                    href={`#cat-${c.id}`}
                    className="block rounded-full bg-ink/5 px-3.5 py-1.5 text-sm font-medium hover:bg-ink/10"
                  >
                    {c.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16 pt-4">
        {error && <Aviso>No hemos podido cargar la carta. Pregunta al personal o inténtalo en un momento.</Aviso>}

        {!error && categorias === null && (
          <div className="space-y-3 pt-4" aria-busy="true" aria-label="Cargando la carta">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-ink/5" />
            ))}
          </div>
        )}

        {categorias && categorias.length === 0 && <Aviso>La carta todavía no está disponible.</Aviso>}

        {categorias && categorias.length > 0 && visibles.length === 0 && (
          <Aviso>Ningún plato cumple el filtro de alérgenos. Pregunta al personal por alternativas.</Aviso>
        )}

        {visibles.map((c) => (
          <section key={c.id} id={`cat-${c.id}`} aria-labelledby={`tit-${c.id}`} className="scroll-mt-36 pt-6">
            <h2 id={`tit-${c.id}`} className="font-display text-2xl font-bold tracking-[-0.01em]">
              {c.nombre}
            </h2>
            {c.descripcion && <p className="mt-1 text-sm text-ink/60">{c.descripcion}</p>}
            <ul className="mt-3 divide-y divide-ink/5 overflow-hidden rounded-2xl border border-ink/10 bg-white">
              {c.platos.map((p) => (
                <FilaPlato key={p.id} plato={p} />
              ))}
            </ul>
          </section>
        ))}

        {categorias && categorias.length > 0 && (
          <p className="mt-10 text-center text-xs leading-relaxed text-ink/50">
            Si tienes alguna alergia o intolerancia, avisa al personal antes de pedir.
            <br />
            Precios con IVA incluido.
          </p>
        )}
      </main>
    </div>
  )
}

function FilaPlato({ plato }: { plato: Plato }) {
  return (
    <li className="flex gap-3 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug">
            {plato.destacado && (
              <Star className="mr-1 inline h-4 w-4 -translate-y-px fill-brand text-brand" aria-label="Recomendado" />
            )}
            {plato.nombre}
          </h3>
          {plato.precio !== null && (
            <span className="shrink-0 font-semibold tabular-nums">{formatearPrecio(plato.precio)}</span>
          )}
        </div>
        {plato.descripcion && <p className="mt-1 text-sm leading-snug text-ink/60">{plato.descripcion}</p>}
        {(plato.etiquetas.length > 0 || plato.alergenos.length > 0) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {plato.etiquetas.map((e) => (
              <span key={e} className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-medium">
                {ETIQUETA[e] ?? e}
              </span>
            ))}
            {plato.alergenos.length > 0 && <span className="sr-only">Alérgenos:</span>}
            {plato.alergenos.map((a) => (
              <span key={a} className="rounded-full border border-ink/10 px-2 py-0.5 text-xs text-ink/70">
                <span aria-hidden="true">{ALERGENO[a]?.emoji ?? '•'}</span> {ALERGENO[a]?.nombre ?? a}
              </span>
            ))}
          </div>
        )}
      </div>
      {plato.imagen_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={plato.imagen_url}
          alt=""
          loading="lazy"
          className="h-24 w-24 shrink-0 rounded-xl bg-ink/5 object-cover"
        />
      )}
    </li>
  )
}

function Aviso({ children }: { children: React.ReactNode }) {
  return <p className="mt-10 rounded-2xl bg-white p-6 text-center text-ink/70">{children}</p>
}
