'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Filter, Star, UtensilsCrossed, X } from 'lucide-react'
import { ALERGENOS, ETIQUETAS, formatearPrecio, obtenerCartaPublica, type Categoria, type Plato } from '@/lib/api/carta'
import { LogoMarca, PortadaMarca, useMarca } from '@/components/tres-vias/CabeceraMarca'
import { cn } from '@/lib/utils'

const ALERGENO = Object.fromEntries(ALERGENOS.map((a) => [a.id, a]))
const ETIQUETA = Object.fromEntries(ETIQUETAS.map((e) => [e.id, e.nombre]))

export default function CartaPage() {
  const { nombre } = useMarca()
  const [categorias, setCategorias] = useState<Categoria[] | null>(null)
  const [error, setError] = useState(false)
  const [sinAlergenos, setSinAlergenos] = useState<string[]>([])
  const [filtroAbierto, setFiltroAbierto] = useState(false)
  const [abierto, setAbierto] = useState<Plato | null>(null)
  const [activa, setActiva] = useState<string | null>(null)

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

  const destacados = useMemo(() => visibles.flatMap((c) => c.platos.filter((p) => p.destacado)), [visibles])

  // Marca en el menú de secciones la que se está viendo
  useEffect(() => {
    if (!visibles.length) return
    const obs = new IntersectionObserver(
      (entradas) => {
        const vista = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (vista) setActiva(vista.target.id.replace('cat-', ''))
      },
      { rootMargin: '-140px 0px -60% 0px' },
    )
    visibles.forEach((c) => {
      const el = document.getElementById(`cat-${c.id}`)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [visibles])

  useEffect(() => {
    if (!activa) return
    document.getElementById(`chip-${activa}`)?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [activa])

  const alternar = (id: string) =>
    setSinAlergenos((actual) => (actual.includes(id) ? actual.filter((a) => a !== id) : [...actual, id]))

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-brand-2/10 to-paper text-ink">
      {/* Portada con la foto y el logo del negocio */}
      <PortadaMarca alto="h-48 sm:h-56">
        <div className="absolute inset-x-0 top-0 mx-auto flex max-w-2xl items-center justify-between p-3">
          <Link
            href="/"
            aria-label="Volver"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow backdrop-blur hover:bg-white"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-2xl items-end gap-3 px-4 pb-4">
          <LogoMarca tamano="h-16 w-16" letra="text-3xl" className="rounded-2xl border-2" />
          <div className="min-w-0 pb-1 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/80">Nuestra carta</p>
            <h1 className="truncate font-display text-2xl font-extrabold leading-tight drop-shadow sm:text-3xl">{nombre}</h1>
          </div>
        </div>
      </PortadaMarca>

      {/* Barra fija: secciones y filtro de alérgenos */}
      <header className="sticky top-0 z-30 border-b border-ink/5 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-2.5">
          <nav aria-label="Secciones de la carta" className="-mx-1 min-w-0 flex-1 overflow-x-auto px-1 [scrollbar-width:none]">
            <ul className="flex gap-2 whitespace-nowrap">
              {visibles.map((c) => (
                <li key={c.id}>
                  <a
                    id={`chip-${c.id}`}
                    href={`#cat-${c.id}`}
                    aria-current={activa === c.id ? 'true' : undefined}
                    className={cn(
                      'block rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors',
                      activa === c.id ? 'bg-brand text-brand-on shadow-sm' : 'bg-white text-ink/75 ring-1 ring-ink/10 hover:bg-ink/5',
                    )}
                  >
                    {c.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          {categorias && categorias.length > 0 && (
            <button
              type="button"
              onClick={() => setFiltroAbierto((v) => !v)}
              aria-expanded={filtroAbierto}
              aria-controls="filtro-alergenos"
              aria-label="Filtrar por alérgenos"
              className={cn(
                'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm font-semibold',
                sinAlergenos.length ? 'bg-brand text-brand-on' : 'bg-white ring-1 ring-ink/10 hover:bg-ink/5',
              )}
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Alérgenos</span>
              {sinAlergenos.length > 0 && <span>({sinAlergenos.length})</span>}
            </button>
          )}
        </div>

        {filtroAbierto && (
          <div id="filtro-alergenos" className="mx-auto max-w-2xl px-4 pb-3">
            <p className="mb-2 text-sm text-ink/60">Ocultar platos que lleven:</p>
            <div className="flex flex-wrap gap-2">
              {ALERGENOS.map((a) => {
                const marcado = sinAlergenos.includes(a.id)
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={marcado}
                    onClick={() => alternar(a.id)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-sm',
                      marcado ? 'border-ink bg-ink text-paper' : 'border-ink/15 bg-white',
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
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-16">
        {error && <Aviso>No hemos podido cargar la carta. Pregunta al personal o inténtalo en un momento.</Aviso>}

        {!error && categorias === null && (
          <div className="space-y-3 pt-6" aria-busy="true" aria-label="Cargando la carta">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-3xl bg-ink/5" />
            ))}
          </div>
        )}

        {categorias && categorias.length === 0 && <Aviso>La carta todavía no está disponible.</Aviso>}

        {categorias && categorias.length > 0 && visibles.length === 0 && (
          <Aviso>Ningún plato cumple el filtro de alérgenos. Pregunta al personal por alternativas.</Aviso>
        )}

        {/* Recomendados de la casa */}
        {destacados.length > 0 && (
          <section aria-labelledby="tit-destacados" className="pt-6">
            <h2 id="tit-destacados" className="flex items-center gap-2 font-display text-xl font-extrabold">
              <Star className="h-5 w-5 fill-brand-2 text-brand-2" aria-hidden="true" />
              Recomendados de la casa
            </h2>
            <ul className="-mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
              {destacados.map((p) => (
                <li key={p.id} className="w-64 shrink-0 snap-start">
                  <button
                    type="button"
                    onClick={() => setAbierto(p)}
                    className="group block w-full overflow-hidden rounded-3xl bg-white text-left shadow-md ring-1 ring-ink/5 transition-transform hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-brand-2/40 to-brand-3/40">
                      {p.imagen_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imagen_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <UtensilsCrossed aria-hidden="true" className="absolute inset-0 m-auto h-12 w-12 text-brand/40" />
                      )}
                      {p.precio !== null && (
                        <span className="absolute bottom-2 right-2 rounded-full bg-brand px-3 py-1 text-sm font-bold text-brand-on shadow">
                          {formatearPrecio(p.precio)}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-display font-bold leading-snug">{p.nombre}</h3>
                      {p.descripcion && <p className="mt-0.5 line-clamp-2 text-sm text-ink/60">{p.descripcion}</p>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {visibles.map((c) => (
          <section key={c.id} id={`cat-${c.id}`} aria-labelledby={`tit-${c.id}`} className="scroll-mt-20 pt-8">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-7 w-1.5 rounded-full bg-gradient-to-b from-brand to-brand-3" />
              <h2 id={`tit-${c.id}`} className="font-display text-2xl font-extrabold tracking-[-0.01em]">
                {c.nombre}
              </h2>
            </div>
            {c.descripcion && <p className="mt-1 pl-[1.125rem] text-sm text-ink/60">{c.descripcion}</p>}
            <ul className="mt-3 space-y-2.5">
              {c.platos.map((p) => (
                <FilaPlato key={p.id} plato={p} onAbrir={() => setAbierto(p)} />
              ))}
            </ul>
          </section>
        ))}

        {categorias && categorias.length > 0 && (
          <p className="mt-12 text-center text-xs leading-relaxed text-ink/50">
            Si tienes alguna alergia o intolerancia, avisa al personal antes de pedir.
            <br />
            Precios con IVA incluido.
          </p>
        )}
      </main>

      {abierto && <FichaPlato plato={abierto} onCerrar={() => setAbierto(null)} />}
    </div>
  )
}

function Chips({ plato }: { plato: Plato }) {
  if (!plato.etiquetas.length && !plato.alergenos.length) return null
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      {plato.etiquetas.map((e) => (
        <span key={e} className="rounded-full bg-brand-2/25 px-2 py-0.5 text-xs font-semibold">
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
  )
}

function FilaPlato({ plato, onAbrir }: { plato: Plato; onAbrir: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onAbrir}
        className="flex w-full gap-3 rounded-3xl bg-white p-3 text-left shadow-sm ring-1 ring-ink/5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <div className="min-w-0 flex-1 py-1 pl-1">
          <h3 className="font-display font-bold leading-snug">
            {plato.destacado && (
              <Star className="mr-1 inline h-4 w-4 -translate-y-px fill-brand-2 text-brand-2" aria-label="Recomendado" />
            )}
            {plato.nombre}
          </h3>
          {plato.descripcion && <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink/60">{plato.descripcion}</p>}
          <Chips plato={plato} />
          {plato.precio !== null && (
            <p className="mt-2 font-display text-lg font-extrabold tabular-nums text-brand">{formatearPrecio(plato.precio)}</p>
          )}
        </div>
        {plato.imagen_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={plato.imagen_url}
            alt=""
            loading="lazy"
            className="h-28 w-28 shrink-0 self-center rounded-2xl bg-ink/5 object-cover shadow-sm sm:h-32 sm:w-32"
          />
        )}
      </button>
    </li>
  )
}

/** Ficha del plato con la foto en grande */
function FichaPlato({ plato, onCerrar }: { plato: Plato; onCerrar: () => void }) {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', tecla)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', tecla)
      document.body.style.overflow = overflow
    }
  }, [onCerrar])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="ficha-titulo">
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCerrar} />
      <div className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem]">
        {plato.imagen_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={plato.imagen_url} alt="" className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div aria-hidden="true" className="h-24 bg-gradient-to-br from-brand-2/50 to-brand-3/50" />
        )}
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="p-5 pb-8">
          <div className="flex items-start justify-between gap-4">
            <h2 id="ficha-titulo" className="font-display text-2xl font-extrabold leading-tight">
              {plato.nombre}
            </h2>
            {plato.precio !== null && (
              <span className="shrink-0 rounded-full bg-brand px-3 py-1 font-display text-lg font-extrabold text-brand-on">
                {formatearPrecio(plato.precio)}
              </span>
            )}
          </div>
          {plato.descripcion && <p className="mt-2 text-ink/70">{plato.descripcion}</p>}
          <Chips plato={plato} />
          <p className="mt-4 text-xs text-ink/50">¿Alguna alergia? Avisa al personal antes de pedir.</p>
        </div>
      </div>
    </div>
  )
}

function Aviso({ children }: { children: React.ReactNode }) {
  return <p className="mt-10 rounded-3xl bg-white p-6 text-center text-ink/70 shadow-sm">{children}</p>
}
