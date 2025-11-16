"use client"

import { PromoCard } from "./PromoCard"
import type { Promocion } from "@/types/promo"
import { cn } from "@/lib/utils"

interface PromoRailProps {
  promos: Promocion[]
}

export function PromoRail({ promos }: PromoRailProps) {
  if (promos.length === 0) return null

  const gridClass = cn(
    "grid gap-6 max-w-7xl mx-auto",
    promos.length === 1 && "grid-cols-1 max-w-2xl",
    promos.length === 2 && "grid-cols-1 md:grid-cols-2",
    promos.length >= 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  )

  return (
    <section className="space-y-6">
      <h3 className="text-2xl font-semibold text-center">Promociones activas</h3>
      <div className={gridClass}>
        {promos.map((promo) => (
          <PromoCard key={promo.id} promo={promo} />
        ))}
      </div>
    </section>
  )
}
