"use client"
import { create } from "zustand"
import { nanoid } from "nanoid"
import { promoAdapter } from "@/lib/promoAdapter"
import type { Promocion, PromoStatus } from "@/types/promo"

type S = {
  promos: Promocion[]
  reload: () => void
  create: (partial: Partial<Promocion>) => Promocion
  updateStatus: (id: string, estado: PromoStatus) => void
  save: (promo: Promocion) => void
  remove: (id: string) => void
  visibles: (now?: Date) => Promocion[]
}

function isActive(p: Promocion, now = new Date()) {
  if (p.estado === "publicada") return true
  if (p.estado === "programada") {
    const start = p.inicio ? new Date(p.inicio) : null
    const end = p.fin ? new Date(p.fin) : null
    const okStart = !start || now >= start
    const okEnd = !end || now <= end
    return okStart && okEnd
  }
  return false
}

export const usePromos = create<S>((set, get) => ({
  promos: [],

  reload: () => {
    const promos = promoAdapter.list()
    set({ promos })
  },

  create: (partial) => {
    const now = new Date().toISOString()
    const promo: Promocion = {
      id: nanoid(),
      titulo: partial.titulo || "Nueva promoción",
      subtitulo: partial.subtitulo || "",
      descripcion: partial.descripcion || "",
      imagenUrl: partial.imagenUrl || "",
      ctaLabel: partial.ctaLabel || "Ver más",
      ctaHref: partial.ctaHref || "/",
      estado: partial.estado || "borrador",
      inicio: partial.inicio,
      fin: partial.fin,
      prioridad: partial.prioridad ?? 50,
      placement: partial.placement || "card",
      etiquetas: partial.etiquetas || [],
      utm: partial.utm || "",
      createdAt: now,
      updatedAt: now,
    }
    promoAdapter.upsert(promo)
    set({ promos: promoAdapter.list() })
    return promo
  },

  updateStatus: (id, estado) => {
    const p = promoAdapter.get(id)
    if (!p) return
    p.estado = estado
    p.updatedAt = new Date().toISOString()
    promoAdapter.upsert(p)
    set({ promos: promoAdapter.list() })
  },

  save: (promo) => {
    promo.updatedAt = new Date().toISOString()
    promoAdapter.upsert(promo)
    set({ promos: promoAdapter.list() })
  },

  remove: (id) => {
    promoAdapter.remove(id)
    set({ promos: promoAdapter.list() })
  },

  visibles: (now) => {
    return get()
      .promos.filter((p) => isActive(p, now))
      .sort((a, b) => (b.prioridad || 0) - (a.prioridad || 0))
  },
}))
