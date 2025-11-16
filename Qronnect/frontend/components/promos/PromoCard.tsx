"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Promocion } from "@/types/promo"

interface PromoCardProps {
  promo: Promocion
}

export function PromoCard({ promo }: PromoCardProps) {
  const href = promo.ctaHref ? (promo.utm ? `${promo.ctaHref}?${promo.utm}` : promo.ctaHref) : "/"

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {promo.imagenUrl && (
        <div className="aspect-video relative overflow-hidden bg-muted">
          <img src={promo.imagenUrl || "/placeholder.svg"} alt={promo.titulo} className="w-full h-full object-cover" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{promo.titulo}</CardTitle>
          {promo.etiquetas && promo.etiquetas.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {promo.etiquetas[0]}
            </Badge>
          )}
        </div>
        {promo.subtitulo && <CardDescription>{promo.subtitulo}</CardDescription>}
      </CardHeader>
      {promo.descripcion && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{promo.descripcion}</p>
        </CardContent>
      )}
      {promo.ctaLabel && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={href}>{promo.ctaLabel}</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
