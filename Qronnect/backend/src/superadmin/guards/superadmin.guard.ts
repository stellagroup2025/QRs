import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { JwtTokenService } from '../../auth/jwt-token.service';

/**
 * Guard para proteger rutas de superadmin
 *
 * Verifica que:
 * 1. El usuario esté autenticado (JWT válido firmado)
 * 2. El usuario esté en la tabla superadmin_users
 * 3. El usuario esté activo
 *
 * IMPORTANTE: Este guard NO depende del tenant middleware
 * Los superadmins tienen acceso global a todas las tiendas
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtTokenService: JwtTokenService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Verificar que hay un token de autenticación
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No se proporcionó token de autenticación');
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    const supabase = this.supabaseService.getAdminClient();

    // 2. Verificar y decodificar el token JWT firmado
    let userId: string;
    let email: string;

    try {
      const decoded = this.jwtTokenService.verifyToken(token);

      if (decoded.role === 'superadmin' && decoded.sub && decoded.email) {
        userId = decoded.sub;
        email = decoded.email;
      } else {
        throw new Error('No es un token de superadmin');
      }
    } catch (jwtError) {
      // Fallback: intentar con Supabase Auth (para compatibilidad)
      try {
        const {
          data: { user },
          error: authError,
        } = await this.supabaseService.getClient().auth.getUser(token);

        if (authError || !user) {
          throw new UnauthorizedException('Token inválido o expirado');
        }

        userId = user.id;
        email = user.email;
      } catch {
        throw new UnauthorizedException('Token inválido o expirado');
      }
    }

    // 3. Verificar que el usuario es un superadmin activo
    const { data: superadmin, error: superadminError } = await supabase
      .from('superadmin_users')
      .select('*')
      .eq('supabase_user_id', userId)
      .eq('activo', true)
      .single();

    if (superadminError || !superadmin) {
      throw new ForbiddenException('Acceso denegado: No eres un superadministrador');
    }

    // 4. Actualizar último acceso
    await supabase
      .from('superadmin_users')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('id', superadmin.id);

    // 5. Adjuntar superadmin y usuario al request
    request.superadmin = superadmin;
    request.user = { id: userId, email };

    return true;
  }
}
