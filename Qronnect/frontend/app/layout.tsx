// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { BrandProvider } from "@/components/BrandProvider"
import { BrandingProvider } from "@/components/BrandingProvider"
import { CookieConsentProvider } from "@/components/CookieConsentProvider"
import { CookieBanner } from "@/components/CookieBanner"
import { BRAND } from "@/config/appBrand"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// Base sin metadataBase (lo añadimos dinámico en generateMetadata)
const baseMetadata: Metadata = {
  title: `${BRAND.copy.companyName} - Programa de Fidelización`,
  description:
    (BRAND.copy.tagline || "Únete a nuestro programa de fidelización y obtén recompensas") ?? undefined,
  openGraph: {
    title: `${BRAND.copy.companyName} - Programa de Fidelización`,
    description: (BRAND.copy.tagline || "Únete a nuestro programa de fidelización") ?? undefined,
    images: BRAND.assets.ogImage ? [{ url: BRAND.assets.ogImage }] : undefined,
    type: "website",
  },
  icons: BRAND.assets.favicon || undefined,
  generator: "v0.app",
}

// Función helper para obtener branding del tenant (si existe)
async function getTenantBranding(tenantDomain?: string) {
  if (!tenantDomain) return null

  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${API_URL}/api/config/branding`, {
      headers: { 'X-Tenant-Domain': tenantDomain },
      cache: 'no-store', // Siempre fresh data
    })

    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error('Error fetching tenant branding:', error)
    return null
  }
}

// Next 16 (tipos nuevos): headers() puede ser Promise<ReadonlyHeaders> -> usar await
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  const base = new URL(`${proto}://${host}`)

  // Intentar obtener subdomain para branding específico del tenant
  const subdomain = host.split('.')[0]
  const tenantDomain = subdomain !== 'localhost:3000' && subdomain !== 'qronnect' ? subdomain : undefined
  const tenantBranding = await getTenantBranding(tenantDomain)

  // Usar branding del tenant si está disponible, sino usar defaults
  const favicon = tenantBranding?.favicon_url || BRAND.assets.favicon
  const ogImage = tenantBranding?.og_image_url || BRAND.assets.ogImage
  const title = tenantBranding?.nombre_comercial
    ? `${tenantBranding.nombre_comercial} - Programa de Fidelización`
    : baseMetadata.title

  return {
    ...baseMetadata,
    title,
    metadataBase: base,
    icons: favicon || undefined,
    openGraph: {
      ...(baseMetadata.openGraph ?? {}),
      url: base.toString(),
      images: ogImage ? [{ url: ogImage }] : (baseMetadata.openGraph as any)?.images,
      title: title as string,
    },
    twitter: {
      card: "summary_large_image",
      title: title as string,
      description: (baseMetadata.description ?? undefined) as string | undefined,
      images: ogImage ? [ogImage] : (baseMetadata.openGraph as any)?.images,
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased ${_geist.className}`}>
        <BrandingProvider>
          <CookieConsentProvider>
            <BrandProvider>
              {children}
              <Toaster />
              <CookieBanner />
            </BrandProvider>
          </CookieConsentProvider>
        </BrandingProvider>
        <Analytics />
      </body>
    </html>
  )
}
