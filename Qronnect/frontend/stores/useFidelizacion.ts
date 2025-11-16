import { create } from "zustand"
import type { Evento, EstadoSellos } from "@/types"
import {
  registrarEvento as registrarEventoAdapter,
  listarEventosCliente,
  getEstadoSellos,
  sumarSello as sumarSelloAdapter,
} from "@/lib/dataAdapter"

interface FidelizacionStore {
  registrarEvento: (data: Omit<Evento, "id" | "fecha">) => Evento
  obtenerEventosCliente: (clienteId: string) => Evento[]
  obtenerEstadoSellos: (clienteId: string) => EstadoSellos | null
  agregarSello: (clienteId: string, requisito: number) => { canje: boolean; nuevoProgreso: number }
}

export const useFidelizacion = create<FidelizacionStore>(() => ({
  registrarEvento: (data) => {
    return registrarEventoAdapter(data)
  },

  obtenerEventosCliente: (clienteId) => {
    return listarEventosCliente(clienteId)
  },

  obtenerEstadoSellos: (clienteId) => {
    return getEstadoSellos(clienteId)
  },

  agregarSello: (clienteId, requisito) => {
    return sumarSelloAdapter(clienteId, requisito)
  },
}))
