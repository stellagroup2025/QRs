export type PromoPlacement = "hero" | "banner" | "card"
export type PromoStatus = "borrador" | "programada" | "publicada" | "expirada"

export type Promocion = {
  id: string
  titulo: string
  subtitulo?: string
  descripcion?: string
  imagenUrl?: string
  // Acción
  ctaLabel?: string // p.ej. "Obtener mi QR" o "Ver condiciones"
  ctaHref?: string // p.ej. "/registro" o "/mi-cuenta"
  // Programación y estado
  estado: PromoStatus
  inicio?: string // ISO
  fin?: string // ISO
  prioridad?: number // 1..100 (más alto = primero)
  placement: PromoPlacement // hero/banner/card
  // Etiquetas y tracking
  etiquetas?: string[] // ["perfumes","rebajas"]
  utm?: string // "utm_source=web&utm_campaign=promo"
  // Metadatos
  createdAt: string
  updatedAt: string
}
