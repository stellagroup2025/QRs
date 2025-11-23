import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas de cliente que requieren slug
const CLIENT_ROUTES = [
  '/mi-perfil',
  '/mi-qr',
  '/mis-cupones',
  '/mis-canjes',
  '/mis-referidos',
  '/promociones',
]

// Rutas que NO necesitan redirección (admin, API, estáticas, etc.)
const EXCLUDED_PREFIXES = [
  '/admin',
  '/api',
  '/superadmin',
  '/staff',
  '/login',
  '/registro',
  '/recuperar',
  '/validar-email',
  '/validacion-pendiente',
  '/terminos',
  '/privacidad',
  '/aviso-legal',
  '/politica-cookies',
  '/unsubscribe',
  '/_next',
  '/favicon.ico',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''

  // Verificar si la ruta necesita redirección
  const isClientRoute = CLIENT_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))
  const isExcluded = EXCLUDED_PREFIXES.some(prefix => pathname.startsWith(prefix))

  if (!isClientRoute || isExcluded) {
    return NextResponse.next()
  }

  // Extraer slug del subdominio o hostname
  let slug = ''

  if (host.includes('localhost')) {
    // En desarrollo, podemos usar un slug por defecto o extraer de query params
    // Por ahora, no redirigir en localhost
    return NextResponse.next()
  }

  // Extraer subdomain (ej: paco-restaurante.qronnect.es -> paco-restaurante)
  const parts = host.split('.')
  if (parts.length >= 3) {
    slug = parts[0] // El primer segmento es el subdominio
  }

  // Si no hay slug válido, no redirigir
  if (!slug || slug === 'www' || slug === 'qronnect') {
    return NextResponse.next()
  }

  // Redirigir a /{slug}{pathname}
  const url = request.nextUrl.clone()
  url.pathname = `/${slug}${pathname}`

  console.log(`🔀 Redirecting: ${pathname} → ${url.pathname}`)

  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
