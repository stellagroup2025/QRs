import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../entities/auth-user.entity';

/**
 * Decorador para inyectar el usuario autenticado en los controladores
 *
 * Uso:
 * @Get('me')
 * async getMe(@CurrentUser() user: AuthUser) {
 *   return { userId: user.id, email: user.email };
 * }
 *
 * El usuario se extrae de request.user, que es añadido por SupabaseAuthGuard
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si se especifica una propiedad específica, devolver solo esa propiedad
    // Ejemplo: @CurrentUser('id') userId: string
    if (data) {
      return user?.[data];
    }

    // Si no se especifica propiedad, devolver el usuario completo
    return user;
  },
);
