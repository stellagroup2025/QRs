/**
 * Verifica si estamos en el dominio raíz de Qronnect (landing de producto)
 *
 * @returns true si es qronnect.es/com (sin subdominio)
 */
export function isRootDomain(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const host = window.location.host.toLowerCase()

  // Dominios raíz de Qronnect (landing de producto)
  const rootDomains = [
    'qronnect.es',
    'www.qronnect.es',
    'qronnect.com',
    'www.qronnect.com',
  ]

  return rootDomains.includes(host)
}

/**
 * Obtiene el dominio del tenant actual desde la URL
 *
 * Ejemplos:
 * - lokeyokiera.qronnect.com → "lokeyokiera"
 * - qronnect.es → null (dominio raíz, no es tenant)
 * - localhost:3000 → "lokeyokiera" (fallback para desarrollo)
 * - localhost → "lokeyokiera" (fallback para desarrollo)
 *
 * @returns Dominio del tenant o null si es dominio raíz
 */
export function getTenantDomain(): string | null {
  if (typeof window === 'undefined') {
    // Server-side rendering: retornar valor por defecto
    return 'lokeyokiera'
  }

  // Si es dominio raíz, no hay tenant
  if (isRootDomain()) {
    return null
  }

  const host = window.location.host
  const domain = host.split(':')[0].split('.')[0]

  // Fallback para desarrollo local
  if (domain === 'localhost') {
    return 'lokeyokiera'
  }

  return domain
}
