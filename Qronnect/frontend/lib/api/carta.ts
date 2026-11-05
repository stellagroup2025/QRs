import { getAdminTenantDomain, getTenantDomain } from '@/lib/tenant'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/** Los 14 alérgenos de declaración obligatoria (Reglamento UE 1169/2011) */
export const ALERGENOS = [
  { id: 'gluten', nombre: 'Gluten', emoji: '🌾' },
  { id: 'crustaceos', nombre: 'Crustáceos', emoji: '🦐' },
  { id: 'huevos', nombre: 'Huevos', emoji: '🥚' },
  { id: 'pescado', nombre: 'Pescado', emoji: '🐟' },
  { id: 'cacahuetes', nombre: 'Cacahuetes', emoji: '🥜' },
  { id: 'soja', nombre: 'Soja', emoji: '🫘' },
  { id: 'lacteos', nombre: 'Lácteos', emoji: '🥛' },
  { id: 'frutos_cascara', nombre: 'Frutos de cáscara', emoji: '🌰' },
  { id: 'apio', nombre: 'Apio', emoji: '🥬' },
  { id: 'mostaza', nombre: 'Mostaza', emoji: '🟡' },
  { id: 'sesamo', nombre: 'Sésamo', emoji: '⚪' },
  { id: 'sulfitos', nombre: 'Sulfitos', emoji: '🍷' },
  { id: 'altramuces', nombre: 'Altramuces', emoji: '🌼' },
  { id: 'moluscos', nombre: 'Moluscos', emoji: '🦪' },
] as const

export const ETIQUETAS = [
  { id: 'vegetariano', nombre: 'Vegetariano' },
  { id: 'vegano', nombre: 'Vegano' },
  { id: 'sin_gluten', nombre: 'Sin gluten' },
  { id: 'picante', nombre: 'Picante' },
  { id: 'casero', nombre: 'Casero' },
  { id: 'nuevo', nombre: 'Nuevo' },
] as const

export type PaginaInicio = 'landing' | 'tres_vias'

export interface Plato {
  id: string
  id_categoria: string
  nombre: string
  descripcion: string | null
  precio: number | null
  imagen_url: string | null
  alergenos: string[]
  etiquetas: string[]
  destacado: boolean
  disponible: boolean
  orden: number
}

export interface Categoria {
  id: string
  nombre: string
  descripcion: string | null
  orden: number
  activa: boolean
  platos: Plato[]
}

export interface PaginaTresVias {
  pagina_inicio: PaginaInicio
  google_reviews_url: string | null
  hay_carta: boolean
}

export interface ConfigPagina {
  pagina_inicio: PaginaInicio
  google_reviews_url: string | null
}

export type DatosPlato = Partial<Omit<Plato, 'id' | 'orden'>>

const precioFormato = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
export const formatearPrecio = (precio: number | null) => (precio === null ? '' : precioFormato.format(precio))

async function leerError(res: Response): Promise<never> {
  let mensaje = 'Algo ha fallado. Inténtalo de nuevo.'
  try {
    const body = await res.json()
    mensaje = Array.isArray(body.message) ? body.message[0] : body.message || mensaje
  } catch {
    // respuesta sin JSON
  }
  throw new Error(mensaje)
}

// ===================================
// Público
// ===================================

function cabecerasPublicas(): HeadersInit {
  const domain = getTenantDomain()
  return domain ? { 'X-Tenant-Domain': domain } : {}
}

export async function obtenerPaginaTresVias(): Promise<PaginaTresVias> {
  const res = await fetch(`${API_URL}/api/carta/pagina`, { headers: cabecerasPublicas() })
  if (!res.ok) return leerError(res)
  return res.json()
}

export async function obtenerCartaPublica(): Promise<Categoria[]> {
  const res = await fetch(`${API_URL}/api/carta/publica`, { headers: cabecerasPublicas() })
  if (!res.ok) return leerError(res)
  return (await res.json()).categorias
}

// ===================================
// Panel
// ===================================

function cabecerasAdmin(json = true): HeadersInit {
  const domain = getAdminTenantDomain()
  const token = localStorage.getItem(`admin_token_${domain}`) || localStorage.getItem('admin_token') || ''
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${token}`,
    ...(domain ? { 'X-Tenant-Domain': domain } : {}),
  }
}

async function admin<T>(ruta: string, method = 'GET', body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}/api/carta${ruta}`, {
    method,
    headers: cabecerasAdmin(),
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) return leerError(res)
  return res.json()
}

export const cartaAdmin = {
  obtener: async () => (await admin<{ categorias: Categoria[] }>('')).categorias,
  config: () => admin<ConfigPagina>('/config'),
  guardarConfig: (datos: Partial<ConfigPagina>) => admin<ConfigPagina>('/config', 'PUT', datos),

  crearCategoria: (datos: { nombre: string; descripcion?: string | null }) =>
    admin<Categoria>('/categorias', 'POST', datos),
  actualizarCategoria: (id: string, datos: Partial<Pick<Categoria, 'nombre' | 'descripcion' | 'activa'>>) =>
    admin<Categoria>(`/categorias/${id}`, 'PUT', datos),
  borrarCategoria: (id: string) => admin<{ ok: true }>(`/categorias/${id}`, 'DELETE'),
  ordenarCategorias: (ids: string[]) => admin<{ ok: true }>('/categorias/orden', 'PUT', { ids }),

  crearPlato: (datos: DatosPlato & { id_categoria: string; nombre: string }) =>
    admin<Plato>('/platos', 'POST', datos),
  actualizarPlato: (id: string, datos: DatosPlato) => admin<Plato>(`/platos/${id}`, 'PUT', datos),
  borrarPlato: (id: string) => admin<{ ok: true }>(`/platos/${id}`, 'DELETE'),
  ordenarPlatos: (idCategoria: string, ids: string[]) =>
    admin<{ ok: true }>(`/categorias/${idCategoria}/platos/orden`, 'PUT', { ids }),

  async subirImagen(file: File): Promise<string> {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_URL}/api/carta/platos/imagen`, {
      method: 'POST',
      headers: cabecerasAdmin(false),
      body: form,
    })
    if (!res.ok) return leerError(res)
    return (await res.json()).url
  },
}
