'use client'

import type React from "react"
import { BRAND } from "@/config/appBrand"
import Link from "next/link"
import { BrandLogo } from './BrandLogo'
import { useBrandingContext } from './BrandingProvider'

interface AppShellProps {
  children: React.ReactNode
  showBackButton?: boolean
}

export function AppShell({ children, showBackButton = false }: AppShellProps) {
  const { branding } = useBrandingContext()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-[rgb(var(--brand-primary))]/10 bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo width={40} height={40} showName />
          </Link>
          {showBackButton && (
            <Link href="/" className="text-sm text-[rgb(var(--brand-accent))] hover:text-[rgb(var(--brand-accent))]/80 font-medium">
              Volver
            </Link>
          )}
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
      {/* Reutiliza Footer existente y añade enlaces legales RGPD */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          {BRAND.copy.footerNote && (
            <p className="text-center text-sm text-muted-foreground mb-4">
              {BRAND.copy.footerNote}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/terminos" className="text-[rgb(var(--brand-accent))] hover:text-[rgb(var(--brand-accent))]/80 underline">
              Términos y Condiciones
            </Link>
            <span>·</span>
            <Link href="/privacidad" className="text-[rgb(var(--brand-accent))] hover:text-[rgb(var(--brand-accent))]/80 underline">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
