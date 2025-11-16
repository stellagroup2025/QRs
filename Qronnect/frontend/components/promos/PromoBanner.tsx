"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { X } from "lucide-react"
import type { Promocion } from "@/types/promo"
import { useState } from "react"

interface PromoBannerProps {
  promo: Promocion
}

export function PromoBanner({ promo }: PromoBannerProps) {
  const [visible, setVisible] = useState(true)
  const href = promo.ctaHref ? (promo.utm ? `${promo.ctaHref}?${promo.utm}` : promo.ctaHref) : "/"

  if (!visible) return null

  return (
    <div className="bg-brand text-brand-foreground py-3 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 text-center">
          <p className="text-sm md:text-base font-medium">
            {promo.titulo}
            {promo.subtitulo && <span className="ml-2 opacity-90">{promo.subtitulo}</span>}
          </p>
        </div>
        {promo.ctaLabel && (
          <Button asChild size="sm" variant="secondary" className="shrink-0">
            <Link href={href}>{promo.ctaLabel}</Link>
          </Button>
        )}
        <button
          onClick={() => setVisible(false)}
          className="shrink-0 p-1 hover:bg-white/10 rounded transition"
          aria-label="Cerrar banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
