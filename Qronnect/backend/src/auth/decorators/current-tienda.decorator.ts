import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador para inyectar el ID de la tienda actual (determinada por el dominio)
 *
 * NOTA: Este decorador es un atajo para @Tenant('id')
 * Es útil cuando solo necesitas el UUID de la tienda
 *
 * Uso:
 * @UseGuards(SupabaseAuthGuard, AdminGuard)
 * @Get('admin/clientes')
 * async getClientes(@CurrentTienda() tiendaId: string) {
 *   // tiendaId contiene el UUID de la tienda actual
 * }
 *
 * Equivalente a:
 * async getClientes(@Tenant('id') tiendaId: string) { }
 */
export const CurrentTienda = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const tenant = request.tenant;

  if (!tenant) {
    throw new Error('Tenant no encontrado. ¿Está configurado TenantResolverMiddleware?');
  }

  return tenant.id;
});
