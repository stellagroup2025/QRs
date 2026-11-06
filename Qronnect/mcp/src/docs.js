// Búsqueda en la documentación OpenAPI (Swagger) del backend para descubrir endpoints.

const METODOS = ['get', 'post', 'put', 'patch', 'delete']

const sinAcentos = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/** Qué autenticación pide un endpoint, deducido de la ruta y de si declara seguridad */
export function tipoAuth(ruta, op) {
  if (/^\/api\/superadmin(\/|$)/.test(ruta)) return 'superadmin'
  if (/^\/api\/comerciales(\/|$)/.test(ruta)) return 'comercial'
  if (op.security && op.security.length) return 'tienda'
  return 'publica'
}

export function listarOperaciones(doc) {
  const ops = []
  for (const [ruta, item] of Object.entries(doc.paths || {})) {
    for (const metodo of METODOS) {
      const op = item[metodo]
      if (!op) continue
      ops.push({
        metodo: metodo.toUpperCase(),
        ruta,
        grupo: (op.tags || ['-'])[0],
        resumen: op.summary || '',
        auth: tipoAuth(ruta, op),
        op,
      })
    }
  }
  return ops
}

/** Resuelve $ref y recorta el esquema a lo útil: tipos, enums, requeridos y descripciones */
export function simplificarEsquema(esquema, doc, profundidad = 0) {
  if (!esquema || profundidad > 4) return esquema ? '…' : undefined
  if (esquema.$ref) {
    const nombre = esquema.$ref.split('/').pop()
    return simplificarEsquema(doc.components?.schemas?.[nombre], doc, profundidad + 1)
  }
  if (esquema.allOf) {
    return esquema.allOf.reduce((acc, s) => {
      const r = simplificarEsquema(s, doc, profundidad + 1)
      return typeof r === 'object' ? { ...acc, ...r } : acc
    }, {})
  }
  if (esquema.type === 'array') return [simplificarEsquema(esquema.items, doc, profundidad + 1)]
  if (esquema.type === 'object' || esquema.properties) {
    const req = new Set(esquema.required || [])
    const out = {}
    for (const [k, v] of Object.entries(esquema.properties || {})) {
      out[`${k}${req.has(k) ? '' : '?'}`] = simplificarEsquema(v, doc, profundidad + 1)
    }
    return out
  }
  let t = esquema.type || 'any'
  if (esquema.enum) t = esquema.enum.map((e) => JSON.stringify(e)).join(' | ')
  if (esquema.format && !esquema.enum) t += ` (${esquema.format})`
  if (esquema.description) t += ` — ${esquema.description}`
  else if (esquema.example !== undefined) t += ` — ej.: ${JSON.stringify(esquema.example)}`
  return t
}

export function detalleOperacion(o, doc) {
  const params = (o.op.parameters || [])
    .filter((p) => p.in === 'path' || p.in === 'query')
    .map((p) => `${p.in === 'path' ? ':' : '?'}${p.name}${p.required ? '' : ' (opcional)'}${p.description ? ` — ${p.description}` : ''}`)
  const contenido = o.op.requestBody?.content || {}
  const tipo = Object.keys(contenido)[0]
  const cuerpo = tipo ? simplificarEsquema(contenido[tipo].schema, doc) : undefined
  return {
    endpoint: `${o.metodo} ${o.ruta}`,
    grupo: o.grupo,
    resumen: o.resumen,
    descripcion: o.op.description || undefined,
    autenticacion: o.auth,
    parametros: params.length ? params : undefined,
    cuerpo: tipo === 'multipart/form-data' ? 'multipart/form-data (subida de archivo; no se puede con llamar_api)' : cuerpo,
  }
}

/**
 * Busca operaciones por texto (ruta, resumen, descripción o grupo) y/o por grupo.
 * Todas las palabras tienen que aparecer, sin tener en cuenta acentos ni mayúsculas.
 */
export function buscarOperaciones(doc, { texto, grupo, metodo } = {}) {
  const palabras = sinAcentos(texto).split(/\s+/).filter(Boolean)
  const g = sinAcentos(grupo)
  return listarOperaciones(doc).filter((o) => {
    if (metodo && o.metodo !== metodo.toUpperCase()) return false
    if (g && !sinAcentos(o.grupo).includes(g)) return false
    const heno = sinAcentos(`${o.metodo} ${o.ruta} ${o.resumen} ${o.op.description || ''} ${o.grupo}`)
    return palabras.every((p) => heno.includes(p))
  })
}

export function resumenGrupos(doc) {
  const conteo = {}
  for (const o of listarOperaciones(doc)) conteo[o.grupo] = (conteo[o.grupo] || 0) + 1
  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .map(([g, n]) => `${g} (${n})`)
}
