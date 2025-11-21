/**
 * Hook para obtener el tenant domain actual
 *
 * Prioridad:
 * 1. localStorage.tenant_domain (si existe)
 * 2. Extraer del window.location.host (subdominio)
 * 3. Fallback a 'lokeyokiera' en desarrollo
 *
 * Automáticamente guarda el valor en localStorage para futuras peticiones.
 */
export function useTenant() {
  const getTenantDomain = (): string => {
    // Intentar obtener del localStorage
    let tenant = localStorage.getItem('tenant_domain');

    // Si no existe, extraerlo del dominio actual
    if (!tenant) {
      const host = window.location.host;
      const parts = host.split('.');

      // Si es subdominio.qronnect.es -> usar subdominio
      if (parts.length >= 2 && !host.startsWith('localhost')) {
        tenant = parts[0];
      }
      // Si es localhost -> usar default para desarrollo
      else {
        tenant = 'lokeyokiera';
      }

      console.log('⚠️ tenant_domain no encontrado en localStorage, usando:', tenant);
      // Guardar para futuras peticiones
      localStorage.setItem('tenant_domain', tenant);
    }

    return tenant;
  };

  return {
    tenantDomain: getTenantDomain(),
    getTenantDomain,
  };
}
