// Cliente de la API de Qronnect con la autenticación resuelta:
// - Rutas /superadmin/... → token de superadmin.
// - Resto, con tienda → token de admin de esa tienda + cabecera X-Tenant-Domain.
//   Si hay sesión de superadmin, el token de la tienda se genera solo (dura 2 h y se renueva).
import { guardarSesion, leerSesion, tokenVigente } from './sesion.js'

export const API_URL = (process.env.QRONNECT_API_URL || 'https://api.qronnect.es').replace(/\/+$/, '')

export class ErrorQronnect extends Error {}

/** Normaliza "carta", "/carta", "/api/carta" → "/api/carta" */
export function rutaApi(ruta) {
  let r = String(ruta || '').trim()
  if (/^https?:\/\//.test(r)) throw new ErrorQronnect('Pasa solo la ruta (p. ej. /carta), no una URL completa')
  if (!r.startsWith('/')) r = `/${r}`
  if (!r.startsWith('/api/') && r !== '/api') r = `/api${r}`
  return r
}

export const esRutaSuperadmin = (ruta) => /^\/api\/superadmin(\/|$)/.test(rutaApi(ruta))

function mensajeError(status, body) {
  const msg = body && typeof body === 'object' ? (Array.isArray(body.message) ? body.message.join('; ') : body.message) : null
  const texto = msg || (typeof body === 'string' && body.length < 300 ? body : '')
  if (status === 401) return `401 No autorizado${texto ? `: ${texto}` : ''}. Inicia sesión con las herramientas de login.`
  if (status === 403) return `403 Prohibido${texto ? `: ${texto}` : ''}`
  if (status === 404) return `404 No encontrado${texto ? `: ${texto}` : ''}`
  if (status === 502 || status === 503) return `${status}: el backend no responde (¿está arrancando o suspendido en Render?)`
  return `${status}${texto ? `: ${texto}` : ''}`
}

export class ClienteQronnect {
  constructor({ fetchImpl = globalThis.fetch, sesion, persistir = true } = {}) {
    this.fetch = fetchImpl
    this.sesion = sesion ?? leerSesion()
    this.sesion.tiendas ??= {}
    this.persistir = persistir
    this.cacheTiendas = null
  }

  guardar() {
    if (this.persistir) guardarSesion(this.sesion)
  }

  async peticion({ metodo = 'GET', ruta, query, body, token, tienda, formData }) {
    const url = new URL(API_URL + rutaApi(ruta))
    for (const [k, v] of Object.entries(query || {})) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    }
    const headers = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    if (tienda) headers['X-Tenant-Domain'] = tienda
    let cuerpo
    if (formData) cuerpo = formData
    else if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
      cuerpo = JSON.stringify(body)
    }
    const res = await this.fetch(url, { method: metodo.toUpperCase(), headers, body: cuerpo })
    const texto = await res.text()
    let datos = texto
    try {
      datos = texto ? JSON.parse(texto) : null
    } catch {
      // no es JSON
    }
    if (!res.ok) throw new ErrorQronnect(mensajeError(res.status, datos))
    return datos
  }

  // ---------- Sesión ----------

  async enviarCodigoSuperadmin(email) {
    await this.peticion({ metodo: 'POST', ruta: '/superadmin/auth/send-email', body: { email } })
    this.sesion.email_superadmin = email
    this.guardar()
  }

  async verificarCodigoSuperadmin(codigo, email = this.sesion.email_superadmin) {
    if (!email) throw new ErrorQronnect('Falta el email: pide antes el código con qronnect_login_superadmin')
    const r = await this.peticion({ metodo: 'POST', ruta: '/superadmin/auth/verify-email', body: { email, codigo } })
    this.sesion.superadmin = { token: r.access_token, nombre: r.superadmin?.nombre, email }
    this.sesion.tiendas = {}
    this.cacheTiendas = null
    this.guardar()
    return r.superadmin
  }

  async loginTienda(dominio, email, pin) {
    const r = await this.peticion({ metodo: 'POST', ruta: '/admin/auth/login', tienda: dominio, body: { email, pin } })
    this.sesion.tiendas[dominio] = { token: r.access_token, id: r.tienda?.id, nombre: r.tienda?.nombre }
    this.guardar()
    return r
  }

  cerrarSesion() {
    this.sesion = { superadmin: null, tiendas: {} }
    this.cacheTiendas = null
    this.guardar()
  }

  estado() {
    const sa = this.sesion.superadmin
    return {
      api: API_URL,
      superadmin: sa && tokenVigente(sa.token) ? `${sa.nombre ?? ''} <${sa.email}>`.trim() : null,
      tiendas_con_sesion: Object.entries(this.sesion.tiendas)
        .filter(([, t]) => tokenVigente(t.token))
        .map(([d]) => d),
    }
  }

  tokenSuperadmin() {
    const sa = this.sesion.superadmin
    if (!sa || !tokenVigente(sa.token)) {
      throw new ErrorQronnect(
        'No hay sesión de superadmin (o ha caducado: dura 1 h). Usa qronnect_login_superadmin y luego qronnect_verificar_codigo.',
      )
    }
    return sa.token
  }

  // ---------- Tiendas ----------

  async tiendas(refrescar = false) {
    if (!this.cacheTiendas || refrescar) {
      this.cacheTiendas = await this.peticion({ ruta: '/superadmin/tiendas', token: this.tokenSuperadmin() })
    }
    return this.cacheTiendas
  }

  /** Acepta dominio (lokeyokiera), id o nombre exacto (sin mayúsculas). Devuelve { id, dominio, nombre }. */
  async resolverTienda(ref) {
    const clave = String(ref || '').trim().toLowerCase()
    if (!clave) throw new ErrorQronnect('Indica la tienda (su dominio, p. ej. "lokeyokiera")')
    const sa = this.sesion.superadmin
    if (!sa || !tokenVigente(sa.token)) {
      // Sin superadmin solo valen las tiendas en las que se ha entrado con email + PIN
      const propia = this.sesion.tiendas[clave]
      if (propia) return { id: propia.id, dominio: clave, nombre: propia.nombre }
      throw new ErrorQronnect(
        `No hay sesión para "${ref}". Usa qronnect_login_superadmin (todas las tiendas) o qronnect_login_tienda.`,
      )
    }
    const lista = await this.tiendas()
    const t =
      lista.find((x) => x.dominio?.toLowerCase() === clave || x.slug?.toLowerCase() === clave) ||
      lista.find((x) => x.id === ref) ||
      lista.find((x) => x.nombre?.toLowerCase() === clave)
    if (!t) {
      const parecidas = lista
        .filter((x) => `${x.dominio} ${x.nombre}`.toLowerCase().includes(clave))
        .map((x) => `${x.dominio} (${x.nombre})`)
        .slice(0, 5)
      throw new ErrorQronnect(`No encuentro la tienda "${ref}".${parecidas.length ? ` ¿Quizá: ${parecidas.join(', ')}?` : ''}`)
    }
    return { id: t.id, dominio: t.dominio, nombre: t.nombre }
  }

  /** Token de admin para la tienda: el guardado si sigue vigente; si no, uno nuevo vía superadmin */
  async tokenTienda(ref) {
    const t = await this.resolverTienda(ref)
    const guardado = this.sesion.tiendas[t.dominio]
    if (guardado && tokenVigente(guardado.token)) return { ...t, token: guardado.token }
    if (!this.sesion.superadmin || !tokenVigente(this.sesion.superadmin.token)) {
      throw new ErrorQronnect(`La sesión de "${t.dominio}" ha caducado. Vuelve a entrar con qronnect_login_tienda.`)
    }
    const r = await this.peticion({
      metodo: 'POST',
      ruta: `/superadmin/tiendas/${t.id}/generar-token-admin`,
      token: this.tokenSuperadmin(),
    })
    this.sesion.tiendas[t.dominio] = { token: r.access_token, id: t.id, nombre: t.nombre }
    this.guardar()
    return { ...t, token: r.access_token }
  }

  // ---------- Llamadas ----------

  /** Llamada como superadmin */
  superadmin(metodo, ruta, opciones = {}) {
    return this.peticion({ metodo, ruta, token: this.tokenSuperadmin(), ...opciones })
  }

  /** Llamada como admin de una tienda */
  async tienda(ref, metodo, ruta, opciones = {}) {
    const t = await this.tokenTienda(ref)
    return this.peticion({ metodo, ruta, token: t.token, tienda: t.dominio, ...opciones })
  }

  /** Llamada pública en nombre de una tienda (lo que ve el cliente final) */
  publica(dominio, metodo, ruta, opciones = {}) {
    return this.peticion({ metodo, ruta, tienda: dominio, ...opciones })
  }

  /** Elige la autenticación según la ruta */
  async auto({ metodo = 'GET', ruta, tienda, query, body, autenticacion = 'auto' }) {
    const modo = autenticacion === 'auto' ? (esRutaSuperadmin(ruta) ? 'superadmin' : tienda ? 'tienda' : 'ninguna') : autenticacion
    if (modo === 'superadmin') return this.superadmin(metodo, ruta, { query, body, tienda })
    if (modo === 'tienda') {
      if (!tienda) throw new ErrorQronnect('Esta llamada necesita la tienda')
      return this.tienda(tienda, metodo, ruta, { query, body })
    }
    return this.peticion({ metodo, ruta, query, body, tienda })
  }

  // ---------- Documentación (Swagger) ----------

  async docs() {
    if (!this.cacheDocs) this.cacheDocs = await this.peticion({ ruta: '/docs-json' })
    return this.cacheDocs
  }
}
