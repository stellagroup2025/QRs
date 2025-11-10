/**
 * Contexto de tenant (tienda)
 * Contiene toda la información necesaria para operar con un tenant específico
 */
export interface TenantContext {
  id: string; // UUID de la tienda
  nombre: string;
  dominio: string; // Subdominio en qronnect.com (ej: "cafeteria-aroma")
  dominioPersonalizado?: string; // Dominio propio del cliente (ej: "www.micafeteria.com")
  plan: string; // 'basico', 'profesional', 'enterprise'
  configuracion: TenantConfig;
  metadata: Record<string, any>;
  databaseName?: string; // Nombre de BD dedicada (NULL = BD compartida)
}

/**
 * Configuración específica del tenant
 */
export interface TenantConfig {
  puntos_por_euro?: number; // Factor de conversión euros -> puntos
  factor_descuento?: number; // Descuento por defecto para clientes
  bonificacion_mensual?: number; // Puntos de bonificación mensual
  [key: string]: any; // Configuraciones adicionales
}
