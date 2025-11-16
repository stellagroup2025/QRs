/**
 * Obtiene el dominio del tenant actual desde la URL
 *
 * Ejemplos:
 * - lokeyokiera.qronnect.com → "lokeyokiera"
 * - localhost:3000 → "lokeyokiera" (fallback para desarrollo)
 * - localhost → "lokeyokiera" (fallback para desarrollo)
 *
 * @returns Dominio del tenant
 */
export function getTenantDomain(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering: retornar valor por defecto
    return 'lokeyokiera'
  }

  const host = window.location.host
  const domain = host.split(':')[0].split('.')[0]

  // Fallback para desarrollo local
  if (domain === 'localhost') {
    return 'lokeyokiera'
  }

  return domain
}
