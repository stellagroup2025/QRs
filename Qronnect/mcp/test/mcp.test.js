import { test } from 'node:test'
import assert from 'node:assert/strict'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { ClienteQronnect, rutaApi } from '../src/api.js'
import { registrarHerramientas, buscarPlato } from '../src/herramientas.js'
import { buscarOperaciones, detalleOperacion } from '../src/docs.js'
import { segundosRestantes } from '../src/sesion.js'

/** JWT sin firmar con caducidad dentro de `seg` segundos (el MCP solo lee exp) */
const jwt = (payload, seg = 3600) =>
  ['e30', Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + seg })).toString('base64url'), 'x'].join('.')

/** Backend falso: registra las llamadas y emula superadmin, tiendas y carta */
function backendFalso() {
  const llamadas = []
  const tiendas = [
    { id: 't1', dominio: 'lalonja', nombre: 'Taberna La Lonja', activo: true },
    { id: 't2', dominio: 'cafeaurora', nombre: 'Café Aurora', activo: true },
  ]
  let cats = []
  let platos = []
  let n = 0
  const id = (p) => `${p}${++n}`
  const res = (status, body) => new Response(body === undefined ? '' : JSON.stringify(body), { status })

  const fetchImpl = async (url, init) => {
    const u = new URL(url)
    const ruta = u.pathname
    const metodo = init.method
    const h = init.headers
    const body = init.body && typeof init.body === 'string' ? JSON.parse(init.body) : undefined
    llamadas.push({ metodo, ruta, auth: h.Authorization, tienda: h['X-Tenant-Domain'], body })
    let m

    if (ruta === '/api/superadmin/auth/send-email') return res(200, { ok: true })
    if (ruta === '/api/superadmin/auth/verify-email')
      return body.codigo === '123456' ? res(200, { access_token: jwt({ role: 'superadmin' }), superadmin: { nombre: 'Omar' } }) : res(400, { message: 'Código inválido' })
    if (ruta.startsWith('/api/superadmin/')) {
      if (!h.Authorization) return res(401, { message: 'Sin token' })
      if (ruta === '/api/superadmin/tiendas') return res(200, tiendas)
      if ((m = ruta.match(/^\/api\/superadmin\/tiendas\/(\w+)\/generar-token-admin$/)))
        return res(200, { access_token: jwt({ role: 'admin', tienda_id: m[1] }, 7200) })
    }
    if (ruta.startsWith('/api/carta')) {
      if (!h.Authorization && ruta !== '/api/carta/pagina') return res(401, { message: 'No' })
      const montar = () => cats.map((c) => ({ ...c, platos: platos.filter((p) => p.id_categoria === c.id) }))
      if (ruta === '/api/carta') return res(200, { categorias: montar() })
      if (ruta === '/api/carta/config') return res(200, { pagina_inicio: 'tres_vias', google_reviews_url: null, ...body })
      if (ruta === '/api/carta/categorias' && metodo === 'POST') {
        const c = { id: id('c'), descripcion: null, activa: true, ...body }
        cats.push(c)
        return res(201, c)
      }
      if ((m = ruta.match(/^\/api\/carta\/categorias\/(\w+)$/)) && metodo === 'DELETE') {
        cats = cats.filter((c) => c.id !== m[1])
        platos = platos.filter((p) => p.id_categoria !== m[1])
        return res(200, { ok: true })
      }
      if (ruta === '/api/carta/platos' && metodo === 'POST') {
        const p = { id: id('p'), alergenos: [], etiquetas: [], destacado: false, disponible: true, precio: null, ...body }
        platos.push(p)
        return res(201, p)
      }
      if ((m = ruta.match(/^\/api\/carta\/platos\/(\w+)$/)) && metodo === 'PUT') {
        const p = platos.find((x) => x.id === m[1])
        Object.assign(p, body)
        return res(200, p)
      }
    }
    return res(404, { message: `Ruta falsa no emulada: ${metodo} ${ruta}` })
  }
  return { fetchImpl, llamadas }
}

async function conectar() {
  const b = backendFalso()
  const api = new ClienteQronnect({ fetchImpl: b.fetchImpl, sesion: { superadmin: null, tiendas: {} }, persistir: false })
  const server = new McpServer({ name: 'qronnect', version: 'test' })
  registrarHerramientas(server, api)
  const [a, c] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'test', version: '1' })
  await Promise.all([server.connect(a), client.connect(c)])
  const llamar = async (name, args = {}) => {
    const r = await client.callTool({ name, arguments: args })
    const t = r.content[0].text
    let datos = t
    try {
      datos = JSON.parse(t)
    } catch {
      // texto plano
    }
    return { error: !!r.isError, datos, texto: t }
  }
  return { client, llamar, ...b }
}

test('normaliza rutas de la API', () => {
  assert.equal(rutaApi('carta'), '/api/carta')
  assert.equal(rutaApi('/carta/config'), '/api/carta/config')
  assert.equal(rutaApi('/api/sellos'), '/api/sellos')
  assert.throws(() => rutaApi('https://evil.com/api/x'))
})

test('lee la caducidad de un JWT', () => {
  assert.ok(segundosRestantes(jwt({}, 600)) > 590)
  assert.equal(segundosRestantes('basura'), -1)
})

test('expone todas las herramientas', async () => {
  const { client } = await conectar()
  const { tools } = await client.listTools()
  const nombres = tools.map((t) => t.name)
  for (const n of ['qronnect_login_superadmin', 'qronnect_importar_carta', 'qronnect_configurar_pagina_qr', 'qronnect_buscar_endpoints', 'qronnect_llamar_api'])
    assert.ok(nombres.includes(n), n)
  assert.ok(nombres.every((n) => n.startsWith('qronnect_')))
})

test('sin sesión, avisa de cómo iniciarla en vez de fallar a ciegas', async () => {
  const { llamar } = await conectar()
  const r = await llamar('qronnect_ver_carta', { tienda: 'lalonja' })
  assert.equal(r.error, true)
  assert.match(r.texto, /qronnect_login_superadmin/)
})

test('login de superadmin y acceso a cualquier tienda con token generado', async () => {
  const { llamar, llamadas } = await conectar()
  assert.equal((await llamar('qronnect_login_superadmin', { email: 'omar@qronnect.es' })).error, false)
  assert.equal((await llamar('qronnect_verificar_codigo', { codigo: '000000' })).error, true)
  assert.equal((await llamar('qronnect_verificar_codigo', { codigo: '123456' })).error, false)

  const tiendas = await llamar('qronnect_listar_tiendas', { buscar: 'aurora' })
  assert.deepEqual(tiendas.datos.map((t) => t.dominio), ['cafeaurora'])

  await llamar('qronnect_ver_carta', { tienda: 'Taberna La Lonja' })
  await llamar('qronnect_ver_carta', { tienda: 'lalonja' })
  const generados = llamadas.filter((l) => l.ruta.endsWith('generar-token-admin'))
  assert.equal(generados.length, 1, 'reutiliza el token de la tienda mientras sea válido')
  const carta = llamadas.filter((l) => l.ruta === '/api/carta')
  assert.ok(carta.every((l) => l.tienda === 'lalonja' && l.auth?.startsWith('Bearer ')))
})

test('importar carta crea secciones y platos y reutiliza secciones existentes', async () => {
  const { llamar } = await conectar()
  await llamar('qronnect_login_superadmin', { email: 'o@q.es' })
  await llamar('qronnect_verificar_codigo', { codigo: '123456' })

  const r1 = await llamar('qronnect_importar_carta', {
    tienda: 'lalonja',
    secciones: [
      { nombre: 'Entrantes', platos: [{ nombre: 'Croquetas', precio: 9.5, alergenos: ['gluten', 'lacteos'] }, { nombre: 'Patatas bravas', precio: 6 }] },
      { nombre: 'Postres', platos: [{ nombre: 'Flan casero', precio: 4.5, etiquetas: ['casero'] }] },
    ],
  })
  assert.equal(r1.error, false, r1.texto)
  assert.match(r1.datos.resultado, /2 secciones y 3 platos/)

  const r2 = await llamar('qronnect_importar_carta', { tienda: 'lalonja', secciones: [{ nombre: 'entrantes', platos: [{ nombre: 'Gildas' }] }] })
  assert.match(r2.datos.resultado, /0 secciones y 1 platos/)
  assert.deepEqual(r2.datos.carta.find((c) => c.seccion === 'Entrantes').platos.map((p) => p.nombre), ['Croquetas', 'Patatas bravas', 'Gildas'])

  const r3 = await llamar('qronnect_importar_carta', { tienda: 'lalonja', reemplazar: true, secciones: [{ nombre: 'Menú del día', platos: [] }] })
  assert.deepEqual(r3.datos.carta.map((c) => c.seccion), ['Menú del día'])
})

test('editar plato por nombre: precio, agotado y mover de sección', async () => {
  const { llamar, llamadas } = await conectar()
  await llamar('qronnect_login_superadmin', { email: 'o@q.es' })
  await llamar('qronnect_verificar_codigo', { codigo: '123456' })
  await llamar('qronnect_importar_carta', {
    tienda: 'lalonja',
    secciones: [{ nombre: 'Entrantes', platos: [{ nombre: 'Croquetas de jamón' }] }, { nombre: 'Tapas', platos: [] }],
  })
  const r = await llamar('qronnect_editar_plato', { tienda: 'lalonja', plato: 'croquetas', precio: 10, disponible: false, mover_a_seccion: 'Tapas' })
  assert.equal(r.error, false, r.texto)
  const put = llamadas.findLast((l) => l.metodo === 'PUT')
  assert.equal(put.body.precio, 10)
  assert.equal(put.body.disponible, false)
  assert.ok(put.body.id_categoria)
})

test('rechaza alérgenos que no existen', async () => {
  const { llamar } = await conectar()
  const r = await llamar('qronnect_crear_plato', { tienda: 'lalonja', seccion: 'x', nombre: 'y', alergenos: ['chocolate'] })
  assert.equal(r.error, true)
})

test('llamar_api usa superadmin en /superadmin y admin de tienda en el resto', async () => {
  const { llamar, llamadas } = await conectar()
  await llamar('qronnect_login_superadmin', { email: 'o@q.es' })
  await llamar('qronnect_verificar_codigo', { codigo: '123456' })
  await llamar('qronnect_llamar_api', { metodo: 'GET', ruta: '/superadmin/tiendas' })
  await llamar('qronnect_llamar_api', { metodo: 'PUT', ruta: 'carta/config', tienda: 'cafeaurora', body: { pagina_inicio: 'landing' } })
  const ultima = llamadas.at(-1)
  assert.equal(ultima.ruta, '/api/carta/config')
  assert.equal(ultima.tienda, 'cafeaurora')
  assert.deepEqual(ultima.body, { pagina_inicio: 'landing' })
})

test('buscarPlato avisa cuando el nombre es ambiguo', () => {
  const cats = [
    { id: 'a', nombre: 'Entrantes', platos: [{ id: '1', nombre: 'Croquetas de jamón' }, { id: '2', nombre: 'Croquetas de bacalao' }] },
  ]
  assert.throws(() => buscarPlato(cats, 'croquetas'), /ambiguo/)
  assert.equal(buscarPlato(cats, 'bacalao').id, '2')
  assert.equal(buscarPlato(cats, 'Croquetas de jamón').id, '1')
})

test('busca endpoints en la documentación OpenAPI', () => {
  const doc = {
    paths: {
      '/api/sellos/programas': {
        post: { tags: ['Sellos'], summary: 'Crear programa de sellos', security: [{ JWT: [] }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Crear' } } } } },
        get: { tags: ['Sellos'], summary: 'Listar programas', security: [{ JWT: [] }] },
      },
      '/api/superadmin/tiendas': { get: { tags: ['SuperAdmin'], summary: 'Listar todas las tiendas' } },
    },
    components: { schemas: { Crear: { type: 'object', required: ['nombre'], properties: { nombre: { type: 'string' }, sellos_necesarios: { type: 'integer' } } } } },
  }
  const ops = buscarOperaciones(doc, { texto: 'programa sellos', metodo: 'POST' })
  assert.equal(ops.length, 1)
  const d = detalleOperacion(ops[0], doc)
  assert.equal(d.autenticacion, 'tienda')
  assert.deepEqual(d.cuerpo, { nombre: 'string', 'sellos_necesarios?': 'integer' })
  assert.equal(detalleOperacion(buscarOperaciones(doc, { texto: 'tiendas' })[0], doc).autenticacion, 'superadmin')
})
