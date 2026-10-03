import { MetadataRoute } from 'next'
import { SECTORES } from '@/lib/sectores'

/**
 * Sitemap dinámico para Qronnect
 * Se genera automáticamente en /sitemap.xml
 *
 * IMPORTANTE:
 * - Solo incluye páginas públicas indexables
 * - NO incluye login, admin, recuperar (se bloquean en robots.txt)
 * - Usa dominio oficial: https://www.qronnect.es
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // URL oficial del sitio (consistente con canonical y Search Console)
  const baseUrl = 'https://www.qronnect.es'
  const currentDate = new Date()

  return [
    // Página principal - landing de producto
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    // Página de registro - landing de conversión
    {
      url: `${baseUrl}/get-qr`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    // Landings de venta por sector
    ...Object.keys(SECTORES).map((slug) => ({
      url: `${baseUrl}/para/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    // Formulario de contacto para negocios
    {
      url: `${baseUrl}/contacto`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    },
    // Páginas legales (importantes para SEO y confianza)
    {
      url: `${baseUrl}/privacidad`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/aviso-legal`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ]
}
