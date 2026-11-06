// Definición de las herramientas del MCP de Qronnect.
import fs from 'node:fs'
import path from 'node:path'
import { z } from 'zod'
import { ErrorQronnect } from './api.js'
import { buscarOperaciones, detalleOperacion, resumenGrupos } from './docs.js'

export const ALERGENOS = [
  'gluten', 'crustaceos', 'huevos', 'pescado', 'cacahuetes', 'soja', 'lacteos',
  'frutos_cascara', 'apio', 'mostaza', 'sesamo', 'sulfitos', 'altramuces', 'moluscos',
]
export const ETIQUETAS = ['vegetariano', 'vegano', 'picante', 'sin_gluten', 'nuevo', 'casero']

const MAX_RESPUESTA = 60_000

const normal = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()

export function texto(datos) {
  let t = typeof datos === 'string' ? datos : JSON.stringify(datos, null, 2)
  if (t.length > MAX_RESPUESTA) t = `${t.slice(0, MAX_RESPUESTA)}\n… (respuesta recortada: ${t.length} caracteres)`
  return { content: [{ type: 'text', text: t }] }
}

const error = (e) => ({ content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true })

/** Envuelve el handler para devolver los errores como texto en vez de romper */
const seguro = (fn) => async (args) => {
  try {
    return texto(await fn(args))
  } catch (e) {
    if (e instanceof ErrorQronnect) return error(e)
    return error(new Error(`${e.message || e}`))
  }
}

/** Busca una categoría por id o por nombre */
export function buscarCategoria(categorias, ref) {
  const r = normal(ref)
  const c = categorias.find((x) => x.id === ref) || categorias.find((x) => normal(x.nombre) === r)
  if (!c) throw new ErrorQronnect(`No existe la sección "${ref}". Hay: ${categorias.map((x) => x.nombre).join(', ') || 'ninguna'}`)
  return c
}

/** Busca un plato por id o por nombre en toda la carta (o en una sección) */
export function buscarPlato(categorias, ref, refCategoria) {
  const donde = refCategoria ? [buscarCategoria(categorias, refCategoria)] : categorias
  const todos = donde.flatMap((c) => c.platos.map((p) => ({ ...p, categoria: c.nombre })))
  const porId = todos.find((p) => p.id === ref)
  if (porId) return porId
  const r = normal(ref)
  const exactos = todos.filter((p) => normal(p.nombre) === r)
  const candidatos = exactos.length ? exactos : todos.filter((p) => normal(p.nombre).includes(r))
  if (candidatos.length === 1) return candidatos[0]
  if (!candidatos.length) throw new ErrorQronnect(`No existe el plato "${ref}"`)
  throw new ErrorQronnect(
    `"${ref}" es ambiguo: ${candidatos.map((p) => `${p.nombre} (${p.categoria})`).join(', ')}. Indica la sección o el id.`,
  )
}

/** Vista compacta de la carta para leerla de un vistazo */
export function cartaCompacta(categorias) {
  return categorias.map((c) => ({
    seccion: c.nombre,
    id: c.id,
    ...(c.activa ? {} : { oculta: true }),
    ...(c.descripcion ? { descripcion: c.descripcion } : {}),
    platos: c.platos.map((p) => ({
      nombre: p.nombre,
      id: p.id,
      precio: p.precio,
      ...(p.descripcion ? { descripcion: p.descripcion } : {}),
      ...(p.alergenos.length ? { alergenos: p.alergenos } : {}),
      ...(p.etiquetas.length ? { etiquetas: p.etiquetas } : {}),
      ...(p.destacado ? { destacado: true } : {}),
      ...(p.disponible ? {} : { agotado: true }),
      ...(p.imagen_url ? { foto: p.imagen_url } : {}),
    })),
  }))
}

// ---------- Esquemas reutilizables ----------

const tienda = z.string().describe('Tienda: su dominio (p. ej. "lokeyokiera"), su id o su nombre')
const alergenos = z.array(z.enum(ALERGENOS)).describe('Alérgenos de declaración obligatoria (UE)')
const etiquetas = z.array(z.enum(ETIQUETAS))
const precio = z.number().min(0).nullable().describe('En euros, p. ej. 9.5. null = sin precio')
const camposPlato = {
  descripcion: z.string().max(500).nullable().optional(),
  precio: precio.optional(),
  alergenos: alergenos.optional(),
  etiquetas: etiquetas.optional(),
  destacado: z.boolean().optional().describe('Recomendado de la casa'),
  disponible: z.boolean().optional().describe('false = agotado (no se muestra)'),
  imagen_url: z.string().url().nullable().optional(),
}
const platoImportar = z.object({ nombre: z.string().min(1).max(120), ...camposPlato })

const LECTURA = { readOnlyHint: true, openWorldHint: true }
const ESCRITURA = { readOnlyHint: false, destructiveHint: false, openWorldHint: true }
const BORRADO = { readOnlyHint: false, destructiveHint: true, openWorldHint: true }

export function registrarHerramientas(server, api) {
  const reg = (nombre, titulo, descripcion, inputSchema, annotations, fn) =>
    server.registerTool(nombre, { title: titulo, description: descripcion, inputSchema, annotations }, seguro(fn))

  const carta = async (t) => (await api.tienda(t, 'GET', '/carta')).categorias

  // ===================== Sesión =====================

  reg('qronnect_estado', 'Estado de la sesión', 'Muestra contra qué API trabaja el MCP y con qué sesiones (superadmin y tiendas).', {}, LECTURA,
    async () => api.estado())

  reg('qronnect_login_superadmin', 'Iniciar sesión de superadmin (1/2)',
    'Envía un código de 6 dígitos al email del superadmin. Después usa qronnect_verificar_codigo con el código recibido. Con sesión de superadmin se puede gestionar cualquier tienda.',
    { email: z.string().email() }, ESCRITURA,
    async ({ email }) => {
      await api.enviarCodigoSuperadmin(email)
      return `Código enviado a ${email}. Pídele al usuario el código de 6 dígitos y llama a qronnect_verificar_codigo.`
    })

  reg('qronnect_verificar_codigo', 'Iniciar sesión de superadmin (2/2)',
    'Verifica el código recibido por email y guarda la sesión de superadmin (dura 1 hora).',
    { codigo: z.string().regex(/^\d{6}$/, 'Son 6 dígitos'), email: z.string().email().optional() }, ESCRITURA,
    async ({ codigo, email }) => {
      const sa = await api.verificarCodigoSuperadmin(codigo, email)
      return `Sesión de superadmin iniciada${sa?.nombre ? ` como ${sa.nombre}` : ''}. Vale 1 hora.`
    })

  reg('qronnect_login_tienda', 'Iniciar sesión en una tienda',
    'Entra en el panel de una tienda con el email y el PIN de su administrador (alternativa a la sesión de superadmin; dura 8 horas).',
    { tienda: z.string().describe('Dominio de la tienda, p. ej. "lokeyokiera"'), email: z.string().email(), pin: z.string().min(4).max(8) },
    ESCRITURA,
    async ({ tienda: t, email, pin }) => {
      const r = await api.loginTienda(t, email, pin)
      return `Sesión iniciada en ${r.tienda?.nombre ?? t}.`
    })

  reg('qronnect_cerrar_sesion', 'Cerrar sesión', 'Borra todos los tokens guardados por el MCP.', {}, ESCRITURA,
    async () => {
      api.cerrarSesion()
      return 'Sesión cerrada.'
    })

  // ===================== Tiendas =====================

  reg('qronnect_listar_tiendas', 'Listar tiendas', 'Lista las tiendas (requiere superadmin). Filtra por texto en el dominio o el nombre.',
    { buscar: z.string().optional() }, LECTURA,
    async ({ buscar }) => {
      const lista = await api.tiendas(true)
      const b = normal(buscar)
      return lista
        .filter((t) => !b || normal(`${t.dominio} ${t.nombre}`).includes(b))
        .map((t) => ({
          dominio: t.dominio,
          nombre: t.nombre,
          id: t.id,
          activa: t.activo,
          ...(t.plan ? { plan: t.plan } : {}),
          ...(t.pagina_inicio ? { pagina_inicio: t.pagina_inicio } : {}),
        }))
    })

  reg('qronnect_ver_tienda', 'Ver tienda', 'Datos completos de una tienda y sus estadísticas (requiere superadmin).',
    { tienda }, LECTURA,
    async ({ tienda: t }) => {
      const { id } = await api.resolverTienda(t)
      return api.superadmin('GET', `/superadmin/tiendas/${id}`)
    })

  // ===================== Página QR =====================

  reg('qronnect_ver_pagina_qr', 'Ver página QR',
    'Qué muestra el QR de la tienda: portada (landing o 3 botones), enlace de reseñas de Google y si hay carta.',
    { tienda }, LECTURA,
    async ({ tienda: t }) => {
      const { dominio } = await api.resolverTienda(t)
      const [config, publica] = await Promise.all([api.tienda(t, 'GET', '/carta/config'), api.publica(dominio, 'GET', '/carta/pagina')])
      return { ...config, hay_carta: publica.hay_carta, url: `https://${dominio}.qronnect.es` }
    })

  reg('qronnect_configurar_pagina_qr', 'Configurar página QR',
    'Activa la página de 3 botones (pagina_inicio="tres_vias") o vuelve a la landing completa ("landing"), y/o fija el enlace de reseñas de Google (null lo quita).',
    {
      tienda,
      pagina_inicio: z.enum(['tres_vias', 'landing']).optional(),
      google_reviews_url: z.string().url().startsWith('https://').nullable().optional().describe('p. ej. https://g.page/r/XXXX/review'),
    },
    ESCRITURA,
    async ({ tienda: t, ...cambios }) => api.tienda(t, 'PUT', '/carta/config', { body: cambios }))

  // ===================== Carta =====================

  reg('qronnect_ver_carta', 'Ver carta', 'Carta completa de la tienda (incluye secciones ocultas y platos agotados).',
    { tienda }, LECTURA,
    async ({ tienda: t }) => cartaCompacta(await carta(t)))

  reg('qronnect_importar_carta', 'Importar carta',
    'Crea de una vez secciones y platos. Si una sección ya existe (mismo nombre) añade los platos al final; con reemplazar=true borra antes toda la carta. Ideal para pasar una carta de texto/foto a la tienda.',
    {
      tienda,
      secciones: z
        .array(z.object({ nombre: z.string().min(1).max(80), descripcion: z.string().max(300).optional(), platos: z.array(platoImportar).default([]) }))
        .min(1),
      reemplazar: z.boolean().default(false).describe('true = borra toda la carta actual antes de importar'),
    },
    ESCRITURA,
    async ({ tienda: t, secciones, reemplazar }) => {
      let actuales = await carta(t)
      if (reemplazar) {
        for (const c of actuales) await api.tienda(t, 'DELETE', `/carta/categorias/${c.id}`)
        actuales = []
      }
      let nuevasSecciones = 0
      let nuevosPlatos = 0
      for (const s of secciones) {
        let cat = actuales.find((c) => normal(c.nombre) === normal(s.nombre))
        if (!cat) {
          cat = await api.tienda(t, 'POST', '/carta/categorias', { body: { nombre: s.nombre, descripcion: s.descripcion } })
          actuales.push(cat)
          nuevasSecciones++
        }
        for (const p of s.platos) {
          await api.tienda(t, 'POST', '/carta/platos', { body: { ...p, id_categoria: cat.id } })
          nuevosPlatos++
        }
      }
      return {
        resultado: `${nuevasSecciones} secciones y ${nuevosPlatos} platos creados${reemplazar ? ' (carta anterior borrada)' : ''}`,
        carta: cartaCompacta(await carta(t)),
      }
    })

  reg('qronnect_crear_seccion', 'Crear sección de la carta', 'Añade una sección (Entrantes, Postres…) al final de la carta.',
    { tienda, nombre: z.string().min(1).max(80), descripcion: z.string().max(300).optional() }, ESCRITURA,
    async ({ tienda: t, ...datos }) => api.tienda(t, 'POST', '/carta/categorias', { body: datos }))

  reg('qronnect_editar_seccion', 'Editar sección de la carta', 'Renombra, cambia la descripción u oculta/muestra una sección.',
    {
      tienda,
      seccion: z.string().describe('Nombre o id de la sección'),
      nombre: z.string().min(1).max(80).optional(),
      descripcion: z.string().max(300).nullable().optional(),
      activa: z.boolean().optional().describe('false = oculta en la carta pública'),
    },
    ESCRITURA,
    async ({ tienda: t, seccion, ...cambios }) => {
      const c = buscarCategoria(await carta(t), seccion)
      return api.tienda(t, 'PUT', `/carta/categorias/${c.id}`, { body: cambios })
    })

  reg('qronnect_ordenar_secciones', 'Ordenar secciones', 'Fija el orden de las secciones. Las que no nombres quedan al final en su orden actual.',
    { tienda, orden: z.array(z.string()).min(1).describe('Nombres o ids, en el orden deseado') }, ESCRITURA,
    async ({ tienda: t, orden }) => {
      const cats = await carta(t)
      const primero = orden.map((r) => buscarCategoria(cats, r).id)
      const ids = [...new Set([...primero, ...cats.map((c) => c.id)])]
      await api.tienda(t, 'PUT', '/carta/categorias/orden', { body: { ids } })
      return cartaCompacta(await carta(t)).map((c) => c.seccion)
    })

  reg('qronnect_borrar_seccion', 'Borrar sección', 'Borra una sección y TODOS sus platos. No se puede deshacer.',
    { tienda, seccion: z.string() }, BORRADO,
    async ({ tienda: t, seccion }) => {
      const c = buscarCategoria(await carta(t), seccion)
      await api.tienda(t, 'DELETE', `/carta/categorias/${c.id}`)
      return `Sección "${c.nombre}" borrada con sus ${c.platos.length} platos.`
    })

  reg('qronnect_crear_plato', 'Crear plato', 'Añade un plato al final de una sección.',
    { tienda, seccion: z.string().describe('Nombre o id de la sección'), nombre: z.string().min(1).max(120), ...camposPlato },
    ESCRITURA,
    async ({ tienda: t, seccion, ...datos }) => {
      const c = buscarCategoria(await carta(t), seccion)
      return api.tienda(t, 'POST', '/carta/platos', { body: { ...datos, id_categoria: c.id } })
    })

  reg('qronnect_editar_plato', 'Editar plato',
    'Cambia cualquier dato de un plato: precio, descripción, alérgenos, agotado (disponible=false), mover de sección…',
    {
      tienda,
      plato: z.string().describe('Nombre (o parte) o id del plato'),
      seccion_actual: z.string().optional().describe('Para desambiguar si hay platos con el mismo nombre'),
      nombre: z.string().min(1).max(120).optional(),
      mover_a_seccion: z.string().optional(),
      ...camposPlato,
    },
    ESCRITURA,
    async ({ tienda: t, plato, seccion_actual, mover_a_seccion, ...cambios }) => {
      const cats = await carta(t)
      const p = buscarPlato(cats, plato, seccion_actual)
      const body = { ...cambios }
      if (mover_a_seccion) body.id_categoria = buscarCategoria(cats, mover_a_seccion).id
      return api.tienda(t, 'PUT', `/carta/platos/${p.id}`, { body })
    })

  reg('qronnect_borrar_plato', 'Borrar plato', 'Borra un plato. Si solo está agotado, mejor editar_plato con disponible=false.',
    { tienda, plato: z.string(), seccion: z.string().optional() }, BORRADO,
    async ({ tienda: t, plato, seccion }) => {
      const p = buscarPlato(await carta(t), plato, seccion)
      await api.tienda(t, 'DELETE', `/carta/platos/${p.id}`)
      return `Plato "${p.nombre}" borrado.`
    })

  reg('qronnect_subir_foto_plato', 'Subir foto de plato', 'Sube una imagen local (JPG, PNG o WebP, máx. 3 MB) y la asigna al plato.',
    { tienda, plato: z.string(), ruta_archivo: z.string().describe('Ruta del archivo en este ordenador') }, ESCRITURA,
    async ({ tienda: t, plato, ruta_archivo }) => {
      const p = buscarPlato(await carta(t), plato)
      const ext = path.extname(ruta_archivo).toLowerCase()
      const tipo = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[ext]
      if (!tipo) throw new ErrorQronnect('La foto debe ser .jpg, .png o .webp')
      const form = new FormData()
      form.append('file', new Blob([fs.readFileSync(ruta_archivo)], { type: tipo }), path.basename(ruta_archivo))
      const { url } = await api.tienda(t, 'POST', '/carta/platos/imagen', { formData: form })
      await api.tienda(t, 'PUT', `/carta/platos/${p.id}`, { body: { imagen_url: url } })
      return `Foto asignada a "${p.nombre}": ${url}`
    })

  // ===================== Acceso a toda la API =====================

  reg('qronnect_buscar_endpoints', 'Buscar en la API',
    'Busca en la documentación de la API de Qronnect cualquier función del panel (sellos, puntos, regalos, campañas, clientes, branding, QR, superadmin…). Sin parámetros lista los grupos. Devuelve método, ruta, autenticación, parámetros y el cuerpo esperado, listos para qronnect_llamar_api.',
    {
      texto: z.string().optional().describe('Palabras a buscar, p. ej. "sellos programa" o "branding"'),
      grupo: z.string().optional().describe('Filtra por grupo, p. ej. "Sellos"'),
      metodo: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
    },
    LECTURA,
    async ({ texto: q, grupo, metodo }) => {
      const doc = await api.docs()
      if (!q && !grupo && !metodo) return { grupos: resumenGrupos(doc), uso: 'Busca con texto o grupo para ver los endpoints' }
      const ops = buscarOperaciones(doc, { texto: q, grupo, metodo })
      if (!ops.length) return 'Sin resultados. Prueba con otras palabras o sin filtros para ver los grupos.'
      if (ops.length <= 10) return ops.map((o) => detalleOperacion(o, doc))
      return {
        total: ops.length,
        nota: 'Muchos resultados: afina la búsqueda para ver el cuerpo de cada uno',
        endpoints: ops.slice(0, 60).map((o) => `${o.metodo} ${o.ruta} [${o.auth}] — ${o.resumen}`),
      }
    })

  reg('qronnect_llamar_api', 'Llamar a la API',
    'Llama a cualquier endpoint de la API de Qronnect con la autenticación ya resuelta: rutas /superadmin/* con la sesión de superadmin; el resto, como admin de la tienda indicada. Usa qronnect_buscar_endpoints para saber la ruta y el cuerpo.',
    {
      metodo: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
      ruta: z.string().describe('Ruta de la API, p. ej. "/sellos/programas" (el prefijo /api es opcional)'),
      tienda: tienda.optional().describe('Tienda sobre la que actuar (obligatoria salvo en rutas /superadmin)'),
      query: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
      body: z.any().optional().describe('Cuerpo JSON'),
      autenticacion: z
        .enum(['auto', 'superadmin', 'tienda', 'ninguna'])
        .default('auto')
        .describe('"ninguna" para probar lo que ve un cliente final'),
    },
    { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    async ({ metodo, ruta, tienda: t, query, body, autenticacion }) => {
      let ref = t
      if (t && autenticacion === 'ninguna') ref = (await api.resolverTienda(t).catch(() => ({ dominio: t }))).dominio
      return (await api.auto({ metodo, ruta, tienda: ref, query, body, autenticacion })) ?? 'OK (sin contenido)'
    })
}
