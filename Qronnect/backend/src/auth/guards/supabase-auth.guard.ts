import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

/**
 * Guard para proteger rutas que requieren autenticación
 * Verifica el JWT token de Supabase en el header Authorization
 * y añade los datos del usuario a request.user
 *
 * Uso:
 * @UseGuards(SupabaseAuthGuard)
 * @Get('protected')
 * async protectedRoute(@CurrentUser() user: AuthUser) { ... }
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extraer el token del header Authorization
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No se proporcionó token de autenticación');
    }

    // El formato esperado es: "Bearer <token>"
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido. Use: Bearer <token>');
    }

    // Verificar el token con Supabase
    const user = await this.supabaseService.verifyToken(token);
    if (!user) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Añadir los datos del usuario a la request para que estén disponibles
    // en los controladores mediante el decorador @CurrentUser()
    request.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      metadata: user.user_metadata,
    };

    // Guardar también el token para poder crear un cliente autenticado si es necesario
    request.accessToken = token;

    return true;
  }
}
