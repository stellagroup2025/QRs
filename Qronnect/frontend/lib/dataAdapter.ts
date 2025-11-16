import type { Cliente, Evento, EstadoSellos } from "@/types"

// LocalStorage con fallback in-memory
const STORAGE_KEYS = {
  CLIENTES: "comercio_clientes",
  EVENTOS: "comercio_eventos",
  SELLOS: "comercio_sellos",
}

// In-memory fallback
const memoryClientes: Cliente[] = []
const memoryEventos: Evento[] = []
let memorySellos: EstadoSellos[] = []

function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false
  try {
    const test = "__test__"
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Clientes
export function crearCliente(data: Omit<Cliente, "id" | "token" | "createdAt">): Cliente {
  const cliente: Cliente = {
    ...data,
    id: crypto.randomUUID(),
    token: crypto.randomUUID().replace(/-/g, "").substring(0, 16),
    createdAt: new Date().toISOString(),
  }

  if (isLocalStorageAvailable()) {
    const clientes = listarClientes()
    clientes.push(cliente)
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes))
  } else {
    memoryClientes.push(cliente)
  }

  // Registrar evento de alta
  registrarEvento({
    clienteId: cliente.id,
    tipo: "alta_cliente",
  })

  // Inicializar estado de sellos
  const sellos: EstadoSellos = {
    clienteId: cliente.id,
    progreso: 0,
    actualizadoEn: new Date().toISOString(),
    requisito: 10, // del config
  }

  if (isLocalStorageAvailable()) {
    const todosSellos = listarSellos()
    todosSellos.push(sellos)
    localStorage.setItem(STORAGE_KEYS.SELLOS, JSON.stringify(todosSellos))
  } else {
    memorySellos.push(sellos)
  }

  return cliente
}

export function getCliente(id: string): Cliente | null {
  const clientes = listarClientes()
  return clientes.find((c) => c.id === id) || null
}

export function getClientePorToken(id: string, token: string): Cliente | null {
  const clientes = listarClientes()
  return clientes.find((c) => c.id === id && c.token === token) || null
}

export function listarClientes(): Cliente[] {
  if (isLocalStorageAvailable()) {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTES)
    return data ? JSON.parse(data) : []
  }
  return memoryClientes
}

export function findClienteByEmail(email: string): Cliente | null {
  const clientes = listarClientes()
  return clientes.find((c) => c.email.toLowerCase() === email.toLowerCase()) || null
}

export function upsertClienteByEmail(email: string, data: { nombre: string; telefono?: string }): Cliente {
  // Buscar si ya existe
  const existente = findClienteByEmail(email)
  if (existente) {
    return existente
  }

  // Crear nuevo si no existe
  return crearCliente({
    nombre: data.nombre,
    email,
    telefono: data.telefono,
  })
}

export function getClienteById(id: string): Cliente | null {
  return getCliente(id)
}

// Eventos
export function registrarEvento(data: Omit<Evento, "id" | "fecha">): Evento {
  const evento: Evento = {
    ...data,
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
  }

  if (isLocalStorageAvailable()) {
    const eventos = listarEventos()
    eventos.push(evento)
    localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(eventos))
  } else {
    memoryEventos.push(evento)
  }

  return evento
}

export function listarEventos(): Evento[] {
  if (isLocalStorageAvailable()) {
    const data = localStorage.getItem(STORAGE_KEYS.EVENTOS)
    return data ? JSON.parse(data) : []
  }
  return memoryEventos
}

export function listarEventosCliente(clienteId: string): Evento[] {
  return listarEventos().filter((e) => e.clienteId === clienteId)
}

// Sellos
function listarSellos(): EstadoSellos[] {
  if (isLocalStorageAvailable()) {
    const data = localStorage.getItem(STORAGE_KEYS.SELLOS)
    return data ? JSON.parse(data) : []
  }
  return memorySellos
}

export function getEstadoSellos(clienteId: string): EstadoSellos | null {
  const sellos = listarSellos()
  return sellos.find((s) => s.clienteId === clienteId) || null
}

export function sumarSello(clienteId: string, requisito: number): { canje: boolean; nuevoProgreso: number } {
  const sellos = listarSellos()
  const idx = sellos.findIndex((s) => s.clienteId === clienteId)

  if (idx === -1) {
    // Crear nuevo
    const nuevoSello: EstadoSellos = {
      clienteId,
      progreso: 1,
      actualizadoEn: new Date().toISOString(),
      requisito,
    }
    sellos.push(nuevoSello)

    if (isLocalStorageAvailable()) {
      localStorage.setItem(STORAGE_KEYS.SELLOS, JSON.stringify(sellos))
    } else {
      memorySellos = sellos
    }

    registrarEvento({ clienteId, tipo: "sello" })
    return { canje: false, nuevoProgreso: 1 }
  }

  const estado = sellos[idx]
  estado.progreso += 1
  estado.actualizadoEn = new Date().toISOString()

  let canje = false
  if (estado.progreso >= requisito) {
    // Canje realizado
    registrarEvento({ clienteId, tipo: "canje", meta: { sellos: estado.progreso } })
    estado.progreso = 0 // Reset
    canje = true
  } else {
    registrarEvento({ clienteId, tipo: "sello" })
  }

  if (isLocalStorageAvailable()) {
    localStorage.setItem(STORAGE_KEYS.SELLOS, JSON.stringify(sellos))
  } else {
    memorySellos = sellos
  }

  return { canje, nuevoProgreso: estado.progreso }
}

// RGPD: Eliminación completa de datos de un cliente
export function eliminarCliente(clienteId: string, token: string): boolean {
  // Verificar que el token coincide
  const cliente = getClientePorToken(clienteId, token)
  if (!cliente) {
    return false
  }

  // Eliminar cliente
  if (isLocalStorageAvailable()) {
    const clientes = listarClientes().filter((c) => c.id !== clienteId)
    localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes))
  } else {
    const idx = memoryClientes.findIndex((c) => c.id === clienteId)
    if (idx !== -1) {
      memoryClientes.splice(idx, 1)
    }
  }

  // Eliminar eventos del cliente
  if (isLocalStorageAvailable()) {
    const eventos = listarEventos().filter((e) => e.clienteId !== clienteId)
    localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(eventos))
  } else {
    const eventosDelCliente = memoryEventos.filter((e) => e.clienteId === clienteId)
    eventosDelCliente.forEach((evento) => {
      const idx = memoryEventos.indexOf(evento)
      if (idx !== -1) {
        memoryEventos.splice(idx, 1)
      }
    })
  }

  // Eliminar sellos del cliente
  if (isLocalStorageAvailable()) {
    const sellos = listarSellos().filter((s) => s.clienteId !== clienteId)
    localStorage.setItem(STORAGE_KEYS.SELLOS, JSON.stringify(sellos))
  } else {
    const idx = memorySellos.findIndex((s) => s.clienteId === clienteId)
    if (idx !== -1) {
      memorySellos.splice(idx, 1)
    }
  }

  return true
}
