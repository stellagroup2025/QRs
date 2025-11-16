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

// Next 16 (tipos nuevos): headers() puede ser Promise<ReadonlyHeaders> -> usar await
export async function generateMetadata(): Promise<Metadata> {
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  const base = new URL(`${proto}://${host}`)

  return {
    ...baseMetadata,
    metadataBase: base,
    openGraph: {
      ...(baseMetadata.openGraph ?? {}),
      url: base.toString(),
    },
    twitter: {
      card: "summary_large_image",
      title: (baseMetadata.title as string) ?? BRAND.copy.companyName,
      // Corrige el tipo: `string | null | undefined` -> `string | undefined`
      description: (baseMetadata.description ?? undefined) as string | undefined,
      images: (baseMetadata.openGraph as any)?.images,
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
