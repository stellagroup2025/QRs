export type Cliente = {
  id: string
  nombre: string
  email: string // email ahora es obligatorio
  telefono?: string
  token: string
  createdAt: string
}

export type EventoTipo = "compra" | "sello" | "canje" | "descuento_aplicado" | "alta_cliente"

export type Evento = {
  id: string
  clienteId: string
  fecha: string
  tipo: EventoTipo
  meta?: Record<string, any>
}

export type EstadoSellos = {
  clienteId: string
  progreso: number
  actualizadoEn: string
  requisito: number
}
