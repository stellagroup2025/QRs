// app/layout.tsx
import type React from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { WebVitals } from "@/components/web-vitals"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { BrandProvider } from "@/components/BrandProvider"
import { BrandingProvider } from "@/components/BrandingProvider"
import { CookieConsentProvider } from "@/components/CookieConsentProvider"
import { CookieBanner } from "@/components/CookieBanner"
import { SkipLink } from "@/components/ui/skip-link"
import { ConfirmDialogProvider } from "@/hooks/use-confirm-dialog"
import { SimpleLoadingBar } from "@/components/loading-bar"
import { BRAND } from "@/config/appBrand"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// Base sin metadataBase (lo añadimos dinámico en generateMetadata)
const baseMetadata: Metadata = {
  title: {
    default: `${BRAND.copy.companyName} - Fidelización con QR`,
    template: `%s | ${BRAND.copy.companyName}`,
  },
  description:
    "Sistema de fidelización inteligente con códigos QR. Sin app, sin complicaciones. Aumenta tus ventas un 40% con Qronnect. Prueba gratis.",
  keywords: [
    'programa de fidelización',
    'código QR',
    'tarjeta de fidelización',
    'fidelización clientes',
    'loyalty program',
    'marketing local',
    'aumentar ventas',
    'retención clientes',
    'CRM pequeñas empresas',
    'Qronnect',
  ],
  authors: [{ name: 'StellaGroup', url: 'https://stellagroup.es' }],
  creator: 'StellaGroup',
  publisher: 'Qronnect',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: `${BRAND.copy.companyName} - Fidelización con QR`,
    description: "Sistema de fidelización sin app. Aumenta tus ventas un 40%. Sin complicaciones, resultados en 30 días.",
    images: BRAND.assets.ogImage ? [{
      url: BRAND.assets.ogImage,
      width: 1200,
      height: 630,
      alt: 'Qronnect - Programa de Fidelización con QR'
    }] : undefined,
    type: "website",
    siteName: BRAND.copy.companyName,
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@qronnect',
    creator: '@stellagroup',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' }
    ],
  },
  manifest: '/manifest.json',
  generator: "Next.js",
  applicationName: 'Qronnect',
  referrer: 'origin-when-cross-origin',
  category: 'business',
  alternates: {
    canonical: '/',
  },
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

  // Usar branding del tenant si está disponible, sino usar logo de Qronnect
  const favicon = tenantBranding?.favicon_url || '/brand/qronnect/favicon.ico'
  const ogImage = tenantBranding?.og_image_url || '/brand/qronnect/og-qronnect.jpg'
  const title = tenantBranding?.nombre_comercial
    ? `${tenantBranding.nombre_comercial} - Programa de Fidelización`
    : baseMetadata.title

  return {
    ...baseMetadata,
    title,
    metadataBase: base,
    alternates: {
      canonical: base.toString(),
    },
    icons: tenantBranding?.favicon_url ? {
      icon: [
        { url: tenantBranding.favicon_url, type: 'image/x-icon' }
      ],
    } : baseMetadata.icons,
    openGraph: {
      ...(baseMetadata.openGraph ?? {}),
      url: base.toString(),
      images: ogImage ? [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title as string,
      }] : (baseMetadata.openGraph as any)?.images,
      title: title as string,
      siteName: tenantBranding?.nombre_comercial || 'Qronnect',
      locale: 'es_ES',
    },
    twitter: {
      card: "summary_large_image",
      title: title as string,
      description: (baseMetadata.description ?? undefined) as string | undefined,
      images: ogImage ? [{
        url: ogImage,
        alt: title as string,
      }] : (baseMetadata.openGraph as any)?.images,
      site: '@qronnect',
      creator: '@stellagroup',
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans antialiased ${_geist.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SimpleLoadingBar />
          <SkipLink />
          <BrandingProvider>
            <CookieConsentProvider>
              <BrandProvider>
                <ConfirmDialogProvider>
                  <main id="main-content">
                    {children}
                  </main>
                  <Toaster />
                  <CookieBanner />
                </ConfirmDialogProvider>
              </BrandProvider>
            </CookieConsentProvider>
          </BrandingProvider>
          <WebVitals />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
