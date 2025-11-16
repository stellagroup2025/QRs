"use client"

import * as React from "react"
import { BRAND } from "@/config/appBrand"

function hexToRgb(hex: string): string {
  const cleaned = hex.replace("#", "")
  const expanded =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned
  const num = Number.parseInt(expanded, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `${r} ${g} ${b}`
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const p = BRAND.palette

  const cssVars: React.CSSProperties = {
    // @ts-ignore - CSS custom properties
    ["--brand-primary"]: hexToRgb(p.primary),
    ["--brand-primary-fg"]: hexToRgb(p.primaryFg),
    ["--brand-secondary"]: hexToRgb(p.secondary),
    ["--brand-secondary-fg"]: hexToRgb(p.secondaryFg),
    ["--brand-accent"]: hexToRgb(p.accent),
    ["--brand-bg"]: hexToRgb(p.background),
    ["--brand-fg"]: hexToRgb(p.foreground),
    ["--brand-muted"]: hexToRgb(p.muted),
    ["--brand-border"]: hexToRgb(p.border),
  }

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
    <div style={cssVars} className="min-h-screen">
      {children}
    </div>
  )
}
