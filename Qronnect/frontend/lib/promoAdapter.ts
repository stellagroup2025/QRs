import type { Promocion } from "@/types/promo"

const KEY = "promos:v1"

const PLACEHOLDER_PROMOS: Promocion[] = []

function read(): Promocion[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(KEY)
    if (!stored) {
      write(PLACEHOLDER_PROMOS)
      return PLACEHOLDER_PROMOS
    }
    return JSON.parse(stored)
  } catch {
    return []
  }
}

function write(list: Promocion[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(list))
}

export const promoAdapter = {
  list() {
    return read().sort((a, b) => (b.prioridad || 0) - (a.prioridad || 0))
  },
  get(id: string) {
    return read().find((p) => p.id === id) || null
  },
  upsert(p: Promocion) {
    const all = read()
    const i = all.findIndex((x) => x.id === p.id)
    if (i >= 0) all[i] = p
    else all.push(p)
    write(all)
    return p
  },
  remove(id: string) {
    write(read().filter((p) => p.id !== id))
  },
}
