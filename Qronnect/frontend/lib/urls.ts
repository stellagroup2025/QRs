/**
 * Utilidades para generar URLs de la aplicación
 * Detecta automáticamente si estamos en desarrollo o producción
 */

/**
 * Obtiene el dominio base de la aplicación
 * - En desarrollo: localhost:3000
 * - En producción: qronnect.es (o el dominio configurado)
 */
export function getBaseDomain(): string {
  // Si hay una variable de entorno configurada, usarla
  const configuredDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN
  if (configuredDomain) {
    return configuredDomain
  }

  // Auto-detectar basado en el entorno
  if (typeof window !== 'undefined') {
    // En el cliente, detectar por hostname
    const hostname = window.location.hostname

    // Si estamos en localhost, usar localhost:3000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'localhost:3000'
    }

    // Si estamos en Vercel preview o producción, extraer el dominio base
    // Ejemplos:
    // - app.qronnect.es → qronnect.es
    // - lokeyokiera.qronnect.es → qronnect.es
    // - qronnect.es → qronnect.es
    const parts = hostname.split('.')
    if (parts.length >= 2) {
      // Tomar los últimos 2 segmentos (dominio.tld)
      return parts.slice(-2).join('.')
    }

    return hostname
  }

  // Fallback para server-side rendering
  return 'qronnect.es'
}

/**
 * Obtiene el protocolo (http o https)
 * - En desarrollo: http
 * - En producción: https
 */
export function getProtocol(): string {
  if (typeof window !== 'undefined') {
    return window.location.protocol.replace(':', '')
  }

  // En desarrollo, usar http
  const baseDomain = getBaseDomain()
  return baseDomain.includes('localhost') ? 'http' : 'https'
}

/**
 * Genera una URL de subdominio tenant
 *
 * @param tenantDomain - El dominio del tenant (ej: "lokeyokiera")
 * @param path - El path opcional (ej: "/admin/dashboard")
 * @param queryParams - Parámetros de query opcionales
 *
 * @example
 * ```ts
 * // En desarrollo:
 * getTenantUrl('lokeyokiera', '/admin/dashboard')
 * // => "http://lokeyokiera.localhost:3000/admin/dashboard"
 *
 * // En producción:
 * getTenantUrl('lokeyokiera', '/admin/dashboard', { token: 'abc123' })
 * // => "https://lokeyokiera.qronnect.es/admin/dashboard?token=abc123"
 * ```
 */
export function getTenantUrl(
  tenantDomain: string,
  path: string = '',
  queryParams?: Record<string, string>
): string {
  const protocol = getProtocol()
  const baseDomain = getBaseDomain()

  // Construir la URL base
  let url = `${protocol}://${tenantDomain}.${baseDomain}${path}`

  // Añadir query params si existen
  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams(queryParams)
    url += `?${params.toString()}`
  }

  return url
}

/**
 * Genera una URL de registro para una tienda
 *
 * @param tenantDomain - El dominio del tenant
 *
 * @example
 * ```ts
 * // En desarrollo:
 * getRegistroUrl('lokeyokiera')
 * // => "http://localhost:3000/registro?tienda=lokeyokiera"
 *
 * // En producción:
 * getRegistroUrl('lokeyokiera')
 * // => "https://qronnect.es/registro?tienda=lokeyokiera"
 * ```
 */
export function getRegistroUrl(tenantDomain: string): string {
  const protocol = getProtocol()
  const baseDomain = getBaseDomain()

  // En desarrollo, usar la URL sin subdominio
  if (baseDomain.includes('localhost')) {
    return `${protocol}://${baseDomain}/registro?tienda=${tenantDomain}`
  }

  // En producción, también usar la URL base sin subdominio
  return `${protocol}://${baseDomain}/registro?tienda=${tenantDomain}`
}

/**
 * Genera una URL de obtención de QR para clientes
 *
 * @param tenantDomain - El dominio del tenant
 *
 * @example
 * ```ts
 * // En desarrollo:
 * getQrUrl('lokeyokiera')
 * // => "http://lokeyokiera.localhost:3000/get-qr"
 *
 * // En producción:
 * getQrUrl('lokeyokiera')
 * // => "https://lokeyokiera.qronnect.es/get-qr"
 * ```
 */
export function getQrUrl(tenantDomain: string): string {
  return getTenantUrl(tenantDomain, '/get-qr')
}

/**
 * Genera una URL del dashboard de admin para un tenant
 *
 * @param tenantDomain - El dominio del tenant
 * @param token - Token de acceso opcional (para superadmin)
 */
export function getAdminDashboardUrl(
  tenantDomain: string,
  token?: string
): string {
  const queryParams = token ? { superadmin_token: token } : undefined
  return getTenantUrl(tenantDomain, '/admin/dashboard', queryParams)
}
