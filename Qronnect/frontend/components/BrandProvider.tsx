"use client"

import * as React from "react"
import { BRAND } from "@/config/appBrand"

/**
 * Envoltorio global de la app. Los colores de cada tienda los pone BrandingProvider
 * en :root (--brand-primary...); aquí no se definen para no taparlos.
 */
export function BrandProvider({ children }: { children: React.ReactNode }) {
  // Actualizar favicon dinámicamente
  React.useEffect(() => {
    if (BRAND.assets.favicon) {
      let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
      if (!link) {
        link = document.createElement("link")
        link.rel = "icon"
        document.head.appendChild(link)
      }
      link.href = BRAND.assets.favicon
    }
  }, [])

  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
