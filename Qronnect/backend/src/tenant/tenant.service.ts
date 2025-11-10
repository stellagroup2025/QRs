import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { TenantContext } from './entities/tenant-context.entity';

/**
 * Servicio de gestión de multitenancy
 * Responsable de:
 * - Resolver el tenant (tienda) a partir del dominio del request
 * - Obtener configuración específica del tenant
 * - Preparar para migración a BD dedicadas (Fase 2)
 */
@Injectable()
export class TenantService {
  // Cache en memoria para evitar queries repetitivos
  // En producción, considera usar Redis
  private tenantCache: Map<string, TenantContext> = new Map();
  private cacheTTL = 5 * 60 * 1000; // 5 minutos

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Resuelve el tenant a partir del dominio
   * Soporta:
   * - Subdominios de qronnect: cafeteria-aroma.qronnect.com
   * - Dominios personalizados: www.cafeteriaaroma.com
   *
   * @param host - Header 'host' del request (ej: "cafeteria-aroma.qronnect.com")
   * @returns Contexto del tenant
   */
  async resolveTenantByHost(host: string): Promise<TenantContext> {
    if (!host) {
      throw new NotFoundException('No se pudo determinar el dominio del tenant');
    }

    // Limpiar puerto si existe (localhost:3000 -> localhost)
    const cleanHost = host.split(':')[0];

    // Verificar cache
    const cached = this.getCachedTenant(cleanHost);
    if (cached) {
      return cached;
    }

    // Extraer el dominio base para búsqueda
    const { subdomain, fullDomain } = this.extractDomainParts(cleanHost);

    // Buscar tienda por dominio
    const tenant = await this.findTenantByDomain(subdomain, fullDomain);

    if (!tenant) {
      throw new NotFoundException(
        `No se encontró ninguna tienda para el dominio: ${host}. ` +
          `Verifica que la tienda esté activa y el dominio configurado correctamente.`,
      );
    }

    // Cachear resultado
    this.cacheTenant(cleanHost, tenant);

    return tenant;
  }

  /**
   * Obtiene un tenant por ID directamente
   * Útil para operaciones de admin que ya conocen el tenant_id
   */
  async getTenantById(tenantId: string): Promise<TenantContext> {
    const supabase = this.supabaseService.getAdminClient();

    const { data: tienda, error } = await supabase
      .from('tiendas')
      .select('*')
      .eq('id', tenantId)
      .eq('activo', true)
      .single();

    if (error || !tienda) {
      throw new NotFoundException(`Tienda no encontrada con ID: ${tenantId}`);
    }

    return this.mapToTenantContext(tienda);
  }

  /**
   * Extrae las partes del dominio para facilitar la búsqueda
   */
  private extractDomainParts(host: string): { subdomain: string; fullDomain: string } {
    // Casos a manejar:
    // 1. localhost (desarrollo) -> usar tienda por defecto
    // 2. cafeteria-aroma.qronnect.com -> subdomain = "cafeteria-aroma"
    // 3. www.cafeteriaaroma.com -> fullDomain = "www.cafeteriaaroma.com"
    // 4. lokeyokiera (nombre simple sin puntos) -> subdomain = "lokeyokiera"

    if (host === 'localhost' || host === '127.0.0.1') {
      // En desarrollo, usar el primer tenant disponible o tienda por defecto
      return { subdomain: 'localhost', fullDomain: 'localhost' };
    }

    const parts = host.split('.');

    // Si tiene 3+ partes, probablemente es un subdominio (ej: cafeteria.qronnect.com)
    if (parts.length >= 3 && parts[parts.length - 2] === 'qronnect') {
      const subdomain = parts.slice(0, -2).join('.'); // Todo antes de ".qronnect.com"
      return { subdomain, fullDomain: host };
    }

    // Si es una sola palabra sin puntos, tratarlo como subdomain
    // Esto permite buscar por el campo 'dominio' en la BD
    if (parts.length === 1) {
      return { subdomain: host, fullDomain: host };
    }

    // Si no, es un dominio personalizado completo
    return { subdomain: '', fullDomain: host };
  }

  /**
   * Busca la tienda en la base de datos por dominio
   */
  private async findTenantByDomain(
    subdomain: string,
    fullDomain: string,
  ): Promise<TenantContext | null> {
    const supabase = this.supabaseService.getAdminClient();

    console.log('🔍 [FIND TENANT BY DOMAIN]');
    console.log('  - Subdomain:', subdomain);
    console.log('  - Full domain:', fullDomain);

    // Intentar buscar por subdominio primero (más común)
    if (subdomain) {
      console.log('  - Buscando por campo "dominio" =', subdomain);
      const { data: tienda, error } = await supabase
        .from('tiendas')
        .select('*')
        .eq('dominio', subdomain)
        .eq('activo', true)
        .single();

      console.log('  - Resultado búsqueda por dominio:', tienda ? 'ENCONTRADO' : 'NO ENCONTRADO');
      if (error) console.log('  - Error:', error);

      if (tienda) {
        return this.mapToTenantContext(tienda);
      }
    }

    // Si no se encuentra, buscar por dominio personalizado
    console.log('  - Buscando por campo "dominio_personalizado" =', fullDomain);
    const { data: tienda, error: error2 } = await supabase
      .from('tiendas')
      .select('*')
      .eq('dominio_personalizado', fullDomain)
      .eq('activo', true)
      .single();

    console.log('  - Resultado búsqueda por dominio_personalizado:', tienda ? 'ENCONTRADO' : 'NO ENCONTRADO');
    if (error2) console.log('  - Error:', error2);

    if (tienda) {
      return this.mapToTenantContext(tienda);
    }

    // Si es localhost y no hay tienda específica, usar la primera disponible
    if (fullDomain === 'localhost') {
      console.log('  - Es localhost, buscando primera tienda disponible');
      const { data: defaultTienda } = await supabase
        .from('tiendas')
        .select('*')
        .eq('activo', true)
        .limit(1)
        .single();

      if (defaultTienda) {
        return this.mapToTenantContext(defaultTienda);
      }
    }

    console.log('  - ❌ No se encontró ninguna tienda');
    return null;
  }

  /**
   * Mapea la entidad de BD al contexto de tenant
   */
  private mapToTenantContext(tienda: any): TenantContext {
    return {
      id: tienda.id,
      nombre: tienda.nombre,
      dominio: tienda.dominio,
      dominioPersonalizado: tienda.dominio_personalizado,
      plan: tienda.plan,
      configuracion: tienda.configuracion || {},
      metadata: tienda.metadata || {},
      databaseName: tienda.database_name, // NULL = BD compartida, valor = BD dedicada
    };
  }

  /**
   * Cache helpers
   */
  private getCachedTenant(host: string): TenantContext | null {
    const entry = this.tenantCache.get(host);
    if (!entry) return null;

    // Verificar si el cache ha expirado
    const cachedAt = (entry as any)._cachedAt || 0;
    if (Date.now() - cachedAt > this.cacheTTL) {
      this.tenantCache.delete(host);
      return null;
    }

    return entry;
  }

  private cacheTenant(host: string, tenant: TenantContext): void {
    // Añadir timestamp para TTL
    (tenant as any)._cachedAt = Date.now();
    this.tenantCache.set(host, tenant);
  }

  /**
   * Limpia todo el cache (útil para testing o cuando se actualiza una tienda)
   */
  clearCache(): void {
    this.tenantCache.clear();
  }

  /**
   * Obtiene el cliente de Supabase correcto para el tenant
   * En Fase 2 (BD dedicadas), este método devolverá un cliente
   * conectado a la BD específica del tenant
   */
  getSupabaseClientForTenant(tenant: TenantContext) {
    // Fase 1: Todos usan la misma BD
    if (!tenant.databaseName) {
      return this.supabaseService.getAdminClient();
    }

    // Fase 2: BD dedicada (implementación futura)
    // TODO: Crear conexión a BD dedicada usando tenant.databaseName
    // return createDedicatedSupabaseClient(tenant.databaseName);

    throw new Error('BD dedicadas no implementadas aún. Usa BD compartida.');
  }
}
