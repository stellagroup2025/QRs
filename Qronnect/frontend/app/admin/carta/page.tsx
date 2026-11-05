'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  EyeOff,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Stamp,
  Star,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { getAdminTenantDomain } from '@/lib/tenant'
import { getTenantUrl } from '@/lib/urls'
import { cn } from '@/lib/utils'
import {
  ALERGENOS,
  ETIQUETAS,
  cartaAdmin,
  formatearPrecio,
  type Categoria,
  type ConfigPagina,
  type Plato,
} from '@/lib/api/carta'

type Borrado = { tipo: 'categoria'; categoria: Categoria } | { tipo: 'plato'; plato: Plato }

interface FormPlato {
  id?: string
  id_categoria: string
  nombre: string
  descripcion: string
  precio: string
  imagen_url: string | null
  alergenos: string[]
  etiquetas: string[]
  destacado: boolean
  disponible: boolean
}

const platoVacio = (idCategoria: string): FormPlato => ({
  id_categoria: idCategoria,
  nombre: '',
  descripcion: '',
  precio: '',
  imagen_url: null,
  alergenos: [],
  etiquetas: [],
  destacado: false,
  disponible: true,
})

function mover<T>(lista: T[], desde: number, hasta: number): T[] {
  const copia = [...lista]
  const [item] = copia.splice(desde, 1)
  copia.splice(hasta, 0, item)
  return copia
}

export default function CartaAdminPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [config, setConfig] = useState<ConfigPagina>({ pagina_inicio: 'tres_vias', google_reviews_url: null })
  const [urlResenas, setUrlResenas] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardandoConfig, setGuardandoConfig] = useState(false)

  const [nuevaCategoria, setNuevaCategoria] = useState('')
  const [creandoCategoria, setCreandoCategoria] = useState(false)
  const [editandoCategoria, setEditandoCategoria] = useState<{ id: string; nombre: string } | null>(null)

  const [formPlato, setFormPlato] = useState<FormPlato | null>(null)
  const [guardandoPlato, setGuardandoPlato] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const inputFoto = useRef<HTMLInputElement>(null)

  const [borrando, setBorrando] = useState<Borrado | null>(null)

  const fallo = useCallback(
    (e: unknown) =>
      toast({
        title: 'No se pudo guardar',
        description: e instanceof Error ? e.message : 'Inténtalo de nuevo.',
        variant: 'destructive',
      }),
    [toast],
  )

  useEffect(() => {
    const domain = getAdminTenantDomain()
    if (!localStorage.getItem(`admin_token_${domain}`) && !localStorage.getItem('admin_token')) {
      router.push('/admin/login')
      return
    }
    Promise.all([cartaAdmin.obtener(), cartaAdmin.config()])
      .then(([cats, cfg]) => {
        setCategorias(cats)
        setConfig(cfg)
        setUrlResenas(cfg.google_reviews_url ?? '')
      })
      .catch((e) =>
        toast({
          title: 'No se pudo cargar la carta',
          description: e instanceof Error ? e.message : undefined,
          variant: 'destructive',
        }),
      )
      .finally(() => setCargando(false))
  }, [router, toast])

  const urlPagina = () => {
    if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) return '/'
    return getTenantUrl(getAdminTenantDomain())
  }

  // ---------- Página QR ----------

  async function guardarConfig(cambios: Partial<ConfigPagina>) {
    setGuardandoConfig(true)
    try {
      const cfg = await cartaAdmin.guardarConfig(cambios)
      setConfig(cfg)
      setUrlResenas(cfg.google_reviews_url ?? '')
      toast({ title: 'Guardado', description: 'Tu página QR está actualizada.' })
    } catch (e) {
      fallo(e)
    } finally {
      setGuardandoConfig(false)
    }
  }

  // ---------- Categorías ----------

  async function crearCategoria(e: React.FormEvent) {
    e.preventDefault()
    const nombre = nuevaCategoria.trim()
    if (!nombre) return
    setCreandoCategoria(true)
    try {
      const cat = await cartaAdmin.crearCategoria({ nombre })
      setCategorias((cs) => [...cs, cat])
      setNuevaCategoria('')
    } catch (err) {
      fallo(err)
    } finally {
      setCreandoCategoria(false)
    }
  }

  async function renombrarCategoria() {
    if (!editandoCategoria) return
    const nombre = editandoCategoria.nombre.trim()
    if (!nombre) return
    try {
      const cat = await cartaAdmin.actualizarCategoria(editandoCategoria.id, { nombre })
      setCategorias((cs) => cs.map((c) => (c.id === cat.id ? { ...c, nombre: cat.nombre } : c)))
      setEditandoCategoria(null)
    } catch (err) {
      fallo(err)
    }
  }

  async function alternarCategoria(cat: Categoria, activa: boolean) {
    setCategorias((cs) => cs.map((c) => (c.id === cat.id ? { ...c, activa } : c)))
    try {
      await cartaAdmin.actualizarCategoria(cat.id, { activa })
    } catch (err) {
      setCategorias((cs) => cs.map((c) => (c.id === cat.id ? { ...c, activa: !activa } : c)))
      fallo(err)
    }
  }

  async function moverCategoria(indice: number, delta: -1 | 1) {
    const anterior = categorias
    const nuevas = mover(categorias, indice, indice + delta)
    setCategorias(nuevas)
    try {
      await cartaAdmin.ordenarCategorias(nuevas.map((c) => c.id))
    } catch (err) {
      setCategorias(anterior)
      fallo(err)
    }
  }

  // ---------- Platos ----------

  function editarPlato(p: Plato) {
    setFormPlato({
      id: p.id,
      id_categoria: p.id_categoria,
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      precio: p.precio === null ? '' : String(p.precio).replace('.', ','),
      imagen_url: p.imagen_url,
      alergenos: p.alergenos,
      etiquetas: p.etiquetas,
      destacado: p.destacado,
      disponible: p.disponible,
    })
  }

  async function guardarPlato(e: React.FormEvent) {
    e.preventDefault()
    if (!formPlato) return
    const textoPrecio = formPlato.precio.trim().replace(',', '.')
    const precio = textoPrecio === '' ? null : Number(textoPrecio)
    if (precio !== null && (Number.isNaN(precio) || precio < 0)) {
      toast({ title: 'Revisa el precio', description: 'Escribe un número, por ejemplo 9,50.', variant: 'destructive' })
      return
    }
    const datos = {
      id_categoria: formPlato.id_categoria,
      nombre: formPlato.nombre.trim(),
      descripcion: formPlato.descripcion.trim() || null,
      precio: precio === null ? null : Math.round(precio * 100) / 100,
      imagen_url: formPlato.imagen_url,
      alergenos: formPlato.alergenos,
      etiquetas: formPlato.etiquetas,
      destacado: formPlato.destacado,
      disponible: formPlato.disponible,
    }
    setGuardandoPlato(true)
    try {
      if (formPlato.id) {
        const plato = await cartaAdmin.actualizarPlato(formPlato.id, datos)
        setCategorias((cs) =>
          cs.map((c) => ({
            ...c,
            platos:
              c.id === plato.id_categoria
                ? c.platos.some((p) => p.id === plato.id)
                  ? c.platos.map((p) => (p.id === plato.id ? plato : p))
                  : [...c.platos, plato]
                : c.platos.filter((p) => p.id !== plato.id),
          })),
        )
      } else {
        const plato = await cartaAdmin.crearPlato(datos)
        setCategorias((cs) => cs.map((c) => (c.id === plato.id_categoria ? { ...c, platos: [...c.platos, plato] } : c)))
      }
      setFormPlato(null)
    } catch (err) {
      fallo(err)
    } finally {
      setGuardandoPlato(false)
    }
  }

  async function alternarDisponible(p: Plato, disponible: boolean) {
    const poner = (valor: boolean) =>
      setCategorias((cs) =>
        cs.map((c) => ({ ...c, platos: c.platos.map((x) => (x.id === p.id ? { ...x, disponible: valor } : x)) })),
      )
    poner(disponible)
    try {
      await cartaAdmin.actualizarPlato(p.id, { disponible })
    } catch (err) {
      poner(!disponible)
      fallo(err)
    }
  }

  async function moverPlato(cat: Categoria, indice: number, delta: -1 | 1) {
    const anterior = categorias
    const platos = mover(cat.platos, indice, indice + delta)
    setCategorias((cs) => cs.map((c) => (c.id === cat.id ? { ...c, platos } : c)))
    try {
      await cartaAdmin.ordenarPlatos(cat.id, platos.map((p) => p.id))
    } catch (err) {
      setCategorias(anterior)
      fallo(err)
    }
  }

  async function subirFoto(file?: File) {
    if (!file || !formPlato) return
    setSubiendoFoto(true)
    try {
      const url = await cartaAdmin.subirImagen(file)
      setFormPlato((f) => (f ? { ...f, imagen_url: url } : f))
    } catch (err) {
      fallo(err)
    } finally {
      setSubiendoFoto(false)
      if (inputFoto.current) inputFoto.current.value = ''
    }
  }

  async function confirmarBorrado() {
    if (!borrando) return
    try {
      if (borrando.tipo === 'categoria') {
        await cartaAdmin.borrarCategoria(borrando.categoria.id)
        setCategorias((cs) => cs.filter((c) => c.id !== borrando.categoria.id))
      } else {
        await cartaAdmin.borrarPlato(borrando.plato.id)
        setCategorias((cs) =>
          cs.map((c) => ({ ...c, platos: c.platos.filter((p) => p.id !== borrando.plato.id) })),
        )
      }
    } catch (err) {
      fallo(err)
    } finally {
      setBorrando(null)
    }
  }

  const alternarEnLista = (campo: 'alergenos' | 'etiquetas', id: string) =>
    setFormPlato((f) =>
      f ? { ...f, [campo]: f[campo].includes(id) ? f[campo].filter((x) => x !== id) : [...f[campo], id] } : f,
    )

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalPlatos = categorias.reduce((n, c) => n + c.platos.length, 0)
  const tresVias = config.pagina_inicio === 'tres_vias'

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Página QR y carta</h1>
        <p className="mt-1 text-muted-foreground">
          El QR de tus mesas abre una página con tres botones: reseñar en Google, tarjeta de sellos y la carta.
        </p>
      </div>

      {/* Página QR */}
      <Card>
        <CardHeader>
          <CardTitle>Tu página QR</CardTitle>
          <CardDescription>Lo que ve el cliente al escanear el QR.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="tres-vias" className="text-base">
                Página de 3 botones
              </Label>
              <p className="text-sm text-muted-foreground">
                Si la desactivas, el QR abre la página completa del club de clientes.
              </p>
            </div>
            <Switch
              id="tres-vias"
              checked={tresVias}
              disabled={guardandoConfig}
              onCheckedChange={(v) => guardarConfig({ pagina_inicio: v ? 'tres_vias' : 'landing' })}
            />
          </div>

          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              guardarConfig({ google_reviews_url: urlResenas.trim() || null })
            }}
          >
            <Label htmlFor="url-resenas" className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4" /> Enlace para reseñar en Google
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="url-resenas"
                type="url"
                inputMode="url"
                placeholder="https://g.page/r/XXXXXXXX/review"
                value={urlResenas}
                onChange={(e) => setUrlResenas(e.target.value)}
              />
              <Button type="submit" disabled={guardandoConfig || urlResenas.trim() === (config.google_reviews_url ?? '')}>
                {guardandoConfig && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              En tu Perfil de Empresa de Google, pulsa <strong>Pedir reseñas</strong> y copia el enlace. Sin enlace, el
              botón de reseñas no aparece.
            </p>
          </form>

          <ul className="grid gap-2 text-sm sm:grid-cols-3">
            <EstadoVia
              ok={!!config.google_reviews_url}
              icono={Star}
              texto="Reseñar en Google"
              pista="Falta el enlace"
            />
            <EstadoVia ok icono={Stamp} texto="Tarjeta de sellos" pista="" />
            <EstadoVia
              ok={categorias.some((c) => c.activa && c.platos.some((p) => p.disponible))}
              icono={UtensilsCrossed}
              texto="Carta online"
              pista="Añade algún plato"
            />
          </ul>

          <Button variant="outline" asChild>
            <a href={urlPagina()} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Ver mi página
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Carta */}
      <Card>
        <CardHeader>
          <CardTitle>Carta online</CardTitle>
          <CardDescription>
            {totalPlatos === 0
              ? 'Empieza creando las secciones (Entrantes, Principales, Postres…) y añade tus platos.'
              : `${categorias.length} secciones · ${totalPlatos} platos`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={crearCategoria} className="flex flex-col gap-2 sm:flex-row">
            <Label htmlFor="nueva-categoria" className="sr-only">
              Nueva sección
            </Label>
            <Input
              id="nueva-categoria"
              placeholder="Nueva sección, p. ej. Entrantes"
              value={nuevaCategoria}
              maxLength={80}
              onChange={(e) => setNuevaCategoria(e.target.value)}
            />
            <Button type="submit" disabled={creandoCategoria || !nuevaCategoria.trim()}>
              {creandoCategoria ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Añadir sección
            </Button>
          </form>

          {categorias.map((cat, i) => (
            <section key={cat.id} className={cn('rounded-xl border', !cat.activa && 'opacity-70')}>
              <header className="flex flex-wrap items-center gap-2 border-b bg-muted/40 p-3">
                {editandoCategoria?.id === cat.id ? (
                  <form
                    className="flex flex-1 gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      renombrarCategoria()
                    }}
                  >
                    <Input
                      autoFocus
                      aria-label="Nombre de la sección"
                      value={editandoCategoria.nombre}
                      maxLength={80}
                      onChange={(e) => setEditandoCategoria({ id: cat.id, nombre: e.target.value })}
                    />
                    <Button type="submit" size="sm">
                      Guardar
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditandoCategoria(null)}>
                      Cancelar
                    </Button>
                  </form>
                ) : (
                  <>
                    <h2 className="min-w-0 flex-1 truncate font-semibold">
                      {cat.nombre}
                      {!cat.activa && (
                        <Badge variant="secondary" className="ml-2 align-middle">
                          <EyeOff className="mr-1 h-3 w-3" /> Oculta
                        </Badge>
                      )}
                    </h2>
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={cat.activa}
                        onCheckedChange={(v) => alternarCategoria(cat, v)}
                        aria-label={`Mostrar ${cat.nombre} en la carta`}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={i === 0}
                        onClick={() => moverCategoria(i, -1)}
                        aria-label={`Subir ${cat.nombre}`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={i === categorias.length - 1}
                        onClick={() => moverCategoria(i, 1)}
                        aria-label={`Bajar ${cat.nombre}`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditandoCategoria({ id: cat.id, nombre: cat.nombre })}
                        aria-label={`Renombrar ${cat.nombre}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setBorrando({ tipo: 'categoria', categoria: cat })}
                        aria-label={`Borrar ${cat.nombre}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </header>

              <ul className="divide-y">
                {cat.platos.map((p, j) => (
                  <li key={p.id} className={cn('flex items-center gap-3 p-3', !p.disponible && 'opacity-60')}>
                    {p.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imagen_url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                      </span>
                    )}
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => editarPlato(p)}
                    >
                      <span className="block truncate font-medium">
                        {p.destacado && <Star className="mr-1 inline h-3.5 w-3.5 fill-current" aria-label="Recomendado" />}
                        {p.nombre}
                      </span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {[
                          p.precio !== null ? formatearPrecio(p.precio) : 'Sin precio',
                          p.alergenos.length ? `${p.alergenos.length} ${p.alergenos.length === 1 ? "alérgeno" : "alérgenos"}` : null,
                          !p.disponible ? 'Agotado' : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center gap-1">
                      <Switch
                        checked={p.disponible}
                        onCheckedChange={(v) => alternarDisponible(p, v)}
                        aria-label={`${p.nombre} disponible`}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={j === 0}
                        onClick={() => moverPlato(cat, j, -1)}
                        aria-label={`Subir ${p.nombre}`}
                        className="hidden sm:inline-flex"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={j === cat.platos.length - 1}
                        onClick={() => moverPlato(cat, j, 1)}
                        aria-label={`Bajar ${p.nombre}`}
                        className="hidden sm:inline-flex"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setBorrando({ tipo: 'plato', plato: p })}
                        aria-label={`Borrar ${p.nombre}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-3">
                <Button variant="outline" size="sm" onClick={() => setFormPlato(platoVacio(cat.id))}>
                  <Plus className="mr-2 h-4 w-4" /> Añadir plato
                </Button>
              </div>
            </section>
          ))}
        </CardContent>
      </Card>

      {/* Formulario de plato */}
      <Dialog open={!!formPlato} onOpenChange={(abierto) => !abierto && setFormPlato(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {formPlato && (
            <form onSubmit={guardarPlato} className="space-y-4">
              <DialogHeader>
                <DialogTitle>{formPlato.id ? 'Editar plato' : 'Nuevo plato'}</DialogTitle>
                <DialogDescription>Así aparecerá en tu carta online.</DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="plato-nombre">Nombre</Label>
                <Input
                  id="plato-nombre"
                  required
                  maxLength={120}
                  value={formPlato.nombre}
                  onChange={(e) => setFormPlato({ ...formPlato, nombre: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plato-descripcion">Descripción</Label>
                <Textarea
                  id="plato-descripcion"
                  rows={2}
                  maxLength={500}
                  value={formPlato.descripcion}
                  onChange={(e) => setFormPlato({ ...formPlato, descripcion: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plato-precio">Precio (€)</Label>
                  <Input
                    id="plato-precio"
                    inputMode="decimal"
                    placeholder="9,50"
                    value={formPlato.precio}
                    onChange={(e) => setFormPlato({ ...formPlato, precio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plato-categoria">Sección</Label>
                  <select
                    id="plato-categoria"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formPlato.id_categoria}
                    onChange={(e) => setFormPlato({ ...formPlato, id_categoria: e.target.value })}
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Foto</Label>
                <div className="flex items-center gap-3">
                  {formPlato.imagen_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formPlato.imagen_url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    </span>
                  )}
                  <input
                    ref={inputFoto}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => subirFoto(e.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={subiendoFoto}
                    onClick={() => inputFoto.current?.click()}
                  >
                    {subiendoFoto && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {formPlato.imagen_url ? 'Cambiar foto' : 'Subir foto'}
                  </Button>
                  {formPlato.imagen_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormPlato({ ...formPlato, imagen_url: null })}
                    >
                      Quitar
                    </Button>
                  )}
                </div>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Alérgenos</legend>
                <div className="flex flex-wrap gap-2">
                  {ALERGENOS.map((a) => (
                    <Chip
                      key={a.id}
                      activo={formPlato.alergenos.includes(a.id)}
                      onClick={() => alternarEnLista('alergenos', a.id)}
                    >
                      <span aria-hidden="true">{a.emoji}</span> {a.nombre}
                    </Chip>
                  ))}
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Etiquetas</legend>
                <div className="flex flex-wrap gap-2">
                  {ETIQUETAS.map((e) => (
                    <Chip
                      key={e.id}
                      activo={formPlato.etiquetas.includes(e.id)}
                      onClick={() => alternarEnLista('etiquetas', e.id)}
                    >
                      {e.nombre}
                    </Chip>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={formPlato.destacado}
                    onCheckedChange={(v) => setFormPlato({ ...formPlato, destacado: v })}
                  />
                  Recomendado de la casa
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={formPlato.disponible}
                    onCheckedChange={(v) => setFormPlato({ ...formPlato, disponible: v })}
                  />
                  Disponible
                </label>
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setFormPlato(null)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={guardandoPlato || subiendoFoto || !formPlato.nombre.trim()}>
                  {guardandoPlato && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar plato
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmar borrado */}
      <AlertDialog open={!!borrando} onOpenChange={(abierto) => !abierto && setBorrando(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {borrando?.tipo === 'categoria'
                ? `¿Borrar la sección «${borrando.categoria.nombre}»?`
                : `¿Borrar «${borrando?.tipo === 'plato' ? borrando.plato.nombre : ''}»?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {borrando?.tipo === 'categoria' && borrando.categoria.platos.length > 0
                ? `También se borrarán sus ${borrando.categoria.platos.length} platos. No se puede deshacer.`
                : 'No se puede deshacer. Si solo se ha agotado, mejor desactívalo.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmarBorrado}>Borrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function EstadoVia({
  ok,
  icono: Icono,
  texto,
  pista,
}: {
  ok: boolean
  icono: typeof Star
  texto: string
  pista: string
}) {
  return (
    <li
      className={cn(
        'flex items-center gap-2 rounded-lg border p-3',
        ok ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100' : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
      )}
    >
      <Icono className="h-4 w-4 shrink-0" />
      <span className="min-w-0">
        <span className="block font-medium">{texto}</span>
        <span className="block text-xs opacity-80">{ok ? 'Visible' : `Oculto: ${pista.toLowerCase()}`}</span>
      </span>
    </li>
  )
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-sm transition-colors',
        activo ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
