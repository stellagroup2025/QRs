import { create } from "zustand"
import type { Cliente } from "@/types"
import {
  crearCliente as crearClienteAdapter,
  getCliente,
  listarClientes,
  findClienteByEmail as findByEmailAdapter,
  upsertClienteByEmail as upsertByEmailAdapter,
} from "@/lib/dataAdapter"

interface ClientesStore {
  clientes: Cliente[]
  cargarClientes: () => void
  crearCliente: (data: Omit<Cliente, "id" | "token" | "createdAt">) => Cliente
  buscarCliente: (id: string) => Cliente | null
  recuperarPorEmail: (email: string) => Cliente | null
  crearSiNoExiste: (email: string, payload: { nombre: string; telefono?: string }) => Cliente
}

export const useClientes = create<ClientesStore>((set, get) => ({
  clientes: [],

  cargarClientes: () => {
    const clientes = listarClientes()
    set({ clientes })
  },

  crearCliente: (data) => {
    const cliente = crearClienteAdapter(data)
    set((state) => ({ clientes: [...state.clientes, cliente] }))
    return cliente
  },

  buscarCliente: (id) => {
    return getCliente(id)
  },

  recuperarPorEmail: (email) => {
    return findByEmailAdapter(email)
  },

  crearSiNoExiste: (email, payload) => {
    const cliente = upsertByEmailAdapter(email, payload)
    const exists = get().clientes.find((c) => c.id === cliente.id)
    if (!exists) {
      set((state) => ({ clientes: [...state.clientes, cliente] }))
    }
    return cliente
  },
}))
