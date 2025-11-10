import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext } from '../entities/tenant-context.entity';

/**
 * Decorador para inyectar el contexto del tenant en los controladores
 *
 * Uso:
 * @Get('products')
 * async getProducts(@Tenant() tenant: TenantContext) {
 *   // tenant contiene toda la info de la tienda (id, nombre, config, etc.)
 * }
 *
 * También puedes extraer una propiedad específica:
 * @Get('products')
 * async getProducts(@Tenant('id') tenantId: string) {
 *   // tenantId contiene solo el UUID de la tienda
 * }
 */
export const Tenant = createParamDecorator(
  (data: keyof TenantContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenant: TenantContext = request.tenant;

    if (!tenant) {
      throw new Error(
        'Tenant no encontrado en request. ¿Olvidaste configurar TenantResolverMiddleware?',
      );
    }

    // Si se especifica una propiedad, devolver solo esa
    if (data) {
      return tenant[data];
    }

    // Si no, devolver el tenant completo
    return tenant;
  },
);
