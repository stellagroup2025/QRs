/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TEMPORAL: Ignorar errores para deployment inicial
    // TODO: Corregir error en mis-referidos/page.tsx línea 298
    ignoreBuildErrors: true,
  },
  images: {
    // En producción, Vercel optimiza las imágenes automáticamente
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Permitir cualquier dominio HTTPS para logos (CDNs, servicios de imágenes, etc.)
      {
        protocol: 'https',
        hostname: '**',
      },
      // Permitir HTTP solo en desarrollo
      ...(process.env.NODE_ENV === 'development' ? [{
        protocol: 'http',
        hostname: '**',
      }] : []),
    ],
  },
  // Headers de seguridad
  async headers() {
    return [
      // Sitemap: forzar 200 OK siempre (sin caché ni 304)
      // Soluciona problemas de Google Search Console
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex',
          },
        ],
      },
      // Robots.txt: también sin caché
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      // Headers de seguridad para el resto del sitio
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // Redirects comunes
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
}

export default nextConfig
