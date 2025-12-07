import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../tenant.service';
import { TenantContext } from '../entities/tenant-context.entity';

/**
 * Middleware que resuelve el tenant a partir del dominio del request
 * y lo inyecta en request.tenant para que esté disponible en toda la cadena
 */
@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  constructor(private tenantService: TenantService) { }

  async use(req: Request & { tenant?: TenantContext }, res: Response, next: NextFunction) {
    // Rutas que no requieren resolución de tenant
    const excludedPaths = [
      /^\/api\/superadmin/,
      /^\/api\/qr-codes/,
      /^\/api\/health/,
      /^\/q\//,
      /^\/api\/comerciales/,
      /^\/comerciales/,
      /^\/api\/planes/,
    ];

    // Si la ruta está excluida, continuar sin resolver tenant
    // IMPORTANTE: Usar originalUrl porque path puede ser solo "/" en algunos casos
    const path = req.originalUrl || req.path;

    // Debug: Ver qué path estamos evaluando
    console.log('🏪 [TENANT RESOLVER] Evaluando ruta:', path);

    const isExcluded = excludedPaths.some(pattern => pattern.test(path));

    if (isExcluded) {
      console.log('🏪 [TENANT RESOLVER] Ruta excluida:', path);
      return next();
    }

    console.log('🏪 [TENANT RESOLVER] Ruta NO excluida, resolviendo tenant para:', path);

    try {
      // Priorizar el header X-Tenant-Domain (para desarrollo y APIs)
      // Si no existe, usar el host del request
      const tenantDomain = req.get('x-tenant-domain');
      const host = tenantDomain || req.get('host') || req.hostname;

      console.log('🏪 [TENANT RESOLVER]');
      console.log('  - X-Tenant-Domain header:', tenantDomain);
      console.log('  - Host header:', req.get('host'));
      console.log('  - Resolviendo con:', host);

      // Resolver el tenant
      const tenant = await this.tenantService.resolveTenantByHost(host);

      console.log('  - Tenant resuelto:', tenant.nombre, `(ID: ${tenant.id})`);

      // Inyectar en el request para que esté disponible en guards y controllers
      req.tenant = tenant;

      next();
    } catch (error) {
      console.log('  - ❌ Error resolviendo tenant:', error.message);
      // Si no se puede resolver el tenant, devolver 404
      res.status(404).json({
        statusCode: 404,
        message: error.message || 'Tienda no encontrada para este dominio',
        error: 'Not Found',
      });
    }
  }
}
